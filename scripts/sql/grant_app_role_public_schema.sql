-- Fix: "permission denied for schema public" for the application DB user.
-- The app must be able to USE schema public and read/write its tables (e.g. system_settings).
--
-- Run as superuser or database owner, after replacing postgres_user if needed:
--
--   psql -U postgres -d YOUR_DATABASE -f scripts/sql/grant_app_role_public_schema.sql

-- Required: without USAGE on public, SELECT/INSERT fail with "permission denied for schema public".
GRANT USAGE ON SCHEMA public TO postgres_user;

-- Needed if routes run CREATE TABLE IF NOT EXISTS (session policy creates system_settings).
GRANT CREATE ON SCHEMA public TO postgres_user;

-- Existing tables in public (narrow this to specific tables if you use strict least-privilege).
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres_user;

-- Tables/sequences created in the future by other roles (optional).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO postgres_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO postgres_user;
