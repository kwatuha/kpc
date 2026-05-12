/**
 * Escalations Inbox — KEMRI / KIMES non-conformity protocol Levels 1–5.
 *
 * The page visualises the same `kemri_escalations` table the workflow engine
 * writes to.  Centre Directors / MEL / DG can:
 *   • see every open and resolved escalation grouped by level
 *   • filter by level, classification and resolution state
 *   • resolve an escalation (with notes; resolution is logged)
 *   • preview / regenerate the DG-NCF-001 donor non-conformity letter for L4
 *   • run the workflow tick on demand
 *
 * Data source: GET /api/kemri/escalations and /escalations/summary
 * (see api/routes/kemriRoutes.js).  The DG-NCF-001 letter is rendered server
 * side by api/services/kemriWorkflowEngine.js#renderDgNcf001.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, Grid, IconButton, Link as MuiLink,
    Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow,
    Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import {
    Refresh as RefreshIcon, GavelOutlined as GavelIcon,
    PlayCircleOutlineRounded as PlayIcon, ContentCopyRounded as CopyIcon,
    AutorenewRounded as RegenIcon, OpenInNewRounded as OpenIcon,
    DescriptionRounded as LetterIcon,
    CheckCircleRounded as CheckIcon,
    RadioButtonUncheckedRounded as UncheckIcon,
    BlockRounded as BlockIcon,
    SendRounded as SendIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import kemriService from '../api/kemriService';
import { ROUTES } from '../configs/appConfig';

const LEVEL_META = {
    1: { label: 'L1 Caution',      color: '#10B981', help: 'Day-1 reminder issued. Resolution window D+1 to D+14.' },
    2: { label: 'L2 Formal Notice',color: '#F59E0B', help: 'MEL Division Head formal written notice; CC Centre Director.' },
    3: { label: 'L3 Significant',  color: '#EF4444', help: 'Centre Director intervention; Board Dashboard flag; DG Office notified.' },
    4: { label: 'L4 Severe',       color: '#7C3AED', help: 'DG Formal Letter (DG-NCF-001) prepared; donor notification under Legal review.' },
    5: { label: 'L5 Institutional',color: '#0F172A', help: 'Centre-wide systemic non-conformity. Board directive required.' },
};

const fmtDate = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '—');
const fmtDt   = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

export default function KemriEscalationsInboxPage() {
    const [summary, setSummary] = useState(null);
    const [rows, setRows] = useState([]);
    const [tab, setTab] = useState('open'); // open | resolved
    const [levelFilter, setLevelFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resolveTarget, setResolveTarget] = useState(null);
    const [resolveNotes, setResolveNotes] = useState('');
    const [tickRunning, setTickRunning] = useState(false);
    const [tickResult, setTickResult] = useState(null);
    const [letter, setLetter] = useState(null);
    const [letterLoading, setLetterLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (tab === 'open') filters.resolved = 'false';
            if (tab === 'resolved') filters.resolved = 'true';
            if (levelFilter !== 'all') filters.level = levelFilter;
            const [list, sum] = await Promise.all([
                kemriService.listEscalations(filters),
                kemriService.getEscalationsSummary(),
            ]);
            setRows(Array.isArray(list) ? list : []);
            setSummary(sum);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to load escalations');
        } finally {
            setLoading(false);
        }
    }, [tab, levelFilter]);

    useEffect(() => { refresh(); }, [refresh]);

    const totals = useMemo(() => {
        if (!summary) return { open: 0, resolved: 0 };
        let open = 0; let resolved = 0;
        Object.values(summary).forEach((b) => { open += (b.open || 0); resolved += (b.resolved || 0); });
        return { open, resolved };
    }, [summary]);

    const handleResolve = async () => {
        if (!resolveTarget) return;
        try {
            await kemriService.resolveEscalation(resolveTarget.id, { resolutionNotes: resolveNotes });
            setResolveTarget(null);
            setResolveNotes('');
            await refresh();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Resolve failed');
        }
    };

    const handleTick = async () => {
        setTickRunning(true);
        try {
            const out = await kemriService.runWorkflowTick(false);
            setTickResult(out);
            await refresh();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Workflow tick failed');
        } finally {
            setTickRunning(false);
        }
    };

    const reloadLetter = useCallback(async (escId) => {
        const data = await kemriService.getDgNcfLetter(escId);
        return data;
    }, []);

    const handleViewLetter = async (esc) => {
        setLetterLoading(true);
        setLetter({ escalation: esc, body: '' });
        try {
            const data = await reloadLetter(esc.id);
            setLetter({
                escalation: esc,
                body: data.letter,
                generatedAt: data.generatedAt,
                gates: data.gates || {},
                notes: data.notes || {},
                donorRecipient: data.donorRecipient || '',
            });
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Letter fetch failed');
            setLetter(null);
        } finally {
            setLetterLoading(false);
        }
    };

    const handleRegenLetter = async () => {
        if (!letter?.escalation) return;
        setLetterLoading(true);
        try {
            const data = await kemriService.regenerateDgNcfLetter(letter.escalation.id);
            const fresh = await reloadLetter(letter.escalation.id);
            setLetter((l) => ({
                ...l,
                body: data.letter,
                generatedAt: new Date().toISOString(),
                gates: fresh.gates || {},
                notes: fresh.notes || {},
                donorRecipient: fresh.donorRecipient || '',
            }));
            await refresh();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Letter regeneration failed');
        } finally {
            setLetterLoading(false);
        }
    };

    // IRB / DG / Legal / Send actions. Each refreshes the gates state.
    const runGateAction = async (action, payload = {}) => {
        if (!letter?.escalation) return;
        try {
            await action(letter.escalation.id, payload);
            const fresh = await reloadLetter(letter.escalation.id);
            setLetter((l) => ({
                ...l,
                gates: fresh.gates || {},
                notes: fresh.notes || {},
                donorRecipient: fresh.donorRecipient || '',
            }));
            await refresh();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Gate action failed');
        }
    };

    const copyLetter = () => {
        if (letter?.body) navigator.clipboard?.writeText(letter.body).catch(() => {});
    };

    const [recipientInput, setRecipientInput] = useState('');
    useEffect(() => {
        if (letter?.donorRecipient) setRecipientInput(letter.donorRecipient);
        else if (letter) setRecipientInput('');
    }, [letter?.escalation?.id, letter?.donorRecipient]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                <Box>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <GavelIcon sx={{ color: '#6a1b9a' }} />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Escalations Inbox</Typography>
                        <Chip size="small" label={`${totals.open} open · ${totals.resolved} resolved`} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        KIMES non-conformity protocol — auto-generated by the workflow engine when a milestone report is overdue,
                        or filed manually by a Centre Director from the{' '}
                        <MuiLink component={RouterLink} to={ROUTES.KEMRI_REVIEW_QUEUE}>Review Queue</MuiLink>.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Run workflow engine now (D-N reminders, ladder, SERU alerts)">
                        <span>
                            <Button startIcon={tickRunning ? <CircularProgress size={16} /> : <PlayIcon />}
                                    onClick={handleTick} disabled={tickRunning} variant="contained" color="secondary">
                                Run engine now
                            </Button>
                        </span>
                    </Tooltip>
                    <Button startIcon={<RefreshIcon />} onClick={refresh} disabled={loading} variant="outlined">Refresh</Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            {tickResult && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setTickResult(null)}>
                    Tick complete · reminders: <strong>{tickResult.summary?.remindersSent ?? 0}</strong>
                    , L1–L4 opened: <strong>{tickResult.summary?.escalationsOpened ?? 0}</strong>
                    , upgraded: <strong>{tickResult.summary?.escalationsUpgraded ?? 0}</strong>
                    , L5 institutional opened: <strong>{tickResult.summary?.l5EscalationsOpened ?? 0}</strong>
                    , SERU: <strong>{tickResult.summary?.seruAlertsSent ?? 0}</strong>
                    , patent expiry: <strong>{tickResult.summary?.patentAlertsSent ?? 0}</strong>
                    , high-IF: <strong>{tickResult.summary?.highImpactAlertsSent ?? 0}</strong>.
                </Alert>
            )}

            {/* Level summary tiles — five tiers per KIMES v5 §7.1 */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[1, 2, 3, 4, 5].map((lvl) => {
                    const meta = LEVEL_META[lvl];
                    const open = summary?.[lvl]?.open ?? 0;
                    const resolved = summary?.[lvl]?.resolved ?? 0;
                    const isActive = String(levelFilter) === String(lvl);
                    return (
                        <Grid item xs={6} sm={4} md={2.4} key={lvl}>
                            <Paper
                                onClick={() => setLevelFilter(isActive ? 'all' : lvl)}
                                sx={{
                                    p: 1.5, cursor: 'pointer',
                                    border: '2px solid',
                                    borderColor: isActive ? meta.color : 'transparent',
                                    bgcolor: `${meta.color}10`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: 5, bgcolor: meta.color }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: meta.color }}>{meta.label}</Typography>
                                </Stack>
                                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{open}</Typography>
                                <Typography variant="caption" color="text.secondary">{resolved} resolved · {meta.help}</Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <Paper variant="outlined">
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab value="open"     label={`Open (${totals.open})`} />
                    <Tab value="resolved" label={`Resolved (${totals.resolved})`} />
                    <Tab value="all"      label="All" />
                </Tabs>
                <Divider />
                {loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                ) : rows.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">No escalations match the current filter.</Typography>
                    </Box>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Level</TableCell>
                                <TableCell>Project</TableCell>
                                <TableCell>Period</TableCell>
                                <TableCell align="right">Days late</TableCell>
                                <TableCell>Triggered</TableCell>
                                <TableCell>Origin</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((e) => {
                                const meta = LEVEL_META[e.level] || LEVEL_META[3];
                                return (
                                    <TableRow key={e.id} hover>
                                        <TableCell>
                                            <Chip label={meta.label} size="small" sx={{ bgcolor: `${meta.color}20`, color: meta.color, fontWeight: 700 }} />
                                            {e.classification && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                    {e.classification}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.kimesProjectId || `#${e.projectId}`}</Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 320, display: 'block' }}>
                                                {e.projectTitle}{e.centreCode ? ` · ${e.centreCode}` : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{e.fyLabel ? `${e.fyLabel} ${e.quarter}` : '—'}</TableCell>
                                        <TableCell align="right">{e.daysLate ?? '—'}</TableCell>
                                        <TableCell>{fmtDate(e.triggeredAt)}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label={e.autoGenerated ? 'Engine' : 'Manual'}
                                                  variant={e.autoGenerated ? 'filled' : 'outlined'} />
                                        </TableCell>
                                        <TableCell>
                                            {e.resolved
                                                ? <Chip size="small" color="success" label={`Resolved ${fmtDate(e.resolvedAt)}`} />
                                                : <Chip size="small" color="warning" label="Open" />
                                            }
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                {e.reportId && (
                                                    <Tooltip title="Open the underlying milestone report">
                                                        <IconButton size="small" component={RouterLink} to={`${ROUTES.KEMRI_REVIEW_QUEUE}?reportId=${e.reportId}`}>
                                                            <OpenIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {e.level >= 4 && (
                                                    <Tooltip title={e.hasDonorLetter ? 'Preview DG-NCF-001 letter (already drafted)' : 'Generate DG-NCF-001 letter'}>
                                                        <IconButton size="small" onClick={() => handleViewLetter(e)}>
                                                            <LetterIcon fontSize="small" color={e.hasDonorLetter ? 'secondary' : 'inherit'} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {!e.resolved && (
                                                    <Button size="small" variant="text" onClick={() => { setResolveTarget(e); setResolveNotes(''); }}>
                                                        Resolve
                                                    </Button>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {/* Resolve dialog */}
            <Dialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Resolve escalation #{resolveTarget?.id}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Closing this escalation logs <em>{resolveTarget && LEVEL_META[resolveTarget.level]?.label}</em> as resolved
                        for <strong>{resolveTarget?.kimesProjectId || resolveTarget?.projectTitle}</strong>. The audit trail is
                        immutable — supply a clear note for the record.
                    </Typography>
                    <TextField
                        label="Resolution notes"
                        multiline minRows={4} fullWidth
                        value={resolveNotes}
                        onChange={(e) => setResolveNotes(e.target.value)}
                        placeholder="What was the corrective action? Who approved it? When?"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResolveTarget(null)}>Cancel</Button>
                    <Button onClick={handleResolve} variant="contained" color="success">Resolve</Button>
                </DialogActions>
            </Dialog>

            {/* DG-NCF-001 letter dialog — three-gate ladder per v5 §7.3.1 */}
            <Dialog open={!!letter} onClose={() => setLetter(null)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    DG-NCF-001 — donor non-conformity letter
                    {letter?.gates?.sent && (
                        <Chip size="small" color="success" label={`Sent ${fmtDt(letter.gates.sentAt)}`} sx={{ ml: 1 }} />
                    )}
                    {!letter?.gates?.sent && letter?.gates?.readyToSend && (
                        <Chip size="small" color="warning" label="Cleared — ready to transmit" sx={{ ml: 1 }} />
                    )}
                    {!letter?.gates?.sent && !letter?.gates?.readyToSend && (
                        <Chip size="small" variant="outlined" label="DRAFT — gates not cleared" sx={{ ml: 1 }} />
                    )}
                    {letter?.generatedAt && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            generated {fmtDt(letter.generatedAt)}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {/* Letter preview */}
                        <Grid item xs={12} md={7}>
                            {letterLoading ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                            ) : (
                                <Box component="pre" sx={{
                                    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
                                    fontSize: 12.5, whiteSpace: 'pre-wrap', m: 0, p: 1.5,
                                    bgcolor: '#fafafa', border: '1px solid', borderColor: 'divider', borderRadius: 1,
                                    maxHeight: 540, overflow: 'auto',
                                }}>
                                    {letter?.body || '(no letter yet)'}
                                </Box>
                            )}
                        </Grid>

                        {/* IRB → DG → Legal → Send gate ladder */}
                        <Grid item xs={12} md={5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Pre-transmission gates
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                KEMRI policy (KIMES v5 §7.3.1): each rung must be cleared in order. None of the rungs
                                can be skipped from the UI — the API enforces the same chain.
                            </Typography>

                            <GateRow
                                title="1. Internal Review Board"
                                state={letter?.gates?.irbRecommended ? 'done' : (letter?.gates?.irbHeld ? 'held' : 'pending')}
                                at={letter?.gates?.irbDecisionAt}
                                notes={letter?.notes?.irb}
                                actions={
                                    !letter?.gates?.irbRecommended && !letter?.gates?.irbHeld && (
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" color="success"
                                                onClick={() => runGateAction(kemriService.recordIrbDecision, { decision: 'recommend_notify', notes: prompt('IRB notes (optional):') || null })}>
                                                Recommend notify
                                            </Button>
                                            <Button size="small" variant="outlined" color="error"
                                                onClick={() => runGateAction(kemriService.recordIrbDecision, { decision: 'recommend_hold', notes: prompt('Hold rationale (optional):') || null })}>
                                                Hold (remediate)
                                            </Button>
                                        </Stack>
                                    )
                                }
                            />

                            <GateRow
                                title="2. Director General approval"
                                state={letter?.gates?.dgApproved ? 'done' : (letter?.gates?.irbRecommended ? 'pending' : 'blocked')}
                                at={letter?.gates?.dgApprovedAt}
                                notes={letter?.notes?.dg}
                                blockedReason={!letter?.gates?.irbRecommended ? 'Waiting for IRB recommendation' : null}
                                actions={
                                    letter?.gates?.irbRecommended && !letter?.gates?.dgApproved && (
                                        <Button size="small" variant="contained"
                                            onClick={() => runGateAction(kemriService.recordDgApproval, { notes: prompt('DG approval notes (optional):') || null })}>
                                            Record DG approval
                                        </Button>
                                    )
                                }
                            />

                            <GateRow
                                title="3. Legal Counsel clearance"
                                state={letter?.gates?.legalCleared ? 'done' : (letter?.gates?.dgApproved ? 'pending' : 'blocked')}
                                at={letter?.gates?.legalClearedAt}
                                notes={letter?.notes?.legal}
                                blockedReason={!letter?.gates?.dgApproved ? 'Waiting for DG approval' : null}
                                actions={
                                    letter?.gates?.dgApproved && !letter?.gates?.legalCleared && (
                                        <Button size="small" variant="contained"
                                            onClick={() => runGateAction(kemriService.recordLegalClearance, { notes: prompt('Legal clearance notes (optional):') || null })}>
                                            Record clearance
                                        </Button>
                                    )
                                }
                            />

                            <GateRow
                                title="4. Transmit to donor"
                                state={letter?.gates?.sent ? 'done' : (letter?.gates?.readyToSend ? 'pending' : 'blocked')}
                                at={letter?.gates?.sentAt}
                                blockedReason={!letter?.gates?.readyToSend && !letter?.gates?.sent ? 'Waiting for clearances above' : null}
                                actions={
                                    letter?.gates?.readyToSend && !letter?.gates?.sent && (
                                        <Stack spacing={1}>
                                            <TextField
                                                size="small" label="Donor recipient (name / email)"
                                                value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)}
                                                placeholder="e.g. Programme Officer, NIH Fogarty"
                                            />
                                            <Button size="small" variant="contained" color="warning" startIcon={<SendIcon />}
                                                disabled={!recipientInput.trim()}
                                                onClick={() => runGateAction(kemriService.markDonorLetterSent, { recipient: recipientInput.trim() })}>
                                                Mark as sent to donor
                                            </Button>
                                        </Stack>
                                    )
                                }
                            />

                            {letter?.gates?.sent && letter.donorRecipient && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Recipient on record: <strong>{letter.donorRecipient}</strong>
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<CopyIcon />}  onClick={copyLetter} disabled={!letter?.body || letterLoading}>Copy letter</Button>
                    <Button startIcon={<RegenIcon />} onClick={handleRegenLetter} disabled={letterLoading || letter?.gates?.sent}>Regenerate</Button>
                    <Button onClick={() => setLetter(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

/** A single row in the IRB→DG→Legal→Send gate ladder. */
function GateRow({ title, state, at, notes, blockedReason, actions }) {
    const palette = {
        done:    { color: '#16a34a', icon: <CheckIcon fontSize="small" />,    label: 'Cleared' },
        pending: { color: '#f59e0b', icon: <UncheckIcon fontSize="small" />,   label: 'Pending' },
        blocked: { color: '#94a3b8', icon: <BlockIcon fontSize="small" />,     label: 'Blocked' },
        held:    { color: '#dc2626', icon: <BlockIcon fontSize="small" />,     label: 'IRB held — hold remediation in progress' },
    }[state] || { color: '#475569', icon: null, label: state };

    return (
        <Box sx={{
            p: 1.5, mb: 1.25, borderRadius: 1.5,
            border: '1px solid', borderColor: 'divider',
            bgcolor: state === 'done' ? '#f0fdf4' : (state === 'held' ? '#fef2f2' : '#fafafa'),
        }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Box sx={{ color: palette.color, display: 'flex', alignItems: 'center' }}>{palette.icon}</Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
                <Chip size="small" label={palette.label} sx={{ bgcolor: `${palette.color}1A`, color: palette.color, fontWeight: 700 }} />
                {at && (
                    <Typography variant="caption" color="text.secondary">— {new Date(at).toLocaleString()}</Typography>
                )}
            </Stack>
            {notes && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    “{notes}”
                </Typography>
            )}
            {blockedReason && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {blockedReason}.
                </Typography>
            )}
            {actions}
        </Box>
    );
}
