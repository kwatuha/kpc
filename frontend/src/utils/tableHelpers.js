// --- Permissions Helper ---
/**
 * Helper function to check if the user has a specific privilege.
 * @param {object | null} user - The user object from AuthContext.
 * @param {string} privilegeName - The name of the privilege to check.
 * @returns {boolean} True if the user has the privilege, false otherwise.
 */
export const checkUserPrivilege = (user, privilegeName) => {
  return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
};

// --- Sorting Helpers ---
/**
 * Compares two objects for sorting in descending order.
 * Handles different data types gracefully (strings, numbers, dates).
 */
function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy] === null || a[orderBy] === undefined ? '' : a[orderBy];
  let valB = b[orderBy] === null || b[orderBy] === undefined ? '' : b[orderBy];

  if (orderBy.includes('Date')) {
    valA = valA ? new Date(valA) : null;
    valB = valB ? new Date(valB) : null;
  } else if (!isNaN(parseFloat(valA)) && isFinite(valA) && !isNaN(parseFloat(valB)) && isFinite(valB)) {
    valA = parseFloat(valA);
    valB = parseFloat(valB);
  } else if (typeof valA === 'string' && typeof valB === 'string') {
    valA = valA.toLowerCase();
    valB = valB.toLowerCase();
  }

  if (valB < valA) {
    return -1;
  }
  if (valB > valA) {
    return 1;
  }
  return 0;
}

/**
 * A factory function that returns a comparator for the given order and property.
 */
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Sorts an array of objects while maintaining the original order for equal elements.
 */
export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// --- Formatting Helpers ---
/**
 * Formats a number as KES currency.
 */
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number with a maximum of 2 decimal places.
 */
export const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// --- Status Color Helpers ---
// Import and re-export the normalized status color functions for consistency
import { 
  getProjectStatusBackgroundColor as getNormalizedStatusBgColor,
  getProjectStatusTextColor as getNormalizedStatusTextColor
} from './projectStatusColors';

/**
 * Returns the background color for a given project status using normalized status colors.
 * This ensures consistency across the application.
 */
export const getProjectStatusBackgroundColor = getNormalizedStatusBgColor;

/**
 * Returns the text color for a given project status using normalized status colors.
 * This ensures consistency across the application.
 */
export const getProjectStatusTextColor = getNormalizedStatusTextColor;

/**
 * Format status to sentence case (Title Case) for better display
 */
export const formatStatus = (status) => {
  if (!status) return '';
  
  // Convert to title case: first letter of each word capitalized, rest lowercase
  return status
    .toLowerCase()
    .split(' ')
    .map((word, index, array) => {
      // Handle special cases like "I", "II", "III", "IV" in phased statuses
      // Check if previous word is "phase" to identify Roman numerals
      const isRomanNumeral = (index > 0 && array[index - 1] === 'phase') && 
                             (word === 'i' || word === 'ii' || word === 'iii' || word === 'iv');
      
      if (isRomanNumeral) {
        return word.toUpperCase();
      }
      
      // Handle words in parentheses - capitalize first letter after opening paren
      if (word.startsWith('(')) {
        const afterParen = word.slice(1);
        return '(' + afterParen.charAt(0).toUpperCase() + afterParen.slice(1);
      }
      
      // Capitalize first letter of word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};