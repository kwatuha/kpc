/**
 * KEMRI / KIMES API routes.
 *
 * Mounted at /api/kemri (protected by the global authenticate middleware in
 * app.js). All routes use snake_case columns at the DB layer; the JSON
 * payloads use camelCase via SELECT aliases.
 *
 * Sub-resources:
 *   /api/kemri/centres         CRUD for KEMRI research centres
 *   /api/kemri/programmes      CRUD for thematic programmes
 *   /api/kemri/donors          CRUD for funders
 *   /api/kemri/projects        Research studies (KEMRI Form sections 1-4)
 *   /api/kemri/projects/:id    Single study with co-investigators, sites, objectives, KPIs
 *   /api/kemri/kpis            KPI plan (Step 2)
 *   /api/kemri/reports         Quarterly milestone reports (Step 3) + DQA + peer review
 *   /api/kemri/outputs         Post-Study Output Registry (Steps 11-15)
 *   /api/kemri/escalations     Non-conformity escalation log (Step 6 / Section 7)
 *   /api/kemri/dashboard/pi    PI Dashboard payload
 *   /api/kemri/dashboard/cd    Centre Director portfolio dashboard payload
 *
 * KEMRI Form v05 sections 5–11 sub-resources (added in
 * 20260510_kemri_form_sections_5_to_11.sql):
 *   /api/kemri/projects/:id/staff               §5  Staff plan
 *   /api/kemri/projects/:id/capacity-building   §5  Training events
 *   /api/kemri/projects/:id/equipment           §6  Equipment register
 *   /api/kemri/projects/:id/budget-lines        §7  Budget breakdown
 *   /api/kemri/projects/:id/lab-analyses        §9  Laboratory analyses
 *   /api/kemri/projects/:id/feedback            §10 Operations feedback
 *   /api/kemri/projects/:id/swot                §11 SWOT / lessons learned
 *
 * GIS dashboard:
 *   /api/kemri/gis/summary                       per-county aggregates + flat
 *                                                site list (used by the national
 *                                                GIS dashboard).
 *
 * Cross-cutting executive / operations / finance dashboards:
 *   /api/kemri/dashboard/summary                 portfolio totals, by-centre,
 *                                                by-donor, by-FY, RAG, escalations,
 *                                                SERU expiring, recent reports —
 *                                                consumed by Executive Summary,
 *                                                Operations and Finance dashboards.
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { runDqa } = require('../services/dqaEngine');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const handleError = (res, error, action = 'processing request') => {
    console.error(`[KEMRI] Error ${action}:`, error);
    return res.status(error.statusCode || 500).json({
        message: error.message || `Error ${action}`,
        code: error.code,
    });
};

const PROJECT_SELECT = `
    SELECT
      rp.id,
      rp.kimes_project_id   AS "kimesProjectId",
      rp.project_type       AS "projectType",
      rp.account_number     AS "accountNumber",
      rp.title,
      rp.short_name         AS "shortName",
      rp.pi_user_id         AS "piUserId",
      rp.pi_payroll_no      AS "piPayrollNo",
      rp.centre_id          AS "centreId",
      c.name                AS "centreName",
      c.code                AS "centreCode",
      rp.programme_id       AS "programmeId",
      pg.name               AS "programmeName",
      rp.primary_donor_id   AS "primaryDonorId",
      d.name                AS "primaryDonorName",
      rp.funding_amount     AS "fundingAmount",
      rp.funding_currency   AS "fundingCurrency",
      rp.funding_mechanism  AS "fundingMechanism",
      rp.study_type         AS "studyType",
      rp.contract_type      AS "contractType",
      rp.contract_number    AS "contractNumber",
      rp.grant_number       AS "grantNumber",
      rp.kemri_legal_number AS "kemriLegalNumber",
      rp.seru_approval_no   AS "seruApprovalNo",
      rp.seru_approval_date AS "seruApprovalDate",
      rp.seru_expiry_date   AS "seruExpiryDate",
      rp.nacosti_approval_no AS "nacostiApprovalNo",
      rp.nacosti_approval_date AS "nacostiApprovalDate",
      rp.proposed_start_date AS "proposedStartDate",
      rp.proposed_end_date   AS "proposedEndDate",
      rp.actual_start_date   AS "actualStartDate",
      rp.primary_org         AS "primaryOrg",
      rp.primary_org_country AS "primaryOrgCountry",
      rp.sdg_codes           AS "sdgCodes",
      rp.vision2030_codes    AS "vision2030Codes",
      rp.national_health_policy AS "nationalHealthPolicy",
      rp.strategic_plan_kras AS "strategicPlanKras",
      rp.strategic_plan_objectives AS "strategicPlanObjectives",
      rp.primary_objective_id AS "primaryObjectiveId",
      rp.programme_area      AS "programmeArea",
      rp.research_priority   AS "researchPriority",
      rp.status,
      rp.rag_status          AS "ragStatus",
      rp.current_phase       AS "currentPhase",
      rp.created_by          AS "createdBy",
      rp.created_at          AS "createdAt",
      rp.updated_at          AS "updatedAt"
    FROM kemri_research_projects rp
    LEFT JOIN kemri_centres c   ON c.id  = rp.centre_id
    LEFT JOIN kemri_programmes pg ON pg.id = rp.programme_id
    LEFT JOIN kemri_donors d    ON d.id  = rp.primary_donor_id
`;

const REPORT_SELECT = `
    SELECT
      mr.id,
      mr.project_id              AS "projectId",
      rp.kimes_project_id        AS "kimesProjectId",
      rp.title                   AS "projectTitle",
      mr.fy_label                AS "fyLabel",
      mr.quarter,
      mr.reporting_period_end    AS "reportingPeriodEnd",
      mr.pi_user_id              AS "piUserId",
      mr.staff_status_narrative  AS "staffStatusNarrative",
      mr.lab_analyses_summary    AS "labAnalysesSummary",
      mr.equipment_acquired_summary AS "equipmentAcquiredSummary",
      mr.capacity_building_summary  AS "capacityBuildingSummary",
      mr.emerging_risks          AS "emergingRisks",
      mr.budget_total            AS "budgetTotal",
      mr.funds_received          AS "fundsReceived",
      mr.expenditure_to_date     AS "expenditureToDate",
      mr.balance,
      mr.budget_variance_pct     AS "budgetVariancePct",
      mr.status,
      mr.submitted_at            AS "submittedAt",
      mr.dqa_score               AS "dqaScore",
      mr.dqa_passed              AS "dqaPassed",
      mr.reviewed_by             AS "reviewedBy",
      mr.reviewed_at             AS "reviewedAt",
      mr.rag_status              AS "ragStatus",
      mr.reviewer_comments       AS "reviewerComments",
      mr.created_at              AS "createdAt",
      mr.updated_at              AS "updatedAt"
    FROM kemri_milestone_reports mr
    JOIN kemri_research_projects rp ON rp.id = mr.project_id
`;

// Generate a friendly KIMES project ID like "KEMRI-CGMR-C-2025-001".
async function generateKimesId(centreCode) {
    const year = new Date().getFullYear();
    const prefix = `KEMRI-${centreCode || 'HQ'}-${year}-`;
    const res = await pool.query(
        `SELECT COUNT(*)::int AS n
           FROM kemri_research_projects
          WHERE kimes_project_id LIKE $1`,
        [`${prefix}%`]
    );
    const n = (res.rows?.[0]?.n || 0) + 1;
    return `${prefix}${String(n).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

router.get('/centres', async (req, res) => {
    try {
        const r = await pool.query(`
            SELECT id, code, name, description,
                   director_user_id AS "directorUserId",
                   region, city, county
              FROM kemri_centres
             WHERE voided = 0
             ORDER BY name`);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching centres');
    }
});

router.get('/programmes', async (req, res) => {
    try {
        const r = await pool.query(`
            SELECT id, code, name, description
              FROM kemri_programmes
             WHERE voided = 0
             ORDER BY name`);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching programmes');
    }
});

router.get('/donors', async (req, res) => {
    try {
        const r = await pool.query(`
            SELECT id, name, acronym,
                   donor_type AS "donorType",
                   contact_name AS "contactName",
                   contact_email AS "contactEmail",
                   country,
                   portal_enabled AS "portalEnabled"
              FROM kemri_donors
             WHERE voided = 0
             ORDER BY name`);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching donors');
    }
});

// ---------------------------------------------------------------------------
// Research projects (studies)
// ---------------------------------------------------------------------------

router.get('/projects', async (req, res) => {
    try {
        const { centreId, status, piUserId, q } = req.query;
        const filters = ['rp.voided = 0'];
        const params = [];
        if (centreId) {
            params.push(centreId);
            filters.push(`rp.centre_id = $${params.length}`);
        }
        if (status) {
            params.push(status);
            filters.push(`rp.status = $${params.length}`);
        }
        if (piUserId) {
            params.push(piUserId);
            filters.push(`rp.pi_user_id = $${params.length}`);
        }
        if (q) {
            params.push(`%${q}%`);
            filters.push(`(rp.title ILIKE $${params.length} OR rp.kimes_project_id ILIKE $${params.length} OR rp.short_name ILIKE $${params.length})`);
        }
        const sql = `${PROJECT_SELECT} WHERE ${filters.join(' AND ')} ORDER BY rp.created_at DESC LIMIT 500`;
        const r = await pool.query(sql, params);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching research projects');
    }
});

router.get('/projects/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
        const projRes = await pool.query(`${PROJECT_SELECT} WHERE rp.id = $1 AND rp.voided = 0`, [id]);
        if (!projRes.rows.length) return res.status(404).json({ message: 'Research project not found' });

        const [coi, sites, objectives, kpis, recentReports, strategicLinks] = await Promise.all([
            pool.query(
                `SELECT id, full_name AS "fullName", qualification, specialty, institution, role, email
                   FROM kemri_research_coinvestigators
                  WHERE project_id = $1 AND voided = 0
                  ORDER BY id`,
                [id]
            ),
            pool.query(
                `SELECT id, site_name AS "siteName", country, county, sub_county AS "subCounty",
                        ward, latitude, longitude
                   FROM kemri_research_sites
                  WHERE project_id = $1 AND voided = 0
                  ORDER BY id`,
                [id]
            ),
            pool.query(
                `SELECT id, ordinal, description
                   FROM kemri_research_objectives
                  WHERE project_id = $1 AND voided = 0
                  ORDER BY ordinal`,
                [id]
            ),
            pool.query(
                `SELECT id, indicator_code AS "indicatorCode", indicator_name AS "indicatorName",
                        description, unit_of_measure AS "unitOfMeasure",
                        baseline_value AS "baselineValue", target_value AS "targetValue",
                        expected_output AS "expectedOutput", reporting_frequency AS "reportingFrequency"
                   FROM kemri_kpis
                  WHERE project_id = $1 AND voided = 0
                  ORDER BY id`,
                [id]
            ),
            pool.query(
                `${REPORT_SELECT} WHERE mr.project_id = $1 AND mr.voided = 0
                 ORDER BY mr.fy_label DESC, mr.quarter DESC LIMIT 8`,
                [id]
            ),
            pool.query(
                `SELECT psl.sub_program_id AS id,
                        s."subProgramCode" AS code,
                        COALESCE(s."subProgramme", s."subProgramName") AS name,
                        p."programCode" AS "kraCode",
                        COALESCE(p.programme, p."programName") AS "kraName",
                        psl.contribution_pct AS "contributionPct",
                        psl.notes
                   FROM kemri_project_strategic_links psl
                   JOIN subprograms s ON s."subProgramId" = psl.sub_program_id
                   JOIN programs    p ON p."programId" = s."programId"
                  WHERE psl.project_id = $1 AND psl.voided = 0
                  ORDER BY s."subProgramCode"`,
                [id]
            ),
        ]);

        res.json({
            ...projRes.rows[0],
            coinvestigators: coi.rows,
            sites: sites.rows,
            objectives: objectives.rows,
            kpis: kpis.rows,
            recentReports: recentReports.rows,
            strategicLinks: strategicLinks.rows,
        });
    } catch (err) {
        handleError(res, err, 'fetching research project');
    }
});

router.post('/projects', async (req, res) => {
    const client = await pool.getConnection();
    try {
        const b = req.body || {};
        if (!b.title) return res.status(400).json({ message: 'Title is required' });

        await client.beginTransaction();

        // Resolve centre code for ID generation
        let centreCode = 'HQ';
        if (b.centreId) {
            const cr = await client.query(`SELECT code FROM kemri_centres WHERE id = $1`, [b.centreId]);
            if (cr.rows?.[0]?.code) centreCode = cr.rows[0].code;
        }
        const kimesId = await generateKimesId(centreCode);

        const piUserId = b.piUserId || req.user?.id || req.user?.userId || null;

        const insertRes = await client.query(
            `INSERT INTO kemri_research_projects (
                kimes_project_id, project_type, account_number, title, short_name,
                pi_user_id, pi_payroll_no, centre_id, programme_id, primary_donor_id,
                funding_amount, funding_currency, funding_mechanism, study_type,
                contract_type, contract_number, grant_number, kemri_legal_number,
                seru_approval_no, seru_approval_date, seru_expiry_date,
                nacosti_approval_no, nacosti_approval_date,
                proposed_start_date, proposed_end_date,
                primary_org, primary_org_country,
                sdg_codes, vision2030_codes, national_health_policy,
                strategic_plan_kras, strategic_plan_objectives,
                programme_area, research_priority, status, current_phase, created_by
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
                $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
                $35,$36,$37
            ) RETURNING id, kimes_project_id AS "kimesProjectId"`,
            [
                kimesId,
                b.projectType || 'external',
                b.accountNumber || null,
                b.title,
                b.shortName || null,
                piUserId,
                b.piPayrollNo || null,
                b.centreId || null,
                b.programmeId || null,
                b.primaryDonorId || null,
                b.fundingAmount || null,
                b.fundingCurrency || 'KES',
                b.fundingMechanism || null,
                b.studyType || null,
                b.contractType || null,
                b.contractNumber || null,
                b.grantNumber || null,
                b.kemriLegalNumber || null,
                b.seruApprovalNo || null,
                b.seruApprovalDate || null,
                b.seruExpiryDate || null,
                b.nacostiApprovalNo || null,
                b.nacostiApprovalDate || null,
                b.proposedStartDate || null,
                b.proposedEndDate || null,
                b.primaryOrg || null,
                b.primaryOrgCountry || null,
                JSON.stringify(b.sdgCodes || []),
                JSON.stringify(b.vision2030Codes || []),
                JSON.stringify(b.nationalHealthPolicy || []),
                JSON.stringify(b.strategicPlanKras || []),
                JSON.stringify(b.strategicPlanObjectives || []),
                b.programmeArea || null,
                b.researchPriority || null,
                b.status || 'pre_study',
                'registration',
                req.user?.id || req.user?.userId || null,
            ]
        );
        const projectId = insertRes.rows[0].id;

        // Co-investigators
        for (const c of b.coinvestigators || []) {
            if (!c.fullName) continue;
            await client.query(
                `INSERT INTO kemri_research_coinvestigators
                   (project_id, full_name, qualification, specialty, institution, role, email)
                 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [projectId, c.fullName, c.qualification, c.specialty, c.institution, c.role, c.email]
            );
        }
        // Sites
        for (const s of b.sites || []) {
            if (!s.siteName) continue;
            await client.query(
                `INSERT INTO kemri_research_sites
                   (project_id, site_name, country, county, sub_county, ward, latitude, longitude)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [
                    projectId, s.siteName, s.country, s.county, s.subCounty, s.ward,
                    s.latitude || null, s.longitude || null,
                ]
            );
        }
        // Objectives (max 5, keep order)
        const objs = (b.objectives || []).slice(0, 5);
        for (let i = 0; i < objs.length; i += 1) {
            const o = objs[i];
            const desc = typeof o === 'string' ? o : o?.description;
            if (!desc) continue;
            await client.query(
                `INSERT INTO kemri_research_objectives (project_id, ordinal, description)
                 VALUES ($1,$2,$3)`,
                [projectId, i + 1, desc]
            );
        }

        // Strategic-plan alignment (KEMRI 2023-2027). Two forms accepted:
        //   primaryObjectiveId  -> single FK on the project row (preferred)
        //   linkedObjectiveIds  -> array of sub_program_ids to bridge through
        //                          kemri_project_strategic_links (many-to-many)
        if (b.primaryObjectiveId) {
            await client.query(
                `UPDATE kemri_research_projects SET primary_objective_id = $1 WHERE id = $2`,
                [Number(b.primaryObjectiveId), projectId]
            );
        }
        const linked = Array.isArray(b.linkedObjectiveIds) ? b.linkedObjectiveIds : [];
        if (b.primaryObjectiveId && !linked.includes(Number(b.primaryObjectiveId))) {
            linked.push(Number(b.primaryObjectiveId));
        }
        for (const objId of linked) {
            const n = Number(objId);
            if (!Number.isFinite(n)) continue;
            await client.query(
                `INSERT INTO kemri_project_strategic_links (project_id, sub_program_id, created_by)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [projectId, n, req.user?.id || req.user?.userId || null]
            );
        }

        await client.commit();
        res.status(201).json({
            message: 'Research project registered',
            id: projectId,
            kimesProjectId: insertRes.rows[0].kimesProjectId,
        });
    } catch (err) {
        try { await client.rollback(); } catch (_) { /* noop */ }
        handleError(res, err, 'creating research project');
    } finally {
        client.release();
    }
});

