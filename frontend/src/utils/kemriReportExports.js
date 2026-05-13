/**
 * KEMRI / KIMES Report Library exports.
 *
 * Produces a research-studies register (Excel) and an executive summary (PDF)
 * driven entirely by `kemri_research_projects` data via `kemriService.listProjects`.
 *
 * Replaces the legacy Machakos county M&E exports (`meReportExports.js`) which
 * were keyed on sub-counties / wards / departments — those concepts do not
 * apply to KEMRI. The sheets below mirror the natural KEMRI dimensions:
 * centre, donor, FY, SERU/NACOSTI compliance.
 */
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const text = (v) => (v == null ? '' : String(v));

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const numberOrBlank = (v) => {
  if (v == null || v === '') return '';
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
};

const daysUntil = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.round(ms / 86_400_000);
};

const titleCase = (s) =>
  text(s)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

const joinList = (v) => {
  if (Array.isArray(v)) return v.filter(Boolean).join(', ');
  if (v && typeof v === 'object') {
    try {
      return Object.values(v).filter(Boolean).join(', ');
    } catch {
      return '';
    }
  }
  return text(v);
};

// ---------------------------------------------------------------------------
// Normalisation buckets
// ---------------------------------------------------------------------------

/** KEMRI study status taxonomy (kemri_research_projects.status). */
export function normalizeKemriStatus(raw) {
  const s = text(raw).trim().toLowerCase();
  if (!s) return 'Other';
  if (s.includes('pre')) return 'Pre-study';
  if (s.includes('active') || s.includes('progress') || s.includes('ongoing')) return 'Active';
  if (s.includes('hold') || s.includes('paused')) return 'On hold';
  if (s.includes('close') && s.includes('out')) return 'Closing';
  if (s.includes('closing')) return 'Closing';
  if (s.includes('closed')) return 'Closed';
  if (s.includes('complete')) return 'Completed';
  if (s.includes('terminate') || s.includes('cancel')) return 'Terminated';
  return titleCase(s);
}

const STATUS_ORDER = ['Pre-study', 'Active', 'On hold', 'Closing', 'Closed', 'Completed', 'Terminated', 'Other'];

const normalizeRag = (raw) => {
  const s = text(raw).trim().toLowerCase();
  if (!s) return 'N/A';
  if (s.startsWith('g')) return 'Green';
  if (s.startsWith('a') || s.startsWith('y')) return 'Amber';
  if (s.startsWith('r')) return 'Red';
  if (s.includes('pend')) return 'Pending';
  return titleCase(s);
};

const RAG_ORDER = ['Green', 'Amber', 'Red', 'Pending', 'N/A'];

// ---------------------------------------------------------------------------
// Column definition for the master Studies sheet
// ---------------------------------------------------------------------------

const STUDY_HEADERS = [
  '#',
  'KIMES Project ID',
  'Title',
  'Short name',
  'Centre',
  'Programme',
  'Programme area',
  'Research priority',
  'Project type',
  'Study type',
  'Primary donor',
  'Funding mechanism',
  'Funding amount',
  'Currency',
  'Grant / Contract no.',
  'KEMRI legal no.',
  'SERU approval no.',
  'SERU approval date',
  'SERU expiry date',
  'NACOSTI approval no.',
  'NACOSTI approval date',
  'Proposed start',
  'Proposed end',
  'Actual start',
  'Status',
  'RAG',
  'Current phase',
  'Primary org',
  'Country',
  'SDG codes',
  'Vision 2030 codes',
  'National health policy',
  'Strategic plan KRAs',
  'Strategic plan objectives',
  'Created at',
  'Updated at',
];

function buildStudyRow(p, i) {
  return [
    i + 1,
    text(p.kimesProjectId),
    text(p.title),
    text(p.shortName),
    text(p.centreName),
    text(p.programmeName),
    text(p.programmeArea),
    text(p.researchPriority),
    text(p.projectType),
    text(p.studyType),
    text(p.primaryDonorName),
    text(p.fundingMechanism),
    numberOrBlank(p.fundingAmount),
    text(p.fundingCurrency || (p.fundingAmount ? 'USD' : '')),
    text(p.grantNumber || p.contractNumber),
    text(p.kemriLegalNumber),
    text(p.seruApprovalNo),
    formatDate(p.seruApprovalDate),
    formatDate(p.seruExpiryDate),
    text(p.nacostiApprovalNo),
    formatDate(p.nacostiApprovalDate),
    formatDate(p.proposedStartDate),
    formatDate(p.proposedEndDate),
    formatDate(p.actualStartDate),
    normalizeKemriStatus(p.status),
    normalizeRag(p.ragStatus),
    text(p.currentPhase),
    text(p.primaryOrg),
    text(p.primaryOrgCountry),
    joinList(p.sdgCodes),
    joinList(p.vision2030Codes),
    text(p.nationalHealthPolicy),
    joinList(p.strategicPlanKras),
    joinList(p.strategicPlanObjectives),
    formatDate(p.createdAt),
    formatDate(p.updatedAt),
  ];
}

