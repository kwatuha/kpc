import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Science as ScienceIcon,
  AccountTree as WorkflowIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  AssignmentTurnedIn as AssignmentIcon,
  RuleFolder as ReviewIcon,
  AutoAwesome as OutputsIcon,
  Verified as DqaIcon,
  Traffic as RagIcon,
  Warning as EscalationIcon,
  HelpOutline as HelpIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  OpenInNew as OpenInNewIcon,
  ArrowForward as ArrowForwardIcon,
  Map as MapIcon,
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  FactCheck as FactCheckIcon,
  AddCircleOutline as AddIcon,
  FolderOpen as FolderOpenIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { ROUTES } from '../configs/appConfig';

/* -------------------------------------------------------------------------- */
/*  Routes (single source of truth – matches src/configs/appConfig.js)        */
/* -------------------------------------------------------------------------- */

const R = ROUTES;

/* -------------------------------------------------------------------------- */
/*  Step content                                                              */
/* -------------------------------------------------------------------------- */

const WORKFLOW_STEPS = [
  { n: 1,  title: 'Study registration',         desc: 'Capture KEMRI Form §1–4: grant info, SERU/NACOSTI compliance, sites, co-investigators, strategic alignment.', to: R.KEMRI_STUDY_NEW,    cta: 'New Study' },
  { n: 2,  title: 'KPI & milestone plan',       desc: 'PI defines SMART KPIs and a quarterly milestone plan. Centre Director approves.',                              to: R.KEMRI_STUDIES,       cta: 'Open a study' },
  { n: 3,  title: 'Quarterly milestone report', desc: 'PI files Form §5–11: staff, equipment, financials, lab analyses, feedback, lessons.',                          to: R.KEMRI_PI_DASHBOARD,  cta: 'My Studies' },
  { n: 4,  title: 'Automated DQA',              desc: '8 validation checks run automatically. Reports below 85% completeness are auto-returned.' },
  { n: 5,  title: 'Centre Director peer review',desc: 'Director accepts (assigning Green/Amber/Red), queries the PI, or escalates non-conformity.',                  to: R.KEMRI_REVIEW_QUEUE,  cta: 'Review Queue' },
  { n: 6,  title: 'Non-conformity escalation',  desc: 'Day-based ladder: D+1 L1 caution → D+14 L2 formal notice → D+21 L3 Centre Director intervention → D+30 L4 DG letter (DG-NCF-001).', to: R.KEMRI_ESCALATIONS, cta: 'Escalations Inbox' },
  { n: 7,  title: 'AI narrative report',        desc: 'KIMES drafts the donor-facing narrative; PI reviews and edits before submission.' },
  { n: 8,  title: 'Concurrent reporting',       desc: 'Same source data feeds donors, KEMRI management and the Board with audience-specific framing.',               to: '/report-library',     cta: 'Report library' },
  { n: 9,  title: 'GIS dashboards',             desc: 'Site-level activity is visualised on the KEMRI national portfolio map.',                                       to: R.GIS_DASHBOARD,       cta: 'National GIS Map' },
  { n: 10, title: 'Study closure',              desc: 'Final report triggers post-study output capture for the next 7 years.',                                        to: R.KEMRI_STUDIES,       cta: 'Studies registry' },
  { n: 11, title: 'Publications & abstracts',   desc: 'PI logs every publication and conference output; KIMES auto-fetches Crossref/PubMed metadata.',                to: R.KEMRI_OUTPUT_REGISTRY, cta: 'Outputs Registry' },
  { n: 12, title: 'Datasets (FAIR)',            desc: 'Registered datasets are scored for FAIRness and linked to access policies.',                                   to: R.KEMRI_OUTPUT_REGISTRY, cta: 'Outputs Registry' },
  { n: 13, title: 'Policy briefs & uptake',     desc: 'Policy outputs and a 0–10 uptake score per audience.',                                                          to: R.KEMRI_OUTPUT_REGISTRY, cta: 'Outputs Registry' },
  { n: 14, title: 'IP & patents',               desc: 'Filed/granted/licensed IP with a 1–10 commercialisation stage and revenue tracking.',                          to: R.KEMRI_OUTPUT_REGISTRY, cta: 'Outputs Registry' },
  { n: 15, title: 'Long-term impact view',      desc: 'Citation, FAIR, and uptake trends roll up to the DG and Board dashboards.',                                    to: '/summary-statistics', cta: 'Executive Dashboard' },
];

