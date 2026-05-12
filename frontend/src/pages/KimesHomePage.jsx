/**
 * KIMES Home — personal command center for the logged-in user.
 *
 * The page is composed of independent panels that each call one (or zero)
 * REST endpoint and degrade gracefully (Promise.allSettled).  Layout, top to
 * bottom:
 *
 *   1. Hero  — role-aware greeting, FY/Q + days-to-deadline pill, unread
 *              notifications pill, last engine tick pill.
 *   2. KPI strip — 4 click-through tiles (active studies, centre portfolio,
 *              pending peer reviews, open escalations).
 *   3. Action items — priority queue: things demanding the user's attention
 *              right now (overdue reports, open escalations, queried reports,
 *              SERU expiring, draft reports).
 *   4. Insights — DQA pass-rate trend (mini line chart) + RAG donut +
 *              SERU expiry watchlist + recent activity feed.
 *   5. Quick actions — 8 modules organised by role.
 *   6. Concurrent-reporting reassurance line.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container,
  Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme,
} from '@mui/material';
import {
  Science as ScienceIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  RuleFolder as ReviewIcon,
  AutoAwesome as OutputsIcon,
  ArrowForward as ArrowIcon,
  HealthAndSafety as KemriIcon,
  Refresh as RefreshIcon,
  GavelRounded as EscalationIcon,
  NotificationsActiveOutlined as BellIcon,
  EventOutlined as CalendarIcon,
  WarningAmberRounded as WarningIcon,
  PolicyOutlined as PolicyIcon,
  PublicOutlined as MapIcon,
  ChecklistRounded as ChecklistIcon,
  Whatshot as HotIcon,
  PlayCircleOutline as TickIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  PendingActions as PendingActionsIcon,
  CelebrationOutlined as CelebrateIcon,
  BoltRounded as BoltIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip,
  PieChart, Pie, Cell, ReferenceLine,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import kemriService from '../api/kemriService';
import { ragMeta } from '../utils/kemriFormat';
import { ROUTES } from '../configs/appConfig';

// ---------------------------------------------------------------------------
//  Utilities
// ---------------------------------------------------------------------------

const RAG_COLORS = {
  green:   ragMeta('green').hex,
  amber:   ragMeta('amber').hex,
  red:     ragMeta('red').hex,
  pending: ragMeta('pending').hex,
};

/**
 * Compute the current GoK fiscal-year quarter (FY runs 1 Jul – 30 Jun;
 * Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun).  Returns the FY label,
 * quarter label, quarter end date, days remaining in the quarter, and the
 * derived PI submission deadline (period_end + 15 days).
 */
function computeFiscalContext(now = new Date()) {
  const m = now.getMonth(); // 0-11
  const y = now.getFullYear();
  const fyStartYear = m >= 6 ? y : y - 1; // July = month 6
  const fyEndYear = fyStartYear + 1;
  const fyLabel = `FY ${fyStartYear}/${String(fyEndYear).slice(2)}`;

  let qNum, qStart, qEnd;
  if (m >= 6 && m <= 8)        { qNum = 1; qStart = new Date(fyStartYear, 6, 1);  qEnd = new Date(fyStartYear, 8, 30); }
  else if (m >= 9 && m <= 11)  { qNum = 2; qStart = new Date(fyStartYear, 9, 1);  qEnd = new Date(fyStartYear, 11, 31); }
  else if (m >= 0 && m <= 2)   { qNum = 3; qStart = new Date(fyEndYear, 0, 1);    qEnd = new Date(fyEndYear, 2, 31); }
  else                         { qNum = 4; qStart = new Date(fyEndYear, 3, 1);    qEnd = new Date(fyEndYear, 5, 30); }

  const piDeadline = new Date(qEnd);
  piDeadline.setDate(piDeadline.getDate() + 15);

  const daysToQEnd = Math.max(0, Math.ceil((qEnd - now) / (1000 * 60 * 60 * 24)));
  const daysToDeadline = Math.ceil((piDeadline - now) / (1000 * 60 * 60 * 24));

  return {
    fyLabel,
    quarter: `Q${qNum}`,
    qEnd, piDeadline,
    daysToQEnd, daysToDeadline,
    fyStart: new Date(fyStartYear, 6, 1),
  };
}

