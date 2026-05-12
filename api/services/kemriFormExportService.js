/**
 * KEMRI / KIMES form-export service.
 *
 * Two responsibilities:
 *   1. buildFormExportPayload(pool, projectId, helpers)
 *      Returns the consolidated JSON payload used by both the JSON
 *      `/projects/:id/form-export` route and the DOCX route below — the two
 *      outputs cannot drift because they share this builder.
 *
 *   2. buildKemriFormDocx(payload)
 *      Synthesises a clean, printable Office Open XML (.docx) document
 *      laid out section-by-section to mirror api/adp/kemri_tools.pdf
 *      (Research Implementation & Grant Monitoring Tool, v05).
 *
 * The DOCX is built with `jszip` directly (no `docx` npm dep needed); the
 * resulting file opens correctly in Microsoft Word, LibreOffice and Google
 * Docs.  Text is XML-escaped, tables use a 1-row header + N data rows, and
 * empty/null fields render as an em-dash so the printed copy reads cleanly.
 */

const JSZip = require('jszip');

// ---------------------------------------------------------------------------
//  PAYLOAD BUILDER (shared by JSON + DOCX routes)
// ---------------------------------------------------------------------------

async function buildFormExportPayload(pool, id, { PROJECT_SELECT, SECTION_TABLES, buildSelectClause }) {
    const projRes = await pool.query(`${PROJECT_SELECT} WHERE rp.id = $1 AND rp.voided = 0`, [id]);
    if (!projRes.rows.length) return null;
    const project = projRes.rows[0];

    let piFullName = null;
    try {
        if (project.piUserId) {
            const u = await pool.query(
                `SELECT TRIM(CONCAT_WS(' ', firstname, lastname)) AS name, username
                   FROM users WHERE userid = $1`,
                [project.piUserId]
            );
            piFullName = u.rows[0]?.name || u.rows[0]?.username || null;
        }
    } catch (_) { /* schema drift */ }

    const [sites, coi, objectives, kpis, reports, outputs,
           staff, capacityBuilding, equipment, budgetLines,
           labAnalyses, feedback, swot, escalations] = await Promise.all([
        pool.query(`SELECT id, site_name AS "siteName", country, county, sub_county AS "subCounty",
                           ward, latitude, longitude
                      FROM kemri_research_sites WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT id, full_name AS "fullName", qualification, specialty, institution, role, email
                      FROM kemri_research_coinvestigators WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT id, ordinal, description
                      FROM kemri_research_objectives WHERE project_id = $1 AND voided = 0 ORDER BY ordinal`, [id]),
        pool.query(`SELECT id, indicator_code AS "indicatorCode", indicator_name AS "indicatorName",
                           description, unit_of_measure AS "unitOfMeasure",
                           baseline_value AS "baselineValue", target_value AS "targetValue",
                           expected_output AS "expectedOutput", reporting_frequency AS "reportingFrequency"
                      FROM kemri_kpis WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT mr.id, mr.fy_label AS "fyLabel", mr.quarter, mr.reporting_period_end AS "reportingPeriodEnd",
                           mr.staff_status_narrative AS "staffStatusNarrative",
                           mr.lab_analyses_summary AS "labAnalysesSummary",
                           mr.equipment_acquired_summary AS "equipmentAcquiredSummary",
                           mr.capacity_building_summary AS "capacityBuildingSummary",
                           mr.emerging_risks AS "emergingRisks",
                           mr.budget_total AS "budgetTotal", mr.funds_received AS "fundsReceived",
                           mr.expenditure_to_date AS "expenditureToDate", mr.balance,
                           mr.budget_variance_pct AS "budgetVariancePct",
                           mr.status, mr.dqa_score AS "dqaScore", mr.dqa_passed AS "dqaPassed",
                           mr.rag_status AS "ragStatus", mr.reviewer_comments AS "reviewerComments",
                           mr.submitted_at AS "submittedAt", mr.reviewed_at AS "reviewedAt"
                      FROM kemri_milestone_reports mr
                     WHERE mr.project_id = $1 AND mr.voided = 0
                     ORDER BY mr.fy_label DESC, mr.quarter DESC`, [id]),
        pool.query(`SELECT id, output_type AS "outputType", title, authors, status, venue,
                           date_recorded AS "dateRecorded", doi, pubmed_id AS "pubmedId", url,
                           citation_count AS "citationCount", impact_factor AS "impactFactor",
                           repository, access_level AS "accessLevel", embargo_until AS "embargoUntil",
                           fair_score AS "fairScore",
                           ip_type AS "ipType", patent_number AS "patentNumber", jurisdiction,
                           commercialisation_stage AS "commercialisationStage",
                           patent_expiry_date AS "patentExpiryDate",
                           revenue_generated AS "revenueGenerated",
                           policy_audience AS "policyAudience", uptake_score AS "uptakeScore"
                      FROM kemri_outputs WHERE project_id = $1 AND voided = 0 ORDER BY id DESC`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.staff)}
                      FROM ${SECTION_TABLES.staff.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.capacityBuilding)}
                      FROM ${SECTION_TABLES.capacityBuilding.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.equipment)}
                      FROM ${SECTION_TABLES.equipment.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.budgetLines)}
                      FROM ${SECTION_TABLES.budgetLines.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.labAnalyses)}
                      FROM ${SECTION_TABLES.labAnalyses.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.feedback)}
                      FROM ${SECTION_TABLES.feedback.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT ${buildSelectClause(SECTION_TABLES.swot)}
                      FROM ${SECTION_TABLES.swot.table}
                     WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
        pool.query(`SELECT id, level, classification, days_late AS "daysLate",
                           deadline, triggered_at AS "triggeredAt",
                           notice_subject AS "noticeSubject", resolved
                      FROM kemri_escalations WHERE project_id = $1 AND voided = 0
                     ORDER BY id DESC`, [id]),
    ]);

    const kpiAch = await pool.query(
        `SELECT ka.kpi_id          AS "kpiId",
                mr.fy_label        AS "fyLabel",
                mr.quarter         AS "quarter",
                ka.target_value    AS "targetValue",
                ka.actual_value    AS "actualValue",
                ka.achievement_pct AS "achievementPct",
                ka.status,
                ka.comments        AS "narrative"
           FROM kemri_kpi_achievements ka
           JOIN kemri_kpis k             ON k.id  = ka.kpi_id
           JOIN kemri_milestone_reports mr ON mr.id = ka.report_id
          WHERE k.project_id = $1 AND ka.voided = 0
          ORDER BY ka.kpi_id, mr.fy_label, mr.quarter`, [id]
    );

    return {
        generatedAt: new Date().toISOString(),
        generator: 'KIMES form-export v1',
        sourceFormName: 'KEMRI Research Implementation & Grant Monitoring Tool',
        sourceFormVersion: 'v05 (March 2026)',
        project,
        piFullName,
        sites: sites.rows,
        coinvestigators: coi.rows,
        objectives: objectives.rows,
        kpis: kpis.rows,
        kpiAchievements: kpiAch.rows,
        milestoneReports: reports.rows,
        outputs: outputs.rows,
        staff: staff.rows,
        capacityBuilding: capacityBuilding.rows,
        equipment: equipment.rows,
        budgetLines: budgetLines.rows,
        labAnalyses: labAnalyses.rows,
        feedback: feedback.rows,
        swot: swot.rows,
        escalations: escalations.rows,
    };
}

