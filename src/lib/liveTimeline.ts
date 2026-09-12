/**
 * NTES live payload -> ordered station timeline.
 *
 * The timeline is always built from the NTES schedule station list, which is
 * already in journey order (SOURCE -> ... -> DESTINATION). As a safety guard
 * the sequence is verified against the live feed's SRC and corrected if a
 * reversed source ever shows up - the route is NEVER reversed for display.
 *
 * Provenance:
 *   - "ntes"       fields taken from the real NTES live/schedule feed
 *   - "unavailable"fields NTES does not provide (speed, GPS distance, location)
 */

import { LiveTrainPayload, NtesLiveStop, NtesScheduleStation } from './api';

export interface LiveStopView {
  stationCode: string;
  stationName: string;
  platform: string | null;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival: string | null;
  actualDeparture: string | null;
  distanceKm: number;
  haltMinutes: number;
  status: 'passed' | 'current' | 'upcoming';
  delayMinutes: number;
  arrived: boolean;
  departed: boolean;
}

export interface LivePosition {
  /** Index in `stops` after which the single train marker is rendered. */
  insertIndex: number | null;
  /** True when the train is halted at the last reported station (not departed). */
  atStation: boolean;
  lastReported: { code: string | null; name: string | null };
  nextImmediate: { code: string | null; name: string | null };
  /** True when the immediate upcoming station is a non-stopping (pass-through) station. */
  passingThrough: boolean;
  nextStoppage: { code: string | null; name: string | null };
  delayMinutes: number;
  statusText: string;
  lastUpdate: string;
}

export interface LiveTimeline {
  trainNumber: string;
  trainName: string;
  sourceCode: string;
  destinationCode: string;
  journeyDate: string;
  currentStation: { code: string | null; name: string | null };
  nextImmediate: { code: string | null; name: string | null };
  nextStoppage: { code: string | null; name: string | null };
  delayMinutes: number;
  punctual: boolean;
  statusText: string;
  lastUpdate: string;
  isBetweenStations: boolean;
  stops: LiveStopView[];
  position: LivePosition;
}

