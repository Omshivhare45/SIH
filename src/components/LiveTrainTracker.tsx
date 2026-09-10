'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train as TrainIcon,
  Navigation,
  Clock,
  MapPin,
  Volume2,
  Share2,
  Layers,
  Gauge,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Utensils,
  Maximize2,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Train, RouteStation } from '../types/train';
import { railAudio } from '../utils/audio';

interface LiveTrainTrackerProps {
  train: Train;
  onOpenCoachLayout: () => void;
}

export const LiveTrainTracker: React.FC<LiveTrainTrackerProps> = ({ train, onOpenCoachLayout }) => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(train.currentStatus.currentSpeedKmH || 115);
  const [simulatedDelay, setSimulatedDelay] = useState<number>(train.currentStatus.delayMinutes || 0);
  const [activeStationIdx, setActiveStationIdx] = useState<number>(1);
  const [isAnnouncing, setIsAnnouncing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Speedometer dynamic realistic fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      setCurrentSpeed((prev) => {
        const next = Math.round(prev + delta);
        return Math.min(Math.max(next, 0), 160);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentStation = train.route[activeStationIdx] || train.route[0];
  const nextStation = train.route[activeStationIdx + 1] || train.route[train.route.length - 1];

  const handleSpeakAnnouncement = async () => {
    setIsAnnouncing(true);
    await railAudio.speakAnnouncement(
      train.trainNumber,
      train.trainName,
      currentStation.stationName,
      currentStation.platform
    );
    setIsAnnouncing(false);
  };

  const handleShareStatus = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAdvanceSimulation = () => {
    if (activeStationIdx < train.route.length - 1) {
      setActiveStationIdx((prev) => prev + 1);
      railAudio.playTrainHorn();
    } else {
      setActiveStationIdx(0);
    }
  };

  return (
    <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Train Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-sm font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                {train.trainNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider">
                {train.type}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE GPS LOCKED
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {train.trainName}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300 mt-2">
              <span className="font-semibold text-white">{train.sourceName} ({train.sourceCode})</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">{train.destinationName} ({train.destinationCode})</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300 font-mono">{train.distanceKm} KM</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{train.duration} Total Run</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Announcement Audio Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSpeakAnnouncement}
              disabled={isAnnouncing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
            >
              <Volume2 className={`w-4 h-4 text-cyan-400 ${isAnnouncing ? 'animate-bounce' : ''}`} />
              {isAnnouncing ? 'Announcing...' : 'Station Announcement'}
            </motion.button>

            {/* Coach Layout Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenCoachLayout}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Coach Layout
            </motion.button>

            {/* Share / Copy status */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleShareStatus}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-indigo-300" />
              {copied ? 'Copied Link!' : 'Share'}
            </motion.button>
          </div>
        </div>

        {/* Live HUD Telemetry Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Speedometer Gauge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Gauge className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Live Speed</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-cyan-300">{currentSpeed}</span>
                <span className="text-[10px] font-mono text-slate-400">km/h</span>
              </div>
            </div>
          </div>

          {/* Delay / Punctuality */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl border ${
              simulatedDelay <= 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {simulatedDelay <= 0 ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Punctuality</span>
              <span className={`text-sm font-bold ${simulatedDelay <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {simulatedDelay <= 0 ? 'Right Time (+0m)' : `+${simulatedDelay}m Late`}
              </span>
            </div>
          </div>

          {/* Signal Aspect */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 border border-slate-700">
              <span className="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.9)] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Signal Clearance</span>
              <span className="text-sm font-bold text-emerald-300">CLEAR GREEN</span>
            </div>
          </div>

          {/* Locomotive / Loco Shed */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Locomotive Rake</span>
              <span className="text-xs font-mono font-bold text-indigo-200 truncate block max-w-[120px]">
                {train.currentStatus.locoNumber}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Track Timeline & Station Progression */}
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              Live Route Progression Track
            </h3>
            <p className="text-xs text-slate-400">
              Station arrival timeline, distance countdown, and platform numbers
            </p>
          </div>

          {/* Advance Simulation Step Button */}
          <button
            onClick={handleAdvanceSimulation}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Next Stop
          </button>
        </div>

        {/* Stations Timeline */}
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-[3px] before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-400 before:to-slate-700">
          {train.route.map((st, idx) => {
            const isPassed = idx < activeStationIdx;
            const isCurrent = idx === activeStationIdx;
            const isUpcoming = idx > activeStationIdx;

            return (
              <motion.div
                key={st.stationCode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative flex items-start justify-between gap-4 group"
              >
                {/* Node Bullet */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isPassed
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                      : isCurrent
                      ? 'bg-cyan-400 border-white text-slate-950 scale-125 shadow-[0_0_20px_rgba(6,182,212,1)] animate-bounce'
                      : 'bg-slate-950 border-slate-600 text-slate-500'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <TrainIcon className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>

                {/* Station Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {st.stationName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-xs font-bold">
                      {st.stationCode}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Train Here Right Now
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                    <span>Platform <strong className="text-white">#{st.platform}</strong></span>
                    <span>•</span>
                    <span>Halt: <strong className="text-slate-200">{st.haltMinutes} mins</strong></span>
                    <span>•</span>
                    <span>Distance: <strong className="text-cyan-400 font-mono">{st.distanceKm} KM</strong></span>
                  </div>
                </div>

                {/* Times & Delay */}
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-mono font-bold text-white">
                    {st.actualArrival !== 'Source' ? st.actualArrival : st.scheduledDeparture}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sch: {st.scheduledArrival}
                  </div>
                  <span
                    className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.delayMinutes <= 0
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {st.delayMinutes <= 0 ? 'On Time' : `+${st.delayMinutes}m`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
