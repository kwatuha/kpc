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
  AccountBalanceWallet as WalletIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  HelpOutline as HelpIcon,
  History as HistoryIcon,
  Map as MapIcon,
  PriceCheck as PriceCheckIcon,
  Refresh as RefreshIcon,
  Savings as SavingsIcon,
  Science as ScienceIcon,
  ShowChart as ShowChartIcon,
  TaskAlt as TaskAltIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import kemriService from '../api/kemriService';
import { ROUTES } from '../configs/appConfig';
import { formatCurrency, formatPercent, humanise } from '../utils/kemriFormat';

/* -------------------------------------------------------------------------- */

const CURRENCY_HEX = {
  USD: '#1E3A8A',
  GBP: '#7C3AED',
  EUR: '#0E7490',
  KES: '#16A34A',
  CHF: '#DC2626',
  JPY: '#EA580C',
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

export default function KemriFinanceDashboardPage() {
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

  const fyTrend = useMemo(() => {
    return (data?.reportsByFy || []).map((r) => ({
      fy: r.fyLabel,
      budget: toNum(r.budgetTotal),
      received: toNum(r.fundsReceived),
      expenditure: toNum(r.expenditure),
      reports: toNum(r.reportCount),
      burn: toNum(r.budgetTotal) > 0 ? Math.round((toNum(r.expenditure) / toNum(r.budgetTotal)) * 100) : 0,
    }));
  }, [data]);

  const currencyDonut = useMemo(() => {
    return (data?.byCurrency || []).map((c) => ({
      currency: c.currency,
      n: toNum(c.studyCount),
      total: toNum(c.fundingTotal),
      active: toNum(c.activeFunding),
      color: CURRENCY_HEX[c.currency] || '#475569',
    }));
  }, [data]);

  const centreFundingBars = useMemo(() => {
    return (data?.byCentre || [])
      .filter((c) => toNum(c.fundingTotal) > 0)
      .map((c) => ({
        centre: c.centreCode,
        name: c.centreName,
        funding: toNum(c.fundingTotal),
        studies: toNum(c.studyCount),
      }))
      .sort((a, b) => b.funding - a.funding);
  }, [data]);

  const donorTable = useMemo(() => {
    return [...(data?.byDonor || [])].sort((a, b) => toNum(b.fundingTotal) - toNum(a.fundingTotal));
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading KEMRI finance dashboard…</Typography>
      </Box>
    );
  }

  const usd = (data?.byCurrency || []).find((c) => c.currency === 'USD');
  const gbp = (data?.byCurrency || []).find((c) => c.currency === 'GBP');
  const eur = (data?.byCurrency || []).find((c) => c.currency === 'EUR');

  const lastFy = (data?.reportsByFy || []).slice(-1)[0] || {};
  const overallBurn = toNum(lastFy.budgetTotal) > 0 ? (toNum(lastFy.expenditure) / toNum(lastFy.budgetTotal)) * 100 : 0;
  const overallReceived = toNum(lastFy.budgetTotal) > 0 ? (toNum(lastFy.fundsReceived) / toNum(lastFy.budgetTotal)) * 100 : 0;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, pb: 2 }}>
      {/* header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#16A34A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MoneyIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              KEMRI Finance Dashboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Donor portfolio, currency mix, burn-rate and budget utilisation across all KEMRI research grants
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" variant="outlined" component={RouterLink} to="/summary-statistics" startIcon={<ScienceIcon />}>
            Executive
          </Button>
          <Button size="small" variant="outlined" component={RouterLink} to="/operations-dashboard" startIcon={<TaskAltIcon />}>
            Operations
          </Button>
          <Tooltip title="Refresh dashboard">
            <IconButton size="small" onClick={load}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>{error}</Alert>}

      <Alert severity="info" icon={<MoneyIcon fontSize="small" />} sx={{ mb: 1.5 }}>
        Funding totals are reported <strong>per currency</strong> with no FX conversion. KEMRI multi-currency reporting follows MoH/Treasury guidance — convert to KES only for IFMIS submissions.
      </Alert>

      {/* KPI strip */}
      <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={MoneyIcon}     label="Active funding (USD)" value={formatCurrency(usd?.activeFunding || 0, 'USD', { compact: true })} caption={`${usd?.studyCount || 0} studies`} color={CURRENCY_HEX.USD} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={MoneyIcon}     label="Active funding (GBP)" value={formatCurrency(gbp?.activeFunding || 0, 'GBP', { compact: true })} caption={`${gbp?.studyCount || 0} studies`} color={CURRENCY_HEX.GBP} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={MoneyIcon}     label="Active funding (EUR)" value={formatCurrency(eur?.activeFunding || 0, 'EUR', { compact: true })} caption={`${eur?.studyCount || 0} studies`} color={CURRENCY_HEX.EUR} />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={WalletIcon}    label="Funds received (latest FY)" value={formatCurrency(lastFy.fundsReceived || 0, 'USD', { compact: true })} caption={lastFy.fyLabel || '—'} color="#7C3AED" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={ShowChartIcon} label="Expenditure (latest FY)"   value={formatCurrency(lastFy.expenditure || 0, 'USD', { compact: true })} caption={`${formatPercent(overallBurn, { fractionDigits: 0 })} of budget`} color="#DC2626" />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <KpiTile icon={SavingsIcon}   label="Funds received vs budget"  value={`${formatPercent(overallReceived, { fractionDigits: 0 })}`} caption={lastFy.fyLabel || '—'} color="#16A34A" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        {/* Currency donut */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={PriceCheckIcon} title="Funding by currency" />
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={currencyDonut} dataKey="active" nameKey="currency" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {currencyDonut.map((c) => <Cell key={c.currency} fill={c.color} />)}
                  </Pie>
                  <RTooltip
                    formatter={(v, _k, item) => [formatCurrency(v, item?.payload?.currency, { compact: true }), 'Active']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="center">
              {currencyDonut.map((c) => (
                <Tooltip key={c.currency} title={`${c.n} stud${c.n === 1 ? 'y' : 'ies'} · ${formatCurrency(c.total, c.currency)} total`}>
                  <Chip
                    size="small"
                    label={`${c.currency}: ${formatCurrency(c.active, c.currency, { compact: true })}`}
                    sx={{ bgcolor: `${c.color}22`, color: c.color, fontWeight: 700 }}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Burn-rate trend */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={TrendingUpIcon} title="Funds received vs expenditure (per FY)" />
            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={fyTrend} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 120]} tick={{ fontSize: 11 }} unit="%" />
                  <RTooltip formatter={(v, k) => k === 'burn' ? [`${v}%`, 'Burn rate'] : [formatCurrency(v, 'USD', { compact: true }), humanise(k)]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="received"    fill="#16A34A" radius={[4, 4, 0, 0]} name="Funds received" />
                  <Bar yAxisId="left" dataKey="expenditure" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Expenditure" />
                  <Line yAxisId="right" type="monotone" dataKey="burn" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} name="Burn %" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Funding by centre */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={ScienceIcon} title="Funding by KEMRI Centre" />
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={centreFundingBars} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="centre" tick={{ fontSize: 11 }} width={70} />
                  <RTooltip
                    formatter={(v) => [formatCurrency(v, 'USD', { compact: true }), 'Funding']}
                    labelFormatter={(l) => {
                      const c = centreFundingBars.find((c) => c.centre === l);
                      return c?.name || l;
                    }}
                  />
                  <Bar dataKey="funding" fill="#16A34A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Donor concentration */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
            <PanelTitle icon={WalletIcon} title="Donor concentration (sorted by funding)" />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Donor</TableCell>
                  <TableCell align="right">Studies</TableCell>
                  <TableCell align="right">Funding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donorTable.map((d) => {
                  const total = donorTable.reduce((a, b) => a + toNum(b.fundingTotal), 0);
                  const pct = total > 0 ? (toNum(d.fundingTotal) / total) * 100 : 0;
                  return (
                    <TableRow key={`${d.donorId}-${d.currency}`} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.donorName}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.donorCountry}</Typography>
                      </TableCell>
                      <TableCell align="right">{d.studyCount}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(d.fundingTotal, d.currency, { compact: true })}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, pct)}
                          sx={{ height: 4, borderRadius: 1, mt: 0.25 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!donorTable.length && (
                  <TableRow><TableCell colSpan={3}><Typography variant="caption" color="text.secondary">No donors recorded.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Recent reports financial snapshot */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <PanelTitle
              icon={HistoryIcon}
              title="Recent financial milestone reports"
              action={
                <Button size="small" variant="text" component={RouterLink} to={ROUTES.KEMRI_REVIEW_QUEUE}>
                  Open review queue
                </Button>
              }
            />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Study</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Budget</TableCell>
                  <TableCell align="right">Expenditure</TableCell>
                  <TableCell align="right">Burn</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentReports || []).map((r) => {
                  const burn = toNum(r.budgetTotal) > 0 ? (toNum(r.expenditure) / toNum(r.budgetTotal)) * 100 : null;
                  const tone = burn === null ? 'default' : burn > 100 ? 'error' : burn > 80 ? 'warning' : 'success';
                  return (
                    <TableRow key={r.reportId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <RouterLink to={`/kemri/studies/${r.projectId}`} style={{ color: 'inherit' }}>
                          {r.projectShortName || r.kimesProjectId}
                        </RouterLink>
                        {r.centreCode ? <Chip size="small" label={r.centreCode} sx={{ ml: 0.75, height: 18 }} /> : null}
                      </TableCell>
                      <TableCell>{r.fyLabel} · {r.quarter}</TableCell>
                      <TableCell align="right">{formatCurrency(r.budgetTotal, r.currency, { compact: true })}</TableCell>
                      <TableCell align="right">{formatCurrency(r.expenditure, r.currency, { compact: true })}</TableCell>
                      <TableCell align="right">
                        {burn === null ? '—' : (
                          <Chip size="small" label={`${burn.toFixed(0)}%`} color={tone} sx={{ fontWeight: 700, height: 22 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={humanise(r.status)} sx={{ fontWeight: 700, height: 22 }} />
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
      </Grid>

      {/* Related dashboards */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary">
          Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}.
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip clickable component={RouterLink} to="/summary-statistics"  icon={<ScienceIcon />}    label="Executive summary"     variant="outlined" />
          <Chip clickable component={RouterLink} to="/operations-dashboard" icon={<TaskAltIcon />}   label="Operations dashboard"  variant="outlined" />
          <Chip clickable component={RouterLink} to={ROUTES.GIS_DASHBOARD}  icon={<MapIcon />}       label="National GIS dashboard" variant="outlined" />
          <Chip clickable component={RouterLink} to="/help-support"         icon={<HelpIcon />}      label="Help & support"        variant="outlined" />
        </Stack>
      </Stack>
    </Box>
  );
}
