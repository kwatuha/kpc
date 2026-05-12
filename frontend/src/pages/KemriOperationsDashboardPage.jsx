import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
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
  AccessTime as ClockIcon,
  AssignmentLate as AssignmentLateIcon,
  AutoMode as AutoModeIcon,
  Bolt as BoltIcon,
  EventAvailable as EventIcon,
  FactCheck as FactCheckIcon,
  Gavel as GavelIcon,
  HelpOutline as HelpIcon,
  History as HistoryIcon,
  HourglassTop as HourglassIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  TaskAlt as TaskAltIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import kemriService from '../api/kemriService';
import { ROUTES } from '../configs/appConfig';
import { humanise, ragMeta } from '../utils/kemriFormat';

/* -------------------------------------------------------------------------- */

const RAG_HEX = { green: '#16A34A', amber: '#D97706', red: '#DC2626', pending: '#6B7280' };

const ESCALATION_HEX = {
  L1: '#FBBF24', // amber 400 — minor
  L2: '#F97316', // orange 500 — moderate
  L3: '#DC2626', // red 600 — significant
  L4: '#7F1D1D', // red 900 — severe
  L5: '#0F172A', // slate 900 — institutional (centre-wide)
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function KpiTile({ icon: Icon, label, value, caption, color = '#1E3A8A', to }) {
  const inner = (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: '100%',
        cursor: to ? 'pointer' : 'default',
        transition: 'box-shadow 120ms ease, transform 120ms ease',
        '&:hover': to ? { boxShadow: 4, transform: 'translateY(-1px)' } : undefined,
        borderLeft: '4px solid',
        borderLeftColor: color,
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15, color }}>
              {value}
            </Typography>
            {caption ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.15 }}>
                {caption}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
  return to ? <Box component={RouterLink} to={to} sx={{ textDecoration: 'none' }}>{inner}</Box> : inner;
}

