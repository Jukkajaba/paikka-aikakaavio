-- 0001_perusta: tietomallin perusta (vastaa core/src/model).
--
-- Periaatteet (ks. projektin suunnitelma "Tietomalli ja tekninen perusta"):
-- * Jokaisella rivillä on organization_id. Organisaatioiden välinen eristys tehdään rivitason
--   suojauksella (RLS): sovellus asettaa jokaisessa transaktiossa app.organization_id.
-- * version kasvaa jokaisessa muutoksessa (ristiriitojen tunnistus, offline-synkronointi).
-- * deleted_at: poisto on merkintä. Offline-laitteet saavat tiedon poistosta, ja historia säilyy.
-- * source_*: tuodun tiedon alkuperä. Sama ulkoinen tunniste päivittää rivin eikä luo kaksoiskappaletta.
-- * custom: asiakaskohtaiset lisäkentät (custom_field_def).
-- * change_event: kaikki muutokset tapahtumina. server_seq antaa synkronoinnin järjestyksen.
--
-- Muutossääntö: tähän tiedostoon ei tehdä muutoksia sen jälkeen, kun se on ajettu tuotantoon.
-- Muutokset tehdään uusina numeroituina tiedostoina. Käytössä olevia sarakkeita ei poisteta eikä
-- nimetä uudelleen; uusi sarake lisätään ja vanha poistetaan hallitusti myöhemmin.

BEGIN;

CREATE TABLE schema_migration (
  version     text PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Organisaatiot ja käyttäjät
-- ---------------------------------------------------------------------------

CREATE TABLE organization (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL,
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                 text NOT NULL,
  business_id          text,
  default_locale       text NOT NULL DEFAULT 'fi',
  default_calendar_id  uuid,
  CHECK (organization_id = id)
);

CREATE TABLE app_user (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  email                text NOT NULL,
  name                 text NOT NULL,
  locale               text
);
-- Sama sähköposti vain kerran (kirjainkoosta riippumatta). Käyttäjä voi silti kuulua useaan organisaatioon.
CREATE UNIQUE INDEX app_user_email_uq ON app_user (lower(email)) WHERE deleted_at IS NULL;

CREATE TABLE membership (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id              uuid NOT NULL REFERENCES app_user(id),
  role                 text NOT NULL CHECK (role IN ('admin', 'member')),
  starts_at            timestamptz NOT NULL DEFAULT now(),
  ends_at              timestamptz,
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);
CREATE INDEX membership_user_idx ON membership (user_id);
CREATE INDEX membership_org_idx ON membership (organization_id);

-- ---------------------------------------------------------------------------
-- Kalenterit ja projektit
-- ---------------------------------------------------------------------------

CREATE TABLE calendar (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                 text NOT NULL,
  parent_id            uuid REFERENCES calendar(id),
  -- maanantaista sunnuntaihin
  work_week            boolean[] NOT NULL DEFAULT ARRAY[true, true, true, true, true, false, false],
  hours_per_day        numeric(4,2) NOT NULL DEFAULT 8 CHECK (hours_per_day > 0 AND hours_per_day <= 24),
  holiday_region       text,
  -- [{ "date": "2027-01-09", "working": true, "name": "Lauantaityö" }]
  exceptions           jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(exceptions) = 'array'),
  CHECK (array_length(work_week, 1) = 7),
  CHECK (parent_id IS NULL OR parent_id <> id)
);
ALTER TABLE organization ADD CONSTRAINT organization_default_calendar_fk
  FOREIGN KEY (default_calendar_id) REFERENCES calendar(id) DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE project (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                 text NOT NULL,
  status               text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'archived')),
  calendar_id          uuid NOT NULL REFERENCES calendar(id),
  start_date           date NOT NULL,
  target_end_date      date,
  status_date          date,
  locale               text NOT NULL DEFAULT 'fi',
  model_link_template  text
);
CREATE INDEX project_org_idx ON project (organization_id) WHERE deleted_at IS NULL;

CREATE TABLE project_access (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  project_id           uuid NOT NULL REFERENCES project(id),
  user_id              uuid NOT NULL REFERENCES app_user(id),
  role                 text NOT NULL CHECK (role IN ('editor', 'viewer')),
  starts_at            timestamptz NOT NULL DEFAULT now(),
  ends_at              timestamptz,
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);
CREATE INDEX project_access_user_idx ON project_access (user_id);
CREATE INDEX project_access_project_idx ON project_access (project_id);

-- ---------------------------------------------------------------------------
-- Sijainnit, resurssit ja työlajit
-- ---------------------------------------------------------------------------