function minutesDelay(value?: string): number | null {
  if (!value) return null;
  const v = value.trim();
  if (v.toLowerCase() === 'on time') return 0;
  const parts = v.split(':');
  if (parts.length === 2) {
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) return hh * 60 + mm;
    return null;
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function addMinutesToHm(hm: string | undefined, minutes: number): string | null {
  if (!hm || minutes === null || minutes === undefined) return null;
  const parts = hm.trim().split(':');
  if (parts.length < 2) return null;
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const total = (hh * 60 + mm + minutes) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function buildLiveTimeline(payload: LiveTrainPayload): LiveTimeline | null {
  const schedule = payload.schedule;
  const live = payload.live_status;
  if (!schedule?.stations?.length || !live) return null;

  const stations: NtesScheduleStation[] = schedule.stations;

  // Safety net: never display a reversed route.
  const src = live.SRC;
  const reversed = src && stations.length > 0 && stations[0].StationCode !== src;
  const ordered: NtesScheduleStation[] = reversed ? [...stations].reverse() : stations;

  const liveByCode = new Map<string, NtesLiveStop>();
  for (const st of live.STNS || []) {
    if (st?.SC) liveByCode.set(st.SC, st);
  }
  const stopCodes = new Set(ordered.map((s) => s.StationCode).filter(Boolean));
  const lastStation = live.LSTN ?? null;
  const isBetweenStations = lastStation ? !stopCodes.has(lastStation) : true;

  const currentDelay = Number.isFinite(Number(live.LDEL)) ? Number(live.LDEL) : 0;

  const stops: LiveStopView[] = ordered.map((st) => {
    const code = st.StationCode ?? '';
    const lv = liveByCode.get(code);
    const schedArr = st.STA ?? '';
    const schedDep = st.STD ?? '';
    const arrived = Boolean(lv?.ISA);
    const departed = Boolean(lv?.ISD);

    const arrDelay = minutesDelay(lv?.DARR ?? '');
    const depDelay = minutesDelay(lv?.DDEP ?? '');

    let actualArrival: string | null = null;
    let actualDeparture: string | null = null;

    if (arrived) {
      actualArrival =
        schedArr !== '' && schedArr !== 'Source'
          ? addMinutesToHm(schedArr, arrDelay ?? 0)
          : lv?.DARR || null;
    } else if (lv) {
      const eta = addMinutesToHm(schedArr !== 'Source' ? schedArr : undefined, currentDelay);
      actualArrival = eta ? `Expected ${eta}` : null;
    }

    if (departed) {
      actualDeparture =
        schedDep !== '' && schedDep !== 'Destination'
          ? addMinutesToHm(schedDep, depDelay ?? 0)
          : lv?.DDEP || null;
    } else if (lv && schedDep !== '' && schedDep !== 'Destination') {
      const etd = addMinutesToHm(schedDep, currentDelay);
      actualDeparture = etd ? `Expected ${etd}` : null;
    }

    let status: LiveStopView['status'] = 'upcoming';
    if (departed) status = 'passed';
    else if (code === lastStation) status = 'current';

    const stopDelay = departed ? (depDelay ?? arrDelay ?? 0) : arrived ? (arrDelay ?? 0) : currentDelay;

    return {
      stationCode: code,
      stationName: st.StationName ?? lv?.SN ?? '',
      platform: lv?.PF ?? null,
      scheduledArrival: schedArr === '' || schedArr === 'Source' ? 'Source' : schedArr,
      scheduledDeparture: schedDep === '' || schedDep === 'Destination' ? 'Destination' : schedDep,
      actualArrival,
      actualDeparture,
      distanceKm: Number(st.Distance ?? 0),
      haltMinutes: Number(st.Halt ?? 0),
      status,
      delayMinutes: stopDelay,
      arrived,
      departed,
    };
  });

  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  // ---- SINGLE train-position marker ---------------------------------------
  // Deterministic, index-based insertion -> exactly ONE marker can ever render.
  const stopCodeSet = new Set(stops.map((s) => s.stationCode));

  // Map any station code (stoppage OR WTT wayside) to the stop row index it
  // sits after. Wayside stations live inside their neighbour stop's WTTSTNS.
  const prevStopIndexFor = (code?: string | null): number | null => {
    if (!code) return null;
    const direct = stops.findIndex((s) => s.stationCode === code);
    if (direct >= 0) return direct;
    for (const st of live.STNS || []) {
      if (st?.WTTSTNS?.some((w) => w?.SC === code)) {
        const idx = stops.findIndex((s) => s.stationCode === st.SC);
        return idx >= 0 ? idx : null;
      }
    }
    return null;
  };

  const lastIdx = prevStopIndexFor(live.LSTN);

  let insertIndex: number | null;
  let atStation: boolean;
  if (lastIdx == null) {
    // No last-reported station (e.g. "Yet to start from Train Source") ->
    // the train is at its source; place the marker at the first stop.
    insertIndex = 0;
    atStation = true;
  } else {
    const st = stops[lastIdx];
    atStation = st.status === 'current' && !st.departed;
    insertIndex = lastIdx;
  }
  if (insertIndex > stops.length - 1) insertIndex = stops.length - 1;

  const lastReportedCode = live.LSTN || first?.StationCode || '';
  const lastReportedName =
    live.LSTNN || stops[insertIndex]?.stationName || first?.StationName || '';

  const nstn = live.NSTN || undefined;
  const passingThrough = nstn !== undefined && !stopCodeSet.has(nstn);

  const npstnIdx = live.NPSTN ? stops.findIndex((s) => s.stationCode === live.NPSTN) : -1;

  return {
    trainNumber: payload.train_number,
    trainName: live.TNM ?? schedule.TrainName ?? payload.train_number,
    sourceCode: src ?? first?.StationCode ?? '',
    destinationCode: live.DSTN ?? last?.StationCode ?? '',
    journeyDate: payload.journey_date_used ?? '',
    currentStation: { code: live.LSTN ?? null, name: live.LSTNN ?? null },
    nextImmediate: { code: live.NSTN ?? null, name: live.NSTNN ?? null },
    nextStoppage: { code: live.NPSTN ?? null, name: live.NPSTNN ?? null },
    delayMinutes: currentDelay,
    punctual: Boolean(live.ISPTT),
    statusText: live.LUPDFULL ?? live.LASTUPD ?? '',
    lastUpdate: live.LTIME ?? '',
    isBetweenStations,
    stops,
    position: {
      insertIndex,
      atStation,
      lastReported: { code: lastReportedCode, name: lastReportedName },
      nextImmediate: { code: live.NSTN || null, name: live.NSTNN || null },
      passingThrough,
      nextStoppage:
        npstnIdx >= 0
          ? {
              code: live.NPSTN || null,
              name: live.NPSTNN || stops[npstnIdx].stationName || null,
            }
          : { code: live.NPSTN || null, name: live.NPSTNN || null },
      delayMinutes: currentDelay,
      statusText: live.LUPDFULL ?? live.LASTUPD ?? '',
      lastUpdate: live.LTIME ?? '',
    },
  };
}