router.put('/projects/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
        const b = req.body || {};
        const allowed = {
            title: 'title',
            shortName: 'short_name',
            projectType: 'project_type',
            accountNumber: 'account_number',
            piPayrollNo: 'pi_payroll_no',
            centreId: 'centre_id',
            programmeId: 'programme_id',
            primaryDonorId: 'primary_donor_id',
            fundingAmount: 'funding_amount',
            fundingCurrency: 'funding_currency',
            fundingMechanism: 'funding_mechanism',
            studyType: 'study_type',
            contractType: 'contract_type',
            contractNumber: 'contract_number',
            grantNumber: 'grant_number',
            kemriLegalNumber: 'kemri_legal_number',
            seruApprovalNo: 'seru_approval_no',
            seruApprovalDate: 'seru_approval_date',
            seruExpiryDate: 'seru_expiry_date',
            nacostiApprovalNo: 'nacosti_approval_no',
            nacostiApprovalDate: 'nacosti_approval_date',
            proposedStartDate: 'proposed_start_date',
            proposedEndDate: 'proposed_end_date',
            actualStartDate: 'actual_start_date',
            primaryOrg: 'primary_org',
            primaryOrgCountry: 'primary_org_country',
            programmeArea: 'programme_area',
            researchPriority: 'research_priority',
            status: 'status',
            currentPhase: 'current_phase',
        };
        const updates = [];
        const params = [];
        for (const [k, col] of Object.entries(allowed)) {
            if (Object.prototype.hasOwnProperty.call(b, k)) {
                params.push(b[k]);
                updates.push(`${col} = $${params.length}`);
            }
        }
        for (const jsonKey of ['sdgCodes', 'vision2030Codes', 'nationalHealthPolicy', 'strategicPlanKras', 'strategicPlanObjectives']) {
            if (Object.prototype.hasOwnProperty.call(b, jsonKey)) {
                params.push(JSON.stringify(b[jsonKey] || []));
                updates.push(`${jsonKey === 'sdgCodes' ? 'sdg_codes' : jsonKey === 'vision2030Codes' ? 'vision2030_codes' : jsonKey === 'nationalHealthPolicy' ? 'national_health_policy' : jsonKey === 'strategicPlanKras' ? 'strategic_plan_kras' : 'strategic_plan_objectives'} = $${params.length}`);
            }
        }
        if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
        params.push(id);
        await pool.query(
            `UPDATE kemri_research_projects
                SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
              WHERE id = $${params.length} AND voided = 0`,
            params
        );
        res.json({ message: 'Updated' });
    } catch (err) {
        handleError(res, err, 'updating research project');
    }
});

router.delete('/projects/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await pool.query(
            `UPDATE kemri_research_projects SET voided = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
        res.json({ message: 'Project archived' });
    } catch (err) {
        handleError(res, err, 'deleting research project');
    }
});

// ---------------------------------------------------------------------------
// KPIs (Step 2 — KPI & Milestone Plan)
// ---------------------------------------------------------------------------

router.get('/projects/:projectId/kpis', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT id, indicator_code AS "indicatorCode", indicator_name AS "indicatorName",
                    description, unit_of_measure AS "unitOfMeasure",
                    baseline_value AS "baselineValue", target_value AS "targetValue",
                    expected_output AS "expectedOutput", data_source AS "dataSource",
                    collection_method AS "collectionMethod",
                    reporting_frequency AS "reportingFrequency",
                    is_smart AS "isSmart",
                    approved_by AS "approvedBy", approved_at AS "approvedAt"
               FROM kemri_kpis
              WHERE project_id = $1 AND voided = 0
              ORDER BY id`,
            [req.params.projectId]
        );
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching KPIs');
    }
});

router.post('/projects/:projectId/kpis', async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.indicatorName) return res.status(400).json({ message: 'indicatorName is required' });
        const r = await pool.query(
            `INSERT INTO kemri_kpis (project_id, indicator_code, indicator_name, description,
                                     unit_of_measure, baseline_value, target_value, expected_output,
                                     data_source, collection_method, reporting_frequency)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING id`,
            [
                req.params.projectId,
                b.indicatorCode || null,
                b.indicatorName,
                b.description || null,
                b.unitOfMeasure || null,
                b.baselineValue || null,
                b.targetValue || null,
                b.expectedOutput || null,
                b.dataSource || null,
                b.collectionMethod || null,
                b.reportingFrequency || 'quarterly',
            ]
        );
        res.status(201).json({ id: r.rows[0].id });
    } catch (err) {
        handleError(res, err, 'creating KPI');
    }
});

router.delete('/kpis/:id', async (req, res) => {
    try {
        await pool.query(`UPDATE kemri_kpis SET voided = 1 WHERE id = $1`, [req.params.id]);
        res.json({ message: 'KPI removed' });
    } catch (err) {
        handleError(res, err, 'removing KPI');
    }
});

// ---------------------------------------------------------------------------
// Milestone (quarterly) reports — Steps 3, 4, 5
// ---------------------------------------------------------------------------

router.get('/reports', async (req, res) => {
    try {
        const { projectId, status, centreId, reviewQueue } = req.query;
        const filters = ['mr.voided = 0'];
        const params = [];
        if (projectId) {
            params.push(projectId);
            filters.push(`mr.project_id = $${params.length}`);
        }
        if (status) {
            params.push(status);
            filters.push(`mr.status = $${params.length}`);
        }
        if (centreId) {
            params.push(centreId);
            filters.push(`rp.centre_id = $${params.length}`);
        }
        if (reviewQueue === 'true' || reviewQueue === '1') {
            filters.push(`mr.status IN ('submitted','under_review')`);
            filters.push(`mr.dqa_passed = 1`);
        }
        const sql = `${REPORT_SELECT} WHERE ${filters.join(' AND ')}
                     ORDER BY mr.submitted_at DESC NULLS LAST, mr.created_at DESC LIMIT 500`;
        const r = await pool.query(sql, params);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching milestone reports');
    }
});

router.get('/reports/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const reportRes = await pool.query(`${REPORT_SELECT} WHERE mr.id = $1`, [id]);
        if (!reportRes.rows.length) return res.status(404).json({ message: 'Report not found' });

        const [achievements, dqa, reviews] = await Promise.all([
            pool.query(
                `SELECT a.id, a.kpi_id AS "kpiId",
                        k.indicator_name AS "indicatorName",
                        k.unit_of_measure AS "unitOfMeasure",
                        a.target_value   AS "targetValue",
                        a.actual_value   AS "actualValue",
                        a.achievement_pct AS "achievementPct",
                        a.status, a.comments
                   FROM kemri_kpi_achievements a
                   JOIN kemri_kpis k ON k.id = a.kpi_id
                  WHERE a.report_id = $1 AND a.voided = 0
                  ORDER BY a.id`,
                [id]
            ),
            pool.query(
                `SELECT * FROM kemri_dqa_scores WHERE report_id = $1
                  ORDER BY ran_at DESC LIMIT 1`,
                [id]
            ),
            pool.query(
                `SELECT id, reviewer_user_id AS "reviewerUserId",
                        reviewer_role AS "reviewerRole",
                        decision, rag_status AS "ragStatus",
                        comments, query_to_pi AS "queryToPi",
                        reviewed_at AS "reviewedAt"
                   FROM kemri_peer_reviews
                  WHERE report_id = $1 AND voided = 0
                  ORDER BY reviewed_at DESC`,
                [id]
            ),
        ]);
        res.json({
            ...reportRes.rows[0],
            kpiAchievements: achievements.rows,
            dqa: dqa.rows[0] || null,
            reviews: reviews.rows,
        });
    } catch (err) {
        handleError(res, err, 'fetching milestone report');
    }
});

router.post('/reports', async (req, res) => {
    const client = await pool.getConnection();
    try {
        const b = req.body || {};
        if (!b.projectId || !b.fyLabel || !b.quarter) {
            return res.status(400).json({ message: 'projectId, fyLabel, and quarter are required' });
        }
        await client.beginTransaction();

        const userId = req.user?.id || req.user?.userId || null;
        const balance = b.budgetTotal !== undefined && b.expenditureToDate !== undefined
            ? Number(b.budgetTotal) - Number(b.expenditureToDate)
            : (b.balance ?? null);
        const variance = b.budgetTotal && b.expenditureToDate
            ? Math.round(((Number(b.expenditureToDate) - Number(b.budgetTotal)) / Number(b.budgetTotal)) * 10000) / 100
            : null;

        const insertRes = await client.query(
            `INSERT INTO kemri_milestone_reports
               (project_id, fy_label, quarter, reporting_period_end, pi_user_id,
                staff_status_narrative, lab_analyses_summary, equipment_acquired_summary,
                capacity_building_summary, emerging_risks,
                budget_total, funds_received, expenditure_to_date, balance, budget_variance_pct,
                status, submitted_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
             ON CONFLICT (project_id, fy_label, quarter)
             DO UPDATE SET
               staff_status_narrative   = EXCLUDED.staff_status_narrative,
               lab_analyses_summary     = EXCLUDED.lab_analyses_summary,
               equipment_acquired_summary = EXCLUDED.equipment_acquired_summary,
               capacity_building_summary = EXCLUDED.capacity_building_summary,
               emerging_risks           = EXCLUDED.emerging_risks,
               budget_total             = EXCLUDED.budget_total,
               funds_received           = EXCLUDED.funds_received,
               expenditure_to_date      = EXCLUDED.expenditure_to_date,
               balance                  = EXCLUDED.balance,
               budget_variance_pct      = EXCLUDED.budget_variance_pct,
               status                   = EXCLUDED.status,
               submitted_at             = EXCLUDED.submitted_at,
               updated_at               = CURRENT_TIMESTAMP
             RETURNING id`,
            [
                b.projectId,
                b.fyLabel,
                b.quarter,
                b.reportingPeriodEnd || null,
                userId,
                b.staffStatusNarrative || null,
                b.labAnalysesSummary || null,
                b.equipmentAcquiredSummary || null,
                b.capacityBuildingSummary || null,
                b.emergingRisks || null,
                b.budgetTotal || null,
                b.fundsReceived || null,
                b.expenditureToDate || null,
                balance,
                variance,
                b.submit ? 'submitted' : 'draft',
                b.submit ? new Date() : null,
            ]
        );
        const reportId = insertRes.rows[0].id;

        // Replace KPI achievements for this report
        await client.query(
            `UPDATE kemri_kpi_achievements SET voided = 1 WHERE report_id = $1`,
            [reportId]
        );
        for (const ach of b.kpiAchievements || []) {
            if (!ach.kpiId) continue;
            const pct = ach.targetValue && Number(ach.targetValue) > 0 && ach.actualValue !== undefined
                ? Math.round((Number(ach.actualValue) / Number(ach.targetValue)) * 10000) / 100
                : null;
            await client.query(
                `INSERT INTO kemri_kpi_achievements
                   (report_id, kpi_id, target_value, actual_value, achievement_pct, status, comments)
                 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                [
                    reportId,
                    ach.kpiId,
                    ach.targetValue || null,
                    ach.actualValue || null,
                    ach.achievementPct ?? pct,
                    ach.status || null,
                    ach.comments || null,
                ]
            );
        }

        await client.commit();

        // On submit, run DQA outside the transaction
        let dqa = null;
        if (b.submit) {
            try {
                dqa = await runDqa(reportId);
            } catch (dqaErr) {
                console.error('[KEMRI] DQA run failed:', dqaErr.message);
            }
        }

        res.status(201).json({ id: reportId, dqa });
    } catch (err) {
        try { await client.rollback(); } catch (_) { /* noop */ }
        handleError(res, err, 'saving milestone report');
    } finally {
        client.release();
    }
});

router.post('/reports/:id/dqa', async (req, res) => {
    try {
        const score = await runDqa(Number(req.params.id));
        res.json(score);
    } catch (err) {
        handleError(res, err, 'running DQA');
    }
});

router.post('/reports/:id/review', async (req, res) => {
    const client = await pool.getConnection();
    try {
        const id = Number(req.params.id);
        const b = req.body || {};
        const decision = (b.decision || '').toLowerCase();
        if (!['accept', 'query', 'escalate'].includes(decision)) {
            return res.status(400).json({ message: 'decision must be accept | query | escalate' });
        }
        if (decision === 'accept' && !['green', 'amber', 'red'].includes((b.ragStatus || '').toLowerCase())) {
            return res.status(400).json({ message: 'ragStatus required when accepting' });
        }
        const reviewerId = req.user?.id || req.user?.userId || b.reviewerUserId || null;

        await client.beginTransaction();
        await client.query(
            `INSERT INTO kemri_peer_reviews
               (report_id, reviewer_user_id, reviewer_role, decision, rag_status,
                comments, query_to_pi)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                id,
                reviewerId,
                b.reviewerRole || 'centre_director',
                decision,
                b.ragStatus ? b.ragStatus.toLowerCase() : null,
                b.comments || null,
                b.queryToPi || null,
            ]
        );

        let newStatus = 'queried';
        if (decision === 'accept') newStatus = 'approved';
        if (decision === 'escalate') newStatus = 'escalated';

        await client.query(
            `UPDATE kemri_milestone_reports
                SET status = $1,
                    rag_status = COALESCE($2, rag_status),
                    reviewed_by = $3,
                    reviewed_at = CURRENT_TIMESTAMP,
                    reviewer_comments = $4,
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = $5`,
            [newStatus, b.ragStatus ? b.ragStatus.toLowerCase() : null, reviewerId, b.comments || null, id]
        );

        // Mirror RAG to project + history if accepted
        if (decision === 'accept' && b.ragStatus) {
            const projRes = await client.query(
                `SELECT project_id FROM kemri_milestone_reports WHERE id = $1`,
                [id]
            );
            const projectId = projRes.rows?.[0]?.project_id;
            if (projectId) {
                await client.query(
                    `UPDATE kemri_research_projects
                        SET rag_status = $1, updated_at = CURRENT_TIMESTAMP
                      WHERE id = $2`,
                    [b.ragStatus.toLowerCase(), projectId]
                );
                await client.query(
                    `INSERT INTO kemri_rag_history (project_id, report_id, rag_status, recorded_by, reason)
                     VALUES ($1,$2,$3,$4,$5)`,
                    [projectId, id, b.ragStatus.toLowerCase(), reviewerId, b.comments || null]
                );
            }
        }

        // Auto-create escalation row when reviewer escalates.
        // Level 1–5 may be supplied; defaults to L3 (Significant Non-Conformity)
        // which is the threshold at which Centre Director escalation is
        // typically triggered per Concept §3 / §7.
        if (decision === 'escalate') {
            const projRes = await client.query(
                `SELECT project_id FROM kemri_milestone_reports WHERE id = $1`,
                [id]
            );
            const escLevel = Math.max(1, Math.min(5, Number(b.escalationLevel) || 3));
            const classMap = { 1: 'minor', 2: 'moderate', 3: 'significant', 4: 'severe', 5: 'institutional' };
            await client.query(
                `INSERT INTO kemri_escalations
                   (project_id, report_id, level, classification, triggered_by,
                    notice_subject, notice_body, auto_generated)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,0)`,
                [
                    projRes.rows?.[0]?.project_id,
                    id,
                    escLevel,
                    classMap[escLevel] || 'significant',
                    reviewerId,
                    `L${escLevel} ${classMap[escLevel] || 'significant'} — Centre Director escalation`,
                    b.comments || 'Escalated by Centre Director after peer review.',
                ]
            );
        }

        await client.commit();
        res.json({ message: `Review recorded (${decision})`, status: newStatus });
    } catch (err) {
        try { await client.rollback(); } catch (_) { /* noop */ }
        handleError(res, err, 'submitting peer review');
    } finally {
        client.release();
    }
});

