/**
 * KEMRI Strategic Plan 2023-2027 — Alignment & Key Achievements
 * -------------------------------------------------------------
 * One page that surfaces:
 *   1. Plan header (vision/mission/theme/strategic goal/core values)
 *   2. Six KRAs as accordion cards, each expanding to its strategic objectives
 *   3. Per-objective rollup: linked projects, FY-this-year achievements,
 *      Year-1..5 targets vs current FY's expected target, and a quick-add
 *      "key achievement" dialog.
 *   4. Top-of-page summary chart of projects-per-KRA.
 *
 * The page reads from /api/kemri/strategic-plan/active which already returns
 * an enriched tree (KRAs -> objectives + rollups). Achievements are recorded
 * via POST /api/kemri/strategic-plan/achievements.
 *
 * KIMES v5 §8.3 alignment: this is the institute-wide equivalent of the
 * Board Quarterly Scorecard's strategic-plan progress band.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog,
  DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel,
  LinearProgress, MenuItem, Paper, Select, Stack, TextField, Typography,
  Accordion, AccordionSummary, AccordionDetails, Tooltip, Divider,
} from '@mui/material';
import {
  AccountTree as PlanIcon,
  Add as AddIcon,
  Article as PublicationIcon,
  AutoAwesome as IpIcon,
  ChevronRight as ChevronRightIcon,
  EmojiEvents as AchievementIcon,
  ExpandMore as ExpandMoreIcon,
  Flag as MilestoneIcon,
  Group as CapacityIcon,
  Insights as InsightsIcon,
  Link as LinkIcon,
  Map as PolicyIcon,
  Refresh as RefreshIcon,
  Storage as DatasetIcon,
  Workspaces as PartnershipIcon,
  EventNote as EventIcon,
  Engineering as InfrastructureIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
  Cell,
} from 'recharts';
import kemriService from '../api/kemriService';
import { KEMRI_MENU_PROPS_WIDE } from '../utils/kemriFormat';
import { ROUTES } from '../configs/appConfig';

// Icons keyed to achievement_type for consistent visual language.
const TYPE_META = {
  publication:    { icon: PublicationIcon,    label: 'Publication',      color: '#1565c0' },
  ip:             { icon: IpIcon,             label: 'IP / Patent',      color: '#ef6c00' },
  dataset:        { icon: DatasetIcon,        label: 'Dataset',          color: '#00838f' },
  policy:         { icon: PolicyIcon,         label: 'Policy / Uptake',  color: '#2e7d32' },
  capacity:       { icon: CapacityIcon,       label: 'Capacity',         color: '#6a1b9a' },
  event:          { icon: EventIcon,          label: 'Event / Conference', color: '#ad1457' },
  partnership:    { icon: PartnershipIcon,    label: 'Partnership',      color: '#4527a0' },
  infrastructure: { icon: InfrastructureIcon, label: 'Infrastructure',   color: '#37474f' },
  milestone:      { icon: MilestoneIcon,      label: 'Milestone',        color: '#5d4037' },
  other:          { icon: AchievementIcon,    label: 'Other',            color: '#455a64' },
};
const TYPE_KEYS = Object.keys(TYPE_META);

const fmtMoney = (n) => {
  const v = Number(n || 0);
  if (v >= 1e9) return `KES ${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `KES ${(v / 1e6).toFixed(1)}M`;
  return `KES ${v.toLocaleString()}`;
};

function AchievementIconChip({ type }) {
  const meta = TYPE_META[type] || TYPE_META.other;
  const Icon = meta.icon;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ color: 'inherit !important', fontSize: '1rem' }} />}
      label={meta.label}
      sx={{ bgcolor: `${meta.color}22`, color: meta.color, fontWeight: 600, '& .MuiChip-icon': { color: meta.color } }}
    />
  );
}

export default function KemriStrategicPlanPage() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  // Add-achievement dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogObj, setDialogObj] = useState(null);
  const [form, setForm] = useState({
    achievementType: 'publication', title: '', narrative: '',
    valueNumeric: '', valueUnit: '', evidenceUrl: '',
    contributionPct: '', projectId: '', achievedOn: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true); setError(null);
    try {
      const data = await kemriService.getActiveStrategicPlan();
      setTree(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    kemriService.listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  const openAdd = (objective) => {
    setDialogObj(objective);
    setForm({
      achievementType: 'publication', title: '', narrative: '',
      valueNumeric: '', valueUnit: '', evidenceUrl: '',
      contributionPct: '', projectId: '', achievedOn: '',
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.title || !form.achievementType) {
      setError('Title and achievement type are required'); return;
    }
    setSubmitting(true);
    try {
      await kemriService.createStrategicAchievement({
        objectiveId: dialogObj.id,
        achievementType: form.achievementType,
        title: form.title,
        narrative: form.narrative || null,
        valueNumeric: form.valueNumeric || null,
        valueUnit: form.valueUnit || null,
        evidenceUrl: form.evidenceUrl || null,
        contributionPct: form.contributionPct || null,
        projectId: form.projectId || null,
        achievedOn: form.achievedOn || null,
      });
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const portfolioBar = useMemo(() => {
    if (!tree) return [];
    return tree.kras.map((k) => ({
      kra: k.code,
      kraLabel: k.code,
      projects: k.totals.projects,
      outputs: k.totals.outputs,
      achievements: k.totals.achievements,
      budget: k.totals.budget,
      fill: { KRA1: '#1E40AF', KRA2: '#A16207', KRA3: '#0F766E',
              KRA4: '#0EA5E9', KRA5: '#7C3AED', KRA6: '#475569' }[k.code] || '#64748B',
    }));
  }, [tree]);

  if (loading && !tree) {
    return <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  }
  if (error && !tree) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }
  if (!tree) return null;
  const { plan, kras } = tree;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{
          bgcolor: '#1E3A8A', color: 'white',
          width: 52, height: 52, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PlanIcon fontSize="medium" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            KEMRI Strategic Plan 2023&ndash;2027
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {plan.name} · {plan.theme}
          </Typography>
        </Box>
        <Chip color="primary" variant="outlined" label={`Plan Year ${plan.planYear}/5`} sx={{ fontWeight: 700 }} />
        <Chip color="info" variant="outlined" label={`${plan.currentFy} ${plan.currentQuarter}`} sx={{ fontWeight: 700 }} />
        <IconButton onClick={refresh}>{loading ? <CircularProgress size={20} /> : <RefreshIcon />}</IconButton>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}

      {/* Vision/Mission/Goal */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#F8FAFC' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Vision</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>{plan.vision}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Mission</Typography>
            <Typography variant="body2" sx={{ mt: 0.25 }}>{plan.mission}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Strategic Goal</Typography>
            <Typography variant="body2" sx={{ mt: 0.25 }}>{plan.strategicGoal}</Typography>
            {plan.coreValues ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                <b>PRICE</b> · {plan.coreValues}
              </Typography>
            ) : null}
          </Grid>
        </Grid>
      </Paper>

      {/* Portfolio bar */}
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Portfolio Alignment — Active Projects per KRA
            </Typography>
            <Chip
              size="small"
              icon={<InsightsIcon />}
              label={`${kras.reduce((a, k) => a + k.totals.achievements, 0)} achievements logged`}
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Box sx={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={portfolioBar} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="kra" />
                <YAxis allowDecimals={false} />
                <RTooltip
                  formatter={(v, name) => (name === 'budget' ? fmtMoney(v) : v)}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar dataKey="projects" name="Active projects" radius={[6, 6, 0, 0]}>
                  {portfolioBar.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
                <Bar dataKey="achievements" name="Achievements logged" radius={[6, 6, 0, 0]} fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* KRAs */}
      <Stack spacing={1.5}>
        {kras.map((k) => {
          const color = { KRA1: '#1E40AF', KRA2: '#A16207', KRA3: '#0F766E',
                          KRA4: '#0EA5E9', KRA5: '#7C3AED', KRA6: '#475569' }[k.code] || '#64748B';
          return (
            <Accordion
              key={k.id}
              defaultExpanded={k.code === 'KRA1'}
              variant="outlined"
              sx={{ borderRadius: 2, '&:before': { display: 'none' }, borderLeft: `4px solid ${color}` }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{
                    bgcolor: color, color: 'white', width: 36, height: 36, borderRadius: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>{k.code}</Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {k.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {k.description?.slice(0, 130)}{k.description?.length > 130 ? '…' : ''}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75} sx={{ ml: 'auto', flexShrink: 0 }}>
                    <Chip size="small" variant="outlined" label={`${k.totals.projects} projects`} />
                    <Chip size="small" variant="outlined" label={`${k.totals.outputs} outputs`} />
                    <Chip size="small" variant="outlined" label={`${k.totals.achievements} achievements`} />
                    <Chip size="small" variant="outlined" label={fmtMoney(k.totals.budget)} />
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={1.5}>
                  {k.objectives.map((o) => {
                    const target5y = o.yr5 || '—';
                    const currentTarget = o.targetThisYear || '—';
                    const achPct = o.achievementCount > 0 ? Math.min(100, o.achievementsThisFy * 25) : 0;
                    return (
                      <Grid item xs={12} md={6} key={o.id}>
                        <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                  <Chip size="small" label={o.code} sx={{ bgcolor: color, color: 'white', fontWeight: 700 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Unit: {o.unit || '—'}
                                  </Typography>
                                </Stack>
                                <Typography
                                  component={RouterLink}
                                  to={ROUTES.KEMRI_STRATEGIC_OBJECTIVE.replace(':id', o.id)}
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                                >
                                  {o.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  <b>KPI:</b> {o.kpi || '—'}
                                </Typography>
                              </Box>
                              <Tooltip title="Record a key achievement against this objective">
                                <IconButton size="small" color="primary" onClick={() => openAdd(o)}>
                                  <AddIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            <Divider sx={{ my: 1 }} />

                            <Grid container spacing={1}>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Baseline</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{o.baseline || '—'}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">Yr {plan.planYear} target</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{currentTarget}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">5-yr target</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{target5y}</Typography>
                              </Grid>
                            </Grid>

                            <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }} flexWrap="wrap">
                              <Chip size="small" variant="outlined" label={`${o.projectCount} linked project${o.projectCount === 1 ? '' : 's'}`} />
                              <Chip size="small" variant="outlined" label={`${o.outputCount} output${o.outputCount === 1 ? '' : 's'}`} />
                              <Chip size="small" color={o.achievementsThisFy > 0 ? 'primary' : 'default'} variant={o.achievementsThisFy > 0 ? 'filled' : 'outlined'} label={`${o.achievementsThisFy} this FY`} />
                              <Chip size="small" variant="outlined" label={fmtMoney(o.totalBudget)} />
                            </Stack>

                            <Box sx={{ mt: 1.25 }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                  Year-{plan.planYear} achievements (cap 4)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{Math.min(o.achievementsThisFy, 4)}/4</Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={achPct}
                                sx={{
                                  height: 6, borderRadius: 3, mt: 0.5,
                                  bgcolor: '#E5E7EB',
                                  '& .MuiLinearProgress-bar': { bgcolor: color },
                                }}
                              />
                            </Box>

                            <Button
                              size="small"
                              endIcon={<ChevronRightIcon />}
                              component={RouterLink}
                              to={ROUTES.KEMRI_STRATEGIC_OBJECTIVE.replace(':id', o.id)}
                              sx={{ mt: 1, textTransform: 'none' }}
                            >
                              View linked projects & achievements
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>

      {/* Add Achievement Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Record a key achievement
          {dialogObj ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {dialogObj.code}: {dialogObj.name}
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Achievement type</InputLabel>
                <Select
                  value={form.achievementType}
                  label="Achievement type"
                  onChange={(e) => setForm((f) => ({ ...f, achievementType: e.target.value }))}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                >
                  {TYPE_KEYS.map((t) => (
                    <MenuItem key={t} value={t}>{TYPE_META[t].label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth size="small" label="Title" required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth size="small" label="Narrative / context" multiline minRows={2}
                value={form.narrative}
                onChange={(e) => setForm((f) => ({ ...f, narrative: e.target.value }))}
                placeholder="What was achieved? Who benefited? Why does it matter for the strategic objective?"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth size="small" label="Value (numeric)"
                type="number" inputProps={{ step: 'any' }}
                value={form.valueNumeric}
                onChange={(e) => setForm((f) => ({ ...f, valueNumeric: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth size="small" label="Value unit"
                value={form.valueUnit}
                onChange={(e) => setForm((f) => ({ ...f, valueUnit: e.target.value }))}
                placeholder="e.g. graduates, KES, studies"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth size="small" label="Contribution %" type="number"
                inputProps={{ min: 0, max: 100 }}
                value={form.contributionPct}
                onChange={(e) => setForm((f) => ({ ...f, contributionPct: e.target.value }))}
                helperText="% of plan KPI met"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth size="small" label="Achieved on" type="date"
                InputLabelProps={{ shrink: true }}
                value={form.achievedOn}
                onChange={(e) => setForm((f) => ({ ...f, achievedOn: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Linked research project</InputLabel>
                <Select
                  value={form.projectId}
                  label="Linked research project"
                  onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                >
                  <MenuItem value=""><em>None (institute-level)</em></MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.kimesProjectId} — {p.title?.slice(0, 60)}{p.title?.length > 60 ? '…' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Evidence URL"
                value={form.evidenceUrl}
                onChange={(e) => setForm((f) => ({ ...f, evidenceUrl: e.target.value }))}
                placeholder="DOI, news link, board paper…"
                InputProps={{ startAdornment: <LinkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} /> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AchievementIcon />}
          >
            Record achievement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Side-effect: export the icon chip for reuse in the detail page.
export { AchievementIconChip };
