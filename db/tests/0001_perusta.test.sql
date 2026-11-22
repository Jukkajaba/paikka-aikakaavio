-- Tietokantarakenteen testit. Ajetaan migraatioiden jälkeen tyhjään tietokantaan:
--   psql -v ON_ERROR_STOP=1 -f db/tests/0001_perusta.test.sql
-- Epäonnistuva tarkistus keskeyttää ajon virheeseen.

\set ON_ERROR_STOP 1
BEGIN;

-- Sovelluksen rooli: ei taulujen omistaja, joten rivitason suojaus koskee sitä.
CREATE ROLE app_test NOLOGIN;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_test;

-- Kaksi organisaatiota, kummallakin projekti (lisätään omistajana)
INSERT INTO organization (id, organization_id, name) VALUES
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1', 'Rakennus A'),
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b1', 'Rakennus B');
INSERT INTO calendar (id, organization_id, name, holiday_region) VALUES
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'Ma–pe', 'FI'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b1', 'Ma–pe', 'FI');
INSERT INTO project (id, organization_id, name, calendar_id, start_date) VALUES
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a1', 'Kohde A', '00000000-0000-0000-0000-0000000000a2', '2027-01-04'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b1', 'Kohde B', '00000000-0000-0000-0000-0000000000b2', '2027-01-04');
INSERT INTO location (id, organization_id, project_id, name, sort_key) VALUES
  ('00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'Kerros 1', 'a'),
  ('00000000-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'Kerros 2', 'b');
INSERT INTO trade (id, organization_id, project_id, name, unit, production_rate, color) VALUES
  ('00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'Levytys', 'm²', 12, '#4a7');
INSERT INTO schedule_line (id, organization_id, project_id, trade_id, from_location_id, to_location_id, planned_start_date, duration_per_share, production_rate, sort_key) VALUES
  ('00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a6',
   '00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000a5', '2027-01-04', 5, 12, 'a');
INSERT INTO task (id, organization_id, project_id, line_id, location_id) VALUES
  ('00000000-0000-0000-0000-0000000000a8', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-0000000000a4'),
  ('00000000-0000-0000-0000-0000000000a9', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-0000000000a5');

-- Apu: odotettu virhe
CREATE FUNCTION pg_temp.expect_error(stmt text, what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE stmt;
  EXCEPTION WHEN others THEN
    RETURN;
  END;
  RAISE EXCEPTION 'Odotettu virhe puuttui: %', what;
END $$;

-- Rajoitteet
SELECT pg_temp.expect_error($$INSERT INTO task (id, organization_id, project_id, line_id, location_id) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-0000000000a4')$$, 'sama viiva ja sijainti kahdesti');
SELECT pg_temp.expect_error($$INSERT INTO dependency (id, organization_id, project_id, from_task_id, from_line_id, to_task_id) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a8', '00000000-0000-0000-0000-0000000000a7', '00000000-0000-0000-0000-0000000000a9')$$, 'riippuvuudella kaksi edeltäjää');
SELECT pg_temp.expect_error($$INSERT INTO schedule_line (id, organization_id, project_id, trade_id, from_location_id, to_location_id, planned_start_date, duration_per_share, production_rate, sort_key, duration_mode) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000a5', '2027-01-04', 5, 12, 'b', 'crew')$$, 'työryhmätila ilman työryhmää');
SELECT pg_temp.expect_error($$INSERT INTO progress_entry (id, organization_id, project_id, task_id, as_of, percent_complete) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a8', '2027-01-08', 120)$$, 'valmiusaste yli 100');
SELECT pg_temp.expect_error($$UPDATE location SET source_system = 'ifc' WHERE id = '00000000-0000-0000-0000-0000000000a4'$$, 'lähdejärjestelmä ilman tunnistetta');

-- Sama ulkoinen tunniste vain kerran
UPDATE location SET source_system = 'ifc', source_external_id = '2O2Fr$t4X7Zf8NOew3FLOH' WHERE id = '00000000-0000-0000-0000-0000000000a4';
SELECT pg_temp.expect_error($$UPDATE location SET source_system = 'ifc', source_external_id = '2O2Fr$t4X7Zf8NOew3FLOH' WHERE id = '00000000-0000-0000-0000-0000000000a5'$$, 'sama IFC-tunniste kahdesti');

-- Toteumat: kaksi kirjausta samaan tehtävään on sallittu (lisäyksiä)
INSERT INTO progress_entry (id, organization_id, project_id, task_id, as_of, percent_complete, actual_start) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a8', '2027-01-08', 40, '2027-01-04'),
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a8', '2027-01-08', 50, '2027-01-04');

-- Muutoshistoria: lisäys onnistuu, muokkaus ja poisto eivät
INSERT INTO change_event (id, organization_id, project_id, entity_type, entity_id, op, changes, base_version, client_time) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'task', '00000000-0000-0000-0000-0000000000a8', 'update', '{"shiftDays":{"from":0,"to":1}}', 1, now());
SELECT pg_temp.expect_error($$UPDATE change_event SET op = 'delete'$$, 'muutoshistorian muokkaus');
SELECT pg_temp.expect_error($$DELETE FROM change_event$$, 'muutoshistorian poisto');

-- Organisaatioeristys sovelluksen roolilla
SET LOCAL ROLE app_test;
SET LOCAL app.organization_id = '00000000-0000-0000-0000-0000000000b1';
DO $$
BEGIN
  IF (SELECT count(*) FROM project) <> 1 OR (SELECT name FROM project) <> 'Kohde B' THEN RAISE EXCEPTION 'B näkee väärät projektit'; END IF;
  IF (SELECT count(*) FROM task) <> 0 THEN RAISE EXCEPTION 'B näkee A:n tehtävät'; END IF;
  IF (SELECT count(*) FROM change_event) <> 0 THEN RAISE EXCEPTION 'B näkee A:n muutoshistorian'; END IF;
END $$;
SELECT pg_temp.expect_error($$INSERT INTO location (id, organization_id, project_id, name, sort_key) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', 'Murto', 'z')$$, 'B kirjoittaa A:n tietoihin');

SET LOCAL app.organization_id = '00000000-0000-0000-0000-0000000000a1';
DO $$
BEGIN
  IF (SELECT count(*) FROM task) <> 2 THEN RAISE EXCEPTION 'A ei näe omia tehtäviään'; END IF;
  IF (SELECT count(*) FROM progress_entry) <> 2 THEN RAISE EXCEPTION 'A ei näe toteumiaan'; END IF;
END $$;

-- Ilman organisaatioasetusta ei näy mitään
RESET app.organization_id;
SET LOCAL app.organization_id = '';
DO $$
BEGIN
  IF (SELECT count(*) FROM project) <> 0 THEN RAISE EXCEPTION 'Ilman organisaatiota näkyy projekteja'; END IF;
END $$;

RESET ROLE;
\echo 'Kaikki tietokantatestit OK'
ROLLBACK;
