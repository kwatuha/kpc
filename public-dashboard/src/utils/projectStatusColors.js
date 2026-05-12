// src/utils/projectStatusColors.js
import { normalizeProjectStatus } from './projectStatusNormalizer';

const PROJECT_STATUS_COLORS = {
  // Normalized statuses (for charts/analytics)
  'Completed': '#32cd32',        // LimeGreen - Bright Green
  'Ongoing': '#1e90ff',         // DodgerBlue - Bright Blue
  'Not started': '#9e9e9e',     // Medium Gray
  'Stalled': '#ffa500',         // Orange - Bright Orange
  'Under Procurement': '#9370DB', // MediumSlateBlue - Purple (distinct from Ongoing's blue)
  'Suspended': '#e00202',       // Red
  'Other': '#FF1493',           // DeepPink - Bright Magenta/Pink (stands out to indicate uncategorized projects)
  
  // Legacy statuses (for backward compatibility)
  'At Risk': '#b22222',         // FireBrick - Red
  'In Progress': '#1e90ff',      // DodgerBlue - Bright Blue (maps to Ongoing)
  'Initiated': '#6495ED',       // CornflowerBlue
  'Delayed': '#e00202',         // Red
  'Cancelled': '#000000',       // Black
  'Not Started': '#9e9e9e',     // Medium Gray (maps to Not started)
  'Closed': '#228B22',          // ForestGreen
  'Default': '#757575',         // Grey
};

/////////////////////////
// This function determines the background color for a given status (case-insensitive)
export function getProjectStatusBackgroundColor(status) {
  if (!status) return PROJECT_STATUS_COLORS['Default'];
  
  // Use the project status normalizer to ensure consistent status names
  const normalizedStatus = normalizeProjectStatus(status);
  
  // Try exact match first, then normalized match, then default
  return PROJECT_STATUS_COLORS[status] || PROJECT_STATUS_COLORS[normalizedStatus] || PROJECT_STATUS_COLORS['Default'];
}

// This function returns CSS properties for better color rendering
export function getProjectStatusStyle(status) {
  const backgroundColor = getProjectStatusBackgroundColor(status);
  const textColor = getProjectStatusTextColor(status);
  
  return {
    backgroundColor,
    color: textColor,
    // Ensure consistent color rendering across browsers
    WebkitColorAdjust: 'exact',
    colorAdjust: 'exact',
    // Force hardware acceleration for better rendering
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    // Ensure colors are not affected by parent opacity
    isolation: 'isolate'
  };
}

// This function determines the text color based on the background color for readability
export function getProjectStatusTextColor(status) {
  const bgColor = getProjectStatusBackgroundColor(status);

  // Determine if background is dark or light to pick appropriate text color
  // Simple heuristic: sum of R, G, B values. If low, it's dark; if high, it's light.
  // This is a simplified check and might not be perfect for all colors.
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const { r, g, b } = hexToRgb(bgColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 180 ? 'black' : 'white'; // Use black text for light backgrounds, white for dark
}
















