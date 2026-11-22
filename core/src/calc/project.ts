// Tallennetun tietomallin ja laskennan välinen sovitus: entiteetit -> laskenta -> päivämäärät.
import type { Id } from '../model/common.ts';
import type { Location } from '../model/project.ts';
import type { Dependency, ScheduleLine, Task, TaskComputed, TaskRef } from '../model/schedule.ts';
import { WorkTimeline, type CalendarRules } from './calendar.ts';
import { FLAT_KEY, lineRange, type LeafLocation, type TaskOverride } from './line.ts';
import { leafLocations } from './locations.ts';
import { computeSchedule, type EngineDependency, type EngineLine, type EngineRef, type ScheduleResult } from './schedule.ts';

export interface ProjectScheduleInput {
  startDate: string;
  calendar: CalendarRules;
  locations: Location[];
  lines: ScheduleLine[];
  tasks: Task[];
  dependencies: Dependency[];
  deadline?: string | null;
}

export interface ProjectScheduleOutput {
  timeline: WorkTimeline;
  result: ScheduleResult;
  /** taskId -> laskettu tulos päivämäärinä. */
  computed: Map<Id, TaskComputed>;
  /** Tehtävät, joita laskenta tarvitsee mutta joita ei ole tallennettu (ks. reconcileTasks). */
  missingTasks: { lineId: Id; locationId: Id | null }[];
}

const alive = <T extends { deletedAt: string | null }>(xs: T[]) => xs.filter(x => !x.deletedAt);

function overridesOf(tasks: Task[]): Record<string, TaskOverride> {
  const o: Record<string, TaskOverride> = {};
  for (const t of tasks) o[t.locationId ?? FLAT_KEY] = { duration: t.durationOverride, quantity: t.quantityOverride, shift: t.shiftDays || null, name: t.name };
  return o;
}

export function toEngineLine(line: ScheduleLine, tasks: Task[], timeline: WorkTimeline): EngineLine {
  return {
    id: line.id, groupId: line.groupId, flat: line.flat,
    fromLocationId: line.fromLocationId, toLocationId: line.toLocationId, skipLocationIds: line.skipLocationIds,
    start: timeline.indexOfInstant(line.plannedStart), gapDays: line.gapDays,
    durationMode: line.durationMode, durationPerShare: line.durationPerShare, totalDuration: line.totalDuration, lockedCrew: line.lockedCrew,
    quantityPerShare: line.quantityPerShare, lockedTotalQuantity: line.lockedTotalQuantity, productionRate: line.productionRate,
    overrides: overridesOf(tasks),
  };
}

function toEngineRef(ref: TaskRef, taskById: Map<Id, Task>): EngineRef | null {
  if (ref.kind === 'line') return { kind: 'line', lineId: ref.lineId };
  if (ref.kind === 'group') return { kind: 'group', groupId: ref.groupId };
  const t = taskById.get(ref.taskId);
  return t && !t.deletedAt ? { kind: 'task', lineId: t.lineId, locationId: t.locationId } : null;
}

/** Laskee projektin aikataulun tallennetuista tiedoista. */
export function scheduleProject(input: ProjectScheduleInput, now: string = new Date().toISOString()): ProjectScheduleOutput {
  const timeline = new WorkTimeline(input.calendar, input.startDate);
  const leaves = leafLocations(alive(input.locations));
  const tasks = alive(input.tasks);
  const tasksByLine = new Map<Id, Task[]>();
  for (const t of tasks) { if (!tasksByLine.has(t.lineId)) tasksByLine.set(t.lineId, []); tasksByLine.get(t.lineId)!.push(t); }
  const lines = alive(input.lines);
  const engineLines = lines.map(l => toEngineLine(l, tasksByLine.get(l.id) || [], timeline));
  const taskById = new Map(input.tasks.map(t => [t.id, t]));
  const deps: EngineDependency[] = [];
  for (const d of alive(input.dependencies)) {
    const from = toEngineRef(d.from, taskById), to = toEngineRef(d.to, taskById);
    if (from && to) deps.push({ id: d.id, from, to, type: d.type, lag: d.lagDays, rigid: d.rigid });
  }
  const result = computeSchedule({
    locations: leaves, lines: engineLines, dependencies: deps,
    deadline: input.deadline ? timeline.finishIndex(input.deadline) : undefined,
  });

  const computed = new Map<Id, TaskComputed>();
  const missingTasks: { lineId: Id; locationId: Id | null }[] = [];
  for (const l of lines) {
    const own = tasksByLine.get(l.id) || [];
    for (const st of result.byLine.get(l.id) || []) {
      const t = own.find(x => x.locationId === st.locationId);
      if (!t) { missingTasks.push({ lineId: l.id, locationId: st.locationId }); continue; }
      computed.set(t.id, {
        planned: timeline.spanOf(st.start, st.end), forecast: null, crew: st.crew, quantity: st.quantity,
        totalFloatDays: st.totalFloat, critical: st.critical, computedAt: now,
      });
    }
  }
  return { timeline, result, computed, missingTasks };
}

/**
 * Viivan tehtävärivit vastaamaan sen sijainteja: puuttuvat luodaan, alueelta pois jääneet merkitään poistetuiksi.
 * Poistettu tehtävä palautetaan (deletedAt = null), jos sijainti palaa alueelle: toteumat ja linkit säilyvät.
 */
export function reconcileTasks(line: ScheduleLine, tasks: Task[], leaves: LeafLocation[]): { create: (Id | null)[]; remove: Task[]; restore: Task[] } {
  const want = lineRange(line, leaves).indexes.map(i => (line.flat || i < 0 ? null : leaves[i].id));
  const wantSet = new Set(want);
  const own = tasks.filter(t => t.lineId === line.id);
  const create = want.filter(loc => !own.some(t => t.locationId === loc));
  const remove = own.filter(t => !t.deletedAt && !wantSet.has(t.locationId));
  const restore = own.filter(t => t.deletedAt && wantSet.has(t.locationId));
  return { create, remove, restore };
}
