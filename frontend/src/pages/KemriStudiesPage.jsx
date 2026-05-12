import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Payments as FundingIcon,
  CheckCircle as ActiveIcon,
  HourglassEmpty as PreStudyIcon,
  ArchiveOutlined as ClosedIcon,
  DescriptionOutlined as FormIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import kemriService from '../api/kemriService';
import { formatCurrency, ragMeta, humanise } from '../utils/kemriFormat';

const RAG_COLOR = {
  green: 'success',
  amber: 'warning',
  red: 'error',
  pending: 'default',
};

function SummaryTile({ icon: Icon, label, value, sub, color = 'primary.main' }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent sx={{ py: 1.75 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 38, height: 38, borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: (t) => `${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,90,154,0.08)'}`,
              color,
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
            {sub ? <Typography variant="caption" color="text.secondary">{sub}</Typography> : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function KemriStudiesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await kemriService.listProjects(query ? { q: query } : {});
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load research studies:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const columns = useMemo(() => [
    {
      field: 'kimesProjectId',
      headerName: 'KIMES Project ID',
      width: 220,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {p.value}
        </Typography>
      ),
    },
    { field: 'title', headerName: 'Study title', flex: 2, minWidth: 280 },
    { field: 'centreName', headerName: 'Centre', flex: 1, minWidth: 180 },
    {
      field: 'studyType',
      headerName: 'Type',
      width: 150,
      renderCell: (p) => (p.value ? humanise(p.value) : '—'),
    },
    {
      field: 'primaryDonorName',
      headerName: 'Primary donor',
      flex: 1,
      minWidth: 180,
      renderCell: (p) => p.value || '—',
    },
    {
      field: 'fundingAmount',
      headerName: 'Funding',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      renderCell: (p) => formatCurrency(p.row?.fundingAmount, p.row?.fundingCurrency || 'KES', { compact: true }),
    },
    {
      field: 'ragStatus',
      headerName: 'RAG',
      width: 110,
      renderCell: (p) => {
        const v = (p.value || 'pending').toLowerCase();
        return <Chip size="small" label={v.toUpperCase()} color={RAG_COLOR[v] || 'default'} />;
      },
    },
    {
      field: 'status',
      headerName: 'Phase',
      width: 140,
      renderCell: (p) => (
        <Chip size="small" label={humanise(p.value)} variant="outlined" />
      ),
    },
    {
      field: '__export',
      headerName: 'Form',
      width: 80,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (p) => (
        <Tooltip title="Open a printable / .docx copy of the KEMRI v05 monitoring form, pre-filled from KIMES.">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); navigate(`/kemri/studies/${p.row.id}/form-export`); }}
            aria-label="Export filled form"
          >
            <FormIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [navigate]);

  const summary = useMemo(() => {
    const total = rows.length;
    const byStatus = rows.reduce((acc, r) => {
      const k = (r.status || 'unknown').toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const totalFunding = rows.reduce((acc, r) => acc + Number(r.fundingAmount || 0), 0);
    return {
      total,
      active: byStatus.active || 0,
      preStudy: byStatus.pre_study || 0,
      closed: (byStatus.closed || 0) + (byStatus.terminated || 0),
      totalFunding,
    };
  }, [rows]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ScienceIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Research Studies Registry
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Every grant-funded study at KEMRI, from registration to seven-year post-study tracking.
              </Typography>
            </Box>
          </Stack>
        </Box>
        <TextField
          size="small"
          placeholder="Search title or KIMES ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && refresh()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 260 }}
        />
        <IconButton onClick={refresh} aria-label="Refresh">
          {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/kemri/studies/new')}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Register study
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <SummaryTile icon={ScienceIcon} label="Total studies" value={summary.total} sub="In KIMES registry" />
        </Grid>
        <Grid item xs={6} md={3}>
          <SummaryTile icon={ActiveIcon} label="Active" value={summary.active} sub="Implementation phase" color="#2e7d32" />
        </Grid>
        <Grid item xs={6} md={3}>
          <SummaryTile icon={PreStudyIcon} label="Pre-study" value={summary.preStudy} sub="Awaiting approvals / start" color="#ed6c02" />
        </Grid>
        <Grid item xs={6} md={3}>
          <SummaryTile
            icon={FundingIcon}
            label="Portfolio funding"
            value={formatCurrency(summary.totalFunding, 'KES', { compact: true })}
            sub={`Across ${summary.total} studies`}
            color="#1565c0"
          />
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 640, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              getRowId={(r) => r.id}
              density="comfortable"
              disableRowSelectionOnClick
              onRowClick={(p) => navigate(`/kemri/studies/${p.id}`)}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{
                border: 0,
                '& .MuiDataGrid-row': { cursor: 'pointer' },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,90,154,0.04)',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,90,154,0.04)',
                  fontWeight: 700,
                },
              }}
              slots={{
                noRowsOverlay: () => (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', gap: 1.5, p: 3 }}>
                    <ScienceIcon sx={{ fontSize: 56, color: 'primary.main', opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {query ? 'No studies match your search' : 'No research studies registered yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 420 }}>
                      Register the first study and KIMES will mint a unique Project ID, open
                      the logframe shell, and notify the Centre Director.
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/kemri/studies/new')}>
                      Register study
                    </Button>
                  </Stack>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