// ---------------------------------------------------------------------------
//  DOCX SYNTHESISER
// ---------------------------------------------------------------------------

const X = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, ' ')
    .replace(/\u0000/g, '');

const fmt = (v) => {
    if (v === null || v === undefined || v === '') return '\u2014';
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
    if (Array.isArray(v)) return v.length === 0 ? '\u2014' : v.join(', ');
    return String(v);
};

const fmtMoney = (v, cur) => {
    if (v === null || v === undefined || v === '') return '\u2014';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return `${cur || ''} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`.trim();
};

// --- low-level XML helpers (Open XML wordprocessing) ----------------------

const para = (text, { bold = false, size = 22, align = null, before = 0, after = 80, color = null } = {}) => {
    const rPr = [
        bold ? '<w:b/>' : '',
        size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : '',
        color ? `<w:color w:val="${color}"/>` : '',
    ].join('');
    const pPr = [
        align ? `<w:jc w:val="${align}"/>` : '',
        (before || after) ? `<w:spacing w:before="${before}" w:after="${after}"/>` : '',
    ].join('');
    return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ''}<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${X(text)}</w:t></w:r></w:p>`;
};

const blank = () => '<w:p/>';

const heading = (text, level = 1) => {
    const sizes = { 1: 36, 2: 28, 3: 24 };
    const colors = { 1: '0F172A', 2: '6A1B9A', 3: '0F766E' };
    return para(text, { bold: true, size: sizes[level] || 24, color: colors[level] || '0F172A', before: level === 1 ? 240 : 160, after: 80 });
};

// Multi-paragraph text inside a single cell (preserves line breaks).
const cellPara = (text, { bold = false, size = 20, color = null } = {}) => {
    const lines = String(text == null || text === '' ? '\u2014' : text).split(/\r?\n/);
    return lines.map((line) => {
        const rPr = [
            bold ? '<w:b/>' : '',
            size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : '',
            color ? `<w:color w:val="${color}"/>` : '',
        ].join('');
        return `<w:p><w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${X(line)}</w:t></w:r></w:p>`;
    }).join('');
};

const tableCell = (content, { width = null, shade = null, bold = false } = {}) => {
    const tcPr = [
        width ? `<w:tcW w:w="${width}" w:type="dxa"/>` : '<w:tcW w:w="0" w:type="auto"/>',
        shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : '',
    ].join('');
    return `<w:tc><w:tcPr>${tcPr}</w:tcPr>${typeof content === 'string' ? cellPara(content, { bold }) : content}</w:tc>`;
};

const tableRow = (cells) => `<w:tr>${cells.join('')}</w:tr>`;

// Letter page printable widths (page size − 1080 twip margin each side).
// Portrait  = 12240 − 2160 = 10080 twips ≈ 7.0"
// Landscape = 15840 − 2160 = 13680 twips ≈ 9.5"
// Wide data tables (≥6 cols) render on landscape sections so columns aren't
// squeezed; narrative content (cover, field-row blocks, SWOT, footer) stays
// portrait.  See PORTRAIT_SECT_PR / LANDSCAPE_SECT_PR + sectionBreak() below.
const PORTRAIT_PRINTABLE_W  = 10080;
const LANDSCAPE_PRINTABLE_W = 13680;
const TABLE_PRINTABLE_W     = PORTRAIT_PRINTABLE_W; // default for callers that don't pass one

// Heuristic column widths: wide free-text columns (titles, descriptions,
// comments) take more space than short token columns (codes, dates, status).
// Returns an array that sums to `totalW` (defaults to portrait printable).
const distributeColumnWidths = (headers, totalW = TABLE_PRINTABLE_W) => {
    const wide = /title|description|comment|narrative|notes|venue|repository|authors|objective|summary|action|subject|kpi|indicator|outcome|expected|grant|donor|item|category|organi[sz]ation|institution|email/i;
    const narrow = /^(#|fy|qtr|q|year|code|id|date|start|end|status|rag|level|days|score|if|qty|count|fte|n|cost|unit|currency|balance|spent|budget|expected|target|baseline|actual|%|pct|impact|frequency|gps|lat|lng|jurisdiction|tag|serial)/i;
    const weights = headers.map((h) => {
        const s = String(h || '').trim();
        if (wide.test(s))   return 3;
        if (narrow.test(s)) return 1;
        return 2;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const widths = weights.map((w) => Math.floor((w / totalWeight) * totalW));
    // Pour any rounding remainder into the widest column.
    const sum = widths.reduce((a, b) => a + b, 0);
    if (sum < totalW) {
        const idx = weights.indexOf(Math.max(...weights));
        widths[idx] += totalW - sum;
    }
    return widths;
};

const buildTable = (headers, rows, { widths = null, printableWidth = TABLE_PRINTABLE_W } = {}) => {
    const colWidths = (widths && widths.length === headers.length)
        ? widths
        : distributeColumnWidths(headers, printableWidth);
    const tblGrid = `<w:tblGrid>${colWidths.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;
    const tblPr = `
        <w:tblPr>
          <w:tblStyle w:val="TableGrid"/>
          <w:tblW w:w="${printableWidth}" w:type="dxa"/>
          <w:tblLayout w:type="fixed"/>
          <w:tblBorders>
            <w:top    w:val="single" w:sz="6" w:color="9CA3AF"/>
            <w:left   w:val="single" w:sz="6" w:color="9CA3AF"/>
            <w:bottom w:val="single" w:sz="6" w:color="9CA3AF"/>
            <w:right  w:val="single" w:sz="6" w:color="9CA3AF"/>
            <w:insideH w:val="single" w:sz="4" w:color="D1D5DB"/>
            <w:insideV w:val="single" w:sz="4" w:color="D1D5DB"/>
          </w:tblBorders>
        </w:tblPr>`;
    const headRow = tableRow(headers.map((h, i) => tableCell(h, { width: colWidths[i], shade: 'F3F4F6', bold: true })));
    const bodyRows = rows.map((r) => tableRow(r.map((c, i) => tableCell(c, { width: colWidths[i] }))));
    return `<w:tbl>${tblPr}${tblGrid}${headRow}${bodyRows.join('')}</w:tbl>`;
};

