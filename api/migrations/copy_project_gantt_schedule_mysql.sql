-- Copy project schedule data used by the Gantt chart:
--   project_milestones -> project_milestones (new project)
--   activities (linked via milestone_activities) -> activities
--   milestone_activities -> milestone_activities (rewired to new IDs)
--
-- Source is fixed to project id 1. Set the target project id before calling.
-- MySQL / MariaDB ONLY (camelCase columns, matches api/schema.sql).
-- For PostgreSQL use: copy_project_gantt_schedule_postgresql.sql (psql) — do not run this file with psql.
--
-- Usage:
--   mysql -u ... -p your_db < api/migrations/copy_project_gantt_schedule_mysql.sql
--   Then in mysql:
--     CALL copy_project_gantt_schedule(1, 123);   -- 123 = destination projects.id
--     DROP PROCEDURE IF EXISTS copy_project_gantt_schedule;
--
-- Notes:
--   - Cloned activities get workplanId = NULL to avoid FK issues to annual_workplans.
--   - milestone_attachments and other milestone documents are NOT copied.
--   - Safe to run once per target; duplicate calls will add another full copy of milestones/activities.

DELIMITER $$

DROP PROCEDURE IF EXISTS copy_project_gantt_schedule $$

CREATE PROCEDURE copy_project_gantt_schedule(
  IN p_source_project_id INT,
  IN p_target_project_id INT
)
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_old_milestone_id INT;
  DECLARE v_old_activity_id INT;

  DECLARE cur_m CURSOR FOR
    SELECT milestoneId
    FROM project_milestones
    WHERE projectId = p_source_project_id AND voided = 0
    ORDER BY sequenceOrder, milestoneId;

  DECLARE cur_a CURSOR FOR
    SELECT DISTINCT ma.activityId
    FROM milestone_activities ma
    INNER JOIN project_milestones pm ON pm.milestoneId = ma.milestoneId
    INNER JOIN activities a ON a.activityId = ma.activityId AND a.voided = 0
    WHERE pm.projectId = p_source_project_id
      AND pm.voided = 0
      AND ma.voided = 0
    ORDER BY ma.activityId;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  IF p_source_project_id IS NULL OR p_target_project_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'source and target project ids are required';
  END IF;

  IF p_source_project_id = p_target_project_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'source and target project ids must differ';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS map_milestone;
  DROP TEMPORARY TABLE IF EXISTS map_activity;

  CREATE TEMPORARY TABLE map_milestone (
    old_id INT NOT NULL PRIMARY KEY,
    new_id INT NOT NULL
  ) ENGINE=Memory;

  CREATE TEMPORARY TABLE map_activity (
    old_id INT NOT NULL PRIMARY KEY,
    new_id INT NOT NULL
  ) ENGINE=Memory;

  -- 1) Clone milestones (preserve order for stable mapping)
  OPEN cur_m;
  read_m: LOOP
    FETCH cur_m INTO v_old_milestone_id;
    IF done THEN
      LEAVE read_m;
    END IF;

    INSERT INTO project_milestones (
      projectId,
      milestoneName,
      description,
      dueDate,
      sequenceOrder,
      status,
      completed,
      completedDate,
      userId,
      voided,
      voidedBy,
      progress,
      weight
    )
    SELECT
      p_target_project_id,
      milestoneName,
      description,
      dueDate,
      sequenceOrder,
      status,
      completed,
      completedDate,
      userId,
      0,
      NULL,
      progress,
      weight
    FROM project_milestones
    WHERE milestoneId = v_old_milestone_id
    LIMIT 1;

    INSERT INTO map_milestone (old_id, new_id) VALUES (v_old_milestone_id, LAST_INSERT_ID());
  END LOOP;
  CLOSE cur_m;

  SET done = FALSE;

  -- 2) Clone activities that participate in any milestone link for the source project
  OPEN cur_a;
  read_a: LOOP
    FETCH cur_a INTO v_old_activity_id;
    IF done THEN
      LEAVE read_a;
    END IF;

    INSERT INTO activities (
      workplanId,
      projectId,
      activityName,
      activityDescription,
      responsibleOfficer,
      startDate,
      endDate,
      budgetAllocated,
      actualCost,
      percentageComplete,
      activityStatus,
      voided,
      userId,
      remarks
    )
    SELECT
      NULL,
      p_target_project_id,
      activityName,
      activityDescription,
      responsibleOfficer,
      startDate,
      endDate,
      budgetAllocated,
      actualCost,
      percentageComplete,
      activityStatus,
      0,
      userId,
      remarks
    FROM activities
    WHERE activityId = v_old_activity_id
      AND voided = 0
    LIMIT 1;

    IF ROW_COUNT() > 0 THEN
      INSERT INTO map_activity (old_id, new_id) VALUES (v_old_activity_id, LAST_INSERT_ID());
    END IF;
  END LOOP;
  CLOSE cur_a;

  -- 3) Rewire milestone <-> activity links for the new project
  INSERT INTO milestone_activities (milestoneId, activityId, voided)
  SELECT
    mm.new_id,
    am.new_id,
    0
  FROM milestone_activities ma
  INNER JOIN project_milestones pm ON pm.milestoneId = ma.milestoneId
  INNER JOIN map_milestone mm ON mm.old_id = ma.milestoneId
  INNER JOIN map_activity am ON am.old_id = ma.activityId
  WHERE pm.projectId = p_source_project_id
    AND pm.voided = 0
    AND ma.voided = 0;

  DROP TEMPORARY TABLE IF EXISTS map_milestone;
  DROP TEMPORARY TABLE IF EXISTS map_activity;
END $$

DELIMITER ;

-- Example (uncomment and set destination project id):
-- CALL copy_project_gantt_schedule(1, 2);