// ---------------------------------------------------------------------------
// Post-Study Output Registry (Steps 11-15)
// ---------------------------------------------------------------------------

router.get('/outputs', async (req, res) => {
    try {
        const { projectId, outputType } = req.query;
        const filters = ['o.voided = 0'];
        const params = [];
        if (projectId) {
            params.push(projectId);
            filters.push(`o.project_id = $${params.length}`);
        }
        if (outputType) {
            params.push(outputType);
            filters.push(`o.output_type = $${params.length}`);
        }
        const sql = `
            SELECT o.id, o.project_id AS "projectId",
                   rp.kimes_project_id AS "kimesProjectId",
                   rp.title AS "projectTitle",
                   o.output_type AS "outputType",
                   o.title, o.authors, o.date_recorded AS "dateRecorded", o.status,
                   o.venue, o.presentation_type AS "presentationType",
                   o.doi, o.pubmed_id AS "pubmedId", o.url,
                   o.citation_count AS "citationCount", o.impact_factor AS "impactFactor",
                   o.repository, o.access_level AS "accessLevel",
                   o.embargo_until AS "embargoUntil",
                   o.fair_score        AS "fairScore",
                   o.fair_findable     AS "fairFindable",
                   o.fair_accessible   AS "fairAccessible",
                   o.fair_interoperable AS "fairInteroperable",
                   o.fair_reusable     AS "fairReusable",
                   o.ip_type AS "ipType", o.patent_number AS "patentNumber",
                   o.jurisdiction, o.commercialisation_stage AS "commercialisationStage",
                   o.patent_expiry_date AS "patentExpiryDate", o.revenue_generated AS "revenueGenerated",
                   o.policy_audience AS "policyAudience", o.uptake_score AS "uptakeScore",
                   o.patent_expiry_alert_at AS "patentExpiryAlertAt",
                   o.high_impact_alert_at   AS "highImpactAlertAt",
                   o.metadata, o.reported_by AS "reportedBy",
                   o.created_at AS "createdAt"
              FROM kemri_outputs o
              JOIN kemri_research_projects rp ON rp.id = o.project_id
             WHERE ${filters.join(' AND ')}
             ORDER BY o.date_recorded DESC NULLS LAST, o.created_at DESC
             LIMIT 500`;
        const r = await pool.query(sql, params);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching outputs');
    }
});

router.post('/outputs', async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.projectId || !b.outputType || !b.title) {
            return res.status(400).json({ message: 'projectId, outputType, and title are required' });
        }
        // KIMES v5 §3 Step 13 — FAIR rolled-up score auto-derives from the
        // four components when all are supplied and no overall score is set.
        const fairParts = [b.fairFindable, b.fairAccessible, b.fairInteroperable, b.fairReusable];
        const allPresent = fairParts.every((v) => v !== undefined && v !== null && v !== '');
        if (allPresent && (b.fairScore === undefined || b.fairScore === null || b.fairScore === '')) {
            b.fairScore = fairParts.map(Number).reduce((a, c) => a + c, 0);
        }
        const r = await pool.query(
            `INSERT INTO kemri_outputs
               (project_id, output_type, title, authors, date_recorded, status,
                venue, presentation_type, doi, pubmed_id, url, citation_count, impact_factor,
                repository, access_level, embargo_until,
                fair_score, fair_findable, fair_accessible, fair_interoperable, fair_reusable,
                ip_type, patent_number, jurisdiction, commercialisation_stage,
                patent_expiry_date, revenue_generated,
                policy_audience, uptake_score, metadata, reported_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
                     $17,$18,$19,$20,$21,
                     $22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
             RETURNING id`,
            [
                b.projectId, b.outputType, b.title, b.authors || null,
                b.dateRecorded || null, b.status || null,
                b.venue || null, b.presentationType || null, b.doi || null, b.pubmedId || null, b.url || null,
                b.citationCount || 0, b.impactFactor || null,
                b.repository || null, b.accessLevel || null, b.embargoUntil || null,
                b.fairScore       || null,
                b.fairFindable    || null,
                b.fairAccessible  || null,
                b.fairInteroperable || null,
                b.fairReusable    || null,
                b.ipType || null, b.patentNumber || null, b.jurisdiction || null,
                b.commercialisationStage || null,
                b.patentExpiryDate || null, b.revenueGenerated || null,
                b.policyAudience || null, b.uptakeScore || null,
                b.metadata ? JSON.stringify(b.metadata) : null,
                req.user?.id || req.user?.userId || null,
            ]
        );
        res.status(201).json({ id: r.rows[0].id });
    } catch (err) {
        handleError(res, err, 'creating output');
    }
});

router.delete('/outputs/:id', async (req, res) => {
    try {
        await pool.query(`UPDATE kemri_outputs SET voided = 1 WHERE id = $1`, [req.params.id]);
        res.json({ message: 'Output removed' });
    } catch (err) {
        handleError(res, err, 'removing output');
    }
});

// ---------------------------------------------------------------------------
// Escalations
// ---------------------------------------------------------------------------

router.get('/escalations', async (req, res) => {
    try {
        const { level, resolved, projectId } = req.query;
        const filters = ['e.voided = 0'];
        const params = [];
        if (level) {
            params.push(level);
            filters.push(`e.level = $${params.length}`);
        }
        if (resolved === 'true' || resolved === '1') filters.push('e.resolved = 1');
        else if (resolved === 'false' || resolved === '0') filters.push('e.resolved = 0');
        if (projectId) {
            params.push(projectId);
            filters.push(`e.project_id = $${params.length}`);
        }
        const sql = `
            SELECT e.id, e.project_id AS "projectId",
                   rp.kimes_project_id AS "kimesProjectId",
                   rp.title AS "projectTitle",
                   c.code AS "centreCode",
                   e.report_id AS "reportId",
                   mr.fy_label AS "fyLabel", mr.quarter AS "quarter",
                   mr.reporting_period_end AS "reportingPeriodEnd",
                   e.level, e.classification,
                   e.deadline, e.days_late AS "daysLate",
                   e.auto_generated AS "autoGenerated",
                   e.last_check_at AS "lastCheckAt",
                   e.donor_letter_at AS "donorLetterAt",
                   (e.donor_letter_body IS NOT NULL) AS "hasDonorLetter",
                   e.irb_decision         AS "irbDecision",
                   e.irb_decision_at      AS "irbDecisionAt",
                   e.irb_notes            AS "irbNotes",
                   e.dg_approved_at       AS "dgApprovedAt",
                   e.dg_notes             AS "dgNotes",
                   e.legal_cleared_at     AS "legalClearedAt",
                   e.legal_notes          AS "legalNotes",
                   e.donor_letter_sent_at AS "donorLetterSentAt",
                   e.donor_recipient      AS "donorRecipient",
                   e.triggered_by AS "triggeredBy",
                   e.triggered_at AS "triggeredAt",
                   e.notice_subject AS "noticeSubject",
                   e.notice_body AS "noticeBody",
                   e.resolved, e.resolved_at AS "resolvedAt",
                   e.resolution_notes AS "resolutionNotes"
              FROM kemri_escalations e
              JOIN kemri_research_projects rp ON rp.id = e.project_id
         LEFT JOIN kemri_centres c ON c.id = rp.centre_id
         LEFT JOIN kemri_milestone_reports mr ON mr.id = e.report_id
             WHERE ${filters.join(' AND ')}
             ORDER BY e.resolved ASC, e.level DESC, e.triggered_at DESC LIMIT 500`;
        const r = await pool.query(sql, params);
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'fetching escalations');
    }
});

// Aggregated counts by level for the inbox header (cheap separate call so the
// list page can show "L1 (4) · L2 (2) · L3 (1) · L4 (0)" tabs without a
// full list refresh).
router.get('/escalations/summary', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT level,
                    SUM(CASE WHEN resolved = 0 THEN 1 ELSE 0 END)::int AS open,
                    SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END)::int AS resolved
               FROM kemri_escalations
              WHERE voided = 0
              GROUP BY level
              ORDER BY level`
        );
        const out = { 1: { open: 0, resolved: 0 }, 2: { open: 0, resolved: 0 }, 3: { open: 0, resolved: 0 }, 4: { open: 0, resolved: 0 }, 5: { open: 0, resolved: 0 } };
        for (const row of r.rows) {
            out[row.level] = { open: row.open, resolved: row.resolved };
        }
        res.json(out);
    } catch (err) {
        handleError(res, err, 'summarising escalations');
    }
});

router.post('/escalations/:id/resolve', async (req, res) => {
    try {
        await pool.query(
            `UPDATE kemri_escalations
                SET resolved = 1, resolved_at = CURRENT_TIMESTAMP,
                    resolution_notes = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2`,
            [req.body?.resolutionNotes || null, req.params.id]
        );
        res.json({ message: 'Escalation resolved' });
    } catch (err) {
        handleError(res, err, 'resolving escalation');
    }
});

// Render or fetch the DG-NCF-001 donor non-conformity letter for a Level-4
// escalation.  The engine renders a draft automatically the first time an
// escalation crosses L4; this route lets the DG / Legal preview, regenerate
// or mark-sent.
router.get('/escalations/:id/letter', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT e.id, e.level, e.classification, e.days_late, e.deadline,
                    e.donor_letter_body AS "letterBody",
                    e.donor_letter_at   AS "letterAt",
                    e.irb_decision      AS "irbDecision",
                    e.irb_decision_at   AS "irbDecisionAt",
                    e.irb_decision_by   AS "irbDecisionBy",
                    e.irb_notes         AS "irbNotes",
                    e.dg_approved_at    AS "dgApprovedAt",
                    e.dg_approved_by    AS "dgApprovedBy",
                    e.dg_notes          AS "dgNotes",
                    e.legal_cleared_at  AS "legalClearedAt",
                    e.legal_cleared_by  AS "legalClearedBy",
                    e.legal_notes       AS "legalNotes",
                    e.donor_letter_sent_at AS "donorLetterSentAt",
                    e.donor_letter_sent_by AS "donorLetterSentBy",
                    e.donor_recipient   AS "donorRecipient",
                    rp.id AS "projectId", rp.title, rp.short_name AS "shortName",
                    rp.kimes_project_id AS "kimesProjectId",
                    mr.fy_label AS "fyLabel", mr.quarter, mr.reporting_period_end
               FROM kemri_escalations e
               JOIN kemri_research_projects rp ON rp.id = e.project_id
          LEFT JOIN kemri_milestone_reports mr ON mr.id = e.report_id
              WHERE e.id = $1 AND e.voided = 0`,
            [req.params.id]
        );
        if (r.rows.length === 0) return res.status(404).json({ message: 'Escalation not found' });
        const row = r.rows[0];
        let letter = row.letterBody;
        if (!letter) {
            const { renderDgNcf001 } = require('../services/kemriWorkflowEngine');
            letter = renderDgNcf001({
                project: { id: row.projectId, title: row.title, short_name: row.shortName, kimes_project_id: row.kimesProjectId },
                report: { fy_label: row.fyLabel, quarter: row.quarter, reporting_period_end: row.reporting_period_end },
                escalation: { level: row.level, classification: row.classification, days_late: row.days_late },
            });
        }
        // Roll up the IRB → DG → Legal gate state for the UI so it can light up
        // each rung and decide whether the "Send to donor" button is enabled.
        const gates = {
            irbRecommended: row.irbDecision === 'recommend_notify',
            irbHeld:        row.irbDecision === 'recommend_hold',
            irbDecisionAt:  row.irbDecisionAt,
            dgApproved:     !!row.dgApprovedAt,
            dgApprovedAt:   row.dgApprovedAt,
            legalCleared:   !!row.legalClearedAt,
            legalClearedAt: row.legalClearedAt,
            sent:           !!row.donorLetterSentAt,
            sentAt:         row.donorLetterSentAt,
        };
        gates.readyToSend = gates.irbRecommended && gates.dgApproved && gates.legalCleared && !gates.sent;
        res.json({
            escalationId: row.id,
            level: row.level,
            classification: row.classification,
            daysLate: row.days_late,
            generatedAt: row.letterAt,
            kimesProjectId: row.kimesProjectId,
            title: row.title,
            letter,
            gates,
            donorRecipient: row.donorRecipient,
            notes: {
                irb:   row.irbNotes,
                dg:    row.dgNotes,
                legal: row.legalNotes,
            },
        });
    } catch (err) {
        handleError(res, err, 'fetching DG-NCF-001 letter');
    }
});

// -- IRB decision -----------------------------------------------------------
//   The Internal Review Board records its recommendation to either NOTIFY
//   the donor or HOLD (remediate internally). This is the FIRST gate that
//   must be cleared before DG approval.
router.post('/escalations/:id/irb', async (req, res) => {
    try {
        const decision = (req.body?.decision || '').toLowerCase();
        if (!['recommend_notify', 'recommend_hold'].includes(decision)) {
            return res.status(400).json({ message: "decision must be 'recommend_notify' or 'recommend_hold'" });
        }
        const userId = req.user?.userId || req.user?.id || null;
        await pool.query(
            `UPDATE kemri_escalations
                SET irb_decision    = $1,
                    irb_decision_at = CURRENT_TIMESTAMP,
                    irb_decision_by = $2,
                    irb_notes       = $3,
                    updated_at      = CURRENT_TIMESTAMP
              WHERE id = $4 AND voided = 0`,
            [decision, userId, req.body?.notes || null, req.params.id]
        );
        res.json({ message: 'IRB decision recorded', decision });
    } catch (err) {
        handleError(res, err, 'recording IRB decision');
    }
});

// -- DG approval ------------------------------------------------------------
//   Director General signs off on transmitting the DG-NCF-001 letter. The
//   IRB must have recommended NOTIFY for this to be enabled in the UI; the
//   API still enforces a logical precondition.
router.post('/escalations/:id/dg-approve', async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id || null;
        const r = await pool.query(`SELECT irb_decision FROM kemri_escalations WHERE id = $1`, [req.params.id]);
        if (r.rows[0]?.irb_decision !== 'recommend_notify') {
            return res.status(409).json({ message: 'DG approval requires IRB recommendation = recommend_notify first.' });
        }
        await pool.query(
            `UPDATE kemri_escalations
                SET dg_approved_at = CURRENT_TIMESTAMP,
                    dg_approved_by = $1,
                    dg_notes       = $2,
                    updated_at     = CURRENT_TIMESTAMP
              WHERE id = $3 AND voided = 0`,
            [userId, req.body?.notes || null, req.params.id]
        );
        res.json({ message: 'DG approval recorded' });
    } catch (err) {
        handleError(res, err, 'recording DG approval');
    }
});

// -- Legal Counsel clearance ------------------------------------------------
router.post('/escalations/:id/legal-clear', async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id || null;
        const r = await pool.query(`SELECT dg_approved_at FROM kemri_escalations WHERE id = $1`, [req.params.id]);
        if (!r.rows[0]?.dg_approved_at) {
            return res.status(409).json({ message: 'Legal clearance requires DG approval first.' });
        }
        await pool.query(
            `UPDATE kemri_escalations
                SET legal_cleared_at = CURRENT_TIMESTAMP,
                    legal_cleared_by = $1,
                    legal_notes      = $2,
                    updated_at       = CURRENT_TIMESTAMP
              WHERE id = $3 AND voided = 0`,
            [userId, req.body?.notes || null, req.params.id]
        );
        res.json({ message: 'Legal clearance recorded' });
    } catch (err) {
        handleError(res, err, 'recording legal clearance');
    }
});

// -- Mark donor letter as SENT ---------------------------------------------
//   Final gate. All three preceding rungs must be cleared.
router.post('/escalations/:id/send-to-donor', async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id || null;
        const r = await pool.query(
            `SELECT irb_decision, dg_approved_at, legal_cleared_at, donor_letter_sent_at
               FROM kemri_escalations WHERE id = $1`,
            [req.params.id]
        );
        const row = r.rows[0];
        if (!row) return res.status(404).json({ message: 'Escalation not found' });
        if (row.donor_letter_sent_at) return res.status(409).json({ message: 'Letter already marked sent.' });
        if (row.irb_decision !== 'recommend_notify' || !row.dg_approved_at || !row.legal_cleared_at) {
            return res.status(409).json({ message: 'IRB recommendation, DG approval and Legal clearance are all required before sending.' });
        }
        await pool.query(
            `UPDATE kemri_escalations
                SET donor_letter_sent_at = CURRENT_TIMESTAMP,
                    donor_letter_sent_by = $1,
                    donor_recipient      = $2,
                    updated_at           = CURRENT_TIMESTAMP
              WHERE id = $3 AND voided = 0`,
            [userId, req.body?.recipient || null, req.params.id]
        );
        res.json({ message: 'Donor letter marked sent', recipient: req.body?.recipient || null });
    } catch (err) {
        handleError(res, err, 'marking donor letter sent');
    }
});

