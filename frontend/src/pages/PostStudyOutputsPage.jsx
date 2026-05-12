import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  AutoAwesome as OutputsIcon,
  Article as PubIcon,
  Mic as AbstractIcon,
  Storage as DatasetIcon,
  Policy as PolicyIcon,
  Lightbulb as IpIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import kemriService from '../api/kemriService';
import {
  KEMRI_MENU_PROPS,
  KEMRI_MENU_PROPS_WIDE,
} from '../utils/kemriFormat';

const TYPES = [
  { id: 'publication',  label: 'Publications',           icon: PubIcon,    color: '#1565c0' },
  { id: 'abstract',     label: 'Abstracts & Conferences', icon: AbstractIcon, color: '#6a1b9a' },
  { id: 'dataset',      label: 'Datasets (FAIR)',        icon: DatasetIcon, color: '#00838f' },
  { id: 'policy_brief', label: 'Policy Briefs & Uptake', icon: PolicyIcon,  color: '#2e7d32' },
  { id: 'ip_patent',    label: 'IP & Patents',           icon: IpIcon,     color: '#ef6c00' },
];

const ACCESS_LEVELS = ['open', 'restricted', 'controlled'];

/**
 * Status options per output type — keeps the dropdown semantically aligned
 * with the KEMRI Form §8 structure (publications progress through submission,
 * patents through filing/grant, etc.).
 */
const STATUS_OPTIONS_BY_TYPE = {
  publication:  ['submitted', 'accepted', 'published', 'retracted'],
  abstract:     ['submitted', 'accepted', 'presented', 'rejected'],
  dataset:      ['deposited', 'embargoed', 'open', 'restricted'],
  policy_brief: ['drafted', 'released', 'cited', 'adopted'],
  ip_patent:    ['filed', 'examined', 'granted', 'licensed', 'expired'],
};

// KIMES v5 §3 Step 11 — conference taxonomy
const PRESENTATION_TYPES = ['oral', 'poster', 'keynote', 'webinar', 'symposium', 'other'];

const emptyForm = (type) => ({
  outputType: type,
  projectId: '',
  title: '',
  authors: '',
  dateRecorded: '',
  status: '',
  venue: '',
  presentationType: '',
  doi: '',
  pubmedId: '',
  url: '',
  citationCount: '',
  impactFactor: '',
  repository: '',
  accessLevel: '',
  embargoUntil: '',
  fairScore: '',
  fairFindable: '',
  fairAccessible: '',
  fairInteroperable: '',
  fairReusable: '',
  ipType: '',
  patentNumber: '',
  jurisdiction: '',
  commercialisationStage: '',
  patentExpiryDate: '',
  revenueGenerated: '',
  policyAudience: '',
  uptakeScore: '',
});

