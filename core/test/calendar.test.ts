import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easterSunday, finnishHolidays } from '../src/calc/holidays.ts';
import { WorkTimeline, simpleRules, resolveCalendar } from '../src/calc/calendar.ts';
import { MON_FRI, type Calendar } from '../src/model/calendar.ts';
import { addDays, weekdayMon0, dayNumber, isoOfDayNumber, isIsoDate } from '../src/calc/dates.ts';

test('pääsiäinen tunnetuille vuosille', () => {
  assert.equal(easterSunday(2024), '2024-03-31');
  assert.equal(easterSunday(2025), '2025-04-20');
  assert.equal(easterSunday(2026), '2026-04-05');
  assert.equal(easterSunday(2027), '2027-03-28');
  assert.equal(easterSunday(2030), '2030-04-21');
});

test('Suomen pyhät 2027', () => {
  const h = new Map(finnishHolidays(2027).map(x => [x.name, x.date]));
  assert.equal(h.get('Pitkäperjantai'), '2027-03-26');
  assert.equal(h.get('2. pääsiäispäivä'), '2027-03-29');
  assert.equal(h.get('Helatorstai'), '2027-05-06');
  assert.equal(h.get('Juhannusaatto'), '2027-06-25');
  assert.equal(h.get('Juhannuspäivä'), '2027-06-26');
  assert.equal(h.get('Pyhäinpäivä'), '2027-11-06');
  assert.equal(weekdayMon0(h.get('Juhannusaatto')!), 4);
  assert.equal(finnishHolidays(2026).find(x => x.name === 'Juhannusaatto')!.date, '2026-06-19');
});

test('päivämääräapurit', () => {
  assert.equal(addDays('2027-02-27', 2), '2027-03-01');
  assert.equal(isoOfDayNumber(dayNumber('2028-02-29')), '2028-02-29');
  assert.ok(!isIsoDate('2027-02-30'));
  assert.equal(weekdayMon0('2027-01-04'), 0);
});

test('ma–pe ilman pyhiä vastaa prototyypin päiväindeksejä', () => {
  // prototyyppi: isoOfDay(d) = START + (floor(d/5)*7 + d%5) päivää, START = 2027-01-04
  const tl = new WorkTimeline(simpleRules(MON_FRI), '2027-01-04');
  for (let d = 0; d < 400; d++) {
    const proto = isoOfDayNumber(dayNumber('2027-01-04') + Math.floor(d / 5) * 7 + (d % 5));
    assert.equal(tl.startDateOf(d), proto);
    assert.equal(tl.startIndex(proto), d);
  }
});

test('pyhät ja viikonloput: alku siirtyy eteenpäin, loppu taaksepäin', () => {
  const tl = new WorkTimeline(simpleRules(MON_FRI, 'FI'), '2026-12-21');
  // 21.–23.12. työpäiviä, 24.–27.12. vapaata, 28.12. työpäivä
  assert.equal(tl.startDateOf(3), '2026-12-28');
  assert.equal(tl.startIndex('2026-12-24'), 3);
  assert.equal(tl.finishIndex('2026-12-26'), 3);
  assert.equal(tl.finishDateOf(3), '2026-12-23');
  assert.equal(tl.addWorkdays('2026-12-23', 1), '2026-12-28');
  assert.equal(tl.workdaysBetween('2026-12-21', '2027-01-08'), 3 + 4 + 4); // 21.–23.12., 28.–31.12., 4.–8.1. (1.1. ja 6.1. pyhiä)
});

test('poikkeukset: lauantaityö ja ylimääräinen vapaapäivä', () => {
  const tl = new WorkTimeline(simpleRules(MON_FRI, null, [{ date: '2027-01-09', working: true }, { date: '2027-01-05', working: false }]), '2027-01-04');
  assert.ok(tl.isWorkday('2027-01-09'));
  assert.ok(!tl.isWorkday('2027-01-05'));
  assert.equal(tl.startDateOf(1), '2027-01-06');
  assert.equal(tl.startDateOf(4), '2027-01-09');
});

test('osapäivät ja nollakohtaa edeltävät päivät', () => {
  const tl = new WorkTimeline(simpleRules(MON_FRI), '2027-01-04');
  assert.deepEqual(tl.instantOf(2.5), { date: '2027-01-06', frac: 0.5 });
  assert.equal(tl.indexOfInstant({ date: '2027-01-06', frac: 0.5 }), 2.5);
  assert.equal(tl.startDateOf(-1), '2027-01-01');
  assert.equal(tl.startIndex('2026-12-28'), -5);
  assert.deepEqual(tl.spanOf(0, 5), { start: '2027-01-04', finish: '2027-01-08' });
  assert.deepEqual(tl.spanOf(0, 0.5), { start: '2027-01-04', finish: '2027-01-04' });
});

test('kalenterin perintä: lapsen poikkeus voittaa', () => {
  const base = { holidayRegion: 'FI', exceptions: [{ date: '2027-01-11', working: false }], hoursPerDay: 8, parentId: null, workWeek: MON_FRI } as unknown as Calendar;
  const child = { holidayRegion: null, exceptions: [{ date: '2027-01-11', working: true }, { date: '2027-01-12', working: false }], hoursPerDay: 10, parentId: 'base', workWeek: MON_FRI } as unknown as Calendar;
  const r = resolveCalendar(child, id => (id === 'base' ? base : undefined));
  assert.equal(r.holidayRegion, 'FI');
  assert.equal(r.exceptions.get('2027-01-11'), true);
  assert.equal(r.exceptions.get('2027-01-12'), false);
  assert.equal(r.hoursPerDay, 10);
});

test('kalenteri ilman työpäiviä hylätään', () => {
  assert.throws(() => new WorkTimeline(simpleRules([false, false, false, false, false, false, false]), '2027-01-04'));
});
