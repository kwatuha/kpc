/**
 * KIMES Workflow & Escalation Engine.
 *
 * Implements the SLAs and escalation ladder defined in Concept §3 / §7 and
 * KIMES v5 §7.2 and §11.2.
 *
 *  Pre-deadline reminders (issued as kemri_notifications):
 *      D-30, D-14, D-7   on the PI submission deadline
 *                        (deadline = milestone.reporting_period_end + 15 days)
 *
 *  Post-deadline ladder (Levels 1–4 are auto-detected per-project; Level 5
 *  is auto-detected at the centre level once 3+ projects in the same centre
 *  are simultaneously at L3 or above):
 *      D+1     L1 Caution          — automated reminder + reminder note logged
 *      D+14    L2 Formal Notice    — MEL Division Head; CC Centre Director
 *      D+21    L3 Significant      — Board Dashboard flag; CC DG Office
 *      D+30    L4 Severe / Donor   — DG Formal Letter (DG-NCF-001) drafted
 *      Centre-pattern  L5 Institutional — Board directive + DG action plan
 *
 *  SERU expiry alerts (Concept §3 Step 4 / DQA #7):
 *      SERU expiring within 60 days → notification to PI + Centre Director
 *
 *  Patent expiry alerts (v5 §3 Step 15 / §11.2):
 *      Patent expiry within 12 months → notification to PI + Innovation Unit
 *
 *  High-impact publication alerts (v5 §3 Step 12):
 *      `impact_factor > 5` → notification to Communications + DG Office
 *
 * The engine is idempotent — it can run as often as you like (hourly cron
 * or manually via POST /api/kemri/workflow/tick).  Notifications are
 * de-duplicated via `kemri_notifications.dedupe_key`; auto-escalations are
 * de-duplicated via the `uq_kemri_escalations_open_auto` partial index.
 *
 * The engine *never* sends a donor letter on its own — it only renders a
 * draft on the kemri_escalations row when an L4 trigger first fires.
 * Sign-off (DG + Legal) remains a human action via the Escalations page,
 * subject to IRB recommendation → DG approval → Legal Counsel clearance.
 */

const pool = require('../config/db');

const PI_GRACE_DAYS = 15;          // PI submission window after period end
const REMINDER_OFFSETS = [30, 14, 7];

// Patent expiry watch: T-12 months (per v5 §3 Step 15).
const PATENT_EXPIRY_LOOKAHEAD_DAYS = 365;

// High-impact publication threshold (per v5 §3 Step 12: IF > 5).
const HIGH_IMPACT_IF_THRESHOLD = 5;

// Centre-wide pattern threshold for L5 (per v5 §7.1 — “multiple PIs non-
// conforming”). We open an institutional escalation when at least three
// projects in the same centre are simultaneously at L3 or above.
const L5_CENTRE_PROJECT_THRESHOLD = 3;
const L5_MIN_INDIVIDUAL_LEVEL = 3;

const ESCALATION_LADDER = [
    { level: 1, daysLate: 1,  classification: 'minor',         subject: 'L1 Caution — milestone report overdue',
      body: 'A reminder has been issued to the Principal Investigator. Resolution window D+1 to D+14. (KIMES non-conformity protocol Level 1.)' },
    { level: 2, daysLate: 14, classification: 'moderate',      subject: 'L2 Formal Written Notice — milestone report 14 days overdue',
      body: 'Formal written notice issued to the PI by the MEL Division Head, with the Centre Director copied. PI is required to respond by D+21 with a credible recovery plan. (KIMES non-conformity protocol Level 2.)' },
    { level: 3, daysLate: 21, classification: 'significant',   subject: 'L3 Significant Non-Conformity — Centre Director intervention',
      body: 'Centre Director assumes oversight and has been directed to convene a remediation meeting by D+23. The case is now flagged on the Board Dashboard and the DG Office has been notified. (KIMES non-conformity protocol Level 3.)' },
    { level: 4, daysLate: 30, classification: 'severe',        subject: 'L4 Severe Non-Conformity — DG intervention; donor notification under review',
      body: 'Director General Formal Letter has been drafted (template DG-NCF-001). Internal Review Board to convene by D+33. Donor notification eligibility: requires IRB recommendation, DG approval, and Legal clearance before transmission. (KIMES non-conformity protocol Level 4.)' },
];

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

