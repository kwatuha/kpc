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
  AttachMoney as MoneyIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  GroupWork as GroupIcon,
  HelpOutline as HelpIcon,
  History as HistoryIcon,
  Map as MapIcon,
  MenuBook as MenuBookIcon,
  OpenInNew as OpenInNewIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Stars as StarsIcon,
  TaskAlt as TaskAltIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import kemriService from '../api/kemriService';
import { ROUTES } from '../configs/appConfig';
import {
  KEMRI_MENU_PROPS as _MENU,
  formatCurrency,
  formatPercent,
  humanise,
  ragMeta,
} from '../utils/kemriFormat';

/* -------------------------------------------------------------------------- */

const RAG_HEX = { green: '#16A34A', amber: '#D97706', red: '#DC2626', pending: '#6B7280' };

const PROG_HEX = ['#1E3A8A', '#0E7490', '#7C3AED', '#16A34A', '#D97706', '#9333EA', '#0891B2', '#DC2626'];

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** A small KPI tile with icon, label, value and optional caption. */
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
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: `${color}1A`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
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
      <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
        {title}
      </Typography>
      {action || null}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */

export default function KemriExecutiveDashboardPage() {
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

  const ragRows = useMemo(() => {
    const r = data?.ragSummary || {};
    return [
      { name: 'Green',   key: 'green',   value: toNum(r.green),   color: RAG_HEX.green },
      { name: 'Amber',   key: 'amber',   value: toNum(r.amber),   color: RAG_HEX.amber },
      { name: 'Red',     key: 'red',     value: toNum(r.red),     color: RAG_HEX.red },
      { name: 'Pending', key: 'pending', value: toNum(r.pending), color: RAG_HEX.pending },
    ];
  }, [data]);

  const centreBars = useMemo(() => {
    return (data?.byCentre || [])
      .filter((c) => toNum(c.studyCount) > 0)
      .map((c) => ({
        centre: c.centreCode,
        name:   c.centreName,
        studies: toNum(c.studyCount),
        sites:   toNum(c.siteCount),
        funding: toNum(c.fundingTotal),
      }));
  }, [data]);

  const donorBars = useMemo(() => {
    return (data?.byDonor || []).map((d) => ({
      donor: d.donorName?.replace(/Foundation|Bill & Melinda Gates/i, (m) => m.replace('Foundation','Fdn')) || '—',
      currency: d.currency || 'KES',
      studies: toNum(d.studyCount),
      funding: toNum(d.fundingTotal),
    }));
  }, [data]);

  const outputsBars = useMemo(() => {
    return (data?.outputsByType || []).map((o) => ({
      type: humanise(o.outputType),
      n:    toNum(o.n),
      impact: toNum(o.avgImpact),
      citations: toNum(o.citations),
    }));
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading KEMRI executive dashboard…</Typography>
      </Box>
    );
  }

  const p = data?.portfolio || {};
  const dqaPctFy = (data?.reportsByFy || []).map((f) => ({
    fy: f.fyLabel,
    pct: f.reportCount > 0 ? Math.round((toNum(f.dqaPassed) / toNum(f.reportCount)) * 100) : 0,
    avg: toNum(f.avgDqaScore),
  }));

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, pb: 2 }}>
      {/* header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1.5,
              bgcolor: 'primary.main', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ScienceIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              KEMRI Executive Summary
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Whole-portfolio view for the Director General, Board and donor stewardship reviews
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" variant="outlined" component={RouterLink} to="/operations-dashboard" startIcon={<TaskAltIcon />}>
            Operations
          </Button>
          <Button size="small" variant="outlined" component={RouterLink} to="/finance-dashboard" startIcon={<MoneyIcon />}>
            Finance
          </Button>
          <Button size="small" variant="outlined" component={RouterLink} to={ROUTES.GIS_DASHBOARD} startIcon={<MapIcon />}>
            National GIS
          </Button>
          <Tooltip title="Refresh dashboard">
            <IconButton size="small" onClick={load}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>{error}</Alert>}

      {/* KPI strip */}
      <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiTile icon={ScienceIcon}   label="Studies"        value={p.studies || 0}        caption={`${p.activeStudies || 0} active · ${p.preStudies || 0} pre-study · ${p.closingStudies || 0} closing`} color="#1E3A8A" to={ROUTES.KEMRI_STUDIES} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiTile icon={MapIcon}        label="Research sites" value={p.sites || 0}          caption="Across Kenya" color="#0E7490" to={ROUTES.GIS_DASHBOARD} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiTile icon={GroupIcon}      label="Research staff" value={p.staff || 0}          caption="Funded posts on KEMRI grants" color="#7C3AED" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiTile icon={MenuBookIcon}   label="Research outputs" value={p.outputs || 0}      caption="Pubs, datasets, briefs, IP" color="#EA580C" to={ROUTES.KEMRI_OUTPUT_REGISTRY} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiTile icon={CheckIcon}      label="Reports accepted" value={p.reportsAccepted || 0} caption={`${p.reports || 0} total · ${p.reportsAwaitingReview || 0} pending review`} color="#16A34A" to={ROUTES.KEMRI_REVIEW_QUEUE} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiTile icon={WarningIcon}    label="Open escalations" value={p.openEscalations || 0} caption="L1 → L4 ladder" color="#DC2626" to={ROUTES.KEMRI_ESCALATIONS} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        {/* RAG donut */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={BoltIcon} title="Portfolio RAG" />
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={ragRows} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {ragRows.map((r) => <Cell key={r.key} fill={r.color} />)}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="center">
              {ragRows.map((r) => (
                <Chip
                  key={r.key}
                  size="small"
                  label={`${r.name}: ${r.value}`}
                  sx={{ bgcolor: `${r.color}22`, color: r.color, fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Funding by currency */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={MoneyIcon} title="Active funding by currency" />
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              {(data?.byCurrency || []).map((c) => {
                const ratio = toNum(c.activeFunding) / Math.max(1, toNum(c.fundingTotal));
                return (
                  <Box key={c.currency}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {c.currency} · {c.studyCount} stud{c.studyCount === 1 ? 'y' : 'ies'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatCurrency(c.activeFunding, c.currency, { compact: true })}
                      </Typography>
                    </Stack>
                    <Tooltip title={`Active ${formatCurrency(c.activeFunding, c.currency)} of total ${formatCurrency(c.fundingTotal, c.currency)} (${formatPercent(ratio * 100, { fractionDigits: 0 })})`}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, ratio * 100))}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(c.fundingTotal, c.currency, { compact: true })} total · {formatPercent(ratio * 100, { fractionDigits: 0 })} active
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* DQA pass rate by FY */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={TaskAltIcon} title="DQA pass rate by FY" />
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={dqaPctFy} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                  <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <RTooltip formatter={(v, k) => k === 'pct' ? [`${v}%`, 'Pass rate'] : [v, 'Avg DQA']} />
                  <Bar dataKey="pct" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Studies by KEMRI Centre */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={ScienceIcon} title="Studies by KEMRI Centre" />
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={centreBars} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="centre" tick={{ fontSize: 11 }} width={70} />
                  <RTooltip
                    formatter={(v, k, item) => [v, k === 'studies' ? 'Studies' : 'Sites']}
                    labelFormatter={(l) => {
                      const c = centreBars.find((c) => c.centre === l);
                      return c?.name || l;
                    }}
                  />
                  <Bar dataKey="studies" stackId="a" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Outputs by type */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle
              icon={MenuBookIcon}
              title="Research outputs by type"
              action={
                <Button size="small" variant="text" component={RouterLink} to={ROUTES.KEMRI_OUTPUT_REGISTRY} endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}>
                  Output registry
                </Button>
              }
            />
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={outputsBars} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Bar dataKey="n" fill="#EA580C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {outputsBars.map((o) => (
                <Chip
                  key={o.type}
                  size="small"
                  label={`${o.type}: ${o.n}${o.impact ? ` · IF ${o.impact.toFixed(1)}` : ''}`}
                  variant="outlined"
                  sx={{ borderColor: '#EA580C55', color: '#9A3412', fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Top PIs leaderboard */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={StarsIcon} title="Top PIs by site footprint" />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>PI</TableCell>
                  <TableCell align="right">Studies</TableCell>
                  <TableCell align="right">Sites</TableCell>
                  <TableCell align="right">Funding led (USD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.topPiBySites || []).map((pi) => (
                  <TableRow key={pi.piUserId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{pi.piName}</TableCell>
                    <TableCell align="right">{pi.studyCount}</TableCell>
                    <TableCell align="right">{pi.siteCount}</TableCell>
                    <TableCell align="right">{formatCurrency(pi.fundingLed, 'USD', { compact: true })}</TableCell>
                  </TableRow>
                ))}
                {(!data?.topPiBySites?.length) && (
                  <TableRow><TableCell colSpan={4}><Typography variant="caption" color="text.secondary">No data.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Top donors */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={MoneyIcon} title="Top donors by study count" />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Donor</TableCell>
                  <TableCell align="right">Studies</TableCell>
                  <TableCell align="right">Funding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.byDonor || []).map((d) => (
                  <TableRow key={`${d.donorId}-${d.currency}`} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {d.donorName}
                      {d.donorCountry ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{d.donorCountry}</Typography>
                      ) : null}
                    </TableCell>
                    <TableCell align="right">{d.studyCount}</TableCell>
                    <TableCell align="right">{formatCurrency(d.fundingTotal, d.currency, { compact: true })}</TableCell>
                  </TableRow>
                ))}
                {(!data?.byDonor?.length) && (
                  <TableRow><TableCell colSpan={3}><Typography variant="caption" color="text.secondary">No data.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Programme area distribution */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={PublicIcon} title="Programme area distribution" />
            <Stack spacing={0.75}>
              {(data?.byProgrammeArea || []).map((p, i) => {
                const max = Math.max(...(data?.byProgrammeArea || []).map((x) => toNum(x.studyCount)), 1);
                const pct = (toNum(p.studyCount) / max) * 100;
                const hex = PROG_HEX[i % PROG_HEX.length];
                return (
                  <Box key={p.programmeArea}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.programmeArea}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.studyCount} stud{p.studyCount === 1 ? 'y' : 'ies'}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8, borderRadius: 1,
                        bgcolor: `${hex}22`,
                        '& .MuiLinearProgress-bar': { bgcolor: hex },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Recent reports activity */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle
              icon={HistoryIcon}
              title="Recent quarterly reports"
              action={
                <Button size="small" variant="text" component={RouterLink} to={ROUTES.KEMRI_REVIEW_QUEUE} endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}>
                  Review queue
                </Button>
              }
            />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Study</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">DQA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentReports || []).slice(0, 8).map((r) => {
                  const meta = ragMeta(r.ragStatus);
                  return (
                    <TableRow key={r.reportId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {r.projectShortName || r.kimesProjectId}
                        {r.centreCode ? <Chip size="small" label={r.centreCode} sx={{ ml: 0.75, height: 18 }} /> : null}
                      </TableCell>
                      <TableCell>{r.fyLabel} · {r.quarter}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={humanise(r.status)}
                          sx={{ bgcolor: `${meta.hex}22`, color: meta.hex, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: r.dqaPassed ? 'success.main' : 'error.main' }}>
                        {r.dqaScore != null ? `${Number(r.dqaScore).toFixed(1)}` : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!data?.recentReports?.length) && (
                  <TableRow><TableCell colSpan={4}><Typography variant="caption" color="text.secondary">No reports yet.</Typography></TableCell></TableRow>
                )}
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
          <Chip clickable component={RouterLink} to="/operations-dashboard"     icon={<TaskAltIcon />}    label="Operations dashboard"  variant="outlined" />
          <Chip clickable component={RouterLink} to="/finance-dashboard"        icon={<MoneyIcon />}      label="Finance dashboard"     variant="outlined" />
          <Chip clickable component={RouterLink} to={ROUTES.GIS_DASHBOARD}      icon={<MapIcon />}        label="National GIS dashboard" variant="outlined" />
          <Chip clickable component={RouterLink} to={ROUTES.KEMRI_REVIEW_QUEUE} icon={<ErrorIcon />}      label="Centre Director review queue" variant="outlined" />
          <Chip clickable component={RouterLink} to="/help-support"             icon={<HelpIcon />}       label="Help & support"        variant="outlined" />
        </Stack>
      </Stack>
    </Box>
  );
}