router.post('/escalations/:id/letter', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT e.id, e.level, e.classification, e.days_late, e.deadline,
                    rp.id AS "projectId", rp.title, rp.short_name AS "shortName",
                    rp.kimes_project_id AS "kimesProjectId",
                    mr.fy_label AS "fyLabel", mr.quarter, mr.reporting_period_end
               FROM kemri_escalations e
               JOIN kemri_research_projects rp ON rp.id = e.project_id
          LEFT JOIN kemri_milestone_reports mr ON mr.id = e.report_id
              WHERE e.id = $1 AND e.voided = 0`,
            [req.params.id]
        );
        if (r.rows.length === 0) return res.status(404).json({ message: 'Escalation not found' });
        const row = r.rows[0];
        const { renderDgNcf001 } = require('../services/kemriWorkflowEngine');
        const letter = renderDgNcf001({
            project: { id: row.projectId, title: row.title, short_name: row.shortName, kimes_project_id: row.kimesProjectId },
            report: { fy_label: row.fyLabel, quarter: row.quarter, reporting_period_end: row.reporting_period_end },
            escalation: { level: row.level, classification: row.classification, days_late: row.days_late },
        });
        await pool.query(
            `UPDATE kemri_escalations
                SET donor_letter_body = $1, donor_letter_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2`,
            [letter, row.id]
        );
        res.json({ escalationId: row.id, letter, regenerated: true });
    } catch (err) {
        handleError(res, err, 'regenerating DG-NCF-001 letter');
    }
});

// ---------------------------------------------------------------------------
// Notifications inbox  (D-N reminders, escalation notices, SERU alerts, etc.)
// ---------------------------------------------------------------------------

router.get('/notifications', async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Authentication required' });
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const unreadOnly = req.query.unreadOnly === 'true' || req.query.unreadOnly === '1';
        const params = [userId];
        let where = 'user_id = $1 AND voided = 0';
        if (unreadOnly) where += ' AND read_at IS NULL';
        const r = await pool.query(
            `SELECT id, kind, level, project_id AS "projectId",
                    report_id AS "reportId", escalation_id AS "escalationId",
                    subject, body, link, read_at AS "readAt", created_at AS "createdAt"
               FROM kemri_notifications
              WHERE ${where}
              ORDER BY created_at DESC LIMIT ${limit}`,
            params
        );
        const counts = await pool.query(
            `SELECT
                COUNT(*) FILTER (WHERE read_at IS NULL)::int AS "unread",
                COUNT(*)::int                                AS "total"
               FROM kemri_notifications
              WHERE user_id = $1 AND voided = 0`,
            [userId]
        );
        res.json({ items: r.rows, ...counts.rows[0] });
    } catch (err) {
        handleError(res, err, 'listing notifications');
    }
});

router.post('/notifications/:id/read', async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        await pool.query(
            `UPDATE kemri_notifications
                SET read_at = CURRENT_TIMESTAMP
              WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
            [req.params.id, userId]
        );
        res.json({ message: 'Marked read' });
    } catch (err) {
        handleError(res, err, 'marking notification read');
    }
});

router.post('/notifications/read-all', async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const r = await pool.query(
            `UPDATE kemri_notifications
                SET read_at = CURRENT_TIMESTAMP
              WHERE user_id = $1 AND read_at IS NULL`,
            [userId]
        );
        res.json({ message: 'All marked read', updated: r.rowCount || 0 });
    } catch (err) {
        handleError(res, err, 'marking all notifications read');
    }
});

// ---------------------------------------------------------------------------
// Workflow engine — admin trigger + last-run summary
// ---------------------------------------------------------------------------

router.post('/workflow/tick', async (req, res) => {
    try {
        const { runDailyTick } = require('../services/kemriWorkflowEngine');
        const dryRun = req.query.dryRun === 'true' || req.body?.dryRun === true;
        const summary = await runDailyTick({ ranBy: req.user?.id || req.user?.userId || null, dryRun });
        res.json({ message: dryRun ? 'Dry run complete' : 'Workflow tick complete', summary });
    } catch (err) {
        handleError(res, err, 'running workflow tick');
    }
});

