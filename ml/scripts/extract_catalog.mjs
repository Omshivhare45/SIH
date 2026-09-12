/**
 * Extracts the real (schedule/route) train catalog from the frontend source
 * `src/data/trainData.ts` into a machine-readable JSON file at `ml/data/catalog.json`.
 *
 * This is NOT fabricated data: it reads the actual stations, trains, and route
 * schedules defined in the repository and serializes them for the ML pipeline.
 *
 * Usage:  node ml/scripts/extract_catalog.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SRC_FILE = join(ROOT, 'src', 'data', 'trainData.ts');
const TMP_FILE = join(ROOT, '.catalog-extract.tmp.ts');
const OUT_FILE = join(ROOT, 'ml', 'data', 'catalog.json');

const IMPORT_RE = /import\s*\{[^}]*\}\s*from\s*'[^']*';\s*/;

let src = readFileSync(SRC_FILE, 'utf8');
src = src.replace(IMPORT_RE, '');
writeFileSync(TMP_FILE, src, 'utf8');

try {
  const mod = await import('file://' + TMP_FILE.replace(/\\/g, '/'));
  const catalog = {
    generated_from: 'src/data/trainData.ts',
    generated_at: new Date().toISOString(),
    stations: mod.STATIONS,
    popular_routes: mod.POPULAR_ROUTES || [],
    trains: mod.TRAINS.map((t) => ({
      id: t.id,
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      type: t.type,
      direction: t.direction,
      pairTrainNumber: t.pairTrainNumber,
      sourceCode: t.sourceCode,
      sourceName: t.sourceName,
      destinationCode: t.destinationCode,
      destinationName: t.destinationName,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      duration: t.duration,
      distanceKm: t.distanceKm,
      runsOnDays: t.runsOnDays,
      currentStatus: t.currentStatus,
      route: t.route.map((s) => ({
        stationCode: s.stationCode,
        stationName: s.stationName,
        platform: s.platform,
        scheduledArrival: s.scheduledArrival,
        scheduledDeparture: s.scheduledDeparture,
        distanceKm: s.distanceKm,
        day: s.day,
        haltMinutes: s.haltMinutes,
        status: s.status,
        delayMinutes: s.delayMinutes,
        speedKmH: s.speedKmH ?? null,
      })),
    })),
    pnrRecords: mod.PNR_RECORDS || [],
  };
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(
    `Wrote ${OUT_FILE} — trains=${catalog.trains.length}, stations=${catalog.stations.length}, pnr=${catalog.pnrRecords.length}`
  );
} finally {
  rmSync(TMP_FILE, { force: true });
}