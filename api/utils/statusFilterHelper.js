/**
 * Utility function to convert normalized project status to SQL WHERE condition
 * This ensures consistent filtering across all API endpoints
 * 
 * Normalized statuses:
 * - Completed
 * - Ongoing
 * - Not started
 * - Stalled
 * - Under Procurement
 * - Suspended
 * - Other
 * 
 * @param {string} normalizedStatus - The normalized status value
 * @param {string} tableAlias - The table alias for the status column (default: 'p')
 * @returns {Object} - Object with condition string and queryParams array (empty for LIKE conditions)
 */
function getStatusFilterCondition(normalizedStatus, tableAlias = 'p') {
    if (!normalizedStatus || typeof normalizedStatus !== 'string') {
        return { condition: null, queryParams: [] };
    }

    const status = normalizedStatus.trim();
    const statusColumn = `${tableAlias}.status`;
    let condition = '';
    const queryParams = [];

    switch (status) {
        case 'Ongoing':
            // Match all variations of "ongoing" status
            condition = `(LOWER(${statusColumn}) LIKE ? OR 
                         LOWER(${statusColumn}) LIKE ? OR 
                         LOWER(${statusColumn}) LIKE ? OR 
                         LOWER(${statusColumn}) LIKE ? OR 
                         LOWER(${statusColumn}) = ? OR
                         (LOWER(${statusColumn}) LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ?))`;
            queryParams.push('%ongoing%', '%on-going%', '%on going%', '%in progress%', 'inprogress', '%initiated%', '%to be initiated%', '%to be%');
            break;

        case 'Completed':
            condition = `(LOWER(${statusColumn}) LIKE ? OR LOWER(${statusColumn}) = ? OR LOWER(${statusColumn}) LIKE ?)`;
            queryParams.push('%completed%', 'complete', '%complete');
            break;

        case 'Not started':
            condition = `(LOWER(${statusColumn}) LIKE ? OR 
                         LOWER(${statusColumn}) LIKE ? OR 
                         LOWER(${statusColumn}) LIKE ? OR
                         (LOWER(${statusColumn}) LIKE ? AND LOWER(${statusColumn}) NOT LIKE ?) OR
                         (LOWER(${statusColumn}) LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ?))`;
            queryParams.push('%not started%', '%notstarted%', '%not-started%', '%to be initiated%', '%completed%', '%to be%', '%completed%', '%initiated%');
            break;

        case 'Stalled':
            condition = `LOWER(${statusColumn}) LIKE ?`;
            queryParams.push('%stalled%');
            break;

        case 'Under Procurement':
            condition = `(LOWER(${statusColumn}) LIKE ? OR LOWER(${statusColumn}) LIKE ?)`;
            queryParams.push('%under procurement%', '%procurement%');
            break;

        case 'Suspended':
            condition = `LOWER(${statusColumn}) LIKE ?`;
            queryParams.push('%suspended%');
            break;

        case 'Other':
            // Other: exclude all main categories
            condition = `(
                ((LOWER(${statusColumn}) NOT LIKE ?) OR (LOWER(${statusColumn}) LIKE ? AND LOWER(${statusColumn}) LIKE ?)) AND
                (LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND (LOWER(${statusColumn}) NOT LIKE ? OR LOWER(${statusColumn}) LIKE ?)) AND
                (LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ?) AND
                (LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ? AND LOWER(${statusColumn}) NOT LIKE ?) AND
                (LOWER(${statusColumn}) NOT LIKE ?) AND
                (LOWER(${statusColumn}) NOT LIKE ?) AND
                ${statusColumn} IS NOT NULL AND ${statusColumn} != ''
            )`;
            queryParams.push(
                '%completed%', '%to be initiated%', '%completed%',  // completed check
                '%ongoing%', '%on-going%', '%on going%', '%in progress%', '%inprogress%', '%initiated%', '%to be initiated%',  // ongoing check
                '%procurement%', '%under procurement%',  // procurement check
                '%not started%', '%notstarted%', '%not-started%',  // not started check
                '%stalled%',  // stalled check
                '%suspended%'  // suspended check
            );
            break;

        default:
            // Fallback to exact match for non-normalized statuses
            condition = `${statusColumn} = ?`;
            queryParams.push(status);
            break;
    }

    return { condition, queryParams };
}

/**
 * Helper function to add status filter to WHERE conditions
 * @param {string} status - The status filter value (normalized or original)
 * @param {Array} whereConditions - Array of WHERE conditions
 * @param {Array} queryParams - Array of query parameters
 * @param {string} tableAlias - The table alias (default: 'p')
 */
function addStatusFilter(status, whereConditions, queryParams, tableAlias = 'p') {
    if (!status) return;

    const { condition, queryParams: statusParams } = getStatusFilterCondition(status, tableAlias);
    if (condition) {
        whereConditions.push(condition);
        queryParams.push(...statusParams);
    }
}

module.exports = {
    getStatusFilterCondition,
    addStatusFilter
};