CREATE TABLE location (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  parent_id            uuid REFERENCES location(id),
  name                 text NOT NULL,
  sort_key             text NOT NULL COLLATE "C",
  share                numeric(8,3) NOT NULL DEFAULT 1 CHECK (share > 0),
  ifc_guid             text,
  CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE INDEX location_project_idx ON location (project_id, parent_id, sort_key);
CREATE INDEX location_ifc_idx ON location (project_id, ifc_guid) WHERE ifc_guid IS NOT NULL;

CREATE TABLE resource_type (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                 text NOT NULL,
  unit                 text NOT NULL,
  available            numeric(10,2) CHECK (available IS NULL OR available > 0)
);
CREATE INDEX resource_type_project_idx ON resource_type (project_id);

CREATE TABLE trade (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES organization(id),
  project_id            uuid NOT NULL REFERENCES project(id),
  version               integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  updated_by            uuid,
  deleted_at            timestamptz,
  source_system         text,
  source_external_id    text,
  source_imported_at    timestamptz,
  source_batch_id       uuid,
  custom                jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                  text NOT NULL,
  code                  text,
  unit                  text NOT NULL,
  -- yksikköä / pääresurssi / työpäivä
  production_rate       numeric(14,4) NOT NULL CHECK (production_rate > 0),
  rank                  integer NOT NULL DEFAULT 1,
  max_crew              numeric(10,2) CHECK (max_crew IS NULL OR max_crew > 0),
  color                 text NOT NULL,
  main_resource_type_id uuid REFERENCES resource_type(id),
  -- [{ "resourceTypeId": "...", "perMainUnit": 0.5 }]
  extra_resources       jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(extra_resources) = 'array'),
  calendar_id           uuid REFERENCES calendar(id)
);
CREATE INDEX trade_project_idx ON trade (project_id);

-- ---------------------------------------------------------------------------
-- Aikataulu
-- ---------------------------------------------------------------------------