const ROLES = [
  {
    role: 'Principal Investigator (PI)',
    icon: PersonIcon,
    color: '#1976d2',
    duties: [
      { text: 'Register a research study (KIMES generates the KEMRI Project ID).',                    to: R.KEMRI_STUDY_NEW,       cta: 'Register' },
      { text: 'Define KPIs and milestone plan; submit for Centre Director approval.',                 to: R.KEMRI_STUDIES,         cta: 'My studies' },
      { text: 'File quarterly milestone reports; respond to DQA queries within 48 hours.',            to: R.KEMRI_PI_DASHBOARD,    cta: 'PI dashboard' },
      { text: 'Capture publications, abstracts, datasets, IP and policy outputs after study closure.',to: R.KEMRI_OUTPUT_REGISTRY, cta: 'Outputs Registry' },
    ],
  },
  {
    role: 'Centre Director',
    icon: ReviewIcon,
    color: '#6a1b9a',
    duties: [
      { text: 'Approve KPIs / milestone plans within 5 working days of submission.',                  to: R.KEMRI_STUDIES,         cta: 'Studies' },
      { text: 'Peer-review DQA-validated quarterly reports and assign Green / Amber / Red.',          to: R.KEMRI_REVIEW_QUEUE,    cta: 'Review queue' },
      { text: 'Query the PI for clarification, or escalate clear non-conformity (pick L1\u2013L5 manually).', to: R.KEMRI_REVIEW_QUEUE,   cta: 'Review queue' },
      { text: 'Triage open L1\u2013L4 escalations, resolve with audit notes, preview DG-NCF-001 letter for L4.', to: R.KEMRI_ESCALATIONS,    cta: 'Escalations Inbox' },
      { text: 'Monitor centre portfolio: open escalations, RAG distribution, slow reporters.',        to: '/summary-statistics',   cta: 'Executive Dashboard' },
    ],
  },
  {
    role: 'MEL Officer',
    icon: AssignmentIcon,
    color: '#2e7d32',
    duties: [
      { text: 'Triage DQA failures and chase missing data from PIs.',                                 to: R.KEMRI_REVIEW_QUEUE,    cta: 'Review queue' },
      { text: 'Maintain reference data: centres, programmes, donors, role codes.',                    to: '/metadata-management',  cta: 'Metadata' },
      { text: 'Run periodic data audits and trigger re-validation when anomalies appear.',            to: '/audit-trail',          cta: 'Audit trail' },
      { text: 'Author and disseminate quarterly KEMRI MEL bulletins.',                                to: '/report-library',       cta: 'Report library' },
    ],
  },
  {
    role: 'Director General (DG) & Board',
    icon: GroupsIcon,
    color: '#c62828',
    duties: [
      { text: 'Review Level-3 and Level-4 escalations; sanction corrective action; sign off DG-NCF-001 donor letters.', to: R.KEMRI_ESCALATIONS,    cta: 'Escalations Inbox' },
      { text: 'Track institutional KPIs, donor concurrent reports, and post-study impact.',           to: '/summary-statistics',   cta: 'Executive Dashboard' },
      { text: 'Approve donor reports before submission to BMGF / Wellcome / NIH / EDCTP / etc.',      to: '/report-library',       cta: 'Report library' },
    ],
  },
];

const DQA_CHECKS = [
  { name: 'Required field completeness', detail: 'Every required field has a non-empty value (≥ 85% threshold).' },
  { name: 'Numeric range plausibility',  detail: 'Budgets, expenditures and KPI actuals are non-negative and within sane ranges.' },
  { name: 'GPS coordinate validation',   detail: 'Site latitude in [-90, 90] and longitude in [-180, 180].' },
  { name: 'Financial arithmetic',        detail: 'Balance = budget − expenditure, with a 1-currency-unit tolerance.' },
  { name: 'Date logic',                  detail: 'Reporting period ends on/after the proposed study start date.' },
  { name: 'Cross-field consistency',     detail: 'KPI achievement % matches actual / target × 100; expenditure ≤ budget.' },
  { name: 'SERU expiry',                 detail: 'Auto-flag if SERU approval expires within the next 60 days; auto-fail if expired.' },
  { name: 'Duplicate submission',        detail: 'Reject when a Q-period report already exists for the same project.' },
];

const RAG_LEGEND = [
  { rag: 'Green',  color: '#2e7d32', meaning: 'On-track. KPI achievement ≥ 80%, no DQA flags, financials within ±10% variance.' },
  { rag: 'Amber',  color: '#ed6c02', meaning: 'Minor variance. KPI 60–79%, or 1–3 DQA warnings, or budget variance ±10–25%.' },
  { rag: 'Red',    color: '#c62828', meaning: 'Significant deviation. KPI < 60%, multiple DQA failures, or budget variance > 25%.' },
];

const ESCALATIONS = [
  { level: 1, name: 'L1 Minor',                trigger: 'D+1 \u2014 milestone report 1 day past PI submission deadline; isolated DQA flag; minor budget variance (<10%).', responder: 'PI (auto reminder); M&E Officer monitoring',                            sla: 'Resolve by D+14' },
  { level: 2, name: 'L2 Moderate',             trigger: 'D+14 \u2014 still unsubmitted; or 2+ consecutive late quarters; DQA persistently <80%; budget variance 10\u201325%.',  responder: 'MEL Division Head formal written notice; CC Centre Director',           sla: 'PI must respond by D+21' },
  { level: 3, name: 'L3 Significant',          trigger: 'D+21 \u2014 still unsubmitted; or 3+ consecutive late quarters; budget variance >25%; SERU lapsed; staffing gap >30d.', responder: 'Centre Director intervention; DG Office notified; Board flagged',     sla: 'Remediation meeting by D+23' },
  { level: 4, name: 'L4 Severe / Donor',       trigger: 'D+30 \u2014 still unsubmitted; or 4+ consecutive late quarters; financial mismanagement; material grant risk.',       responder: 'DG Formal Letter (DG-NCF-001); IRB convenes; Legal Counsel clearance required', sla: 'Donor notification only after IRB \u2192 DG \u2192 Legal gates clear' },
  { level: 5, name: 'L5 Institutional',        trigger: 'Centre-wide pattern: 3+ projects in same centre at L3+ simultaneously; or systemic DQA failure; institutional financial breakdown.', responder: 'Board directive; DG action plan; portfolio-level donor engagement', sla: 'Board resolution required' },
];