router.get('/workflow/runs', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT id, ran_at AS "ranAt", ran_by AS "ranBy",
                    reminders_sent AS "remindersSent",
                    escalations_opened AS "escalationsOpened",
                    escalations_upgraded AS "escalationsUpgraded",
                    seru_alerts_sent AS "seruAlertsSent"
               FROM kemri_workflow_runs
              WHERE voided = 0
              ORDER BY ran_at DESC LIMIT 50`
        );
        res.json(r.rows);
    } catch (err) {
        handleError(res, err, 'listing workflow runs');
    }
});

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

router.get('/dashboard/pi', async (req, res) => {
    try {
        const piUserId = req.query.piUserId || req.user?.id || req.user?.userId;
        if (!piUserId) return res.status(400).json({ message: 'piUserId is required' });

        const [projects, ragSummary, outputCount, upcomingDeadlines] = await Promise.all([
            pool.query(
                `${PROJECT_SELECT} WHERE rp.pi_user_id = $1 AND rp.voided = 0
                 ORDER BY rp.updated_at DESC`,
                [piUserId]
            ),
            pool.query(
                `SELECT COALESCE(rag_status,'pending') AS rag, COUNT(*)::int AS n
                   FROM kemri_research_projects
                  WHERE pi_user_id = $1 AND voided = 0
                  GROUP BY 1`,
                [piUserId]
            ),
            pool.query(
                `SELECT COUNT(*)::int AS n
                   FROM kemri_outputs o
                   JOIN kemri_research_projects p ON p.id = o.project_id
                  WHERE p.pi_user_id = $1 AND o.voided = 0`,
                [piUserId]
            ),
            pool.query(
                `SELECT mr.id, mr.fy_label AS "fyLabel", mr.quarter,
                        mr.reporting_period_end AS "reportingPeriodEnd",
                        mr.status, p.kimes_project_id AS "kimesProjectId",
                        p.title AS "projectTitle"
                   FROM kemri_milestone_reports mr
                   JOIN kemri_research_projects p ON p.id = mr.project_id
                  WHERE p.pi_user_id = $1 AND mr.voided = 0
                    AND mr.status IN ('draft','dqa_returned','queried')
                  ORDER BY mr.reporting_period_end ASC NULLS LAST
                  LIMIT 20`,
                [piUserId]
            ),
        ]);

        res.json({
            projects: projects.rows,
            ragSummary: ragSummary.rows,
            outputCount: outputCount.rows[0]?.n || 0,
            upcomingDeadlines: upcomingDeadlines.rows,
        });
    } catch (err) {
        handleError(res, err, 'fetching PI dashboard');
    }
});

router.get('/dashboard/centre-director', async (req, res) => {
    try {
        const { centreId } = req.query;
        const filters = ['rp.voided = 0'];
        const params = [];
        if (centreId) {
            params.push(centreId);
            filters.push(`rp.centre_id = $${params.length}`);
        }

        const [portfolio, queue, ragSummary, escCounts] = await Promise.all([
            pool.query(
                `${PROJECT_SELECT} WHERE ${filters.join(' AND ')}
                 ORDER BY rp.updated_at DESC LIMIT 200`,
                params
            ),
            pool.query(
                `${REPORT_SELECT}
                 WHERE mr.voided = 0
                   AND mr.status IN ('submitted','under_review')
                   AND mr.dqa_passed = 1
                   ${centreId ? `AND rp.centre_id = $1` : ''}
                 ORDER BY mr.submitted_at ASC NULLS LAST LIMIT 100`,
                centreId ? [centreId] : []
            ),
            pool.query(
                `SELECT COALESCE(rp.rag_status,'pending') AS rag, COUNT(*)::int AS n
                   FROM kemri_research_projects rp
                  WHERE rp.voided = 0 ${centreId ? 'AND rp.centre_id = $1' : ''}
                  GROUP BY 1`,
                centreId ? [centreId] : []
            ),
            pool.query(
                `SELECT e.level, COUNT(*)::int AS n
                   FROM kemri_escalations e
                   JOIN kemri_research_projects rp ON rp.id = e.project_id
                  WHERE e.voided = 0 AND e.resolved = 0
                    ${centreId ? 'AND rp.centre_id = $1' : ''}
                  GROUP BY e.level
                  ORDER BY e.level`,
                centreId ? [centreId] : []
            ),
        ]);

        res.json({
            portfolio: portfolio.rows,
            reviewQueue: queue.rows,
            ragSummary: ragSummary.rows,
            openEscalations: escCounts.rows,
        });
    } catch (err) {
        handleError(res, err, 'fetching Centre Director dashboard');
    }
});

// ===========================================================================
// KEMRI Form v05 — Sections 5 through 11
//
// All seven sub-resources follow the same shape: list/create under a project,
// and DELETE under the resource id (soft-delete via voided=1). The columns
// table here drives the simple CRUD helper below; keeping it data-driven means
// adding a new section later is one row of config, not a new endpoint.
// ===========================================================================

/**
 * SECTION_TABLES describes each project sub-resource:
 *   table:       physical SQL table name
 *   columns:     ordered list of [camelCase, snake_case] tuples; first entry
 *                must be required (used for validation).
 *   required:    optional override list of camelCase keys that must be present
 *                in the POST body.
 *   parentPath:  the URL fragment under /projects/:id/ (e.g. "staff").
 *   itemPath:    the URL fragment for DELETE /:itemId (e.g. "staff").
 */
const SECTION_TABLES = {
    staff: {
        table: 'kemri_research_staff',
        columns: [
            ['staffName', 'staff_name'],
            ['role', 'role'],
            ['roleCode', 'role_code'],
            ['qualification', 'qualification'],
            ['fte', 'fte'],
            ['payrollNo', 'payroll_no'],
            ['startDate', 'start_date'],
            ['endDate', 'end_date'],
            ['fundedBy', 'funded_by'],
            ['notes', 'notes'],
        ],
        required: ['staffName'],
        parentPath: 'staff',
        itemPath: 'staff',
    },
    capacityBuilding: {
        table: 'kemri_capacity_building',
        columns: [
            ['eventTitle', 'event_title'],
            ['eventType', 'event_type'],
            ['startDate', 'start_date'],
            ['endDate', 'end_date'],
            ['location', 'location'],
            ['participantsCount', 'participants_count'],
            ['facilitator', 'facilitator'],
            ['outcomeSummary', 'outcome_summary'],
        ],
        required: ['eventTitle'],
        parentPath: 'capacity-building',
        itemPath: 'capacity-building',
    },
    equipment: {
        table: 'kemri_research_equipment',
        columns: [
            ['itemName', 'item_name'],
            ['category', 'category'],
            ['serialNumber', 'serial_number'],
            ['assetTag', 'asset_tag'],
            ['acquisitionDate', 'acquisition_date'],
            ['acquisitionCost', 'acquisition_cost'],
            ['currency', 'currency'],
            ['vendor', 'vendor'],
            ['warrantyUntil', 'warranty_until'],
            ['custodian', 'custodian'],
            ['location', 'location'],
            ['status', 'status'],
            ['notes', 'notes'],
        ],
        required: ['itemName'],
        parentPath: 'equipment',
        itemPath: 'equipment',
    },
    budgetLines: {
        table: 'kemri_budget_lines',
        columns: [
            ['category', 'category'],
            ['description', 'description'],
            ['budgetedAmount', 'budgeted_amount'],
            ['expenditureToDate', 'expenditure_to_date'],
            ['currency', 'currency'],
            ['fyLabel', 'fy_label'],
        ],
        required: ['category'],
        parentPath: 'budget-lines',
        itemPath: 'budget-lines',
    },
    labAnalyses: {
        table: 'kemri_lab_analyses',
        columns: [
            ['analysisType', 'analysis_type'],
            ['platform', 'platform'],
            ['sampleType', 'sample_type'],
            ['totalPlanned', 'total_planned'],
            ['completed', 'completed'],
            ['qcPassRate', 'qc_pass_rate'],
            ['unitCost', 'unit_cost'],
            ['currency', 'currency'],
            ['comments', 'comments'],
        ],
        required: ['analysisType'],
        parentPath: 'lab-analyses',
        itemPath: 'lab-analyses',
    },
    feedback: {
        table: 'kemri_operations_feedback',
        columns: [
            ['feedbackType', 'feedback_type'],
            ['source', 'source'],
            ['dateReceived', 'date_received'],
            ['summary', 'summary'],
            ['actionTaken', 'action_taken'],
            ['status', 'status'],
            ['raisedBy', 'raised_by'],
        ],
        required: ['summary'],
        parentPath: 'feedback',
        itemPath: 'feedback',
    },
    swot: {
        table: 'kemri_swot_lessons',
        columns: [
            ['category', 'category'],
            ['description', 'description'],
            ['recordedBy', 'recorded_by'],
        ],
        required: ['category', 'description'],
        parentPath: 'swot',
        itemPath: 'swot',
    },
};

/**
 * Build a SELECT projection like
 *   `id, project_id AS "projectId", staff_name AS "staffName", ...`
 * from the column tuples. Always includes `created_at` / `updated_at`.
 */
const buildSelectClause = (cfg) => {
    const cols = cfg.columns
        .map(([camel, snake]) => `${snake} AS "${camel}"`)
        .join(',\n            ');
    return `id, project_id AS "projectId",\n            ${cols},\n            created_at AS "createdAt",\n            updated_at AS "updatedAt"`;
};

/**
 * Wire list/create/delete endpoints for a single section. Defined as a helper
 * so each section gets four endpoints with no copy-paste, while still letting
 * us layer in section-specific behaviour later if needed.
 */
const registerSectionEndpoints = (cfg) => {
    const select = buildSelectClause(cfg);

    router.get(`/projects/:projectId/${cfg.parentPath}`, async (req, res) => {
        try {
            const r = await pool.query(
                `SELECT ${select}
                   FROM ${cfg.table}
                  WHERE project_id = $1 AND voided = 0
                  ORDER BY created_at DESC`,
                [req.params.projectId]
            );
            res.json(r.rows);
        } catch (err) {
            handleError(res, err, `fetching ${cfg.parentPath}`);
        }
    });

    router.post(`/projects/:projectId/${cfg.parentPath}`, async (req, res) => {
        try {
            const body = req.body || {};
            for (const reqKey of cfg.required || []) {
                if (body[reqKey] === undefined || body[reqKey] === null || body[reqKey] === '') {
                    return res.status(400).json({ message: `${reqKey} is required` });
                }
            }
            const cols = ['project_id', ...cfg.columns.map(([, s]) => s)];
            const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
            const values = [
                req.params.projectId,
                ...cfg.columns.map(([camel]) =>
                    body[camel] === undefined || body[camel] === '' ? null : body[camel]
                ),
            ];
            const r = await pool.query(
                `INSERT INTO ${cfg.table} (${cols.join(',')})
                 VALUES (${placeholders})
                 RETURNING ${select}`,
                values
            );
            res.status(201).json(r.rows[0]);
        } catch (err) {
            handleError(res, err, `creating ${cfg.parentPath}`);
        }
    });

    router.put(`/${cfg.itemPath}/:id`, async (req, res) => {
        try {
            const body = req.body || {};
            const updates = [];
            const params = [];
            for (const [camel, snake] of cfg.columns) {
                if (Object.prototype.hasOwnProperty.call(body, camel)) {
                    params.push(body[camel] === '' ? null : body[camel]);
                    updates.push(`${snake} = $${params.length}`);
                }
            }
            if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
            params.push(req.params.id);
            await pool.query(
                `UPDATE ${cfg.table}
                    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
                  WHERE id = $${params.length} AND voided = 0`,
                params
            );
            res.json({ message: 'Updated' });
        } catch (err) {
            handleError(res, err, `updating ${cfg.itemPath}`);
        }
    });

    router.delete(`/${cfg.itemPath}/:id`, async (req, res) => {
        try {
            await pool.query(
                `UPDATE ${cfg.table}
                    SET voided = 1, updated_at = CURRENT_TIMESTAMP
                  WHERE id = $1`,
                [req.params.id]
            );
            res.json({ message: 'Deleted' });
        } catch (err) {
            handleError(res, err, `deleting ${cfg.itemPath}`);
        }
    });
};

Object.values(SECTION_TABLES).forEach(registerSectionEndpoints);

// ===========================================================================
// GIS dashboard summary
//
// Returns two payloads in one round-trip:
//   - byCounty[]   per-county aggregate of KIMES research activity
//   - sites[]      flat list of research sites with lat/lng for map markers
//
// Counties are matched against the IEBC county_name set by upper-casing the
// site's county field — this matches the same upper-case names used in the
// kenya-counties.geojson FeatureCollection.
// ===========================================================================
router.get('/gis/summary', async (_req, res) => {
    try {
        const [siteRows, byCountyRows, byCountyRagRows] = await Promise.all([
            pool.query(
                `SELECT
                     s.id              AS "siteId",
                     s.project_id      AS "projectId",
                     s.site_name       AS "siteName",
                     s.country         AS "country",
                     s.county          AS "county",
                     s.sub_county      AS "subCounty",
                     s.latitude        AS "latitude",
                     s.longitude       AS "longitude",
                     rp.kimes_project_id AS "kimesProjectId",
                     rp.short_name     AS "projectShortName",
                     rp.title          AS "projectTitle",
                     rp.status         AS "projectStatus",
                     rp.rag_status     AS "ragStatus",
                     rp.funding_amount AS "fundingAmount",
                     rp.funding_currency AS "fundingCurrency",
                     c.code            AS "centreCode",
                     c.name            AS "centreName"
                   FROM kemri_research_sites s
                   JOIN kemri_research_projects rp ON rp.id = s.project_id AND rp.voided = 0
              LEFT JOIN kemri_centres c ON c.id = rp.centre_id
                  WHERE s.voided = 0
                    AND s.latitude IS NOT NULL
                    AND s.longitude IS NOT NULL
                  ORDER BY rp.short_name, s.site_name`
            ),
            pool.query(
                `SELECT
                     UPPER(TRIM(s.county))                  AS "countyKey",
                     MAX(s.county)                          AS "countyDisplay",
                     COUNT(DISTINCT s.project_id)           AS "studyCount",
                     COUNT(s.id)                            AS "siteCount",
                     SUM(rp.funding_amount)                 AS "fundingTotal",
                     SUM(CASE WHEN rp.status = 'active'    THEN 1 ELSE 0 END) AS "activeStudies",
                     SUM(CASE WHEN rp.status = 'pre_study' THEN 1 ELSE 0 END) AS "preStudies",
                     SUM(CASE WHEN rp.status = 'closing'   THEN 1 ELSE 0 END) AS "closingStudies"
                   FROM kemri_research_sites s
                   JOIN kemri_research_projects rp ON rp.id = s.project_id AND rp.voided = 0
                  WHERE s.voided = 0 AND s.county IS NOT NULL
                  GROUP BY UPPER(TRIM(s.county))
                  ORDER BY 1`
            ),
            pool.query(
                `SELECT
                     UPPER(TRIM(s.county))                  AS "countyKey",
                     COALESCE(rp.rag_status, 'pending')     AS "rag",
                     COUNT(DISTINCT s.project_id)           AS "n"
                   FROM kemri_research_sites s
                   JOIN kemri_research_projects rp ON rp.id = s.project_id AND rp.voided = 0
                  WHERE s.voided = 0 AND s.county IS NOT NULL
                  GROUP BY UPPER(TRIM(s.county)), COALESCE(rp.rag_status, 'pending')`
            ),
        ]);

        // Fold rag counts back into byCounty rows for convenient consumption
        const ragByCounty = {};
        for (const r of byCountyRagRows.rows) {
            if (!ragByCounty[r.countyKey]) ragByCounty[r.countyKey] = {};
            ragByCounty[r.countyKey][r.rag] = Number(r.n);
        }

        const byCounty = byCountyRows.rows.map((r) => ({
            countyKey:      r.countyKey,
            countyDisplay:  r.countyDisplay,
            studyCount:     Number(r.studyCount),
            siteCount:      Number(r.siteCount),
            fundingTotal:   Number(r.fundingTotal || 0),
            activeStudies:  Number(r.activeStudies || 0),
            preStudies:     Number(r.preStudies || 0),
            closingStudies: Number(r.closingStudies || 0),
            ragCounts:      ragByCounty[r.countyKey] || {},
        }));

        res.json({
            sites: siteRows.rows,
            byCounty,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        handleError(res, err, 'fetching GIS summary');
    }
});

// ---------------------------------------------------------------------------
// Cross-cutting executive / operations / finance dashboard summary.
// One round-trip that powers the Executive Summary, Operations and Finance
// dashboards. Currency totals are returned per-currency to avoid lossy
// conversion at the DB layer; the frontend formats them with kemriFormat.
// ---------------------------------------------------------------------------
router.get('/dashboard/summary', async (_req, res) => {
    try {
        const [
            portfolio,
            byCentre,
            byDonor,
            byCurrency,
            byProgrammeArea,
            ragSummary,
            byStatus,
            escalations,
            seruExpiring,
            reportFunnel,
            reportsByFy,
            recentReports,
            outputsByType,
            topPiBySites,
        ] = await Promise.all([
            // Portfolio headline counters
            pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM kemri_research_projects WHERE voided = 0)                                                          AS "studies",
                    (SELECT COUNT(*) FROM kemri_research_projects WHERE voided = 0 AND status = 'active')                                    AS "activeStudies",
                    (SELECT COUNT(*) FROM kemri_research_projects WHERE voided = 0 AND status = 'pre_study')                                 AS "preStudies",
                    (SELECT COUNT(*) FROM kemri_research_projects WHERE voided = 0 AND status = 'closing')                                   AS "closingStudies",
                    (SELECT COUNT(*) FROM kemri_research_projects WHERE voided = 0 AND status = 'closed')                                    AS "closedStudies",
                    (SELECT COUNT(*) FROM kemri_research_sites    WHERE voided = 0)                                                          AS "sites",
                    (SELECT COUNT(*) FROM kemri_research_staff    WHERE voided = 0)                                                          AS "staff",
                    (SELECT COUNT(*) FROM kemri_outputs           WHERE voided = 0)                                                          AS "outputs",
                    (SELECT COUNT(*) FROM kemri_milestone_reports WHERE voided = 0)                                                          AS "reports",
                    (SELECT COUNT(*) FROM kemri_milestone_reports WHERE voided = 0 AND status IN ('submitted','under_review'))               AS "reportsAwaitingReview",
                    (SELECT COUNT(*) FROM kemri_milestone_reports WHERE voided = 0 AND status IN ('approved','accepted'))                    AS "reportsAccepted",
                    (SELECT COUNT(*) FROM kemri_milestone_reports WHERE voided = 0 AND status IN ('dqa_returned','returned','queried'))      AS "reportsReturned",
                    (SELECT COUNT(*) FROM kemri_escalations       WHERE voided = 0 AND resolved = 0)                                         AS "openEscalations"
            `),

            // By KEMRI Centre
            pool.query(`
                SELECT
                    c.code                                                                       AS "centreCode",
                    c.name                                                                       AS "centreName",
                    COUNT(rp.id)::int                                                            AS "studyCount",
                    SUM(CASE WHEN rp.status = 'active' THEN 1 ELSE 0 END)::int                   AS "activeStudies",
                    COALESCE(SUM(rp.funding_amount), 0)::numeric                                 AS "fundingTotal",
                    SUM(CASE WHEN rp.rag_status = 'green' THEN 1 ELSE 0 END)::int                AS "green",
                    SUM(CASE WHEN rp.rag_status = 'amber' THEN 1 ELSE 0 END)::int                AS "amber",
                    SUM(CASE WHEN rp.rag_status = 'red'   THEN 1 ELSE 0 END)::int                AS "red",
                    SUM(CASE WHEN rp.rag_status IS NULL   THEN 1 ELSE 0 END)::int                AS "pending",
                    (SELECT COUNT(*) FROM kemri_research_sites s
                       JOIN kemri_research_projects p ON p.id = s.project_id AND p.voided = 0
                      WHERE p.centre_id = c.id AND s.voided = 0)::int                            AS "siteCount"
                  FROM kemri_centres c
             LEFT JOIN kemri_research_projects rp ON rp.centre_id = c.id AND rp.voided = 0
                 WHERE c.voided = 0
              GROUP BY c.id, c.code, c.name
              ORDER BY "studyCount" DESC, c.code
            `),

            // By donor
            pool.query(`
                SELECT
                    d.id                                                       AS "donorId",
                    d.name                                                     AS "donorName",
                    d.country                                                  AS "donorCountry",
                    COUNT(rp.id)::int                                          AS "studyCount",
                    rp.funding_currency                                        AS "currency",
                    COALESCE(SUM(rp.funding_amount), 0)::numeric               AS "fundingTotal"
                  FROM kemri_donors d
             LEFT JOIN kemri_research_projects rp
                    ON rp.primary_donor_id = d.id AND rp.voided = 0
                 WHERE d.voided = 0
              GROUP BY d.id, d.name, d.country, rp.funding_currency
                HAVING COUNT(rp.id) > 0
              ORDER BY "studyCount" DESC, d.name
            `),

            // Funding totals per currency (needed because we don't FX-convert)
            pool.query(`
                SELECT
                    COALESCE(funding_currency, 'KES')                          AS "currency",
                    COUNT(*)::int                                              AS "studyCount",
                    COALESCE(SUM(funding_amount), 0)::numeric                  AS "fundingTotal",
                    COALESCE(SUM(CASE WHEN status = 'active' THEN funding_amount ELSE 0 END), 0)::numeric AS "activeFunding"
                  FROM kemri_research_projects
                 WHERE voided = 0
              GROUP BY COALESCE(funding_currency, 'KES')
              ORDER BY "fundingTotal" DESC
            `),

            // By programme area
            pool.query(`
                SELECT
                    COALESCE(programme_area, 'Unspecified')                    AS "programmeArea",
                    COUNT(*)::int                                              AS "studyCount",
                    COALESCE(SUM(funding_amount), 0)::numeric                  AS "fundingTotal"
                  FROM kemri_research_projects
                 WHERE voided = 0
              GROUP BY COALESCE(programme_area, 'Unspecified')
              ORDER BY "studyCount" DESC
            `),

            // Portfolio RAG distribution
            pool.query(`
                SELECT
                    COALESCE(rag_status, 'pending')                            AS "rag",
                    COUNT(*)::int                                              AS "n"
                  FROM kemri_research_projects
                 WHERE voided = 0
              GROUP BY COALESCE(rag_status, 'pending')
            `),

            // Project lifecycle status distribution
            pool.query(`
                SELECT status                                                  AS "status",
                       COUNT(*)::int                                           AS "n"
                  FROM kemri_research_projects
                 WHERE voided = 0
              GROUP BY status
              ORDER BY "n" DESC
            `),

            // Open escalations grouped by level
            pool.query(`
                SELECT level::int                                              AS "level",
                       COUNT(*)::int                                           AS "n"
                  FROM kemri_escalations
                 WHERE voided = 0 AND resolved = 0
              GROUP BY level
              ORDER BY level
            `),

            // SERU expiring within next 60 days (Concept §3 Step 4 / DQA check 7).
            // Aligned with kemri_dqa_engine: 60-day pre-expiry window.
            pool.query(`
                SELECT
                    rp.id                                                      AS "projectId",
                    rp.kimes_project_id                                        AS "kimesProjectId",
                    rp.short_name                                              AS "shortName",
                    rp.title                                                   AS "title",
                    c.code                                                     AS "centreCode",
                    rp.seru_approval_no                                        AS "seruApprovalNo",
                    rp.seru_expiry_date                                        AS "seruExpiryDate",
                    (rp.seru_expiry_date - CURRENT_DATE)::int                  AS "daysToExpiry",
                    rp.rag_status                                              AS "ragStatus"
                  FROM kemri_research_projects rp
             LEFT JOIN kemri_centres c ON c.id = rp.centre_id
                 WHERE rp.voided = 0
                   AND rp.seru_expiry_date IS NOT NULL
                   AND rp.seru_expiry_date <= CURRENT_DATE + INTERVAL '60 days'
                   AND rp.status IN ('active', 'pre_study')
              ORDER BY rp.seru_expiry_date
                 LIMIT 12
            `),

            // Quarterly report funnel (last 4 financial-year/quarter buckets)
            pool.query(`
                SELECT
                    fy_label                                                   AS "fyLabel",
                    quarter                                                    AS "quarter",
                    status                                                     AS "status",
                    COUNT(*)::int                                              AS "n"
                  FROM kemri_milestone_reports
                 WHERE voided = 0
              GROUP BY fy_label, quarter, status
              ORDER BY fy_label DESC, quarter DESC
                 LIMIT 32
            `),

            // Reports by FY (financial trend)
            pool.query(`
                SELECT
                    fy_label                                                   AS "fyLabel",
                    COUNT(*)::int                                              AS "reportCount",
                    AVG(NULLIF(dqa_score, 0))::numeric(5,2)                    AS "avgDqaScore",
                    SUM(CASE WHEN dqa_passed = 1 THEN 1 ELSE 0 END)::int       AS "dqaPassed",
                    COALESCE(SUM(funds_received), 0)::numeric                  AS "fundsReceived",
                    COALESCE(SUM(expenditure_to_date), 0)::numeric             AS "expenditure",
                    COALESCE(SUM(budget_total), 0)::numeric                    AS "budgetTotal",
                    SUM(CASE WHEN rag_status = 'green' THEN 1 ELSE 0 END)::int AS "green",
                    SUM(CASE WHEN rag_status = 'amber' THEN 1 ELSE 0 END)::int AS "amber",
                    SUM(CASE WHEN rag_status = 'red'   THEN 1 ELSE 0 END)::int AS "red"
                  FROM kemri_milestone_reports
                 WHERE voided = 0
              GROUP BY fy_label
              ORDER BY fy_label
            `),

            // Most recent reports (operations queue + activity feed)
            pool.query(`
                SELECT
                    mr.id                                                      AS "reportId",
                    mr.project_id                                              AS "projectId",
                    rp.kimes_project_id                                        AS "kimesProjectId",
                    rp.short_name                                              AS "projectShortName",
                    rp.title                                                   AS "projectTitle",
                    c.code                                                     AS "centreCode",
                    mr.fy_label                                                AS "fyLabel",
                    mr.quarter                                                 AS "quarter",
                    mr.status                                                  AS "status",
                    mr.dqa_score                                               AS "dqaScore",
                    mr.dqa_passed                                              AS "dqaPassed",
                    mr.rag_status                                              AS "ragStatus",
                    mr.submitted_at                                            AS "submittedAt",
                    mr.reviewed_at                                             AS "reviewedAt",
                    mr.budget_total                                            AS "budgetTotal",
                    mr.expenditure_to_date                                     AS "expenditure",
                    rp.funding_currency                                        AS "currency"
                  FROM kemri_milestone_reports mr
                  JOIN kemri_research_projects rp ON rp.id = mr.project_id
             LEFT JOIN kemri_centres c ON c.id = rp.centre_id
                 WHERE mr.voided = 0
              ORDER BY COALESCE(mr.submitted_at, mr.created_at) DESC NULLS LAST
                 LIMIT 12
            `),

            // Outputs by type (research productivity gauge)
            pool.query(`
                SELECT
                    output_type                                                AS "outputType",
                    COUNT(*)::int                                              AS "n",
                    COALESCE(AVG(impact_factor), 0)::numeric(5,2)              AS "avgImpact",
                    COALESCE(SUM(citation_count), 0)::int                      AS "citations"
                  FROM kemri_outputs
                 WHERE voided = 0
              GROUP BY output_type
              ORDER BY "n" DESC
            `),

            // Top PIs by site count (people leaderboard)
            pool.query(`
                SELECT
                    rp.pi_user_id                                              AS "piUserId",
                    COALESCE(NULLIF(TRIM(CONCAT(u.firstname, ' ', u.lastname)), ''), u.username, 'PI #' || rp.pi_user_id) AS "piName",
                    COUNT(DISTINCT rp.id)::int                                 AS "studyCount",
                    COUNT(s.id)::int                                           AS "siteCount",
                    COALESCE(SUM(rp.funding_amount), 0)::numeric               AS "fundingLed"
                  FROM kemri_research_projects rp
             LEFT JOIN kemri_research_sites s ON s.project_id = rp.id AND s.voided = 0
             LEFT JOIN users u ON u.userid = rp.pi_user_id
                 WHERE rp.voided = 0 AND rp.pi_user_id IS NOT NULL
              GROUP BY rp.pi_user_id, u.firstname, u.lastname, u.username
              ORDER BY "siteCount" DESC, "studyCount" DESC
                 LIMIT 8
            `),
        ]);

        const ragMap = ragSummary.rows.reduce((acc, r) => {
            acc[r.rag] = Number(r.n);
            return acc;
        }, {});

        const escalationByLevel = escalations.rows.reduce((acc, r) => {
            acc[`L${r.level}`] = Number(r.n);
            return acc;
        }, {});

        res.json({
            generatedAt: new Date().toISOString(),
            portfolio:        portfolio.rows[0] || {},
            byCentre:         byCentre.rows,
            byDonor:          byDonor.rows,
            byCurrency:       byCurrency.rows,
            byProgrammeArea:  byProgrammeArea.rows,
            byStatus:         byStatus.rows,
            ragSummary:       { green: 0, amber: 0, red: 0, pending: 0, ...ragMap },
            escalationByLevel,
            seruExpiring:     seruExpiring.rows,
            reportFunnel:     reportFunnel.rows,
            reportsByFy:      reportsByFy.rows,
            recentReports:    recentReports.rows,
            outputsByType:    outputsByType.rows,
            topPiBySites:     topPiBySites.rows,
        });
    } catch (err) {
        handleError(res, err, 'fetching dashboard summary');
    }
});

