/**
 * Small KEMRI/KIMES display helpers shared across the new pages.
 * Keep these display-only — no business logic should leak in here.
 */

const RAG_PALETTE = {
  green:   { hex: '#2e7d32', label: 'Green',   chipColor: 'success' },
  amber:   { hex: '#ed6c02', label: 'Amber',   chipColor: 'warning' },
  red:     { hex: '#c62828', label: 'Red',     chipColor: 'error' },
  pending: { hex: '#90a4ae', label: 'Pending', chipColor: 'default' },
};

export const ragMeta = (rag) => RAG_PALETTE[(rag || 'pending').toLowerCase()] || RAG_PALETTE.pending;

/**
 * Format a numeric amount in a currency. Uses Intl when available with a
 * graceful fallback so SSR / older browsers never crash.
 */
export const formatCurrency = (value, currency = 'KES', { compact = false } = {}) => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: (currency || 'KES').toUpperCase(),
      maximumFractionDigits: compact ? 1 : 0,
      notation: compact ? 'compact' : 'standard',
    }).format(n);
  } catch (_) {
    return `${currency || 'KES'} ${n.toLocaleString()}`;
  }
};

/** Display-friendly numeric percentage with `%` suffix and a sane fallback. */
export const formatPercent = (value, { fractionDigits = 1 } = {}) => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(fractionDigits)}%`;
};

/**
 * Budget utilisation = expenditure / budget * 100. Easier to reason about than
 * the underlying budget variance percentage and matches what KEMRI Centre
 * Directors actually want to see in the review dialog.
 */
export const computeUtilisation = (expenditure, budget) => {
  const e = Number(expenditure);
  const b = Number(budget);
  if (!Number.isFinite(e) || !Number.isFinite(b) || b <= 0) return null;
  return Math.round((e / b) * 1000) / 10;
};

/**
 * Reusable MUI `Select` MenuProps so dropdown panels are wide enough for long
 * centre/donor names and don't clip when the field sits in a narrow grid cell.
 */
export const KEMRI_MENU_PROPS = {
  PaperProps: {
    sx: {
      maxHeight: 360,
      minWidth: 320,
      borderRadius: 1.5,
    },
  },
};

export const KEMRI_MENU_PROPS_WIDE = {
  PaperProps: {
    sx: {
      maxHeight: 420,
      minWidth: 480,
      borderRadius: 1.5,
    },
  },
};

/**
 * Pretty phase / status label for chips. Replaces underscores with spaces and
 * sentence-cases the result.
 */
export const humanise = (value) => {
  if (!value) return '';
  const s = String(value).replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