// KIMES v5 \u00a72.1 Review Authority Matrix \u2014 used to surface the
// peer-led review principle on the Help & Support page.
const REVIEW_AUTHORITY = [
  { stage: 'Project registration & logframe',         responsible: 'Centre Director / Scientific Committee',     melRole: 'Facilitate form; assign Project ID' },
  { stage: 'KPI & milestone plan validation',         responsible: 'Centre Director + MEL Division Head',         melRole: 'Ensure indicators are SMART; no veto on scientific design' },
  { stage: 'Quarterly milestone data entry',           responsible: 'Principal Investigator (solely)',             melRole: 'Pre-fill known fields; send reminders' },
  { stage: 'Automated DQA',                            responsible: 'KIMES System (automated)',                     melRole: 'Monitor scores; follow up on flags \u2014 no scientific judgement' },
  { stage: 'Scientific peer review & RAG',             responsible: 'Centre Director / Senior Scientist (\u2265 PI rank)', melRole: 'Prepare data package; no independent review' },
  { stage: 'Escalation for non-reporting',             responsible: 'MEL Head \u2192 Centre Director \u2192 DG \u2192 Board', melRole: 'Initiate escalation log; route notices' },
  { stage: 'Donor concurrent report routing',          responsible: 'Grants Management Office + MEL Division',      melRole: 'Donor Portal + report calendar' },
  { stage: 'Donor non-conformity notification',        responsible: 'Director General (exclusively)',               melRole: 'Compile audit trail; draft from template' },
];

const SECTION_GUIDE = [
  { sec: '§1 Grant information',     what: 'Project type, account number, title, PI, donor, funding amount, mechanism, contract numbers.', where: 'Register a study → Section 1', to: R.KEMRI_STUDY_NEW, cta: 'Open form §1' },
  { sec: '§2 Compliance',            what: 'SERU and NACOSTI approval numbers + dates; proposed start/end.',                              where: 'Register a study → Section 2', to: R.KEMRI_STUDY_NEW, cta: 'Open form §2' },
  { sec: '§3 Implementation',        what: 'Primary org, sites with GPS, co-investigators, up to 5 study objectives.',                    where: 'Register a study → Section 3', to: R.KEMRI_STUDY_NEW, cta: 'Open form §3' },
  { sec: '§4 Strategic alignment',   what: 'SDGs, KEMRI Strategic Plan KRAs, programme area, research priority.',                         where: 'Register a study → Section 4', to: R.KEMRI_STUDY_NEW, cta: 'Open form §4' },
  { sec: '§5 Human resource',        what: 'Per-staff entries (role code, FTE, funded by) and training/capacity-building events.',       where: 'Study page → §5 accordion',     to: R.KEMRI_STUDIES,   cta: 'Pick a study' },
  { sec: '§6 Equipment',             what: 'Asset register: serial numbers, custodian, warranty, status.',                                 where: 'Study page → §6 accordion',     to: R.KEMRI_STUDIES,   cta: 'Pick a study' },
  { sec: '§7 Financial utilisation', what: 'Per-category budget vs expenditure (personnel, equipment, consumables, travel, …).',          where: 'Study page → §7 accordion',     to: R.KEMRI_STUDIES,   cta: 'Pick a study' },
  { sec: '§8 Outputs',               what: 'Publications, abstracts, datasets, policy briefs, IP/patents.',                                where: 'Research sidebar → Outputs Registry', to: R.KEMRI_OUTPUT_REGISTRY, cta: 'Open registry' },
  { sec: '§9 Laboratory analyses',   what: 'Per-assay register: planned vs completed, QC pass rate, unit cost.',                          where: 'Study page → §9 accordion',     to: R.KEMRI_STUDIES,   cta: 'Pick a study' },
  { sec: '§10 Operations feedback',  what: 'Partner / community / donor / regulator / internal feedback and your response.',              where: 'Study page → §10 accordion',    to: R.KEMRI_STUDIES,   cta: 'Pick a study' },
  { sec: '§11 SWOT & lessons',       what: 'Strengths, weaknesses, opportunities, threats and lessons learned.',                          where: 'Study page → §11 accordion',    to: R.KEMRI_STUDIES,   cta: 'Pick a study' },
  { sec: 'Form export (v05)',        what: 'Print-ready / .docx / .json copy of the KEMRI Research Implementation & Grant Monitoring Form, pre-filled from KIMES.', where: 'Studies registry → form-icon column, or Edit study → "Export filled form".', to: R.KEMRI_STUDIES, cta: 'Open studies' },
];

