import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as StaffIcon,
  School as CapBldIcon,
  PrecisionManufacturing as EquipIcon,
  Receipt as BudgetIcon,
  Biotech as LabIcon,
  Forum as FeedbackIcon,
  Insights as SwotIcon,
} from '@mui/icons-material';
import kemriService from '../api/kemriService';
import {
  KEMRI_MENU_PROPS,
  formatCurrency,
  formatPercent,
  humanise,
} from '../utils/kemriFormat';

/**
 * Per-section configuration. Each section declares:
 *   - the field set used for inline editing
 *   - the columns rendered in the row table
 *   - icon and accent colour for visual grouping
 *   - the matching kemriService.sections.<key> client (passed in as `service`)
 *
 * The component uses one shared <SectionTable /> renderer so adding a new
 * KEMRI form section in the future is a config-only change.
 */
const STAFF_FUNDED_BY = ['grant', 'kemri', 'partner', 'other'];
const STAFF_ROLE_CODES = ['R-PI', 'R-CO', 'R-LAB', 'R-DM', 'R-FA', 'R-SC', 'R-CRA'];
const CAP_BLD_TYPES = ['training', 'workshop', 'conference', 'mentorship', 'degree'];
const EQUIPMENT_CATEGORIES = ['lab', 'ict', 'field', 'vehicle', 'infrastructure'];
const EQUIPMENT_STATUSES = ['in_use', 'maintenance', 'retired', 'lost'];
const BUDGET_CATEGORIES = [
  'personnel', 'equipment', 'consumables', 'travel',
  'subcontract', 'indirect', 'publications', 'other',
];
const FEEDBACK_TYPES = ['partner', 'community', 'donor', 'regulatory', 'internal'];
const FEEDBACK_STATUSES = ['open', 'actioned', 'closed'];
const SWOT_CATEGORIES = ['strength', 'weakness', 'opportunity', 'threat', 'lesson'];
const SWOT_COLORS = {
  strength: '#2e7d32',
  weakness: '#c62828',
  opportunity: '#1565c0',
  threat: '#ef6c00',
  lesson: '#6a1b9a',
};

const FIELD_TYPES = {
  text: 'text',
  textarea: 'textarea',
  number: 'number',
  date: 'date',
  select: 'select',
};

/** Inline empty-row factory used when the user hits "Add". */
const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default ?? '' }), {});