// --- Field-row helper: a 2-col table for "Label: value" rows -------------

const fieldRows = (pairs, { printableWidth = TABLE_PRINTABLE_W } = {}) => {
    const labelW = Math.round(printableWidth * 0.30);
    const valueW = printableWidth - labelW;
    const rows = pairs.map(([label, value]) => [
        `<w:tc><w:tcPr><w:tcW w:w="${labelW}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F9FAFB"/></w:tcPr>${cellPara(label, { bold: true })}</w:tc>` +
        `<w:tc><w:tcPr><w:tcW w:w="${valueW}" w:type="dxa"/></w:tcPr>${cellPara(value)}</w:tc>`,
    ]);
    const tblPr = `
        <w:tblPr>
          <w:tblW w:w="${printableWidth}" w:type="dxa"/>
          <w:tblLayout w:type="fixed"/>
          <w:tblBorders>
            <w:top    w:val="single" w:sz="4" w:color="E5E7EB"/>
            <w:left   w:val="single" w:sz="4" w:color="E5E7EB"/>
            <w:bottom w:val="single" w:sz="4" w:color="E5E7EB"/>
            <w:right  w:val="single" w:sz="4" w:color="E5E7EB"/>
            <w:insideH w:val="single" w:sz="4" w:color="E5E7EB"/>
            <w:insideV w:val="single" w:sz="4" w:color="E5E7EB"/>
          </w:tblBorders>
        </w:tblPr>`;
    const tblGrid = `<w:tblGrid><w:gridCol w:w="${labelW}"/><w:gridCol w:w="${valueW}"/></w:tblGrid>`;
    return `<w:tbl>${tblPr}${tblGrid}${rows.map((r) => `<w:tr>${r[0]}</w:tr>`).join('')}</w:tbl>`;
};

