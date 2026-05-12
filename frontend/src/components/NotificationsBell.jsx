/**
 * Notifications bell — small popover anchored to the topbar.
 *
 * Reads the last 8 unread notifications from `/api/kemri/notifications`,
 * shows an unread badge, and links to the full inbox page.  Polls every
 * 60 seconds when the tab is visible (no socket needed).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Badge, Box, Button, Chip, CircularProgress, Divider, IconButton,
    List, ListItem, ListItemText, Popover, Stack, Tooltip, Typography,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router-dom';
import kemriService from '../api/kemriService';
import { ROUTES } from '../configs/appConfig';

const KIND_META = {
    reminder:    { label: 'Reminder', color: '#0891b2' },
    escalation:  { label: 'Escalation', color: '#7c3aed' },
    seru_expiry: { label: 'SERU expiry', color: '#dc2626' },
    info:        { label: 'Info', color: '#475569' },
};

const fmtAgo = (iso) => {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); return `${d}d ago`;
};

export default function NotificationsBell() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const refreshTimer = useRef(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await kemriService.listNotifications({ limit: 8 });
            setItems(Array.isArray(data?.items) ? data.items : []);
            setUnread(data?.unread || 0);
        } catch (_) {
            // 401 / not yet logged in — bell quietly stays at 0
            setItems([]); setUnread(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const tick = () => { if (document.visibilityState === 'visible') refresh(); };
        refreshTimer.current = setInterval(tick, 60 * 1000);
        document.addEventListener('visibilitychange', tick);
        return () => {
            if (refreshTimer.current) clearInterval(refreshTimer.current);
            document.removeEventListener('visibilitychange', tick);
        };
    }, [refresh]);

    const open = Boolean(anchorEl);

    const handleOpen = (e) => {
        setAnchorEl(e.currentTarget);
        refresh();
    };

    const handleItemClick = async (n) => {
        try { if (!n.readAt) await kemriService.markNotificationRead(n.id); } catch (_) {}
        setAnchorEl(null);
        navigate(n.link || ROUTES.KEMRI_NOTIFICATIONS);
        refresh();
    };

    const handleMarkAllRead = async () => {
        try { await kemriService.markAllNotificationsRead(); } catch (_) {}
        refresh();
    };

    const handleViewAll = () => {
        setAnchorEl(null);
        navigate(ROUTES.KEMRI_NOTIFICATIONS);
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={handleOpen}
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                    aria-label="Open notifications"
                >
                    <Badge color="error" badgeContent={unread} max={99} overlap="circular">
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 380, maxWidth: '90vw' } } }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Notifications
                        {unread > 0 && <Chip size="small" label={`${unread} unread`} color="error" sx={{ ml: 1 }} />}
                    </Typography>
                    {unread > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
                    )}
                </Stack>
                <Divider />
                {loading && items.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                ) : items.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">You're all caught up.</Typography>
                    </Box>
                ) : (
                    <List dense disablePadding sx={{ maxHeight: 360, overflow: 'auto' }}>
                        {items.map((n) => {
                            const meta = KIND_META[n.kind] || KIND_META.info;
                            return (
                                <ListItem
                                    key={n.id}
                                    button
                                    onClick={() => handleItemClick(n)}
                                    sx={{
                                        bgcolor: n.readAt ? 'transparent' : '#eff6ff',
                                        borderLeft: '3px solid',
                                        borderLeftColor: n.readAt ? 'transparent' : meta.color,
                                        py: 1, alignItems: 'flex-start',
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Chip size="small" label={meta.label} sx={{ bgcolor: `${meta.color}20`, color: meta.color, fontWeight: 700, height: 18 }} />
                                                {n.level && <Chip size="small" label={`L${n.level}`} variant="outlined" sx={{ height: 18 }} />}
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{fmtAgo(n.createdAt)}</Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: n.readAt ? 400 : 600 }}>
                                                    {n.subject}
                                                </Typography>
                                                {n.body && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {n.body}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Button size="small" fullWidth onClick={handleViewAll}>View all notifications</Button>
                </Box>
            </Popover>
        </>
    );
}