function FieldInput({ field, value, onChange }) {
  const common = {
    fullWidth: true,
    size: 'small',
    label: field.label,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
  };
  if (field.type === FIELD_TYPES.select) {
    return (
      <FormControl size="small" fullWidth sx={{ minWidth: 140 }}>
        <InputLabel>{field.label}</InputLabel>
        <Select
          label={field.label}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          MenuProps={KEMRI_MENU_PROPS}
        >
          {field.options.map((o) => (
            <MenuItem key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? humanise(o.value ?? o)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  if (field.type === FIELD_TYPES.textarea) {
    return <TextField {...common} multiline minRows={2} />;
  }
  if (field.type === FIELD_TYPES.number) {
    return <TextField {...common} type="number" inputProps={{ step: field.step || 'any' }} />;
  }
  if (field.type === FIELD_TYPES.date) {
    return <TextField {...common} type="date" InputLabelProps={{ shrink: true }} />;
  }
  return <TextField {...common} />;
}

function SectionTable({
  title, subtitle, accentColor, icon: Icon,
  fields, rows, onAdd, onSave, onRemove,
  renderSummary, addLabel = 'Add row',
}) {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const startNew = () => setDraft(blankFromFields(fields));
  const cancel = () => setDraft(null);

  const submit = async () => {
    setSaving(true);
    try {
      await onAdd(draft);
      setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  const setDraftField = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
        <Icon sx={{ color: accentColor }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: accentColor }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          ) : null}
        </Box>
        {!draft ? (
          <Button size="small" startIcon={<AddIcon />} onClick={startNew} variant="outlined">
            {addLabel}
          </Button>
        ) : null}
      </Stack>

      {draft ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,90,154,0.03)' }}>
          <Grid container spacing={1.5}>
            {fields.map((f) => (
              <Grid key={f.key} item xs={12} md={f.colSpan || 4}>
                <FieldInput field={f} value={draft[f.key]} onChange={setDraftField(f.key)} />
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} justifyContent="flex-end">
            <Button onClick={cancel}>Cancel</Button>
            <Button
              variant="contained"
              onClick={submit}
              disabled={saving || fields.some((f) => f.required && (!draft[f.key] && draft[f.key] !== 0))}
              startIcon={saving ? <CircularProgress size={16} /> : null}
            >
              Save row
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {(rows || []).length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No entries yet.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((row) => (
            <Paper
              key={row.id}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>{renderSummary(row)}</Box>
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemove(row.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

const SECTION_DEFS = [
  {
    sectionNumber: 5,
    key: 'staff',
    serviceKey: 'staff',
    title: '§5 · Human Resource — Staff plan',
    subtitle: 'Researchers, lab staff, data managers and admin people involved in this study.',
    icon: StaffIcon,
    accentColor: '#1976d2',
    addLabel: 'Add staff member',
    fields: [
      { key: 'staffName', label: 'Full name', type: 'text', required: true, colSpan: 4 },
      { key: 'role', label: 'Role / title', type: 'text', colSpan: 3 },
      { key: 'roleCode', label: 'KEMRI role code', type: 'select', options: STAFF_ROLE_CODES.map((v) => ({ value: v, label: v })), colSpan: 2 },
      { key: 'qualification', label: 'Qualification', type: 'text', colSpan: 3 },
      { key: 'fte', label: 'FTE (0–1)', type: 'number', step: 0.05, colSpan: 2 },
      { key: 'payrollNo', label: 'Payroll no.', type: 'text', colSpan: 2 },
      { key: 'startDate', label: 'Start', type: 'date', colSpan: 2 },
      { key: 'endDate', label: 'End', type: 'date', colSpan: 2 },
      { key: 'fundedBy', label: 'Funded by', type: 'select', options: STAFF_FUNDED_BY.map((v) => ({ value: v, label: humanise(v) })), colSpan: 2 },
      { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 12 },
    ],
    renderSummary: (row) => (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{row.staffName}</Typography>
          {row.roleCode ? <Chip size="small" variant="outlined" label={row.roleCode} /> : null}
          {row.fte ? <Chip size="small" label={`${Number(row.fte) * 100}% FTE`} /> : null}
          {row.fundedBy ? <Chip size="small" color="primary" variant="outlined" label={humanise(row.fundedBy)} /> : null}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {row.role || '—'}{row.qualification ? ` · ${row.qualification}` : ''}
        </Typography>
      </Box>
    ),
  },
  {
    sectionNumber: 5,
    key: 'capacityBuilding',
    serviceKey: 'capacityBuilding',
    title: '§5 · Capacity building events',
    subtitle: 'Training, workshops, conferences, mentorship, and degree sponsorship arising from the study.',
    icon: CapBldIcon,
    accentColor: '#2e7d32',
    addLabel: 'Add training event',
    fields: [
      { key: 'eventTitle', label: 'Event title', type: 'text', required: true, colSpan: 6 },
      { key: 'eventType', label: 'Type', type: 'select', options: CAP_BLD_TYPES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 3 },
      { key: 'startDate', label: 'Start date', type: 'date', colSpan: 3 },
      { key: 'endDate', label: 'End date', type: 'date', colSpan: 3 },
      { key: 'location', label: 'Location', type: 'text', colSpan: 4 },
      { key: 'participantsCount', label: 'Participants', type: 'number', colSpan: 2 },
      { key: 'facilitator', label: 'Facilitator / institution', type: 'text', colSpan: 3 },
      { key: 'outcomeSummary', label: 'Outcome summary', type: 'textarea', colSpan: 12 },
    ],
    renderSummary: (row) => (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{row.eventTitle}</Typography>
          {row.eventType ? <Chip size="small" variant="outlined" label={humanise(row.eventType)} /> : null}
          {row.participantsCount ? <Chip size="small" label={`${row.participantsCount} participants`} /> : null}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'}
          {row.endDate ? ` → ${new Date(row.endDate).toLocaleDateString()}` : ''}
          {row.location ? ` · ${row.location}` : ''}
        </Typography>
      </Box>
    ),
  },
  {
    sectionNumber: 6,
    key: 'equipment',
    serviceKey: 'equipment',
    title: '§6 · Equipment & Infrastructure',
    subtitle: 'Major equipment and infrastructure procured under the grant.',
    icon: EquipIcon,
    accentColor: '#6a1b9a',
    addLabel: 'Add equipment',
    fields: [
      { key: 'itemName', label: 'Item name', type: 'text', required: true, colSpan: 4 },
      { key: 'category', label: 'Category', type: 'select', options: EQUIPMENT_CATEGORIES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 2 },
      { key: 'serialNumber', label: 'Serial number', type: 'text', colSpan: 3 },
      { key: 'assetTag', label: 'Asset tag', type: 'text', colSpan: 3 },
      { key: 'acquisitionDate', label: 'Acquisition date', type: 'date', colSpan: 3 },
      { key: 'acquisitionCost', label: 'Cost', type: 'number', colSpan: 2 },
      { key: 'currency', label: 'Currency', type: 'select', options: ['KES','USD','EUR','GBP'].map((v) => ({ value: v, label: v })), colSpan: 2, default: 'KES' },
      { key: 'vendor', label: 'Vendor', type: 'text', colSpan: 3 },
      { key: 'warrantyUntil', label: 'Warranty until', type: 'date', colSpan: 2 },
      { key: 'custodian', label: 'Custodian', type: 'text', colSpan: 3 },
      { key: 'location', label: 'Location', type: 'text', colSpan: 3 },
      { key: 'status', label: 'Status', type: 'select', options: EQUIPMENT_STATUSES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 2, default: 'in_use' },
      { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 12 },
    ],
    renderSummary: (row) => (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{row.itemName}</Typography>
          {row.category ? <Chip size="small" variant="outlined" label={humanise(row.category)} /> : null}
          {row.status ? <Chip size="small" label={humanise(row.status)} /> : null}
          {row.acquisitionCost ? (
            <Chip size="small" label={formatCurrency(row.acquisitionCost, row.currency || 'KES', { compact: true })} />
          ) : null}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {row.serialNumber ? `S/N: ${row.serialNumber}` : ''}
          {row.custodian ? ` · custodian ${row.custodian}` : ''}
          {row.location ? ` · ${row.location}` : ''}
        </Typography>
      </Box>
    ),
  },
  {
    sectionNumber: 7,
    key: 'budgetLines',
    serviceKey: 'budgetLines',
    title: '§7 · Financial Utilisation — Budget lines',
    subtitle: 'Per-category budget vs expenditure. Quarterly milestone reports auto-aggregate this.',
    icon: BudgetIcon,
    accentColor: '#1565c0',
    addLabel: 'Add budget line',
    fields: [
      { key: 'category', label: 'Category', type: 'select', required: true, options: BUDGET_CATEGORIES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 3 },
      { key: 'description', label: 'Description', type: 'text', colSpan: 5 },
      { key: 'budgetedAmount', label: 'Budgeted', type: 'number', colSpan: 2 },
      { key: 'expenditureToDate', label: 'Spent to date', type: 'number', colSpan: 2 },
      { key: 'currency', label: 'Currency', type: 'select', options: ['KES','USD','EUR','GBP'].map((v) => ({ value: v, label: v })), colSpan: 2, default: 'KES' },
      { key: 'fyLabel', label: 'FY (optional)', type: 'text', colSpan: 2 },
    ],
    renderSummary: (row) => {
      const pct = row.budgetedAmount && Number(row.budgetedAmount) > 0
        ? Math.round((Number(row.expenditureToDate || 0) / Number(row.budgetedAmount)) * 1000) / 10
        : null;
      return (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" color="primary" variant="outlined" label={humanise(row.category)} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {formatCurrency(row.expenditureToDate, row.currency || 'KES', { compact: true })}
              {' / '}
              {formatCurrency(row.budgetedAmount, row.currency || 'KES', { compact: true })}
            </Typography>
            {pct != null ? <Chip size="small" label={`${formatPercent(pct, { fractionDigits: 1 })} utilised`} /> : null}
            {row.fyLabel ? <Chip size="small" variant="outlined" label={row.fyLabel} /> : null}
          </Stack>
          {row.description ? (
            <Typography variant="caption" color="text.secondary">{row.description}</Typography>
          ) : null}
        </Box>
      );
    },
  },
  {
    sectionNumber: 9,
    key: 'labAnalyses',
    serviceKey: 'labAnalyses',
    title: '§9 · Laboratory analyses',
    subtitle: 'Per-assay register with planned vs completed sample counts and QC pass rates.',
    icon: LabIcon,
    accentColor: '#00838f',
    addLabel: 'Add assay',
    fields: [
      { key: 'analysisType', label: 'Analysis / assay', type: 'text', required: true, colSpan: 4 },
      { key: 'platform', label: 'Platform', type: 'text', colSpan: 4 },
      { key: 'sampleType', label: 'Sample type', type: 'text', colSpan: 4 },
      { key: 'totalPlanned', label: 'Planned', type: 'number', colSpan: 2 },
      { key: 'completed', label: 'Completed', type: 'number', colSpan: 2 },
      { key: 'qcPassRate', label: 'QC pass %', type: 'number', step: 0.1, colSpan: 2 },
      { key: 'unitCost', label: 'Unit cost', type: 'number', colSpan: 2 },
      { key: 'currency', label: 'Currency', type: 'select', options: ['KES','USD','EUR','GBP'].map((v) => ({ value: v, label: v })), colSpan: 2, default: 'KES' },
      { key: 'comments', label: 'Comments', type: 'textarea', colSpan: 12 },
    ],
    renderSummary: (row) => {
      const completion = row.totalPlanned && Number(row.totalPlanned) > 0
        ? Math.round((Number(row.completed || 0) / Number(row.totalPlanned)) * 100)
        : null;
      return (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{row.analysisType}</Typography>
            {row.platform ? <Chip size="small" variant="outlined" label={row.platform} /> : null}
            {row.sampleType ? <Chip size="small" label={row.sampleType} /> : null}
            {completion != null ? (
              <Chip
                size="small"
                color={completion >= 75 ? 'success' : completion >= 25 ? 'warning' : 'default'}
                label={`${row.completed || 0}/${row.totalPlanned} (${completion}%)`}
              />
            ) : null}
            {row.qcPassRate != null ? <Chip size="small" label={`QC ${row.qcPassRate}%`} /> : null}
          </Stack>
          {row.comments ? (
            <Typography variant="caption" color="text.secondary">{row.comments}</Typography>
          ) : null}
        </Box>
      );
    },
  },
  {
    sectionNumber: 10,
    key: 'feedback',
    serviceKey: 'feedback',
    title: '§10 · Operations feedback',
    subtitle: 'Feedback from partners, communities, donors, regulators, or internal review — and your response.',
    icon: FeedbackIcon,
    accentColor: '#ef6c00',
    addLabel: 'Log feedback',
    fields: [
      { key: 'feedbackType', label: 'Feedback type', type: 'select', options: FEEDBACK_TYPES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 3 },
      { key: 'source', label: 'Source / contact', type: 'text', colSpan: 5 },
      { key: 'dateReceived', label: 'Date received', type: 'date', colSpan: 2 },
      { key: 'status', label: 'Status', type: 'select', options: FEEDBACK_STATUSES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 2, default: 'open' },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true, colSpan: 12 },
      { key: 'actionTaken', label: 'Action taken / planned', type: 'textarea', colSpan: 12 },
    ],
    renderSummary: (row) => (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {row.feedbackType ? <Chip size="small" variant="outlined" label={humanise(row.feedbackType)} /> : null}
          {row.status ? (
            <Chip
              size="small"
              color={row.status === 'closed' ? 'success' : row.status === 'open' ? 'warning' : 'info'}
              label={humanise(row.status)}
            />
          ) : null}
          {row.source ? (
            <Typography variant="caption" color="text.secondary">from {row.source}</Typography>
          ) : null}
          {row.dateReceived ? (
            <Typography variant="caption" color="text.secondary">
              · {new Date(row.dateReceived).toLocaleDateString()}
            </Typography>
          ) : null}
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.5 }}>{row.summary}</Typography>
        {row.actionTaken ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            <strong>Action:</strong> {row.actionTaken}
          </Typography>
        ) : null}
      </Box>
    ),
  },
  {
    sectionNumber: 11,
    key: 'swot',
    serviceKey: 'swot',
    title: '§11 · SWOT & Lessons learned',
    subtitle: 'Strengths, weaknesses, opportunities, threats, and lessons. Feeds the AI narrative report generator.',
    icon: SwotIcon,
    accentColor: '#6a1b9a',
    addLabel: 'Add reflection',
    fields: [
      { key: 'category', label: 'Category', type: 'select', required: true, options: SWOT_CATEGORIES.map((v) => ({ value: v, label: humanise(v) })), colSpan: 3 },
      { key: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 9 },
    ],
    renderSummary: (row) => {
      const cat = (row.category || 'lesson').toLowerCase();
      return (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip
              size="small"
              label={humanise(cat)}
              sx={{
                fontWeight: 700,
                bgcolor: `${SWOT_COLORS[cat] || '#90a4ae'}1A`,
                color: SWOT_COLORS[cat] || '#90a4ae',
              }}
            />
            {row.recordedAt ? (
              <Typography variant="caption" color="text.secondary">
                {new Date(row.recordedAt).toLocaleDateString()}
              </Typography>
            ) : null}
          </Stack>
          <Typography variant="body2">{row.description}</Typography>
        </Box>
      );
    },
  },
];

export default function KemriStudyExtendedSections({ projectId }) {
  const [open, setOpen] = useState({});
  const [data, setData] = useState({});       // { staff: [...], equipment: [...], ... }
  const [loading, setLoading] = useState({}); // { staff: true, ... }
  const [error, setError] = useState(null);

  const refresh = async (key) => {
    const def = SECTION_DEFS.find((d) => d.key === key);
    if (!def) return;
    setLoading((s) => ({ ...s, [key]: true }));
    try {
      const rows = await kemriService.sections[def.serviceKey].list(projectId);
      setData((d) => ({ ...d, [key]: rows || [] }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading((s) => ({ ...s, [key]: false }));
    }
  };

  const handleToggle = (key) => async () => {
    const willOpen = !open[key];
    setOpen((o) => ({ ...o, [key]: willOpen }));
    if (willOpen && !data[key]) {
      await refresh(key);
    }
  };

  const handleAdd = (def) => async (draft) => {
    setError(null);
    try {
      const payload = { ...draft };
      // numeric coercion to keep DB happy
      for (const f of def.fields) {
        if (f.type === FIELD_TYPES.number && payload[f.key] !== '' && payload[f.key] != null) {
          payload[f.key] = Number(payload[f.key]);
        }
        if (f.type === FIELD_TYPES.date && payload[f.key] === '') {
          payload[f.key] = null;
        }
      }
      await kemriService.sections[def.serviceKey].create(projectId, payload);
      await refresh(def.key);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const handleRemove = (def) => async (id) => {
    if (!window.confirm('Remove this entry?')) return;
    setError(null);
    try {
      await kemriService.sections[def.serviceKey].remove(id);
      await refresh(def.key);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const counts = useMemo(() => {
    const out = {};
    for (const def of SECTION_DEFS) out[def.key] = (data[def.key] || []).length;
    return out;
  }, [data]);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '50%',
            bgcolor: 'primary.main', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          5–11
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            KEMRI Form §5 – §11
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Human resource, equipment, financial breakdown, lab analyses,
            operations feedback and lessons learned. Add entries as the study progresses.
          </Typography>
        </Box>
      </Stack>

      {error ? <Alert severity="error" sx={{ mt: 1, mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}

      <Stack spacing={1.25} sx={{ mt: 2 }}>
        {SECTION_DEFS.map((def) => {
          const Icon = def.icon;
          return (
            <Accordion
              key={def.key}
              expanded={!!open[def.key]}
              onChange={handleToggle(def.key)}
              disableGutters
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandIcon />} sx={{ minHeight: 56 }}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: 1.5,
                      bgcolor: `${def.accentColor}1A`, color: def.accentColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{def.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{def.subtitle}</Typography>
                  </Box>
                  {counts[def.key] > 0 ? (
                    <Chip size="small" label={counts[def.key]} sx={{ bgcolor: `${def.accentColor}1A`, color: def.accentColor, fontWeight: 700 }} />
                  ) : null}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {loading[def.key] ? (
                  <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                ) : (
                  <SectionTable
                    title=""
                    subtitle=""
                    accentColor={def.accentColor}
                    icon={def.icon}
                    fields={def.fields}
                    rows={data[def.key] || []}
                    onAdd={handleAdd(def)}
                    onRemove={handleRemove(def)}
                    addLabel={def.addLabel}
                    renderSummary={def.renderSummary}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Paper>
  );
}