const QUICK_LINKS = [
  { title: 'KIMES Home',           to: R.KEMRI_HOME,            icon: DashboardIcon,   color: '#0f172a' },
  { title: 'All Studies',          to: R.KEMRI_STUDIES,         icon: FolderOpenIcon,  color: '#1976d2' },
  { title: 'New Study',            to: R.KEMRI_STUDY_NEW,       icon: AddIcon,         color: '#16A34A' },
  { title: 'PI Dashboard',         to: R.KEMRI_PI_DASHBOARD,    icon: AssessmentIcon,  color: '#0891B2' },
  { title: 'Review Queue',         to: R.KEMRI_REVIEW_QUEUE,    icon: FactCheckIcon,   color: '#6a1b9a' },
  { title: 'Outputs Registry',     to: R.KEMRI_OUTPUT_REGISTRY, icon: MenuBookIcon,    color: '#ef6c00' },
  { title: 'National GIS Map',     to: R.GIS_DASHBOARD,         icon: MapIcon,         color: '#1E3A8A' },
  { title: 'Executive Dashboard',  to: '/summary-statistics',   icon: AssessmentIcon,  color: '#475569' },
];

/* -------------------------------------------------------------------------- */
/*  Reusable bits                                                             */
/* -------------------------------------------------------------------------- */

/** Inline navigation pill — always uses react-router so the SPA does not full-reload. */
function OpenLink({ to, label = 'Open', size = 'small', color = 'primary', sx, ...rest }) {
  if (!to) return null;
  return (
    <Tooltip title={`Go to ${label}`}>
      <Button
        component={RouterLink}
        to={to}
        size={size}
        variant="outlined"
        color={color}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 5,
          px: 1.25,
          py: 0.25,
          minHeight: 0,
          lineHeight: 1.4,
          ...sx,
        }}
        {...rest}
      >
        {label}
      </Button>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