// ---------------------------------------------------------------------------
// Summary aggregations
// ---------------------------------------------------------------------------

function tally(rows, keyFn) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r) || '(unspecified)';
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

function buildStatusSummary(rows) {
  const counts = tally(rows, (r) => normalizeKemriStatus(r.status));
  const fundingByStatus = new Map();
  for (const r of rows) {
    const k = normalizeKemriStatus(r.status);
    fundingByStatus.set(k, (fundingByStatus.get(k) || 0) + num(r.fundingAmount));
  }
  const knownOrder = STATUS_ORDER.filter((k) => counts.has(k));
  const extras = [...counts.keys()].filter((k) => !STATUS_ORDER.includes(k)).sort();
  return [...knownOrder, ...extras].map((k) => ({
    status: k,
    count: counts.get(k) || 0,
    funding: Number((fundingByStatus.get(k) || 0).toFixed(2)),
  }));
}

function buildRagSummary(rows) {
  const counts = tally(rows, (r) => normalizeRag(r.ragStatus));
  const knownOrder = RAG_ORDER.filter((k) => counts.has(k));
  const extras = [...counts.keys()].filter((k) => !RAG_ORDER.includes(k)).sort();
  return [...knownOrder, ...extras].map((k) => ({ rag: k, count: counts.get(k) }));
}

function buildCentreSummary(rows) {
  const m = new Map();
  for (const r of rows) {
    const k = text(r.centreName) || '(unassigned)';
    const e = m.get(k) || { centre: k, studies: 0, active: 0, funding: 0 };
    e.studies += 1;
    if (normalizeKemriStatus(r.status) === 'Active') e.active += 1;
    e.funding += num(r.fundingAmount);
    m.set(k, e);
  }
  return [...m.values()]
    .map((e) => ({ ...e, funding: Number(e.funding.toFixed(2)) }))
    .sort((a, b) => b.studies - a.studies || a.centre.localeCompare(b.centre));
}

function buildDonorSummary(rows) {
  const m = new Map();
  for (const r of rows) {
    const k = text(r.primaryDonorName) || '(unknown / internal)';
    const e = m.get(k) || { donor: k, studies: 0, funding: 0, grants: new Set() };
    e.studies += 1;
    e.funding += num(r.fundingAmount);
    const g = text(r.grantNumber || r.contractNumber).trim();
    if (g) e.grants.add(g);
    m.set(k, e);
  }
  return [...m.values()]
    .map((e) => ({
      donor: e.donor,
      studies: e.studies,
      funding: Number(e.funding.toFixed(2)),
      grants: [...e.grants].join(', '),
    }))
    .sort((a, b) => b.funding - a.funding || a.donor.localeCompare(b.donor));
}