const fmtAgo = (iso) => {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'just now';
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatNumber = (n) => Number(n || 0).toLocaleString();

// ---------------------------------------------------------------------------
//  Sub-components
// ---------------------------------------------------------------------------

function HeroPill({ icon, label, value, tone = 'light', tooltip, onClick }) {
  const Icon = icon;
  const palette = {
    light:   { bg: 'rgba(255,255,255,0.18)', color: 'white', border: 'rgba(255,255,255,0.28)' },
    warning: { bg: 'rgba(245, 158, 11, 0.95)', color: '#1c1917', border: 'rgba(245,158,11,1)' },
    danger:  { bg: 'rgba(239, 68, 68, 0.95)',  color: 'white',   border: 'rgba(239,68,68,1)' },
    success: { bg: 'rgba(16, 185, 129, 0.95)', color: 'white',   border: 'rgba(16,185,129,1)' },
  }[tone] || { bg: 'rgba(255,255,255,0.18)', color: 'white' };

  const content = (
    <Stack
      direction="row" spacing={1} alignItems="center"
      onClick={onClick}
      sx={{
        bgcolor: palette.bg, color: palette.color,
        border: '1px solid', borderColor: palette.border,
        px: 1.25, py: 0.75, borderRadius: 999,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform .15s',
        '&:hover': onClick ? { transform: 'translateY(-1px)' } : {},
      }}
    >
      {Icon && <Icon sx={{ fontSize: 16 }} />}
      <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, color: 'inherit' }}>{label}</Typography>
      {value != null && (
        <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1, color: 'inherit' }}>· {value}</Typography>
      )}
    </Stack>
  );
  return tooltip ? <Tooltip title={tooltip} arrow>{content}</Tooltip> : content;
}

function KpiTile({ icon, label, value, caption, color, to, badge }) {
  const navigate = useNavigate();
  const Icon = icon;
  return (
    <Card
      variant="outlined"
      onClick={to ? () => navigate(to) : undefined}
      sx={{
        borderRadius: 2, height: '100%', position: 'relative', overflow: 'hidden',
        cursor: to ? 'pointer' : 'default',
        borderColor: 'divider',
        transition: 'transform .15s, box-shadow .15s, border-color .15s',
        '&:hover': to ? { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(0,0,0,0.08)', borderColor: color } : {},
        '&::before': {
          content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          backgroundColor: color || '#94a3b8',
        },
      }}
    >
      <CardContent sx={{ pl: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {Icon && <Icon sx={{ fontSize: 16, color: color || 'text.secondary' }} />}
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, lineHeight: 1.1 }}>
                {label}
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800, color: color || 'text.primary', mt: 0.25, lineHeight: 1.1 }}>
              {formatNumber(value)}
            </Typography>
            {caption && (
              <Typography variant="caption" color="text.secondary">{caption}</Typography>
            )}
          </Box>
          {badge && (
            <Chip size="small" label={badge.label} color={badge.color || 'default'} sx={{ fontWeight: 700 }} />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActionItem({ icon, color, title, subtitle, age, ctaLabel, to, onClick, severity }) {
  const navigate = useNavigate();
  const Icon = icon || HotIcon;
  const sevColor = {
    high:   '#dc2626',
    medium: '#f59e0b',
    low:    '#0891b2',
    info:   '#475569',
  }[severity] || '#475569';
  const handleClick = () => {
    if (onClick) return onClick();
    if (to) navigate(to);
  };
  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        p: 1.25, borderRadius: 1.5, cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        transition: 'border-color .15s, transform .15s',
        '&:hover': { borderColor: sevColor, transform: 'translateX(2px)' },
      }}
    >
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: `${sevColor}1A`, color: sevColor,
      }}>
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }} noWrap>
            {subtitle}
          </Typography>
        )}
      </Box>
      {age && (
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{age}</Typography>
      )}
      <Button size="small" variant="text" sx={{ flexShrink: 0, color: sevColor }} endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}>
        {ctaLabel || 'Open'}
      </Button>
    </Box>
  );
}

