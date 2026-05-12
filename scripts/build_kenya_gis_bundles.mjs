#!/usr/bin/env node
/**
 * Build Kenya county / constituency / ward GIS bundles for the KIMES national
 * dashboard.
 *
 * Reads from   ./api.iebc/                     (IEBC source dump)
 * Writes to    ./frontend/public/gis/kenya/    (consumed by the dashboard)
 *
 * Outputs:
 *   - kenya-counties.geojson         single FeatureCollection of all 47 counties
 *   - county-index.json              slug → { name, code, center, files, counts }
 *   - counties/<slug>/constituencies.geojson
 *   - counties/<slug>/wards.geojson
 *
 * Strategy: each constituency / ward in the IEBC index has a `center` lat/lon.
 * We perform point-in-polygon against each county polygon to assign the child
 * boundary to a county. This is one-off pre-processing — no runtime cost.
 *
 * Usage:  node scripts/build_kenya_gis_bundles.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, '..');
const SRC_DIR    = path.join(REPO_ROOT, 'api.iebc');
const OUT_DIR    = path.join(REPO_ROOT, 'frontend', 'public', 'gis', 'kenya');

// --- helpers --------------------------------------------------------------
const slugify = (name) =>
  String(name || '').toLowerCase().trim()
    .replace(/[\/\\]+/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

/** Standard ray-casting point-in-polygon for a single GeoJSON ring [lng,lat]. */
const pointInRing = (lng, lat, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-15) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

/** Polygon: outer ring true and not inside any holes. */
const pointInPolygon = (lng, lat, polygon) => {
  if (!polygon?.length) return false;
  if (!pointInRing(lng, lat, polygon[0])) return false;
  for (let h = 1; h < polygon.length; h++) {
    if (pointInRing(lng, lat, polygon[h])) return false;
  }
  return true;
};

/** Test against a Polygon or MultiPolygon GeoJSON geometry. */
const pointInGeometry = (lng, lat, geom) => {
  if (!geom) return false;
  if (geom.type === 'Polygon') return pointInPolygon(lng, lat, geom.coordinates);
  if (geom.type === 'MultiPolygon') {
    for (const polygon of geom.coordinates) {
      if (pointInPolygon(lng, lat, polygon)) return true;
    }
  }
  return false;
};

/** [minLng, minLat, maxLng, maxLat] for a polygon/multipolygon. */
const computeBbox = (geom) => {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const visit = (rings) => {
    for (const ring of rings) for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };
  if (geom.type === 'Polygon') visit(geom.coordinates);
  else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) visit(poly);
  }
  return [minLng, minLat, maxLng, maxLat];
};

const bboxContains = ([minLng, minLat, maxLng, maxLat], lng, lat) =>
  lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;

// --- Load source data -----------------------------------------------------
console.log('Reading IEBC source data from', SRC_DIR);
const countyIndex       = readJson(path.join(SRC_DIR, 'county.json'));
const constituencyIndex = readJson(path.join(SRC_DIR, 'constituency.json'));
const wardIndex         = readJson(path.join(SRC_DIR, 'ward.json'));

const countyEntries       = countyIndex.region.locations;
const constituencyEntries = constituencyIndex.region.locations;
const wardEntries         = wardIndex.region.locations;

console.log(`Loaded counties=${countyEntries.length} constituencies=${constituencyEntries.length} wards=${wardEntries.length}`);

// --- 1. Build the master counties FeatureCollection ----------------------
const countyFeatures = [];
const countyByName   = new Map();   // upper-case name → { feature, bbox, slug, code, name, center }

for (const entry of countyEntries) {
  if (!entry.polygon) continue;
  const polyPath = path.join(SRC_DIR, entry.polygon);
  if (!fs.existsSync(polyPath)) {
    console.warn(`  ⚠ missing polygon for county ${entry.name}: ${entry.polygon}`);
    continue;
  }
  const fc = readJson(polyPath);
  const sourceFeature = fc?.features?.[0];
  if (!sourceFeature) continue;

  const name = entry.name || sourceFeature.properties?.COUNTY_NAM;
  const slug = slugify(name);

  // Skip duplicates (some indexes contain both code-keyed and name-keyed entries)
  if (countyByName.has(name.toUpperCase())) continue;

  const enrichedFeature = {
    type: 'Feature',
    properties: {
      ...(sourceFeature.properties || {}),
      county_name:  name,
      county_slug:  slug,
      county_code:  entry.code,
      iebc_registered: Number(entry.registered) || 0,
      center:       entry.center || null,
    },
    geometry: sourceFeature.geometry,
  };
  countyFeatures.push(enrichedFeature);
  countyByName.set(name.toUpperCase(), {
    name, slug,
    code:    entry.code,
    center:  entry.center,
    feature: enrichedFeature,
    bbox:    computeBbox(sourceFeature.geometry),
  });
}
console.log(`Built ${countyFeatures.length} county features`);

// --- 2. Spatially assign constituencies → county ------------------------
const constituenciesByCountySlug = new Map();
let unassignedConstituencies = 0;