function buildYearlySummary(rows) {
  const m = new Map();
  for (const r of rows) {
    const startYear = (() => {
      if (r.proposedStartDate) {
        const d = new Date(r.proposedStartDate);
        if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
      }
      if (r.actualStartDate) {
        const d = new Date(r.actualStartDate);
        if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
      }
      return '(unspecified)';
    })();
    const e = m.get(startYear) || {
      year: startYear,
      preStudy: 0,
      active: 0,
      onHold: 0,
      closingOrClosed: 0,
      completed: 0,
      other: 0,
      funding: 0,
    };
    const status = normalizeKemriStatus(r.status);
    if (status === 'Pre-study') e.preStudy += 1;
    else if (status === 'Active') e.active += 1;
    else if (status === 'On hold') e.onHold += 1;
    else if (status === 'Closing' || status === 'Closed') e.closingOrClosed += 1;
    else if (status === 'Completed') e.completed += 1;
    else e.other += 1;
    e.funding += num(r.fundingAmount);
    m.set(startYear, e);
  }
  return [...m.values()]
    .map((e) => ({ ...e, funding: Number(e.funding.toFixed(2)) }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

function buildComplianceWatchlist(rows) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const out = {
    seruExpired: [],
    seruExpiring90: [],
    seruExpiring180: [],
    seruExpiring365: [],
    seruMissing: [],
    nacostiMissing: [],
  };

  for (const r of rows) {
    const seruDays = daysUntil(r.seruExpiryDate);
    if (!r.seruApprovalNo) {
      out.seruMissing.push(r);
    } else if (seruDays != null) {
      if (seruDays < 0) out.seruExpired.push(r);
      else if (seruDays <= 90) out.seruExpiring90.push(r);
      else if (seruDays <= 180) out.seruExpiring180.push(r);
      else if (seruDays <= 365) out.seruExpiring365.push(r);
    }
    if (!r.nacostiApprovalNo) out.nacostiMissing.push(r);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Excel — multi-sheet workbook
// ---------------------------------------------------------------------------

const MONEY_FMT = '#,##0';

function applyColWidths(sheet, widths) {
  sheet['!cols'] = widths.map((w) => ({ wch: w }));
}

function applyMoneyColumn(sheet, colIndex, headerRows = 1) {
  // SheetJS doesn't carry through numFmt unless cell objects exist. Walk the
  // range and decorate numeric cells in the requested column.
  const ref = sheet['!ref'];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  for (let r = headerRows; r <= range.e.r; r += 1) {
    const addr = XLSX.utils.encode_cell({ r, c: colIndex });
    const cell = sheet[addr];
    if (cell && typeof cell.v === 'number') {
      cell.t = 'n';
      cell.z = MONEY_FMT;
    }
  }
}

function appendSheet(wb, name, aoa, widths, moneyCols = []) {
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  if (widths) applyColWidths(sheet, widths);
  for (const c of moneyCols) applyMoneyColumn(sheet, c, 1);
  XLSX.utils.book_append_sheet(wb, sheet, name);
  return sheet;
}

/**
 * Build & download the KEMRI research studies register (`.xlsx`).
 *
 * Sheets:
 *   1. Studies     — one row per kemri_research_project (~36 columns)
 *   2. Summary     — counts by status + RAG + project type + totals
 *   3. Centres     — studies & funding per centre
 *   4. Donors      — studies & funding per primary donor
 *   5. Yearly      — studies & status mix per start-year
 *   6. Compliance  — SERU / NACOSTI watchlist
 */
export async function exportKemriStudiesExcel(rows) {
  const list = Array.isArray(rows) ? rows.slice() : [];
  list.sort((a, b) => {
    const ay = (a.proposedStartDate || a.createdAt || '').slice(0, 10);
    const by = (b.proposedStartDate || b.createdAt || '').slice(0, 10);
    return by.localeCompare(ay) || text(a.kimesProjectId).localeCompare(text(b.kimesProjectId));
  });

  const wb = XLSX.utils.book_new();

  // ---- 1. Studies (master list) ----
  const studyAoa = [STUDY_HEADERS, ...list.map((p, i) => buildStudyRow(p, i))];
  const studyWidths = STUDY_HEADERS.map((h) => {
    if (h === 'Title') return 48;
    if (h === 'Short name') return 24;
    if (h === 'Centre') return 38;
    if (h === 'Primary donor') return 38;
    if (h === 'Programme' || h === 'Programme area') return 28;
    if (h === 'Strategic plan KRAs' || h === 'Strategic plan objectives') return 36;
    if (h === 'National health policy') return 36;
    if (h === '#') return 5;
    if (h.includes('date') || h.includes('Updated') || h.includes('Created')) return 14;
    if (h.toLowerCase().includes('amount')) return 16;
    return 18;
  });
  appendSheet(wb, 'Studies', studyAoa, studyWidths, [STUDY_HEADERS.indexOf('Funding amount')]);

  // ---- 2. Summary ----
  const status = buildStatusSummary(list);
  const rag = buildRagSummary(list);
  const projectType = [...tally(list, (r) => text(r.projectType) || '(unspecified)').entries()]
    .map(([k, v]) => [titleCase(k), v])
    .sort((a, b) => b[1] - a[1]);
  const totalFunding = list.reduce((s, r) => s + num(r.fundingAmount), 0);
  const summaryAoa = [
    ['KEMRI Research Studies — Executive Summary'],
    ['Generated', new Date().toLocaleString()],
    ['Total studies', list.length],
    ['Total funding (sum of primary grants)', Number(totalFunding.toFixed(2))],
    [],
    ['By status', '', 'Funding (sum)'],
    ...status.map((s) => [s.status, s.count, s.funding]),
    ['Total', list.length, Number(totalFunding.toFixed(2))],
    [],
    ['By RAG status'],
    ...rag.map((r) => [r.rag, r.count]),
    [],
    ['By project type'],
    ...projectType,
  ];
  const sumSheet = appendSheet(wb, 'Summary', summaryAoa, [42, 16, 20]);
  // Format the funding column (index 2) on rows after the headline blocks
  applyMoneyColumn(sumSheet, 2, 5);

  // ---- 3. Centres ----
  const centres = buildCentreSummary(list);
  const centreAoa = [
    ['Centre', 'Studies', 'Active', 'Total funding'],
    ...centres.map((c) => [c.centre, c.studies, c.active, c.funding]),
    [
      'Total',
      centres.reduce((s, c) => s + c.studies, 0),
      centres.reduce((s, c) => s + c.active, 0),
      Number(centres.reduce((s, c) => s + c.funding, 0).toFixed(2)),
    ],
  ];
  appendSheet(wb, 'Centres', centreAoa, [42, 10, 10, 18], [3]);

  // ---- 4. Donors ----
  const donors = buildDonorSummary(list);
  const donorAoa = [
    ['Primary donor', 'Studies', 'Total funding', 'Grant / contract numbers'],
    ...donors.map((d) => [d.donor, d.studies, d.funding, d.grants]),
    [
      'Total',
      donors.reduce((s, d) => s + d.studies, 0),
      Number(donors.reduce((s, d) => s + d.funding, 0).toFixed(2)),
      '',
    ],
  ];
  appendSheet(wb, 'Donors', donorAoa, [44, 10, 18, 60], [2]);

  // ---- 5. Yearly ----
  const yearly = buildYearlySummary(list);
  const yearlyAoa = [
    ['Start year', 'Pre-study', 'Active', 'On hold', 'Closing / closed', 'Completed', 'Other', 'Total', 'Funding'],
    ...yearly.map((y) => [
      y.year,
      y.preStudy,
      y.active,
      y.onHold,
      y.closingOrClosed,
      y.completed,
      y.other,
      y.preStudy + y.active + y.onHold + y.closingOrClosed + y.completed + y.other,
      y.funding,
    ]),
  ];
  appendSheet(wb, 'Yearly', yearlyAoa, [14, 12, 10, 10, 18, 12, 10, 10, 18], [8]);

  // ---- 6. Compliance watchlist ----
  const w = buildComplianceWatchlist(list);
  const complianceAoa = [
    ['KEMRI compliance watchlist (SERU & NACOSTI)'],
    [
      'Bucket',
      'KIMES ID',
      'Title',
      'Centre',
      'SERU approval no.',
      'SERU expiry',
      'Days to expiry',
      'NACOSTI no.',
    ],
  ];
  const pushBucket = (label, items) => {
    if (!items.length) {
      complianceAoa.push([label, '— none —', '', '', '', '', '', '']);
      return;
    }
    for (const r of items) {
      const exp = formatDate(r.seruExpiryDate);
      complianceAoa.push([
        label,
        text(r.kimesProjectId),
        text(r.title),
        text(r.centreName),
        text(r.seruApprovalNo),
        exp,
        exp ? daysUntil(r.seruExpiryDate) : '',
        text(r.nacostiApprovalNo),
      ]);
    }
  };
  pushBucket('SERU expired', w.seruExpired);
  pushBucket('SERU expiring ≤ 90d', w.seruExpiring90);
  pushBucket('SERU expiring ≤ 180d', w.seruExpiring180);
  pushBucket('SERU expiring ≤ 365d', w.seruExpiring365);
  pushBucket('SERU not yet approved', w.seruMissing);
  pushBucket('NACOSTI not yet approved', w.nacostiMissing);
  appendSheet(wb, 'Compliance', complianceAoa, [26, 24, 48, 36, 22, 14, 14, 22]);

  const fileName = `kemri_research_register_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ---------------------------------------------------------------------------
// PDF — executive summary (landscape A4)
// ---------------------------------------------------------------------------

const PDF_BRAND = [16, 90, 70]; // dark KEMRI green
const PDF_SUB = [70, 100, 140];

/**
 * Build & download the KEMRI executive summary PDF.
 * Format: A4 landscape — totals, status mix, RAG, centre & donor breakdowns,
 * yearly view, and a SERU expiry watchlist.
 */
export function exportKemriStudiesPdfSummary(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const status = buildStatusSummary(list);
  const rag = buildRagSummary(list);
  const centres = buildCentreSummary(list);
  const donors = buildDonorSummary(list);
  const yearly = buildYearlySummary(list);
  const watchlist = buildComplianceWatchlist(list);
  const totalFunding = list.reduce((s, r) => s + num(r.fundingAmount), 0);

  const doc = new jsPDF('landscape', 'pt', 'a4');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KEMRI Research Studies — Executive Summary', 36, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 36, 52);
  doc.text(
    `Total studies: ${list.length}   ·   Total funding (primary grants): USD ${totalFunding.toLocaleString()}`,
    36,
    66
  );

  const baseTable = {
    margin: { left: 36, right: 36 },
    styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: PDF_BRAND, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  };

  autoTable(doc, {
    ...baseTable,
    head: [['Status', 'Studies', 'Funding (USD)']],
    body: [
      ...status.map((s) => [s.status, s.count, s.funding.toLocaleString()]),
      [
        { content: 'Total', styles: { fontStyle: 'bold' } },
        { content: list.length, styles: { fontStyle: 'bold' } },
        { content: totalFunding.toLocaleString(), styles: { fontStyle: 'bold' } },
      ],
    ],
    startY: 84,
  });

  autoTable(doc, {
    ...baseTable,
    head: [['RAG status', 'Studies']],
    body: rag.map((r) => [r.rag, r.count]),
    startY: (doc.lastAutoTable?.finalY || 100) + 14,
    headStyles: { ...baseTable.headStyles, fillColor: PDF_SUB },
  });

  autoTable(doc, {
    ...baseTable,
    head: [['Centre', 'Studies', 'Active', 'Funding (USD)']],
    body: centres.map((c) => [
      c.centre,
      c.studies,
      c.active,
      c.funding.toLocaleString(),
    ]),
    startY: (doc.lastAutoTable?.finalY || 140) + 14,
    headStyles: { ...baseTable.headStyles, fillColor: PDF_SUB },
    columnStyles: { 0: { cellWidth: 280 } },
  });

  autoTable(doc, {
    ...baseTable,
    head: [['Primary donor', 'Studies', 'Funding (USD)']],
    body: donors.map((d) => [d.donor, d.studies, d.funding.toLocaleString()]),
    startY: (doc.lastAutoTable?.finalY || 180) + 14,
    headStyles: { ...baseTable.headStyles, fillColor: PDF_SUB },
    columnStyles: { 0: { cellWidth: 320 } },
  });

  autoTable(doc, {
    ...baseTable,
    head: [
      [
        'Start year',
        'Pre-study',
        'Active',
        'On hold',
        'Closing / closed',
        'Completed',
        'Other',
        'Total',
        'Funding (USD)',
      ],
    ],
    body: yearly.map((y) => [
      y.year,
      y.preStudy,
      y.active,
      y.onHold,
      y.closingOrClosed,
      y.completed,
      y.other,
      y.preStudy + y.active + y.onHold + y.closingOrClosed + y.completed + y.other,
      y.funding.toLocaleString(),
    ]),
    startY: (doc.lastAutoTable?.finalY || 220) + 14,
    headStyles: { ...baseTable.headStyles, fillColor: PDF_SUB },
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
  });

  // SERU compliance watchlist: only render rows that exist
  const watchRows = [];
  const pushBucket = (label, items, color) => {
    for (const r of items) {
      watchRows.push([
        { content: label, styles: { fillColor: color, textColor: 0, fontStyle: 'bold' } },
        text(r.kimesProjectId),
        text(r.title),
        text(r.centreName),
        formatDate(r.seruExpiryDate),
        formatDate(r.seruExpiryDate) ? `${daysUntil(r.seruExpiryDate)}` : '',
      ]);
    }
  };
  pushBucket('Expired', watchlist.seruExpired, [255, 199, 199]);
  pushBucket('≤ 90d', watchlist.seruExpiring90, [255, 224, 178]);
  pushBucket('≤ 180d', watchlist.seruExpiring180, [255, 243, 191]);
  pushBucket('≤ 365d', watchlist.seruExpiring365, [225, 245, 254]);
  if (watchRows.length) {
    autoTable(doc, {
      ...baseTable,
      head: [['Bucket', 'KIMES ID', 'Title', 'Centre', 'SERU expiry', 'Days to expiry']],
      body: watchRows,
      startY: (doc.lastAutoTable?.finalY || 260) + 14,
      headStyles: { ...baseTable.headStyles, fillColor: [170, 60, 50] },
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: { 2: { cellWidth: 260 }, 3: { cellWidth: 180 } },
    });
  }

  // Footer page numbers (jsPDF doesn't auto-add them across multi-page tables)
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 18);
  }

  doc.save(`kemri_research_register_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ---------------------------------------------------------------------------
// Pure helpers exposed for tests / preview UIs
// ---------------------------------------------------------------------------

export const __testables = {
  buildStudyRow,
  buildStatusSummary,
  buildRagSummary,
  buildCentreSummary,
  buildDonorSummary,
  buildYearlySummary,
  buildComplianceWatchlist,
  normalizeKemriStatus,
};