function PanelHeader({ icon, title, subtitle, actionLabel, onAction }) {
  const Icon = icon;
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
      {Icon && (
        <Box sx={{
          width: 28, height: 28, borderRadius: 1, bgcolor: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon sx={{ fontSize: 18, color: '#475569' }} />
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {actionLabel && (
        <Button size="small" variant="text" onClick={onAction} endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
//  Main
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { key: 'register',     title: 'New Study',           blurb: 'Capture grant award, sites, objectives. Generates a unique KIMES Project ID.', icon: ScienceIcon,             color: '#005a9c', to: ROUTES.KEMRI_STUDY_NEW },
  { key: 'pi',           title: 'PI Dashboard',         blurb: 'KPI progress, RAG, deadlines, drafts and queries on your studies.',         icon: AssignmentTurnedInIcon,  color: '#0891b2', to: ROUTES.KEMRI_PI_DASHBOARD },
  { key: 'review',       title: 'Review Queue',         blurb: 'Peer-review DQA-validated reports; assign Green/Amber/Red.',                 icon: ReviewIcon,              color: '#6a1b9a', to: ROUTES.KEMRI_REVIEW_QUEUE },
  { key: 'escalations',  title: 'Escalations',          blurb: 'L1–L4 non-conformity inbox with DG-NCF-001 letter generator.',                icon: EscalationIcon,          color: '#dc2626', to: ROUTES.KEMRI_ESCALATIONS },
  { key: 'outputs',      title: 'Outputs Registry',     blurb: 'Publications, datasets (FAIR), policy briefs, IP/patents.',                   icon: OutputsIcon,             color: '#ef6c00', to: ROUTES.KEMRI_OUTPUT_REGISTRY },
  { key: 'forms',        title: 'Field Forms',          blurb: 'Site visits, MEL audits, lab QC, equipment audits, study close-out.',         icon: ChecklistIcon,           color: '#0f766e', to: ROUTES.DATA_COLLECTION_TOOLS },
  { key: 'gis',          title: 'National GIS Map',     blurb: '47-county research footprint with site-level RAG and heat-map overlays.',     icon: MapIcon,                 color: '#1E3A8A', to: ROUTES.GIS_DASHBOARD },
  { key: 'exec',         title: 'Executive Dashboard',  blurb: 'Institution-wide portfolio, finance and operations for DG / Board.',          icon: PolicyIcon,              color: '#475569', to: '/summary-statistics' },
];

export default function KimesHomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickRunning, setTickRunning] = useState(false);
  const [data, setData] = useState({
    pi: null, cd: null, summary: null,
    notifications: { items: [], unread: 0, total: 0 },
    workflowRuns: [],
    escalationSummary: null,
  });

  const fiscal = useMemo(() => computeFiscalContext(new Date()), []);
  const greetingName = useMemo(() => (
    user?.firstName || user?.first_name || user?.fullName || user?.username || 'KEMRI Researcher'
  ), [user]);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [pi, cd, summary, notif, runs, escSum] = await Promise.allSettled([
        kemriService.getPiDashboard(),
        kemriService.getCentreDirectorDashboard(),
        kemriService.getDashboardSummary(),
        kemriService.listNotifications({ limit: 6 }),
        kemriService.listWorkflowRuns(),
        kemriService.getEscalationsSummary(),
      ]);
      setData({
        pi:                pi.status      === 'fulfilled' ? pi.value      : null,
        cd:                cd.status      === 'fulfilled' ? cd.value      : null,
        summary:           summary.status === 'fulfilled' ? summary.value : null,
        notifications:     notif.status   === 'fulfilled' ? notif.value   : { items: [], unread: 0, total: 0 },
        workflowRuns:      runs.status    === 'fulfilled' ? runs.value    : [],
        escalationSummary: escSum.status  === 'fulfilled' ? escSum.value  : null,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load home');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ----- Derived data -----------------------------------------------------

  const myActiveStudies = useMemo(() => (
    (data.pi?.ragSummary || []).reduce((acc, r) => acc + Number(r.n || 0), 0)
  ), [data.pi]);

  const portfolioCount = data.cd?.portfolio?.length || 0;
  const pendingReviews = data.cd?.reviewQueue?.length || 0;

  const totalEscalations = useMemo(() => {
    if (!data.escalationSummary) return 0;
    return Object.values(data.escalationSummary).reduce((a, b) => a + Number(b?.open || 0), 0);
  }, [data.escalationSummary]);

  const dqaTrend = useMemo(() => {
    const rows = data.summary?.reportsByFy || [];
    return rows
      .map((r) => ({
        fy: String(r.fyLabel || '').replace(/^FY\s*/, ''),
        passRate: r.reportCount ? Math.round((Number(r.dqaPassed) / Number(r.reportCount)) * 100) : 0,
        avgScore: Number(r.avgDqaScore || 0),
        total: Number(r.reportCount || 0),
      }))
      .filter((r) => r.fy)
      .slice(-8);
  }, [data.summary]);

  const dqaTrendDelta = useMemo(() => {
    if (dqaTrend.length < 2) return 0;
    return dqaTrend[dqaTrend.length - 1].passRate - dqaTrend[dqaTrend.length - 2].passRate;
  }, [dqaTrend]);

  const ragData = useMemo(() => {
    const rag = data.summary?.ragSummary || { green: 0, amber: 0, red: 0, pending: 0 };
    return [
      { name: 'Green',   value: rag.green   || 0, color: RAG_COLORS.green },
      { name: 'Amber',   value: rag.amber   || 0, color: RAG_COLORS.amber },
      { name: 'Red',     value: rag.red     || 0, color: RAG_COLORS.red },
      { name: 'Pending', value: rag.pending || 0, color: RAG_COLORS.pending },
    ];
  }, [data.summary]);

  const ragTotal = ragData.reduce((a, b) => a + b.value, 0);
  const ragGreenPct = ragTotal ? Math.round((ragData[0].value / ragTotal) * 100) : 0;

  const seruExpiring = data.summary?.seruExpiring || [];

  const lastRun = data.workflowRuns?.[0];
  const recentReports = data.summary?.recentReports?.slice(0, 6) || [];

  // Build the priority Action Items list from multiple sources.
  const actionItems = useMemo(() => {
    const items = [];

    // 1. Open escalations by level (high-severity first)
    if (data.escalationSummary) {
      const e = data.escalationSummary;
      [4, 3, 2, 1].forEach((lvl) => {
        const open = e[lvl]?.open || 0;
        if (open > 0) {
          items.push({
            id: `esc-l${lvl}`,
            severity: lvl >= 3 ? 'high' : (lvl === 2 ? 'medium' : 'low'),
            icon: EscalationIcon,
            title: `${open} open L${lvl} escalation${open === 1 ? '' : 's'}`,
            subtitle: lvl === 4 ? 'DG-NCF-001 letter draft awaiting Legal review' :
                      lvl === 3 ? 'Centre Director intervention required' :
                      lvl === 2 ? 'Formal MEL written notice' : 'Day-1 caution',
            ctaLabel: 'Open inbox',
            to: ROUTES.KEMRI_ESCALATIONS,
            sortKey: 100 + lvl,
          });
        }
      });
    }

    // 2. Pending peer reviews (Centre Director only)
    if (pendingReviews > 0) {
      items.push({
        id: 'reviews',
        severity: 'medium',
        icon: ReviewIcon,
        title: `${pendingReviews} report${pendingReviews === 1 ? '' : 's'} awaiting peer review`,
        subtitle: 'DQA-passed reports queued for Centre Director sign-off',
        ctaLabel: 'Review queue',
        to: ROUTES.KEMRI_REVIEW_QUEUE,
        sortKey: 80,
      });
    }

    // 3. PI deadlines (drafts + queried)
    (data.pi?.upcomingDeadlines || []).slice(0, 4).forEach((row) => {
      const sev = row.status === 'queried' || row.status === 'dqa_returned' ? 'medium' : 'low';
      items.push({
        id: `deadline-${row.id}`,
        severity: sev,
        icon: PendingActionsIcon,
        title: `${row.kimesProjectId} · ${row.fyLabel} ${row.quarter} report (${row.status})`,
        subtitle: row.projectTitle,
        ctaLabel: 'Open PI dashboard',
        to: ROUTES.KEMRI_PI_DASHBOARD,
        sortKey: 50,
      });
    });

    // 4. SERU expiring within 60 days (top 3)
    seruExpiring.slice(0, 3).forEach((row) => {
      const sev = row.daysToExpiry <= 14 ? 'high' : (row.daysToExpiry <= 30 ? 'medium' : 'low');
      items.push({
        id: `seru-${row.projectId}`,
        severity: sev,
        icon: WarningIcon,
        title: `SERU expires in ${row.daysToExpiry} day${row.daysToExpiry === 1 ? '' : 's'} — ${row.kimesProjectId}`,
        subtitle: row.title,
        ctaLabel: 'Open study',
        to: `/kemri/studies/${row.projectId}`,
        sortKey: 70 - Math.min(60, row.daysToExpiry),
      });
    });

    // Sort: high severity & high sortKey first
    const sevWeight = { high: 3, medium: 2, low: 1, info: 0 };
    items.sort((a, b) => (sevWeight[b.severity] - sevWeight[a.severity]) || (b.sortKey - a.sortKey));
    // Cap at 6 so the left column stays roughly aligned with the stacked
    // "Compliance pulse + Recent activity" pair on the right.
    return items.slice(0, 6);
  }, [data, pendingReviews, seruExpiring]);

  // Activity feed: last 8 events from notifications + recent reports + workflow runs.
  const activityFeed = useMemo(() => {
    const events = [];
    (data.notifications?.items || []).forEach((n) => {
      events.push({
        ts: n.createdAt,
        icon: BellIcon,
        text: n.subject,
        link: n.link,
        kind: n.kind,
      });
    });
    recentReports.forEach((r) => {
      events.push({
        ts: r.submittedAt || r.reviewedAt,
        icon: AssignmentTurnedInIcon,
        text: `Report ${r.status} · ${r.kimesProjectId} ${r.fyLabel} ${r.quarter}`,
        link: ROUTES.KEMRI_REVIEW_QUEUE,
      });
    });
    if (lastRun) {
      events.push({
        ts: lastRun.ranAt,
        icon: BoltIcon,
        text: `Workflow engine tick · ${lastRun.remindersSent} reminders, ${lastRun.escalationsOpened + lastRun.escalationsUpgraded} escalations actioned`,
        link: ROUTES.KEMRI_ESCALATIONS,
      });
    }
    return events
      .filter((e) => e.ts)
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, 8);
  }, [data.notifications, recentReports, lastRun]);

  const handleRunTick = async () => {
    setTickRunning(true);
    try { await kemriService.runWorkflowTick(false); await refresh(); }
    catch (e) { setError(e?.response?.data?.message || e.message || 'Tick failed'); }
    finally { setTickRunning(false); }
  };

  const dqaTone = dqaTrendDelta > 0 ? 'success' : dqaTrendDelta < 0 ? 'danger' : 'info';
  const dqaIcon = dqaTrendDelta > 0 ? TrendingUpIcon : dqaTrendDelta < 0 ? TrendingDownIcon : TrendingFlatIcon;
  const lastTrendValue = dqaTrend.length ? dqaTrend[dqaTrend.length - 1].passRate : null;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* ============= HERO ============= */}
      <Card
        elevation={0}
        sx={{
          mb: 3, color: 'white', borderRadius: 3, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, #003e6b 0%, #005a9c 50%, #1976d2 100%)',
          '&::after': {
            content: '""', position: 'absolute', right: -120, top: -100, width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <CardContent sx={{ py: { xs: 2.5, md: 3 }, position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <KemriIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
                KEMRI Integrated Monitoring &amp; Evaluation System
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.25, lineHeight: 1.15 }}>
                Welcome, {greetingName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.92, maxWidth: 720 }}>
                Your single, verified record for every research study — from registration through seven-year post-study output tracking.
              </Typography>
            </Box>
            <IconButton
              onClick={refresh}
              sx={{ color: 'white', alignSelf: { xs: 'flex-end', md: 'flex-start' } }}
              aria-label="Refresh"
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RefreshIcon />}
            </IconButton>
          </Stack>

          {/* ----- Status pills row ----- */}
          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1} sx={{ mt: 2 }}>
            <HeroPill
              icon={CalendarIcon}
              label={`${fiscal.fyLabel} ${fiscal.quarter}`}
              value={`Q-end in ${fiscal.daysToQEnd}d`}
              tooltip={`Quarter ends ${fmtDate(fiscal.qEnd)}. PI submission deadline: ${fmtDate(fiscal.piDeadline)} (Q-end + 15 days).`}
              tone="light"
            />
            <HeroPill
              icon={TimeIcon}
              label="PI deadline"
              value={fiscal.daysToDeadline >= 0 ? `${fiscal.daysToDeadline}d to go` : `${Math.abs(fiscal.daysToDeadline)}d overdue`}
              tooltip={`Quarterly milestone reports are due ${fmtDate(fiscal.piDeadline)} (period end + 15 days, Concept §3 Step 3).`}
              tone={fiscal.daysToDeadline < 7 ? 'warning' : 'light'}
            />
            <HeroPill
              icon={BellIcon}
              label="Notifications"
              value={`${data.notifications?.unread || 0} unread`}
              tone={data.notifications?.unread > 0 ? 'warning' : 'light'}
              onClick={() => navigate(ROUTES.KEMRI_NOTIFICATIONS)}
              tooltip="Click to open the inbox (D-N reminders, escalation notices, SERU alerts)."
            />
            <HeroPill
              icon={EscalationIcon}
              label="Escalations"
              value={`${totalEscalations} open`}
              tone={totalEscalations > 0 ? 'danger' : 'light'}
              onClick={() => navigate(ROUTES.KEMRI_ESCALATIONS)}
              tooltip="Click to open the L1–L4 non-conformity inbox."
            />
            {lastRun && (
              <HeroPill
                icon={BoltIcon}
                label="Engine"
                value={`tick ${fmtAgo(lastRun.ranAt)}`}
                tone="light"
                tooltip={`Last workflow tick: ${fmtAgo(lastRun.ranAt)}.\nReminders sent: ${lastRun.remindersSent} · Escalations opened: ${lastRun.escalationsOpened} · Upgraded: ${lastRun.escalationsUpgraded} · SERU alerts: ${lastRun.seruAlertsSent}`}
              />
            )}
            <HeroPill
              icon={TickIcon}
              label={tickRunning ? 'Running…' : 'Run engine now'}
              tone="success"
              onClick={tickRunning ? null : handleRunTick}
              tooltip="Manually trigger the KIMES workflow engine: D-30/-14/-7 reminders, L1→L4 escalation ladder, SERU expiry alerts."
            />
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* ============= KPI strip ============= */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KpiTile
            icon={ScienceIcon}
            label="My active studies"
            value={myActiveStudies}
            caption="As Principal Investigator"
            color={theme.palette.primary.main}
            to={ROUTES.KEMRI_PI_DASHBOARD}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiTile
            icon={ReviewIcon}
            label="Centre portfolio"
            value={portfolioCount}
            caption="Studies visible to me as reviewer"
            color="#6a1b9a"
            to={ROUTES.KEMRI_REVIEW_QUEUE}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiTile
            icon={PendingActionsIcon}
            label="Pending peer reviews"
            value={pendingReviews}
            caption="DQA-passed reports awaiting Centre Director"
            color="#ed6c02"
            to={ROUTES.KEMRI_REVIEW_QUEUE}
            badge={pendingReviews > 0 ? { label: 'Action', color: 'warning' } : null}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiTile
            icon={EscalationIcon}
            label="Open escalations"
            value={totalEscalations}
            caption="Levels 1–4 not yet resolved"
            color="#dc2626"
            to={ROUTES.KEMRI_ESCALATIONS}
            badge={totalEscalations > 0 ? { label: 'Action', color: 'error' } : null}
          />
        </Grid>
      </Grid>

      {/* ============= ACTION ITEMS (priority queue) =============
          Cards stretch (default Grid behaviour) and the right column stacks
          "Compliance pulse" + "Recent activity" so its combined height stays
          close to the action-items list on the left — no awkward gap below. */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ borderRadius: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <PanelHeader
                icon={HotIcon}
                title="Your action items"
                subtitle="Prioritised by severity. Click any item to jump to the right page."
                actionLabel={actionItems.length === 0 ? null : 'See all'}
                onAction={() => navigate(ROUTES.KEMRI_NOTIFICATIONS)}
              />
              {actionItems.length === 0 ? (
                <Box sx={{ flex: 1, textAlign: 'center', py: 5, color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <CelebrateIcon sx={{ fontSize: 48, color: '#16a34a', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>You're all caught up!</Typography>
                  <Typography variant="caption">No overdue reports, open escalations or imminent SERU expiries assigned to you.</Typography>
                </Box>
              ) : (
                <Stack spacing={1} sx={{ flex: 1 }}>
                  {actionItems.map((it) => (
                    <ActionItem
                      key={it.id}
                      icon={it.icon}
                      severity={it.severity}
                      title={it.title}
                      subtitle={it.subtitle}
                      ctaLabel={it.ctaLabel}
                      to={it.to}
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: stacked Compliance Pulse + Recent activity */}
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Stack spacing={2} sx={{ width: '100%' }}>
            {/* Compliance pulse: dense 2×2 grid of at-a-glance health stats */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <PanelHeader
                  icon={BoltIcon}
                  title="Compliance pulse"
                  subtitle="At-a-glance health."
                />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>DQA pass rate</Typography>
                      <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: dqaTone === 'success' ? '#16a34a' : dqaTone === 'danger' ? '#dc2626' : 'text.primary' }}>
                          {lastTrendValue != null ? `${lastTrendValue}%` : '—'}
                        </Typography>
                        {dqaTrendDelta !== 0 && lastTrendValue != null && (
                          <Typography variant="caption" sx={{ fontWeight: 700, color: dqaTone === 'success' ? '#15803d' : '#b91c1c' }}>
                            {dqaTrendDelta > 0 ? '+' : ''}{dqaTrendDelta}pp
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>RAG on track</Typography>
                      <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: RAG_COLORS.green }}>
                          {ragTotal ? `${ragGreenPct}%` : '—'}
                        </Typography>
                        {ragTotal > 0 && (
                          <Typography variant="caption" color="text.secondary">of {ragTotal}</Typography>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>Escalations</Typography>
                      <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: totalEscalations > 0 ? '#dc2626' : '#16a34a' }}>
                          {totalEscalations}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">open</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>Engine tick</Typography>
                      <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                          {lastRun ? fmtAgo(lastRun.ranAt) : '—'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <PanelHeader
                  icon={BellIcon}
                  title="Recent activity"
                  subtitle="Last events on your radar."
                  actionLabel="Inbox"
                  onAction={() => navigate(ROUTES.KEMRI_NOTIFICATIONS)}
                />
                {activityFeed.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Nothing happening just yet.</Typography>
                ) : (
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    {activityFeed.slice(0, 5).map((e, i) => {
                      const Icon = e.icon || BellIcon;
                      return (
                        <Box
                          key={i}
                          onClick={() => e.link && navigate(e.link)}
                          sx={{
                            display: 'flex', gap: 1, alignItems: 'flex-start',
                            p: 0.75, borderRadius: 1, cursor: e.link ? 'pointer' : 'default',
                            '&:hover': e.link ? { bgcolor: '#f8fafc' } : {},
                          }}
                        >
                          <Icon sx={{ fontSize: 16, color: '#64748b', mt: 0.25 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'text.primary' }} noWrap>
                              {e.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{fmtAgo(e.ts)}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* ============= INSIGHTS ROW =============
          Cards stretch to equal height; each CardContent is a flex column so
          the chart / donut / list anchors to the top and any leftover space
          falls below the chart caption rather than between rows. */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* DQA pass-rate trend */}
        <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ borderRadius: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <PanelHeader
                icon={dqaIcon}
                title="DQA pass-rate trend"
                subtitle="% of quarterly reports clearing the 85% DQA threshold."
              />
              {dqaTrend.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No DQA history yet.</Typography>
              ) : (
                <>
                  <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: dqaTone === 'success' ? '#16a34a' : dqaTone === 'danger' ? '#dc2626' : 'text.primary' }}>
                      {lastTrendValue}<Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>%</Typography>
                    </Typography>
                    {dqaTrendDelta !== 0 && (
                      <Chip
                        size="small"
                        icon={React.createElement(dqaIcon, { sx: { fontSize: 14 } })}
                        label={`${dqaTrendDelta > 0 ? '+' : ''}${dqaTrendDelta}pp vs prev FY`}
                        sx={{
                          fontWeight: 700,
                          bgcolor: dqaTone === 'success' ? '#dcfce7' : dqaTone === 'danger' ? '#fee2e2' : '#f1f5f9',
                          color:   dqaTone === 'success' ? '#15803d' : dqaTone === 'danger' ? '#b91c1c' : '#475569',
                        }}
                      />
                    )}
                  </Stack>
                  <Box sx={{ flex: 1, minHeight: 160 }}>
                    <ResponsiveContainer>
                      <LineChart data={dqaTrend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                        <XAxis dataKey="fy" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <RTooltip />
                        <ReferenceLine y={85} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '85% target', position: 'right', fontSize: 10, fill: '#94a3b8' }} />
                        <Line type="monotone" dataKey="passRate" stroke="#0891b2" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RAG donut */}
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ borderRadius: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <PanelHeader icon={ScienceIcon} title="Portfolio RAG" subtitle="All studies in scope." />
              {ragTotal === 0 ? (
                <Typography variant="body2" color="text.secondary">No studies yet.</Typography>
              ) : (
                <>
                  <Box sx={{ position: 'relative', flex: 1, minHeight: 160 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={ragData} dataKey="value" innerRadius={48} outerRadius={72} startAngle={90} endAngle={-270} paddingAngle={1}>
                          {ragData.map((d) => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: RAG_COLORS.green }}>{ragGreenPct}%</Typography>
                      <Typography variant="caption" color="text.secondary">on track</Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5} sx={{ mt: 1, justifyContent: 'center' }}>
                    {ragData.map((d) => (
                      <Stack key={d.name} direction="row" spacing={0.5} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: d.color }} />
                        <Typography variant="caption" color="text.secondary">{d.name} {d.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* SERU expiry watchlist */}
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Card variant="outlined" sx={{ borderRadius: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <PanelHeader
                icon={WarningIcon}
                title="SERU expiry watchlist"
                subtitle="Within the next 60 days."
                actionLabel={seruExpiring.length > 0 ? 'See all' : null}
                onAction={() => navigate('/operations-dashboard')}
              />
              {seruExpiring.length === 0 ? (
                <Box sx={{ flex: 1, textAlign: 'center', py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <CelebrateIcon sx={{ fontSize: 32, color: '#16a34a', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>All SERU approvals current.</Typography>
                  <Typography variant="caption" color="text.secondary">No renewals due within 60 days.</Typography>
                </Box>
              ) : (
                <Stack spacing={1} sx={{ flex: 1 }}>
                  {seruExpiring.slice(0, 3).map((row) => (
                    <Box
                      key={row.projectId}
                      onClick={() => navigate(`/kemri/studies/${row.projectId}`)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        p: 1, borderRadius: 1, cursor: 'pointer',
                        border: '1px solid', borderColor: 'divider',
                        '&:hover': { borderColor: '#dc2626' },
                      }}
                    >
                      <Box sx={{
                        minWidth: 44, textAlign: 'center', py: 0.5, px: 0.5, borderRadius: 1,
                        bgcolor: row.daysToExpiry <= 14 ? '#fee2e2' : row.daysToExpiry <= 30 ? '#fef3c7' : '#f1f5f9',
                        color:   row.daysToExpiry <= 14 ? '#b91c1c' : row.daysToExpiry <= 30 ? '#a16207' : '#475569',
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{row.daysToExpiry}</Typography>
                        <Typography variant="caption" sx={{ fontSize: 9 }}>days</Typography>
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }} noWrap>{row.kimesProjectId}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{row.title}</Typography>
                      </Box>
                    </Box>
                  ))}
                  {seruExpiring.length > 3 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      onClick={() => navigate('/operations-dashboard')}
                      sx={{ display: 'block', textAlign: 'center', cursor: 'pointer', mt: 0.5, '&:hover': { color: 'primary.main' } }}
                    >
                      +{seruExpiring.length - 3} more in operations dashboard →
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============= QUICK ACTIONS ============= */}
      <Box sx={{ mb: 1.5 }}>
        <PanelHeader
          icon={ChecklistIcon}
          title="Jump to a module"
          subtitle="Eight workspaces covering the full KEMRI research lifecycle."
        />
      </Box>
      <Grid container spacing={1.5}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={action.key}>
              <Card
                variant="outlined"
                onClick={() => navigate(action.to)}
                sx={{
                  cursor: 'pointer', borderRadius: 2, height: '100%',
                  transition: 'all .18s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(0,90,154,0.12)',
                    borderColor: action.color,
                  },
                }}
              >
                <CardContent sx={{ pb: '12px !important' }}>
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.75 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${action.color}1A`, color: action.color,
                    }}>
                      <Icon />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: action.color }}>
                      {action.title}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 38 }}>
                    {action.blurb}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ opacity: 0.75 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <KemriIcon sx={{ fontSize: 16, color: '#64748b' }} />
          <Typography variant="caption" color="text.secondary">
            Concurrent reporting to donors, KEMRI management and the Board — one verified record, three audiences.
          </Typography>
        </Stack>
        {lastRun && (
          <Typography variant="caption" color="text.secondary">
            Workflow engine last tick: {fmtAgo(lastRun.ranAt)} · cadence every 6 hours.
          </Typography>
        )}
      </Stack>
    </Container>
  );
}
