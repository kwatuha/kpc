// backend/middleware/privilegeMiddleware.js
// This middleware checks if the authenticated user has the required privileges.
const { isAdminLikeRequester } = require('../utils/roleUtils');

const privilege = (requiredPrivileges, options = {}) => (req, res, next) => {
    // Ensure user object exists on the request
    // The 'auth' middleware should have already populated req.user
    if (!req.user) {
        console.warn('PrivilegeMiddleware: User not found on request. Denying access.');
        return res.status(403).json({ error: 'Access denied. Insufficient authentication or user data.' });
    }

    // Check if user is admin - admins bypass privilege checks
    const isAdmin = isAdminLikeRequester(req.user);
    if (isAdmin) {
        console.log(`PrivilegeMiddleware: User ${req.user.username} (ID: ${req.user.id}) is admin, bypassing privilege check.`);
        return next();
    }

    // Ensure privileges array exists
    if (!req.user.privileges || !Array.isArray(req.user.privileges)) {
        console.warn('PrivilegeMiddleware: User privileges not found or not an array. User:', req.user.username, 'Privileges:', req.user.privileges);
        return res.status(403).json({ error: 'Access denied. Insufficient authentication or user data.' });
    }

    // Support for "any of" mode (OR logic) - if options.anyOf is true, user needs ANY of the privileges
    // Otherwise, default to "all of" mode (AND logic) - user needs ALL of the privileges
    let hasRequired;
    if (options.anyOf) {
        // Check if the user has ANY of the required privileges
        hasRequired = requiredPrivileges.some(priv =>
            req.user.privileges.includes(priv)
        );
    } else {
        // Check if the user has ALL of the required privileges
        hasRequired = requiredPrivileges.every(priv =>
            req.user.privileges.includes(priv)
        );
    }

    if (hasRequired) {
        console.log(`PrivilegeMiddleware: User ${req.user.username} (ID: ${req.user.id}) has required privileges.`);
        next(); // User has required privileges, proceed to the next middleware/route handler
    } else {
        console.warn(`PrivilegeMiddleware: User ${req.user.username} (ID: ${req.user.id}) lacks required privileges.`);
        console.warn('Required:', requiredPrivileges, 'User has:', req.user.privileges);
        return res.status(403).json({ error: 'Access denied. You do not have the necessary privileges to perform this action.' });
    }
};

privilege.isAdminLike = isAdminLikeRequester;

module.exports = privilege;
