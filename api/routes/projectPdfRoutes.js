const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection pool
const PDFDocument = require('pdfkit'); // Import pdfkit
const fs = require('fs'); // For file operations
const path = require('path'); // For path operations

// --- Helper Functions (copy from a centralized file or projectRoutes.js) ---
const formatToMySQLDateTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        console.warn('Invalid date provided to formatToMySQLDateTime:', date);
        return null;
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatBooleanForMySQL = (value) => {
    if (value === true) return 1;
    if (value === false) return 0;
    return null;
};

// --- New Route for Exporting Project Data as a PDF ---
/**
 * @route GET /api/projects/:projectId/export-pdf
 * @description Fetches all project and KDSP II data and generates a PDF report.
 */
router.get('/:projectId/export-pdf', async (req, res) => {
    const { projectId } = req.params;
    let connection;

    try {
        connection = await pool.getConnection();

        // Fetch all data for the project and its related KDSP II modules
        const [projectData] = await connection.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (projectData.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        const project = projectData[0];

        // Fetch all related KDSP II data
        const [conceptNote] = await connection.query('SELECT * FROM project_concept_notes WHERE projectId = ?', [projectId]);
        const [needsAssessment] = await connection.query('SELECT * FROM project_needs_assessment WHERE projectId = ?', [projectId]);
        const [financials] = await connection.query('SELECT * FROM project_financials WHERE projectId = ?', [projectId]);
        const [fyBreakdown] = await connection.query('SELECT * FROM project_fy_breakdown WHERE projectId = ?', [projectId]);
        const [sustainability] = await connection.query('SELECT * FROM project_sustainability WHERE projectId = ?', [projectId]);
        const [implementationPlan] = await connection.query('SELECT * FROM project_implementation_plan WHERE projectId = ?', [projectId]);
        const [mAndE] = await connection.query('SELECT * FROM project_m_and_e WHERE projectId = ?', [projectId]);
        const [risks] = await connection.query('SELECT * FROM project_risks WHERE projectId = ?', [projectId]);
        const [stakeholders] = await connection.query('SELECT * FROM project_stakeholders WHERE projectId = ?', [projectId]);
        const [readiness] = await connection.query('SELECT * FROM project_readiness WHERE projectId = ?', [projectId]);
        const [hazardAssessment] = await connection.query('SELECT * FROM project_hazard_assessment WHERE projectId = ?', [projectId]);
        const [climateRisk] = await connection.query('SELECT * FROM project_climate_risk WHERE projectId = ?', [projectId]);
        const [esohsgScreening] = await connection.query('SELECT * FROM project_esohsg_screening WHERE projectId = ?', [projectId]);

        // Create a new PDF document
        const doc = new PDFDocument();
        const filename = `Project_Report_${project.projectName.replace(/\s/g, '_')}_${projectId}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        doc.pipe(res); // Pipe the PDF to the response stream
        
        // Helper function to add a title and then content, handling page breaks
        const addSection = (title, contentCallback) => {
          if (doc.y + 50 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
          }
          doc.fontSize(16).text(title, { underline: true });
          doc.moveDown();
          contentCallback();
          doc.moveDown();
        };

        const addMultiLineText = (text, label, indent = 0) => {
            if (text) {
                doc.fontSize(12).text(`${' '.repeat(indent)}- ${label}:`);
                const items = text.split('\n').filter(item => item.trim() !== '');
                items.forEach(item => {
                    doc.fontSize(10).text(`${' '.repeat(indent + 2)}• ${item}`);
                });
            } else {
                doc.fontSize(12).text(`${' '.repeat(indent)}- ${label}: N/A`);
            }
            doc.moveDown(0.2);
        };
        
        // --- PDF Content Generation Logic ---
        doc.fontSize(20).text(`KDSP II Project Report`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(project.projectName, { align: 'center' });
        doc.moveDown();
        
        addSection('Project Overview', () => {
          doc.fontSize(12).text(`Project ID: ${project.id}`);
          doc.fontSize(12).text(`Status: ${project.status}`);
          doc.fontSize(12).text(`Dates: ${project.startDate} to ${project.endDate}`);
          doc.fontSize(12).text(`Principal Investigator: ${project.principalInvestigator}`);
          doc.fontSize(12).text(`Directorate: ${project.directorate}`);
          doc.moveDown();
          addMultiLineText(project.projectDescription, 'Description');
          addMultiLineText(project.objective, 'Objective');
          addMultiLineText(project.expectedOutput, 'Expected Output');
          addMultiLineText(project.expectedOutcome, 'Expected Outcome');
        });
        
        addSection('1. Concept Note', () => {
            if (conceptNote.length > 0) {
                const cn = conceptNote[0];
                addMultiLineText(cn.situationAnalysis, 'Situation Analysis');
                addMultiLineText(cn.problemStatement, 'Problem Statement');
                addMultiLineText(cn.relevanceProjectIdea, 'Relevance of Project Idea');
                addMultiLineText(cn.scopeOfProject, 'Scope of the Project');
                doc.moveDown();
                doc.fontSize(12).text(`- Project Goal: ${cn.projectGoal}`);
                doc.fontSize(12).text(`- Goal Indicator: ${cn.goalIndicator}`);
                doc.fontSize(12).text(`- Goal Means of Verification: ${cn.goalMeansVerification}`);
                doc.fontSize(12).text(`- Goal Assumptions: ${cn.goalAssumptions}`);
            } else {
                doc.fontSize(12).text('No Concept Note data available.');
            }
        });

        addSection('2. Needs Assessment', () => {
            if (needsAssessment.length > 0) {
                const na = needsAssessment[0];
                addMultiLineText(na.targetBeneficiaries, 'Target Beneficiaries');
                doc.fontSize(12).text(`- Estimate End Users: ${na.estimateEndUsers}`);
                doc.fontSize(12).text(`- Proposed Physical Capacity: ${na.proposedPhysicalCapacity}`);
                addMultiLineText(na.mainBenefitsAsset, 'Main Benefits');
                addMultiLineText(na.significantExternalBenefitsNegativeEffects, 'Significant External Effects');
            } else {
                doc.fontSize(12).text('No Needs Assessment data available.');
            }
        });
        
        addSection('3. Financials', () => {
          if (financials.length > 0) {
              const fin = financials[0];
              doc.fontSize(12).text(`Capital Costs:`);
              doc.fontSize(10).text(`- Consultancy: ${fin.capitalCostConsultancy || 'N/A'}`);
              doc.fontSize(10).text(`- Land Acquisition: ${fin.capitalCostLandAcquisition || 'N/A'}`);
              doc.fontSize(10).text(`- Construction: ${fin.capitalCostConstruction || 'N/A'}`);
              doc.moveDown(0.5);
              doc.fontSize(12).text(`Recurrent Costs:`);
              doc.fontSize(10).text(`- Labor: ${fin.recurrentCostLabor || 'N/A'}`);
              doc.fontSize(10).text(`- Maintenance: ${fin.recurrentCostMaintenance || 'N/A'}`);
              doc.moveDown(0.5);
              doc.fontSize(12).text(`- Proposed Source of Financing: ${fin.proposedSourceFinancing || 'N/A'}`);
              doc.fontSize(12).text(`- Land Expropriation Required: ${fin.landExpropriationRequired ? 'Yes' : 'No'}`);
          } else {
              doc.fontSize(12).text('No Financials data available.');
          }
        });
        
        addSection('4. Financial Year Breakdown', () => {
          if (fyBreakdown.length > 0) {
              fyBreakdown.forEach(fy => {
                  doc.fontSize(12).text(`- FY: ${fy.financialYear} | Total Cost: ${fy.totalCost}`);
              });
          } else {
              doc.fontSize(12).text('No Financial Year Breakdown data available.');
          }
        });

        addSection('5. Risks', () => {
          if (risks.length > 0) {
              risks.forEach(risk => {
                  doc.fontSize(12).text(`- Description: ${risk.riskDescription}`);
                  doc.fontSize(10).text(`  - Likelihood: ${risk.likelihood || 'N/A'} | Impact: ${risk.impact || 'N/A'}`);
                  doc.fontSize(10).text(`  - Mitigation: ${risk.mitigationStrategy || 'N/A'}`);
                  doc.moveDown(0.5);
              });
          } else {
              doc.fontSize(12).text('No Risks data available.');
          }
        });

        addSection('6. Stakeholders', () => {
          if (stakeholders.length > 0) {
              stakeholders.forEach(st => {
                  doc.fontSize(12).text(`- Stakeholder: ${st.stakeholderName}`);
                  doc.fontSize(10).text(`  - Influence: ${st.levelInfluence || 'N/A'}`);
                  doc.fontSize(10).text(`  - Engagement Strategy: ${st.engagementStrategy || 'N/A'}`);
                  doc.moveDown(0.5);
              });
          } else {
              doc.fontSize(12).text('No Stakeholders data available.');
          }
        });
        
        addSection('7. Project Readiness', () => {
          if (readiness.length > 0) {
              const rd = readiness[0];
              doc.fontSize(12).text(`- Designs Prepared: ${rd.designsPreparedApproved ? 'Yes' : 'No'}`);
              doc.fontSize(12).text(`- Land Acquired: ${rd.landAcquiredSiteReady ? 'Yes' : 'No'}`);
              doc.fontSize(12).text(`- Regulatory Approvals: ${rd.regulatoryApprovalsObtained ? 'Yes' : 'No'}`);
              addMultiLineText(rd.governmentAgenciesInvolved, 'Government Agencies Involved');
              doc.fontSize(12).text(`- Consultations Undertaken: ${rd.consultationsUndertaken ? 'Yes' : 'No'}`);
              doc.fontSize(12).text(`- Can be Phased: ${rd.canBePhasedScaledDown ? 'Yes' : 'No'}`);
          } else {
              doc.fontSize(12).text('No Project Readiness data available.');
          }
        });
        
        addSection('8. Hazard Assessment', () => {
          if (hazardAssessment.length > 0) {
              hazardAssessment.forEach(ha => {
                  doc.fontSize(12).text(`- Hazard: ${ha.hazardName}`);
                  doc.fontSize(10).text(`  - Answer: ${ha.answerYesNo ? 'Yes' : 'No'}`);
                  doc.fontSize(10).text(`  - Remarks: ${ha.remarks || 'N/A'}`);
                  doc.moveDown(0.5);
              });
          } else {
              doc.fontSize(12).text('No Hazard Assessment data available.');
          }
        });
        
        addSection('9. Climate and Disaster Risk', () => {
          if (climateRisk.length > 0) {
              climateRisk.forEach(cr => {
                  doc.fontSize(12).text(`- Hazard: ${cr.hazardName}`);
                  doc.fontSize(10).text(`  - Exposure: ${cr.hazardExposure || 'N/A'}`);
                  doc.fontSize(10).text(`  - Vulnerability: ${cr.vulnerability || 'N/A'}`);
                  doc.fontSize(10).text(`  - Risk Level: ${cr.riskLevel || 'N/A'}`);
                  doc.fontSize(10).text(`  - Strategies: ${cr.riskReductionStrategies || 'N/A'}`);
                  doc.fontSize(10).text(`  - Costs: ${cr.riskReductionCosts || 'N/A'}`);
                  doc.fontSize(10).text(`  - Resources: ${cr.resourcesRequired || 'N/A'}`);
                  doc.moveDown(0.5);
              });
          } else {
              doc.fontSize(12).text('No Climate Risk data available.');
          }
        });
        
        addSection('10. ESOHSG Screening', () => {
          if (esohsgScreening.length > 0) {
              const es = esohsgScreening[0];
              doc.fontSize(12).text(`- EMCA Triggers: ${es.emcaTriggers ? 'Yes' : 'No'}`);
              doc.fontSize(10).text(`  - Description: ${es.emcaDescription || 'N/A'}`);
              doc.moveDown(0.5);
              doc.fontSize(12).text(`- World Bank Safeguards Applicable: ${es.worldBankSafeguardApplicable ? 'Yes' : 'No'}`);
              doc.fontSize(10).text(`  - World Bank Standards: ${es.worldBankStandards || 'N/A'}`);
              doc.moveDown(0.5);
              doc.fontSize(12).text(`- GoK Policies Applicable: ${es.goKPoliciesApplicable ? 'Yes' : 'No'}`);
              doc.fontSize(10).text(`  - GoK Policies/Laws: ${es.goKPoliciesLaws || 'N/A'}`);
              doc.moveDown(0.5);
              doc.fontSize(12).text(`- Screening Result: ${es.screeningResultOutcome || 'N/A'}`);
              doc.fontSize(12).text(`- Special Conditions: ${es.specialConditions || 'N/A'}`);
          } else {
              doc.fontSize(12).text('No ESOHSG Screening data available.');
          }
        });

        doc.end();

    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({ message: 'Failed to generate PDF report.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;