const assignChild = (
  entry,
  outMap,
  childKind,
  totalCount
) => {
  const lat = entry.center?.lat;
  const lng = entry.center?.lon ?? entry.center?.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  // First narrow by bbox, then exact point-in-polygon
  let assignedSlug = null;
  for (const meta of countyByName.values()) {
    if (!bboxContains(meta.bbox, lng, lat)) continue;
    if (pointInGeometry(lng, lat, meta.feature.geometry)) {
      assignedSlug = meta.slug;
      break;
    }
  }
  if (!assignedSlug) return null;

  if (!entry.polygon) return assignedSlug;
  const polyPath = path.join(SRC_DIR, entry.polygon);
  if (!fs.existsSync(polyPath)) return assignedSlug;

  let fc;
  try {
    fc = readJson(polyPath);
  } catch (err) {
    console.warn(`  ⚠ bad ${childKind} geojson ${entry.polygon}: ${err.message}`);
    return assignedSlug;
  }
  const f = fc?.features?.[0];
  if (!f) return assignedSlug;

  const enriched = {
    type: 'Feature',
    properties: {
      ...(f.properties || {}),
      kind: childKind,
      name: entry.name,
      code: entry.code,
      county_slug: assignedSlug,
      iebc_registered: Number(entry.registered) || 0,
      center: entry.center,
    },
    geometry: f.geometry,
  };

  if (!outMap.has(assignedSlug)) outMap.set(assignedSlug, []);
  outMap.get(assignedSlug).push(enriched);
  return assignedSlug;
};

console.log('Assigning constituencies → counties …');
let cIdx = 0;
for (const entry of constituencyEntries) {
  cIdx++;
  if (cIdx % 50 === 0) process.stdout.write(`  ${cIdx}/${constituencyEntries.length}\r`);
  const assigned = assignChild(entry, constituenciesByCountySlug, 'constituency', constituencyEntries.length);
  if (!assigned) unassignedConstituencies++;
}
console.log(`\n  assigned ${constituencyEntries.length - unassignedConstituencies}, unassigned ${unassignedConstituencies}`);

// --- 3. Spatially assign wards → county ---------------------------------
const wardsByCountySlug = new Map();
let unassignedWards = 0;
console.log('Assigning wards → counties …');
let wIdx = 0;
for (const entry of wardEntries) {
  wIdx++;
  if (wIdx % 100 === 0) process.stdout.write(`  ${wIdx}/${wardEntries.length}\r`);
  const assigned = assignChild(entry, wardsByCountySlug, 'ward', wardEntries.length);
  if (!assigned) unassignedWards++;
}
console.log(`\n  assigned ${wardEntries.length - unassignedWards}, unassigned ${unassignedWards}`);

// --- 4. Write outputs ----------------------------------------------------
ensureDir(OUT_DIR);

const countiesFc = {
  type: 'FeatureCollection',
  features: countyFeatures,
};
fs.writeFileSync(
  path.join(OUT_DIR, 'kenya-counties.geojson'),
  JSON.stringify(countiesFc)
);
console.log(`Wrote kenya-counties.geojson (${countyFeatures.length} features)`);

const countyIndexOut = [];
for (const meta of countyByName.values()) {
  const cs = constituenciesByCountySlug.get(meta.slug) || [];
  const ws = wardsByCountySlug.get(meta.slug)         || [];

  const countyDir = path.join(OUT_DIR, 'counties', meta.slug);
  ensureDir(countyDir);

  fs.writeFileSync(
    path.join(countyDir, 'constituencies.geojson'),
    JSON.stringify({ type: 'FeatureCollection', features: cs })
  );
  fs.writeFileSync(
    path.join(countyDir, 'wards.geojson'),
    JSON.stringify({ type: 'FeatureCollection', features: ws })
  );

  countyIndexOut.push({
    name: meta.name,
    slug: meta.slug,
    code: meta.code,
    center: meta.center,
    bbox: meta.bbox,
    constituencyCount: cs.length,
    wardCount:         ws.length,
    files: {
      constituencies: `gis/kenya/counties/${meta.slug}/constituencies.geojson`,
      wards:          `gis/kenya/counties/${meta.slug}/wards.geojson`,
    },
  });
}

countyIndexOut.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(
  path.join(OUT_DIR, 'county-index.json'),
  JSON.stringify(countyIndexOut, null, 2)
);
console.log(`Wrote county-index.json (${countyIndexOut.length} counties)`);

// --- 5. Summary ----------------------------------------------------------
const totalConstituencies = countyIndexOut.reduce((a, c) => a + c.constituencyCount, 0);
const totalWards          = countyIndexOut.reduce((a, c) => a + c.wardCount, 0);
console.log('\n=== Build summary ===');
console.log(`Counties     : ${countyFeatures.length}`);
console.log(`Constituencies assigned: ${totalConstituencies}/${constituencyEntries.length}`);
console.log(`Wards assigned         : ${totalWards}/${wardEntries.length}`);
console.log(`Output directory       : ${OUT_DIR}`);
