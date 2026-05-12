/**
 * KIMES AI Reporting Engine — Catalog & Time Savings (KIMES v5 §10.2 / §9.10).
 *
 * Surfaces the eleven AI-produced report types that the KIMES AI Reporting
 * Engine generates from a single verified data record, with manual vs AI hours
 * and the mandatory human sign-off chain per report.  The catalog is fetched
 * from /api/kemri/ai-reports/catalog so the source of truth stays in one
 * place (the route).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, CircularProgress, Container,
    Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { AutoAwesome as AiIcon, BoltRounded as BoltIcon, TimerOutlined as TimerIcon } from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip,
    CartesianGrid, LabelList, Legend,
} from 'recharts';
import kemriService from '../api/kemriService';

const fmtH = (n) => `${Number(n || 0)} h`;

export default function KemriAiReportsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        kemriService.getAiReportsCatalog()
            .then((d) => { if (!cancelled) setData(d); })
            .catch((e) => { if (!cancelled) setError(e?.response?.data?.message || e.message || 'Failed to load AI reports'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const chart = useMemo(() => (
        (data?.reports || []).map((r) => ({
            code: r.code,
            name: r.name,
            Manual: r.manualHours,
            AI: r.aiHours,
            saving: r.savingPct,
        }))
    ), [data]);

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Card elevation={0} sx={{
                mb: 3, borderRadius: 3, color: 'white',
                background: 'linear-gradient(135deg, #6a1b9a 0%, #7c3aed 60%, #1d4ed8 100%)',
            }}>
                <CardContent sx={{ py: { xs: 2.5, md: 3 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AiIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>KIMES v5 · §10.2</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>AI Reporting Engine catalog</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.92 }}>
                                Eleven report types auto-drafted by the KIMES AI from a single verified KIMES data record. Human sign-off mandatory for all.
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

            {!loading && data && (
                <>
                    {/* KPI strip */}
                    <Grid container spacing={1.5} sx={{ mb: 3 }}>
                        <Grid item xs={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="overline" sx={{ color: 'text.secondary' }}>Report types</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1d4ed8' }}>{data.reports.length}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="overline" sx={{ color: 'text.secondary' }}>Manual hours / cycle</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#dc2626' }}>{fmtH(data.manualHoursTotal)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="overline" sx={{ color: 'text.secondary' }}>AI-assisted hours</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#16a34a' }}>{fmtH(data.aiHoursTotal)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="overline" sx={{ color: 'text.secondary' }}>Average saving</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#7c3aed' }}>{data.averageSavingPct}%</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Time savings chart */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <BoltIcon sx={{ color: '#7c3aed' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Manual vs AI-assisted production time (per report type)</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Hours per cycle (lower is better). Sourced from KIMES v5 §9.10 / §10.2 institutional value-for-money report.
                        </Typography>
                        <Box sx={{ height: 380 }}>
                            <ResponsiveContainer>
                                <BarChart data={chart} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} unit="h" />
                                    <RTooltip
                                        formatter={(v, key) => [fmtH(v), key]}
                                        labelFormatter={(code) => chart.find((r) => r.code === code)?.name || code}
                                    />
                                    <Legend />
                                    <Bar dataKey="Manual" fill="#dc2626">
                                        <LabelList dataKey="saving" position="top" formatter={(v) => `-${v}%`} style={{ fontSize: 10, fill: '#16a34a', fontWeight: 700 }} />
                                    </Bar>
                                    <Bar dataKey="AI" fill="#16a34a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>

                    {/* Detailed catalog */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <TimerIcon sx={{ color: '#0e7490' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Report types & sign-off chain</Typography>
                        </Stack>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Code</TableCell>
                                        <TableCell>Report</TableCell>
                                        <TableCell>Audience</TableCell>
                                        <TableCell align="right">Manual (h)</TableCell>
                                        <TableCell align="right">AI (h)</TableCell>
                                        <TableCell align="right">Saving</TableCell>
                                        <TableCell>Mandatory sign-off</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.reports.map((r) => (
                                        <TableRow key={r.code} hover>
                                            <TableCell><Chip size="small" label={r.code} sx={{ fontWeight: 800 }} /></TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                                            </TableCell>
                                            <TableCell><Typography variant="caption" color="text.secondary">{r.audience}</Typography></TableCell>
                                            <TableCell align="right" sx={{ color: '#dc2626' }}>{r.manualHours}</TableCell>
                                            <TableCell align="right" sx={{ color: '#16a34a', fontWeight: 700 }}>{r.aiHours}</TableCell>
                                            <TableCell align="right">
                                                <Chip size="small" color="success" label={`-${r.savingPct}%`} variant="outlined" />
                                            </TableCell>
                                            <TableCell><Typography variant="caption">{r.signOff}</Typography></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </>
            )}
        </Container>
    );
}
