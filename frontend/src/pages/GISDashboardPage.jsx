import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip as MuiTooltip,
  Typography,
} from '@mui/material';
import {
  PublicOutlined as PublicIcon,
  ZoomOutMap as ZoomOutIcon,
  Place as PlaceIcon,
  Map as MapIcon,
  Whatshot as HeatIcon,
  ScatterPlot as MarkersIcon,
  BubbleChart as ClusterIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import {
  HeatmapLayerF,
  InfoWindowF,
  MarkerClustererF,
  MarkerF,
  PolygonF,
} from '@react-google-maps/api';
import GoogleMapComponent from '../components/gis/GoogleMapComponent';
import kemriService from '../api/kemriService';
import { KEMRI_MENU_PROPS, formatCurrency, ragMeta, humanise } from '../utils/kemriFormat';

/* -------------------------------------------------------------------------- */
/*  Constants & geometry helpers                                              */
/* -------------------------------------------------------------------------- */

const KENYA_CENTER = { lat: 0.55, lng: 37.9 };
const KENYA_ZOOM   = 6;

const RAG_HEX = {
  green:   '#16A34A',
  amber:   '#D97706',
  red:     '#DC2626',
  pending: '#6B7280',
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Convert GeoJSON Polygon / MultiPolygon coordinates → [[{lat,lng},…]] for google.maps. */
const geometryToPaths = (geometry) => {
  if (!geometry?.type || !geometry?.coordinates) return [];
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })));
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((polygon) =>
      polygon.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })))
    );
  }
  return [];
};

/** Lightweight bbox from a GeoJSON geometry. */
const geometryBbox = (geometry) => {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const visit = (rings) => {
    for (const ring of rings) for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };
  if (geometry?.type === 'Polygon') visit(geometry.coordinates);
  else if (geometry?.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) visit(poly);
  }
  return [minLng, minLat, maxLng, maxLat];
};

/** Stable interpolation between two hex colors. */
const lerpColor = (hexA, hexB, t) => {
  const ax = parseInt(hexA.slice(1), 16);
  const bx = parseInt(hexB.slice(1), 16);
  const ar = (ax >> 16) & 255, ag = (ax >> 8) & 255, ab = ax & 255;
  const br = (bx >> 16) & 255, bg = (bx >> 8) & 255, bb = bx & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
};

