import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Article as OutputIcon,
  Assignment as ReportIcon,
} from '@mui/icons-material';
import kemriService from '../api/kemriService';
import { ragMeta, humanise } from '../utils/kemriFormat';

const RAG_COLOR = {
  green: ragMeta('green').hex,
  amber: ragMeta('amber').hex,
  red: ragMeta('red').hex,
  pending: ragMeta('pending').hex,
};

export default function PIDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ projects: [], ragSummary: [], outputCount: 0, upcomingDeadlines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kemriService.getPiDashboard();
      setData(res || { projects: [] });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{
          bgcolor: 'primary.main', color: 'white',
          width: 48, height: 48, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PersonIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            PI Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your active research studies, KPI progress, RAG status, upcoming reporting actions and outputs.
          </Typography>
        </Box>
        <IconButton onClick={refresh}>{loading ? <CircularProgress size={20} /> : <RefreshIcon />}</IconButton>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScienceIcon color="primary" />
                <Typography variant="overline" color="text.secondary">My active studies</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>
                {data.projects?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">RAG distribution across my studies</Typography>
              <Box sx={{ mt: 1.5 }}>
                {(data.ragSummary || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No active studies yet.</Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {data.ragSummary.map((r) => {
                      const total = data.ragSummary.reduce((a, x) => a + Number(x.n || 0), 0) || 1;
                      const pct = Math.round((Number(r.n) / total) * 100);
                      const key = (r.rag || 'pending').toLowerCase();
                      return (
                        <Box key={key}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                              {key} · {r.n}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate" value={pct}
                            sx={{
                              height: 8, borderRadius: 999, bgcolor: 'rgba(0,0,0,0.06)',
                              '& .MuiLinearProgress-bar': { bgcolor: RAG_COLOR[key], borderRadius: 999 },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <OutputIcon color="warning" />
                <Typography variant="overline" color="text.secondary">My research outputs</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>
                {data.outputCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Publications, abstracts, datasets, IP & policy briefs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>My studies</Typography>
              {(data.projects || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  You have no active studies in KIMES yet.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {data.projects.map((p) => (
                    <Card
                      key={p.id} variant="outlined"
                      sx={{
                        borderRadius: 2, cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                      onClick={() => navigate(`/kemri/studies/${p.id}`)}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                {p.kimesProjectId}
                              </Typography>
                              <Chip
                                size="small"
                                label={(p.ragStatus || 'pending').toUpperCase()}
                                sx={{
                                  bgcolor: `${RAG_COLOR[(p.ragStatus || 'pending').toLowerCase()]}20`,
                                  color: RAG_COLOR[(p.ragStatus || 'pending').toLowerCase()],
                                  fontWeight: 700,
                                }}
                              />
                              <Chip size="small" variant="outlined" label={humanise(p.status)} />
                            </Stack>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.25 }} noWrap>
                              {p.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {p.centreName || 'Centre TBD'} · {p.primaryDonorName || 'Donor TBD'}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <ReportIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Reporting actions</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                Drafts, DQA-returned, and queried quarterly reports needing your input.
              </Typography>
              {(data.upcomingDeadlines || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  All caught up. New reports will appear here at D-30, D-14, and D-7 before each quarter end.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {data.upcomingDeadlines.map((row) => (
                    <Card
                      key={row.id} variant="outlined"
                      sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: 'warning.main' } }}
                    >
                      <CardContent sx={{ py: 1.25 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {row.kimesProjectId} · {row.fyLabel} {row.quarter}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.projectTitle}
                            </Typography>
                          </Box>
                          <Chip size="small" label={row.status} color="warning" />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
