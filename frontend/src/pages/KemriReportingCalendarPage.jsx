/**
 * KIMES Concurrent Reporting Calendar — KIMES v5 §5.
 *
 * Visualises the four-tier concurrent-reporting framework:
 *   Tier 1: Real-Time Portal       (continuous from registration)
 *   Tier 2: Concurrent Quarterly   (within 24h of CD approval)
 *   Tier 3: Annual Financial       (by 31 July, end of GoK FY)
 *   Tier 4: Final Report           (within 30 days of project end)
 *
 * Plus a per-event reporting calendar with PI deadlines, CD review SLA, AI
 * report generation window, donor submission and KEMRI dashboard update.
 *
 * The page is auto-fed from /api/kemri/concurrent-reporting/calendar.
 */

import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, CircularProgress, Container, Divider,
    Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon,
    PolicyOutlined as PolicyIcon,
    AltRouteRounded as TierIcon,
} from '@mui/icons-material';
import kemriService from '../api/kemriService';

const TIER_COLORS = {
    1: '#16a34a',
    2: '#1d4ed8',
    3: '#a16207',
    4: '#7c3aed',
};

export default function KemriReportingCalendarPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        kemriService.getConcurrentReportingCalendar()
            .then((d) => { if (!cancelled) setData(d); })
            .catch((e) => { if (!cancelled) setError(e?.response?.data?.message || e.message || 'Failed to load calendar'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Card elevation={0} sx={{
                mb: 3, borderRadius: 3, color: 'white',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 60%, #16a34a 100%)',
            }}>
                <CardContent sx={{ py: { xs: 2.5, md: 3 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={2}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.18)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CalendarIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>KIMES v5 · §5</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>Concurrent Reporting Calendar</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.92 }}>
                                One verified KIMES data record → multiple formatted outputs simultaneously. Donor, KEMRI management and Board see the same verified facts at the same moment.
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

            {!loading && data && (
                <>
                    {/* 4-tier framework */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <TierIcon sx={{ color: '#1d4ed8' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Four-tier concurrent reporting framework</Typography>
                    </Stack>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {data.tiers.map((t) => (
                            <Grid item xs={12} sm={6} md={3} key={t.tier}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: TIER_COLORS[t.tier] }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                        <Chip size="small" label={`Tier ${t.tier}`} sx={{ bgcolor: `${TIER_COLORS[t.tier]}22`, color: TIER_COLORS[t.tier], fontWeight: 800 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.75 }}>
                                        <strong>Donor:</strong> {t.donor}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.75 }}>
                                        <strong>KEMRI:</strong> {t.internal}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary"><strong>Timing:</strong> {t.timing}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Reporting event timeline */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <PolicyIcon sx={{ color: '#a16207' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Reporting event timeline</Typography>
                    </Stack>
                    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Reporting event</TableCell>
                                        <TableCell>PI deadline in KIMES</TableCell>
                                        <TableCell>Centre Director review</TableCell>
                                        <TableCell>AI report generation</TableCell>
                                        <TableCell>Donor submission</TableCell>
                                        <TableCell>KEMRI record update</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.events.map((e, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{e.event}</Typography></TableCell>
                                            <TableCell><Typography variant="caption">{e.piDeadline}</Typography></TableCell>
                                            <TableCell><Typography variant="caption">{e.cdReview}</Typography></TableCell>
                                            <TableCell><Typography variant="caption">{e.aiGen}</Typography></TableCell>
                                            <TableCell><Typography variant="caption">{e.donorSubmit}</Typography></TableCell>
                                            <TableCell><Typography variant="caption">{e.kemriUpdate}</Typography></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>

                    <Alert severity="info" sx={{ mt: 3 }}>
                        Concurrent reporting does not mean three separate reports are produced. It means a single verified KIMES data record
                        generates multiple formatted outputs simultaneously — one for the donor (in their required format), one for KEMRI
                        management (institutional dashboard), and one for the Board (scorecard). The PI validates the data once; KIMES produces all outputs.
                    </Alert>
                </>
            )}
        </Container>
    );
}