export default function PostStudyOutputsPage() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm('publication'));
  const [submitting, setSubmitting] = useState(false);
  // KIMES v5 §3 Step 14 — 7-year post-study tracking panel
  const [timelineProjectId, setTimelineProjectId] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const activeType = TYPES[tab];

  useEffect(() => {
    if (!timelineProjectId) { setTimeline(null); return; }
    setTimelineLoading(true);
    kemriService.getProjectOutputTimeline(timelineProjectId)
      .then(setTimeline)
      .catch(() => setTimeline(null))
      .finally(() => setTimelineLoading(false));
  }, [timelineProjectId]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await kemriService.listOutputs({ outputType: activeType.id });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    kemriService.listProjects().then(setProjects).catch(() => setProjects([]));
  }, []);
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [tab]);

  const openAdd = () => {
    setForm(emptyForm(activeType.id));
    setOpen(true);
  };

  const submit = async () => {
    if (!form.projectId || !form.title) {
      setError('Project and title are required');
      return;
    }
    setSubmitting(true);
    try {
      // If the user populated the four FAIR components, auto-sum them into
      // fair_score (overall 0..100, each component 0..25) — per KIMES v5 §3 Step 13.
      const fairParts = [form.fairFindable, form.fairAccessible, form.fairInteroperable, form.fairReusable].map((v) => (v === '' || v == null ? null : Number(v)));
      const fairAuto  = fairParts.every((v) => v != null) ? fairParts.reduce((a, b) => a + b, 0) : null;

      await kemriService.createOutput({
        ...form,
        citationCount: form.citationCount ? Number(form.citationCount) : 0,
        impactFactor: form.impactFactor ? Number(form.impactFactor) : null,
        fairScore: fairAuto != null ? fairAuto : (form.fairScore ? Number(form.fairScore) : null),
        fairFindable:      form.fairFindable      !== '' ? Number(form.fairFindable)      : null,
        fairAccessible:    form.fairAccessible    !== '' ? Number(form.fairAccessible)    : null,
        fairInteroperable: form.fairInteroperable !== '' ? Number(form.fairInteroperable) : null,
        fairReusable:      form.fairReusable      !== '' ? Number(form.fairReusable)      : null,
        presentationType: form.presentationType || null,
        commercialisationStage: form.commercialisationStage ? Number(form.commercialisationStage) : null,
        revenueGenerated: form.revenueGenerated ? Number(form.revenueGenerated) : null,
        uptakeScore: form.uptakeScore ? Number(form.uptakeScore) : null,
        embargoUntil: form.embargoUntil || null,
        patentExpiryDate: form.patentExpiryDate || null,
        dateRecorded: form.dateRecorded || null,
      });
      setOpen(false);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this output?')) return;
    await kemriService.removeOutput(id);
    await refresh();
  };

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const Icon = activeType.icon;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{
          bgcolor: '#ef6c00', color: 'white',
          width: 48, height: 48, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <OutputsIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Post-Study Output Registry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seven-year tracking of KEMRI research impact: publications, abstracts, datasets, policy briefs, IP and patents.
          </Typography>
        </Box>
        <IconButton onClick={refresh}>{loading ? <CircularProgress size={20} /> : <RefreshIcon />}</IconButton>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Log new {activeType.label.split(' ')[0].toLowerCase()}</Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 48,
          },
          '& .Mui-selected': {
            color: activeType.color,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: activeType.color,
            height: 3,
          },
        }}
      >
        {TYPES.map((t) => {
          const TIcon = t.icon;
          return (
            <Tab key={t.id} label={t.label} icon={<TIcon />} iconPosition="start" />
          );
        })}
      </Tabs>

      {/* KIMES v5 §3 Step 14 — 7-year post-study tracking timeline (Year N → N+7) */}
      <Accordion variant="outlined" sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TimelineIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              7-Year Post-Study Tracking Timeline
            </Typography>
            <Chip size="small" label="KIMES v5 §3 Step 14" variant="outlined" />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl size="small" sx={{ mb: 2, minWidth: 320 }}>
            <InputLabel>Project to track</InputLabel>
            <Select
              value={timelineProjectId}
              label="Project to track"
              onChange={(e) => setTimelineProjectId(e.target.value)}
              MenuProps={KEMRI_MENU_PROPS_WIDE}
            >
              <MenuItem value=""><em>Select a project…</em></MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.kimesProjectId} — {p.title?.slice(0, 70)}{p.title?.length > 70 ? '…' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {timelineLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}
          {timeline ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Base closure year (N): <b>{timeline.baseYear}</b> · Current year: <b>{timeline.currentYear}</b>
              </Typography>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {timeline.timeline.map((t) => {
                  const isCurrent = t.year === timeline.currentYear;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={t.year}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderLeftColor: isCurrent ? 'primary.main' : (t.isPast ? 'success.main' : 'grey.400'),
                          opacity: t.isPast || isCurrent ? 1 : 0.85,
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.year}</Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {t.activity}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                            <Chip size="small" label={`${t.total} outputs`} color={t.total > 0 ? 'primary' : 'default'} variant={t.total > 0 ? 'filled' : 'outlined'} />
                            {Object.entries(t.outputsByType).map(([k, v]) => (
                              <Chip key={k} size="small" variant="outlined" label={`${k}:${v}`} />
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (timelineProjectId ? null : (
            <Typography variant="body2" color="text.secondary">
              Select a project above to see its Year N → Year N+7 tracking timeline. Output counts auto-aggregate from this registry; future years are shown to highlight pending milestones (citations, IP, policy uptake).
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>

      {items.length === 0 && !loading ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Icon sx={{ fontSize: 48, color: activeType.color, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No {activeType.label.toLowerCase()} logged yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              KIMES will auto-import publication metadata when you enter a DOI.
            </Typography>
            <Button variant="contained" onClick={openAdd}>Add the first one</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {items.map((it) => (
            <Grid item xs={12} md={6} lg={4} key={it.id}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {it.kimesProjectId}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {it.title}
                      </Typography>
                      {it.authors ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {it.authors}
                        </Typography>
                      ) : null}
                      {it.venue ? (
                        <Typography variant="body2" sx={{ mt: 0.75 }}>{it.venue}</Typography>
                      ) : null}
                      <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap">
                        {it.status ? <Chip size="small" label={it.status} /> : null}
                        {it.doi ? <Chip size="small" variant="outlined" label={`DOI: ${it.doi}`} /> : null}
                        {it.citationCount != null && it.outputType === 'publication' ? (
                          <Chip size="small" label={`${it.citationCount} citations`} />
                        ) : null}
                        {it.impactFactor != null ? <Chip size="small" label={`IF ${it.impactFactor}`} /> : null}
                        {it.fairScore != null ? <Chip size="small" label={`FAIR ${it.fairScore}`} /> : null}
                        {it.uptakeScore != null ? <Chip size="small" label={`Uptake ${it.uptakeScore}/10`} /> : null}
                        {it.commercialisationStage != null ? (
                          <Chip size="small" label={`Stage ${it.commercialisationStage}/10`} />
                        ) : null}
                      </Stack>
                    </Box>
                    <IconButton size="small" onClick={() => remove(it.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Log new {activeType.label.toLowerCase()}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required sx={{ minWidth: 280 }}>
                <InputLabel>Research study</InputLabel>
                <Select
                  label="Research study"
                  value={form.projectId}
                  onChange={setField('projectId')}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                  renderValue={(selectedId) => {
                    if (!selectedId) return <em>Select study</em>;
                    const p = projects.find((x) => String(x.id) === String(selectedId));
                    if (!p) return selectedId;
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>
                          {p.kimesProjectId}
                        </Box>
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          — {p.title}
                        </Box>
                      </Box>
                    );
                  }}
                >
                  <MenuItem value=""><em>Select study</em></MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id} sx={{ display: 'block', py: 1 }}>
                      <Box sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'primary.main' }}>
                        {p.kimesProjectId}
                      </Box>
                      <Box sx={{ fontSize: '0.875rem', whiteSpace: 'normal' }}>{p.title}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required label="Title" value={form.title} onChange={setField('title')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Authors / contributors" value={form.authors} onChange={setField('authors')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.dateRecorded} onChange={setField('dateRecorded')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={setField('status')}
                  MenuProps={KEMRI_MENU_PROPS}
                >
                  <MenuItem value=""><em>Not set</em></MenuItem>
                  {(STATUS_OPTIONS_BY_TYPE[activeType.id] || []).map((s) => (
                    <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {activeType.id === 'publication' || activeType.id === 'abstract' ? (
              <>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth label="Journal / conference" value={form.venue} onChange={setField('venue')} />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth label="DOI" value={form.doi} onChange={setField('doi')} placeholder="10.xxxx/yyyy" />
                </Grid>
                {activeType.id === 'abstract' && (
                  <Grid item xs={6} md={4}>
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
                      <InputLabel>Presentation type</InputLabel>
                      <Select
                        label="Presentation type"
                        value={form.presentationType}
                        onChange={setField('presentationType')}
                        MenuProps={KEMRI_MENU_PROPS}
                      >
                        <MenuItem value=""><em>Not set</em></MenuItem>
                        {PRESENTATION_TYPES.map((p) => (
                          <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={6} md={4}>
                  <TextField fullWidth label="PubMed ID" value={form.pubmedId} onChange={setField('pubmedId')} />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth type="number" label="Citation count" value={form.citationCount} onChange={setField('citationCount')} />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField
                    fullWidth type="number"
                    label="Impact factor"
                    helperText={Number(form.impactFactor) > 5 ? 'IF > 5 — workflow engine will alert Communications + DG.' : ' '}
                    value={form.impactFactor} onChange={setField('impactFactor')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="URL / repository link" value={form.url} onChange={setField('url')} />
                </Grid>
              </>
            ) : null}

            {activeType.id === 'dataset' ? (
              <>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth label="Repository" value={form.repository} onChange={setField('repository')} />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth label="DOI" value={form.doi} onChange={setField('doi')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth sx={{ minWidth: 180 }}>
                    <InputLabel>Access level</InputLabel>
                    <Select
                      label="Access level"
                      value={form.accessLevel}
                      onChange={setField('accessLevel')}
                      MenuProps={KEMRI_MENU_PROPS}
                    >
                      {ACCESS_LEVELS.map((a) => (
                        <MenuItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="date" label="Embargo until" InputLabelProps={{ shrink: true }} value={form.embargoUntil} onChange={setField('embargoUntil')} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    FAIR breakdown (each 0–25; sums to the overall FAIR score) — KIMES v5 §3 Step 13.
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" inputProps={{ min: 0, max: 25 }} label="Findable (0–25)"      value={form.fairFindable}      onChange={setField('fairFindable')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" inputProps={{ min: 0, max: 25 }} label="Accessible (0–25)"    value={form.fairAccessible}    onChange={setField('fairAccessible')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" inputProps={{ min: 0, max: 25 }} label="Interoperable (0–25)" value={form.fairInteroperable} onChange={setField('fairInteroperable')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" inputProps={{ min: 0, max: 25 }} label="Reusable (0–25)"      value={form.fairReusable}      onChange={setField('fairReusable')} />
                </Grid>
              </>
            ) : null}

            {activeType.id === 'policy_brief' ? (
              <>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth label="Audience / issuer" value={form.policyAudience} onChange={setField('policyAudience')} />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth type="number" inputProps={{ step: 0.1, min: 0, max: 10 }} label="Uptake score (0–10)" value={form.uptakeScore} onChange={setField('uptakeScore')} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="URL" value={form.url} onChange={setField('url')} />
                </Grid>
              </>
            ) : null}

            {activeType.id === 'ip_patent' ? (
              <>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth label="IP type" value={form.ipType} onChange={setField('ipType')} placeholder="patent / utility model / trademark" />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth label="Patent number" value={form.patentNumber} onChange={setField('patentNumber')} />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth label="Jurisdiction" value={form.jurisdiction} onChange={setField('jurisdiction')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" inputProps={{ min: 1, max: 10 }} label="Commercialisation stage 1–10" value={form.commercialisationStage} onChange={setField('commercialisationStage')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="date" label="Patent expiry" InputLabelProps={{ shrink: true }} value={form.patentExpiryDate} onChange={setField('patentExpiryDate')} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" label="Revenue generated" value={form.revenueGenerated} onChange={setField('revenueGenerated')} />
                </Grid>
              </>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={submitting || !form.projectId || !form.title}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
