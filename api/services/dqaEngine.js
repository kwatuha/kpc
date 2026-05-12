/**
 * KIMES Data Quality Assessment (DQA) engine.
 *
 * Runs the eight automated checks described in Step 4 of the KIMES v5.0
 * design document and Section 7 (non-conformity classification).
 *
 *   1. Required field completeness (>= 85%)
 *   2. Numeric range plausibility
 *   3. GPS coordinate validation
 *   4. Financial arithmetic consistency
 *   5. Date logic
 *   6. Cross-field consistency
 *   7. SERU expiry within 60 days alert
 *   8. Duplicate submission detection
 *
 * The engine reads only what already exists in KIMES; it never fabricates.
 * Results are persisted in `kemri_dqa_scores` so the audit trail is
 * inspectable by Centre Directors and the Board.
 */

const pool = require('../config/db');

const REQUIRED_FIELDS = [
    'fy_label',
    'quarter',
    'reporting_period_end',
    'budget_total',
    'expenditure_to_date',
    'staff_status_narrative',
    'lab_analyses_summary',
];

const PASS_THRESHOLD = 85;

const inRange = (value, min, max) =>
    value !== null && value !== undefined && value >= min && value <= max;

function checkCompleteness(report, kpiAchievements) {
    const totalFields = REQUIRED_FIELDS.length + 1; // +1 for at least one KPI achievement
    let filled = 0;
    const flagged = [];
    for (const field of REQUIRED_FIELDS) {
        const v = report[field];
        if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
            flagged.push({ field, issue: 'missing', severity: 'high' });
        } else {
            filled += 1;
        }
    }
    if (Array.isArray(kpiAchievements) && kpiAchievements.length > 0) {
        filled += 1;
    } else {
        flagged.push({ field: 'kpi_achievements', issue: 'no_kpis_reported', severity: 'high' });
    }
    return { score: Math.round((filled / totalFields) * 10000) / 100, flagged };
}

function checkNumericRanges(report, kpiAchievements) {
    const flagged = [];
    let checks = 0;
    let passed = 0;
    if (report.budget_total !== null && report.budget_total !== undefined) {
        checks += 1;
        if (Number(report.budget_total) >= 0) passed += 1;
        else flagged.push({ field: 'budget_total', issue: 'negative_value', severity: 'high' });
    }
    if (report.expenditure_to_date !== null && report.expenditure_to_date !== undefined) {
        checks += 1;
        if (Number(report.expenditure_to_date) >= 0) passed += 1;
        else flagged.push({ field: 'expenditure_to_date', issue: 'negative_value', severity: 'high' });
    }
    for (const ach of kpiAchievements || []) {
        if (ach.actual_value !== null && ach.actual_value !== undefined) {
            checks += 1;
            if (Number(ach.actual_value) >= 0) passed += 1;
            else flagged.push({
                field: `kpi_achievement_${ach.kpi_id}`,
                issue: 'negative_actual',
                severity: 'medium',
            });
        }
    }
    const score = checks === 0 ? 100 : Math.round((passed / checks) * 10000) / 100;
    return { score, flagged };
}

function checkGps(sites) {
    const flagged = [];
    let checks = 0;
    let passed = 0;
    for (const site of sites || []) {
        if (site.latitude !== null && site.latitude !== undefined) {
            checks += 1;
            if (inRange(Number(site.latitude), -90, 90)) passed += 1;
            else flagged.push({
                field: `site_${site.id}_latitude`,
                issue: 'out_of_range',
                severity: 'high',
            });
        }
        if (site.longitude !== null && site.longitude !== undefined) {
            checks += 1;
            if (inRange(Number(site.longitude), -180, 180)) passed += 1;
            else flagged.push({
                field: `site_${site.id}_longitude`,
                issue: 'out_of_range',
                severity: 'high',
            });
        }
    }
    const score = checks === 0 ? 100 : Math.round((passed / checks) * 10000) / 100;
    return { score, flagged };
}

function checkFinancialArithmetic(report) {
    const flagged = [];
    if (
        report.budget_total !== null &&
        report.expenditure_to_date !== null &&
        report.balance !== null &&
        report.budget_total !== undefined &&
        report.expenditure_to_date !== undefined &&
        report.balance !== undefined
    ) {
        const expected = Number(report.budget_total) - Number(report.expenditure_to_date);
        const diff = Math.abs(expected - Number(report.balance));
        if (diff > 1) {
            flagged.push({
                field: 'balance',
                issue: 'arithmetic_mismatch',
                severity: 'high',
                expected: expected,
                got: Number(report.balance),
            });
            return { score: 0, flagged };
        }
    }
    return { score: 100, flagged };
}

function checkDateLogic(report, project) {
    const flagged = [];
    if (report.reporting_period_end && project?.proposed_start_date) {
        const periodEnd = new Date(report.reporting_period_end);
        const projectStart = new Date(project.proposed_start_date);
        if (periodEnd < projectStart) {
            flagged.push({
                field: 'reporting_period_end',
                issue: 'before_project_start',
                severity: 'high',
            });
            return { score: 0, flagged };
        }
    }
    return { score: 100, flagged };
}

