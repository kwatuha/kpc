// Import normalized status utilities
import { normalizeProjectStatus } from './projectStatusNormalizer';
import { getProjectStatusBackgroundColor } from './projectStatusColors';

// Format currency in KES (Kenyan Shillings)
export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Ksh 0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format number with commas, no currency symbol
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  
  return `Ksh ${formatted}`;
};

// Format large numbers with commas
export const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  return new Intl.NumberFormat('en-US').format(number);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Format percentage
export const formatPercentage = (value) => {
  if (!value || value === 0) return '0%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
};

// Get status color using normalized status (case-insensitive)
export const getStatusColor = (status) => {
  if (!status) return '#757575';
  
  // Use the normalized status color function
  return getProjectStatusBackgroundColor(status);
};

// Format status to title case for display (preserves original status, doesn't normalize)
export const formatStatus = (status) => {
  if (!status) return '';
  
  // Convert original status to title case for display (preserve original value)
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

// Format normalized status for grouping/analytics (use this for charts and counts)
export const formatNormalizedStatus = (status) => {
  if (!status) return '';
  
  // Use normalized status for consistent display in charts/analytics
  const normalizedStatus = normalizeProjectStatus(status);
  
  // Convert normalized status to title case for display
  return normalizedStatus
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

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};


