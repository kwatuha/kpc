-- Template: generates INSERT statements for Gantt data (stdout, one statement per line).
-- Placeholders __SOURCE_PROJECT_ID__ and __TARGET_PROJECT_ID__ are replaced by
-- api/scripts/export_gantt_schedule_for_remote.sh (integers; usually the same id).
--
-- Run only via the shell script against your LOCAL database — not directly.

SELECT x.line
FROM (
  SELECT 0 AS ord, 0 AS sub, '-- Gantt schedule seed for remote PostgreSQL (generated from local)'::text AS line
  UNION ALL SELECT 0, 1, '-- Review then: psql REMOTE_URL -v ON_ERROR_STOP=1 -f this_file.sql'::text
  UNION ALL SELECT 0, 2, 'BEGIN;'::text

  UNION ALL
  SELECT
    10 AS ord,
    pm.milestone_id AS sub,
    format(
      $f$
INSERT INTO project_milestones (milestone_id, project_id, milestone_name, description, due_date, completed, completed_date, sequence_order, progress, weight, status, user_id, created_at, updated_at, voided, voided_by) VALUES (%s, %s, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L);
$f$,
      pm.milestone_id,
      __TARGET_PROJECT_ID__,
      pm.milestone_name,
      pm.description,
      pm.due_date,
      pm.completed,
      pm.completed_date,
      pm.sequence_order,
      pm.progress,
      pm.weight,
      pm.status,
      pm.user_id,
      pm.created_at,
      pm.updated_at,
      pm.voided,
      pm.voided_by
    ) AS line
  FROM project_milestones pm
  WHERE pm.project_id = __SOURCE_PROJECT_ID__
    AND pm.voided = false

  UNION ALL
  SELECT
    20 AS ord,
    a."activityId" AS sub,
    format(
      $f$
INSERT INTO activities ("activityId", "workplanId", "projectId", "activityName", "activityDescription", "responsibleOfficer", "startDate", "endDate", "budgetAllocated", "actualCost", "percentageComplete", "activityStatus", voided, "userId", "createdAt", "updatedAt", remarks) VALUES (%s, %L, %s, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L);
$f$,
      a."activityId",
      NULL::integer,
      __TARGET_PROJECT_ID__,
      a."activityName",
      a."activityDescription",
      a."responsibleOfficer",
      a."startDate",
      a."endDate",
      a."budgetAllocated",
      a."actualCost",
      a."percentageComplete",
      a."activityStatus",
      a.voided,
      a."userId",
      a."createdAt",
      a."updatedAt",
      a.remarks
    ) AS line
  FROM activities a
  WHERE a.voided = false
    AND a."activityId" IN (
      SELECT ma."activityId"
      FROM milestone_activities ma
      INNER JOIN project_milestones pm ON pm.milestone_id = ma."milestoneId"
      WHERE pm.project_id = __SOURCE_PROJECT_ID__
        AND pm.voided = false
        AND ma.voided = 0
    )

  UNION ALL
  SELECT
    30 AS ord,
    ma.id AS sub,
    format(
      $f$
INSERT INTO milestone_activities (id, "milestoneId", "activityId", "createdAt", "updatedAt", voided) VALUES (%s, %s, %s, %L, %L, %L);
$f$,
      ma.id,
      ma."milestoneId",
      ma."activityId",
      ma."createdAt",
      ma."updatedAt",
      ma.voided
    ) AS line
  FROM milestone_activities ma
  INNER JOIN project_milestones pm ON pm.milestone_id = ma."milestoneId"
  WHERE pm.project_id = __SOURCE_PROJECT_ID__
    AND pm.voided = false
    AND ma.voided = 0

  UNION ALL
  SELECT
    40 AS ord,
    1 AS sub,
    $f$SELECT setval('project_milestones_milestone_id_seq', COALESCE((SELECT MAX(milestone_id) FROM project_milestones), 1));$f$::text AS line
  UNION ALL
  SELECT 50 AS ord, 1 AS sub, 'COMMIT;'::text AS line
) x
ORDER BY x.ord, x.sub;
