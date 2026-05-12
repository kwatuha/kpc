/**
 * Filled-form export — KEMRI Research Implementation & Grant Monitoring Tool (v05).
 *
 * Renders every field of `api/adp/kemri_tools.pdf` for a single study, populated
 * from the consolidated `/api/kemri/projects/:id/form-export` payload.
 *
 *   • The on-screen layout is print-ready: clicking "Save as PDF" opens the
 *     browser print dialog with the form sized for A4 letter and the Topbar /
 *     Sidebar suppressed via `@media print` rules.
 *   • Clicking "Download .docx" pulls a server-rendered Word document.
 *   • Sections KIMES does not yet capture render with an italic
 *     "(not captured by KIMES)" caption — the user can still fill them in by
 *     hand on the printed copy.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Divider, Skeleton, Stack, Typography,
} from '@mui/material';
import {
    PrintRounded as PrintIcon,
    DescriptionRounded as DocxIcon,
    DataObjectRounded as JsonIcon,
    InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import kemriService from '../api/kemriService';

// Module-level in-memory cache so navigating back to a study you've already
// loaded is instant.  Stale entries are still returned immediately while a
// background fetch refreshes them (stale-while-revalidate).
const FORM_EXPORT_CACHE = new Map(); // key: projectId, value: { payload, fetchedAt }
const STALE_AFTER_MS = 60_000;       // 60s — long enough to feel instant for tab-hopping, short enough to stay fresh

// ---------------------------------------------------------------------------
//  small helpers
// ---------------------------------------------------------------------------
const fmt = (v) => {
    if (v === null || v === undefined || v === '') return '\u2014';
    if (Array.isArray(v))   return v.length ? v.join(', ') : '\u2014';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
    return String(v);
};

const fmtMoney = (v, cur) => {
    if (v === null || v === undefined || v === '') return '\u2014';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return `${cur || ''} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`.trim();
};

// ---------------------------------------------------------------------------
//  Layout primitives
// ---------------------------------------------------------------------------

const SectionHeading = ({ n, title }) => (
    <Box sx={{ mt: 4, mb: 1.5, pb: 0.75, borderBottom: '2px solid', borderColor: '#0F172A' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
            §{n}.&nbsp; {title}
        </Typography>
    </Box>
);

const SubHeading = ({ children }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#6A1B9A', mt: 2, mb: 1 }}>
        {children}
    </Typography>
);

const FieldGrid = ({ rows }) => (
    <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
        rowGap: 0, columnGap: 0,
        border: '1px solid', borderColor: '#E5E7EB', borderRadius: 1,
        '& > .label': { p: 1, bgcolor: '#F9FAFB', fontWeight: 600, borderBottom: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', fontSize: 13 },
        '& > .value': { p: 1, borderBottom: '1px solid #E5E7EB', fontSize: 13 },
        '& > .label:last-of-type': { borderBottom: 0 },
        '& > .value:last-of-type': { borderBottom: 0 },
    }}>
        {rows.map(([label, value], idx) => (
            <React.Fragment key={idx}>
                <Box className="label">{label}</Box>
                <Box className="value">{value === null || value === undefined || value === '' ? '\u2014' : value}</Box>
            </React.Fragment>
        ))}
    </Box>
);

const DataTable = ({ headers, rows, emptyText = 'No data captured yet.' }) => {
    if (!rows || rows.length === 0) {
        return (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#6B7280', mb: 1 }}>{emptyText}</Typography>
        );
    }
    return (
        <Box sx={{ overflowX: 'auto', mb: 1 }}>
            <Box component="table" sx={{
                width: '100%', borderCollapse: 'collapse',
                '& th, & td': { border: '1px solid #D1D5DB', p: 0.75, fontSize: 12, verticalAlign: 'top', textAlign: 'left' },
                '& th': { bgcolor: '#F3F4F6', fontWeight: 700 },
            }}>
                <thead>
                    <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            {r.map((c, j) => <td key={j}>{c === null || c === undefined || c === '' ? '\u2014' : c}</td>)}
                        </tr>
                    ))}
                </tbody>
            </Box>
        </Box>
    );
};

const NotCapturedNote = ({ children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, mb: 1 }}>
        <InfoIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
        <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#6B7280' }}>
            {children}
        </Typography>
    </Box>
);

// ---------------------------------------------------------------------------
//  Main page
// ---------------------------------------------------------------------------

export default function KemriStudyFormExportPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // Seed state from the cache so the second visit renders instantly with no
    // loading state at all (we'll still revalidate in the background).
    const cached = FORM_EXPORT_CACHE.get(id);
    const [data, setData] = useState(cached?.payload || null);
    const [loading, setLoading] = useState(!cached);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [downloadingDocx, setDownloadingDocx] = useState(false);

    const refresh = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        setError(null);
        try {
            const payload = await kemriService.getFormExport(id);
            FORM_EXPORT_CACHE.set(id, { payload, fetchedAt: Date.now() });
            setData(payload);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to build form export');
        } finally {
            if (!silent) setLoading(false); else setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        const entry = FORM_EXPORT_CACHE.get(id);
        if (!entry) {
            // First visit — full load.
            refresh();
        } else if (Date.now() - entry.fetchedAt > STALE_AFTER_MS) {
            // We already painted the cached copy; refresh quietly in the
            // background so the user sees fresh numbers without a spinner.
            refresh({ silent: true });
        }
        // If the cached entry is fresh, do nothing — the seeded state already
        // shows the form.
    }, [id, refresh]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadDocx = async () => {
        if (!data) return;
        setDownloadingDocx(true);
        try {
            const res = await axiosInstance.get(`/kemri/projects/${id}/form-export.docx`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const idTxt = (data.project?.kimesProjectId || `study_${id}`).replace(/[^A-Za-z0-9_.-]/g, '_');
            a.download = `${idTxt}_form_v05.docx`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to download DOCX');
        } finally { setDownloadingDocx(false); }
    };

    const handleDownloadJson = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const idTxt = (data.project?.kimesProjectId || `study_${id}`).replace(/[^A-Za-z0-9_.-]/g, '_');
        a.download = `${idTxt}_form_v05.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    const project = data?.project;
    const totals = useMemo(() => {
        if (!data?.budgetLines) return null;
        return data.budgetLines.reduce((acc, b) => {
            acc.budgeted += Number(b.budgetedAmount || 0);
            acc.expended += Number(b.expenditureToDate || 0);
            return acc;
        }, { budgeted: 0, expended: 0 });
    }, [data]);

    // Skeleton view while we wait for the first payload.  Mirrors the real
    // form layout (action bar → cover card → section blocks) so the page
    // feels instant — the user sees structure immediately and the eye is
    // anchored before the real data drops in.
    if (loading) {
        return (
            <>
                <Box sx={{
                    position: 'sticky', top: 0, zIndex: 5, bgcolor: 'white',
                    borderBottom: 1, borderColor: 'divider', px: { xs: 2, md: 3 }, py: 1.25,
                }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={1}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Skeleton variant="text" width={260} height={28} />
                            <Skeleton variant="text" width={420} height={18} />
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                            <Skeleton variant="rounded" width={88} height={32} />
                            <Skeleton variant="rounded" width={132} height={32} />
                            <Skeleton variant="rounded" width={154} height={32} />
                        </Stack>
                    </Stack>
                </Box>
                <Box sx={{ maxWidth: 980, mx: 'auto', p: { xs: 2, md: 4 } }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Skeleton variant="text" width="70%" height={42} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width="40%" height={18} sx={{ mx: 'auto' }} />
                    </Box>
                    <Skeleton variant="rounded" height={84} sx={{ mb: 3 }} />
                    {[0, 1, 2, 3].map((i) => (
                        <Box key={i} sx={{ mb: 3 }}>
                            <Skeleton variant="text" width="35%" height={32} sx={{ mb: 1 }} />
                            <Skeleton variant="rounded" height={i % 2 === 0 ? 180 : 120} />
                        </Box>
                    ))}
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 2, color: 'text.secondary' }}>
                        <CircularProgress size={14} />
                        <Typography variant="caption">Loading filled form…</Typography>
                    </Stack>
                </Box>
            </>
        );
    }

    if (error && !data) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
            </Box>
        );
    }

    if (!data || !project) return null;

    return (
        <>
            {/* Print rules live globally in src/index.css (`.kimes-print-page`,
                `.kimes-noprint`, `.print-portrait`, `.print-landscape`) so
                every printable page in the app shares the same scoping
                without each one having to re-declare the visibility-trick. */}

            {/* ============= ACTION BAR (suppressed in print) ============= */}
            <Box className="kimes-noprint" sx={{
                position: 'sticky', top: 0, zIndex: 5, bgcolor: 'white', borderBottom: 1, borderColor: 'divider',
                px: { xs: 2, md: 3 }, py: 1.25,
            }}>
                <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={1}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Filled form: {project.kimesProjectId}
                            </Typography>
                            {refreshing && (
                                <Chip
                                    size="small"
                                    icon={<CircularProgress size={10} sx={{ color: 'inherit' }} />}
                                    label="Refreshing…"
                                    sx={{ height: 20 }}
                                />
                            )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            KEMRI Research Implementation &amp; Grant Monitoring Tool, v05 — auto-filled by KIMES on{' '}
                            {(data.generatedAt || '').slice(0, 10)} · {(data._gaps || []).length} fields not yet captured
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                        <Button startIcon={<JsonIcon />} variant="outlined" onClick={handleDownloadJson}>JSON</Button>
                        <Button startIcon={downloadingDocx ? <CircularProgress size={16} /> : <DocxIcon />}
                                onClick={handleDownloadDocx} disabled={downloadingDocx} variant="contained" color="secondary">
                            Download .docx
                        </Button>
                        <Button startIcon={<PrintIcon />} onClick={handlePrint} variant="contained">
                            Print / Save as PDF
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* ============= PRINTABLE PAGE =============
                Sub-groups are wrapped in .print-portrait / .print-landscape
                so the corresponding @page rule applies in print mode.  On
                screen these classes are no-ops — the layout is identical
                to the original single-column rendering. */}
            <Box className="kimes-print-page" sx={{ maxWidth: 980, mx: 'auto', p: { xs: 2, md: 4 }, bgcolor: 'white' }}>
                {/* ───── PORTRAIT GROUP 1: cover + §1 + §2 + §3 intro ───── */}
                <Box className="print-portrait">
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.25, color: '#0F172A' }}>
                        KEMRI Research Implementation & Grant Monitoring Form
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        Version 05 (March 2026) · KIMES Form-Export v1
                    </Typography>
                </Box>

                <Box sx={{ p: 1.5, mb: 3, border: '2px solid #0F172A', borderRadius: 1, bgcolor: '#FFFBEB' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <Box>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>KIMES Project ID</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{project.kimesProjectId}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>Project Title</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                        </Box>
                        <Box>
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <Chip size="small" label={`Status: ${project.status || '—'}`} />
                                <Chip size="small" color={
                                    project.ragStatus === 'green' ? 'success' :
                                    project.ragStatus === 'amber' ? 'warning' :
                                    project.ragStatus === 'red'   ? 'error'   : 'default'
                                } label={`RAG: ${project.ragStatus || 'pending'}`} />
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                {/* §1 GRANT INFO */}
                <SectionHeading n="1" title="Grant Information" />
                <FieldGrid rows={[
                    ['1. Project Type',           fmt(project.projectType)],
                    ['2. Account Number',         fmt(project.accountNumber)],
                    ['3. Project / Study Title',  fmt(project.title)],
                    ['4. Short Name / Acronym',   fmt(project.shortName)],
                    ['5. Principal Investigator', `${fmt(data.piFullName)}  (Payroll No: ${fmt(project.piPayrollNo)})`],
                    ['6. Donor / Funding Agency', fmt(project.primaryDonorName)],
                    ['7A. Funding Amount',        fmtMoney(project.fundingAmount, project.fundingCurrency)],
                    ['7B. Currency',              fmt(project.fundingCurrency)],
                    ['8. Funding mechanism',      fmt(project.fundingMechanism)],
                    ['9. Type of Study',          fmt(project.studyType)],
                    ['10. Contract Type',         fmt(project.contractType)],
                    ['11. Contract Number',       fmt(project.contractNumber)],
                    ['12. Grant Number',          fmt(project.grantNumber)],
                    ['13. KEMRI Legal Number',    fmt(project.kemriLegalNumber)],
                    ['Centre',                    `${fmt(project.centreCode)} — ${fmt(project.centreName)}`],
                    ['Programme',                 fmt(project.programmeName)],
                ]} />
                <NotCapturedNote>Interview Date is not yet captured by KIMES; write it on the printed copy.</NotCapturedNote>

                {/* §2 COMPLIANCE */}
                <SectionHeading n="2" title="Project Compliance" />
                <FieldGrid rows={[
                    ['14. SERU Approval No / Date',    `${fmt(project.seruApprovalNo)} / ${fmt(project.seruApprovalDate)}`],
                    ['15. SERU Expiry / Renewal',      fmt(project.seruExpiryDate)],
                    ['16. NACOSTI Approval No / Date', `${fmt(project.nacostiApprovalNo)} / ${fmt(project.nacostiApprovalDate)}`],
                    ['18. Proposed start date',        fmt(project.proposedStartDate)],
                    ['19. Proposed end date',          fmt(project.proposedEndDate)],
                    ['Actual start date',              fmt(project.actualStartDate)],
                ]} />
                <NotCapturedNote>Multiple SERU renewal dates and the structured "other approvals" list are not yet captured.</NotCapturedNote>

                {/* §3 IMPLEMENTATION header + primary org field-row stays
                    portrait; the lists below break to landscape. */}
                <SectionHeading n="3" title="Project Implementation" />
                <FieldGrid rows={[
                    ['20. Primary Implementing Organization', `${fmt(project.primaryOrg)} (${fmt(project.primaryOrgCountry)})`],
                ]} />
                </Box>{/* ── END portrait group 1 ── */}

                {/* ───── LANDSCAPE GROUP 1: §3 lists + §3.28 indicators ───── */}
                <Box className="print-landscape">
                <SubHeading>22. Implementation Site(s)</SubHeading>
                <DataTable
                    headers={['Site name', 'Country', 'County', 'Sub-county', 'Ward', 'GPS (lat, lng)']}
                    rows={(data.sites || []).map((s) => [
                        fmt(s.siteName), fmt(s.country), fmt(s.county), fmt(s.subCounty), fmt(s.ward),
                        (s.latitude != null && s.longitude != null) ? `${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}` : '\u2014',
                    ])}
                />
                <SubHeading>23. Co-investigator(s)</SubHeading>
                <DataTable
                    headers={['Name', 'Qualification', 'Specialty', 'Institution', 'Role', 'Email']}
                    rows={(data.coinvestigators || []).map((c) => [
                        fmt(c.fullName), fmt(c.qualification), fmt(c.specialty), fmt(c.institution), fmt(c.role), fmt(c.email),
                    ])}
                />
                <SubHeading>24. Project / Study specific Objective(s)</SubHeading>
                <DataTable
                    headers={['#', 'Objective']}
                    rows={(data.objectives || []).map((o) => [String(o.ordinal || ''), fmt(o.description)])}
                />
                <NotCapturedNote>
                    §3.21 other implementing partners, §3.25B delay-reason buckets, §3.26 study variations, and §3.27 monitoring-artefact revisions
                    are not yet first-class fields in KIMES — fill them on the printed copy.
                </NotCapturedNote>

                {/* §3.28 KPIs */}
                <SubHeading>28. Project Indicator Tracking (KPI plan)</SubHeading>
                <DataTable
                    headers={['Code', 'KPI / Indicator', 'Unit', 'Baseline', 'Target', 'Expected output / outcome', 'Frequency']}
                    rows={(data.kpis || []).map((k) => [
                        fmt(k.indicatorCode), fmt(k.indicatorName), fmt(k.unitOfMeasure),
                        fmt(k.baselineValue), fmt(k.targetValue), fmt(k.expectedOutput), fmt(k.reportingFrequency),
                    ])}
                />
                {(data.kpiAchievements || []).length > 0 && (
                    <>
                        <SubHeading>28. KPI achievements per quarter (rolled up from milestone reports)</SubHeading>
                        <DataTable
                            headers={['KPI ID', 'FY', 'Quarter', 'Target', 'Actual', '% achieved', 'Status', 'Comments']}
                            rows={data.kpiAchievements.map((a) => [
                                `#${a.kpiId}`, fmt(a.fyLabel), fmt(a.quarter),
                                fmt(a.targetValue), fmt(a.actualValue),
                                fmt(a.achievementPct), fmt(a.status), fmt(a.narrative),
                            ])}
                        />
                    </>
                )}
                </Box>{/* ── END landscape group 1 ── */}

                {/* ───── PORTRAIT GROUP 2: §4 strategic alignment ───── */}
                <Box className="print-portrait">
                <SectionHeading n="4" title="Project Strategic Alignment" />
                <FieldGrid rows={[
                    ['29. SDG codes',                       fmt(project.sdgCodes)],
                    ['30. Vision 2030 codes',               fmt(project.vision2030Codes)],
                    ['31. National Health Policy',          fmt(project.nationalHealthPolicy)],
                    ['33. KEMRI Strategic Plan KRAs',       fmt(project.strategicPlanKras)],
                    ['33. Strategic Plan Objectives',       fmt(project.strategicPlanObjectives)],
                    ['34. Programme area',                  fmt(project.programmeArea)],
                    ['35. Research priority / disease area',fmt(project.researchPriority)],
                ]} />
                </Box>{/* ── END portrait group 2 ── */}

                {/* ───── LANDSCAPE GROUP 2: §5–§10 wide data tables ───── */}
                <Box className="print-landscape">
                {/* §5 HR */}
                <SectionHeading n="5" title="Project Human Resource" />
                <SubHeading>36–37. Staff involved in the project</SubHeading>
                <DataTable
                    headers={['Role', 'Code', 'Name', 'Qualification', 'FTE', 'Funded by', 'Start', 'End', 'Notes']}
                    rows={(data.staff || []).map((s) => [
                        fmt(s.role), fmt(s.roleCode), fmt(s.staffName), fmt(s.qualification),
                        fmt(s.fte), fmt(s.fundedBy), fmt(s.startDate), fmt(s.endDate), fmt(s.notes),
                    ])}
                />
                <SubHeading>38. Capacity building / training plans</SubHeading>
                <DataTable
                    headers={['Event title', 'Type', 'Start', 'End', 'Location', '# Participants', 'Facilitator', 'Outcome']}
                    rows={(data.capacityBuilding || []).map((c) => [
                        fmt(c.eventTitle), fmt(c.eventType), fmt(c.startDate), fmt(c.endDate),
                        fmt(c.location), fmt(c.participantsCount), fmt(c.facilitator), fmt(c.outcomeSummary),
                    ])}
                />

                {/* §6 EQUIPMENT */}
                <SectionHeading n="6" title="Project Equipment & Infrastructure" />
                <SubHeading>39. Equipment acquired during implementation</SubHeading>
                <DataTable
                    headers={['Item', 'Category', 'Serial / Tag', 'Acquired', 'Cost', 'Vendor', 'Custodian', 'Location', 'Status']}
                    rows={(data.equipment || []).map((e) => [
                        fmt(e.itemName), fmt(e.category),
                        `${fmt(e.serialNumber)} / ${fmt(e.assetTag)}`,
                        fmt(e.acquisitionDate),
                        fmtMoney(e.acquisitionCost, e.currency),
                        fmt(e.vendor), fmt(e.custodian), fmt(e.location), fmt(e.status),
                    ])}
                />
                <SubHeading>40. Infrastructure developed or renovated</SubHeading>
                <NotCapturedNote>Construction / renovation register is not yet a first-class table in KIMES; capture it on the printed copy.</NotCapturedNote>

                {/* §7 BUDGET */}
                <SectionHeading n="7" title="Grant Financial Utilization" />
                <SubHeading>41–43. Budget summary & expenditure</SubHeading>
                <DataTable
                    headers={['Category', 'Description', 'Budgeted', 'Spent to date', 'Balance', 'FY']}
                    rows={(data.budgetLines || []).map((b) => [
                        fmt(b.category), fmt(b.description),
                        fmtMoney(b.budgetedAmount, b.currency),
                        fmtMoney(b.expenditureToDate, b.currency),
                        fmtMoney(Number(b.budgetedAmount || 0) - Number(b.expenditureToDate || 0), b.currency),
                        fmt(b.fyLabel),
                    ]).concat(totals && (data.budgetLines || []).length > 0 ? [[
                        'TOTAL', '',
                        fmtMoney(totals.budgeted, project.fundingCurrency),
                        fmtMoney(totals.expended, project.fundingCurrency),
                        fmtMoney(totals.budgeted - totals.expended, project.fundingCurrency),
                        '',
                    ]] : [])}
                />
                <NotCapturedNote>§7.42 budget revisions &gt; 10% explanation and §7.43 incremental funding category breakdown are narrative-only in KIMES.</NotCapturedNote>

                {/* §8 OUTPUTS */}
                <SectionHeading n="8" title="Project Deliverables & Outputs" />
                <SubHeading>44. Outputs, achievements, outcomes, impact</SubHeading>
                <DataTable
                    headers={['Type', 'Title', 'Authors / Inventors', 'Venue / Repository', 'DOI / ID', 'Date', 'Score / IF / FAIR']}
                    rows={(data.outputs || []).map((o) => [
                        fmt(o.outputType), fmt(o.title), fmt(o.authors),
                        fmt(o.venue || o.repository),
                        fmt(o.doi || o.pubmedId || o.patentNumber || o.url),
                        fmt(o.dateRecorded || o.patentExpiryDate),
                        [o.impactFactor && `IF ${o.impactFactor}`, o.fairScore && `FAIR ${o.fairScore}`,
                         o.uptakeScore && `Uptake ${o.uptakeScore}`].filter(Boolean).join(' \u00b7 ') || '\u2014',
                    ])}
                />
                <NotCapturedNote>
                    §8.45 reports-submitted recipient checklist, §8.46 dissemination audience checklist, §8.47 sustainability narrative, and §8.48 data-sharing flag
                    are not yet first-class fields — write them on the printed copy.
                </NotCapturedNote>

                {/* §9 LAB */}
                <SectionHeading n="9" title="Laboratory Analyses" />
                <DataTable
                    headers={['Analysis', 'Platform', 'Sample type', 'Planned', 'Completed', 'QC pass rate', 'Unit cost', 'Comments']}
                    rows={(data.labAnalyses || []).map((l) => [
                        fmt(l.analysisType), fmt(l.platform), fmt(l.sampleType),
                        fmt(l.totalPlanned), fmt(l.completed), fmt(l.qcPassRate),
                        fmtMoney(l.unitCost, l.currency), fmt(l.comments),
                    ])}
                />
                <NotCapturedNote>Sample storage location list (§10.50) and non-KEMRI laboratory justification (§10.51) are not yet structured.</NotCapturedNote>

                {/* §10 OPERATIONS */}
                <SectionHeading n="10" title="Operations & Stakeholder Feedback" />
                <DataTable
                    headers={['Type', 'Source', 'Date', 'Summary', 'Action taken', 'Status', 'Raised by']}
                    rows={(data.feedback || []).map((f) => [
                        fmt(f.feedbackType), fmt(f.source), fmt(f.dateReceived),
                        fmt(f.summary), fmt(f.actionTaken), fmt(f.status), fmt(f.raisedBy),
                    ])}
                />
                <NotCapturedNote>Teamwork Likert (§11.52), stakeholder contact (§11.53) and Grants Office 1–10 score (§11.55) are stored as free-text feedback only.</NotCapturedNote>
                </Box>{/* ── END landscape group 2 ── */}

                {/* ───── PORTRAIT GROUP 3: §11 SWOT (3 narrow cols) ───── */}
                <Box className="print-portrait">
                <SectionHeading n="11" title="Strengths · Weaknesses · Lessons · Risks" />
                <DataTable
                    headers={['Category', 'Description', 'Recorded by']}
                    rows={(data.swot || []).map((s) => [fmt(s.category), fmt(s.description), fmt(s.recordedBy)])}
                />
                </Box>{/* ── END portrait group 3 ── */}

                {/* ───── LANDSCAPE GROUP 3: Annex A + Annex B (wide) ───── */}
                {((data.milestoneReports || []).length > 0 || (data.escalations || []).length > 0) && (
                    <Box className="print-landscape">
                        {/* ANNEX A — milestone reports */}
                        {(data.milestoneReports || []).length > 0 && (
                            <>
                                <SectionHeading n="A" title="Annex — Quarterly milestone reports filed" />
                                <DataTable
                                    headers={['FY', 'Quarter', 'Period end', 'Status', 'DQA', 'RAG', 'Budget', 'Spent', 'Submitted']}
                                    rows={data.milestoneReports.map((r) => [
                                        fmt(r.fyLabel), fmt(r.quarter), fmt(r.reportingPeriodEnd), fmt(r.status),
                                        fmt(r.dqaScore), fmt(r.ragStatus),
                                        fmtMoney(r.budgetTotal, project.fundingCurrency),
                                        fmtMoney(r.expenditureToDate, project.fundingCurrency),
                                        fmt(r.submittedAt),
                                    ])}
                                />
                            </>
                        )}

                        {/* ANNEX B — escalations */}
                        {(data.escalations || []).length > 0 && (
                            <>
                                <SectionHeading n="B" title="Annex — Non-conformity escalations" />
                                <DataTable
                                    headers={['Level', 'Classification', 'Days late', 'Triggered', 'Subject', 'Resolved']}
                                    rows={data.escalations.map((e) => [
                                        `L${e.level}`, fmt(e.classification), fmt(e.daysLate),
                                        fmt(e.triggeredAt), fmt(e.noticeSubject), e.resolved ? 'Yes' : 'No',
                                    ])}
                                />
                            </>
                        )}
                    </Box>
                )}

                {/* ───── PORTRAIT GROUP 4: footer ───── */}
                <Box className="print-portrait">
                <Divider sx={{ my: 4 }} />
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9CA3AF' }}>
                    — End of form —
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9CA3AF' }}>
                    Generated by KIMES on {(data.generatedAt || '').slice(0, 19).replace('T', ' ')} UTC.<br />
                    Source form: KEMRI Research Implementation &amp; Grant Monitoring Tool, version 05 (March 2026).
                </Typography>
                </Box>{/* ── END portrait group 4 ── */}
            </Box>
        </>
    );
}