// ---------------------------------------------------------------------------
// Form Export — KEMRI Research Implementation & Grant Monitoring Tool (v05)
//
// Returns the FULL filled-out form for a single research project, structured
// to match every section/field of `api/adp/kemri_tools.pdf`.  Frontend consumes
// it from KemriStudyFormExportPage.jsx; the same payload also feeds the DOCX
// generator.  Whenever a PDF field has no first-class column in KIMES yet, the
// payload returns `null` and tags the section in the `_gaps` array so the UI
// can render "(not captured by KIMES)" for the user.
// ---------------------------------------------------------------------------
router.get('/projects/:id/form-export', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

        const projRes = await pool.query(`${PROJECT_SELECT} WHERE rp.id = $1 AND rp.voided = 0`, [id]);
        if (!projRes.rows.length) return res.status(404).json({ message: 'Research project not found' });
        const project = projRes.rows[0];

        // Resolve PI name from users table (the form has a "PI Name" field
        // separate from username — best-effort lookup).
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
        } catch (_) { /* schema drift — leave null */ }

        // Fan out to every related table in parallel.
        const [
            sites, coi, objectives, kpis, reports, outputs,
            staff, capacityBuilding, equipment, budgetLines,
            labAnalyses, feedback, swot, escalations, dqaScores,
        ] = await Promise.all([
            pool.query(
                `SELECT id, site_name AS "siteName", country, county, sub_county AS "subCounty",
                        ward, latitude, longitude
                   FROM kemri_research_sites WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT id, full_name AS "fullName", qualification, specialty, institution, role, email
                   FROM kemri_research_coinvestigators WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT id, ordinal, description
                   FROM kemri_research_objectives WHERE project_id = $1 AND voided = 0 ORDER BY ordinal`, [id]),
            pool.query(
                `SELECT id, indicator_code AS "indicatorCode", indicator_name AS "indicatorName",
                        description, unit_of_measure AS "unitOfMeasure",
                        baseline_value AS "baselineValue", target_value AS "targetValue",
                        expected_output AS "expectedOutput", reporting_frequency AS "reportingFrequency"
                   FROM kemri_kpis WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT mr.id, mr.fy_label AS "fyLabel", mr.quarter, mr.reporting_period_end AS "reportingPeriodEnd",
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
            pool.query(
                `SELECT id, output_type AS "outputType", title, authors, status, venue,
                        date_recorded AS "dateRecorded", doi, pubmed_id AS "pubmedId", url,
                        citation_count AS "citationCount", impact_factor AS "impactFactor",
                        repository, access_level AS "accessLevel", embargo_until AS "embargoUntil",
                        fair_score AS "fairScore",
                        ip_type AS "ipType", patent_number AS "patentNumber", jurisdiction,
                        commercialisation_stage AS "commercialisationStage",
                        patent_expiry_date AS "patentExpiryDate",
                        revenue_generated AS "revenueGenerated",
                        policy_audience AS "policyAudience", uptake_score AS "uptakeScore",
                        metadata
                   FROM kemri_outputs WHERE project_id = $1 AND voided = 0 ORDER BY id DESC`, [id]),
            // Section sub-resources via the SECTION_TABLES map.
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.staff)}
                   FROM ${SECTION_TABLES.staff.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.capacityBuilding)}
                   FROM ${SECTION_TABLES.capacityBuilding.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.equipment)}
                   FROM ${SECTION_TABLES.equipment.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.budgetLines)}
                   FROM ${SECTION_TABLES.budgetLines.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.labAnalyses)}
                   FROM ${SECTION_TABLES.labAnalyses.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.feedback)}
                   FROM ${SECTION_TABLES.feedback.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT ${buildSelectClause(SECTION_TABLES.swot)}
                   FROM ${SECTION_TABLES.swot.table}
                  WHERE project_id = $1 AND voided = 0 ORDER BY id`, [id]),
            pool.query(
                `SELECT id, level, classification, days_late AS "daysLate",
                        deadline, triggered_at AS "triggeredAt",
                        notice_subject AS "noticeSubject", resolved
                   FROM kemri_escalations WHERE project_id = $1 AND voided = 0
                  ORDER BY id DESC`, [id]),
            pool.query(
                `SELECT ds.id, ds.report_id AS "reportId", ds.overall_score AS "overallScore",
                        ds.passed, ds.flagged_fields AS "flaggedFields", ds.ran_at AS "ranAt"
                   FROM kemri_dqa_scores ds
                   JOIN kemri_milestone_reports mr ON mr.id = ds.report_id
                  WHERE mr.project_id = $1 ORDER BY ds.ran_at DESC LIMIT 1`, [id]),
        ]);

        // Compute KPI achievement aggregates per KPI (used for §3.28 indicator
        // tracking table — KIMES normalises achievements via report_id, so we
        // pull FY/quarter from the joined milestone_reports row.
        const kpiAch = await pool.query(
            `SELECT ka.kpi_id        AS "kpiId",
                    mr.fy_label      AS "fyLabel",
                    mr.quarter       AS "quarter",
                    ka.target_value  AS "targetValue",
                    ka.actual_value  AS "actualValue",
                    ka.achievement_pct AS "achievementPct",
                    ka.status,
                    ka.comments      AS "narrative"
               FROM kemri_kpi_achievements ka
               JOIN kemri_kpis k             ON k.id  = ka.kpi_id
               JOIN kemri_milestone_reports mr ON mr.id = ka.report_id
              WHERE k.project_id = $1 AND ka.voided = 0
              ORDER BY ka.kpi_id, mr.fy_label, mr.quarter`, [id]
        );

        // Tag the structural gaps (PDF fields KIMES does not yet capture) so
        // the UI can render "(not captured by KIMES)" rather than going silent.
        const gaps = [
            // §1
            { section: '1.10', field: 'Interview date',        reason: 'Not yet a column on kemri_research_projects.' },
            // §2
            { section: '2.15', field: 'SERU renewal dates (multiple)',  reason: 'Only single seru_approval_date / seru_expiry_date stored.' },
            { section: '2.17', field: 'Other approvals list',  reason: 'Only NACOSTI is structured; other approvals are free-text.' },
            // §3
            { section: '3.21', field: 'Other implementing partners (separate from primary)', reason: 'Not yet a structured table.' },
            { section: '3.25B', field: 'Delay reasons by category (Funding/Approval/Procurement/Personnel/Other)', reason: 'Free-text only.' },
            { section: '3.26',  field: 'Variations in study (objectives/period)', reason: 'Free-text only.' },
            { section: '3.27',  field: 'Monitoring artefacts revisions checklist (budget/work plan/log frame…)', reason: 'Not captured.' },
            // §6
            { section: '6.40',  field: 'Infrastructure construction / renovation register', reason: 'No dedicated table.' },
            // §7
            { section: '7.42',  field: 'Budget revisions >10% explanation', reason: 'Captured only in milestone narrative.' },
            { section: '7.43',  field: 'Incremental funding breakdown by category', reason: 'No dedicated columns.' },
            // §8
            { section: '8.45',  field: 'Technical/Final reports recipient checklist', reason: 'Not modelled (use Outputs Registry instead).' },
            { section: '8.46',  field: 'Dissemination audience checklist', reason: 'Not modelled.' },
            { section: '8.47',  field: 'Sustainability narrative (continuation after end)', reason: 'Free-text via emerging_risks only.' },
            { section: '8.48',  field: 'Data disclosure & sharing flag', reason: 'Tracked via FAIR score on outputs only.' },
            // §10
            { section: '10.50', field: 'Sample storage location list', reason: 'Free-text only.' },
            { section: '10.51', field: 'Non-KEMRI laboratory justification', reason: 'Free-text only.' },
            // §11
            { section: '11.52', field: 'Teamwork Likert (Very well / Well / Not well)', reason: 'Stored as free-text feedback.' },
            { section: '11.53', field: 'Stakeholder contact (Yes all / Yes some / None)', reason: 'Stored as free-text feedback.' },
            { section: '11.55', field: 'Grants Office performance score (1\u201310)', reason: 'Not modelled.' },
        ];

        res.json({
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
            latestDqa: dqaScores.rows[0] || null,
            _gaps: gaps,
        });
    } catch (err) {
        handleError(res, err, 'building form export');
    }
});

// ---------------------------------------------------------------------------
// Form Export (.docx) — server-side rendered Word document of the same content.
// Uses a minimal pure-JS docx synthesiser (no external deps); the file the
// browser receives is a valid Office Open XML word document with a clean,
// printable section/heading/table layout.
// ---------------------------------------------------------------------------
router.get('/projects/:id/form-export.docx', async (req, res) => {
    try {
        const { buildKemriFormDocx } = require('../services/kemriFormExportService');
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

        // Re-use the JSON endpoint internally so the two outputs never drift.
        // We hit the route-handler directly via a shallow fake req/res.
        // Easier: just inline the same fan-out by reading from a helper.
        const { buildFormExportPayload } = require('../services/kemriFormExportService');
        const payload = await buildFormExportPayload(pool, id, { PROJECT_SELECT, SECTION_TABLES, buildSelectClause });
        if (!payload) return res.status(404).json({ message: 'Research project not found' });

        const buf = await buildKemriFormDocx(payload);
        const filename = `${(payload.project.kimesProjectId || 'study')}_form_v05.docx`
            .replace(/[^A-Za-z0-9_.-]/g, '_');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buf.length);
        res.send(buf);
    } catch (err) {
        handleError(res, err, 'building DOCX export');
    }
});

// ===========================================================================
// KIMES v5 — Signature visualisation feeds
//
// The visualisations in §9 of KEMRI_KIMES_v5_Final_Complete.pdf are powered by
// these dedicated lightweight endpoints rather than bolted onto the dashboard
// summary. Each endpoint returns a small JSON document that can be plotted
// directly with Recharts (FunnelChart / RadarChart / BarChart / etc.).
// ===========================================================================

// =============================================================================
// Strategic Plan integration (KEMRI 2023-2027 — FINALAPPROVEDSTRATEGICPLAN3.27)
// -----------------------------------------------------------------------------
// We piggy-back on the existing CIDP-style strategicplans / programs /
// subprograms tables (machakos clone) which already model a 5-year plan
// with KRAs, strategic objectives, year-1..5 targets and budgets. New
// KEMRI-specific bridge tables (kemri_project_strategic_links,
// kemri_output_strategic_links, kemri_strategic_achievements) connect
// research lifecycle data back to the plan.
// =============================================================================

// FY helpers (GoK fiscal year runs Jul - Jun) -------------------------------
function currentGoKFy() {
    const now = new Date();
    const m = now.getMonth();
    const fyStart = m >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const quarter = m >= 6 ? 1 : (m >= 9 ? 2 : (m <= 2 ? 3 : 4));
    return {
        fyLabel: `FY${fyStart}/${String(fyStart + 1).slice(2)}`,
        quarter: `Q${quarter}`,
        quarterNum: quarter,
        fyStart,
    };
}

function planYearIndex(planStartDateStr) {
    // Returns 1..5 for the current plan year (clamped). KEMRI plan starts FY2023/24.
    if (!planStartDateStr) return 1;
    const planFy = new Date(planStartDateStr).getFullYear();
    const cur = currentGoKFy().fyStart;
    return Math.max(1, Math.min(5, (cur - planFy) + 1));
}

