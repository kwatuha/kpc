// src/utils/statusColors.js

const PROJECT_STATUS_COLORS = {
  'At Risk': '#b22222',
  'In Progress': '#1e90ff',
  'Completed': '#32cd32',
  'Initiated': '#add8e6',
  'Stalled': '#ffa500',
  'Delayed': '#e00202',
  'Cancelled': '#000000',
  'Closed': '#145a32',
  // You might want a default color for statuses not explicitly listed
  'Default': '#cccccc', // Light grey
};

export function getProjectStatusColor(status) {
  if (!status) return PROJECT_STATUS_COLORS['Default'];
  
  // Normalize status to title case for consistent matching
  const normalizeStatus = (s) => {
    if (!s) return '';
    return s.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const normalizedStatus = normalizeStatus(status);
  
  // Try exact match first, then normalized match
  return PROJECT_STATUS_COLORS[status] || PROJECT_STATUS_COLORS[normalizedStatus] || PROJECT_STATUS_COLORS['Default'];
}