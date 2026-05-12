import {
  displayNameFromAlias,
  rawRegistrySectorFromProject,
} from './organizationChartLabels';

function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s) {
  return norm(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

/**
 * Treats a project as voided when an explicit flag is set or the raw status clearly indicates voided.
 * Does not infer from normalized status buckets.
 */
export function isVoidedProject(project) {
  if (!project || typeof project !== 'object') return false;
  const flags = project.voided ?? project.isVoided ?? project.is_voided;
  if (flags === true || flags === 1 || flags === '1' || String(flags).toLowerCase() === 'true') return true;
  const raw = String(project.status ?? project.Status ?? '').trim();
  if (!raw) return false;
  const low = raw.toLowerCase();
  if (low.includes('voided') || low === 'void') return true;
  return false;
}

function haystackForSuggestions(project) {
  const rawSector = rawRegistrySectorFromProject(project);
  const parts = [
    rawSector,
    project.projectName,
    project.project_name,
    project.ministry,
    project.ministryName,
    project.stateDepartment,
    project.state_department,
    project.department,
    project.departmentName,
    project.directorate,
    project.directorateName,
    project.agency,
  ];
  return parts.filter((p) => p != null && String(p).trim() !== '').join(' ');
}

/**
 * Lightweight suggestions: substring / token overlap between registry sector names (and aliases)
 * and the project's free-text sector plus organization / title context. Not a DB join.
 */
export function suggestPossibleRegistrySectors(project, sectors, { limit = 3 } = {}) {
  const hay = haystackForSuggestions(project);
  const hayNorm = norm(hay);
  const hayTok = tokens(hay);
  if (!sectors || !sectors.length || (!hayNorm && !hayTok.length)) return [];

  const scored = [];
  (sectors || []).forEach((s) => {
    if (!s || typeof s !== 'object') return;
    const name = (s.sectorName || s.name || '').trim();
    if (!name) return;
    const disp = displayNameFromAlias(s.alias, name);
    const nameNorm = norm(name);
    const aliasNorm = norm(s.alias || '');
    let score = 0;

    if (nameNorm && hayNorm) {
      if (hayNorm.includes(nameNorm) || nameNorm.includes(hayNorm)) score += 45;
    }
    if (aliasNorm && hayNorm) {
      if (hayNorm.includes(aliasNorm) || aliasNorm.includes(hayNorm)) score += 38;
    }

    const nameTok = tokens(name);
    const aliasTok = tokens(s.alias || '');
    for (const t of nameTok) {
      if (hayTok.includes(t)) score += 10;
    }
    for (const t of aliasTok) {
      if (hayTok.includes(t)) score += 8;
    }

    if (score > 0) scored.push({ label: disp, canonical: name, score });
  });

  scored.sort((a, b) => b.score - a.score);
  const seen = new Set();
  const out = [];
  for (const row of scored) {
    if (seen.has(row.canonical)) continue;
    seen.add(row.canonical);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}
