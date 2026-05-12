/**
 * Match api/routes/authRoutes.js login: underscores/hyphens → spaces before compare.
 */
export function normalizeRoleForCompare(role) {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
}

/** True if JWT user is Super Admin (handles super_admin, Super Admin, etc.). */
export function isSuperAdminUser(user) {
  const raw = user?.role ?? user?.roleName ?? '';
  return normalizeRoleForCompare(raw) === 'super admin';
}

/** Mirror api/routes/userRoutes.js isMdaIctAdminRequester (incl. common naming variants). */
export function isMdaIctAdminUser(user) {
  const raw = user?.roleName ?? user?.role ?? '';
  const normalized = normalizeRoleForCompare(raw);
  return (
    normalized === 'mda ict admin' ||
    normalized === 'mda ict addmin' ||
    (normalized.includes('mda ict') && (normalized.includes('admin') || normalized.includes('addmin')))
  );
}

/** Same set as api ALLOWED_ASSIGNMENT_ROLES_FOR_MDA_ICT_ADMIN (normalized keys). */
const MDA_ICT_ADMIN_MUTABLE_TARGET_ROLES = new Set(['data entry officer', 'data approver', 'viewer']);

export function canMdaIctAdminEditTargetRoleName(roleName) {
  return MDA_ICT_ADMIN_MUTABLE_TARGET_ROLES.has(normalizeRoleForCompare(roleName));
}

/**
 * Whether the signed-in user may PUT-update the given user row (edit, reset password, toggle active, org scopes).
 * Super Admin: always. Non–MDA ICT Admin: yes (other rules enforced server-side). MDA ICT Admin: only allowed target roles.
 */
export function canMdaIctAdminMutateUser(actor, targetUserRow) {
  if (isSuperAdminUser(actor)) return true;
  if (!isMdaIctAdminUser(actor)) return true;
  return canMdaIctAdminEditTargetRoleName(targetUserRow?.role ?? targetUserRow?.roleName ?? '');
}