// -- Active KEMRI plan tree (KRAs -> Objectives + rollup) -------------------
router.get('/strategic-plan/active', async (req, res) => {
    try {
        const planRow = (await pool.query(`
            SELECT id, cidpid, "cidpName" AS name, "startDate" AS "startDate", "endDate" AS "endDate",
                   vision, mission, theme, strategic_goal AS "strategicGoal", core_values AS "coreValues"
              FROM strategicplans
             WHERE is_active = TRUE AND voided = FALSE
             ORDER BY "createdAt" DESC LIMIT 1
        `)).rows[0];
        if (!planRow) return res.status(404).json({ message: 'No active strategic plan found' });

        const yearIdx = planYearIndex(planRow.startDate);
        const fy = currentGoKFy();

        const kras = (await pool.query(`
            SELECT "programId" AS id, "programCode" AS code, COALESCE(programme, "programName") AS name,
                   description, objectives, outcomes
              FROM programs
             WHERE cidpid = $1 AND voided = FALSE
             ORDER BY "programCode"
        `, [planRow.cidpid])).rows;

        const objectives = (await pool.query(`
            SELECT s."subProgramId" AS id, s."subProgramCode" AS code,
                   COALESCE(s."subProgramme", s."subProgramName") AS name,
                   s."keyOutcome" AS "keyOutcome", s.kpi, s."unitOfMeasure" AS unit,
                   s.baseline,
                   s."yr1Targets" AS yr1, s."yr2Targets" AS yr2, s."yr3Targets" AS yr3,
                   s."yr4Targets" AS yr4, s."yr5Targets" AS yr5,
                   s."yr1Budget"  AS budget1, s."yr2Budget" AS budget2, s."yr3Budget" AS budget3,
                   s."yr4Budget"  AS budget4, s."yr5Budget" AS budget5, s."totalBudget" AS "totalBudget",
                   s."programId" AS "programId"
              FROM subprograms s
              JOIN programs p ON p."programId" = s."programId"
             WHERE p.cidpid = $1 AND s.voided = FALSE
             ORDER BY s."subProgramCode"
        `, [planRow.cidpid])).rows;

        // Rollups per objective: linked projects / achievements / outputs
        const rollup = (await pool.query(`
            SELECT s."subProgramId" AS id,
                   COUNT(DISTINCT psl.project_id) FILTER (WHERE psl.voided = 0) ::int AS "projectCount",
                   COUNT(DISTINCT osl.output_id)  FILTER (WHERE osl.voided = 0) ::int AS "outputCount",
                   COUNT(DISTINCT ach.id)         FILTER (WHERE ach.voided = 0) ::int AS "achievementCount",
                   COUNT(DISTINCT ach.id)         FILTER (WHERE ach.voided = 0 AND ach.fy_label = $2) ::int AS "achievementsThisFy"
              FROM subprograms s
              JOIN programs p ON p."programId" = s."programId"
              LEFT JOIN kemri_project_strategic_links psl ON psl.sub_program_id = s."subProgramId"
              LEFT JOIN kemri_output_strategic_links  osl ON osl.sub_program_id = s."subProgramId"
              LEFT JOIN kemri_strategic_achievements  ach ON ach.sub_program_id = s."subProgramId"
             WHERE p.cidpid = $1
             GROUP BY s."subProgramId"
        `, [planRow.cidpid, fy.fyLabel])).rows;
        const rmap = new Map(rollup.map(r => [Number(r.id), r]));

        // Compose tree
        const kraTree = kras.map((k) => {
            const myObjs = objectives.filter(o => Number(o.programId) === Number(k.id))
                                     .map(o => {
                                         const r = rmap.get(Number(o.id)) || {};
                                         const targetThisYear = o[`yr${yearIdx}`] || null;
                                         return {
                                             ...o,
                                             planYear: yearIdx,
                                             targetThisYear,
                                             projectCount: Number(r.projectCount || 0),
                                             outputCount: Number(r.outputCount || 0),
                                             achievementCount: Number(r.achievementCount || 0),
                                             achievementsThisFy: Number(r.achievementsThisFy || 0),
                                         };
                                     });
            const totals = myObjs.reduce((a, o) => {
                a.projects     += o.projectCount;
                a.outputs      += o.outputCount;
                a.achievements += o.achievementCount;
                a.budget       += Number(o.totalBudget || 0);
                return a;
            }, { projects: 0, outputs: 0, achievements: 0, budget: 0 });
            return { ...k, totals, objectives: myObjs };
        });

        res.json({
            plan: { ...planRow, planYear: yearIdx, currentFy: fy.fyLabel, currentQuarter: fy.quarter },
            kras: kraTree,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        handleError(res, err, 'fetching active strategic plan');
    }
});

// -- Flat objective list (for dropdowns / multi-select) ---------------------
router.get('/strategic-plan/objectives', async (req, res) => {
    try {
        const rows = (await pool.query(`
            SELECT s."subProgramId" AS id, s."subProgramCode" AS code,
                   COALESCE(s."subProgramme", s."subProgramName") AS name,
                   s.kpi, s."unitOfMeasure" AS unit,
                   p."programCode" AS "kraCode", COALESCE(p.programme, p."programName") AS "kraName"
              FROM subprograms s
              JOIN programs p ON p."programId" = s."programId"
              JOIN strategicplans sp ON sp.cidpid = p.cidpid
             WHERE sp.is_active = TRUE AND s.voided = FALSE AND p.voided = FALSE
             ORDER BY s."subProgramCode"
        `)).rows;
        res.json(rows);
    } catch (err) {
        handleError(res, err, 'fetching strategic objectives');
    }
});

// -- Single objective detail with linked projects + achievements -----------
router.get('/strategic-plan/objectives/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid objective id' });
        const obj = (await pool.query(`
            SELECT s."subProgramId" AS id, s."subProgramCode" AS code,
                   COALESCE(s."subProgramme", s."subProgramName") AS name,
                   s."keyOutcome" AS "keyOutcome", s.kpi, s."unitOfMeasure" AS unit, s.baseline,
                   s."yr1Targets" AS yr1, s."yr2Targets" AS yr2, s."yr3Targets" AS yr3,
                   s."yr4Targets" AS yr4, s."yr5Targets" AS yr5,
                   s."yr1Budget"  AS budget1, s."yr2Budget" AS budget2, s."yr3Budget" AS budget3,
                   s."yr4Budget"  AS budget4, s."yr5Budget" AS budget5, s."totalBudget" AS "totalBudget",
                   s.remarks,
                   p."programCode" AS "kraCode", COALESCE(p.programme, p."programName") AS "kraName"
              FROM subprograms s
              JOIN programs p ON p."programId" = s."programId"
             WHERE s."subProgramId" = $1 AND s.voided = FALSE
        `, [id])).rows[0];
        if (!obj) return res.status(404).json({ message: 'Strategic objective not found' });

        const projects = (await pool.query(`
            SELECT rp.id, rp.kimes_project_id AS "kimesProjectId", rp.title, rp.status, rp.rag_status AS "ragStatus",
                   psl.contribution_pct AS "contributionPct", psl.notes,
                   (rp.primary_objective_id = $1) AS "isPrimary"
              FROM kemri_project_strategic_links psl
              JOIN kemri_research_projects rp ON rp.id = psl.project_id
             WHERE psl.sub_program_id = $1 AND psl.voided = 0 AND rp.voided = 0
             ORDER BY "isPrimary" DESC, rp.title
        `, [id])).rows;

        const achievements = (await pool.query(`
            SELECT a.id, a.fy_label AS "fyLabel", a.quarter, a.achievement_type AS "achievementType",
                   a.title, a.narrative, a.value_numeric AS "valueNumeric", a.value_unit AS "valueUnit",
                   a.contribution_pct AS "contributionPct", a.evidence_url AS "evidenceUrl",
                   a.auto_generated AS "autoGenerated", a.achieved_on AS "achievedOn", a.created_at AS "createdAt",
                   a.project_id AS "projectId", rp.kimes_project_id AS "kimesProjectId", rp.title AS "projectTitle",
                   a.output_id AS "outputId", o.title AS "outputTitle"
              FROM kemri_strategic_achievements a
              LEFT JOIN kemri_research_projects rp ON rp.id = a.project_id
              LEFT JOIN kemri_outputs            o  ON o.id  = a.output_id
             WHERE a.sub_program_id = $1 AND a.voided = 0
             ORDER BY COALESCE(a.achieved_on, a.created_at::date) DESC
        `, [id])).rows;

        res.json({ objective: obj, projects, achievements });
    } catch (err) {
        handleError(res, err, 'fetching strategic objective detail');
    }
});

// -- Achievements: list / create / delete ----------------------------------
router.get('/strategic-plan/achievements', async (req, res) => {
    try {
        const filters = [];
        const params = [];
        if (req.query.objectiveId) { params.push(Number(req.query.objectiveId)); filters.push(`a.sub_program_id = $${params.length}`); }
        if (req.query.projectId)   { params.push(Number(req.query.projectId));   filters.push(`a.project_id = $${params.length}`); }
        if (req.query.fyLabel)     { params.push(String(req.query.fyLabel));      filters.push(`a.fy_label = $${params.length}`); }
        if (req.query.type)        { params.push(String(req.query.type));         filters.push(`a.achievement_type = $${params.length}`); }
        const where = filters.length ? `WHERE a.voided = 0 AND ${filters.join(' AND ')}` : 'WHERE a.voided = 0';
        const rows = (await pool.query(`
            SELECT a.id, a.sub_program_id AS "objectiveId",
                   s."subProgramCode" AS "objectiveCode", COALESCE(s."subProgramme", s."subProgramName") AS "objectiveName",
                   a.fy_label AS "fyLabel", a.quarter, a.achievement_type AS "achievementType",
                   a.title, a.narrative, a.value_numeric AS "valueNumeric", a.value_unit AS "valueUnit",
                   a.contribution_pct AS "contributionPct", a.evidence_url AS "evidenceUrl",
                   a.auto_generated AS "autoGenerated", a.achieved_on AS "achievedOn", a.created_at AS "createdAt",
                   a.project_id AS "projectId", rp.kimes_project_id AS "kimesProjectId", rp.title AS "projectTitle",
                   a.output_id AS "outputId", o.title AS "outputTitle"
              FROM kemri_strategic_achievements a
              JOIN subprograms s ON s."subProgramId" = a.sub_program_id
              LEFT JOIN kemri_research_projects rp ON rp.id = a.project_id
              LEFT JOIN kemri_outputs            o  ON o.id  = a.output_id
              ${where}
              ORDER BY COALESCE(a.achieved_on, a.created_at::date) DESC, a.id DESC
              LIMIT 500
        `, params)).rows;
        res.json(rows);
    } catch (err) {
        handleError(res, err, 'fetching strategic achievements');
    }
});

router.post('/strategic-plan/achievements', async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.objectiveId || !b.title || !b.achievementType) {
            return res.status(400).json({ message: 'objectiveId, title and achievementType are required' });
        }
        const fy = currentGoKFy();
        const result = await pool.query(`
            INSERT INTO kemri_strategic_achievements
              (sub_program_id, project_id, output_id, fy_label, quarter, achievement_type,
               title, narrative, value_numeric, value_unit, contribution_pct, evidence_url,
               auto_generated, achieved_on, recorded_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,0,$13,$14)
            RETURNING id
        `, [
            Number(b.objectiveId),
            b.projectId ? Number(b.projectId) : null,
            b.outputId  ? Number(b.outputId)  : null,
            b.fyLabel || fy.fyLabel,
            b.quarter || fy.quarter,
            String(b.achievementType),
            String(b.title),
            b.narrative || null,
            b.valueNumeric != null && b.valueNumeric !== '' ? Number(b.valueNumeric) : null,
            b.valueUnit || null,
            b.contributionPct != null && b.contributionPct !== '' ? Number(b.contributionPct) : null,
            b.evidenceUrl || null,
            b.achievedOn || null,
            req.user?.userId || null,
        ]);
        res.status(201).json({ id: result.rows[0]?.id });
    } catch (err) {
        handleError(res, err, 'creating strategic achievement');
    }
});

router.delete('/strategic-plan/achievements/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
        const result = await pool.query(
            `UPDATE kemri_strategic_achievements SET voided = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND voided = 0`,
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'Achievement not found' });
        res.status(204).send();
    } catch (err) {
        handleError(res, err, 'deleting strategic achievement');
    }
});

// -- Project <-> objective links: add / remove ------------------------------
router.post('/strategic-plan/links', async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.projectId || !b.objectiveId) {
            return res.status(400).json({ message: 'projectId and objectiveId are required' });
        }
        const projectId = Number(b.projectId);
        const objectiveId = Number(b.objectiveId);
        await pool.query(`
            INSERT INTO kemri_project_strategic_links (project_id, sub_program_id, contribution_pct, notes, created_by)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
        `, [projectId, objectiveId, b.contributionPct ?? null, b.notes ?? null, req.user?.userId || null]);

        // Optionally elevate to primary objective if asked.
        if (b.setPrimary === true) {
            await pool.query(`UPDATE kemri_research_projects SET primary_objective_id = $1 WHERE id = $2`,
                [objectiveId, projectId]);
        }
        res.status(201).json({ ok: true });
    } catch (err) {
        handleError(res, err, 'linking project to strategic objective');
    }
});

router.delete('/strategic-plan/links', async (req, res) => {
    try {
        const projectId   = Number(req.query.projectId);
        const objectiveId = Number(req.query.objectiveId);
        if (!Number.isFinite(projectId) || !Number.isFinite(objectiveId)) {
            return res.status(400).json({ message: 'projectId and objectiveId are required' });
        }
        await pool.query(
            `UPDATE kemri_project_strategic_links SET voided = 1
              WHERE project_id = $1 AND sub_program_id = $2`,
            [projectId, objectiveId]
        );
        // If this was the primary, clear it.
        await pool.query(
            `UPDATE kemri_research_projects SET primary_objective_id = NULL
              WHERE id = $1 AND primary_objective_id = $2`,
            [projectId, objectiveId]
        );
        res.status(204).send();
    } catch (err) {
        handleError(res, err, 'unlinking project from strategic objective');
    }
});

// -- KRA progress (refactored to use REAL plan data) ------------------------
router.get('/strategic-plan/progress', async (req, res) => {
    try {
        // GoK FY runs Jul-Jun; Q3 ends 31 Mar. Compute current fiscal quarter.
        const fy = currentGoKFy();
        const expectedShare = Math.min(100, Math.round((fy.quarterNum / 4) * 100));

        // Pillar colors keyed by KRA code for stable UI rendering.
        const PILLAR_COLORS = {
            KRA1: '#1E40AF', KRA2: '#A16207', KRA3: '#0F766E',
            KRA4: '#0EA5E9', KRA5: '#7C3AED', KRA6: '#475569',
        };

        const planRow = (await pool.query(`
            SELECT cidpid, "startDate" FROM strategicplans WHERE is_active = TRUE AND voided = FALSE LIMIT 1
        `)).rows[0];
        if (!planRow) {
            // No active KEMRI plan seeded — return empty but well-formed payload.
            return res.json({ fyLabel: fy.fyLabel, quarter: fy.quarter, expectedShare,
                              target: 100, generatedAt: new Date().toISOString(),
                              totalActiveProjects: 0, pillars: [] });
        }
        const yearIdx = planYearIndex(planRow.startDate);

        // KRA rollup: linked active projects / outputs / achievements + FY-share.
        // Each metric is computed in its own subquery to avoid Cartesian-product
        // inflation when the same KRA has many subprograms x outputs x achievements.
        const rows = (await pool.query(`
            SELECT p."programCode" AS "kraCode",
                   COALESCE(p.programme, p."programName") AS "kraName",
                   (
                     SELECT COUNT(DISTINCT rp.id)
                       FROM subprograms s2
                       JOIN kemri_project_strategic_links psl ON psl.sub_program_id = s2."subProgramId" AND psl.voided = 0
                       JOIN kemri_research_projects rp ON rp.id = psl.project_id
                      WHERE s2."programId" = p."programId" AND s2.voided = FALSE
                        AND rp.voided = 0 AND rp.status IN ('active','pre_study','post_study')
                   )::int AS "activeProjects",
                   (
                     SELECT COUNT(*)
                       FROM subprograms s2
                       JOIN kemri_strategic_achievements a ON a.sub_program_id = s2."subProgramId" AND a.voided = 0
                      WHERE s2."programId" = p."programId" AND s2.voided = FALSE
                   )::int AS "achievementCount",
                   (
                     SELECT COUNT(*)
                       FROM subprograms s2
                       JOIN kemri_strategic_achievements a ON a.sub_program_id = s2."subProgramId" AND a.voided = 0
                      WHERE s2."programId" = p."programId" AND s2.voided = FALSE AND a.fy_label = $2
                   )::int AS "achievementsThisFy",
                   (
                     SELECT COUNT(DISTINCT osl.output_id)
                       FROM subprograms s2
                       JOIN kemri_output_strategic_links osl ON osl.sub_program_id = s2."subProgramId" AND osl.voided = 0
                      WHERE s2."programId" = p."programId" AND s2.voided = FALSE
                   )::int AS "outputCount",
                   (
                     SELECT COALESCE(SUM(s2."totalBudget"), 0)
                       FROM subprograms s2
                      WHERE s2."programId" = p."programId" AND s2.voided = FALSE
                   )::numeric AS "totalBudget"
              FROM programs p
             WHERE p.cidpid = $1 AND p.voided = FALSE
             ORDER BY p."programCode"
        `, [planRow.cidpid, fy.fyLabel])).rows;

        // total active projects across the institute (denominator)
        const totalActive = Number((await pool.query(
            `SELECT COUNT(*)::int AS n FROM kemri_research_projects WHERE voided = 0 AND status IN ('active','pre_study','post_study')`
        )).rows[0]?.n || 0);
        const denom = Math.max(1, totalActive);

        const pillars = rows.map((r) => ({
            key: r.kraCode,
            label: r.kraName,
            color: PILLAR_COLORS[r.kraCode] || '#64748B',
            projectCount: Number(r.activeProjects || 0),
            outputCount: Number(r.outputCount || 0),
            achievementCount: Number(r.achievementCount || 0),
            achievementsThisFy: Number(r.achievementsThisFy || 0),
            totalBudget: Number(r.totalBudget || 0),
            // % of active institute portfolio aligned to this KRA (presence-based)
            progressPct: Math.min(100, Math.round((Number(r.activeProjects || 0) / denom) * 100)),
        }));

        res.json({
            fyLabel: fy.fyLabel,
            quarter: fy.quarter,
            planYear: yearIdx,            // 1..5
            expectedShare,                 // Q-share of FY for the reference line
            target: 100,
            generatedAt: new Date().toISOString(),
            totalActiveProjects: totalActive,
            pillars,
        });
    } catch (err) {
        handleError(res, err, 'building strategic-plan progress');
    }
});

// -- 7-node procurement pipeline -------------------------------------------
//   Counts active procurement-plan items at each ERP integration node.
//   The schema stores procurement items in kemri_procurement_plan with a
//   `node` column when populated; for environments where that table does
//   not exist we return zero counts so the UI can still render the chart.
router.get('/procurement/pipeline', async (req, res) => {
    const NODES = [
        { node: 1, key: 'plan',          label: 'Procurement Plan',     color: '#0E7490' },
        { node: 2, key: 'pr',            label: 'Purchase Requisition', color: '#0891B2' },
        { node: 3, key: 'tendering',     label: 'Approval / Tendering', color: '#0EA5E9' },
        { node: 4, key: 'lpo',           label: 'LPO / Contract Award', color: '#3B82F6' },
        { node: 5, key: 'delivery_grn',  label: 'Delivery / GRN',       color: '#6366F1' },
        { node: 6, key: 'payment',       label: 'Payment & Close-Out',  color: '#A855F7' },
        { node: 7, key: 'asset',         label: 'Asset Registry',       color: '#16A34A' },
    ];
    try {
        const tableCheck = await pool.query(
            `SELECT to_regclass('public.kemri_procurement_plan') AS reg`
        );
        let counts = {};
        if (tableCheck.rows[0]?.reg) {
            const r = await pool.query(`
                SELECT COALESCE(status, 'plan') AS k, COUNT(*)::int AS n
                  FROM kemri_procurement_plan
                 WHERE COALESCE(voided, 0) = 0
                 GROUP BY 1
            `);
            // Map free-text statuses onto the 7-node taxonomy heuristically.
            const STATUS_MAP = {
                planned: 'plan', plan: 'plan',
                pr_raised: 'pr', requisition: 'pr', requisitioned: 'pr',
                approved: 'tendering', tendering: 'tendering', rfq: 'tendering',
                awarded: 'lpo', lpo: 'lpo', contract: 'lpo',
                delivered: 'delivery_grn', grn: 'delivery_grn', received: 'delivery_grn',
                paid: 'payment', closed: 'payment',
                asset: 'asset', tagged: 'asset',
            };
            for (const row of r.rows) {
                const slot = STATUS_MAP[String(row.k || '').toLowerCase()] || 'plan';
                counts[slot] = (counts[slot] || 0) + Number(row.n || 0);
            }
        }
        const nodes = NODES.map((n) => ({ ...n, count: counts[n.key] || 0 }));
        const totalActive = nodes.reduce((a, b) => a + b.count, 0);
        res.json({ totalActive, nodes, generatedAt: new Date().toISOString() });
    } catch (err) {
        handleError(res, err, 'building procurement pipeline');
    }
});

