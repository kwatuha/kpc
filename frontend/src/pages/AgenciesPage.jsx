import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, CircularProgress, IconButton,
  Snackbar, Alert, Stack, useTheme, Grid, Card, CardContent,
  Checkbox, FormControlLabel,
} from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Business as BusinessIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUpload as UploadIcon,
  FileUpload as FileUploadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext.jsx';
import { tokens } from "./dashboard/theme";
import Header from "./dashboard/Header";

function AgenciesPage() {
  const { user, hasPrivilege } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isLight = theme.palette.mode === 'light';

  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAgency, setCurrentAgency] = useState(null);
  const [formData, setFormData] = useState({
    ministry: '',
    state_department: '',
    agency_name: '',
    alias: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);

  // Import dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [serverImportPath, setServerImportPath] = useState('/app/adp/agencies.csv');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);

  // Export states
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportAll, setExportAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch agencies with pagination
  const fetchAgencies = async (page = pagination.page, limit = pagination.limit, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }
      
      const response = await axiosInstance.get(`/agencies?${params.toString()}`);
      
      if (response.data.message && response.data.message.includes('does not exist')) {
        setAgencies([]);
        setPagination({
          page: 0,
          limit: 50,
          total: 0,
          totalPages: 0,
        });
        setError(response.data.message);
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'warning'
        });
        return;
      }
      
      setAgencies(response.data.data || []);
      setPagination({
        page,
        limit,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      });
    } catch (err) {
      console.error('Error fetching agencies:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch agencies';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handlePageChange = (newPage) => {
    fetchAgencies(newPage, pagination.limit, searchQuery);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchAgencies(0, newPageSize, searchQuery);
  };

  const handleSearch = () => {
    fetchAgencies(0, pagination.limit, searchQuery);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    fetchAgencies(0, pagination.limit, '');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.agency_name.trim()) {
      errors.agency_name = 'Agency name is required';
    }
    if (!formData.ministry.trim()) {
      errors.ministry = 'Ministry is required';
    }
    if (!formData.state_department.trim()) {
      errors.state_department = 'State Department is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (currentAgency) {
        response = await axiosInstance.put(`/agencies/${currentAgency.id}`, formData);
        console.log('Update response:', response.data);
        setSnackbar({
          open: true,
          message: 'Agency updated successfully',
          severity: 'success'
        });
      } else {
        response = await axiosInstance.post('/agencies', formData);
        console.log('Create response:', response.data);
        setSnackbar({
          open: true,
          message: 'Agency created successfully',
          severity: 'success'
        });
      }
      setOpenDialog(false);
      resetForm();
      // Force refresh by updating key and fetching
      setRefreshKey(prev => prev + 1);
      // Small delay to ensure database commit
      setTimeout(() => {
        fetchAgencies(pagination.page, pagination.limit, searchQuery);
      }, 100);
    } catch (err) {
      console.error('Error saving agency:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to save agency';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!agencyToDelete) return;

    try {
      await axiosInstance.delete(`/agencies/${agencyToDelete.id}`);
      setSnackbar({
        open: true,
        message: 'Agency deleted successfully',
        severity: 'success'
      });
      setDeleteConfirmOpen(false);
      setAgencyToDelete(null);
      fetchAgencies(pagination.page, pagination.limit, searchQuery);
    } catch (err) {
      console.error('Error deleting agency:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to delete agency',
        severity: 'error'
      });
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setSnackbar({
        open: true,
        message: 'Please select a CSV file',
        severity: 'error'
      });
      return;
    }

    setImporting(true);
    setImportProgress(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await axiosInstance.post('/agencies/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportProgress(response.data);
      setSnackbar({
        open: true,
        message: `Import completed: ${response.data.imported} imported, ${response.data.skipped} skipped`,
        severity: response.data.errors?.length > 0 ? 'warning' : 'success'
      });

      fetchAgencies(pagination.page, pagination.limit, searchQuery);
      
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportFile(null);
        setImportProgress(null);
      }, 3000);
    } catch (err) {
      console.error('Error importing agencies:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to import agencies',
        severity: 'error'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportFromPath = async () => {
    const normalizedPath = (serverImportPath || '').trim();
    if (!normalizedPath) {
      setSnackbar({
        open: true,
        message: 'Please provide a server file path',
        severity: 'error'
      });
      return;
    }

    setImporting(true);
    setImportProgress(null);

    try {
      const response = await axiosInstance.post('/agencies/import-from-path', {
        path: normalizedPath
      });

      setImportProgress(response.data);
      setSnackbar({
        open: true,
        message: `Import completed: ${response.data.imported} imported, ${response.data.skipped} skipped`,
        severity: response.data.errors?.length > 0 ? 'warning' : 'success'
      });

      fetchAgencies(pagination.page, pagination.limit, searchQuery);
      
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportProgress(null);
      }, 3000);
    } catch (err) {
      console.error('Error importing agencies:', err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to import agencies',
        severity: 'error'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCreate = () => {
    setCurrentAgency(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (agency) => {
    setCurrentAgency(agency);
    setFormData({
      ministry: agency.ministry || '',
      state_department: agency.state_department || '',
      agency_name: agency.agency_name || '',
      alias: agency.alias || '',
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      ministry: '',
      state_department: '',
      agency_name: '',
      alias: '',
    });
    setFormErrors({});
    setCurrentAgency(null);
  };

  const fetchAllAgencies = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await axiosInstance.get(`/agencies/export/all?${params.toString()}`);
      return response.data.data || [];
    } catch (err) {
      console.error('Error fetching all agencies:', err);
      throw err;
    }
  };

  const handleExportToExcel = async () => {
    setExportingExcel(true);
    try {
      let agenciesToExport = agencies;
      if (exportAll) {
        agenciesToExport = await fetchAllAgencies();
      }
      
      if (agenciesToExport.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No agencies to export', 
          severity: 'warning' 
        });
        setExportingExcel(false);
        return;
      }

      const visibleColumns = columns.filter(col => col.field !== 'actions');
      
      const dataToExport = agenciesToExport.map((agency) => {
        const row = {};
        visibleColumns.forEach(col => {
          let value = agency[col.field];
          if (value === null || value === undefined || value === '') {
            value = 'N/A';
          } else if (col.field === 'created_at' || col.field === 'updated_at') {
            if (value) {
              value = new Date(value).toLocaleDateString();
            } else {
              value = 'N/A';
            }
          }
          row[col.headerName] = value;
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Agencies");
      
      const dateStr = new Date().toISOString().split('T')[0];
      const hasSearch = searchQuery && searchQuery.trim() !== '';
      const filename = hasSearch 
        ? `agencies_export_filtered_${dateStr}.xlsx`
        : `agencies_export_${dateStr}.xlsx`;
      
      XLSX.writeFile(workbook, filename);
      setSnackbar({ 
        open: true, 
        message: `Exported ${agenciesToExport.length} agenc${agenciesToExport.length !== 1 ? 'ies' : 'y'} to Excel successfully!`, 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setSnackbar({ open: true, message: 'Failed to export to Excel. Please try again.', severity: 'error' });
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportToPDF = async () => {
    setExportingPdf(true);
    try {
      let agenciesToExport = agencies;
      if (exportAll) {
        agenciesToExport = await fetchAllAgencies();
      }
      
      if (agenciesToExport.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No agencies to export', 
          severity: 'warning' 
        });
        return;
      }

      const visibleColumns = columns.filter(col => col.field !== 'actions');
      
      const headers = visibleColumns.map(col => col.headerName);
      const dataRows = agenciesToExport.map(agency => {
        return visibleColumns.map(col => {
          let value = agency[col.field];
          if (value === null || value === undefined || value === '') {
            return 'N/A';
          } else if (col.field === 'created_at' || col.field === 'updated_at') {
            if (value) {
              return new Date(value).toLocaleDateString();
            }
            return 'N/A';
          }
          return String(value);
        });
      });
      
      const doc = new jsPDF('landscape', 'pt', 'a4');
      
      autoTable(doc, {
        head: [headers],
        body: dataRows,
        startY: 20,
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255, 
          fontStyle: 'bold' 
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 20, left: 40, right: 40 },
      });
      
      const dateStr = new Date().toISOString().split('T')[0];
      const hasSearch = searchQuery && searchQuery.trim() !== '';
      const filename = hasSearch 
        ? `agencies_export_filtered_${dateStr}.pdf`
        : `agencies_export_${dateStr}.pdf`;
      
      doc.save(filename);
      setSnackbar({ 
        open: true, 
        message: `Exported ${agenciesToExport.length} agenc${agenciesToExport.length !== 1 ? 'ies' : 'y'} to PDF successfully!`, 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setSnackbar({ open: true, message: 'Failed to export to PDF. Please try again.', severity: 'error' });
    } finally {
      setExportingPdf(false);
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: false,
    },
    {
      field: 'ministry',
      headerName: 'Ministry',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'state_department',
      headerName: 'State Department',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'agency_name',
      headerName: 'Agency / Institution',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'alias',
      headerName: 'Alias',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          fontStyle: params.value ? 'normal' : 'italic',
          color: params.value ? 'text.primary' : 'text.secondary'
        }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box 
          sx={{ display: 'flex', gap: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row);
            }}
            sx={{ color: colors.blueAccent[500] }}
            title="Edit Agency"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAgencyToDelete(params.row);
              setDeleteConfirmOpen(true);
            }}
            sx={{ color: colors.redAccent[500] }}
            title="Delete Agency"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const compactActionButtonSx = {
    fontSize: '0.75rem',
    py: 0.5,
    px: 1,
    minWidth: 'auto',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    '& .MuiButton-startIcon': {
      mr: 0.5,
      '& > *': { fontSize: '0.95rem' },
    },
  };

  return (
    <Box m="20px">
      <Header title="Agencies" subtitle="Manage government agencies and institutions" />
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BusinessIcon sx={{ fontSize: 40, color: colors.blueAccent[500] }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {pagination.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Agencies
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
          minWidth: 0,
          overflowX: 'auto',
          pb: 0.25,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
          },
        }}
      >
        <TextField
          placeholder="Search agencies..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchQuery && (
              <IconButton
                size="small"
                onClick={handleSearchClear}
                sx={{ mr: -1 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{
            width: 280,
            flex: '0 0 auto',
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: 0.5,
            flex: '0 0 auto',
            ml: 'auto',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={exportAll}
                onChange={(e) => setExportAll(e.target.checked)}
                size="small"
              />
            }
            label="Export All"
            sx={{
              mr: 0,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              '& .MuiFormControlLabel-label': { fontSize: '0.75rem' },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
            sx={{
              ...compactActionButtonSx,
              borderColor: colors.greenAccent[500],
              color: colors.greenAccent[500],
              '&:hover': {
                borderColor: colors.greenAccent[600],
                backgroundColor: colors.greenAccent[100],
              },
            }}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={exportingExcel ? <CircularProgress size={14} color="inherit" /> : <ExcelIcon />}
            onClick={handleExportToExcel}
            disabled={exportingExcel || (!exportAll && agencies.length === 0)}
            sx={{
              ...compactActionButtonSx,
              borderColor: colors.greenAccent[500],
              color: colors.greenAccent[500],
              '&:hover': {
                borderColor: colors.greenAccent[600],
                backgroundColor: colors.greenAccent[100],
              },
              '&:disabled': {
                borderColor: colors.grey[400],
                color: colors.grey[400],
              },
            }}
          >
            {exportingExcel ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={exportingPdf ? <CircularProgress size={14} color="inherit" /> : <PdfIcon />}
            onClick={handleExportToPDF}
            disabled={exportingPdf || (!exportAll && agencies.length === 0)}
            sx={{
              ...compactActionButtonSx,
              borderColor: colors.redAccent[500],
              color: colors.redAccent[500],
              '&:hover': {
                borderColor: colors.redAccent[600],
                backgroundColor: colors.redAccent[100],
              },
              '&:disabled': {
                borderColor: colors.grey[400],
                color: colors.grey[400],
              },
            }}
          >
            {exportingPdf ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              ...compactActionButtonSx,
              backgroundColor: colors.blueAccent[500],
              '&:hover': {
                backgroundColor: colors.blueAccent[600],
              },
            }}
          >
            Add Agency
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          key={refreshKey}
          rows={agencies}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={{ page: pagination.page, pageSize: pagination.limit }}
          onPaginationModelChange={(model) => {
            handlePageChange(model.page);
            if (model.pageSize !== pagination.limit) {
              handlePageSizeChange(model.pageSize);
            }
          }}
          rowCount={pagination.total}
          paginationMode="server"
          onRowClick={(params) => {
            if (params.field !== 'actions') {
              handleEdit(params.row);
            }
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${isLight ? colors.grey[200] : colors.grey[700]}`,
              cursor: 'pointer',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isLight ? colors.grey[50] : colors.grey[700],
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isLight ? colors.blueAccent[100] : colors.blueAccent[800],
              borderBottom: `2px solid ${isLight ? colors.blueAccent[300] : colors.blueAccent[600]}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },
            '& .MuiDataGrid-cell[data-field="actions"]': {
              cursor: 'default',
            },
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentAgency ? 'Edit Agency' : 'Add Agency'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Agency / Institution"
                  fullWidth
                  required
                  value={formData.agency_name}
                  onChange={(e) => handleInputChange('agency_name', e.target.value)}
                  error={!!formErrors.agency_name}
                  helperText={formErrors.agency_name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Alias (Short Name)"
                  fullWidth
                  value={formData.alias}
                  onChange={(e) => handleInputChange('alias', e.target.value)}
                  helperText="Optional: A shorter name or abbreviation for use in dashboards and reports"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Ministry"
                  fullWidth
                  required
                  value={formData.ministry}
                  onChange={(e) => handleInputChange('ministry', e.target.value)}
                  error={!!formErrors.ministry}
                  helperText={formErrors.ministry}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="State Department"
                  fullWidth
                  required
                  value={formData.state_department}
                  onChange={(e) => handleInputChange('state_department', e.target.value)}
                  error={!!formErrors.state_department}
                  helperText={formErrors.state_department}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {currentAgency ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          setImportFile(null);
          setImportProgress(null);
          setServerImportPath('/app/adp/agencies.csv');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Agencies from CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a CSV file with the following columns: Ministry, State Department, Agency / Institution
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUploadIcon />}
              fullWidth
            >
              Select CSV File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
            </Button>

            {importFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {importFile.name}
              </Typography>
            )}

            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                OR
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Server CSV Path"
                value={serverImportPath}
                onChange={(e) => setServerImportPath(e.target.value)}
                placeholder="/app/adp/agencies.csv"
                sx={{ mb: 1.5, textAlign: 'left' }}
                helperText="Path must exist on the API server/container filesystem"
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={handleImportFromPath}
                disabled={importing}
                fullWidth
              >
                Import from Server Path
              </Button>
            </Box>

            {importProgress && (
              <Alert severity="info">
                <Typography variant="body2">
                  Imported: {importProgress.imported} | Skipped: {importProgress.skipped} | Total: {importProgress.total}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setImportDialogOpen(false);
            setImportFile(null);
            setImportProgress(null);
            setServerImportPath('/app/adp/agencies.csv');
          }}>
            Close
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!importFile || importing}
            startIcon={importing ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {importing ? 'Importing...' : 'Import File'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setAgencyToDelete(null); }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{agencyToDelete?.agency_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteConfirmOpen(false); setAgencyToDelete(null); }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AgenciesPage;
