import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Close as CancelIcon,
  DescriptionOutlined as FormIcon,
} from '@mui/icons-material';
import kemriService from '../api/kemriService';
import {
  KEMRI_MENU_PROPS,
  KEMRI_MENU_PROPS_WIDE,
  ragMeta,
  formatCurrency,
} from '../utils/kemriFormat';
import KemriStudyExtendedSections from './KemriStudyExtendedSections';

/**
 * Minimum widths for the Select dropdowns used in this form. Keeping them in
 * one place ensures consistent behaviour regardless of the Grid breakpoint.
 */
const SELECT_MIN_W = {
  short:  140,   // currency, project type, mechanism
  medium: 200,   // study type, contract type
  long:   260,   // centre, programme, donor (long names)
  wide:   320,   // multi-selects (SDG, KRA)
};

const STUDY_TYPES = [
  'basic', 'clinical', 'translational', 'epidemiological', 'health_services',
  'biomedical_engineering', 'pharmacology', 'health_policy', 'precision_medicine', 'global_health',
];
const CONTRACT_TYPES = [
  'standard', 'program_project', 'cooperative', 'clinical_trial', 'mou', 'consortium',
];
const SDG_OPTIONS = [
  '1. No Poverty', '2. Zero Hunger', '3. Good Health and Well-Being', '4. Quality Education',
  '5. Gender Equality', '6. Clean Water and Sanitation', '8. Decent Work and Economic Growth',
  '9. Industry Innovation and Infrastructure', '10. Reduced Inequalities', '13. Climate Action',
  '17. Partnerships for the Goals',
];
const KRA_OPTIONS = [
  'Research for Human Health',
  'Innovation and Product Development',
  'Disease Surveillance and Response',
  'Research Capacity Building',
  'Financial Sustainability',
  'Institutional Strengthening',
];

const emptyState = () => ({
  projectType: 'external',
  accountNumber: '',
  title: '',
  shortName: '',
  piPayrollNo: '',
  centreId: '',
  programmeId: '',
  primaryDonorId: '',
  fundingAmount: '',
  fundingCurrency: 'KES',
  fundingMechanism: 'solicited',
  studyType: '',
  contractType: '',
  contractNumber: '',
  grantNumber: '',
  kemriLegalNumber: '',
  seruApprovalNo: '',
  seruApprovalDate: '',
  seruExpiryDate: '',
  nacostiApprovalNo: '',
  nacostiApprovalDate: '',
  proposedStartDate: '',
  proposedEndDate: '',
  primaryOrg: 'KEMRI',
  primaryOrgCountry: 'Kenya',
  programmeArea: '',
  researchPriority: '',
  sdgCodes: [],
  strategicPlanKras: [],
  // KEMRI Strategic Plan 2023-2027 alignment (subprograms FK)
  primaryObjectiveId: '',
  linkedObjectiveIds: [],
  objectives: [{ description: '' }],
  coinvestigators: [],
  sites: [{ siteName: '', country: 'Kenya', county: '', subCounty: '', latitude: '', longitude: '' }],
});

