/**
 * Normalizes project statuses into standardized categories for charts and analytics.
 * 
 * Standard statuses:
 * - Completed
 * - Ongoing
 * - Not started
 * - Stalled
 * - Under Procurement
 * - Suspended
 * - Other
 * 
 * @param {string} status - The original project status
 * @returns {string} - The normalized status category
 */
export const normalizeProjectStatus = (status) => {
  if (!status || typeof status !== 'string') {
    return 'Other';
  }

  const statusLower = status.toLowerCase().trim();

  // Check for "to be initiated and completed" - map to "Other" since it has no specific status
  if (statusLower.includes('to be initiated') && statusLower.includes('completed')) {
    return 'Other';
  }

  // Check for "completed" FIRST (case-insensitive, handles variations like "Phase II completed", "complete")
  // This must come before other checks to catch all completed variations
  if (statusLower.includes('completed') || statusLower === 'complete' || statusLower.endsWith('complete')) {
    return 'Completed';
  }

  // Check for "ongoing", "on-going", "on going", "in progress", "inprogress", "initiated" (case-insensitive)
  // Note: "initiated" means the project has started, so it's "Ongoing"
  // But "to be initiated" means not started yet
  if (statusLower.includes('ongoing') || 
      statusLower.includes('on-going') || 
      statusLower.includes('on going') ||
      statusLower.includes('in progress') ||
      statusLower === 'inprogress' ||
      statusLower.includes('inprogress') ||
      (statusLower.includes('initiated') && !statusLower.includes('to be initiated') && !statusLower.includes('to be'))) {
    return 'Ongoing';
  }

  // Check for "not started" (case-insensitive)
  if (statusLower.includes('not started') || statusLower.includes('notstarted') || statusLower.includes('not-started')) {
    return 'Not started';
  }
  
  // Check for "to be initiated" - these should be "Not started"
  // But exclude if it contains "completed" (e.g., "To be initiated and completed within...")
  if ((statusLower.includes('to be initiated') || (statusLower.includes('to be') && statusLower.includes('initiated'))) && 
      !statusLower.includes('completed')) {
    return 'Not started';
  }
  
  // Check for statuses that indicate "not started" - e.g., "To be initiated and completed within..."
  if (statusLower.includes('to be') && !statusLower.includes('completed') && !statusLower.includes('initiated')) {
    return 'Not started';
  }

  // Check for "stalled" (case-insensitive)
  if (statusLower.includes('stalled')) {
    return 'Stalled';
  }

  // Check for "under procurement" (case-insensitive, handles variations)
  if (statusLower.includes('under procurement') || statusLower.includes('procurement')) {
    return 'Under Procurement';
  }

  // Check for "suspended" (case-insensitive)
  if (statusLower.includes('suspended')) {
    return 'Suspended';
  }

  // Default to "Other" for any status that doesn't match the above patterns
  return 'Other';
};

/**
 * Groups an array of status data objects by normalized status.
 * Useful for aggregating status counts in charts.
 * 
 * @param {Array} statusData - Array of objects with status and count/value properties
 * @param {string} statusKey - The key name for the status field (default: 'status' or 'name')
 * @param {string} valueKey - The key name for the value field (default: 'count' or 'value')
 * @returns {Array} - Array of grouped status objects with normalized status names
 */
export const groupStatusesByNormalized = (statusData, statusKey = null, valueKey = null) => {
  if (!Array.isArray(statusData) || statusData.length === 0) {
    return [];
  }

  // Auto-detect keys if not provided
  const firstItem = statusData[0];
  const detectedStatusKey = statusKey || (firstItem.status ? 'status' : firstItem.name ? 'name' : 'status');
  const detectedValueKey = valueKey || (firstItem.count ? 'count' : firstItem.value ? 'value' : 'count');

  // Group by normalized status
  const grouped = statusData.reduce((acc, item) => {
    const originalStatus = item[detectedStatusKey];
    const normalizedStatus = normalizeProjectStatus(originalStatus);
    const value = item[detectedValueKey] || 0;

    if (!acc[normalizedStatus]) {
      acc[normalizedStatus] = {
        name: normalizedStatus,
        value: 0,
        count: 0,
        originalStatuses: [] // Keep track of original statuses for reference
      };
    }

    acc[normalizedStatus].value += value;
    acc[normalizedStatus].count += value;
    
    // Track original status if not already added
    if (!acc[normalizedStatus].originalStatuses.includes(originalStatus)) {
      acc[normalizedStatus].originalStatuses.push(originalStatus);
    }

    return acc;
  }, {});

  // Convert to array and sort by value (descending)
  return Object.values(grouped).sort((a, b) => b.value - a.value);
};

/**
 * Normalizes a single status for display in charts/analytics.
 * This is a convenience wrapper around normalizeProjectStatus.
 * 
 * @param {string} status - The original project status
 * @returns {string} - The normalized status category
 */
export const getNormalizedStatus = normalizeProjectStatus;

