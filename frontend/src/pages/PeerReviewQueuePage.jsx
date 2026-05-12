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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  RuleFolder as ReviewIcon,
  CheckCircle as AcceptIcon,
  HelpOutline as QueryIcon,
  Warning as EscalateIcon,
  Refresh as RefreshIcon,
  TrendingUp as KpiIcon,
} from '@mui/icons-material';
import kemriService from '../api/kemriService';
import {
  KEMRI_MENU_PROPS,
  KEMRI_MENU_PROPS_WIDE,
  formatCurrency,
  formatPercent,
  computeUtilisation,
} from '../utils/kemriFormat';

const RAG_OPTIONS = [
  { value: 'green', label: 'Green — on track', color: '#2e7d32' },
  { value: 'amber', label: 'Amber — minor variance', color: '#ed6c02' },
  { value: 'red',   label: 'Red — significant deviation', color: '#c62828' },
];

const STATUS_COLOR = {
  submitted: 'info',
  under_review: 'info',
  approved: 'success',
  queried: 'warning',
  escalated: 'error',
  dqa_returned: 'warning',
  draft: 'default',
};

export default function PeerReviewQueuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [centres, setCentres] = useState([]);
  const [filterCentre, setFilterCentre] = useState('');

  const [activeReport, setActiveReport] = useState(null);
  const [decision, setDecision] = useState('accept');
  const [ragStatus, setRagStatus] = useState('green');
  const [comments, setComments] = useState('');
  const [queryToPi, setQueryToPi] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { reviewQueue: 'true' };
      if (filterCentre) params.centreId = filterCentre;
      const data = await kemriService.listReports(params);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    kemriService.listCentres().then(setCentres).catch(() => setCentres([]));
  }, []);
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [filterCentre]);

  const openReview = async (row) => {
    setActiveReport(row);
    setDecision('accept');
    setRagStatus('green');
    setComments('');
    setQueryToPi('');
    setFeedback(null);
    try {
      const full = await kemriService.getReport(row.id);
      setActiveReport({ ...row, ...full });
    } catch (err) {
      console.error('Failed to load full report', err);
    }
  };

  const closeReview = () => setActiveReport(null);

  const handleSubmit = async () => {
    if (!activeReport) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await kemriService.reviewReport(activeReport.id, {
        decision,
        ragStatus: decision === 'accept' ? ragStatus : undefined,
        comments,
        queryToPi: decision === 'query' ? queryToPi : undefined,
      });
      setFeedback({ severity: 'success', message: `Decision recorded: ${decision.toUpperCase()}` });
      await refresh();
      setTimeout(closeReview, 900);
    } catch (err) {
      setFeedback({
        severity: 'error',
        message: err?.response?.data?.message || err.message || 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dqaScore = activeReport?.dqa?.overall_score ?? activeReport?.dqaScore ?? null;
  const flaggedFields = useMemo(() => {
    const raw = activeReport?.dqa?.flagged_fields;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch (_) { return []; }
  }, [activeReport]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{
          bgcolor: '#6a1b9a', color: 'white',
          width: 48, height: 48, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ReviewIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Centre Director Review Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            DQA-validated quarterly reports awaiting peer review. Accept with RAG, query the PI, or escalate non-conformity.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Centre</InputLabel>
          <Select
            label="Centre"
            value={filterCentre}
            onChange={(e) => setFilterCentre(e.target.value)}
            MenuProps={KEMRI_MENU_PROPS_WIDE}
          >
            <MenuItem value=""><em>All centres</em></MenuItem>
            {centres.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}>{c.code}</Box>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={refresh}>{loading ? <CircularProgress size={20} /> : <RefreshIcon />}</IconButton>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {reports.length === 0 && !loading ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              No reports awaiting review. As Principal Investigators submit quarterly reports and pass DQA they will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {reports.map((r) => (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Card
                variant="outlined"
                sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => openReview(r)}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {r.kimesProjectId}
                    </Typography>
                    <Chip size="small" label={r.status} color={STATUS_COLOR[r.status] || 'default'} />
                  </Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {r.fyLabel} {r.quarter}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                    {r.projectTitle}
                  </Typography>
                  <Stack direction="row" spacing={2.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">DQA</Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: r.dqaScore != null && Number(r.dqaScore) >= 85 ? 'success.main' : 'text.primary',
                        }}
                      >
                        {r.dqaScore != null ? formatPercent(r.dqaScore) : '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Spent</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(r.expenditureToDate, 'KES', { compact: true })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Submitted</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(activeReport)} onClose={closeReview} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReviewIcon color="primary" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Peer review · {activeReport?.fyLabel} {activeReport?.quarter}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeReport?.kimesProjectId} — {activeReport?.projectTitle}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {activeReport ? (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">DQA score</Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: dqaScore != null && Number(dqaScore) >= 85 ? 'success.main' : 'text.primary',
                    }}
                  >
                    {dqaScore != null ? formatPercent(dqaScore) : '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dqaScore != null && Number(dqaScore) >= 85 ? 'Passed all 8 checks' : 'Below 85% threshold'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Budget total</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(activeReport.budgetTotal, 'KES', { compact: true })}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Spent to date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(activeReport.expenditureToDate, 'KES', { compact: true })}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Utilisation</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {(() => {
                      const u = computeUtilisation(activeReport.expenditureToDate, activeReport.budgetTotal);
                      return u != null ? formatPercent(u, { fractionDigits: 1 }) : '—';
                    })()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">of total budget</Typography>
                </Grid>
              </Grid>

              {activeReport.kpiAchievements?.length ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                    <KpiIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>KPI achievement</Typography>
                  </Stack>
                  <Stack spacing={0.75}>
                    {activeReport.kpiAchievements.map((a) => (
                      <Stack key={a.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ flex: 1, pr: 1 }} noWrap>{a.indicatorName}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {a.actualValue ?? '—'} / {a.targetValue ?? '—'} ({a.achievementPct != null ? `${Number(a.achievementPct).toFixed(0)}%` : '—'})
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              {flaggedFields.length ? (
                <Alert severity="warning">
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    DQA flagged {flaggedFields.length} fields
                  </Typography>
                  <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                    {flaggedFields.slice(0, 6).map((f, i) => (
                      <Box component="li" key={i}>
                        <Typography variant="caption">
                          {f.field}: {f.issue} ({f.severity})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Alert>
              ) : null}

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Decision</Typography>
                <ToggleButtonGroup
                  value={decision} exclusive
                  onChange={(e, v) => v && setDecision(v)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="accept" color="success">
                    <AcceptIcon sx={{ mr: 0.75 }} fontSize="small" /> Accept
                  </ToggleButton>
                  <ToggleButton value="query" color="warning">
                    <QueryIcon sx={{ mr: 0.75 }} fontSize="small" /> Query
                  </ToggleButton>
                  <ToggleButton value="escalate" color="error">
                    <EscalateIcon sx={{ mr: 0.75 }} fontSize="small" /> Escalate
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {decision === 'accept' ? (
                <FormControl fullWidth sx={{ minWidth: 280 }}>
                  <InputLabel>RAG status</InputLabel>
                  <Select
                    label="RAG status"
                    value={ragStatus}
                    onChange={(e) => setRagStatus(e.target.value)}
                    MenuProps={KEMRI_MENU_PROPS}
                  >
                    {RAG_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: o.color }} />
                          <span>{o.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}

              {decision === 'query' ? (
                <TextField
                  fullWidth multiline minRows={3}
                  label="Specific question to PI"
                  value={queryToPi}
                  onChange={(e) => setQueryToPi(e.target.value)}
                />
              ) : null}

              <TextField
                fullWidth multiline minRows={3}
                label="Reviewer comments (visible to PI)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />

              {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeReview}>Cancel</Button>
          <Button
            variant="contained"
            color={decision === 'accept' ? 'success' : decision === 'query' ? 'warning' : 'error'}
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            Submit decision
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
