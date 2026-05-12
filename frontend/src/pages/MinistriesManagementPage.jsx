import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  useTheme,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Apartment as ApartmentIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext.jsx';
import { isAdmin } from '../utils/privilegeUtils.js';
import { tokens } from './dashboard/theme';
import Header from './dashboard/Header';

export default function MinistriesManagementPage() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useAuth();
  const allowed = isAdmin(user);

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [ministryDialog, setMinistryDialog] = useState({ open: false, editing: null });
  const [ministryForm, setMinistryForm] = useState({ name: '', alias: '' });

  const [deptDialog, setDeptDialog] = useState({ open: false, ministry: null, editing: null });
  const [deptForm, setDeptForm] = useState({ name: '', alias: '' });

  const [deleteMinistry, setDeleteMinistry] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/ministries', { params: { withDepartments: '1' } });
      setTree(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || e.message || 'Failed to load ministries',
        severity: 'error',
      });
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) fetchTree();
  }, [allowed, fetchTree]);

  const filteredTree = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tree;
    return tree
      .map((m) => {
        const nameMatch =
          (m.name || '').toLowerCase().includes(q) ||
          (m.alias || '').toLowerCase().includes(q);
        const depts = (m.departments || []).filter(
          (d) =>
            (d.name || '').toLowerCase().includes(q) ||
            (d.alias || '').toLowerCase().includes(q)
        );
        if (nameMatch) return m;
        if (depts.length) return { ...m, departments: depts };
        return null;
      })
      .filter(Boolean);
  }, [tree, searchQuery]);

  const totalDepts = useMemo(
    () => tree.reduce((n, m) => n + (m.departments?.length || 0), 0),
    [tree]
  );

  /** Rows aligned with kenya_ministries_structure import: Ministry | State Department */
  const buildExportSheet = useCallback((ministriesList) => {
    const aoa = [['Ministry', 'State Department']];
    for (const m of ministriesList) {
      const depts = m.departments || [];
      if (depts.length === 0) {
        aoa.push([m.name || '', '']);
      } else {
        for (const d of depts) {
          aoa.push([m.name || '', d.name || '']);
        }
      }
    }
    return aoa;
  }, []);

  const handleExportToExcel = useCallback(() => {
    const source = searchQuery.trim() ? filteredTree : tree;
    const aoa = buildExportSheet(source);
    const rowCount = Math.max(0, aoa.length - 1);
    if (rowCount === 0) {
      setSnackbar({ open: true, message: 'No ministries to export', severity: 'warning' });
      return;
    }
    setExportingExcel(true);
    try {
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kenya Ministries');
      const dateStr = new Date().toISOString().split('T')[0];
      const filtered = Boolean(searchQuery.trim());
      const filename = filtered
        ? `kenya_ministries_structure_filtered_${dateStr}.xlsx`
        : `kenya_ministries_structure_${dateStr}.xlsx`;
      XLSX.writeFile(workbook, filename);
      setSnackbar({
        open: true,
        message: `Exported ${rowCount} row${rowCount !== 1 ? 's' : ''} to Excel (${filtered ? 'filtered view' : 'all'}).`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Export ministries Excel:', err);
      setSnackbar({ open: true, message: 'Failed to export to Excel. Please try again.', severity: 'error' });
    } finally {
      setExportingExcel(false);
    }
  }, [tree, filteredTree, searchQuery, buildExportSheet]);

  const saveMinistry = async () => {
    if (!ministryForm.name?.trim()) {
      setSnackbar({ open: true, message: 'Ministry name is required', severity: 'error' });
      return;
    }
    try {
      if (ministryDialog.editing) {
        await axiosInstance.put(`/ministries/${ministryDialog.editing.ministryId}`, {
          name: ministryForm.name.trim(),
          alias: ministryForm.alias?.trim() || null,
        });
        setSnackbar({ open: true, message: 'Ministry updated', severity: 'success' });
      } else {
        await axiosInstance.post('/ministries', {
          name: ministryForm.name.trim(),
          alias: ministryForm.alias?.trim() || null,
        });
        setSnackbar({ open: true, message: 'Ministry created', severity: 'success' });
      }
      setMinistryDialog({ open: false, editing: null });
      fetchTree();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || 'Save failed',
        severity: 'error',
      });
    }
  };

  const saveDept = async () => {
    if (!deptForm.name?.trim() || !deptDialog.ministry) {
      setSnackbar({ open: true, message: 'State department name is required', severity: 'error' });
      return;
    }
    const mid = deptDialog.ministry.ministryId ?? deptDialog.ministry.id;
    if (!mid) {
      setSnackbar({ open: true, message: 'Invalid ministry selected. Re-open dialog and try again.', severity: 'error' });
      return;
    }
    try {
      if (deptDialog.editing) {
        const departmentId = deptDialog.editing.departmentId ?? deptDialog.editing.id;
        if (!departmentId) {
          setSnackbar({ open: true, message: 'Invalid state department selected.', severity: 'error' });
          return;
        }
        await axiosInstance.put(`/ministries/${mid}/departments/${departmentId}`, {
          name: deptForm.name.trim(),
          alias: deptForm.alias?.trim() || null,
        });
        setSnackbar({ open: true, message: 'State department updated', severity: 'success' });
      } else {
        await axiosInstance.post(`/ministries/${mid}/departments`, {
          name: deptForm.name.trim(),
          alias: deptForm.alias?.trim() || null,
        });
        setSnackbar({ open: true, message: 'State department created', severity: 'success' });
      }
      setDeptDialog({ open: false, ministry: null, editing: null });
      fetchTree();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Save failed',
        severity: 'error',
      });
    }
  };

  const confirmDeleteMinistry = async () => {
    if (!deleteMinistry) return;
    try {
      await axiosInstance.delete(`/ministries/${deleteMinistry.ministryId}`);
      setSnackbar({ open: true, message: 'Ministry removed', severity: 'success' });
      setDeleteMinistry(null);
      fetchTree();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || 'Delete failed',
        severity: 'error',
      });
    }
  };

  const confirmDeleteDept = async () => {
    if (!deleteDept) return;
    try {
      await axiosInstance.delete(
        `/ministries/${deleteDept.ministryId}/departments/${deleteDept.departmentId}`
      );
      setSnackbar({ open: true, message: 'State department removed', severity: 'success' });
      setDeleteDept(null);
      fetchTree();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || 'Delete failed',
        severity: 'error',
      });
    }
  };

  if (!allowed) {
    return (
      <Box m={3}>
        <Alert severity="warning">You need administrator access to manage ministries.</Alert>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header
        title="Ministries"
        subtitle="Define ministries (cabinet) and state departments (metadata)"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ApartmentIcon sx={{ fontSize: 40, color: colors.blueAccent[500] }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {tree.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ministries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={600}>
                {totalDepts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                State departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" mb={2}>
        <TextField
          placeholder="Search ministries or state departments..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchQuery ? (
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null,
          }}
          sx={{ minWidth: 280 }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={exportingExcel ? <CircularProgress size={14} color="inherit" /> : <ExcelIcon />}
            onClick={handleExportToExcel}
            disabled={exportingExcel || loading || tree.length === 0}
          >
            {exportingExcel ? 'Exporting…' : 'Export Excel'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setMinistryForm({ name: '', alias: '' });
              setMinistryDialog({ open: true, editing: null });
            }}
            sx={{ bgcolor: colors.blueAccent[500] }}
          >
            Add ministry
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1}>
          {filteredTree.map((m) => (
            <Accordion key={m.ministryId} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  pr={2}
                >
                  <Box flex={1} minWidth={0} mr={1}>
                    <Typography fontWeight={700} component="div">
                      {m.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Alias: {m.alias?.trim() ? m.alias : '—'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setMinistryForm({ name: m.name, alias: m.alias || '' });
                        setMinistryDialog({ open: true, editing: m });
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteMinistry(m)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setDeptForm({ name: '', alias: '' });
                        setDeptDialog({ open: true, ministry: m, editing: null });
                      }}
                    >
                      Add state department
                    </Button>
                  </Stack>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>State department</TableCell>
                        <TableCell>Alias</TableCell>
                        <TableCell align="right" width={120}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(m.departments || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography color="text.secondary" variant="body2">
                              No state departments yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        m.departments.map((d) => (
                          <TableRow key={d.departmentId ?? d.id}>
                            <TableCell>{d.name}</TableCell>
                            <TableCell>{d.alias || '—'}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeptForm({ name: d.name, alias: d.alias || '' });
                                  setDeptDialog({ open: true, ministry: m, editing: d });
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  setDeleteDept({
                                    ministryId: m.ministryId ?? m.id,
                                    departmentId: d.departmentId ?? d.id,
                                    name: d.name,
                                  })
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
          {filteredTree.length === 0 && (
            <Typography color="text.secondary">No ministries match your search.</Typography>
          )}
        </Stack>
      )}

      <Dialog open={ministryDialog.open} onClose={() => setMinistryDialog({ open: false, editing: null })}>
        <DialogTitle>{ministryDialog.editing ? 'Edit ministry' : 'Add ministry'}</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 400 }}>
          <TextField
            fullWidth
            label="Name"
            margin="dense"
            value={ministryForm.name}
            onChange={(e) => setMinistryForm((p) => ({ ...p, name: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Alias (optional)"
            margin="dense"
            value={ministryForm.alias}
            onChange={(e) => setMinistryForm((p) => ({ ...p, alias: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMinistryDialog({ open: false, editing: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveMinistry}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deptDialog.open} onClose={() => setDeptDialog({ open: false, ministry: null, editing: null })}>
        <DialogTitle>
          {deptDialog.editing ? 'Edit state department' : 'Add state department'}
          {deptDialog.ministry ? ` — ${deptDialog.ministry.name}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 400 }}>
          <TextField
            fullWidth
            label="Name"
            margin="dense"
            value={deptForm.name}
            onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Alias (optional)"
            margin="dense"
            value={deptForm.alias}
            onChange={(e) => setDeptForm((p) => ({ ...p, alias: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptDialog({ open: false, ministry: null, editing: null })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveDept}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteMinistry} onClose={() => setDeleteMinistry(null)}>
        <DialogTitle>Remove ministry?</DialogTitle>
        <DialogContent>
          <Typography>
            This will unlink state departments from &quot;{deleteMinistry?.name}&quot;. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMinistry(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteMinistry}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteDept} onClose={() => setDeleteDept(null)}>
        <DialogTitle>Remove state department?</DialogTitle>
        <DialogContent>
          <Typography>Remove &quot;{deleteDept?.name}&quot;?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDept(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteDept}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