// --- Section break helper -------------------------------------------------
// In Open XML, a section's <w:sectPr> sits inside the <w:pPr> of the last
// paragraph of that section.  Inserting a paragraph with a sectPr in the
// middle of the body therefore closes the section ending at that paragraph
// and starts a new one — which is exactly how Word switches orientation
// halfway through a document.

const portraitSectPrXml = `<w:sectPr>
    <w:pgSz w:w="12240" w:h="15840"/>
    <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    <w:cols w:space="708"/>
    <w:docGrid w:linePitch="360"/>
</w:sectPr>`;

const landscapeSectPrXml = `<w:sectPr>
    <w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/>
    <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    <w:cols w:space="708"/>
    <w:docGrid w:linePitch="360"/>
</w:sectPr>`;

const sectionBreak = (orientation) => {
    const sectPr = orientation === 'landscape' ? landscapeSectPrXml : portraitSectPrXml;
    return `<w:p><w:pPr>${sectPr}</w:pPr></w:p>`;
};

// ---------------------------------------------------------------------------
//  Build the body of the DOCX from the form-export payload
// ---------------------------------------------------------------------------

function buildDocBody(p) {
    const project = p.project || {};
    const PW = PORTRAIT_PRINTABLE_W;
    const LW = LANDSCAPE_PRINTABLE_W;

    // Each block is { orientation: 'portrait'|'landscape', xml: string }.  We
    // gather all blocks first, then walk them in order emitting section-break
    // paragraphs whenever the orientation changes.  This produces a single
    // mixed-orientation document: cover/field-rows on portrait pages, wide
    // data tables on landscape pages.
    const blocks = [];
    const portrait  = (xml) => blocks.push({ orientation: 'portrait',  xml });
    const landscape = (xml) => blocks.push({ orientation: 'landscape', xml });

    // ----------------- Portrait: cover + grant info + compliance + intro
    portrait(para('KEMRI Research Implementation & Grant Monitoring Form', { bold: true, size: 36, align: 'center', after: 60 }));
    portrait(para(`Version 05 (March 2026) — Auto-generated by KIMES on ${(p.generatedAt || '').slice(0, 10)}`, { size: 20, align: 'center', color: '6B7280', after: 240 }));
    portrait(para(`KIMES Project ID: ${project.kimesProjectId || '—'}`, { bold: true, size: 24, align: 'center', after: 80 }));
    portrait(para(`Title: ${project.title || '—'}`, { size: 22, align: 'center', after: 240 }));

    portrait(heading('§1. Grant Information', 1));
    portrait(fieldRows([
        ['1. Project Type',                 fmt(project.projectType)],
        ['2. Account Number',               fmt(project.accountNumber)],
        ['3. Project / Study Title',        fmt(project.title)],
        ['4. Short Name / Acronym',         fmt(project.shortName)],
        ['5. Principal Investigator',       `${fmt(p.piFullName)} (Payroll No: ${fmt(project.piPayrollNo)})`],
        ['6. Donor / Funding Agency',       fmt(project.primaryDonorName)],
        ['7A. Funding Amount',              fmtMoney(project.fundingAmount, project.fundingCurrency)],
        ['7B. Currency',                    fmt(project.fundingCurrency)],
        ['8. Funding mechanism',            fmt(project.fundingMechanism)],
        ['9. Type of Study',                fmt(project.studyType)],
        ['10. Contract Type',               fmt(project.contractType)],
        ['11. Contract Number',             fmt(project.contractNumber)],
        ['12. Grant Number',                fmt(project.grantNumber)],
        ['13. KEMRI Legal Number',          fmt(project.kemriLegalNumber)],
        ['Centre',                          `${fmt(project.centreCode)} — ${fmt(project.centreName)}`],
        ['Programme',                       fmt(project.programmeName)],
    ], { printableWidth: PW }));

    portrait(heading('§2. Project Compliance', 1));
    portrait(fieldRows([
        ['14. SERU Approval No / Date',     `${fmt(project.seruApprovalNo)} / ${fmt(project.seruApprovalDate)}`],
        ['15. SERU Expiry / Renewal Date',  fmt(project.seruExpiryDate)],
        ['16. NACOSTI Approval No / Date',  `${fmt(project.nacostiApprovalNo)} / ${fmt(project.nacostiApprovalDate)}`],
        ['18. Proposed start date',         fmt(project.proposedStartDate)],
        ['19. Proposed end date',           fmt(project.proposedEndDate)],
        ['Actual start date',               fmt(project.actualStartDate)],
        ['Status / RAG',                    `${fmt(project.status)} / ${fmt(project.ragStatus)}`],
    ], { printableWidth: PW }));

    portrait(heading('§3. Project Implementation', 1));
    portrait(fieldRows([
        ['20. Primary Implementing Organization', `${fmt(project.primaryOrg)} (${fmt(project.primaryOrgCountry)})`],
    ], { printableWidth: PW }));

    // ----------------- Landscape: §3 lists + §3.28 indicator tables
    if ((p.sites || []).length) {
        landscape(para('22. Implementation Site(s)', { bold: true, size: 22, before: 120, after: 80 }));
        landscape(buildTable(
            ['Site name', 'Country', 'County', 'Sub-county', 'Ward', 'GPS (lat, lng)'],
            p.sites.map((s) => [
                fmt(s.siteName), fmt(s.country), fmt(s.county), fmt(s.subCounty), fmt(s.ward),
                (s.latitude != null && s.longitude != null) ? `${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}` : '\u2014',
            ]),
            { printableWidth: LW }
        ));
    }

    if ((p.coinvestigators || []).length) {
        landscape(para('23. Co-investigator(s)', { bold: true, size: 22, before: 160, after: 80 }));
        landscape(buildTable(
            ['Name', 'Qualification', 'Specialty', 'Institution', 'Role', 'Email'],
            p.coinvestigators.map((c) => [
                fmt(c.fullName), fmt(c.qualification), fmt(c.specialty),
                fmt(c.institution), fmt(c.role), fmt(c.email),
            ]),
            { printableWidth: LW }
        ));
    }

    if ((p.objectives || []).length) {
        // Only 2 columns — keep on the landscape page so it groups with §3.
        landscape(para('24. Project / Study Specific Objectives', { bold: true, size: 22, before: 160, after: 80 }));
        landscape(buildTable(
            ['#', 'Objective'],
            p.objectives.map((o) => [`${o.ordinal || ''}`, fmt(o.description)]),
            { printableWidth: LW }
        ));
    }

    if ((p.kpis || []).length) {
        landscape(heading('§3.28 Project Indicator Tracking (KPI plan)', 2));
        landscape(buildTable(
            ['Code', 'KPI / Indicator', 'Unit', 'Baseline', 'Target', 'Expected output / outcome', 'Frequency'],
            p.kpis.map((k) => [
                fmt(k.indicatorCode), fmt(k.indicatorName), fmt(k.unitOfMeasure),
                fmt(k.baselineValue), fmt(k.targetValue), fmt(k.expectedOutput), fmt(k.reportingFrequency),
            ]),
            { printableWidth: LW }
        ));

        if ((p.kpiAchievements || []).length) {
            landscape(para('\u00a73.28 KPI achievements per quarter', { bold: true, size: 22, before: 160, after: 80 }));
            landscape(buildTable(
                ['KPI ID', 'FY', 'Quarter', 'Target', 'Actual', '% achieved', 'Status', 'Comments'],
                p.kpiAchievements.map((a) => [
                    `#${a.kpiId}`, fmt(a.fyLabel), fmt(a.quarter),
                    fmt(a.targetValue), fmt(a.actualValue),
                    fmt(a.achievementPct), fmt(a.status), fmt(a.narrative),
                ]),
                { printableWidth: LW }
            ));
        }
    }

    // ----------------- Portrait: §4 strategic alignment field-rows
    portrait(heading('§4. Project Strategic Alignment', 1));
    portrait(fieldRows([
        ['29. SDG codes',                       fmt(project.sdgCodes)],
        ['30. Vision 2030 codes',               fmt(project.vision2030Codes)],
        ['31. National Health Policy',          fmt(project.nationalHealthPolicy)],
        ['33. KEMRI Strategic Plan KRAs',       fmt(project.strategicPlanKras)],
        ['33. Strategic Plan Objectives',       fmt(project.strategicPlanObjectives)],
        ['34. Programme area',                  fmt(project.programmeArea)],
        ['35. Research priority / disease area',fmt(project.researchPriority)],
    ], { printableWidth: PW }));

    // ----------------- Landscape: §5 HR + §5.38 + §6 + §7 + §8 + §9 + §10
    landscape(heading('§5. Project Human Resource', 1));
    if ((p.staff || []).length) {
        landscape(buildTable(
            ['Role', 'Code', 'Name', 'Qualification', 'FTE', 'Funded by', 'Start', 'End', 'Notes'],
            p.staff.map((s) => [
                fmt(s.role), fmt(s.roleCode), fmt(s.staffName), fmt(s.qualification),
                fmt(s.fte), fmt(s.fundedBy), fmt(s.startDate), fmt(s.endDate), fmt(s.notes),
            ]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No project staff captured yet.', { size: 20, color: '9CA3AF' }));
    }

    landscape(heading('§5.38 Capacity building & training plans', 2));
    if ((p.capacityBuilding || []).length) {
        landscape(buildTable(
            ['Event title', 'Type', 'Start', 'End', 'Location', '# Participants', 'Facilitator', 'Outcome'],
            p.capacityBuilding.map((c) => [
                fmt(c.eventTitle), fmt(c.eventType), fmt(c.startDate), fmt(c.endDate),
                fmt(c.location), fmt(c.participantsCount), fmt(c.facilitator), fmt(c.outcomeSummary),
            ]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No capacity-building events captured yet.', { size: 20, color: '9CA3AF' }));
    }

    landscape(heading('§6.39 Equipment acquired during implementation', 1));
    if ((p.equipment || []).length) {
        landscape(buildTable(
            ['Item', 'Category', 'Serial / Tag', 'Acquired', 'Cost', 'Vendor', 'Custodian', 'Location', 'Status'],
            p.equipment.map((e) => [
                fmt(e.itemName), fmt(e.category),
                `${fmt(e.serialNumber)} / ${fmt(e.assetTag)}`,
                fmt(e.acquisitionDate),
                fmtMoney(e.acquisitionCost, e.currency),
                fmt(e.vendor), fmt(e.custodian), fmt(e.location), fmt(e.status),
            ]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No equipment captured yet.', { size: 20, color: '9CA3AF' }));
    }

    landscape(heading('§7. Grant Financial Utilization', 1));
    if ((p.budgetLines || []).length) {
        const totals = p.budgetLines.reduce((acc, b) => {
            acc.budgeted   += Number(b.budgetedAmount   || 0);
            acc.expended   += Number(b.expenditureToDate || 0);
            return acc;
        }, { budgeted: 0, expended: 0 });
        landscape(buildTable(
            ['Category', 'Description', 'Budgeted', 'Spent to date', 'Balance', 'FY'],
            p.budgetLines.map((b) => [
                fmt(b.category), fmt(b.description),
                fmtMoney(b.budgetedAmount, b.currency),
                fmtMoney(b.expenditureToDate, b.currency),
                fmtMoney(Number(b.budgetedAmount || 0) - Number(b.expenditureToDate || 0), b.currency),
                fmt(b.fyLabel),
            ]).concat([[ 'TOTAL', '', fmtMoney(totals.budgeted, project.fundingCurrency), fmtMoney(totals.expended, project.fundingCurrency), fmtMoney(totals.budgeted - totals.expended, project.fundingCurrency), '' ]]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No budget lines captured yet.', { size: 20, color: '9CA3AF' }));
    }

    landscape(heading('§8. Project Deliverables & Outputs', 1));
    if ((p.outputs || []).length) {
        landscape(buildTable(
            ['Type', 'Title', 'Authors / Inventors', 'Venue / Journal / Repository', 'DOI / ID', 'Date', 'Score / IF / FAIR'],
            p.outputs.map((o) => [
                fmt(o.outputType), fmt(o.title), fmt(o.authors),
                fmt(o.venue || o.repository),
                fmt(o.doi || o.pubmedId || o.patentNumber || o.url),
                fmt(o.dateRecorded || o.patentExpiryDate),
                [o.impactFactor && `IF ${o.impactFactor}`, o.fairScore && `FAIR ${o.fairScore}`,
                 o.uptakeScore && `Uptake ${o.uptakeScore}`].filter(Boolean).join(' \u00b7 ') || '\u2014',
            ]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No post-study outputs captured yet.', { size: 20, color: '9CA3AF' }));
    }

    landscape(heading('§9. Laboratory Analyses', 1));
    if ((p.labAnalyses || []).length) {
        landscape(buildTable(
            ['Analysis', 'Platform', 'Sample type', 'Planned', 'Completed', 'QC pass rate', 'Unit cost', 'Comments'],
            p.labAnalyses.map((l) => [
                fmt(l.analysisType), fmt(l.platform), fmt(l.sampleType),
                fmt(l.totalPlanned), fmt(l.completed), fmt(l.qcPassRate),
                fmtMoney(l.unitCost, l.currency), fmt(l.comments),
            ]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No laboratory analyses captured yet.', { size: 20, color: '9CA3AF' }));
    }

    landscape(heading('§10. Operations & Stakeholder Feedback', 1));
    if ((p.feedback || []).length) {
        landscape(buildTable(
            ['Type', 'Source', 'Date', 'Summary', 'Action taken', 'Status', 'Raised by'],
            p.feedback.map((f) => [
                fmt(f.feedbackType), fmt(f.source), fmt(f.dateReceived),
                fmt(f.summary), fmt(f.actionTaken), fmt(f.status), fmt(f.raisedBy),
            ]),
            { printableWidth: LW }
        ));
    } else {
        landscape(para('No operational feedback recorded yet.', { size: 20, color: '9CA3AF' }));
    }

    // ----------------- Portrait: §11 SWOT (only 3 narrow cols)
    portrait(heading('§11. Strengths · Weaknesses · Lessons · Recommendations · Risks', 1));
    if ((p.swot || []).length) {
        portrait(buildTable(
            ['Category', 'Description', 'Recorded by'],
            p.swot.map((s) => [fmt(s.category), fmt(s.description), fmt(s.recordedBy)]),
            { printableWidth: PW }
        ));
    } else {
        portrait(para('No SWOT / lessons captured yet.', { size: 20, color: '9CA3AF' }));
    }

    // ----------------- Landscape: Annex A milestone reports (10 cols)
    //                              Annex B escalations (7 cols)
    if ((p.milestoneReports || []).length) {
        landscape(heading('Annex A. Quarterly milestone reports filed', 2));
        landscape(buildTable(
            ['FY', 'Quarter', 'Period end', 'Status', 'DQA score', 'RAG', 'Budget', 'Spent', 'Balance', 'Submitted'],
            p.milestoneReports.map((r) => [
                fmt(r.fyLabel), fmt(r.quarter), fmt(r.reportingPeriodEnd), fmt(r.status),
                fmt(r.dqaScore), fmt(r.ragStatus),
                fmtMoney(r.budgetTotal, project.fundingCurrency),
                fmtMoney(r.expenditureToDate, project.fundingCurrency),
                fmtMoney(r.balance, project.fundingCurrency),
                fmt(r.submittedAt),
            ]),
            { printableWidth: LW }
        ));
    }

    if ((p.escalations || []).length) {
        landscape(heading('Annex B. Non-conformity escalations on this project', 2));
        landscape(buildTable(
            ['Level', 'Classification', 'Days late', 'Deadline', 'Triggered', 'Subject', 'Resolved'],
            p.escalations.map((e) => [
                `L${e.level}`, fmt(e.classification), fmt(e.daysLate),
                fmt(e.deadline), fmt(e.triggeredAt),
                fmt(e.noticeSubject), e.resolved ? 'Yes' : 'No',
            ]),
            { printableWidth: LW }
        ));
    }

    // ----------------- Portrait: footer
    portrait(blank());
    portrait(para('— End of form —', { size: 20, align: 'center', color: '9CA3AF', before: 240, after: 80 }));
    portrait(para(`Generated by KIMES on ${(p.generatedAt || '').slice(0, 19).replace('T', ' ')} UTC.`, { size: 18, align: 'center', color: '9CA3AF' }));
    portrait(para('Source form: KEMRI Research Implementation & Grant Monitoring Tool, version 05 (March 2026).',
        { size: 18, align: 'center', color: '9CA3AF' }));

    // Walk the blocks and stitch in section-break paragraphs at orientation
    // boundaries.  The section properties on a break paragraph apply to the
    // section *ending* at that break — so we emit a sectPr matching the
    // outgoing orientation.  The final sectPr in the body (set by the
    // caller via finalOrientation) applies to the trailing section.
    const out = [];
    for (let i = 0; i < blocks.length; i++) {
        out.push(blocks[i].xml);
        const next = blocks[i + 1];
        if (next && next.orientation !== blocks[i].orientation) {
            out.push(sectionBreak(blocks[i].orientation));
        }
    }
    return {
        bodyXml: out.join(''),
        finalOrientation: blocks.length ? blocks[blocks.length - 1].orientation : 'portrait',
    };
}

async function buildKemriFormDocx(payload) {
    const { bodyXml, finalOrientation } = buildDocBody(payload);
    // The trailing <w:sectPr> at end-of-body governs the *last* section,
    // which inherits the orientation of the final block (typically portrait
    // for the footer).
    const finalSectPr = finalOrientation === 'landscape' ? `
    <w:sectPr>
      <w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>` : `
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    ${finalSectPr}
  </w:body>
</w:document>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr><w:tblBorders>
      <w:top w:val="single" w:sz="6" w:color="9CA3AF"/>
      <w:left w:val="single" w:sz="6" w:color="9CA3AF"/>
      <w:bottom w:val="single" w:sz="6" w:color="9CA3AF"/>
      <w:right w:val="single" w:sz="6" w:color="9CA3AF"/>
      <w:insideH w:val="single" w:sz="4" w:color="D1D5DB"/>
      <w:insideV w:val="single" w:sz="4" w:color="D1D5DB"/>
    </w:tblBorders></w:tblPr>
  </w:style>
</w:styles>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const zip = new JSZip();
    zip.file('[Content_Types].xml', contentTypesXml);
    zip.folder('_rels').file('.rels', rootRelsXml);
    zip.folder('word').file('document.xml', documentXml);
    zip.folder('word').file('styles.xml', stylesXml);
    zip.folder('word/_rels').file('document.xml.rels', docRelsXml);
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

module.exports = {
    buildFormExportPayload,
    buildKemriFormDocx,
};