function SectionTitle({ idx, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
      <Box
        sx={{
          width: 32, height: 32, borderRadius: '50%',
          bgcolor: 'primary.main', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700,
        }}
      >
        {idx}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

export default function KemriStudyRegistrationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyState());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [centres, setCentres] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [donors, setDonors] = useState([]);
  // KEMRI Strategic Plan 2023-2027 strategic objectives (subprograms)
  const [strategicObjectives, setStrategicObjectives] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, p, d, sp] = await Promise.all([
          kemriService.listCentres(),
          kemriService.listProgrammes(),
          kemriService.listDonors(),
          kemriService.listStrategicObjectives().catch(() => []),
        ]);
        setCentres(c || []);
        setProgrammes(p || []);
        setDonors(d || []);
        setStrategicObjectives(sp || []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return undefined;
    setLoading(true);
    kemriService
      .getProject(id)
      .then((p) => {
        setForm({
          ...emptyState(),
          ...p,
          // Date inputs need YYYY-MM-DD format only
          seruApprovalDate: (p.seruApprovalDate || '').slice(0, 10),
          seruExpiryDate: (p.seruExpiryDate || '').slice(0, 10),
          nacostiApprovalDate: (p.nacostiApprovalDate || '').slice(0, 10),
          proposedStartDate: (p.proposedStartDate || '').slice(0, 10),
          proposedEndDate: (p.proposedEndDate || '').slice(0, 10),
          objectives: p.objectives?.length ? p.objectives.map((o) => ({ description: o.description })) : [{ description: '' }],
          sites: p.sites?.length ? p.sites : emptyState().sites,
          coinvestigators: p.coinvestigators || [],
          sdgCodes: p.sdgCodes || [],
          strategicPlanKras: p.strategicPlanKras || [],
          primaryObjectiveId: p.primaryObjectiveId || '',
          linkedObjectiveIds: (p.strategicLinks || []).map((l) => l.id),
        });
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
    return undefined;
  }, [id, isEdit]);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMultiField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value }));

  const updateNestedItem = (key, idx, patch) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));
  const addNestedItem = (key, blank) =>
    setForm((f) => ({ ...f, [key]: [...f[key], blank] }));
  const removeNestedItem = (key, idx) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const canSave = useMemo(() => Boolean(form.title && form.title.trim()), [form.title]);

  const handleSubmit = async () => {
    if (!canSave) {
      setError('A study title is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        fundingAmount: form.fundingAmount ? Number(form.fundingAmount) : null,
        centreId: form.centreId || null,
        programmeId: form.programmeId || null,
        primaryDonorId: form.primaryDonorId || null,
        seruApprovalDate: form.seruApprovalDate || null,
        seruExpiryDate: form.seruExpiryDate || null,
        nacostiApprovalDate: form.nacostiApprovalDate || null,
        proposedStartDate: form.proposedStartDate || null,
        proposedEndDate: form.proposedEndDate || null,
        objectives: form.objectives.filter((o) => o.description && o.description.trim()),
        sites: form.sites
          .filter((s) => s.siteName && s.siteName.trim())
          .map((s) => ({
            ...s,
            latitude: s.latitude ? Number(s.latitude) : null,
            longitude: s.longitude ? Number(s.longitude) : null,
          })),
        coinvestigators: form.coinvestigators.filter((c) => c.fullName && c.fullName.trim()),
      };
      if (isEdit) {
        await kemriService.updateProject(id, payload);
        setSuccess('Study updated.');
      } else {
        const res = await kemriService.createProject(payload);
        setSuccess(`Study registered. KIMES Project ID: ${res.kimesProjectId}`);
        setTimeout(() => navigate(`/kemri/studies/${res.id}`), 1200);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save study');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/kemri/studies')} aria-label="Back">
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.25 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isEdit ? 'Edit research study' : 'Register a research study'}
            </Typography>
            {isEdit && form.kimesProjectId ? (
              <Chip
                size="small"
                label={form.kimesProjectId}
                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                color="primary"
                variant="outlined"
              />
            ) : null}
            {isEdit && form.ragStatus ? (
              <Chip
                size="small"
                label={(form.ragStatus || 'pending').toUpperCase()}
                sx={{
                  fontWeight: 700,
                  bgcolor: `${ragMeta(form.ragStatus).hex}1F`,
                  color: ragMeta(form.ragStatus).hex,
                }}
              />
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            KEMRI Form v05 (sections 1–4). KIMES generates the unique Project ID, opens the
            logframe shell, and notifies your Centre Director.
          </Typography>
        </Box>
        {isEdit && id ? (
          <Button
            variant="outlined"
            startIcon={<FormIcon />}
            onClick={() => navigate(`/kemri/studies/${id}/form-export`)}
          >
            Export filled form
          </Button>
        ) : null}
        <Button
          variant="text"
          color="inherit"
          startIcon={<CancelIcon />}
          onClick={() => navigate('/kemri/studies')}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={submitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SaveIcon />}
          disabled={submitting || !canSave}
          onClick={handleSubmit}
        >
          {isEdit ? 'Save changes' : 'Register study'}
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Stack spacing={2.5}>
        {/* SECTION 1 — GRANT INFO */}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <SectionTitle idx={1} title="Grant information" subtitle="KEMRI Form §1" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth required label="Project / Study title" value={form.title}
                onChange={setField('title')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Short name / acronym" value={form.shortName} onChange={setField('shortName')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Account number" value={form.accountNumber} onChange={setField('accountNumber')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.medium }}>
                <InputLabel>Project type</InputLabel>
                <Select
                  label="Project type"
                  value={form.projectType}
                  onChange={setField('projectType')}
                  MenuProps={KEMRI_MENU_PROPS}
                >
                  <MenuItem value="external">External (donor-funded)</MenuItem>
                  <MenuItem value="local">Local (KEMRI / GoK)</MenuItem>
                  <MenuItem value="collaborative">Collaborative agreement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.medium }}>
                <InputLabel>Funding mechanism</InputLabel>
                <Select
                  label="Funding mechanism"
                  value={form.fundingMechanism}
                  onChange={setField('fundingMechanism')}
                  MenuProps={KEMRI_MENU_PROPS}
                >
                  <MenuItem value="solicited">Solicited</MenuItem>
                  <MenuItem value="unsolicited">Unsolicited</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.medium }}>
                <InputLabel>Study type</InputLabel>
                <Select
                  label="Study type"
                  value={form.studyType}
                  onChange={setField('studyType')}
                  MenuProps={KEMRI_MENU_PROPS}
                >
                  {STUDY_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.medium }}>
                <InputLabel>Contract type</InputLabel>
                <Select
                  label="Contract type"
                  value={form.contractType}
                  onChange={setField('contractType')}
                  MenuProps={KEMRI_MENU_PROPS}
                >
                  {CONTRACT_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.long }}>
                <InputLabel>KEMRI Centre</InputLabel>
                <Select
                  label="KEMRI Centre"
                  value={form.centreId}
                  onChange={setField('centreId')}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {centres.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}>
                        {c.code}
                      </Box>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.long }}>
                <InputLabel>Programme</InputLabel>
                <Select
                  label="Programme"
                  value={form.programmeId}
                  onChange={setField('programmeId')}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}>
                        {p.code}
                      </Box>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.long }}>
                <InputLabel>Primary donor</InputLabel>
                <Select
                  label="Primary donor"
                  value={form.primaryDonorId}
                  onChange={setField('primaryDonorId')}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {donors.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.acronym ? (
                        <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}>
                          {d.acronym}
                        </Box>
                      ) : null}
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth type="number" label="Funding amount" value={form.fundingAmount}
                onChange={setField('fundingAmount')}
                helperText={
                  form.fundingAmount
                    ? `Total: ${formatCurrency(form.fundingAmount, form.fundingCurrency)}`
                    : ' '
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.short }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  label="Currency"
                  value={form.fundingCurrency}
                  onChange={setField('fundingCurrency')}
                  MenuProps={KEMRI_MENU_PROPS}
                >
                  {['KES', 'USD', 'EUR', 'GBP', 'CHF', 'JPY'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Contract number" value={form.contractNumber} onChange={setField('contractNumber')} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Grant number" value={form.grantNumber} onChange={setField('grantNumber')} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="KEMRI legal no." value={form.kemriLegalNumber} onChange={setField('kemriLegalNumber')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="PI payroll no." value={form.piPayrollNo} onChange={setField('piPayrollNo')} />
            </Grid>
          </Grid>
        </Paper>

        {/* SECTION 2 — COMPLIANCE */}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <SectionTitle idx={2} title="Project compliance" subtitle="KEMRI Form §2 — SERU & NACOSTI approvals" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="SERU approval no." value={form.seruApprovalNo} onChange={setField('seruApprovalNo')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="SERU approval date" InputLabelProps={{ shrink: true }} value={form.seruApprovalDate} onChange={setField('seruApprovalDate')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="SERU expiry date" InputLabelProps={{ shrink: true }} value={form.seruExpiryDate} onChange={setField('seruExpiryDate')} />
            </Grid>
            <Grid item xs={12} md={3} />
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="NACOSTI approval no." value={form.nacostiApprovalNo} onChange={setField('nacostiApprovalNo')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="NACOSTI approval date" InputLabelProps={{ shrink: true }} value={form.nacostiApprovalDate} onChange={setField('nacostiApprovalDate')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Proposed start date" InputLabelProps={{ shrink: true }} value={form.proposedStartDate} onChange={setField('proposedStartDate')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="Proposed end date" InputLabelProps={{ shrink: true }} value={form.proposedEndDate} onChange={setField('proposedEndDate')} />
            </Grid>
          </Grid>
        </Paper>

        {/* SECTION 3 — IMPLEMENTATION */}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <SectionTitle idx={3} title="Project implementation" subtitle="KEMRI Form §3 — sites, co-investigators, objectives" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Primary implementing organisation" value={form.primaryOrg} onChange={setField('primaryOrg')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Country" value={form.primaryOrgCountry} onChange={setField('primaryOrgCountry')} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Implementation sites</Typography>
              <Button
                size="small" startIcon={<AddIcon />}
                onClick={() => addNestedItem('sites', {
                  siteName: '', country: 'Kenya', county: '', subCounty: '', latitude: '', longitude: '',
                })}
              >
                Add site
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              {form.sites.map((s, i) => (
                <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth size="small" label="Site name" value={s.siteName} onChange={(e) => updateNestedItem('sites', i, { siteName: e.target.value })} />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <TextField fullWidth size="small" label="Country" value={s.country} onChange={(e) => updateNestedItem('sites', i, { country: e.target.value })} />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <TextField fullWidth size="small" label="County" value={s.county} onChange={(e) => updateNestedItem('sites', i, { county: e.target.value })} />
                      </Grid>
                      <Grid item xs={6} md={1.5}>
                        <TextField fullWidth size="small" label="Latitude" value={s.latitude} onChange={(e) => updateNestedItem('sites', i, { latitude: e.target.value })} />
                      </Grid>
                      <Grid item xs={6} md={1.5}>
                        <TextField fullWidth size="small" label="Longitude" value={s.longitude} onChange={(e) => updateNestedItem('sites', i, { longitude: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <IconButton color="error" onClick={() => removeNestedItem('sites', i)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Co-investigators</Typography>
              <Button
                size="small" startIcon={<AddIcon />}
                onClick={() => addNestedItem('coinvestigators', { fullName: '', qualification: '', specialty: '', institution: '', role: '', email: '' })}
              >
                Add co-investigator
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              {form.coinvestigators.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No co-investigators added yet.</Typography>
              ) : form.coinvestigators.map((c, i) => (
                <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth size="small" label="Full name" value={c.fullName} onChange={(e) => updateNestedItem('coinvestigators', i, { fullName: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField fullWidth size="small" label="Qualification" value={c.qualification} onChange={(e) => updateNestedItem('coinvestigators', i, { qualification: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField fullWidth size="small" label="Specialty" value={c.specialty} onChange={(e) => updateNestedItem('coinvestigators', i, { specialty: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField fullWidth size="small" label="Institution" value={c.institution} onChange={(e) => updateNestedItem('coinvestigators', i, { institution: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField fullWidth size="small" label="Role" value={c.role} onChange={(e) => updateNestedItem('coinvestigators', i, { role: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <IconButton color="error" onClick={() => removeNestedItem('coinvestigators', i)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Project-specific objectives
                <Chip size="small" label="up to 5" sx={{ ml: 1 }} />
              </Typography>
              <Button
                size="small" startIcon={<AddIcon />}
                disabled={form.objectives.length >= 5}
                onClick={() => addNestedItem('objectives', { description: '' })}
              >
                Add objective
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              {form.objectives.map((o, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                  <Chip label={`#${i + 1}`} sx={{ mt: 1.5 }} />
                  <TextField
                    fullWidth multiline minRows={2}
                    placeholder={`Objective ${i + 1}`}
                    value={o.description}
                    onChange={(e) => updateNestedItem('objectives', i, { description: e.target.value })}
                  />
                  <IconButton color="error" sx={{ mt: 0.75 }} onClick={() => removeNestedItem('objectives', i)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* SECTION 4 — STRATEGIC ALIGNMENT */}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <SectionTitle idx={4} title="Strategic alignment" subtitle="KEMRI Form §4 — SDG, KEMRI Strategic Plan, programme area" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.wide }}>
                <InputLabel>Sustainable Development Goals</InputLabel>
                <Select
                  multiple
                  label="Sustainable Development Goals"
                  value={form.sdgCodes}
                  onChange={setMultiField('sdgCodes')}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((v) => <Chip key={v} label={v} size="small" />)}
                    </Box>
                  )}
                >
                  {SDG_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.wide }}>
                <InputLabel>KEMRI Strategic Plan KRAs (legacy tags)</InputLabel>
                <Select
                  multiple
                  label="KEMRI Strategic Plan KRAs (legacy tags)"
                  value={form.strategicPlanKras}
                  onChange={setMultiField('strategicPlanKras')}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((v) => <Chip key={v} label={v} size="small" />)}
                    </Box>
                  )}
                >
                  {KRA_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {/* KEMRI 2023-2027 plan alignment (real subprograms) ---------------- */}
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }}>
                <Chip label="KEMRI Strategic Plan 2023-2027 alignment" size="small" color="primary" variant="outlined" />
              </Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.wide }}>
                <InputLabel>Primary strategic objective</InputLabel>
                <Select
                  label="Primary strategic objective"
                  value={form.primaryObjectiveId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, primaryObjectiveId: e.target.value }))}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {strategicObjectives.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.kraCode}/{o.code} — {o.name.length > 70 ? `${o.name.slice(0, 70)}…` : o.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: SELECT_MIN_W.wide }}>
                <InputLabel>Additional contributing objectives</InputLabel>
                <Select
                  multiple
                  label="Additional contributing objectives"
                  value={form.linkedObjectiveIds || []}
                  onChange={(e) => setForm((f) => ({ ...f, linkedObjectiveIds: e.target.value }))}
                  MenuProps={KEMRI_MENU_PROPS_WIDE}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const o = strategicObjectives.find((x) => x.id === id);
                        return <Chip key={id} size="small" label={o ? `${o.kraCode}/${o.code}` : id} />;
                      })}
                    </Box>
                  )}
                >
                  {strategicObjectives.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.kraCode}/{o.code} — {o.name.length > 70 ? `${o.name.slice(0, 70)}…` : o.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Programme area" value={form.programmeArea} onChange={setField('programmeArea')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Research priority / disease area" value={form.researchPriority} onChange={setField('researchPriority')} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            After registration the rest of KEMRI Form v05 (§5 staff plan, §6 equipment, §7 budget,
            §9 lab analyses, §10 operations feedback, §11 SWOT &amp; lessons) becomes editable
            below. KPIs and the milestone plan (Step 2) are managed from the study detail view.
          </Typography>
        </Paper>

        {isEdit ? (
          <KemriStudyExtendedSections projectId={id} />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              borderStyle: 'dashed',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              KEMRI Form §5 – §11 unlock after registration
            </Typography>
            <Typography variant="body2">
              Save this study first to unlock staff plan, equipment register, financial line items,
              laboratory analyses, operations feedback, and lessons-learned sections.
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Sticky save bar — keeps the primary action reachable on long forms */}
      <Paper
        elevation={6}
        sx={{
          position: 'sticky',
          bottom: 0,
          mt: 3,
          mx: { xs: -2, md: -3 },
          py: 1.25,
          px: { xs: 2, md: 3 },
          borderRadius: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.92)'
              : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {canSave
              ? (isEdit ? 'Changes pending. Save to update KIMES.' : 'Ready to register. KIMES will assign a Project ID.')
              : 'A study title is required before saving.'}
          </Typography>
          <Button onClick={() => navigate('/kemri/studies')} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={submitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SaveIcon />}
            disabled={submitting || !canSave}
            onClick={handleSubmit}
          >
            {isEdit ? 'Save changes' : 'Register study'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
