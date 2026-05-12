-- PostgreSQL migration: normalize legacy kemri_* table names.
-- Date: 2026-05-08
-- IMPORTANT:
-- 1) Take a full DB backup first.
-- 2) Run in a maintenance window.
-- 3) Test on staging before production.

BEGIN;

-- ---------------------------------------------------------------------------
-- A) Ensure contractor type column exists on both possible contractor tables.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('public.contractors') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS "contractorTypeId" INTEGER NULL';
    END IF;
    IF to_regclass('public.kemri_contractors') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.kemri_contractors ADD COLUMN IF NOT EXISTS "contractorTypeId" INTEGER NULL';
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- B) Canonicalize contractors data into public.contractors.
--    Rules:
--    - If only kemri_contractors exists: rename it to contractors.
--    - If both exist: merge kemri_contractors into contractors by natural key
--      (companyName + email, case-insensitive), then keep contractors canonical.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('public.contractors') IS NULL
       AND to_regclass('public.kemri_contractors') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.kemri_contractors RENAME TO contractors';
    ELSIF to_regclass('public.contractors') IS NOT NULL
          AND to_regclass('public.kemri_contractors') IS NOT NULL THEN
        -- Insert missing rows.
        EXECUTE $q$
            INSERT INTO public.contractors ("companyName","contactPerson",email,phone,"userId","contractorTypeId",voided)
            SELECT k."companyName", k."contactPerson", k.email, k.phone, k."userId", k."contractorTypeId",
                   COALESCE(k.voided, false)
            FROM public.kemri_contractors k
            WHERE NOT EXISTS (
                SELECT 1
                FROM public.contractors c
                WHERE LOWER(TRIM(c."companyName")) = LOWER(TRIM(k."companyName"))
                  AND LOWER(TRIM(c.email)) = LOWER(TRIM(k.email))
            )
        $q$;

        -- Backfill null fields on existing contractor rows.
        EXECUTE $q$
            UPDATE public.contractors c
            SET "contactPerson" = COALESCE(c."contactPerson", k."contactPerson"),
                phone           = COALESCE(c.phone, k.phone),
                "userId"        = COALESCE(c."userId", k."userId"),
                "contractorTypeId" = COALESCE(c."contractorTypeId", k."contractorTypeId")
            FROM public.kemri_contractors k
            WHERE LOWER(TRIM(c."companyName")) = LOWER(TRIM(k."companyName"))
              AND LOWER(TRIM(c.email)) = LOWER(TRIM(k.email))
        $q$;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- C) Canonicalize project_contractor_assignments.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('public.project_contractor_assignments') IS NULL
       AND to_regclass('public.kemri_project_contractor_assignments') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.kemri_project_contractor_assignments RENAME TO project_contractor_assignments';
    ELSIF to_regclass('public.project_contractor_assignments') IS NOT NULL
          AND to_regclass('public.kemri_project_contractor_assignments') IS NOT NULL THEN
        EXECUTE $q$
            INSERT INTO public.project_contractor_assignments ("projectId","contractorId",assigned_at,voided)
            SELECT k."projectId", k."contractorId", k.assigned_at, COALESCE(k.voided, false)
            FROM public.kemri_project_contractor_assignments k
            WHERE NOT EXISTS (
                SELECT 1
                FROM public.project_contractor_assignments p
                WHERE p."projectId" = k."projectId"
                  AND p."contractorId" = k."contractorId"
            )
        $q$;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- D) Generic rename pass for remaining kemri_* tables.
--    - Renames kemri_foo -> foo only when foo does not already exist.
--    - Leaves table unchanged when canonical table already exists.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
    old_name TEXT;
    new_name TEXT;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE 'kemri\_%' ESCAPE '\'
        ORDER BY tablename
    LOOP
        old_name := r.tablename;
        new_name := substring(old_name FROM 7); -- remove "kemri_"

        IF to_regclass('public.' || quote_ident(new_name)) IS NULL THEN
            EXECUTE format('ALTER TABLE public.%I RENAME TO %I', old_name, new_name);
        ELSE
            RAISE NOTICE 'Skipping rename %. Target table % already exists.', old_name, new_name;
        END IF;
    END LOOP;
END $$;

COMMIT;

-- ---------------------------------------------------------------------------
-- Optional compatibility layer (commented out):
-- If you need temporary backwards compatibility while code is updated, create
-- views with old names. Example:
--
-- CREATE OR REPLACE VIEW public.kemri_contractors AS
-- SELECT * FROM public.contractors;
--
-- CREATE OR REPLACE VIEW public.kemri_project_contractor_assignments AS
-- SELECT * FROM public.project_contractor_assignments;
-- ---------------------------------------------------------------------------
