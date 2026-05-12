-- =============================================================================
-- Align users.ministry + users.state_department with seeded ministries / departments
-- =============================================================================
-- Source of legacy pairs: users_remote.xlsx (Ministry + State department columns)
-- compared to scripts/sql/seed_kenya_ministries_structure.sql (canonical names).
--
-- PostgreSQL only. Prerequisites:
--   - ministries + departments populated (same as seed script)
--   - users columns: ministry, state_department, voided, updatedat
--
-- Does NOT change user_organization_scope rows (only profile text fields).
-- Skips rows where ministry/state are blank. Skips legacy pairs with no mapping
-- (see bottom: Executive Office of the President — not in Kenya seed list).
--
-- Review counts, then run:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/update_users_ministry_state_from_canonical.sql
-- =============================================================================

BEGIN;

CREATE TEMP TABLE _ministry_state_legacy_map (
    legacy_ministry TEXT NOT NULL,
    legacy_state TEXT NOT NULL,
    canon_ministry TEXT NOT NULL,
    canon_department TEXT NOT NULL
);

INSERT INTO _ministry_state_legacy_map (legacy_ministry, legacy_state, canon_ministry, canon_department) VALUES
-- [22x] ICT
('Ministry of Information, Communications and Digital Economy', 'State Department for ICT and Digital Economy',
 'Information, Communications & The Digital Economy', 'ICT & Digital Economy'),
-- [3x] Treasury / Economic Planning
('National Treasury', 'State Department for Economic Planning',
 'National Treasury & Economic Planning', 'Economic Planning'),
-- [3x] Treasury (profile used ministry name twice)
('National Treasury', 'National Treasury',
 'National Treasury & Economic Planning', 'The National Treasury'),
-- [4x] Defence
('Ministry of Defence', 'Defence',
 'Defence', 'Defence'),
-- [4x] Education / TVET
('Ministry of Education', 'State Department for Technical Vocational Education and Training (TVET)',
 'Education', 'TVET'),
-- [3x] Interior
('Ministry of Interior and National Administration', 'State Department for Internal Security and National Administration',
 'Interior & National Administration', 'Internal Security & National Administration'),
-- [3x] Labour / skills
('Ministry of Labour and Social Protection', 'State Department for Labour and Skills Development',
 'Labour & Social Protection', 'Labour & Skills Development'),
-- [1x] Labour / social protection (variant)
('Ministry of Labour and Social Protection', 'State Department for Social Protection and Senior Citizen Affairs',
 'Labour & Social Protection', 'Social Protection & Senior Citizen Affairs'),
-- [3x] Youth
('Ministry of Youth Affairs Sports and the Arts', 'State Department for Youth Affairs',
 'Youth Affairs, Creative Economy & Sports', 'Youth Affairs & Creative Economy'),
-- [3x] Foreign affairs
('Office of the Prime Cabinet Secretary & Ministry of Foreign & Diaspora Affairs', 'State Department for Foreign Affairs',
 'Foreign & Diaspora Affairs', 'Foreign Affairs'),
-- [2x] Lands / Public Works
('Ministry of Lands, Public Works, Housing and Urban Development', 'State Department for Public Works',
 'Lands, Public Works, Housing & Urban Development', 'Public Works'),
-- [1x] ICT / Broadcasting
('Ministry of Information Communications and the Digital Economy', 'State Department for Broadcasting and Telecommunications',
 'Information, Communications & The Digital Economy', 'Broadcasting & Telecommunications'),
-- [1x] Roads / Aviation
('Ministry of Roads and Transport', 'State Department for Aviation',
 'Roads & Transport', 'Aviation & Aerospace Development');

-- Preview: how many user rows match each legacy pair (optional — comment out if undesired)
-- SELECT m.legacy_ministry, m.legacy_state, COUNT(*) AS users_matched
-- FROM users u
-- JOIN _ministry_state_legacy_map m
--   ON TRIM(COALESCE(u.ministry, '')) = m.legacy_ministry
--  AND TRIM(COALESCE(u.state_department, '')) = m.legacy_state
-- WHERE COALESCE(u.voided, false) = false
-- GROUP BY m.legacy_ministry, m.legacy_state
-- ORDER BY users_matched DESC;

UPDATE users u
SET
    ministry = m.name,
    state_department = d.name,
    updatedat = CURRENT_TIMESTAMP
FROM _ministry_state_legacy_map map
JOIN ministries m
  ON m.name = map.canon_ministry
 AND COALESCE(m.voided, false) = false
JOIN departments d
  ON d."ministryId" = m."ministryId"
 AND d.name = map.canon_department
 AND COALESCE(d.voided, false) = false
WHERE COALESCE(u.voided, false) = false
  AND TRIM(COALESCE(u.ministry, '')) = map.legacy_ministry
  AND TRIM(COALESCE(u.state_department, '')) = map.legacy_state;

COMMIT;

-- =============================================================================
-- Unmapped legacy pairs (still in Excel / DB after this script)
-- =============================================================================
-- From users_remote.xlsx these had no counterpart in seed_kenya_ministries_structure.sql:
--   ministry = 'Executive Office of the President'
--   state_department = 'Executive Office of the President'   (2 users)
-- Add ministries/departments for that structure first, then extend
-- _ministry_state_legacy_map and re-run if needed.
--
-- Blank ministry + blank state_department (18 users in export): intentionally not updated.
-- =============================================================================
