/**
 * Client-specific navigation chrome: ribbon tabs + section sidebar vs full AdminLTE-style tree.
 * Default layout is tree; override with VITE_NAV_LAYOUT_MODE=ribbon|tree or localStorage (see NavigationLayoutContext).
 */
export const NAV_LAYOUT_STORAGE_KEY = 'mcmmes.navigationLayoutMode';

export const NAV_LAYOUT_MODES = {
  /** Top ribbon categories; sidebar shows only that category’s links (opt-in via env or user toggle). */
  RIBBON: 'ribbon',
  /** CIMES-style: all categories in the sidebar as expandable groups; ribbon hidden. */
  TREE: 'tree',
};

export function getDefaultNavigationLayoutMode() {
  const env = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_NAV_LAYOUT_MODE : undefined;
  if (env === NAV_LAYOUT_MODES.TREE || env === NAV_LAYOUT_MODES.RIBBON) return env;
  return NAV_LAYOUT_MODES.TREE;
}

export function readStoredNavigationLayoutMode() {
  try {
    const v = localStorage.getItem(NAV_LAYOUT_STORAGE_KEY);
    if (v === NAV_LAYOUT_MODES.TREE || v === NAV_LAYOUT_MODES.RIBBON) return v;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Canonical KEMRI nav order (used by both ribbon tabs and tree sidebar):
 *
 *   Research → Dashboards → Reports → Data → Settings
 *
 * Research (KIMES study lifecycle) leads because it is the system's reason
 * for existing — not a bolt-on module. Settings (admin/reference data) is
 * deliberately last. The legacy county-government categories (management,
 * reporting, finance, monitoring, procurement, hr, public) remain in the
 * list so they keep their relative order if anyone un-hides them, but they
 * all have `hidden: true` in menuConfig.json and never appear in the UI.
 */
export const TREE_MENU_CATEGORY_ORDER = [
  'kimes',         // Research & M&E — first
  'dashboard',
  'reports',
  'data',
  // legacy county-government modules (all hidden:true today)
  'management',
  'reporting',
  'finance',
  'monitoring',
  'procurement',
  'hr',
  'public',
  'admin',         // Settings — last
];

/** Same category order for ribbon tabs and tree sidebar (unknown ids sort last). */
export function sortMenuCategoriesForNav(categories) {
  if (!Array.isArray(categories)) return [];
  const orderIndex = (id) => {
    const i = TREE_MENU_CATEGORY_ORDER.indexOf(id);
    return i === -1 ? 999 : i;
  };
  return [...categories].sort((a, b) => orderIndex(a.id) - orderIndex(b.id));
}

/** Ribbon / sidebar header: match tree group titles when `labelTree` is set. */
export function categoryNavLabel(category) {
  if (!category) return '';
  return category.labelTree || category.label || '';
}