async function pickRecipientUserIds(client, projectId, { includePI = true, includeCD = false, includeMEL = false, includeDG = false, includeInnovation = false, includeComms = false, includeBoard = false } = {}) {
    // Resolve message recipients without exploding when the users/roles
    // schema changes shape (column casing varies across forks of this repo).
    // The PI is on the project itself; everyone else is matched by role name
    // (case-insensitive).  Anything we can't find is silently skipped.
    const ids = new Set();

    if (includePI && projectId) {
        await client.query('SAVEPOINT sp_pick_pi');
        try {
            const r = await client.query(
                `SELECT pi_user_id FROM kemri_research_projects WHERE id = $1`,
                [projectId]
            );
            const pi = r.rows[0]?.pi_user_id;
            if (pi) ids.add(pi);
            await client.query('RELEASE SAVEPOINT sp_pick_pi');
        } catch (_) {
            await client.query('ROLLBACK TO SAVEPOINT sp_pick_pi');
        }
    }

    const roleSets = [];
    if (includeCD)         roleSets.push(['centre_director', 'centredirector', 'centre director']);
    if (includeMEL)        roleSets.push(['mel_division_head', 'mel_head', 'mel officer', 'mel_officer']);
    if (includeDG)         roleSets.push(['director_general', 'dg', 'director general']);
    if (includeInnovation) roleSets.push(['innovation_unit', 'innovation officer', 'ip_office', 'innovation']);
    if (includeComms)      roleSets.push(['communications', 'comms', 'communications officer']);
    if (includeBoard)      roleSets.push(['board', 'board secretary', 'board member', 'board chair']);

    if (roleSets.length) {
        const flat = roleSets.flat();
        // Wrap in a SAVEPOINT so a schema mismatch doesn't abort the surrounding
        // transaction.  Schema columns: users.userid, users.roleid; roles.roleid, roles.name.
        await client.query('SAVEPOINT sp_pick_roles');
        try {
            const r = await client.query(
                `SELECT u.userid
                   FROM users u
              LEFT JOIN roles r ON r.roleid = u.roleid
                  WHERE COALESCE(u.voided, false) = false
                    AND LOWER(COALESCE(r.name, '')) = ANY($1::text[])`,
                [flat]
            );
            r.rows.forEach((row) => row.userid && ids.add(row.userid));
            await client.query('RELEASE SAVEPOINT sp_pick_roles');
        } catch (_) {
            await client.query('ROLLBACK TO SAVEPOINT sp_pick_roles');
        }
    }
    return Array.from(ids);
}

