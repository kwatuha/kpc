/**
 * KEMRI / KIMES API service.
 *
 * Thin wrapper around `/api/kemri/*` endpoints exposed by the backend
 * (see api/routes/kemriRoutes.js). All methods return the response body
 * directly; callers handle errors via try/catch.
 */
import axiosInstance from './axiosInstance';

const get = (url, params) => axiosInstance.get(url, { params }).then((r) => r.data);
const post = (url, body) => axiosInstance.post(url, body).then((r) => r.data);
const put = (url, body) => axiosInstance.put(url, body).then((r) => r.data);
const del = (url) => axiosInstance.delete(url).then((r) => r.data);

const kemriService = {
  // Reference data
  listCentres: () => get('/kemri/centres'),
  listProgrammes: () => get('/kemri/programmes'),
  listDonors: () => get('/kemri/donors'),

  // Research projects (studies)
  listProjects: (filters = {}) => get('/kemri/projects', filters),
  getProject: (id) => get(`/kemri/projects/${id}`),
  createProject: (payload) => post('/kemri/projects', payload),
  updateProject: (id, payload) => put(`/kemri/projects/${id}`, payload),
  archiveProject: (id) => del(`/kemri/projects/${id}`),

  // KPIs
  listKpis: (projectId) => get(`/kemri/projects/${projectId}/kpis`),
  createKpi: (projectId, payload) => post(`/kemri/projects/${projectId}/kpis`, payload),
  removeKpi: (kpiId) => del(`/kemri/kpis/${kpiId}`),

  // Quarterly milestone reports
  listReports: (filters = {}) => get('/kemri/reports', filters),
  getReport: (id) => get(`/kemri/reports/${id}`),
  saveReport: (payload) => post('/kemri/reports', payload),
  runDqa: (reportId) => post(`/kemri/reports/${reportId}/dqa`, {}),
  reviewReport: (reportId, payload) => post(`/kemri/reports/${reportId}/review`, payload),

  // Outputs
  listOutputs: (filters = {}) => get('/kemri/outputs', filters),
  createOutput: (payload) => post('/kemri/outputs', payload),
  removeOutput: (id) => del(`/kemri/outputs/${id}`),

  // Escalations
  listEscalations: (filters = {}) => get('/kemri/escalations', filters),
  getEscalationsSummary: () => get('/kemri/escalations/summary'),
  resolveEscalation: (id, payload) => post(`/kemri/escalations/${id}/resolve`, payload),
  getDgNcfLetter: (id) => get(`/kemri/escalations/${id}/letter`),
  regenerateDgNcfLetter: (id) => post(`/kemri/escalations/${id}/letter`, {}),
  // DG-NCF-001 gate ladder (v5 §7.3.1): IRB → DG → Legal → Send.
  recordIrbDecision: (id, body) => post(`/kemri/escalations/${id}/irb`, body),
  recordDgApproval: (id, body) => post(`/kemri/escalations/${id}/dg-approve`, body),
  recordLegalClearance: (id, body) => post(`/kemri/escalations/${id}/legal-clear`, body),
  markDonorLetterSent: (id, body) => post(`/kemri/escalations/${id}/send-to-donor`, body),

  // Notifications inbox (D-N reminders, escalation notices, SERU alerts).
  listNotifications: (params = {}) => get('/kemri/notifications', params),
  markNotificationRead: (id) => post(`/kemri/notifications/${id}/read`, {}),
  markAllNotificationsRead: () => post('/kemri/notifications/read-all', {}),

  // Workflow engine — manual tick + last-run log
  runWorkflowTick: (dryRun = false) => post(`/kemri/workflow/tick${dryRun ? '?dryRun=true' : ''}`, {}),
  listWorkflowRuns: () => get('/kemri/workflow/runs'),

  // Filled "KEMRI Research Implementation & Grant Monitoring Form" (kemri_tools.pdf v05).
  // The JSON powers KemriStudyFormExportPage (printable / Save-as-PDF in browser);
  // the DOCX URL is downloadable directly via window.open.
  getFormExport: (projectId) => get(`/kemri/projects/${projectId}/form-export`),
  formExportDocxUrl: (projectId) => `/api/kemri/projects/${projectId}/form-export.docx`,

  // Dashboards
  getPiDashboard: (piUserId) => get('/kemri/dashboard/pi', piUserId ? { piUserId } : undefined),
  getCentreDirectorDashboard: (centreId) =>
    get('/kemri/dashboard/centre-director', centreId ? { centreId } : undefined),

  // GIS — per-county aggregates + flat site list with lat/lng
  getGisSummary: () => get('/kemri/gis/summary'),

  // Cross-cutting executive / operations / finance dashboards
  getDashboardSummary: () => get('/kemri/dashboard/summary'),

  // KIMES v5 signature visualisations & reference data.
  getStrategicPlanProgress:    () => get('/kemri/strategic-plan/progress'),
  getProcurementPipeline:      () => get('/kemri/procurement/pipeline'),
  getHrStaffingCompliance:     () => get('/kemri/hr/staffing-compliance'),
  getAiReportsCatalog:         () => get('/kemri/ai-reports/catalog'),
  getConcurrentReportingCalendar: () => get('/kemri/concurrent-reporting/calendar'),
  getReviewAuthority:          () => get('/kemri/governance/review-authority'),
  getProjectOutputTimeline:    (projectId) => get(`/kemri/projects/${projectId}/output-timeline`),

  // -------------------------------------------------------------------------
  // Strategic Plan (KEMRI 2023-2027) — KRAs, objectives, achievements
  // -------------------------------------------------------------------------
  getActiveStrategicPlan:          () => get('/kemri/strategic-plan/active'),
  listStrategicObjectives:         () => get('/kemri/strategic-plan/objectives'),
  getStrategicObjective:           (id) => get(`/kemri/strategic-plan/objectives/${id}`),
  listStrategicAchievements:       (params) => get('/kemri/strategic-plan/achievements', params),
  createStrategicAchievement:      (body) => post('/kemri/strategic-plan/achievements', body),
  removeStrategicAchievement:      (id) => del(`/kemri/strategic-plan/achievements/${id}`),
  linkProjectToObjective:          (body) => post('/kemri/strategic-plan/links', body),
  unlinkProjectFromObjective:      (projectId, objectiveId) =>
    del(`/kemri/strategic-plan/links?projectId=${projectId}&objectiveId=${objectiveId}`),

  // -------------------------------------------------------------------------
  // KEMRI Form v05 — sections 5 through 11.
  // Each section is a project sub-resource with the same {list, create,
  // update, remove} surface, surfaced from the backend by
  // registerSectionEndpoints.
  // -------------------------------------------------------------------------
  sections: {
    staff: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/staff`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/staff`, body),
      update: (id, body) => put(`/kemri/staff/${id}`, body),
      remove: (id) => del(`/kemri/staff/${id}`),
    },
    capacityBuilding: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/capacity-building`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/capacity-building`, body),
      update: (id, body) => put(`/kemri/capacity-building/${id}`, body),
      remove: (id) => del(`/kemri/capacity-building/${id}`),
    },
    equipment: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/equipment`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/equipment`, body),
      update: (id, body) => put(`/kemri/equipment/${id}`, body),
      remove: (id) => del(`/kemri/equipment/${id}`),
    },
    budgetLines: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/budget-lines`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/budget-lines`, body),
      update: (id, body) => put(`/kemri/budget-lines/${id}`, body),
      remove: (id) => del(`/kemri/budget-lines/${id}`),
    },
    labAnalyses: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/lab-analyses`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/lab-analyses`, body),
      update: (id, body) => put(`/kemri/lab-analyses/${id}`, body),
      remove: (id) => del(`/kemri/lab-analyses/${id}`),
    },
    feedback: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/feedback`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/feedback`, body),
      update: (id, body) => put(`/kemri/feedback/${id}`, body),
      remove: (id) => del(`/kemri/feedback/${id}`),
    },
    swot: {
      list:   (projectId) => get(`/kemri/projects/${projectId}/swot`),
      create: (projectId, body) => post(`/kemri/projects/${projectId}/swot`, body),
      update: (id, body) => put(`/kemri/swot/${id}`, body),
      remove: (id) => del(`/kemri/swot/${id}`),
    },
  },
};

export default kemriService;