/** Heatmap-friendly ramp: light blue → KEMRI navy, with pure white at zero. */
const heatColor = (value, max) => {
  if (!value || !max || max <= 0) return '#F1F5F9';
  const t = Math.min(1, value / max);
  // Quadratic curve so small values still show some color
  const eased = Math.sqrt(t);
  return lerpColor('#DBEAFE', '#1E3A8A', eased);
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function GISDashboardPage() {
  // --- core state ---
  const [counties, setCounties]         = useState(null);   // FeatureCollection
  const [countyIndex, setCountyIndex]   = useState([]);     // [{name, slug, files…}]
  const [summary, setSummary]           = useState(null);   // { byCounty, sites }
  const [loadingCore, setLoadingCore]   = useState(true);
  const [error, setError]               = useState('');

  // --- per-county detail state ---
  const [selectedCounty, setSelectedCounty]       = useState(null); // index entry
  const [countyConstituencies, setCountyConsts]   = useState(null);
  const [countyWards, setCountyWards]             = useState(null);
  const [countyLoading, setCountyLoading]         = useState(false);

  // --- UI state ---
  const [metric, setMetric]               = useState('studyCount'); // studyCount | siteCount | fundingTotal
  const [viewMode, setViewMode]           = useState('markers');    // markers | heatmap | cluster
  const [ragFilter, setRagFilter]         = useState('all');         // all | green | amber | red | pending
  const [mapBaseStyle, setMapBaseStyle]   = useState('roadmap');
  const [hoverCounty, setHoverCounty]     = useState(null);
  const [selectedSite, setSelectedSite]   = useState(null);
  const [mapsReady, setMapsReady]         = useState(false);

  const mapRef = useRef(null);
  const onMapCreated = (map) => {
    mapRef.current = map;
    setMapsReady(Boolean(window.google?.maps?.visualization));
  };

  /* --- initial load ---------------------------------------------------- */
  useEffect(() => {
    (async () => {
      setLoadingCore(true);
      setError('');
      try {
        const [countiesRes, indexRes, sum] = await Promise.all([
          fetch('/gis/kenya/kenya-counties.geojson'),
          fetch('/gis/kenya/county-index.json'),
          kemriService.getGisSummary(),
        ]);
        if (!countiesRes.ok) throw new Error('Could not load Kenya counties GeoJSON.');
        if (!indexRes.ok)    throw new Error('Could not load county index.');

        const [countiesJson, indexJson] = await Promise.all([countiesRes.json(), indexRes.json()]);
        setCounties(countiesJson);
        setCountyIndex(indexJson || []);
        setSummary(sum);
      } catch (err) {
        setError(err?.message || 'Failed to load national GIS dashboard.');
      } finally {
        setLoadingCore(false);
      }
    })();
  }, []);

  /* --- aggregates ------------------------------------------------------ */
  const byCountyMap = useMemo(() => {
    const m = new Map();
    for (const row of summary?.byCounty || []) {
      m.set((row.countyKey || '').toUpperCase(), row);
    }
    return m;
  }, [summary]);

  const maxMetric = useMemo(() => {
    let max = 0;
    byCountyMap.forEach((r) => {
      const v = toNum(r[metric]);
      if (v > max) max = v;
    });
    return max;
  }, [byCountyMap, metric]);

  /* --- county polygons (national view) -------------------------------- */
  const countyPolygons = useMemo(() => {
    const features = counties?.features || [];
    return features.flatMap((feature, fIdx) => {
      const paths = geometryToPaths(feature.geometry);
      const props = feature.properties || {};
      const upperName = (props.county_name || props.COUNTY_NAM || '').toUpperCase();
      const stats = byCountyMap.get(upperName);
      const value = stats ? toNum(stats[metric]) : 0;
      const isSelected = selectedCounty?.slug === props.county_slug;
      return paths.map((path, pIdx) => ({
        key: `c-${fIdx}-${pIdx}`,
        feature,
        slug: props.county_slug,
        name: props.county_name || props.COUNTY_NAM,
        path,
        value,
        stats,
        isSelected,
      }));
    });
  }, [counties, byCountyMap, metric, selectedCounty]);

  /* --- per-county detail polygons (only when a county is selected) ---- */
  const constituencyPolygons = useMemo(() => {
    if (!selectedCounty) return [];
    const features = countyConstituencies?.features || [];
    return features.flatMap((f, fIdx) =>
      geometryToPaths(f.geometry).map((path, pIdx) => ({
        key: `cc-${fIdx}-${pIdx}`,
        path,
        name: f.properties?.name || `Constituency ${fIdx + 1}`,
      }))
    );
  }, [selectedCounty, countyConstituencies]);

  const wardPolygons = useMemo(() => {
    if (!selectedCounty) return [];
    const features = countyWards?.features || [];
    return features.flatMap((f, fIdx) =>
      geometryToPaths(f.geometry).map((path, pIdx) => ({
        key: `cw-${fIdx}-${pIdx}`,
        path,
        name: f.properties?.name || `Ward ${fIdx + 1}`,
      }))
    );
  }, [selectedCounty, countyWards]);

  /* --- site markers --------------------------------------------------- */
  const sites = summary?.sites || [];

  const sitesInView = useMemo(() => {
    if (!selectedCounty) return sites;
    const want = (selectedCounty.name || '').toUpperCase();
    return sites.filter((s) => (s.county || '').toUpperCase().trim() === want);
  }, [sites, selectedCounty]);

  const visibleSites = useMemo(() => {
    return sitesInView.filter((s) => {
      const lat = Number(s.latitude), lng = Number(s.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      if (ragFilter === 'all') return true;
      const rag = (s.ragStatus || 'pending').toLowerCase();
      return rag === ragFilter;
    });
  }, [sitesInView, ragFilter]);

  /* --- heatmap intensity (weighted by funding) ------------------------ */
  const heatmapData = useMemo(() => {
    if (!mapsReady || !window.google?.maps?.visualization) return [];
    const total = visibleSites.reduce((a, s) => a + toNum(s.fundingAmount), 0);
    const median = total > 0 && visibleSites.length > 0 ? total / visibleSites.length : 1;
    return visibleSites.map((s) => ({
      location: new window.google.maps.LatLng(Number(s.latitude), Number(s.longitude)),
      weight: Math.max(1, Math.sqrt(toNum(s.fundingAmount) / Math.max(1, median)) * 4),
    }));
  }, [visibleSites, mapsReady]);

  /* --- top counties leaderboard (national view only) ------------------ */
  const topCounties = useMemo(() => {
    if (!summary?.byCounty) return [];
    return [...summary.byCounty]
      .sort((a, b) => toNum(b[metric]) - toNum(a[metric]))
      .slice(0, 8);
  }, [summary, metric]);

  /* --- handlers ------------------------------------------------------- */
  const fitToBbox = (bbox) => {
    const map = mapRef.current;
    if (!map || !window.google || !bbox) return;
    const [w, s, e, n] = bbox;
    const sw = new window.google.maps.LatLng(s, w);
    const ne = new window.google.maps.LatLng(n, e);
    const bounds = new window.google.maps.LatLngBounds(sw, ne);
    map.fitBounds(bounds, { top: 32, bottom: 32, left: 32, right: 32 });
  };

  const fitToKenya = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter(KENYA_CENTER);
    map.setZoom(KENYA_ZOOM);
  };

  const handleSelectCounty = async (countyEntry) => {
    setSelectedSite(null);
    setHoverCounty(null);
    setSelectedCounty(countyEntry || null);
    setCountyConsts(null);
    setCountyWards(null);

    if (!countyEntry) {
      fitToKenya();
      return;
    }

    fitToBbox(countyEntry.bbox);
    setCountyLoading(true);
    try {
      const [constsRes, wardsRes] = await Promise.all([
        fetch('/' + countyEntry.files.constituencies),
        fetch('/' + countyEntry.files.wards),
      ]);
      const [constsJson, wardsJson] = await Promise.all([
        constsRes.ok ? constsRes.json() : { features: [] },
        wardsRes.ok  ? wardsRes.json()  : { features: [] },
      ]);
      setCountyConsts(constsJson);
      setCountyWards(wardsJson);
    } catch (err) {
      setError(`Could not load detail for ${countyEntry.name}: ${err.message}`);
    } finally {
      setCountyLoading(false);
    }
  };

  /* --- header KPIs ---------------------------------------------------- */
  const headerKpis = useMemo(() => {
    if (!summary) return null;
    const totalStudies   = new Set((summary.sites || []).map((s) => s.projectId)).size;
    const totalSites     = (summary.sites || []).length;
    const countiesActive = byCountyMap.size;
    const totalFunding = (summary.byCounty || []).reduce((a, c) => a + toNum(c.fundingTotal), 0);
    return { totalStudies, totalSites, countiesActive, totalFunding };
  }, [summary, byCountyMap]);

  /* --- render --------------------------------------------------------- */
  if (loadingCore) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading KIMES national GIS dashboard…</Typography>
      </Box>
    );
  }

  const aerial = mapBaseStyle === 'satellite' || mapBaseStyle === 'hybrid';

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5 }, pb: 1 }}>
      {/* ----- header ----- */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 1.5,
            bgcolor: 'primary.main', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PublicIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
              KIMES National GIS Dashboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kenya counties · KEMRI research portfolio · click any county to drill in
            </Typography>
          </Box>
        </Stack>
        {headerKpis && (
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`${headerKpis.countiesActive} active counties`} variant="outlined" />
            <Chip size="small" label={`${headerKpis.totalStudies} studies`} variant="outlined" color="primary" />
            <Chip size="small" label={`${headerKpis.totalSites} sites`} variant="outlined" />
            <Chip size="small" label={formatCurrency(headerKpis.totalFunding, 'USD', { compact: true }) + ' portfolio'} variant="outlined" color="success" />
          </Stack>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ----- controls ----- */}
      <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ columnGap: 1, rowGap: 0.75 }}>
          <Autocomplete
            size="small"
            options={countyIndex}
            value={selectedCounty}
            onChange={(_, v) => handleSelectCounty(v || null)}
            getOptionLabel={(o) => o?.name ? humanise(o.name) : ''}
            isOptionEqualToValue={(a, b) => a?.slug === b?.slug}
            sx={{ minWidth: 260 }}
            renderInput={(params) => (
              <TextField {...params} label="Drill into a county" placeholder="All counties" />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.slug}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                  <PlaceIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {humanise(option.name)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.constituencyCount} constituencies · {option.wardCount} wards
                    </Typography>
                  </Box>
                  {byCountyMap.has(option.name?.toUpperCase()) ? (
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${byCountyMap.get(option.name.toUpperCase()).studyCount} studies`}
                    />
                  ) : null}
                </Stack>
              </li>
            )}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="gis-metric-label">Heat metric</InputLabel>
            <Select
              labelId="gis-metric-label"
              label="Heat metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              MenuProps={KEMRI_MENU_PROPS}
            >
              <MenuItem value="studyCount">Studies per county</MenuItem>
              <MenuItem value="siteCount">Research sites</MenuItem>
              <MenuItem value="fundingTotal">Funding (portfolio)</MenuItem>
              <MenuItem value="activeStudies">Active studies only</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(_, v) => { if (v) setViewMode(v); }}
            aria-label="Site visualisation mode"
          >
            <ToggleButton value="markers">
              <MarkersIcon sx={{ mr: 0.5, fontSize: 16 }} /> Markers
            </ToggleButton>
            <ToggleButton value="heatmap">
              <HeatIcon sx={{ mr: 0.5, fontSize: 16 }} /> Heatmap
            </ToggleButton>
            <ToggleButton value="cluster">
              <ClusterIcon sx={{ mr: 0.5, fontSize: 16 }} /> Cluster
            </ToggleButton>
            <ToggleButton value="hidden" aria-label="Hide site overlay">
              Off
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="gis-rag-label">RAG filter</InputLabel>
            <Select
              labelId="gis-rag-label"
              label="RAG filter"
              value={ragFilter}
              onChange={(e) => setRagFilter(e.target.value)}
              MenuProps={KEMRI_MENU_PROPS}
            >
              <MenuItem value="all">All sites</MenuItem>
              <MenuItem value="green">Green only</MenuItem>
              <MenuItem value="amber">Amber only</MenuItem>
              <MenuItem value="red">Red only</MenuItem>
              <MenuItem value="pending">Pending only</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={mapBaseStyle}
            onChange={(_, v) => { if (v) setMapBaseStyle(v); }}
            aria-label="Base map"
          >
            <ToggleButton value="roadmap">Map</ToggleButton>
            <ToggleButton value="satellite">Satellite</ToggleButton>
            <ToggleButton value="hybrid">Hybrid</ToggleButton>
          </ToggleButtonGroup>

          {selectedCounty ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ZoomOutIcon />}
              onClick={() => handleSelectCounty(null)}
            >
              Reset to national view
            </Button>
          ) : null}

          <Box sx={{ flex: 1 }} />

          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {visibleSites.length} site{visibleSites.length === 1 ? '' : 's'} on map
            {selectedCounty ? ` · drilled into ${humanise(selectedCounty.name)}` : ''}
          </Typography>
        </Stack>

        {/* heat legend */}
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }}>
          <Typography variant="caption" color="text.secondary">Low</Typography>
          <Box sx={{
            flex: 1, maxWidth: 240, height: 8, borderRadius: 1,
            background: 'linear-gradient(to right, #DBEAFE 0%, #1E3A8A 100%)',
            border: '1px solid', borderColor: 'divider',
          }} />
          <Typography variant="caption" color="text.secondary">High</Typography>
          {Object.entries(RAG_HEX).map(([rag, hex]) => (
            <Stack key={rag} direction="row" alignItems="center" spacing={0.5} sx={{ ml: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: hex, border: '1px solid rgba(0,0,0,0.15)' }} />
              <Typography variant="caption" color="text.secondary">{humanise(rag)}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* ----- map ----- */}
      <Paper variant="outlined" sx={{ overflow: 'hidden', position: 'relative' }}>
        {countyLoading ? (
          <Box sx={{
            position: 'absolute', top: 12, right: 12, zIndex: 5,
            bgcolor: 'background.paper', px: 1.25, py: 0.5,
            borderRadius: 1, boxShadow: 2,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <CircularProgress size={14} />
            <Typography variant="caption">Loading constituencies & wards…</Typography>
          </Box>
        ) : null}

        <GoogleMapComponent
          center={KENYA_CENTER}
          zoom={KENYA_ZOOM}
          style={{ height: '72vh', minHeight: 480, width: '100%' }}
          mapTypeId={mapBaseStyle}
          searchPlacement="above"
          onCreated={onMapCreated}
        >
          {/* Counties layer */}
          {countyPolygons.map((cp) => {
            const fill = heatColor(cp.value, maxMetric);
            const isHovered = hoverCounty?.slug === cp.slug;
            const dim = selectedCounty && !cp.isSelected ? 0.18 : 1;
            return (
              <PolygonF
                key={cp.key}
                paths={cp.path}
                options={{
                  strokeColor: aerial ? '#FFFFFF' : (cp.isSelected ? '#1E40AF' : '#1F2937'),
                  strokeOpacity: aerial ? 0.85 : (cp.isSelected ? 1 : 0.55),
                  strokeWeight: cp.isSelected ? 3 : (isHovered ? 2 : 1),
                  fillColor: fill,
                  fillOpacity: aerial ? 0 : (0.65 * dim),
                  zIndex: cp.isSelected ? 4 : 2,
                }}
                onMouseOver={(e) => {
                  setHoverCounty({
                    slug: cp.slug,
                    name: cp.name,
                    stats: cp.stats,
                    position: {
                      lat: e?.latLng?.lat?.() ?? cp.path?.[0]?.lat ?? KENYA_CENTER.lat,
                      lng: e?.latLng?.lng?.() ?? cp.path?.[0]?.lng ?? KENYA_CENTER.lng,
                    },
                  });
                }}
                onMouseOut={() => setHoverCounty(null)}
                onClick={() => {
                  const entry = countyIndex.find((c) => c.slug === cp.slug);
                  if (entry) handleSelectCounty(entry);
                }}
              />
            );
          })}

          {/* Constituencies (only when drilled in) */}
          {constituencyPolygons.map((cp) => (
            <PolygonF
              key={cp.key}
              paths={cp.path}
              options={{
                strokeColor: aerial ? '#FFFFFF' : '#475569',
                strokeOpacity: aerial ? 0.7 : 0.7,
                strokeWeight: aerial ? 1.4 : 1,
                fillOpacity: 0,
                clickable: false,
                zIndex: 5,
              }}
            />
          ))}

          {/* Wards (only when drilled in) */}
          {wardPolygons.map((wp) => (
            <PolygonF
              key={wp.key}
              paths={wp.path}
              options={{
                strokeColor: aerial ? '#E0F2FE' : '#94A3B8',
                strokeOpacity: aerial ? 0.55 : 0.6,
                strokeWeight: 0.8,
                fillColor: '#1E40AF',
                fillOpacity: aerial ? 0 : 0.06,
                clickable: false,
                zIndex: 6,
              }}
            />
          ))}

          {/* Hover info window */}
          {hoverCounty && (
            <InfoWindowF
              position={hoverCounty.position}
              options={{ disableAutoPan: true }}
              onCloseClick={() => setHoverCounty(null)}
            >
              <div style={{ minWidth: 180 }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>
                  {humanise(hoverCounty.name)}
                </strong>
                {hoverCounty.stats ? (
                  <>
                    <div>Studies: <b>{hoverCounty.stats.studyCount}</b> ({hoverCounty.stats.activeStudies} active)</div>
                    <div>Sites:   <b>{hoverCounty.stats.siteCount}</b></div>
                    <div>Funding: <b>{formatCurrency(hoverCounty.stats.fundingTotal, 'USD', { compact: true })}</b></div>
                  </>
                ) : (
                  <div style={{ color: '#64748b' }}>No KEMRI activity recorded.</div>
                )}
                <div style={{ marginTop: 4, color: '#64748b', fontSize: 11 }}>Click to drill in</div>
              </div>
            </InfoWindowF>
          )}

          {/* Site overlays — mode-aware */}
          {viewMode === 'markers' && visibleSites.map((s) => {
            const rag = (s.ragStatus || 'pending').toLowerCase();
            const hex = RAG_HEX[rag] || RAG_HEX.pending;
            return (
              <MarkerF
                key={`m-${s.siteId}`}
                position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
                onClick={() => setSelectedSite(s)}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE,
                  fillColor: hex,
                  fillOpacity: 0.95,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 1.5,
                  scale: 6,
                }}
              />
            );
          })}

          {viewMode === 'cluster' && (
            <MarkerClustererF
              options={{
                gridSize: 50,
                maxZoom: 11,
                averageCenter: true,
                styles: [
                  { textColor: '#FFFFFF', textSize: 12, height: 36, width: 36, url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="18" cy="18" r="16" fill="%231E40AF" fill-opacity="0.85" stroke="%23ffffff" stroke-width="2"/></svg>') },
                  { textColor: '#FFFFFF', textSize: 13, height: 44, width: 44, url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><circle cx="22" cy="22" r="20" fill="%231D4ED8" fill-opacity="0.9" stroke="%23ffffff" stroke-width="2"/></svg>') },
                  { textColor: '#FFFFFF', textSize: 14, height: 54, width: 54, url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="54" height="54"><circle cx="27" cy="27" r="25" fill="%23DC2626" fill-opacity="0.92" stroke="%23ffffff" stroke-width="2"/></svg>') },
                ],
              }}
            >
              {(clusterer) => (
                <>
                  {visibleSites.map((s) => {
                    const rag = (s.ragStatus || 'pending').toLowerCase();
                    const hex = RAG_HEX[rag] || RAG_HEX.pending;
                    return (
                      <MarkerF
                        key={`cl-${s.siteId}`}
                        position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
                        clusterer={clusterer}
                        onClick={() => setSelectedSite(s)}
                        icon={{
                          path: window.google?.maps?.SymbolPath?.CIRCLE,
                          fillColor: hex,
                          fillOpacity: 0.95,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 1.5,
                          scale: 6,
                        }}
                      />
                    );
                  })}
                </>
              )}
            </MarkerClustererF>
          )}

          {viewMode === 'heatmap' && mapsReady && heatmapData.length > 0 && (
            <HeatmapLayerF
              data={heatmapData}
              options={{
                radius: 40,
                opacity: 0.85,
                dissipating: true,
                gradient: [
                  'rgba(255,255,255,0)',
                  'rgba(219,234,254,0.65)',
                  'rgba(147,197,253,0.75)',
                  'rgba(96,165,250,0.85)',
                  'rgba(37,99,235,0.95)',
                  'rgba(30,64,175,0.95)',
                  'rgba(220,38,38,1)',
                ],
              }}
            />
          )}

          {/* Selected site info */}
          {selectedSite && (
            <InfoWindowF
              position={{ lat: Number(selectedSite.latitude), lng: Number(selectedSite.longitude) }}
              onCloseClick={() => setSelectedSite(null)}
            >
              <div style={{ minWidth: 220 }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>{selectedSite.siteName}</strong>
                <div style={{ color: '#374151', marginBottom: 4 }}>{selectedSite.projectShortName}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{selectedSite.projectTitle}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                    backgroundColor: (RAG_HEX[(selectedSite.ragStatus || 'pending').toLowerCase()] || RAG_HEX.pending) + '22',
                    color: RAG_HEX[(selectedSite.ragStatus || 'pending').toLowerCase()] || RAG_HEX.pending,
                    fontWeight: 700, fontSize: 11,
                  }}>
                    {humanise(selectedSite.ragStatus || 'pending')}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {selectedSite.county || '—'}{selectedSite.subCounty ? `, ${selectedSite.subCounty}` : ''}
                  </span>
                  {selectedSite.centreCode ? (
                    <span style={{ fontSize: 11, color: '#1e3a8a', fontWeight: 600 }}>{selectedSite.centreCode}</span>
                  ) : null}
                </div>
              </div>
            </InfoWindowF>
          )}
        </GoogleMapComponent>
      </Paper>

      {/* ----- top counties leaderboard (national view only) ----- */}
      {!selectedCounty && topCounties.length > 0 ? (
        <Paper variant="outlined" sx={{ mt: 1, p: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <TrophyIcon sx={{ color: '#B45309' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Top counties by {humanise(metric === 'fundingTotal' ? 'funding' : metric)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              · click a county to drill in
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: 'wrap', rowGap: 1, columnGap: 1 }}
            useFlexGap
          >
            {topCounties.map((c, idx) => {
              const value = toNum(c[metric]);
              const fill = heatColor(value, maxMetric);
              const entry = countyIndex.find(
                (ci) => (ci.name || '').toUpperCase() === (c.countyKey || '').toUpperCase()
              );
              const valueLabel =
                metric === 'fundingTotal'
                  ? formatCurrency(value, 'USD', { compact: true })
                  : value;
              return (
                <Paper
                  key={c.countyKey || idx}
                  variant="outlined"
                  onClick={() => entry && handleSelectCounty(entry)}
                  sx={{
                    flex: '1 1 200px',
                    minWidth: 180,
                    maxWidth: 260,
                    p: 1.25,
                    borderLeft: '6px solid',
                    borderLeftColor: fill,
                    cursor: entry ? 'pointer' : 'default',
                    transition: 'box-shadow 120ms ease, transform 120ms ease',
                    '&:hover': entry
                      ? { boxShadow: 4, transform: 'translateY(-1px)' }
                      : undefined,
                  }}
                >
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                      #{idx + 1}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }} noWrap>
                      {humanise(c.countyDisplay || c.countyKey)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {valueLabel}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                    <Chip size="small" variant="outlined" label={`${c.studyCount} studies`} />
                    <Chip size="small" variant="outlined" label={`${c.siteCount} sites`} />
                    {Object.entries(c.ragCounts || {}).map(([r, n]) => {
                      const m = ragMeta(r);
                      return (
                        <Chip
                          key={r}
                          size="small"
                          label={`${humanise(r)}: ${n}`}
                          sx={{
                            fontWeight: 700,
                            bgcolor: `${m.hex}22`,
                            color: m.hex,
                            height: 22,
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
      ) : null}

      {/* ----- selected county summary card ----- */}
      {selectedCounty ? (
        <Paper variant="outlined" sx={{ mt: 1, p: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
              <MapIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {humanise(selectedCounty.name)} County
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCounty.constituencyCount} constituencies · {selectedCounty.wardCount} wards
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {(() => {
                const stats = byCountyMap.get(selectedCounty.name?.toUpperCase());
                if (!stats) {
                  return (
                    <Chip
                      size="small"
                      label="No KEMRI activity recorded"
                      variant="outlined"
                      color="default"
                    />
                  );
                }
                return (
                  <>
                    <Chip size="small" color="primary" variant="outlined" label={`${stats.studyCount} studies`} />
                    <Chip size="small" variant="outlined" label={`${stats.activeStudies} active`} />
                    <Chip size="small" variant="outlined" label={`${stats.siteCount} sites`} />
                    <Chip size="small" color="success" variant="outlined"
                      label={formatCurrency(stats.fundingTotal, 'USD', { compact: true }) + ' funding'} />
                    {Object.entries(stats.ragCounts || {}).map(([r, n]) => {
                      const m = ragMeta(r);
                      return (
                        <MuiTooltip key={r} title={`${humanise(r)}: ${n} stud${n === 1 ? 'y' : 'ies'}`}>
                          <Chip
                            size="small"
                            label={`${humanise(r)}: ${n}`}
                            sx={{
                              fontWeight: 700,
                              bgcolor: `${m.hex}22`,
                              color:   m.hex,
                            }}
                          />
                        </MuiTooltip>
                      );
                    })}
                  </>
                );
              })()}
            </Stack>
          </Stack>
        </Paper>
      ) : null}
    </Box>
  );
}