function PanelTitle({ icon: Icon, title, action }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      {Icon ? <Icon color="primary" /> : null}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>{title}</Typography>
      {action || null}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */

export default function KemriOperationsDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const d = await kemriService.getDashboardSummary();
      setData(d);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const escalationBars = useMemo(() => {
    const e = data?.escalationByLevel || {};
    return [
      { level: 'L1', n: toNum(e.L1), color: ESCALATION_HEX.L1, label: 'Minor — automated reminder' },
      { level: 'L2', n: toNum(e.L2), color: ESCALATION_HEX.L2, label: 'Moderate — MEL Head formal notice' },
      { level: 'L3', n: toNum(e.L3), color: ESCALATION_HEX.L3, label: 'Significant — Centre Director intervention' },
      { level: 'L4', n: toNum(e.L4), color: ESCALATION_HEX.L4, label: 'Severe — DG formal letter (DG-NCF-001)' },
      { level: 'L5', n: toNum(e.L5), color: ESCALATION_HEX.L5, label: 'Institutional — Board directive, centre-wide' },
    ];
  }, [data]);

  // Funnel rows: widest at the top ("compliant & on track"), narrowing as
  // severity rises. Compliant = total active projects minus rows in any level.
  const escalationFunnel = useMemo(() => {
    const totals = escalationBars.map((b) => b.n);
    const totalActive = toNum(data?.portfolio?.activeProjects || data?.portfolio?.totalProjects || 0);
    const totalInLevels = totals.reduce((a, b) => a + b, 0);
    const compliant = Math.max(0, totalActive - totalInLevels);
    const max = Math.max(compliant, ...totals, 1);
    return [
      { stage: 'Compliant & on track', n: compliant, color: '#16A34A', pct: Math.round((compliant / max) * 100) },
      ...escalationBars.map((b) => ({ stage: b.level, label: b.label, n: b.n, color: b.color, pct: Math.round((b.n / max) * 100) })),
    ];
  }, [escalationBars, data]);

  const fyTrend = useMemo(() => {
    return (data?.reportsByFy || []).map((r) => ({
      fy: r.fyLabel,
      reports: toNum(r.reportCount),
      avgDqa: toNum(r.avgDqaScore),
      green: toNum(r.green),
      amber: toNum(r.amber),
      red:   toNum(r.red),
    }));
  }, [data]);

  const lifecycleBars = useMemo(() => {
    return (data?.byStatus || []).map((r) => ({
      status: humanise(r.status),
      n: toNum(r.n),
    }));
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading KEMRI operations dashboard…</Typography>
      </Box>
    );
  }

  const p = data?.portfolio || {};
  const dqaPct = p.reports ? Math.round(((toNum(data?.reportsByFy?.[data.reportsByFy.length - 1]?.dqaPassed) || 0) / Math.max(1, toNum(data?.reportsByFy?.[data.reportsByFy.length - 1]?.reportCount))) * 100) : 0;
  const totalEscalations = Object.values(data?.escalationByLevel || {}).reduce((a, b) => a + toNum(b), 0);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, pb: 2 }}>
      {/* header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#6a1b9a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FactCheckIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              KEMRI Operations Dashboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Live operational signals for Centre Directors and the MEL team — review queue, DQA, escalations, SERU expiry
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" variant="outlined" component={RouterLink} to="/summary-statistics" startIcon={<ScienceIcon />}>
            Executive
          </Button>
          <Button size="small" variant="contained" component={RouterLink} to={ROUTES.KEMRI_REVIEW_QUEUE} startIcon={<FactCheckIcon />}>
            Open review queue
          </Button>
          <Tooltip title="Refresh dashboard">
            <IconButton size="small" onClick={load}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>{error}</Alert>}

      {/* operational KPI strip */}
      <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile
            icon={HourglassIcon}
            label="Awaiting review"
            value={p.reportsAwaitingReview || 0}
            caption="Reports pending Centre Director sign-off"
            color="#6a1b9a"
            to={ROUTES.KEMRI_REVIEW_QUEUE}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={WarningIcon} label="Open escalations" value={totalEscalations} caption="Across L1 – L5 ladder (KIMES v5 §7.1)" color="#DC2626" to={ROUTES.KEMRI_ESCALATIONS} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={GavelIcon} label="SERU expiring (≤90d)" value={(data?.seruExpiring || []).length} caption="Active studies needing renewal" color="#EA580C" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={AssignmentLateIcon} label="Reports returned" value={p.reportsReturned || 0} caption="DQA failures awaiting fix" color="#B91C1C" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={VerifiedIcon} label="Latest DQA pass rate" value={`${dqaPct}%`} caption="Most-recent FY" color="#16A34A" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={TaskAltIcon} label="Reports accepted" value={p.reportsAccepted || 0} caption="Cumulative" color="#0E7490" to={ROUTES.KEMRI_REVIEW_QUEUE} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        {/* Non-Conformity Escalation Funnel (KIMES v5 §9.9) */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={BoltIcon} title="Non-conformity escalation funnel" />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Six bands: compliant projects at the top, narrowing through L1 → L5 (institutional).
            </Typography>
            <Box sx={{ p: 0.5 }}>
              {escalationFunnel.map((row) => (
                <Box
                  key={row.stage}
                  component={RouterLink}
                  to={ROUTES.KEMRI_ESCALATIONS}
                  sx={{
                    display: 'block', textDecoration: 'none',
                    mx: 'auto', my: 0.5,
                    width: `${Math.max(28, row.pct)}%`,
                    bgcolor: row.color, color: 'white',
                    px: 1, py: 0.75, borderRadius: 1,
                    transition: 'transform .15s, filter .15s',
                    '&:hover': { transform: 'translateY(-1px)', filter: 'brightness(1.08)' },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'white' }} noWrap>
                      {row.stage}{row.label ? ` — ${row.label}` : ''}
                    </Typography>
                    <Chip size="small" label={row.n} sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: 'white', fontWeight: 800, height: 20 }} />
                  </Stack>
                </Box>
              ))}
            </Box>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mt: 1 }}>
              {escalationBars.map((b) => (
                <Tooltip key={b.level} title={b.label}>
                  <Chip size="small" label={`${b.level}: ${b.n}`} sx={{ bgcolor: `${b.color}22`, color: b.color, fontWeight: 700 }} />
                </Tooltip>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* DQA score trend */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={AutoModeIcon} title="DQA score trend & RAG mix per FY" />
            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={fyTrend} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <RTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="green" stackId="rag" fill={RAG_HEX.green} name="Green" />
                  <Bar yAxisId="left" dataKey="amber" stackId="rag" fill={RAG_HEX.amber} name="Amber" />
                  <Bar yAxisId="left" dataKey="red"   stackId="rag" fill={RAG_HEX.red}   name="Red"   />
                  <Line yAxisId="right" type="monotone" dataKey="avgDqa" stroke="#1E3A8A" strokeWidth={2} dot={{ r: 4 }} name="Avg DQA score" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* SERU expiring */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={GavelIcon} title="SERU approvals expiring within 90 days" />
            {(data?.seruExpiring || []).length === 0 ? (
              <Alert severity="success" sx={{ mt: 1 }} icon={<TaskAltIcon />}>
                No SERU expiry risks in the next 90 days.
              </Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Study</TableCell>
                    <TableCell>SERU #</TableCell>
                    <TableCell align="right">Expires</TableCell>
                    <TableCell align="right">Days left</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.seruExpiring || []).map((s) => {
                    const days = toNum(s.daysToExpiry);
                    const tone = days <= 14 ? 'error' : days <= 45 ? 'warning' : 'info';
                    return (
                      <TableRow key={s.projectId} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <RouterLink to={`/kemri/studies/${s.projectId}`} style={{ color: 'inherit' }}>
                            {s.shortName || s.kimesProjectId}
                          </RouterLink>
                          {s.centreCode ? <Chip size="small" label={s.centreCode} sx={{ ml: 0.75, height: 18 }} /> : null}
                        </TableCell>
                        <TableCell>{s.seruApprovalNo || '—'}</TableCell>
                        <TableCell align="right">{s.seruExpiryDate ? new Date(s.seruExpiryDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={`${days >= 0 ? days : `+${Math.abs(days)}`}d ${days >= 0 ? 'left' : 'past'}`}
                            color={tone}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        {/* Lifecycle status */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={EventIcon} title="Study lifecycle distribution" />
            <Stack spacing={1}>
              {lifecycleBars.map((row) => {
                const max = Math.max(...lifecycleBars.map((x) => x.n), 1);
                const pct = (row.n / max) * 100;
                return (
                  <Box key={row.status}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.status}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.n} stud{row.n === 1 ? 'y' : 'ies'}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 1 }} />
                  </Box>
                );
              })}
              {lifecycleBars.length === 0 && <Typography variant="caption" color="text.secondary">No data.</Typography>}
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip size="small" component={RouterLink} clickable to={ROUTES.KEMRI_STUDIES} icon={<ScienceIcon />} label="Studies registry" variant="outlined" />
              <Chip size="small" component={RouterLink} clickable to={ROUTES.KEMRI_STUDY_NEW} icon={<TaskAltIcon />} label="Register a new study" variant="outlined" />
            </Stack>
          </Paper>
        </Grid>

        {/* Recent reports + per-centre RAG split */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle
              icon={HistoryIcon}
              title="Recent quarterly reports"
              action={
                <Button size="small" variant="text" component={RouterLink} to={ROUTES.KEMRI_REVIEW_QUEUE}>
                  Open queue
                </Button>
              }
            />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Study</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>RAG</TableCell>
                  <TableCell align="right">DQA</TableCell>
                  <TableCell align="right">Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentReports || []).map((r) => {
                  const meta = ragMeta(r.ragStatus);
                  return (
                    <TableRow key={r.reportId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <RouterLink to={`/kemri/studies/${r.projectId}`} style={{ color: 'inherit' }}>
                          {r.projectShortName || r.kimesProjectId}
                        </RouterLink>
                        {r.centreCode ? <Chip size="small" label={r.centreCode} sx={{ ml: 0.75, height: 18 }} /> : null}
                      </TableCell>
                      <TableCell>{r.fyLabel} · {r.quarter}</TableCell>
                      <TableCell>
                        <Chip size="small" label={humanise(r.status)} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={humanise(r.ragStatus || 'pending')}
                          sx={{ bgcolor: `${meta.hex}22`, color: meta.hex, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: r.dqaPassed ? 'success.main' : 'error.main' }}>
                        {r.dqaScore != null ? Number(r.dqaScore).toFixed(1) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="text.secondary">
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!(data?.recentReports || []).length && (
                  <TableRow><TableCell colSpan={6}><Typography variant="caption" color="text.secondary">No reports yet.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Per-centre RAG */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={ScienceIcon} title="Per-centre RAG split" />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Centre</TableCell>
                  <TableCell align="right">Studies</TableCell>
                  <TableCell align="right">RAG</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.byCentre || []).filter((c) => toNum(c.studyCount) > 0).map((c) => (
                  <TableRow key={c.centreCode} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {c.centreCode}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{c.centreName}</Typography>
                    </TableCell>
                    <TableCell align="right">{c.studyCount}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {c.green   ? <Chip size="small" label={c.green}   sx={{ bgcolor: `${RAG_HEX.green}22`,   color: RAG_HEX.green,   fontWeight: 700, height: 22 }} /> : null}
                        {c.amber   ? <Chip size="small" label={c.amber}   sx={{ bgcolor: `${RAG_HEX.amber}22`,   color: RAG_HEX.amber,   fontWeight: 700, height: 22 }} /> : null}
                        {c.red     ? <Chip size="small" label={c.red}     sx={{ bgcolor: `${RAG_HEX.red}22`,     color: RAG_HEX.red,     fontWeight: 700, height: 22 }} /> : null}
                        {c.pending ? <Chip size="small" label={c.pending} sx={{ bgcolor: `${RAG_HEX.pending}22`, color: RAG_HEX.pending, fontWeight: 700, height: 22 }} /> : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Related dashboards */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary">
          Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}.
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip clickable component={RouterLink} to="/summary-statistics" icon={<ScienceIcon />} label="Executive summary" variant="outlined" />
          <Chip clickable component={RouterLink} to="/finance-dashboard"  icon={<HistoryIcon />} label="Finance dashboard" variant="outlined" />
          <Chip clickable component={RouterLink} to={ROUTES.GIS_DASHBOARD} icon={<MapIcon />} label="National GIS dashboard" variant="outlined" />
          <Chip clickable component={RouterLink} to="/help-support"        icon={<HelpIcon />} label="Help & support" variant="outlined" />
        </Stack>
      </Stack>
    </Box>
  );
}
