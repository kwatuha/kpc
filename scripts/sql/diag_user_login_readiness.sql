-- Compare users for login issues (PostgreSQL). Run: psql ... -f scripts/sql/diag_user_login_readiness.sql
-- Edit the patterns below if your logins differ.

SELECT
  u.userid,
  u.username,
  u.email,
  u.voided,
  u.isactive,
  u.otp_enabled,
  length(COALESCE(u.passwordhash, '')) AS passwordhash_len,
  left(COALESCE(u.passwordhash, ''), 4) AS passwordhash_prefix,
  (u.passwordhash ~ '^\$2[aby]\$') AS looks_like_bcrypt,
  (u.username IS DISTINCT FROM trim(u.username)) AS username_has_edge_space,
  (u.email IS NOT NULL AND u.email IS DISTINCT FROM trim(u.email)) AS email_has_edge_space,
  (u.username IS DISTINCT FROM lower(u.username)) AS username_has_uppercase,
  (u.email IS NOT NULL AND u.email IS DISTINCT FROM lower(u.email)) AS email_has_uppercase
FROM users u
WHERE u.voided = false
  AND (
    lower(u.username) LIKE '%mwanga%' OR lower(u.email) LIKE '%mwanga%'
    OR lower(u.username) LIKE '%alpha%' OR lower(u.email) LIKE '%alpha%'
    OR lower(u.username) LIKE '%askwatuha%' OR lower(u.email) LIKE '%askwatuha%'
    OR lower(u.username) LIKE '%akwatuha%' OR lower(u.email) LIKE '%akwatuha%'
  )
ORDER BY u.username;

-- Same email (ignoring case) on multiple active rows → ambiguous logins
SELECT lower(trim(email)) AS email_lc, count(*) AS n, string_agg(username, ', ') AS usernames
FROM users
WHERE voided = false AND email IS NOT NULL AND trim(email) <> ''
GROUP BY lower(trim(email))
HAVING count(*) > 1;
