-- Copy Gantt schedule INSIDE ONE DATABASE (e.g. duplicate project 1 → project 2 on the same server).
-- For LOCAL → REMOTE (your laptop has Gantt data, production does not), use instead:
--   api/scripts/export_gantt_schedule_for_remote.sh
-- which reads LOCAL and writes a .sql file you run on REMOTE with psql.
--
-- This file defines:
--   project_milestones (snake_case) -> new rows for target project_id
--   activities (quoted camelCase) -> new rows for target "projectId"
--   milestone_activities -> new links using "milestoneId" / "activityId"
--
-- Schema like db_backups/local_revised_gov_db_*.sql:
--   projects.primary key = project_id
--   project_milestones: milestone_id, project_id, voided boolean, ...
--   milestone_activities: id, "milestoneId", "activityId", voided smallint
--
-- Do NOT run the MySQL file (copy_project_gantt_schedule_mysql.sql) with psql.
--
-- Same-DB usage:
--   psql "$DATABASE_URL" -f api/migrations/copy_project_gantt_schedule_postgresql.sql
--   psql ... -c "SELECT copy_project_gantt_schedule(1, 123);"   -- 123 = destination projects.project_id
--
-- Notes:
--   - Cloned activities get "workplanId" = NULL.
--   - New activity PKs use MAX("activityId")+1 (no serial in typical dumps); single-connection migrations only.
--   - milestone_attachments are NOT copied.

CREATE OR REPLACE FUNCTION copy_project_gantt_schedule(
  p_source_project_id integer,
  p_target_project_id integer
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  r_pm       record;
  r_act      record;
  v_new_mid  integer;
  v_new_aid  integer;
  v_inserted integer;
BEGIN
  IF p_source_project_id IS NULL OR p_target_project_id IS NULL THEN
    RAISE EXCEPTION 'source and target project ids are required';
  END IF;
  IF p_source_project_id = p_target_project_id THEN
    RAISE EXCEPTION 'source and target project ids must differ';
  END IF;

  DROP TABLE IF EXISTS map_milestone;
  DROP TABLE IF EXISTS map_activity;
  CREATE TEMP TABLE map_milestone (old_id int PRIMARY KEY, new_id int NOT NULL);
  CREATE TEMP TABLE map_activity (old_id int PRIMARY KEY, new_id int NOT NULL);

  -- 1) Milestones
  FOR r_pm IN
    SELECT *
    FROM project_milestones
    WHERE project_id = p_source_project_id
      AND voided = false
    ORDER BY sequence_order NULLS LAST, milestone_id
  LOOP
    INSERT INTO project_milestones (
      project_id,
      milestone_name,
      description,
      due_date,
      sequence_order,
      status,
      completed,
      completed_date,
      user_id,
      voided,
      voided_by,
      progress,
      weight
    ) VALUES (
      p_target_project_id,
      r_pm.milestone_name,
      r_pm.description,
      r_pm.due_date,
      r_pm.sequence_order,
      r_pm.status,
      r_pm.completed,
      r_pm.completed_date,
      r_pm.user_id,
      false,
      NULL,
      r_pm.progress,
      r_pm.weight
    )
    RETURNING milestone_id INTO v_new_mid;

    INSERT INTO map_milestone (old_id, new_id)
    VALUES (r_pm.milestone_id, v_new_mid);
  END LOOP;

  -- 2) Activities linked to those milestones (non-voided)
  FOR r_act IN
    SELECT DISTINCT ma."activityId" AS aid
    FROM milestone_activities ma
    INNER JOIN project_milestones pm ON pm.milestone_id = ma."milestoneId"
    INNER JOIN activities a ON a."activityId" = ma."activityId" AND a.voided = false
    WHERE pm.project_id = p_source_project_id
      AND pm.voided = false
      AND ma.voided = 0
    ORDER BY 1
  LOOP
    v_new_aid := (SELECT COALESCE(MAX("activityId"), 0) FROM activities) + 1;

    INSERT INTO activities (
      "activityId",
      "workplanId",
      "projectId",
      "activityName",
      "activityDescription",
      "responsibleOfficer",
      "startDate",
      "endDate",
      "budgetAllocated",
      "actualCost",
      "percentageComplete",
      "activityStatus",
      voided,
      "userId",
      remarks
    )
    SELECT
      v_new_aid,
      NULL,
      p_target_project_id,
      a."activityName",
      a."activityDescription",
      a."responsibleOfficer",
      a."startDate",
      a."endDate",
      a."budgetAllocated",
      a."actualCost",
      a."percentageComplete",
      a."activityStatus",
      false,
      a."userId",
      a.remarks
    FROM activities a
    WHERE a."activityId" = r_act.aid
      AND a.voided = false;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF v_inserted > 0 THEN
      INSERT INTO map_activity (old_id, new_id)
      VALUES (r_act.aid, v_new_aid);
    END IF;
  END LOOP;

  -- 3) New milestone_activities rows (fresh ids)
  INSERT INTO milestone_activities (id, "milestoneId", "activityId", voided)
  SELECT
    sub.mx + sub.rn,
    sub.new_mid,
    sub.new_aid,
    0
  FROM (
    SELECT
      mm.new_id AS new_mid,
      am.new_id AS new_aid,
      ROW_NUMBER() OVER (ORDER BY ma.id) AS rn,
      (SELECT COALESCE(MAX(m2.id), 0) FROM milestone_activities m2) AS mx
    FROM milestone_activities ma
    INNER JOIN project_milestones pm ON pm.milestone_id = ma."milestoneId"
    INNER JOIN map_milestone mm ON mm.old_id = ma."milestoneId"
    INNER JOIN map_activity am ON am.old_id = ma."activityId"
    WHERE pm.project_id = p_source_project_id
      AND pm.voided = false
      AND ma.voided = 0
  ) sub;

  DROP TABLE IF EXISTS map_milestone;
  DROP TABLE IF EXISTS map_activity;
END;
$$;

-- Run after loading this file (set destination project_id):
-- SELECT copy_project_gantt_schedule(1, 2);