async function postNotification(client, { userId, kind, level = null, projectId = null, reportId = null, escalationId = null, subject, body = null, link = null, dedupeKey = null }) {
    if (!userId) return false;
    // De-dupe explicitly so we don't rely on ON CONFLICT (which requires the
    // partial-unique-index predicate to be quoted exactly — finicky and error-
    // prone across Postgres versions).
    if (dedupeKey) {
        const dup = await client.query(
            `SELECT 1 FROM kemri_notifications
              WHERE user_id = $1 AND dedupe_key = $2 AND voided = 0 LIMIT 1`,
            [userId, dedupeKey]
        );
        if (dup.rowCount > 0) return false;
    }
    // We're inside a transaction — wrap the INSERT in a SAVEPOINT so a
    // unique-violation race doesn't kill the whole tick.
    await client.query('SAVEPOINT sp_notif');
    try {
        await client.query(
            `INSERT INTO kemri_notifications
                 (user_id, kind, level, project_id, report_id, escalation_id, subject, body, link, dedupe_key)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [userId, kind, level, projectId, reportId, escalationId, subject, body, link, dedupeKey]
        );
        await client.query('RELEASE SAVEPOINT sp_notif');
        return true;
    } catch (_) {
        await client.query('ROLLBACK TO SAVEPOINT sp_notif');
        return false;
    }
}

function renderDgNcf001({ project, report, escalation }) {
    const projTitle = project?.title || project?.short_name || `Project #${project?.id || ''}`;
    const kimesId = project?.kimes_project_id || '';
    const fyLabel = report?.fy_label || '';
    const quarter = report?.quarter || '';
    const period = report?.reporting_period_end ? new Date(report.reporting_period_end).toISOString().slice(0, 10) : '';
    const daysLate = escalation?.days_late ?? '';
    return [
        `[DRAFT — DG-NCF-001 NON-CONFORMITY NOTIFICATION]`,
        ``,
        `1. OPENING`,
        `   On behalf of the Kenya Medical Research Institute, I write to formally notify you of`,
        `   a material non-conformity event in the implementation of the project below.`,
        ``,
        `   Project: ${projTitle}`,
        `   KIMES ID: ${kimesId}`,
        `   Reporting period: ${fyLabel} ${quarter} (period end ${period})`,
        `   Days overdue at notification: ${daysLate}`,
        ``,
        `2. STATEMENT OF NON-CONFORMITY`,
        `   The Principal Investigator has failed to submit the quarterly milestone report`,
        `   within the time-frame stipulated in the Grant Agreement and KEMRI's Research`,
        `   Implementation and Grant Monitoring policy. Internal escalation reached`,
        `   Level ${escalation?.level || 4} (${escalation?.classification || 'severe'}).`,
        ``,
        `3. INSTITUTIONAL MEASURES TAKEN`,
        `   • Day +1 — automated reminder issued.`,
        `   • Day +14 — formal written notice from MEL Division Head.`,
        `   • Day +21 — Centre Director intervention; case flagged on Board Dashboard.`,
        `   • Day +30 — DG Formal Letter (this notification) prepared.`,
        ``,
        `4. STATUS & RISK`,
        `   The continued absence of the milestone report places the grant at material`,
        `   risk and may impair KEMRI's ability to assure the donor of fund stewardship`,
        `   and scientific delivery. KEMRI is treating the matter as a Level 4 event under`,
        `   our published non-conformity protocol.`,
        ``,
        `5. REMEDIATION PATHWAY`,
        `   The Internal Review Board will convene to review the case. The Director General`,
        `   will determine, in consultation with KEMRI Legal Counsel, whether a formal`,
        `   donor notification is warranted. Should remediation be achieved before that`,
        `   determination, this draft will not be issued.`,
        ``,
        `6. COMMITMENT`,
        `   KEMRI remains fully committed to the responsible delivery of this grant and`,
        `   to transparent stewardship of donor funds. We will keep you informed at every`,
        `   stage and welcome any questions in the interim.`,
        ``,
        `   Yours sincerely,`,
        ``,
        `   _________________________`,
        `   Director General, KEMRI`,
        ``,
        `   cc: KEMRI Board • Deputy Director (Research) • Grants Management • Legal Counsel`,
    ].join('\n');
}

// ---------------------------------------------------------------------------
//  Main tick
// ---------------------------------------------------------------------------

async function runDailyTick({ ranBy = null, dryRun = false } = {}) {
    const client = await pool.getConnection();
    const summary = {
        remindersSent: 0,
        escalationsOpened: 0,
        escalationsUpgraded: 0,
        l5EscalationsOpened: 0,
        seruAlertsSent: 0,
        patentAlertsSent: 0,
        highImpactAlertsSent: 0,
        details: { reminders: [], escalations: [], seru: [], patents: [], highImpact: [], l5: [] },
    };

    try {
        await client.beginTransaction();

        // -- 1. Pre-deadline reminders (D-30 / D-14 / D-7) -------------------
        // We treat any milestone report still open (draft / dqa_returned / queried)
        // whose deadline (period end + 15 days) lands on one of the offset days.
        for (const offset of REMINDER_OFFSETS) {
            const r = await client.query(
                `SELECT mr.id              AS report_id,
                        mr.fy_label,
                        mr.quarter,
                        mr.reporting_period_end,
                        mr.status,
                        p.id               AS project_id,
                        p.title,
                        p.kimes_project_id,
                        p.pi_user_id
                   FROM kemri_milestone_reports mr
                   JOIN kemri_research_projects p ON p.id = mr.project_id
                  WHERE mr.voided = 0 AND p.voided = 0
                    AND mr.reporting_period_end IS NOT NULL
                    AND (mr.reporting_period_end + INTERVAL '${PI_GRACE_DAYS} days')::date - CURRENT_DATE = ${offset}
                    AND mr.status IN ('draft','dqa_returned','queried')`
            );
            for (const row of r.rows) {
                const recipients = await pickRecipientUserIds(client, row.project_id, { includePI: true, includeCD: offset <= 7 });
                for (const userId of recipients) {
                    const ok = await postNotification(client, {
                        userId,
                        kind: 'reminder',
                        projectId: row.project_id,
                        reportId: row.report_id,
                        subject: `D-${offset} reminder — milestone report due ${row.fy_label} ${row.quarter}`,
                        body: `Milestone report for ${row.title} (${row.kimes_project_id}) is due in ${offset} day(s). Reporting period end ${row.reporting_period_end}. PI submission window closes 15 days after period end.`,
                        link: `/kemri/dashboard/pi`,
                        dedupeKey: `reminder:${row.report_id}:D-${offset}`,
                    });
                    if (ok) {
                        summary.remindersSent += 1;
                        summary.details.reminders.push({ reportId: row.report_id, offset, userId });
                    }
                }
            }
        }

        // -- 2. Post-deadline auto-escalation (D+1 → L1 → L2 → L3 → L4) ------
        const overdue = await client.query(
            `SELECT mr.id              AS report_id,
                    mr.fy_label,
                    mr.quarter,
                    mr.reporting_period_end,
                    mr.status,
                    p.id               AS project_id,
                    p.title,
                    p.short_name,
                    p.kimes_project_id,
                    p.pi_user_id,
                    (CURRENT_DATE - (mr.reporting_period_end + INTERVAL '${PI_GRACE_DAYS} days')::date)::int AS days_late,
                    (mr.reporting_period_end + INTERVAL '${PI_GRACE_DAYS} days')::date AS deadline
               FROM kemri_milestone_reports mr
               JOIN kemri_research_projects p ON p.id = mr.project_id
              WHERE mr.voided = 0 AND p.voided = 0
                AND mr.status IN ('draft','dqa_returned','queried')
                AND mr.reporting_period_end IS NOT NULL
                AND (mr.reporting_period_end + INTERVAL '${PI_GRACE_DAYS} days')::date < CURRENT_DATE`
        );

        for (const row of overdue.rows) {
            // pick the highest ladder rung whose threshold has been reached
            const rung = [...ESCALATION_LADDER].reverse().find((r) => row.days_late >= r.daysLate);
            if (!rung) continue;

            // Find existing auto-escalation for this (project, report)
            const existing = await client.query(
                `SELECT id, level, donor_letter_at
                   FROM kemri_escalations
                  WHERE project_id = $1 AND COALESCE(report_id, 0) = $2
                    AND auto_generated = 1 AND resolved = 0 AND voided = 0
                  ORDER BY id DESC LIMIT 1`,
                [row.project_id, row.report_id]
            );

            let escalationId;
            let isUpgrade = false;
            let isNew = false;

            if (existing.rows.length === 0) {
                await client.query('SAVEPOINT sp_esc');
                try {
                    const ins = await client.query(
                        `INSERT INTO kemri_escalations
                             (project_id, report_id, level, classification,
                              deadline, days_late, auto_generated,
                              notice_subject, notice_body, last_check_at)
                         VALUES ($1,$2,$3,$4,$5,$6,1,$7,$8,CURRENT_TIMESTAMP)
                         RETURNING id`,
                        [row.project_id, row.report_id, rung.level, rung.classification, row.deadline, row.days_late, rung.subject, rung.body]
                    );
                    await client.query('RELEASE SAVEPOINT sp_esc');
                    escalationId = ins.rows[0].id;
                    isNew = true;
                    summary.escalationsOpened += 1;
                } catch (e) {
                    await client.query('ROLLBACK TO SAVEPOINT sp_esc');
                }
            } else if (existing.rows[0].level < rung.level) {
                escalationId = existing.rows[0].id;
                await client.query(
                    `UPDATE kemri_escalations
                        SET level = $1, classification = $2,
                            days_late = $3, deadline = $4,
                            notice_subject = $5, notice_body = $6,
                            last_check_at = CURRENT_TIMESTAMP,
                            updated_at = CURRENT_TIMESTAMP
                      WHERE id = $7`,
                    [rung.level, rung.classification, row.days_late, row.deadline, rung.subject, rung.body, escalationId]
                );
                isUpgrade = true;
                summary.escalationsUpgraded += 1;
            } else {
                escalationId = existing.rows[0].id;
                await client.query(
                    `UPDATE kemri_escalations
                        SET days_late = $1, last_check_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                      WHERE id = $2`,
                    [row.days_late, escalationId]
                );
            }

            if (escalationId) {
                summary.details.escalations.push({
                    projectId: row.project_id,
                    reportId: row.report_id,
                    level: rung.level,
                    daysLate: row.days_late,
                    isNew,
                    isUpgrade,
                });

                // For L4, render DG-NCF-001 once (don't re-render on subsequent ticks).
                if (rung.level === 4 && !existing.rows[0]?.donor_letter_at) {
                    const projRes = await client.query(
                        `SELECT id, title, short_name, kimes_project_id
                           FROM kemri_research_projects WHERE id = $1`,
                        [row.project_id]
                    );
                    const escRes = await client.query(
                        `SELECT level, classification, days_late
                           FROM kemri_escalations WHERE id = $1`,
                        [escalationId]
                    );
                    const letter = renderDgNcf001({
                        project: projRes.rows[0],
                        report: row,
                        escalation: escRes.rows[0],
                    });
                    await client.query(
                        `UPDATE kemri_escalations
                            SET donor_letter_body = $1, donor_letter_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                          WHERE id = $2`,
                        [letter, escalationId]
                    );
                }

                // Notify recipients per ladder rung
                const recipients = await pickRecipientUserIds(client, row.project_id, {
                    includePI: true,
                    includeCD: rung.level >= 1,
                    includeMEL: rung.level >= 2,
                    includeDG: rung.level >= 3,
                });
                for (const userId of recipients) {
                    const ok = await postNotification(client, {
                        userId,
                        kind: 'escalation',
                        level: rung.level,
                        projectId: row.project_id,
                        reportId: row.report_id,
                        escalationId,
                        subject: rung.subject,
                        body: `${rung.body}\n\nProject: ${row.title} (${row.kimes_project_id}). Period: ${row.fy_label} ${row.quarter}. Days late: ${row.days_late}.`,
                        link: `/kemri/escalations`,
                        // Re-notify when level changes (one row per (escalation, level)).
                        dedupeKey: `escalation:${escalationId}:L${rung.level}`,
                    });
                    if (ok) summary.remindersSent += 1;
                }
            }
        }

        // -- 3. SERU expiry alerts (≤ 60 days) -------------------------------
        const seruRes = await client.query(
            `SELECT p.id            AS project_id,
                    p.title,
                    p.kimes_project_id,
                    p.seru_approval_no,
                    p.seru_expiry_date,
                    (p.seru_expiry_date - CURRENT_DATE)::int AS days_to_expiry
               FROM kemri_research_projects p
              WHERE p.voided = 0
                AND p.seru_expiry_date IS NOT NULL
                AND p.status IN ('active','pre_study')
                AND p.seru_expiry_date <= CURRENT_DATE + INTERVAL '60 days'`
        );
        for (const row of seruRes.rows) {
            const expiredText = row.days_to_expiry < 0
                ? `EXPIRED ${Math.abs(row.days_to_expiry)} day(s) ago`
                : `expires in ${row.days_to_expiry} day(s)`;
            const recipients = await pickRecipientUserIds(client, row.project_id, { includePI: true, includeCD: true, includeMEL: row.days_to_expiry <= 14 });
            for (const userId of recipients) {
                const ok = await postNotification(client, {
                    userId,
                    kind: 'seru_expiry',
                    projectId: row.project_id,
                    subject: `SERU approval ${expiredText} — ${row.title}`,
                    body: `SERU approval ${row.seru_approval_no || '—'} for ${row.kimes_project_id || row.title} ${expiredText}. Renew or pause data collection per KEMRI ethics policy.`,
                    link: `/kemri/studies`,
                    // Daily-bucketed key so a single repeat notification per day is fine.
                    dedupeKey: `seru:${row.project_id}:${new Date().toISOString().slice(0,10)}`,
                });
                if (ok) {
                    summary.seruAlertsSent += 1;
                    summary.details.seru.push({ projectId: row.project_id, daysToExpiry: row.days_to_expiry, userId });
                }
            }
        }

        // -- 4. Centre-wide L5 detection -------------------------------------
        //   When 3+ projects in the same centre simultaneously sit at L3 or
        //   above (auto-generated, unresolved), open a single L5 institutional
        //   escalation linked to that centre's most senior project (lowest id).
        const centreClusters = await client.query(
            `SELECT p.centre_id,
                    COUNT(DISTINCT e.project_id)::int AS hot_projects,
                    MIN(p.id)::bigint                AS anchor_project_id,
                    JSON_AGG(DISTINCT p.kimes_project_id) AS sample_kimes_ids
               FROM kemri_escalations e
               JOIN kemri_research_projects p ON p.id = e.project_id
              WHERE e.voided = 0 AND e.resolved = 0
                AND e.auto_generated = 1
                AND e.level >= $1
                AND p.centre_id IS NOT NULL
              GROUP BY p.centre_id
             HAVING COUNT(DISTINCT e.project_id) >= $2`,
            [L5_MIN_INDIVIDUAL_LEVEL, L5_CENTRE_PROJECT_THRESHOLD]
        );

        for (const cluster of centreClusters.rows) {
            const existing = await client.query(
                `SELECT id FROM kemri_escalations
                  WHERE level = 5 AND auto_generated = 1 AND resolved = 0
                    AND voided = 0 AND project_id = $1
                  LIMIT 1`,
                [cluster.anchor_project_id]
            );
            if (existing.rowCount === 0) {
                await client.query('SAVEPOINT sp_l5');
                try {
                    const ins = await client.query(
                        `INSERT INTO kemri_escalations
                             (project_id, level, classification, auto_generated,
                              notice_subject, notice_body, last_check_at)
                         VALUES ($1, 5, 'institutional', 1, $2, $3, CURRENT_TIMESTAMP)
                         RETURNING id`,
                        [
                            cluster.anchor_project_id,
                            `L5 Institutional Non-Conformity — ${cluster.hot_projects} projects in centre at L${L5_MIN_INDIVIDUAL_LEVEL}+`,
                            `Centre ${cluster.centre_id} shows a systemic pattern: ${cluster.hot_projects} active research projects are simultaneously in significant or worse non-conformity. Per KIMES v5 §7.1 Level 5 this requires a Board directive and a DG-led centre action plan. Sample studies: ${(cluster.sample_kimes_ids || []).slice(0, 6).join(', ')}.`,
                        ]
                    );
                    await client.query('RELEASE SAVEPOINT sp_l5');
                    summary.l5EscalationsOpened += 1;
                    summary.details.l5.push({
                        centreId: cluster.centre_id,
                        hotProjects: cluster.hot_projects,
                        escalationId: ins.rows[0].id,
                    });

                    const recipients = await pickRecipientUserIds(client, cluster.anchor_project_id, {
                        includePI: false, includeCD: true, includeMEL: true, includeDG: true, includeBoard: true,
                    });
                    for (const userId of recipients) {
                        await postNotification(client, {
                            userId,
                            kind: 'escalation_l5',
                            level: 5,
                            projectId: cluster.anchor_project_id,
                            escalationId: ins.rows[0].id,
                            subject: `L5 Institutional Non-Conformity — Centre #${cluster.centre_id}`,
                            body: `Centre-wide pattern: ${cluster.hot_projects} projects at L${L5_MIN_INDIVIDUAL_LEVEL}+. Board directive required.`,
                            link: `/kemri/escalations`,
                            dedupeKey: `escalation_l5:centre-${cluster.centre_id}:${new Date().toISOString().slice(0,10)}`,
                        });
                    }
                } catch (_) {
                    await client.query('ROLLBACK TO SAVEPOINT sp_l5');
                }
            }
        }

        // -- 5. Patent expiry alerts (T-12 months) ---------------------------
        //   For every IP/patent output whose `patent_expiry_date` falls inside
        //   the next 365 days and where we haven't already alerted (dedupe via
        //   `patent_expiry_alert_at`).
        const patentRes = await client.query(
            `SELECT o.id                 AS output_id,
                    o.project_id,
                    o.title,
                    o.patent_number,
                    o.jurisdiction,
                    o.patent_expiry_date,
                    (o.patent_expiry_date - CURRENT_DATE)::int AS days_to_expiry,
                    p.kimes_project_id
               FROM kemri_outputs o
          LEFT JOIN kemri_research_projects p ON p.id = o.project_id
              WHERE o.voided = 0
                AND o.output_type = 'ip_patent'
                AND o.patent_expiry_date IS NOT NULL
                AND o.patent_expiry_date <= CURRENT_DATE + INTERVAL '${PATENT_EXPIRY_LOOKAHEAD_DAYS} days'
                AND o.patent_expiry_date >= CURRENT_DATE
                AND o.patent_expiry_alert_at IS NULL`
        );
        for (const row of patentRes.rows) {
            const recipients = await pickRecipientUserIds(client, row.project_id, {
                includePI: true, includeInnovation: true, includeMEL: true,
            });
            let sent = false;
            for (const userId of recipients) {
                const ok = await postNotification(client, {
                    userId,
                    kind: 'patent_expiry',
                    projectId: row.project_id,
                    subject: `Patent expiring in ${row.days_to_expiry} day(s) — ${row.title}`,
                    body: `Patent ${row.patent_number || ''} (${row.jurisdiction || 'jurisdiction n/a'}) expires on ${new Date(row.patent_expiry_date).toISOString().slice(0,10)}. Review renewal or technology-transfer options.`,
                    link: `/kemri/outputs`,
                    dedupeKey: `patent_expiry:${row.output_id}`,
                });
                if (ok) sent = true;
            }
            if (sent) {
                await client.query('SAVEPOINT sp_pat');
                try {
                    await client.query(
                        `UPDATE kemri_outputs SET patent_expiry_alert_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                        [row.output_id]
                    );
                    await client.query('RELEASE SAVEPOINT sp_pat');
                    summary.patentAlertsSent += 1;
                    summary.details.patents.push({ outputId: row.output_id, daysToExpiry: row.days_to_expiry });
                } catch (_) {
                    await client.query('ROLLBACK TO SAVEPOINT sp_pat');
                }
            }
        }

        // -- 6. High-impact publication alerts (IF > 5) ----------------------
        //   Notifies Communications + DG Office. Dedupe via `high_impact_alert_at`.
        const highIfRes = await client.query(
            `SELECT o.id        AS output_id,
                    o.project_id,
                    o.title,
                    o.venue,
                    o.doi,
                    o.impact_factor,
                    p.kimes_project_id
               FROM kemri_outputs o
          LEFT JOIN kemri_research_projects p ON p.id = o.project_id
              WHERE o.voided = 0
                AND o.output_type = 'publication'
                AND o.impact_factor IS NOT NULL
                AND o.impact_factor > $1
                AND o.high_impact_alert_at IS NULL`,
            [HIGH_IMPACT_IF_THRESHOLD]
        );
        for (const row of highIfRes.rows) {
            const recipients = await pickRecipientUserIds(client, row.project_id, {
                includePI: true, includeComms: true, includeDG: true,
            });
            let sent = false;
            for (const userId of recipients) {
                const ok = await postNotification(client, {
                    userId,
                    kind: 'high_impact_pub',
                    projectId: row.project_id,
                    subject: `High-impact publication (IF ${row.impact_factor}) — ${row.title}`,
                    body: `Journal: ${row.venue || '—'}. DOI: ${row.doi || '—'}. Recommended for Communications uplift and DG briefing.`,
                    link: `/kemri/outputs`,
                    dedupeKey: `high_if:${row.output_id}`,
                });
                if (ok) sent = true;
            }
            if (sent) {
                await client.query('SAVEPOINT sp_if');
                try {
                    await client.query(
                        `UPDATE kemri_outputs SET high_impact_alert_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                        [row.output_id]
                    );
                    await client.query('RELEASE SAVEPOINT sp_if');
                    summary.highImpactAlertsSent += 1;
                    summary.details.highImpact.push({ outputId: row.output_id, impactFactor: row.impact_factor });
                } catch (_) {
                    await client.query('ROLLBACK TO SAVEPOINT sp_if');
                }
            }
        }

        if (dryRun) {
            await client.rollback();
        } else {
            await client.query(
                `INSERT INTO kemri_workflow_runs
                     (ran_by, reminders_sent, escalations_opened, escalations_upgraded,
                      seru_alerts_sent, patent_alerts_sent, high_impact_alerts_sent,
                      l5_escalations_opened, details)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
                [
                    ranBy,
                    summary.remindersSent,
                    summary.escalationsOpened,
                    summary.escalationsUpgraded,
                    summary.seruAlertsSent,
                    summary.patentAlertsSent,
                    summary.highImpactAlertsSent,
                    summary.l5EscalationsOpened,
                    JSON.stringify(summary.details),
                ]
            );
            await client.commit();
        }
    } catch (err) {
        try { await client.rollback(); } catch (_) { /* noop */ }
        throw err;
    } finally {
        client.release();
    }

    return summary;
}

// ---------------------------------------------------------------------------
//  Scheduler — fires every six hours when the API is up.
//  (We don't rely on it for correctness; the engine is idempotent and the
//  /workflow/tick admin route can run a tick on demand.)
// ---------------------------------------------------------------------------

let intervalHandle = null;

function startScheduler({ everyMinutes = 360 } = {}) {
    if (intervalHandle) return;
    const tick = async () => {
        try {
            await runDailyTick();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[kemriWorkflowEngine] tick failed:', err.message);
        }
    };
    // Fire once at startup (after a 60s warm-up so DB is up), then on the cadence.
    setTimeout(tick, 60 * 1000);
    intervalHandle = setInterval(tick, everyMinutes * 60 * 1000);
}

function stopScheduler() {
    if (intervalHandle) clearInterval(intervalHandle);
    intervalHandle = null;
}

module.exports = {
    runDailyTick,
    startScheduler,
    stopScheduler,
    renderDgNcf001,
    PI_GRACE_DAYS,
    ESCALATION_LADDER,
    REMINDER_OFFSETS,
    PATENT_EXPIRY_LOOKAHEAD_DAYS,
    HIGH_IMPACT_IF_THRESHOLD,
    L5_CENTRE_PROJECT_THRESHOLD,
    L5_MIN_INDIVIDUAL_LEVEL,
};