function checkCrossField(report, kpiAchievements) {
    const flagged = [];
    let checks = 1;
    let passed = 1;
    if (
        report.budget_total !== null &&
        report.expenditure_to_date !== null &&
        Number(report.expenditure_to_date) > Number(report.budget_total)
    ) {
        flagged.push({
            field: 'expenditure_to_date',
            issue: 'exceeds_budget',
            severity: 'high',
        });
        passed = 0;
    }
    for (const ach of kpiAchievements || []) {
        checks += 1;
        if (
            ach.target_value !== null &&
            ach.actual_value !== null &&
            Number(ach.target_value) > 0
        ) {
            const calc = (Number(ach.actual_value) / Number(ach.target_value)) * 100;
            if (
                ach.achievement_pct !== null &&
                ach.achievement_pct !== undefined &&
                Math.abs(calc - Number(ach.achievement_pct)) > 1
            ) {
                flagged.push({
                    field: `kpi_${ach.kpi_id}_achievement_pct`,
                    issue: 'pct_mismatch',
                    severity: 'medium',
                });
            } else {
                passed += 1;
            }
        } else {
            passed += 1;
        }
    }
    const score = checks === 0 ? 100 : Math.round((passed / checks) * 10000) / 100;
    return { score, flagged };
}

function checkSeruExpiry(project) {
    const flagged = [];
    if (project?.seru_expiry_date) {
        const expiry = new Date(project.seru_expiry_date);
        const now = new Date();
        const days = Math.round((expiry - now) / (1000 * 60 * 60 * 24));
        if (days < 0) {
            flagged.push({ field: 'seru_expiry_date', issue: 'expired', severity: 'critical' });
            return { score: 0, flagged };
        }
        if (days < 60) {
            flagged.push({
                field: 'seru_expiry_date',
                issue: 'expiring_soon',
                severity: 'high',
                days_remaining: days,
            });
            return { score: 50, flagged };
        }
    }
    return { score: 100, flagged };
}

async function checkDuplicate(report) {
    const dup = await pool.query(
        `SELECT COUNT(*)::int AS n
           FROM kemri_milestone_reports
          WHERE project_id = $1 AND fy_label = $2 AND quarter = $3
            AND id <> $4 AND voided = 0`,
        [report.project_id, report.fy_label, report.quarter, report.id]
    );
    if ((dup.rows?.[0]?.n || 0) > 0) {
        return {
            score: 0,
            flagged: [{ field: 'period', issue: 'duplicate_period_report', severity: 'critical' }],
        };
    }
    return { score: 100, flagged: [] };
}

/**
 * Run all eight DQA checks for a single milestone report and persist the
 * scorecard. Returns the score record with `passed = 1` when overall >= 85.
 */
async function runDqa(reportId) {
    const reportRes = await pool.query(
        `SELECT r.*, p.proposed_start_date, p.seru_expiry_date
           FROM kemri_milestone_reports r
           JOIN kemri_research_projects p ON p.id = r.project_id
          WHERE r.id = $1`,
        [reportId]
    );
    if (!reportRes.rows.length) {
        throw new Error(`Milestone report ${reportId} not found`);
    }
    const report = reportRes.rows[0];

    const achRes = await pool.query(
        `SELECT * FROM kemri_kpi_achievements WHERE report_id = $1 AND voided = 0`,
        [reportId]
    );
    const sitesRes = await pool.query(
        `SELECT id, latitude, longitude FROM kemri_research_sites
          WHERE project_id = $1 AND voided = 0`,
        [report.project_id]
    );

    const checks = {
        completeness: checkCompleteness(report, achRes.rows),
        numericRange: checkNumericRanges(report, achRes.rows),
        gps: checkGps(sitesRes.rows),
        financial: checkFinancialArithmetic(report),
        dateLogic: checkDateLogic(report, report),
        crossField: checkCrossField(report, achRes.rows),
        seruExpiry: checkSeruExpiry(report),
        duplicate: await checkDuplicate(report),
    };

    const allFlags = []
        .concat(checks.completeness.flagged)
        .concat(checks.numericRange.flagged)
        .concat(checks.gps.flagged)
        .concat(checks.financial.flagged)
        .concat(checks.dateLogic.flagged)
        .concat(checks.crossField.flagged)
        .concat(checks.seruExpiry.flagged)
        .concat(checks.duplicate.flagged);

    // Completeness is weighted 2x because <85% completeness must auto-return.
    const overall =
        (checks.completeness.score * 2 +
            checks.numericRange.score +
            checks.gps.score +
            checks.financial.score +
            checks.dateLogic.score +
            checks.crossField.score +
            checks.seruExpiry.score +
            checks.duplicate.score) /
        9;
    const overallRounded = Math.round(overall * 100) / 100;
    const passed = overallRounded >= PASS_THRESHOLD && checks.completeness.score >= PASS_THRESHOLD ? 1 : 0;

    const insertRes = await pool.query(
        `INSERT INTO kemri_dqa_scores
           (report_id, completeness_score, numeric_range_score, gps_validation_score,
            financial_arithmetic_score, date_logic_score, cross_field_score,
            seru_expiry_score, duplicate_check_score, overall_score, passed,
            flagged_fields)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
            reportId,
            checks.completeness.score,
            checks.numericRange.score,
            checks.gps.score,
            checks.financial.score,
            checks.dateLogic.score,
            checks.crossField.score,
            checks.seruExpiry.score,
            checks.duplicate.score,
            overallRounded,
            passed,
            JSON.stringify(allFlags),
        ]
    );

    await pool.query(
        `UPDATE kemri_milestone_reports
            SET dqa_score = $1, dqa_passed = $2,
                status = CASE WHEN $2 = 0 THEN 'dqa_returned' ELSE status END,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $3`,
        [overallRounded, passed, reportId]
    );

    return insertRes.rows[0];
}

module.exports = { runDqa };