// -- 6-dimension HR staffing compliance radar ------------------------------
//   v5 §9.8 dimensions: rolesFilled, contractCompliance, genderBalance,
//   capacityBuilding, retention, training. Each is normalised to 0..100.
//
//   The current schema (kemri_research_staff) does NOT carry an explicit
//   employment_status or gender column — so we compute pragmatic proxies
//   from start_date / end_date / role_code, and we mark genderBalance as
//   "ERP-only" (returned at 50 with a flag) so the chart doesn't lie.
router.get('/hr/staffing-compliance', async (req, res) => {
    try {
        const staff = await pool.query(`
            SELECT
                COUNT(*)::int                                                       AS total,
                COUNT(*) FILTER (WHERE COALESCE(role_code, '') <> '')::int          AS with_role_code,
                COUNT(*) FILTER (WHERE end_date IS NULL OR end_date >= CURRENT_DATE)::int AS active_contract,
                COUNT(*) FILTER (WHERE end_date IS NOT NULL AND end_date <  CURRENT_DATE)::int AS expired_contract,
                COUNT(*) FILTER (WHERE start_date IS NOT NULL AND end_date IS NOT NULL)::int AS fully_dated
              FROM kemri_research_staff
             WHERE COALESCE(voided, 0) = 0
        `);
        const cap = await pool.query(`
            SELECT
                COUNT(*)::int                                                     AS total,
                COUNT(*) FILTER (WHERE COALESCE(end_date, CURRENT_DATE) >= CURRENT_DATE - INTERVAL '365 days')::int AS recent,
                COALESCE(SUM(participants_count), 0)::int                         AS participants
              FROM kemri_capacity_building
             WHERE COALESCE(voided, 0) = 0
        `);

        const s = staff.rows[0] || {}; const c = cap.rows[0] || {};
        const totalStaff = Math.max(1, Number(s.total || 0));
        const totalContracts = Math.max(1, Number(s.active_contract || 0) + Number(s.expired_contract || 0));
        const totalCap = Math.max(1, Number(c.total || 0));

        const rolesFilled        = Math.round((Number(s.with_role_code || 0) / totalStaff) * 100);
        const contractCompliance = Math.round((Number(s.active_contract  || 0) / totalContracts) * 100);
        // Gender data is not captured on kemri_research_staff (only in ERP HR).
        // Return a neutral 50 with a clear `genderDataAvailable: false` flag.
        const genderBalance      = 50;
        const capacityBuilding   = Math.round((Number(c.recent || 0) / totalCap) * 100);
        const retention          = Math.round((Number(s.active_contract || 0) / totalStaff) * 100);
        const training           = Math.min(100, Math.round((Number(c.participants || 0) / totalStaff) * 100));

        res.json({
            generatedAt: new Date().toISOString(),
            dimensions: [
                { key: 'rolesFilled',         label: 'Roles Filled',         value: rolesFilled },
                { key: 'contractCompliance',  label: 'Contract Compliance',  value: contractCompliance },
                { key: 'genderBalance',       label: 'Gender Balance',       value: genderBalance, note: 'Pending ERP-HR integration' },
                { key: 'capacityBuilding',    label: 'Capacity Building',    value: capacityBuilding },
                { key: 'retention',           label: 'Retention',            value: retention },
                { key: 'training',            label: 'Training Coverage',    value: training },
            ],
            genderDataAvailable: false,   // True once ERP-HR sync is wired (v5 §6.2 Node HR-4)
            raw: {
                totalStaff:      Number(s.total || 0),
                withRoleCode:    Number(s.with_role_code || 0),
                activeContract:  Number(s.active_contract || 0),
                expiredContract: Number(s.expired_contract || 0),
                capacityEvents:  Number(c.total || 0),
                capacityRecent:  Number(c.recent || 0),
                capacityParticipants: Number(c.participants || 0),
            },
        });
    } catch (err) {
        handleError(res, err, 'building HR staffing compliance');
    }
});

// -- AI Reporting Engine catalog (11 report types + time savings) ----------
//   Static catalog from v5 §10.2. Returned as JSON so the frontend can
//   render a "manual vs AI hours" comparison chart and a sign-off matrix
//   without baking the catalog into UI code.
router.get('/ai-reports/catalog', async (req, res) => {
    res.json({
        generatedAt: new Date().toISOString(),
        averageSavingPct: 92,
        manualHoursTotal: 304,
        aiHoursTotal: 25.8,
        reports: [
            { code: 'QPR',  name: 'Quarterly Progress Report',           audience: 'Management / Funders (concurrent)', manualHours: 40,  aiHours: 3.5, savingPct: 91, signOff: 'Centre Director' },
            { code: 'BPS',  name: 'Board Performance Scorecard',          audience: 'Board of Management',               manualHours: 16,  aiHours: 1.0, savingPct: 94, signOff: 'Director General' },
            { code: 'MMB',  name: 'Monthly MEL Bulletin',                 audience: 'Centre Directors / MEL Teams',      manualHours: 8,   aiHours: 0.75, savingPct: 88, signOff: 'MEL Division Head' },
            { code: 'PIA',  name: 'PI Annual Project Report (funder)',    audience: 'Funder / Donor',                    manualHours: 30,  aiHours: 2.0, savingPct: 93, signOff: 'PI + Centre Director + DG' },
            { code: 'PB',   name: 'Policy Brief (research-to-policy)',    audience: 'MoH / Parliament / Partners',       manualHours: 24,  aiHours: 2.0, savingPct: 92, signOff: 'Deputy Director + Centre Director' },
            { code: 'IDX',  name: 'Indicator Data Export',                audience: 'MEL Division / Finance',            manualHours: 12,  aiHours: 0.33, savingPct: 97, signOff: 'MEL Division Head' },
            { code: 'PSO',  name: 'Post-Study Output Summary (per PI)',   audience: 'PI / Centre Director / Board',      manualHours: 8,   aiHours: 0.75, savingPct: 91, signOff: 'Centre Director' },
            { code: 'ARU',  name: 'Annual Research Uptake Report',        audience: 'Board / MoH / Funders',             manualHours: 20,  aiHours: 2.0, savingPct: 90, signOff: 'MEL Division Head + DG' },
            { code: 'GIS',  name: 'GIS Spatial Analysis Report',          audience: 'Management / MoH / Partners',       manualHours: 20,  aiHours: 3.0, savingPct: 85, signOff: 'GIS Specialist + Centre Director' },
            { code: 'DNC',  name: 'Donor Non-Conformity Letter (DG-NCF-001)', audience: 'Donor / KEMRI Legal',           manualHours: 6,   aiHours: 0.5, savingPct: 92, signOff: 'DG + Legal Counsel' },
            { code: 'APR',  name: 'Annual Performance Report (institutional)', audience: 'Board / MoH / Public',          manualHours: 120, aiHours: 10.0, savingPct: 92, signOff: 'Director General + Board Secretary' },
        ],
    });
});

// -- Concurrent reporting calendar (v5 §5.2) -------------------------------
//   Static reference for the 4-tier concurrent reporting protocol so the
//   UI can render a calendar / timeline.
router.get('/concurrent-reporting/calendar', async (req, res) => {
    res.json({
        generatedAt: new Date().toISOString(),
        tiers: [
            { tier: 1, name: 'Real-Time Portal',     donor: 'Live dashboard (read-only)',  internal: 'Same data CD sees',       timing: 'Continuous from registration' },
            { tier: 2, name: 'Concurrent Quarterly', donor: 'AI-drafted report in donor template (Word + PDF)', internal: 'Institutional quarterly report on dashboard', timing: 'Within 24 hours of Centre Director approval' },
            { tier: 3, name: 'Annual Financial',     donor: 'Annual financial statement: budget vs actual vs balance', internal: 'Same financial data in institutional format', timing: 'By 31 July each year (end of GoK FY)' },
            { tier: 4, name: 'Final Report',         donor: 'Final project report in donor template', internal: 'Project closure record; Post-Study Tracking opens', timing: 'Within 30 days of project end' },
        ],
        events: [
            { event: 'Quarterly Progress Report', piDeadline: '15 days after quarter-end',     cdReview: 'D+5 after PI submission', aiGen: 'D+6 (within 30 min of approval)', donorSubmit: 'D+7 (Grants Office)', kemriUpdate: 'D+7 (dashboard updates)' },
            { event: 'Semi-Annual Report',         piDeadline: '30 days before donor deadline', cdReview: '5 days after PI submission', aiGen: 'Within 30 min of approval',   donorSubmit: 'On donor deadline',  kemriUpdate: 'Same day as donor submission' },
            { event: 'Annual Progress Report',     piDeadline: '45 days before donor deadline', cdReview: '7 days after PI submission', aiGen: 'Within 1 hour of approval',    donorSubmit: 'On donor deadline',  kemriUpdate: 'Same day as donor submission' },
            { event: 'Final Report',               piDeadline: '60 days before project end',    cdReview: '10 days after PI submission', aiGen: 'Within 2 hours of approval',  donorSubmit: 'On donor deadline',  kemriUpdate: 'Triggers Step 10 closure workflow' },
        ],
    });
});

// -- 7-year output timeline per project (v5 §11.2) -------------------------
//   Returns a per-project timeline of what KIMES tracks from project closure
//   (Year N) through Year N+7. We compute the year offsets from the project's
//   actual end date and tag each year with whether outputs exist for it.
router.get('/projects/:id/output-timeline', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
        const proj = await pool.query(
            `SELECT id,
                    kimes_project_id AS "kimesProjectId",
                    title,
                    COALESCE(proposed_end_date, proposed_start_date + INTERVAL '3 years', actual_start_date + INTERVAL '3 years') AS "endDate",
                    status
               FROM kemri_research_projects WHERE id = $1 AND voided = 0`,
            [id]
        );
        if (!proj.rows.length) return res.status(404).json({ message: 'Research project not found' });
        const p = proj.rows[0];
        const outputs = await pool.query(
            `SELECT output_type AS "outputType",
                    EXTRACT(YEAR FROM COALESCE(date_recorded, created_at))::int AS y,
                    COUNT(*)::int AS n
               FROM kemri_outputs
              WHERE project_id = $1 AND voided = 0
              GROUP BY 1, 2
              ORDER BY y, 1`,
            [id]
        );
        const endDate = p.endDate ? new Date(p.endDate) : null;
        const baseYear = endDate ? endDate.getFullYear() : new Date().getFullYear();
        const timeline = [];
        const TRACKS = [
            { offset: 0, label: 'Year N',   activity: 'Study closure report; preliminary output list; final financial reconciliation' },
            { offset: 1, label: 'Year N+1', activity: 'Publication submissions; first datasets deposited; conference presentations' },
            { offset: 2, label: 'Year N+2', activity: 'Citation tracking begins (auto-quarterly); policy brief logging; IP stage update' },
            { offset: 3, label: 'Year N+3', activity: 'Mid-term output audit by MEL Division; completeness score' },
            { offset: 4, label: 'Year N+4', activity: 'Annual AI policy citation scan; citation counts auto-updated; IP expiry monitoring' },
            { offset: 5, label: 'Year N+5', activity: 'Continued citation & uptake monitoring; Research Uptake Score updated' },
            { offset: 6, label: 'Year N+6', activity: 'Continued IP monitoring; capacity-building outputs aggregated' },
            { offset: 7, label: 'Year N+7', activity: 'Full research lifecycle report auto-generated; institutional record archived' },
        ];
        for (const t of TRACKS) {
            const y = baseYear + t.offset;
            const rows = outputs.rows.filter((r) => r.y === y);
            const byType = rows.reduce((acc, r) => { acc[r.outputType] = (acc[r.outputType] || 0) + Number(r.n || 0); return acc; }, {});
            timeline.push({
                year: y,
                label: t.label,
                activity: t.activity,
                isPast: y <= new Date().getFullYear(),
                outputsByType: byType,
                total: rows.reduce((a, b) => a + Number(b.n || 0), 0),
            });
        }
        res.json({
            projectId: p.id,
            kimesProjectId: p.kimesProjectId,
            title: p.title,
            status: p.status,
            endDate: p.endDate,
            baseYear,
            currentYear: new Date().getFullYear(),
            timeline,
        });
    } catch (err) {
        handleError(res, err, 'building output timeline');
    }
});

// -- Review Authority Matrix (v5 §2.1) — reference data --------------------
router.get('/governance/review-authority', async (req, res) => {
    res.json({
        generatedAt: new Date().toISOString(),
        principle: 'Peer-Led Review — Centre Directors or Senior Scientists at equal/higher rank to the PI. M&E Officers facilitate but do not gatekeep scientific quality.',
        matrix: [
            { stage: 'Project registration & logframe approval',           responsible: 'Centre Director / Scientific Committee',  authority: 'Scientific & institutional', melRole: 'Facilitate form, check completeness, assign project ID' },
            { stage: 'KPI & milestone plan validation',                    responsible: 'Centre Director + MEL Division Head',     authority: 'Joint: scientific + systems', melRole: 'Ensure indicators are SMART; no veto on scientific design' },
            { stage: 'Quarterly milestone data entry',                     responsible: 'Principal Investigator',                  authority: 'PI solely responsible',       melRole: 'Technical support, pre-fill known fields, send reminders' },
            { stage: 'Automated DQA',                                      responsible: 'KIMES System (automated)',                authority: 'Technical / system-level',    melRole: 'Monitor DQA scores; follow up on flagged fields; no scientific judgment' },
            { stage: 'Scientific peer review & RAG assignment',            responsible: 'Centre Director or Senior Scientist (≥ PI rank)', authority: 'Scientific peer authority', melRole: 'Prepare data summary package; no independent review or RAG authority' },
            { stage: 'Escalation for non-reporting PIs',                   responsible: 'MEL Head → Centre Director → DG → Board', authority: 'Progressive institutional',   melRole: 'Initiate escalation log; draft notices; route through correct channels' },
            { stage: 'Donor concurrent report routing',                    responsible: 'Grants Management Office + MEL Division', authority: 'Institutional + grant management', melRole: 'Configure donor portal; manage report calendar; route approved reports' },
            { stage: 'Procurement service requests',                       responsible: 'PI (initiator) + ERP Procurement (processor)', authority: 'PI initiates; Procurement processes', melRole: 'KIMES-ERP API management; procurement status monitoring' },
            { stage: 'HR service requests',                                responsible: 'PI + Centre Director (endorser) + ERP HR (processor)', authority: 'Centre Director endorses; HR processes', melRole: 'KIMES-ERP API management; staffing dashboard' },
            { stage: 'Post-study output capture',                          responsible: 'PI (primary) + M&E Officer (facilitation)', authority: 'PI responsibility; system auto-imports where possible', melRole: 'Maintain output registry; DOI auto-import; citation auto-tracking' },
            { stage: 'Donor non-conformity notification (DG-NCF-001)',     responsible: 'Director General (exclusively)',           authority: 'Executive — DG only',         melRole: 'Compile KIMES audit trail; draft DG letter from template; route for DG approval' },
        ],
        melDo: [
            'System administration and user support for KIMES across all centres',
            'Send automated reminders to PIs at 30, 14 and 7 days before reporting deadlines',
            'Monitor the automated DQA engine and follow up on data entry errors',
            'Prepare consolidated data packages for Centre Directors',
            'Manage the escalation log and route non-compliance notices through correct channels',
            'Facilitate AI report generation and prepare drafts for Centre Director or DG approval',
            'Operate the GIS platform; manage KIMES-ERP integration monitoring; manage Donor Portal',
        ],
        melDoNot: [
            'Approve or reject any PI scientific progress report',
            'Assign or change RAG status independently',
            'Query the scientific content or methodology of a PI research project',
            'Initiate or send any escalation notice to a donor — that is a DG-only function',
        ],
    });
});

module.exports = router;