function HeroBanner() {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #003e6b 0%, #005a9c 50%, #1976d2 100%)',
        color: 'white',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <HelpIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
              KIMES — User Documentation
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>
              Help &amp; Support
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.92, maxWidth: 880 }}>
              Step-by-step guidance for every KIMES role, the 15-step research lifecycle,
              KEMRI Form v05 coverage, automated Data Quality Assessment, RAG status,
              and the 4-level non-conformity escalation protocol. Click any{' '}
              <Box component="span" sx={{
                bgcolor: 'rgba(255,255,255,0.2)', px: 0.75, py: 0.15, borderRadius: 1, fontWeight: 600,
              }}>
                Open
              </Box>{' '}
              link below to jump straight to the feature.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuickNavigation() {
  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <OpenInNewIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Quick navigation
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Jump to the most common KIMES screens
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }} useFlexGap>
          {QUICK_LINKS.map((q) => (
            <Chip
              key={q.title}
              component={RouterLink}
              to={q.to}
              clickable
              icon={<q.icon sx={{ color: `${q.color} !important` }} />}
              label={q.title}
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderColor: `${q.color}55`,
                color: q.color,
                '& .MuiChip-icon': { color: q.color },
                '&:hover': { bgcolor: `${q.color}11`, borderColor: q.color },
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionCard({ icon: Icon, title, color = 'primary.main', children, dense }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: dense ? 0.75 : 1.5 }}>
          {Icon ? (
            <Box sx={{
              width: 36, height: 36, borderRadius: 1.5,
              bgcolor: typeof color === 'string' ? `${color}1A` : 'primary.light',
              color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon />
            </Box>
          ) : null}
          <Typography variant="h6" sx={{ fontWeight: 700, color }}>{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function StepRow({ n, title, desc, to, cta }) {
  return (
    <ListItem alignItems="flex-start" sx={{ px: 0, py: 0.75 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Chip label={n} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 28 }} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
            {to ? <OpenLink to={to} label={cta || 'Open'} /> : null}
          </Stack>
        }
        secondary={<Typography variant="body2" color="text.secondary">{desc}</Typography>}
      />
    </ListItem>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HelpSupportPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <HeroBanner />
      <QuickNavigation />

      {/* What is KIMES */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard icon={ScienceIcon} title="What is KIMES?" color="#005a9c">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              KIMES is the Kenya Medical Research Institute&apos;s Integrated Monitoring &amp;
              Evaluation System — a single, verified record for every research study from grant
              award through seven years of post-study output tracking.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              It replaces fragmented paper trackers and Excel spreadsheets with a 15-step lifecycle,
              automated Data Quality Assessment, peer-led centre reviews, and concurrent reporting
              to donors, KEMRI management, and the Board.
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }} useFlexGap>
              <OpenLink to={R.KEMRI_HOME}            label="KIMES Home" />
              <OpenLink to={R.KEMRI_STUDIES}         label="All Studies" />
              <OpenLink to={R.GIS_DASHBOARD}         label="National GIS Map" color="info" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard icon={WorkflowIcon} title="Audience" color="#2e7d32">
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Principal Investigators</strong> register and report on studies (
                <MuiLink component={RouterLink} to={R.KEMRI_STUDY_NEW}>register</MuiLink> ·{' '}
                <MuiLink component={RouterLink} to={R.KEMRI_PI_DASHBOARD}>my dashboard</MuiLink>).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Centre Directors</strong> peer-review reports and assign RAG status (
                <MuiLink component={RouterLink} to={R.KEMRI_REVIEW_QUEUE}>review queue</MuiLink>).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>MEL Officers</strong> maintain reference data and triage data quality (
                <MuiLink component={RouterLink} to="/metadata-management">metadata</MuiLink> ·{' '}
                <MuiLink component={RouterLink} to="/audit-trail">audit trail</MuiLink>).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>DG &amp; Board</strong> oversee escalations, donor reporting, and impact (
                <MuiLink component={RouterLink} to="/summary-statistics">system dashboard</MuiLink>).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Donors</strong> receive concurrent, audience-specific narrative reports (
                <MuiLink component={RouterLink} to="/report-library">report library</MuiLink>).
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* 15-step workflow */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
            <WorkflowIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>15-step research lifecycle</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Steps 1–9 cover the active study; Steps 10–15 cover post-study output capture for up to
            seven years. Each step links to the screen where you complete it.
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                Active study (Steps 1–9)
              </Typography>
              <List dense disablePadding>
                {WORKFLOW_STEPS.slice(0, 9).map((s) => (
                  <StepRow key={s.n} {...s} />
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: 'warning.main', fontWeight: 700, letterSpacing: 1 }}>
                Post-study impact (Steps 10–15)
              </Typography>
              <List dense disablePadding>
                {WORKFLOW_STEPS.slice(9).map((s) => (
                  <StepRow key={s.n} {...s} />
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Role-by-role guides */}
      <Typography variant="h5" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>Role-by-role guides</Typography>
      <Grid container spacing={2}>
        {ROLES.map((r) => (
          <Grid key={r.role} item xs={12} md={6}>
            <SectionCard icon={r.icon} title={r.role} color={r.color}>
              <List dense disablePadding>
                {r.duties.map((d) => (
                  <ListItem key={d.text} alignItems="flex-start" sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckIcon sx={{ fontSize: 18, color: r.color }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="body2">{d.text}</Typography>
                          {d.to ? (
                            <OpenLink
                              to={d.to}
                              label={d.cta || 'Open'}
                              sx={{
                                color: r.color,
                                borderColor: `${r.color}55`,
                                '&:hover': { bgcolor: `${r.color}11`, borderColor: r.color },
                              }}
                            />
                          ) : null}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        ))}
      </Grid>

      {/* Step-by-step tasks */}
      <Typography variant="h5" sx={{ fontWeight: 800, mt: 4, mb: 1.5 }}>Step-by-step tasks</Typography>
      <Stack spacing={1.25}>
        <Accordion disableGutters defaultExpanded sx={{ borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <ScienceIcon color="primary" />
              <Typography sx={{ fontWeight: 700 }}>
                Register a research study (covers KEMRI Form §1–4)
              </Typography>
              <Box sx={{ flex: 1 }} />
              <OpenLink to={R.KEMRI_STUDY_NEW} label="Open form" onClick={(e) => e.stopPropagation()} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="1" color="primary" /></ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Open New Study</Typography>
                      <OpenLink to={R.KEMRI_STUDY_NEW} label="New Study" />
                    </Stack>
                  }
                  secondary="From the Research sidebar choose New Study, or click the green button on the All Studies page."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="2" color="primary" /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Section 1 — Grant information</Typography>}
                  secondary="Title, project type, KEMRI Centre, programme, primary donor, funding amount and currency, contract / grant / KEMRI legal numbers."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="3" color="primary" /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Section 2 — Compliance</Typography>}
                  secondary="SERU approval number + date + expiry, NACOSTI approval, proposed start and end dates."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="4" color="primary" /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Section 3 — Implementation</Typography>}
                  secondary="Primary implementing organisation, country, GPS-located sites, co-investigators (qualification + role), up to 5 study objectives."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="5" color="primary" /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Section 4 — Strategic alignment</Typography>}
                  secondary="Pick all relevant SDGs and KEMRI Strategic Plan KRAs, programme area, and research priority / disease area."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="6" color="primary" /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Save</Typography>}
                  secondary="KIMES generates a unique Project ID like KEMRI-CGHR-2026-001 and unlocks Sections §5–§11 on the same page."
                />
              </ListItem>
            </List>
            <Alert severity="info" sx={{ mt: 1.5 }}>
              Sections §5 (HR &amp; capacity building), §6 (equipment), §7 (budget lines), §9 (lab
              analyses), §10 (feedback), and §11 (SWOT/lessons) all live as collapsible accordions
              at the bottom of the study page once you save. Pick a study from the{' '}
              <MuiLink component={RouterLink} to={R.KEMRI_STUDIES}>Studies registry</MuiLink> to see them.
            </Alert>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={{ borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <AssignmentIcon sx={{ color: '#2e7d32' }} />
              <Typography sx={{ fontWeight: 700 }}>Submit a quarterly milestone report</Typography>
              <Box sx={{ flex: 1 }} />
              <OpenLink
                to={R.KEMRI_PI_DASHBOARD}
                label="PI Dashboard"
                color="success"
                onClick={(e) => e.stopPropagation()}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="1" sx={{ bgcolor: '#2e7d3220', color: '#2e7d32', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Open the study</Typography>
                      <OpenLink to={R.KEMRI_PI_DASHBOARD} label="My Studies" color="success" />
                    </Stack>
                  }
                  secondary="From PI Dashboard → My Studies, click the study to open."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="2" sx={{ bgcolor: '#2e7d3220', color: '#2e7d32', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Fill the financial snapshot</Typography>}
                  secondary="Budget total, funds received, expenditure to date — KIMES computes balance and variance."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="3" sx={{ bgcolor: '#2e7d3220', color: '#2e7d32', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Record KPI achievements</Typography>}
                  secondary="For each KPI, enter target and actual values for the period; KIMES auto-computes achievement percentage."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="4" sx={{ bgcolor: '#2e7d3220', color: '#2e7d32', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Add narratives</Typography>}
                  secondary="Staff status, lab analyses summary, equipment acquired, capacity building, emerging risks."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="5" sx={{ bgcolor: '#2e7d3220', color: '#2e7d32', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Submit</Typography>}
                  secondary="DQA runs immediately. If it returns < 85% completeness the report is auto-returned with field-level guidance. Otherwise it lands in your Centre Director's review queue."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={{ borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <ReviewIcon sx={{ color: '#6a1b9a' }} />
              <Typography sx={{ fontWeight: 700 }}>Peer-review a quarterly report (Centre Director)</Typography>
              <Box sx={{ flex: 1 }} />
              <OpenLink
                to={R.KEMRI_REVIEW_QUEUE}
                label="Review Queue"
                color="secondary"
                onClick={(e) => e.stopPropagation()}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="1" sx={{ bgcolor: '#6a1b9a20', color: '#6a1b9a', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Open Review Queue</Typography>
                      <OpenLink to={R.KEMRI_REVIEW_QUEUE} label="Review Queue" color="secondary" />
                    </Stack>
                  }
                  secondary="From the Research sidebar → Review Queue."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="2" sx={{ bgcolor: '#6a1b9a20', color: '#6a1b9a', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Review the report card</Typography>}
                  secondary="Inspect DQA score, KPI achievement, financial utilisation and any flagged fields."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="3" sx={{ bgcolor: '#6a1b9a20', color: '#6a1b9a', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Decide: Accept · Query · Escalate</Typography>}
                  secondary="On Accept, also pick a RAG status. KIMES mirrors the RAG to the project, logs an audit row, and notifies the PI."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={{ borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <OutputsIcon sx={{ color: '#ef6c00' }} />
              <Typography sx={{ fontWeight: 700 }}>Log a research output (publication, dataset, IP, …)</Typography>
              <Box sx={{ flex: 1 }} />
              <OpenLink
                to={R.KEMRI_OUTPUT_REGISTRY}
                label="Outputs Registry"
                color="warning"
                onClick={(e) => e.stopPropagation()}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="1" sx={{ bgcolor: '#ef6c0020', color: '#ef6c00', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Open Outputs Registry</Typography>
                      <OpenLink to={R.KEMRI_OUTPUT_REGISTRY} label="Outputs Registry" color="warning" />
                    </Stack>
                  }
                  secondary="Research sidebar → Outputs Registry. Pick the right tab: Publications, Abstracts, Datasets, Policy Briefs, IP & Patents."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="2" sx={{ bgcolor: '#ef6c0020', color: '#ef6c00', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Click Log new …</Typography>}
                  secondary="Pick the parent study and fill the type-specific fields (DOI for publications, FAIR access level for datasets, commercialisation stage 1–10 for IP)."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="3" sx={{ bgcolor: '#ef6c0020', color: '#ef6c00', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Save</Typography>}
                  secondary="Citation counts and impact factor are auto-refreshed nightly via Crossref / PubMed where a DOI is supplied."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={{ borderRadius: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
              <MapIcon sx={{ color: '#1E3A8A' }} />
              <Typography sx={{ fontWeight: 700 }}>Explore the National GIS dashboard</Typography>
              <Box sx={{ flex: 1 }} />
              <OpenLink
                to={R.GIS_DASHBOARD}
                label="Open dashboard"
                color="info"
                onClick={(e) => e.stopPropagation()}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="1" sx={{ bgcolor: '#1E3A8A20', color: '#1E3A8A', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Pick a heat metric</Typography>}
                  secondary="Studies per county, research sites, total funding, or active studies only — counties are heat-coloured accordingly."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="2" sx={{ bgcolor: '#1E3A8A20', color: '#1E3A8A', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Switch site visualisation</Typography>}
                  secondary="Toggle between Markers (RAG-coloured circles), Heatmap (funding-weighted intensity) and Cluster (auto-grouped bubbles in dense regions)."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="3" sx={{ bgcolor: '#1E3A8A20', color: '#1E3A8A', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Drill into a county</Typography>}
                  secondary="Click any county polygon, the search box, or a Top-Counties leaderboard tile — KIMES zooms in and lazy-loads constituencies and wards."
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Chip size="small" label="4" sx={{ bgcolor: '#1E3A8A20', color: '#1E3A8A', fontWeight: 700 }} /></ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Filter by RAG</Typography>}
                  secondary="Use the RAG filter to reveal only Green / Amber / Red / Pending sites — handy for spotting at-risk studies geographically."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Stack>

      {/* KEMRI Form coverage */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
            <ScienceIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>KEMRI Form v05 coverage</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Where each section of the official KEMRI Research Implementation &amp; Grant Monitoring
            Tool lives in KIMES. Click <em>Open</em> on any tile to jump there.
          </Typography>
          <Grid container spacing={1.25}>
            {SECTION_GUIDE.map((s) => (
              <Grid key={s.sec} item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', flex: 1 }}>
                      {s.sec}
                    </Typography>
                    {s.to ? <OpenLink to={s.to} label={s.cta || 'Open'} /> : null}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{s.what}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    <strong>Where:</strong> {s.where}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* DQA */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
            <DqaIcon sx={{ color: '#2e7d32' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Data Quality Assessment (DQA)</Typography>
            <Box sx={{ flex: 1 }} />
            <OpenLink to={R.KEMRI_REVIEW_QUEUE} label="See DQA scores" color="success" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Every quarterly report runs through eight automated checks. Reports below a weighted
            score of 85% (with completeness double-weighted) are auto-returned for correction.
          </Typography>
          <Grid container spacing={1.25}>
            {DQA_CHECKS.map((c, i) => (
              <Grid key={c.name} item xs={12} md={6}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Chip size="small" label={i + 1} color="success" sx={{ fontWeight: 700, mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.detail}</Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* RAG + Escalation */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <SectionCard icon={RagIcon} title="RAG status legend" color="#1565c0">
            <Stack spacing={1.25}>
              {RAG_LEGEND.map((r) => (
                <Stack key={r.rag} direction="row" alignItems="flex-start" spacing={1.25}>
                  <Box sx={{
                    width: 14, height: 14, borderRadius: '50%',
                    bgcolor: r.color, mt: 0.5, flexShrink: 0,
                  }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: r.color }}>{r.rag}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.meaning}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
            <Box sx={{ mt: 1.5 }}>
              <OpenLink to={R.GIS_DASHBOARD} label="See RAG on the map" color="info" />
            </Box>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard icon={EscalationIcon} title="Non-conformity escalation ladder" color="#c62828">
            <Stack spacing={1.25}>
              {ESCALATIONS.map((e) => (
                <Stack key={e.level} direction="row" spacing={1.25} alignItems="flex-start">
                  <Chip
                    label={`L${e.level}`}
                    size="small"
                    sx={{ fontWeight: 700, minWidth: 36, bgcolor: '#c6282820', color: '#c62828' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{e.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      <strong>Trigger:</strong> {e.trigger}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      <strong>Responder:</strong> {e.responder} · <strong>SLA:</strong> {e.sla}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <OpenLink to={R.KEMRI_ESCALATIONS}    label="Escalations Inbox" color="error" />
              <OpenLink to={R.KEMRI_NOTIFICATIONS}  label="Notifications" color="primary" />
              <OpenLink to={R.KEMRI_REVIEW_QUEUE}   label="Review queue" color="secondary" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              The KIMES workflow engine runs every six hours \u2014 it issues D-30 / D-14 / D-7 reminders before the
              PI submission deadline, escalates overdue reports up the ladder automatically, and renders the
              DG-NCF-001 donor non-conformity letter draft when an escalation reaches Level&nbsp;4. The DG and
              Legal Counsel must still approve the letter before transmission.
            </Typography>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Review Authority Matrix (KIMES v5 \u00a72.1) */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
            <FactCheckIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Review Authority Matrix (KIMES v5 \u00a72.1)</Typography>
          </Stack>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Peer-led review \u2014 not junior-led gatekeeping.</Typography>
            <Typography variant="caption">
              PIs are reviewed by Centre Directors or Senior Scientists at equal or higher professional rank \u2014 <em>never</em> by junior M&E Officers.
              M&E Officers perform two functions only: (1) <strong>data quality facilitation</strong> and (2) <strong>system facilitation</strong>.
            </Typography>
          </Alert>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Workflow stage</TableCell>
                  <TableCell>Responsible party (authority)</TableCell>
                  <TableCell>M&E Officer role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {REVIEW_AUTHORITY.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.stage}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{r.responsible}</Typography></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{r.melRole}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a', mb: 0.5 }}>What M&E Officers DO</Typography>
              <List dense disablePadding>
                {[
                  'System administration and user support for KIMES across all centres',
                  'Send automated reminders to PIs at 30 / 14 / 7 days before reporting deadlines',
                  'Monitor the automated DQA engine; follow up on field-level flags without judging scientific content',
                  'Prepare consolidated data packages for Centre Directors',
                  'Manage the escalation log and route non-compliance notices',
                  'Facilitate AI report generation and prepare drafts for Centre Director or DG approval',
                  'Operate the GIS platform; manage KIMES-ERP integration monitoring; manage Donor Portal',
                ].map((t, i) => (
                  <ListItem key={i} sx={{ alignItems: 'flex-start', px: 0, py: 0.25 }}>
                    <ListItemText primary={<Typography variant="caption">\u2022 {t}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mb: 0.5 }}>What M&E Officers DO NOT</Typography>
              <List dense disablePadding>
                {[
                  'Approve or reject any PI scientific progress report',
                  'Assign or change RAG status independently',
                  'Query the scientific content or methodology of a PI research project',
                  'Initiate or send any escalation notice to a donor \u2014 that is a DG-only function',
                ].map((t, i) => (
                  <ListItem key={i} sx={{ alignItems: 'flex-start', px: 0, py: 0.25 }}>
                    <ListItemText primary={<Typography variant="caption">\u2022 {t}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KEMRI Strategic Plan 2023-2027 alignment */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
            <FactCheckIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>KEMRI Strategic Plan 2023&ndash;2027 — alignment & achievements</Typography>
            <OpenLink to={R.KEMRI_STRATEGIC_PLAN} label="Open Strategic Plan" />
          </Stack>
          <Typography variant="body2" sx={{ mb: 1 }}>
            KIMES is wired to the institute&apos;s <strong>5th Strategic Plan (FY2023/24&nbsp;&ndash;&nbsp;FY2027/28)</strong> &mdash;
            6 KRAs, 12 Strategic Objectives, with Year&nbsp;1&ndash;5 targets and 5-year budgets per objective (Table&nbsp;3.2 of
            the approved plan). Every research project can be linked to a <em>primary strategic objective</em>
            plus any number of <em>contributing objectives</em>; outputs and key achievements roll up the same chain.
          </Typography>
          <List dense disablePadding sx={{ mb: 1 }}>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Where do I see the plan?</Typography>}
                secondary={
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <OpenLink to={R.KEMRI_STRATEGIC_PLAN} label="Strategic Plan page" />
                    <Typography variant="caption">— KRA accordions with each objective&apos;s KPI, current-year target, linked projects, achievements & budget.</Typography>
                  </Stack>
                }
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>How do I link a study to the plan?</Typography>}
                secondary={
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <OpenLink to={R.KEMRI_STUDY_NEW} label="Register study" />
                    <Typography variant="caption">— pick the <strong>Primary strategic objective</strong> + any <strong>contributing objectives</strong> on the registration form. Existing studies can be edited at any time.</Typography>
                  </Stack>
                }
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>How do I record a key achievement?</Typography>}
                secondary={
                  <Typography variant="caption">
                    On the Strategic Plan page, click <strong>+</strong> on any objective card, or open the objective&apos;s detail
                    page and use <em>Record achievement</em>. Pick a type (publication, IP, dataset, policy, capacity,
                    event, partnership, infrastructure, milestone), add narrative + numeric value + evidence URL.
                    KIMES also auto-derives achievements from registered outputs (high-impact publications, granted
                    patents) so the timeline stays current without double entry.
                  </Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>How does it feed the Board Scorecard?</Typography>}
                secondary={
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <OpenLink to={R.KEMRI_BOARD_SCORECARD} label="Board Scorecard" />
                    <Typography variant="caption">— the KRA progress band on the scorecard is auto-computed from active projects linked to each KRA&apos;s objectives in this plan (no manual data entry).</Typography>
                  </Stack>
                }
              />
            </ListItem>
          </List>
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5 }}>
            <Typography variant="caption">
              The 6 KRAs are: <strong>KRA1</strong> Research for Human Health,
              <strong> KRA2</strong> Innovation &amp; Product Development,
              <strong> KRA3</strong> Disease Surveillance &amp; Response,
              <strong> KRA4</strong> Research Capacity Building,
              <strong> KRA5</strong> Financial Sustainability,
              <strong> KRA6</strong> Institutional Strengthening.
              Source: <code>api/adp/FINALAPPROVEDSTRATEGICPLAN3.27.pdf</code>.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
            <HelpIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Troubleshooting</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <List dense disablePadding>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>I cannot sign in</Typography>}
                secondary="Confirm your KEMRI username and password. If your account was deactivated, ask your Centre ICT Officer to restore it."
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>The Studies registry is empty</Typography>
                    <OpenLink to={R.KEMRI_STUDIES} label="Open registry" />
                  </Stack>
                }
                secondary="You only see studies you are PI on, plus any visible to your Centre Director / MEL role. Contact your Centre Director to be added as a co-investigator if a study is missing."
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>My quarterly report was auto-returned</Typography>
                    <OpenLink to={R.KEMRI_PI_DASHBOARD} label="My reports" color="success" />
                  </Stack>
                }
                secondary="DQA scored below 85%. Open the report, look at the flagged fields list, fix the issues, and re-submit. Common causes: empty narrative fields, expenditure exceeds budget, SERU expired."
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>SERU expiry warning</Typography>}
                secondary="If your study is within 60 days of SERU expiry, KIMES flags the report. Renew SERU approval before submitting the next quarterly report."
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>I get an authorisation error</Typography>
                    <OpenLink to="/user-management" label="User management" color="error" />
                  </Stack>
                }
                secondary="Your role may not include the privilege required for that page. Contact your Centre Director or KEMRI ICT to update role permissions."
              />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }} icon={<EmailIcon />}>
            Need additional help? Email <MuiLink href="mailto:kimes-support@kemri.go.ke">kimes-support@kemri.go.ke</MuiLink> or
            contact KEMRI ICT (+254-20-272-2541) with your KIMES Project ID, screenshot, and the
            exact error message. KEMRI website: <MuiLink href="https://www.kemri.go.ke" target="_blank" rel="noreferrer">kemri.go.ke</MuiLink>.
          </Alert>
        </CardContent>
      </Card>

      {/* Footer */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 4, opacity: 0.7 }}>
        <PublicIcon sx={{ fontSize: 18 }} />
        <Typography variant="caption" color="text.secondary">
          KIMES — Kenya Medical Research Institute · Concurrent reporting to donors, management,
          and the Board with one verified record.
        </Typography>
      </Stack>
    </Container>
  );
}
