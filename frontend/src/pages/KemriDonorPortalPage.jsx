/**
 * KIMES Donor Portal — KIMES v5 §5.1 Tier 1.
 *
 * Read-only landing for grant donors. In production this would be served
 * to a separate identity provider with donor-scoped credentials; for the
 * PoC we render a "what donors can see" page from the same dashboard
 * summary endpoint, with a clear access-scope hint so internal users
 * understand what a donor's view looks like.
 *
 * What donors get (per v5 §5.1):
 *   • Live project status (read-only)
 *   • KPI gauges per project
 *   • SERU compliance status
 *   • Budget utilization (annual financial statement, Tier 3)
 *   • Their AI-drafted concurrent quarterly report (Tier 2)
 *
 * What donors DO NOT get:
 *   • Other donors' projects
 *   • Internal escalation logs
 *   • Personal data of staff
 *   • Draft / unapproved AI reports
 */

import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, CircularProgress, Container, Divider,
    Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import {
    AccountBalance as DonorIcon,
    LockOutlined as LockIcon,
    VerifiedOutlined as VerifiedIcon,
} from '@mui/icons-material';
import kemriService from '../api/kemriService';
import { ragMeta } from '../utils/kemriFormat';

const fmtMoney = (n) => {
    const v = Number(n || 0);
    if (!Number.isFinite(v) || v === 0) return '—';
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toLocaleString();
};

export default function KemriDonorPortalPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        kemriService.getDashboardSummary()
            .then((d) => { if (!cancelled) setSummary(d); })
            .catch((e) => { if (!cancelled) setError(e?.response?.data?.message || e.message || 'Failed to load donor view'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const donors = summary?.byDonor || [];
    const recent = summary?.recentReports || [];
    const seru = summary?.seruExpiring || [];

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
            <Card elevation={0} sx={{
                mb: 3, borderRadius: 3, color: 'white',
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 60%, #4b5563 100%)',
            }}>
                <CardContent sx={{ py: { xs: 2.5, md: 3 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <DonorIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>KIMES v5 · §5.1 Tier 1</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>Donor Portal (preview)</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.92 }}>
                                Read-only KIMES portal for grant donors. Same data the Centre Director sees — no information asymmetry.
                            </Typography>
                        </Box>
                        <Chip
                            icon={<LockIcon sx={{ color: 'white !important' }} />}
                            label="Read-only · donor-scoped"
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700 }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            <Alert severity="info" icon={<VerifiedIcon />} sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>What donors see in production</Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                    Donors are issued KIMES credentials at project inception (during the Grant Onboarding meeting — KIMES v5 §5.2.1).
                    Their portal is scoped to the projects they fund. They can <em>view</em> live project status, KPI gauges, SERU compliance, and budget utilisation,
                    plus their AI-drafted concurrent quarterly reports — but they do not see other funders' data, internal escalation logs, or unapproved drafts.
                </Typography>
            </Alert>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

            {!loading && summary && (
                <>
                    {/* Funders */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Funders (top 8 by study count)</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {donors.slice(0, 8).map((d, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Funder</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{d.donor || d.donorName || `#${d.donorId || i}`}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <Chip size="small" label={`${d.studyCount || d.n || 0} studies`} />
                                        <Chip size="small" label={fmtMoney(d.fundingTotal || d.funding || 0)} variant="outlined" />
                                    </Stack>
                                </Paper>
                            </Grid>
                        ))}
                        {donors.length === 0 && (
                            <Grid item xs={12}><Typography variant="body2" color="text.secondary">No donor records visible.</Typography></Grid>
                        )}
                    </Grid>

                    {/* Recent reports */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Recent approved reports</Typography>
                    <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Project</TableCell>
                                    <TableCell>Period</TableCell>
                                    <TableCell>RAG</TableCell>
                                    <TableCell align="right">Burn</TableCell>
                                    <TableCell>Approved on</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recent.slice(0, 8).map((r) => {
                                    const rag = ragMeta(r.ragStatus);
                                    const burn = r.budgetTotal ? Math.round((Number(r.expenditure || 0) / Number(r.budgetTotal)) * 100) : 0;
                                    return (
                                        <TableRow key={r.reportId || r.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.kimesProjectId || `#${r.projectId}`}</Typography>
                                                <Typography variant="caption" color="text.secondary">{r.title}</Typography>
                                            </TableCell>
                                            <TableCell><Typography variant="caption">{r.fyLabel} {r.quarter}</Typography></TableCell>
                                            <TableCell><Chip size="small" label={rag.label} sx={{ bgcolor: `${rag.hex}22`, color: rag.hex, fontWeight: 700 }} /></TableCell>
                                            <TableCell align="right">{burn ? `${burn}%` : '—'}</TableCell>
                                            <TableCell><Typography variant="caption">{r.reviewedAt ? new Date(r.reviewedAt).toISOString().slice(0,10) : '—'}</Typography></TableCell>
                                        </TableRow>
                                    );
                                })}
                                {recent.length === 0 && (
                                    <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary">No recent reports.</Typography></TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>

                    {/* SERU compliance */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Ethics compliance (SERU)</Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        {seru.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">All SERU approvals are current for the funded portfolio.</Typography>
                        ) : (
                            <Stack spacing={1}>
                                {seru.slice(0, 8).map((s) => (
                                    <Box key={s.projectId} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip
                                            size="small"
                                            color={Number(s.daysToExpiry) <= 14 ? 'error' : 'warning'}
                                            label={`${s.daysToExpiry}d`}
                                            sx={{ fontWeight: 700, minWidth: 56 }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{s.kimesProjectId}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>{s.title}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </>
            )}

            <Divider sx={{ my: 4 }} />
            <Typography variant="caption" color="text.secondary">
                KEMRI Grant Agreement Data Addendum is attached to all new grant agreements: it establishes KEMRI's right to share project performance data
                with its Board, the concurrent reporting obligation, the escalation protocol (KIMES v5 §7), and data sovereignty provisions.
            </Typography>
        </Container>
    );
}
