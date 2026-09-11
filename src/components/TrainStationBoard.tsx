'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Clock, MapPin, Train as TrainIcon } from 'lucide-react';
import { Train, RouteStation } from '../types/train';
import { getDirectionPair } from '../data/trainData';

interface TrainStationBoardProps {
  train: Train;
  onSelectDirection: (train: Train) => void;
}

function StationTable({ train }: { train: Train }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[520px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#78716C] border-b border-[#EFE8DE]">
            <th className="py-2 pr-3 font-bold">Station</th>
            <th className="py-2 px-2 font-bold">Arr</th>
            <th className="py-2 px-2 font-bold">Dep</th>
            <th className="py-2 px-2 font-bold">Halt</th>
            <th className="py-2 px-2 font-bold">PF</th>
            <th className="py-2 pl-2 font-bold text-right">Km</th>
          </tr>
        </thead>
        <tbody>
          {train.route.map((stop: RouteStation, idx) => {
            const isOrigin = idx === 0;
            const isTerminus = idx === train.route.length - 1;
            return (
              <tr
                key={`${train.trainNumber}-${stop.stationCode}-${idx}`}
                className="border-b border-[#F5EFEA] last:border-0 text-sm"
              >
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EFE8DE] text-[#1C1917]">
                      {stop.stationCode}
                    </span>
                    <div>
                      <div className="font-bold text-[#1C1917] text-xs sm:text-sm">{stop.stationName}</div>
                      <div className="text-[10px] text-[#A8A29E]">
                        Day {stop.day}
                        {isOrigin ? ' • Origin' : isTerminus ? ' • Terminus' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 font-mono text-xs font-semibold text-[#1C1917]">{stop.scheduledArrival}</td>
                <td className="py-3 px-2 font-mono text-xs font-semibold text-[#1C1917]">{stop.scheduledDeparture}</td>
                <td className="py-3 px-2 text-xs text-[#78716C]">
                  {stop.haltMinutes ? `${stop.haltMinutes} min` : '—'}
                </td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center justify-center min-w-7 px-1.5 py-0.5 rounded-lg bg-[#FFF2EB] text-[#FF5A1F] text-xs font-black">
                    {stop.platform}
                  </span>
                </td>
                <td className="py-3 pl-2 text-right font-mono text-xs font-bold text-[#78716C]">{stop.distanceKm}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const TrainStationBoard: React.FC<TrainStationBoardProps> = ({ train, onSelectDirection }) => {
  const { down, up } = useMemo(() => getDirectionPair(train), [train]);
  const hasPair = down.id !== up.id;
  const [mobileDir, setMobileDir] = useState<'DOWN' | 'UP'>(train.direction);

  const active = mobileDir === 'UP' ? up : down;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFE8DE]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EFE8DE]">
        <div>
          <h3 className="text-xl font-black text-[#1C1917] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF5A1F]" />
            Station Board — Both Directions
          </h3>
          <p className="text-xs text-[#78716C] mt-1">
            Halt list, platforms, and timings for Down and Up services of this train pair
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#78716C]">
          <ArrowLeftRight className="w-4 h-4 text-[#FF5A1F]" />
          {down.trainNumber} ⇄ {up.trainNumber}
        </div>
      </div>

      {hasPair ? (
        <>
          <div className="lg:hidden flex gap-1.5 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DE] mb-4">
            {(['DOWN', 'UP'] as const).map((dir) => {
              const t = dir === 'DOWN' ? down : up;
              return (
                <button
                  key={dir}
                  onClick={() => {
                    setMobileDir(dir);
                    onSelectDirection(t);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mobileDir === dir
                      ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                      : 'text-[#78716C]'
                  }`}
                >
                  {dir} · {t.trainNumber}
                </button>
              );
            })}
          </div>

          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrainIcon className="w-4 h-4 text-[#FF5A1F]" />
                <span className="text-sm font-bold">
                  {active.trainNumber} {active.trainName}
                </span>
              </div>
              <span className="text-xs text-[#78716C]">
                {active.sourceCode} → {active.destinationCode}
              </span>
            </div>
            <StationTable train={active} />
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-6">
            {[{ label: 'DOWN', t: down }, { label: 'UP', t: up }].map(({ label, t }) => (
              <div
                key={t.id}
                className={`rounded-2xl border p-4 ${
                  train.id === t.id ? 'border-[#FF5A1F]/40 bg-[#FFF2EB]/40' : 'border-[#EFE8DE] bg-[#FAF7F2]/50'
                }`}
              >
                <button
                  onClick={() => onSelectDirection(t)}
                  className="w-full flex items-center justify-between mb-4 text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F]">{label}</span>
                      <span className="font-mono text-sm font-black">{t.trainNumber}</span>
                    </div>
                    <div className="text-xs text-[#78716C] mt-0.5">
                      {t.sourceName} → {t.destinationName}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold flex items-center gap-1 text-[#78716C]">
                    <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    {t.departureTime}
                  </span>
                </button>
                <StationTable train={t} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <StationTable train={train} />
      )}
    </div>
  );
};
