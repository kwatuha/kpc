/**
 * KEMRI Strategic Objective detail page
 * --------------------------------------
 * Drill-down for one strategic objective (subprogram in the plan tables):
 *   - KPI / baseline / Year 1..5 targets at a glance
 *   - All research projects linked to this objective (with primary flag)
 *   - All key achievements timeline (auto-derived + manually recorded)
 *   - Inline "Add achievement" for fast capture during M&E review
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton,
  InputLabel, LinearProgress, MenuItem, Paper, Select, Stack, TextField, Typography,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon, Add as AddIcon, Delete as DeleteIcon, Link as LinkIcon,
  EmojiEvents as AchievementIcon, OpenInNew as OpenIcon, AutoMode as AutoIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import kemriService from '../api/kemriService';
import { KEMRI_MENU_PROPS_WIDE } from '../utils/kemriFormat';
import { ROUTES } from '../configs/appConfig';
import { AchievementIconChip } from './KemriStrategicPlanPage';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtMoney = (n) => {
  const v = Number(n || 0);
  if (v >= 1e9) return `KES ${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `KES ${(v / 1e6).toFixed(1)}M`;
  return `KES ${v.toLocaleString()}`;
};

const TYPE_KEYS = ['publication', 'ip', 'dataset', 'policy', 'capacity', 'event', 'partnership', 'infrastructure', 'milestone', 'other'];

export default function KemriStrategicObjectivePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    achievementType: 'publication', title: '', narrative: '',
    valueNumeric: '', valueUnit: '', evidenceUrl: '',
    contributionPct: '', projectId: '', achievedOn: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true); setError(null);
    try { setData(await kemriService.getStrategicObjective(id)); }
    catch (err) { setError(err?.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    refresh();
    kemriService.listProjects().then(setProjects).catch(() => setProjects([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async () => {
    if (!form.title) { setError('Title is required'); return; }
    setSubmitting(true);
    try {
      await kemriService.createStrategicAchievement({
        objectiveId: id,
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
      setForm({ achievementType: 'publication', title: '', narrative: '', valueNumeric: '', valueUnit: '', evidenceUrl: '', contributionPct: '', projectId: '', achievedOn: '' });
      await refresh();
    } catch (err) { setError(err?.response?.data?.message || err.message); }
    finally { setSubmitting(false); }
  };

  const remove = async (achId) => {
    if (!window.confirm('Remove this achievement?')) return;
    try { await kemriService.removeStrategicAchievement(achId); await refresh(); }
    catch (err) { setError(err?.response?.data?.message || err.message); }
  };

  // Group achievements by FY for a clean timeline
  const byFy = useMemo(() => {
    const m = {};
    (data?.achievements || []).forEach((a) => {
      const k = a.fyLabel || 'Undated';
      if (!m[k]) m[k] = [];
      m[k].push(a);
    });
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [data]);

  if (loading && !data) {
    return <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  }
  if (error && !data) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }
  if (!data) return null;
  const { objective, projects: linkedProjects, achievements } = data;
  const targets5 = [objective.yr1, objective.yr2, objective.yr3, objective.yr4, objective.yr5];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <IconButton onClick={() => nav(ROUTES.KEMRI_STRATEGIC_PLAN)}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip size="small" label={objective.code} color="primary" sx={{ fontWeight: 700 }} />
            <Chip size="small" variant="outlined" label={objective.kraCode} />
            <Typography variant="caption" color="text.secondary">{objective.kraName}</Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {objective.name}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Record achievement
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}

      {/* KPI strip */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Indicator</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{objective.kpi}</Typography>
        <Typography variant="caption" color="text.secondary">Unit: {objective.unit || '—'}</Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Baseline (FY2022/23)</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{objective.baseline || '—'}</Typography>
          </Grid>
          {targets5.map((t, i) => (
            <Grid item xs={6} sm={2} key={i}>
              <Typography variant="caption" color="text.secondary">Y{i + 1} target (FY{2023 + i}/{String(2024 + i).slice(2)})</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: i === 0 ? 'primary.main' : 'text.primary' }}>{t || '—'}</Typography>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip size="small" variant="outlined" label={`5-year budget ${fmtMoney(objective.totalBudget)}`} />
          {objective.keyOutcome ? (
            <Tooltip title={objective.keyOutcome}>
              <Chip size="small" variant="outlined" label="Key outcome (hover)" />
            </Tooltip>
          ) : null}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {/* Linked projects */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Linked research projects ({linkedProjects.length})
                </Typography>
              </Stack>
              {linkedProjects.length === 0 ? (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5 }}>
                  No research projects are currently linked to this objective.
                  Open a project and pick this objective on the registration form to align it.
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {linkedProjects.map((p) => (
                    <Card
                      key={p.id}
                      component={RouterLink}
                      to={`/kemri/studies/${p.id}`}
                      variant="outlined"
                      sx={{
                        textDecoration: 'none',
                        borderRadius: 1.5,
                        '&:hover': { borderColor: 'primary.main', bgcolor: '#F8FAFC' },
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {p.kimesProjectId}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.title}</Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                              {p.isPrimary ? <Chip size="small" color="primary" label="PRIMARY" /> : null}
                              {p.status ? <Chip size="small" variant="outlined" label={p.status} /> : null}
                              {p.ragStatus ? <Chip size="small" variant="outlined" label={`RAG: ${p.ragStatus}`} /> : null}
                            </Stack>
                          </Box>
                          <OpenIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements timeline */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Key achievements ({achievements.length})
                </Typography>
                <Chip size="small" icon={<AchievementIcon />} label={`${achievements.filter(a => a.autoGenerated).length} auto-derived`} variant="outlined" />
              </Stack>
              {achievements.length === 0 ? (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5 }}>
                  No achievements recorded for this objective yet. Click <b>Record achievement</b> above to capture the first one.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {byFy.map(([fy, list]) => (
                    <Box key={fy}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                        {fy}
                      </Typography>
                      <Stack spacing={1}>
                        {list.map((a) => (
                          <Card key={a.id} variant="outlined" sx={{ borderRadius: 1.5 }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Stack direction="row" alignItems="flex-start" spacing={1}>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                    <AchievementIconChip type={a.achievementType} />
                                    {a.autoGenerated ? (
                                      <Tooltip title="Auto-derived by KIMES from outputs/milestones">
                                        <Chip size="small" icon={<AutoIcon sx={{ fontSize: '0.9rem !important' }} />} label="auto" variant="outlined" />
                                      </Tooltip>
                                    ) : null}
                                    {a.kimesProjectId ? (
                                      <Tooltip title={a.projectTitle}>
                                        <Chip size="small" variant="outlined" component={RouterLink} to={`/kemri/studies/${a.projectId}`} label={a.kimesProjectId} sx={{ cursor: 'pointer', textDecoration: 'none' }} clickable />
                                      </Tooltip>
                                    ) : null}
                                    {a.contributionPct != null ? (
                                      <Chip size="small" color="primary" variant="outlined" label={`${a.contributionPct}% of KPI`} />
                                    ) : null}
                                  </Stack>
                                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{a.title}</Typography>
                                  {a.narrative ? (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                      {a.narrative}
                                    </Typography>
                                  ) : null}
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} alignItems="center" flexWrap="wrap">
                                    <Typography variant="caption" color="text.secondary">
                                      <b>{fmtDate(a.achievedOn || a.createdAt)}</b>
                                    </Typography>
                                    {a.valueNumeric != null ? (
                                      <Typography variant="caption" color="text.secondary">
                                        Value: <b>{Number(a.valueNumeric)}</b> {a.valueUnit}
                                      </Typography>
                                    ) : null}
                                    {a.evidenceUrl ? (
                                      <Typography variant="caption" component="a" href={a.evidenceUrl} target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>
                                        <LinkIcon sx={{ fontSize: '0.85rem', verticalAlign: 'middle' }} /> evidence
                                      </Typography>
                                    ) : null}
                                  </Stack>
                                </Box>
                                {a.autoGenerated ? null : (
                                  <IconButton size="small" onClick={() => remove(a.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add-achievement dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Record a key achievement
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {objective.code}: {objective.name}
          </Typography>
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
                    <MenuItem key={t} value={t}>{t}</MenuItem>
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
                fullWidth size="small" label="Narrative" multiline minRows={2}
                value={form.narrative}
                onChange={(e) => setForm((f) => ({ ...f, narrative: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Value (numeric)" type="number"
                inputProps={{ step: 'any' }}
                value={form.valueNumeric}
                onChange={(e) => setForm((f) => ({ ...f, valueNumeric: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Value unit"
                value={form.valueUnit}
                onChange={(e) => setForm((f) => ({ ...f, valueUnit: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Contribution %" type="number"
                inputProps={{ min: 0, max: 100 }}
                value={form.contributionPct}
                onChange={(e) => setForm((f) => ({ ...f, contributionPct: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Achieved on" type="date"
                InputLabelProps={{ shrink: true }}
                value={form.achievedOn}
                onChange={(e) => setForm((f) => ({ ...f, achievedOn: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Linked project (optional)</InputLabel>
                <Select
                  value={form.projectId}
                  label="Linked project (optional)"
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
              <TextField fullWidth size="small" label="Evidence URL"
                value={form.evidenceUrl}
                onChange={(e) => setForm((f) => ({ ...f, evidenceUrl: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AchievementIcon />}>
            Record achievement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
