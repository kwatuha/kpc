/**
 * KEMRI / KIMES notifications inbox.
 *
 * Full-page view of the same data the topbar bell pulls from
 * `/api/kemri/notifications`.  Filters by kind (reminder / escalation /
 * SERU expiry), read state, and links each row to its referenced page.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Divider, FormControl,
    InputLabel, Link as MuiLink, MenuItem, Paper, Select, Stack, Tab,
    Tabs, Typography,
} from '@mui/material';
import {
    NotificationsActiveOutlined as BellIcon,
    DoneAllRounded as DoneAllIcon,
    RefreshRounded as RefreshIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import kemriService from '../api/kemriService';
import { ROUTES } from '../configs/appConfig';
import { KEMRI_MENU_PROPS } from '../utils/kemriFormat';

const KIND_META = {
    reminder:    { label: 'Reminder',    color: '#0891b2' },
    escalation:  { label: 'Escalation',  color: '#7c3aed' },
    seru_expiry: { label: 'SERU expiry', color: '#dc2626' },
    info:        { label: 'Info',        color: '#475569' },
};

const fmtDt = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

export default function KemriNotificationsInboxPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [total, setTotal] = useState(0);
    const [tab, setTab] = useState('all');     // all | unread
    const [kind, setKind] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const params = { limit: 200 };
            if (tab === 'unread') params.unreadOnly = 'true';
            const data = await kemriService.listNotifications(params);
            setItems(Array.isArray(data?.items) ? data.items : []);
            setUnread(data?.unread || 0);
            setTotal(data?.total || 0);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { refresh(); }, [refresh]);

    const visible = useMemo(() => {
        if (kind === 'all') return items;
        return items.filter((n) => n.kind === kind);
    }, [items, kind]);

    const handleClick = async (n) => {
        try { if (!n.readAt) await kemriService.markNotificationRead(n.id); } catch (_) {}
        if (n.link) navigate(n.link);
        refresh();
    };

    const handleMarkAllRead = async () => {
        try { await kemriService.markAllNotificationsRead(); } catch (_) {}
        refresh();
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <BellIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Notifications</Typography>
                        <Chip size="small" label={`${total} total · ${unread} unread`} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Pre-deadline reminders (D-30 / D-14 / D-7), non-conformity escalation notices and SERU expiry alerts.
                        Engine activity is logged at <MuiLink component={RouterLink} to={ROUTES.KEMRI_ESCALATIONS}>Escalations Inbox</MuiLink>.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    {unread > 0 && (
                        <Button startIcon={<DoneAllIcon />} onClick={handleMarkAllRead} variant="outlined">Mark all read</Button>
                    )}
                    <Button startIcon={<RefreshIcon />} onClick={refresh} disabled={loading} variant="outlined">Refresh</Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Paper variant="outlined">
                <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} sx={{ px: 2, pt: 1 }} spacing={2}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flexGrow: 1 }}>
                        <Tab value="all"    label={`All (${total})`} />
                        <Tab value="unread" label={`Unread (${unread})`} />
                    </Tabs>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Kind</InputLabel>
                        <Select label="Kind" value={kind} onChange={(e) => setKind(e.target.value)} MenuProps={KEMRI_MENU_PROPS}>
                            <MenuItem value="all">All kinds</MenuItem>
                            <MenuItem value="reminder">Pre-deadline reminders</MenuItem>
                            <MenuItem value="escalation">Escalation notices</MenuItem>
                            <MenuItem value="seru_expiry">SERU expiry alerts</MenuItem>
                            <MenuItem value="info">Info / system</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
                <Divider sx={{ mt: 1 }} />
                {loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                ) : visible.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">You're all caught up.</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            New notifications appear when the workflow engine runs (every 6 hours, or on-demand from the Escalations Inbox).
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {visible.map((n) => {
                            const meta = KIND_META[n.kind] || KIND_META.info;
                            return (
                                <Box
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    sx={{
                                        cursor: 'pointer', px: 2, py: 1.5,
                                        borderBottom: '1px solid', borderColor: 'divider',
                                        bgcolor: n.readAt ? 'transparent' : '#f0f9ff',
                                        '&:hover': { bgcolor: '#e0f2fe' },
                                    }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Box sx={{ flexShrink: 0, width: 4, height: 40, bgcolor: meta.color, borderRadius: 1 }} />
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25, flexWrap: 'wrap' }}>
                                                <Chip size="small" label={meta.label} sx={{ bgcolor: `${meta.color}20`, color: meta.color, fontWeight: 700, height: 20 }} />
                                                {n.level && <Chip size="small" label={`L${n.level}`} variant="outlined" sx={{ height: 20 }} />}
                                                {!n.readAt && <Chip size="small" label="UNREAD" color="primary" sx={{ height: 18 }} />}
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{fmtDt(n.createdAt)}</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ fontWeight: n.readAt ? 400 : 600 }}>{n.subject}</Typography>
                                            {n.body && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{n.body}</Typography>}
                                        </Box>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
