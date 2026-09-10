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

  // Realistic speed fluctuation
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
      colors: ['#4ade80', '#22c55e', '#16a34a', '#ffffff'],
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
        className="glass rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Top green accent light */}
        <div className="absolute top-0 inset-x-20 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              <span className="px-3.5 py-1 rounded-xl bg-green-500 text-black font-mono text-sm font-black shadow-[0_0_20px_rgba(74,222,128,0.5)]">
                {train.trainNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-green-950/60 text-green-300 border border-green-500/30 text-xs font-bold uppercase tracking-wider">
                {train.type}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold bg-green-500/10 px-2.5 py-0.5 rounded-lg border border-green-500/30">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                LIVE GPS LOCKED
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {train.trainName}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 mt-2.5">
              <span className="font-semibold text-white">{train.sourceName} ({train.sourceCode})</span>
              <ArrowRight className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-white">{train.destinationName} ({train.destinationCode})</span>
              <span className="text-gray-600">•</span>
              <span className="text-green-300 font-mono font-medium">{train.distanceKm} KM</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{train.duration} Total Run</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Announcement Audio Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSpeakAnnouncement}
              disabled={isAnnouncing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-300 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all"
            >
              <Volume2 className={`w-4 h-4 text-green-400 ${isAnnouncing ? 'animate-bounce' : ''}`} />
              {isAnnouncing ? 'Announcing...' : 'Station Chime'}
            </motion.button>

            {/* Coach Layout Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenCoachLayout}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4 text-green-400" />
              Coach Layout
            </motion.button>

            {/* Share status */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShareStatus}
              className="px-4 py-2.5 rounded-2xl bg-green-950/40 hover:bg-green-950/60 border border-green-500/30 text-green-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-green-400" />
              {copied ? 'Copied!' : 'Share'}
            </motion.button>
          </div>
        </div>

        {/* Live HUD Telemetry Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Speedometer Gauge */}
          <div className="bg-[#050a05] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
              <Gauge className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Live Speed</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-green-300">{currentSpeed}</span>
                <span className="text-[10px] font-mono text-gray-500">km/h</span>
              </div>
            </div>
          </div>

          {/* Delay / Punctuality */}
          <div className="bg-[#050a05] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl border ${
              simulatedDelay <= 0
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {simulatedDelay <= 0 ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Punctuality</span>
              <span className={`text-xs font-bold ${simulatedDelay <= 0 ? 'text-green-300' : 'text-amber-300'}`}>
                {simulatedDelay <= 0 ? 'Right Time (+0m)' : `+${simulatedDelay}m Delay`}
              </span>
            </div>
          </div>

          {/* Signal Aspect */}
          <div className="bg-[#050a05] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-950/40 border border-green-500/30">
              <span className="w-4 h-4 rounded-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Signal Status</span>
              <span className="text-xs font-bold text-green-300">CLEAR GREEN</span>
            </div>
          </div>

          {/* Locomotive / Loco Shed */}
          <div className="bg-[#050a05] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Loco Rake</span>
              <span className="text-xs font-mono font-bold text-gray-200 truncate block max-w-[110px]">
                {train.currentStatus.locoNumber}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Track Timeline & Station Progression */}
      <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h3
              className="text-xl font-bold text-white flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <Radio className="w-4 h-4 text-green-400 animate-pulse" />
              Live Route Progression
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Arrival schedule, halt durations, and platform allocations
            </p>
          </div>

          {/* Advance Simulation Step Button */}
          <button
            onClick={handleAdvanceSimulation}
            className="px-3.5 py-1.5 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-green-400" />
            Advance Next Stop
          </button>
        </div>

        {/* Stations Timeline */}
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-green-400 before:via-emerald-500/40 before:to-white/10">
          {train.route.map((st, idx) => {
            const isPassed = idx < activeStationIdx;
            const isCurrent = idx === activeStationIdx;
            const isUpcoming = idx > activeStationIdx;

            return (
              <motion.div
                key={st.stationCode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="relative flex items-start justify-between gap-4 group"
              >
                {/* Node Bullet */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isPassed
                      ? 'bg-green-500 border-green-300 text-black shadow-[0_0_12px_rgba(74,222,128,0.7)]'
                      : isCurrent
                      ? 'bg-white border-green-400 text-black scale-125 shadow-[0_0_20px_rgba(74,222,128,1)] animate-bounce'
                      : 'bg-[#050a05] border-gray-700 text-gray-600'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <TrainIcon className="w-3.5 h-3.5 stroke-[3] text-green-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-700" />
                  )}
                </div>

                {/* Station Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white group-hover:text-green-300 transition-colors">
                      {st.stationName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-green-400 font-mono text-xs font-bold border border-white/5">
                      {st.stationCode}
                    </span>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Train Here Right Now
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>Platform <strong className="text-white">#{st.platform}</strong></span>
                    <span>•</span>
                    <span>Halt: <strong className="text-gray-200">{st.haltMinutes}m</strong></span>
                    <span>•</span>
                    <span>Distance: <strong className="text-green-400 font-mono">{st.distanceKm} KM</strong></span>
                  </div>
                </div>

                {/* Times & Delay */}
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-mono font-bold text-white">
                    {st.actualArrival !== 'Source' ? st.actualArrival : st.scheduledDeparture}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Sch: {st.scheduledArrival}
                  </div>
                  <span
                    className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      st.delayMinutes <= 0
                        ? 'bg-green-500/15 text-green-300 border border-green-500/30'
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
