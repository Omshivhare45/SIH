'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Train as TrainIcon, Clock, ArrowUpRight, Volume2, ShieldCheck } from 'lucide-react';
import { TRAINS, STATIONS } from '../data/trainData';
import { Train } from '../types/train';
import { railAudio } from '../utils/audio';

interface StationRadarProps {
  stationCode: string;
  onSelectTrain: (train: Train) => void;
}

export const StationRadar: React.FC<StationRadarProps> = ({ stationCode, onSelectTrain }) => {
  const [timeWindow, setTimeWindow] = useState<'2' | '4' | '8'>('4');
  const stationInfo = STATIONS.find((s) => s.code === stationCode) || STATIONS[0];

  // Find all trains passing through or originating/terminating at this station
  const stationTrains = TRAINS.filter((t) =>
    t.route.some((r) => r.stationCode === stationCode) ||
    t.sourceCode === stationCode ||
    t.destinationCode === stationCode
  );

  const handlePlayStationChime = (train: Train, platform: number | string) => {
    railAudio.speakAnnouncement(train.trainNumber, train.trainName, stationInfo.name, platform);
  };

  return (
    <div className="backdrop-blur-2xl bg-slate-900/85 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
              {stationInfo.code}
            </span>
            <h3 className="text-xl font-bold text-white">
              {stationInfo.name} Live Electronic Train Indicator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform board, arriving & departing services in next {timeWindow} hours
          </p>
        </div>

        {/* Time Window Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
          {(['2', '4', '8'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeWindow === w
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Next {w}h
            </button>
          ))}
        </div>
      </div>

      {/* Electronic Board Table */}
      <div className="space-y-3">
        {stationTrains.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Radio className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">No scheduled trains in this window.</p>
          </div>
        ) : (
          stationTrains.map((train) => {
            const stop = train.route.find((r) => r.stationCode === stationCode) || train.route[0];
            const isOrigin = train.sourceCode === stationCode;
            const isTerm = train.destinationCode === stationCode;

            return (
              <motion.div
                key={train.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Train details */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 shrink-0 font-mono font-bold text-xs">
                    PF {stop.platform || '1'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cyan-300">
                        {train.trainNumber}
                      </span>
                      <h4 className="font-bold text-sm text-white">{train.trainName}</h4>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {train.sourceName} ➔ {train.destinationName} •{' '}
                      <span className="text-amber-300 font-medium">
                        {isOrigin ? 'Originates Here' : isTerm ? 'Terminating Service' : 'Through Stop'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timing & Delay & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white">
                      {stop.actualArrival !== 'Source' ? stop.actualArrival : stop.actualDeparture}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stop.delayMinutes <= 0
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {stop.delayMinutes <= 0 ? 'On Time' : `+${stop.delayMinutes}m Late`}
                    </span>
                  </div>

                  {/* Announce & Spot CTA */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayStationChime(train, stop.platform)}
                      title="Play Station Audio Announcement"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectTrain(train)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      Track <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
