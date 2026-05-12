import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function SectorGapProjectsModal({
  open,
  onClose,
  title,
  subtitle,
  rows,
  onOpenRegistry,
  onSelectPossibleMatch,
  disablePossibleMatchActions = false,
}) {
  const empty = !rows || rows.length === 0;
  const sorted = useMemo(() => {
    if (!rows || !rows.length) return [];
    return [...rows].sort((a, b) => String(a.projectName || '').localeCompare(String(b.projectName || '')));
  }, [rows]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          pr: 5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {empty ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No projects in the current dashboard filters match this bucket.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: { xs: '60vh', md: '70vh' } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ministry</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>State department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sector (free text)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Possible registry match</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ maxWidth: 260, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {r.projectName || '—'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.status || '—'}</TableCell>
                    <TableCell sx={{ maxWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {r.ministry || '—'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {r.stateDepartment || '—'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {r.sectorText === '' || r.sectorText == null ? (
                        <Typography component="span" variant="body2" color="text.secondary">
                          (empty)
                        </Typography>
                      ) : (
                        r.sectorText
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      {r.possibleMatches && r.possibleMatches.length ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {r.possibleMatches.map((m) => (
                            <Chip
                              key={m.canonical}
                              label={m.label}
                              size="small"
                              variant="outlined"
                              clickable={typeof onSelectPossibleMatch === 'function'}
                              disabled={disablePossibleMatchActions}
                              onClick={
                                typeof onSelectPossibleMatch === 'function'
                                  ? () => onSelectPossibleMatch(r, m)
                                  : undefined
                              }
                              sx={{ cursor: typeof onSelectPossibleMatch === 'function' ? 'pointer' : 'default' }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          endIcon={<OpenInNewIcon />}
          onClick={onOpenRegistry}
          disabled={!onOpenRegistry}
        >
          Open project registry
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SectorGapProjectsModal;
