'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Navigation, Radio, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { Train } from '../types/train';

interface TrainCardProps {
  train: Train;
  onTrackLive: (train: Train) => void;
  onOpenCoach: (train: Train) => void;
}

export const TrainCard: React.FC<TrainCardProps> = ({ train, onTrackLive, onOpenCoach }) => {
  const typeColors = {
    'Vande Bharat': 'from-cyan-500 to-blue-600 text-white border-cyan-400',
    'Rajdhani': 'from-amber-500 to-rose-600 text-white border-amber-400',
    'Shatabdi': 'from-blue-500 to-indigo-600 text-white border-blue-400',
    'Tejas': 'from-amber-400 to-orange-500 text-slate-950 border-amber-300',
    'Duronto': 'from-emerald-500 to-teal-600 text-white border-emerald-400',
    'Superfast': 'from-purple-500 to-indigo-600 text-white border-purple-400',
    'Express': 'from-slate-600 to-slate-800 text-white border-slate-500',
  };

  const badgeGradient = typeColors[train.type] || typeColors['Express'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="backdrop-blur-2xl bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden group"
    >
      {/* Top subtle glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-400 to-transparent transition-all duration-500" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 font-mono text-sm font-bold border border-cyan-500/30 shadow-inner">
            {train.trainNumber}
          </span>
          <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
            {train.trainName}
          </h3>
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r ${badgeGradient} shadow-sm`}>
            {train.type}
          </span>
        </div>

        {/* Operating Days */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <span className="text-slate-500 mr-1 font-sans">Runs on:</span>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const active = train.runsOnDays.includes(day);
            return (
              <span
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  active ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-600 bg-slate-950'
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Origin -> Duration -> Destination Bar */}
      <div className="grid grid-cols-3 items-center text-center sm:text-left py-3 border-y border-slate-800/80 my-2">
        {/* Departure */}
        <div>
          <span className="text-xl sm:text-2xl font-black font-mono text-white">
            {train.departureTime}
          </span>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">
            {train.sourceName} <span className="text-cyan-400 font-mono">({train.sourceCode})</span>
          </div>
        </div>

        {/* Duration Track Icon */}
        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-[11px] font-mono text-cyan-300 font-semibold mb-1">
            {train.duration}
          </span>
          <div className="w-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 relative">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">{train.distanceKm} km</span>
        </div>

        {/* Arrival */}
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black font-mono text-white">
            {train.arrivalTime}
          </span>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">
            {train.destinationName} <span className="text-indigo-400 font-mono">({train.destinationCode})</span>
          </div>
        </div>
      </div>

      {/* Live Status Pill */}
      <div className="flex items-center justify-between py-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-xl border border-emerald-500/20">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {train.currentStatus.statusText}
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
          Speed: <strong className="text-cyan-300">{train.currentStatus.currentSpeedKmH} km/h</strong>
        </span>
      </div>

      {/* Class Availabilities & Pricing */}
      <div className="pt-3 flex flex-wrap items-center gap-2">
        {train.classes.map((cls) => {
          const isAvail = cls.statusType === 'available';
          const isRac = cls.statusType === 'rac';

          return (
            <div
              key={cls.type}
              className={`flex-1 min-w-[110px] p-2.5 rounded-2xl border text-center transition-all ${
                isAvail
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                  : isRac
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                <span className="text-white font-mono">{cls.type}</span>
                <span className="text-slate-300 font-mono">₹{cls.price}</span>
              </div>
              <span
                className={`text-[11px] font-bold block ${
                  isAvail ? 'text-emerald-400' : isRac ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {cls.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action CTA buttons */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onOpenCoach(train)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Coach Layout
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTrackLive(train)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          Live GPS Status
        </motion.button>
      </div>
    </motion.div>
  );
};