CREATE TABLE schedule_group (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                 text NOT NULL,
  parent_id            uuid REFERENCES schedule_group(id),
  sort_key             text NOT NULL COLLATE "C",
  CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE INDEX schedule_group_project_idx ON schedule_group (project_id);

CREATE TABLE schedule_line (
  id                       uuid PRIMARY KEY,
  organization_id          uuid NOT NULL REFERENCES organization(id),
  project_id               uuid NOT NULL REFERENCES project(id),
  version                  integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at               timestamptz NOT NULL DEFAULT now(),
  created_by               uuid,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               uuid,
  deleted_at               timestamptz,
  source_system            text,
  source_external_id       text,
  source_imported_at       timestamptz,
  source_batch_id          uuid,
  custom                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  trade_id                 uuid NOT NULL REFERENCES trade(id),
  group_id                 uuid REFERENCES schedule_group(id),
  flat                     boolean NOT NULL DEFAULT false,
  from_location_id         uuid REFERENCES location(id),
  to_location_id           uuid REFERENCES location(id),
  skip_location_ids        uuid[] NOT NULL DEFAULT '{}',
  planned_start_date       date NOT NULL,
  planned_start_frac       numeric(4,3) NOT NULL DEFAULT 0 CHECK (planned_start_frac >= 0 AND planned_start_frac < 1),
  gap_days                 numeric(8,2) NOT NULL DEFAULT 0,
  duration_mode            text NOT NULL DEFAULT 'perLocation' CHECK (duration_mode IN ('perLocation', 'total', 'crew')),
  duration_per_share       numeric(10,2) NOT NULL CHECK (duration_per_share > 0),
  total_duration           numeric(10,2) CHECK (total_duration IS NULL OR total_duration > 0),
  locked_crew              numeric(10,2) CHECK (locked_crew IS NULL OR locked_crew > 0),
  quantity_per_share       numeric(16,4) NOT NULL DEFAULT 0 CHECK (quantity_per_share >= 0),
  locked_total_quantity    numeric(16,4) CHECK (locked_total_quantity IS NULL OR locked_total_quantity >= 0),
  production_rate          numeric(14,4) NOT NULL CHECK (production_rate > 0),
  sort_key                 text NOT NULL COLLATE "C",
  CHECK (flat OR (from_location_id IS NOT NULL AND to_location_id IS NOT NULL)),
  CHECK (duration_mode <> 'total' OR total_duration IS NOT NULL),
  CHECK (duration_mode <> 'crew' OR locked_crew IS NOT NULL)
);
CREATE INDEX schedule_line_project_idx ON schedule_line (project_id);
CREATE INDEX schedule_line_group_idx ON schedule_line (group_id) WHERE group_id IS NOT NULL;

CREATE TABLE task (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  line_id              uuid NOT NULL REFERENCES schedule_line(id),
  location_id          uuid REFERENCES location(id),
  name                 text,
  duration_override    numeric(10,2) CHECK (duration_override IS NULL OR duration_override > 0),
  quantity_override    numeric(16,4) CHECK (quantity_override IS NULL OR quantity_override >= 0),
  shift_days           numeric(8,2) NOT NULL DEFAULT 0,
  -- laskennan tulos (core/src/model/schedule.ts TaskComputed); lähde aina laskenta
  computed             jsonb
);
-- yksi tehtävä viivaa ja sijaintia kohden (sijainnittomalla viivalla yksi)
CREATE UNIQUE INDEX task_line_location_uq ON task (line_id, coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX task_project_idx ON task (project_id);
CREATE INDEX task_location_idx ON task (location_id) WHERE location_id IS NOT NULL;

CREATE TABLE dependency (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- edeltäjä: täsmälleen yksi näistä (TaskRef)
  from_task_id         uuid REFERENCES task(id),
  from_line_id         uuid REFERENCES schedule_line(id),
  from_group_id        uuid REFERENCES schedule_group(id),
  -- seuraaja: täsmälleen yksi näistä
  to_task_id           uuid REFERENCES task(id),
  to_line_id           uuid REFERENCES schedule_line(id),
  to_group_id          uuid REFERENCES schedule_group(id),
  type                 text NOT NULL DEFAULT 'FS' CHECK (type IN ('FS', 'SS', 'FF', 'SF')),
  lag_days             numeric(8,2) NOT NULL DEFAULT 0,
  rigid                boolean NOT NULL DEFAULT false,
  location_mode        text NOT NULL DEFAULT 'single' CHECK (location_mode IN ('single', 'sameLocation')),
  CHECK (num_nonnulls(from_task_id, from_line_id, from_group_id) = 1),
  CHECK (num_nonnulls(to_task_id, to_line_id, to_group_id) = 1)
);
CREATE INDEX dependency_project_idx ON dependency (project_id);

-- ---------------------------------------------------------------------------
-- Toteumat ja vertailuaikataulut
-- ---------------------------------------------------------------------------

-- Kirjaukset ovat lisäyksiä: voimassa oleva tila = uusin kirjaus (as_of, entered_at).
CREATE TABLE progress_entry (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  task_id              uuid NOT NULL REFERENCES task(id),
  as_of                date NOT NULL,
  percent_complete     numeric(5,2) NOT NULL CHECK (percent_complete >= 0 AND percent_complete <= 100),
  actual_start         date,
  actual_finish        date,
  quantity_done        numeric(16,4) CHECK (quantity_done IS NULL OR quantity_done >= 0),
  crew_on_site         numeric(10,2) CHECK (crew_on_site IS NULL OR crew_on_site >= 0),
  note                 text,
  entered_by           uuid REFERENCES app_user(id),
  entered_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (actual_finish IS NULL OR actual_start IS NULL OR actual_finish >= actual_start)
);
CREATE INDEX progress_task_idx ON progress_entry (task_id, as_of DESC, entered_at DESC);
CREATE INDEX progress_project_idx ON progress_entry (project_id, as_of);

CREATE TABLE baseline (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  name                 text NOT NULL,
  taken_at             timestamptz NOT NULL DEFAULT now(),
  taken_by             uuid REFERENCES app_user(id),
  "primary"            boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX baseline_primary_uq ON baseline (project_id) WHERE "primary" AND deleted_at IS NULL;

CREATE TABLE baseline_task (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid NOT NULL REFERENCES project(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  baseline_id          uuid NOT NULL REFERENCES baseline(id),
  -- ei viiteavainta: vertailu säilyy, vaikka tehtävä myöhemmin poistetaan
  task_id              uuid NOT NULL,
  line_id              uuid NOT NULL,
  location_id          uuid,
  planned_start        date NOT NULL,
  planned_finish       date NOT NULL,
  quantity             numeric(16,4) NOT NULL DEFAULT 0,
  crew                 numeric(10,2) NOT NULL DEFAULT 1,
  CHECK (planned_finish >= planned_start)
);
CREATE UNIQUE INDEX baseline_task_uq ON baseline_task (baseline_id, task_id);

-- ---------------------------------------------------------------------------
-- Lisäkentät
-- ---------------------------------------------------------------------------

CREATE TABLE custom_field_def (
  id                   uuid PRIMARY KEY,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  version              integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  updated_by           uuid,
  deleted_at           timestamptz,
  source_system        text,
  source_external_id   text,
  source_imported_at   timestamptz,
  source_batch_id      uuid,
  custom               jsonb NOT NULL DEFAULT '{}'::jsonb,
  target               text NOT NULL CHECK (target IN ('project', 'location', 'trade', 'line', 'task')),
  key                  text NOT NULL CHECK (key ~ '^[a-z][a-z0-9_]{0,62}$'),
  label                jsonb NOT NULL DEFAULT '{}'::jsonb,
  type                 text NOT NULL CHECK (type IN ('text', 'number', 'date', 'boolean', 'select')),
  options              text[] NOT NULL DEFAULT '{}',
  required             boolean NOT NULL DEFAULT false,
  sort_key             text NOT NULL COLLATE "C"
);
CREATE UNIQUE INDEX custom_field_key_uq ON custom_field_def (organization_id, target, key) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Muutostapahtumat (muutoshistoria ja synkronointi)
-- ---------------------------------------------------------------------------

CREATE TABLE change_event (
  id                   uuid PRIMARY KEY,
  server_seq           bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  organization_id      uuid NOT NULL REFERENCES organization(id),
  project_id           uuid REFERENCES project(id),
  entity_type          text NOT NULL,
  entity_id            uuid NOT NULL,
  op                   text NOT NULL CHECK (op IN ('create', 'update', 'delete')),
  changes              jsonb NOT NULL DEFAULT '{}'::jsonb,
  base_version         integer,
  actor_id             uuid,
  device_id            text,
  batch_id             uuid,
  client_time          timestamptz NOT NULL,
  server_time          timestamptz NOT NULL DEFAULT now()
);
-- synkronointi: "kaikki projektin muutokset numeron N jälkeen"
CREATE INDEX change_event_project_seq_idx ON change_event (project_id, server_seq);
CREATE INDEX change_event_org_seq_idx ON change_event (organization_id, server_seq);
-- historia: "kaikki tämän rivin muutokset"
CREATE INDEX change_event_entity_idx ON change_event (entity_type, entity_id, server_seq);

-- Muutoshistoriaa ei muokata eikä poisteta sovelluksesta.
CREATE FUNCTION change_event_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'change_event on vain lisättävissä';
END $$;
CREATE TRIGGER change_event_no_update BEFORE UPDATE OR DELETE ON change_event
  FOR EACH ROW EXECUTE FUNCTION change_event_immutable();

-- ---------------------------------------------------------------------------
-- Yhteiset: lähdetunnisteiden yksikäsitteisyys ja organisaatioeristys
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organization', 'app_user', 'membership', 'calendar', 'project', 'project_access', 'location',
    'resource_type', 'trade', 'schedule_group', 'schedule_line', 'task', 'dependency',
    'progress_entry', 'baseline', 'baseline_task', 'custom_field_def'
  ] LOOP
    -- sama ulkoinen tunniste vain kerran organisaatiossa (uudelleentuonti päivittää)
    EXECUTE format(
      'CREATE UNIQUE INDEX %I ON %I (organization_id, source_system, source_external_id) WHERE source_external_id IS NOT NULL AND deleted_at IS NULL',
      t || '_source_uq', t);
    -- lähdetiedot joko kokonaan tai ei ollenkaan
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I CHECK ((source_system IS NULL) = (source_external_id IS NULL))',
      t, t || '_source_ck');
    -- synkronointi: "rivit, jotka ovat muuttuneet hetken X jälkeen"
    EXECUTE format('CREATE INDEX %I ON %I (organization_id, updated_at)', t || '_updated_idx', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY[
    'organization', 'membership', 'calendar', 'project', 'project_access', 'location',
    'resource_type', 'trade', 'schedule_group', 'schedule_line', 'task', 'dependency',
    'progress_entry', 'baseline', 'baseline_task', 'custom_field_def', 'change_event'
  ] LOOP
    -- Rivitason suojaus: sovellus asettaa transaktiossa SET LOCAL app.organization_id = '<uuid>'.
    -- Taulun omistaja (migraatiot) ohittaa suojauksen; sovellus käyttää erillistä roolia.
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I USING (organization_id = nullif(current_setting(''app.organization_id'', true), '''')::uuid) WITH CHECK (organization_id = nullif(current_setting(''app.organization_id'', true), '''')::uuid)',
      t || '_org_isolation', t);
  END LOOP;
END $$;

-- Käyttäjä voi kuulua useaan organisaatioon: näkyy kotiorganisaatiolle ja organisaatioille, joissa hän on jäsen.
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_user_org_isolation ON app_user
  USING (
    organization_id = nullif(current_setting('app.organization_id', true), '')::uuid
    OR EXISTS (SELECT 1 FROM membership m WHERE m.user_id = app_user.id AND m.deleted_at IS NULL)
  )
  WITH CHECK (organization_id = nullif(current_setting('app.organization_id', true), '')::uuid);

INSERT INTO schema_migration (version) VALUES ('0001_perusta');

COMMIT;
