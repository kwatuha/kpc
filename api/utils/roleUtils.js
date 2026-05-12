/**
 * Align with authRoutes login: treat super_admin / super-admin as super admin.
 */
function normalizeRoleForCompare(role) {
    return String(role ?? '')
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ');
}

const ADMIN_LIKE_ROLE_NAMES = new Set([
    'admin',
    'mda ict admin',
    'super admin',
    'administrator',
    'ict admin',
]);

const ADMIN_LIKE_ROLE_IDS = new Set([1]);

function isSuperAdminRequester(reqUser) {
    const raw = reqUser?.roleName ?? reqUser?.role ?? '';
    return normalizeRoleForCompare(raw) === 'super admin';
}

function isAdminLikeRequester(reqUser) {
    if (!reqUser) return false;
    const normalizedRole = normalizeRoleForCompare(reqUser.roleName ?? reqUser.role ?? '');
    const normalizedRoleUnderscore = normalizedRole.replace(/\s+/g, '_');
    const roleId = parseInt(String(reqUser.roleId ?? reqUser.role_id ?? ''), 10);
    const privileges = Array.isArray(reqUser.privileges) ? reqUser.privileges : [];
    return (
        (Number.isFinite(roleId) && ADMIN_LIKE_ROLE_IDS.has(roleId)) ||
        ADMIN_LIKE_ROLE_NAMES.has(normalizedRole) ||
        ADMIN_LIKE_ROLE_NAMES.has(normalizedRoleUnderscore.replace(/_/g, ' ')) ||
        privileges.includes('admin.access') ||
        privileges.includes('organization.scope_bypass')
    );
}

module.exports = {
    normalizeRoleForCompare,
    isSuperAdminRequester,
    isAdminLikeRequester,
    ADMIN_LIKE_ROLE_NAMES,
    ADMIN_LIKE_ROLE_IDS,
};
