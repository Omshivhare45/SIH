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
  RefreshCw,
  Eye,
  EyeOff,
  CloudSun,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Train, RouteStation } from '../types/train';
import { railAudio } from '../utils/audio';

interface LiveTrainTrackerProps {
  train: Train;
  onOpenCoachLayout: () => void;
}

export const LiveTrainTracker: React.FC<LiveTrainTrackerProps> = ({ train, onOpenCoachLayout }) => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(train.currentStatus.currentSpeedKmH || 128);
  const [simulatedDelay, setSimulatedDelay] = useState<number>(train.currentStatus.delayMinutes || 0);
  const [activeStationIdx, setActiveStationIdx] = useState<number>(1);
  const [isAnnouncing, setIsAnnouncing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showIntermediate, setShowIntermediate] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Realistic live speed fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 3;
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
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF5A1F', '#FF7A00', '#1C1917'],
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

  const handleRefreshGPS = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.4 },
        colors: ['#10B981', '#FF5A1F'],
      });
    }, 800);
  };

  return (
    <div id="tracking" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. HERO LIVE STATUS BANNER (Where is my train signature header) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFE8DE] relative overflow-hidden">
        
        {/* Top subtle orange accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5A1F] via-[#FF8A00] to-[#FF5A1F]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-xl bg-[#FF5A1F] text-white font-mono text-sm font-black shadow-orange-glow">
                {train.trainNumber}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
                {train.trainName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#FF5A1F] border border-[#FF5A1F]/20">
                {train.type}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#78716C] font-medium">
              <span>{train.sourceName} ({train.sourceCode})</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>{train.destinationName} ({train.destinationCode})</span>
              <span className="text-[#D6CEC4]">•</span>
              <span className="font-mono">{train.distanceKm} km</span>
              <span className="text-[#D6CEC4]">•</span>
              <span>{train.duration}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Speedometer Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] text-[#1C1917]">
              <Gauge className="w-4 h-4 text-[#FF5A1F]" />
              <div>
                <span className="block text-[9px] uppercase font-bold text-[#78716C]">Speed</span>
                <span className="font-mono text-sm font-bold text-[#1C1917]">{currentSpeed} km/h</span>
              </div>
            </div>

            {/* Audio Announcement Button */}
            <button
              onClick={handleSpeakAnnouncement}
              disabled={isAnnouncing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#1C1917] hover:text-[#FF5A1F] border border-[#EFE8DE] text-xs font-bold transition-all shadow-xs"
              title="Speak Station Announcement"
            >
              <Volume2 className={`w-4 h-4 ${isAnnouncing ? 'animate-bounce text-[#FF5A1F]' : 'text-[#78716C]'}`} />
              <span>{isAnnouncing ? 'Announcing...' : 'Announce'}</span>
            </button>

            {/* GPS Refresh Button */}
            <button
              onClick={handleRefreshGPS}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#1C1917] hover:text-[#FF5A1F] border border-[#EFE8DE] text-xs font-bold transition-all shadow-xs"
              title="Refresh Real-Time GPS"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF5A1F]' : 'text-[#78716C]'}`} />
              <span>Refresh</span>
            </button>

            {/* Advance Demo Simulation Button */}
            <button
              onClick={handleAdvanceSimulation}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#E44810] text-white text-xs font-bold transition-all shadow-orange-glow"
              title="Simulate Next Station Movement"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Move Next Stop</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareStatus}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#78716C] hover:text-[#FF5A1F] border border-[#EFE8DE] transition-all shadow-xs"
              title="Share Live Status"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Running Delay Status Ribbon */}
        <div className="mt-6 pt-5 border-t border-[#EFE8DE] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
                <span>Departed {currentStation.stationName}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  On Time
                </span>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">
                Next stop: <strong className="text-[#1C1917]">{nextStation.stationName}</strong> ({nextStation.stationCode}) • Platform {nextStation.platform} • ETA {nextStation.scheduledArrival}
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-[#78716C]">
            GPS Telemetry: <span className="text-[#1C1917] font-bold">ISRO NavIC-Locked</span> • 1 min ago
          </div>
        </div>

        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200"
          >
            ✓ Live Tracking link copied to clipboard!
          </motion.div>
        )}
      </div>

      {/* 2. DESKTOP SPLIT COMMAND CENTER:
          Left (65%): Station-by-Station Timeline (Where is my train)
          Right (35%): Boarding Pass + Route Map + Coach Rake */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Vertical Station Route Timeline */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFE8DE]">
          
          {/* Header & Intermediate Stops Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-[#EFE8DE]">
            <div>
              <h3 className="text-xl font-bold text-[#1C1917] flex items-center gap-2">
                <TrainIcon className="w-5 h-5 text-[#FF5A1F]" />
                Station-by-Station Live Timeline
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Scheduled vs Actual Arrival times, platforms, and real-time station countdown
              </p>
            </div>

            {/* Toggle Intermediate Non-Stop Stations */}
            <button
              onClick={() => setShowIntermediate(!showIntermediate)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FFF2EB] border border-[#EFE8DE] text-xs font-semibold text-[#57534E] transition-all"
            >
              {showIntermediate ? <EyeOff className="w-3.5 h-3.5 text-[#FF5A1F]" /> : <Eye className="w-3.5 h-3.5 text-[#FF5A1F]" />}
              <span>{showIntermediate ? 'Hide Wayside Stations' : 'Show Intermediate Stations'}</span>
            </button>
          </div>

          {/* Timeline Track */}
          <div className="relative pl-6 sm:pl-8 space-y-6">
            
            {/* Continuous Vertical Railway Track Line */}
            <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-4 w-1 bg-[#EFE8DE] -translate-x-1/2 rounded-full" />

            {train.route.map((station, idx) => {
              const isPassed = idx < activeStationIdx;
              const isCurrent = idx === activeStationIdx;
              const isNext = idx === activeStationIdx + 1;
              const isLast = idx === train.route.length - 1;

              return (
                <React.Fragment key={station.stationCode}>
                  
                  {/* Station Node Row */}
                  <div
                    className={`relative flex items-start gap-4 sm:gap-6 p-4 rounded-2xl transition-all ${
                      isCurrent
                        ? 'bg-[#FFF2EB] border border-[#FF5A1F]/30 shadow-xs'
                        : isNext
                        ? 'bg-[#FAF7F2] border border-[#EFE8DE]'
                        : isPassed
                        ? 'opacity-70 hover:opacity-100'
                        : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {/* Track Node Circle */}
                    <div className="absolute -left-[25px] sm:-left-[33px] top-6 -translate-x-1/2 flex items-center justify-center">
                      {isPassed ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-orange-glow ring-4 ring-[#FF5A1F]/20">
                          <Navigation className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                      ) : isNext ? (
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-[#FF5A1F] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-[#D6CEC4]" />
                      )}
                    </div>

                    {/* Distance from origin */}
                    <div className="w-14 sm:w-16 shrink-0 text-right">
                      <span className="font-mono text-xs font-bold text-[#78716C] block">
                        {station.distanceKm} km
                      </span>
                      <span className="text-[10px] text-[#A8A29E] block">
                        {station.haltMinutes ? `${station.haltMinutes}m halt` : 'source'}
                      </span>
                    </div>

                    {/* Station Name & Details */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#EFE8DE] text-[#1C1917]">
                          {station.stationCode}
                        </span>
                        <h4 className={`text-sm sm:text-base font-bold ${isCurrent ? 'text-[#FF5A1F]' : 'text-[#1C1917]'}`}>
                          {station.stationName}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-black bg-[#FF5A1F] text-white px-2 py-0.5 rounded-full">
                            Current Halt
                          </span>
                        )}
                        {isNext && (
                          <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Next Stop
                          </span>
                        )}
                      </div>

                      {/* Timings: Scheduled vs Actual */}
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-white border border-[#EFE8DE]">
                          <span className="block text-[10px] text-[#78716C] uppercase font-semibold">Sch. Arr</span>
                          <span className="font-mono font-bold text-[#1C1917]">{station.scheduledArrival}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#EFE8DE]">
                          <span className="block text-[10px] text-[#78716C] uppercase font-semibold">Actual Arr</span>
                          <span className={`font-mono font-bold ${station.delayMinutes > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {station.actualArrival}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#EFE8DE]">
                          <span className="block text-[10px] text-[#78716C] uppercase font-semibold">Sch. Dep</span>
                          <span className="font-mono font-bold text-[#1C1917]">{station.scheduledDeparture}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#EFE8DE] flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] text-[#78716C] uppercase font-semibold">Platform</span>
                            <span className="font-bold text-[#FF5A1F]">PF #{station.platform}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LIVE MOVING TRAIN MARKER (Between Stations on the vertical track) */}
                  {isCurrent && !isLast && (
                    <div className="relative my-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7A00] text-white shadow-orange-glow flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white text-[#FF5A1F] flex items-center justify-center font-bold shadow-xs">
                          <TrainIcon className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-white/90">
                            Live Train Location
                          </div>
                          <div className="text-sm font-bold">
                            Running at {currentSpeed} km/h • 38 km to {nextStation.stationName}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right">
                        <span className="text-[11px] font-mono bg-white/20 px-2.5 py-1 rounded-lg border border-white/25">
                          ETA {nextStation.scheduledArrival}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Intermediate wayside stations if toggled */}
                  {showIntermediate && !isLast && (
                    <div className="pl-6 py-1 border-l-2 border-dashed border-[#EFE8DE] ml-3 text-[11px] text-[#A8A29E] space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6CEC4]" />
                        <span>Passes small junction • Speed limit 130 km/h</span>
                      </div>
                    </div>
                  )}

                </React.Fragment>
              );
            })}

          </div>
        </div>

        {/* RIGHT COLUMN: Boarding Pass + Live Map + Coach Rake Position */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Boarding Pass Ticket Card (Directly inspired by Image 3) */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFE8DE] relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Boarding Pass
              </span>
              <span className="text-xs font-mono font-bold text-[#FF5A1F] bg-[#FFF2EB] px-2.5 py-1 rounded-full">
                {train.distanceKm} KM
              </span>
            </div>

            {/* Top Wavy Curve Preview */}
            <div className="py-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#1C1917] mb-1">
                <span>{train.sourceCode} (Dep {train.departureTime})</span>
                <span className="text-[#FF5A1F] bg-[#FFF2EB] px-2 py-0.5 rounded-full text-[10px]">
                  {train.duration}
                </span>
                <span>{train.destinationCode} (Arr {train.arrivalTime})</span>
              </div>
              <svg className="w-full h-8" viewBox="0 0 260 25" fill="none">
                <path d="M 5 15 Q 65 0, 130 15 T 255 15" stroke="#FF5A1F" strokeWidth="2.5" fill="none" />
                <circle cx="5" cy="15" r="4" fill="#1C1917" />
                <circle cx="130" cy="15" r="5" fill="#FF5A1F" />
                <circle cx="255" cy="15" r="4" fill="#FF5A1F" />
              </svg>
            </div>

            {/* Orange Train Card */}
            <div className="rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7A00] p-4 text-white shadow-orange-glow mt-2">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-white/80">{train.type}</span>
                <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md">{train.trainNumber}</span>
              </div>
              <div className="text-base font-black">{train.trainName}</div>
              <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-white/20">
                <span>Depart: {train.departureTime}</span>
                <span>Arrive: {train.arrivalTime}</span>
              </div>
            </div>

            {/* Coach & Seat Details */}
            <div className="mt-4 pt-4 border-t border-[#EFE8DE] flex justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#78716C] uppercase font-bold block">Class & Coach</span>
                <span className="font-bold text-[#1C1917]">Executive (EC) • Coach E1</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#78716C] uppercase font-bold block">Seat Number</span>
                <span className="font-bold text-[#FF5A1F]">42A (Window)</span>
              </div>
            </div>

            {/* Barcode Strip */}
            <div className="mt-4 pt-3 border-t border-dashed border-[#EFE8DE] flex items-center justify-between">
              <div className="font-mono text-[10px] tracking-widest text-[#78716C]">
                |||| | ||||| || |||||| | |||| ||||
              </div>
              <span className="text-[10px] font-mono text-[#A8A29E]">SEAT-LOCKED</span>
            </div>

            {/* Virtual Train Map button */}
            <button
              onClick={onOpenCoachLayout}
              className="w-full mt-4 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#E44810] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-orange-glow transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Inspect Coach Position & Seat Map</span>
            </button>
          </div>

          {/* Coach Position Rake Indicator */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFE8DE]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#1C1917] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#FF5A1F]" />
                Platform Coach Position
              </h4>
              <span className="text-[11px] text-[#78716C]">Engine ➔ Rear</span>
            </div>
            <p className="text-xs text-[#78716C] mb-3">
              Click any coach to see seat arrangement and platform standing spot:
            </p>

            {/* Horizontal coach formation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {train.coaches.map((coach, cIdx) => (
                <button
                  key={cIdx}
                  onClick={onOpenCoachLayout}
                  className={`shrink-0 px-2.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    coach.type === 'ENG'
                      ? 'bg-[#1C1917] text-white border-[#1C1917]'
                      : coach.type === 'EC'
                      ? 'bg-[#FFF2EB] text-[#FF5A1F] border-[#FF5A1F]/40 hover:bg-[#FFE5D6]'
                      : 'bg-[#FAF7F2] text-[#1C1917] border-[#EFE8DE] hover:border-[#FF5A1F]'
                  }`}
                  title={`${coach.code} - ${coach.name}`}
                >
                  <span className="block text-[11px]">{coach.code}</span>
                  <span className="block text-[9px] text-[#78716C]">{coach.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry & Weather Widget (Inspired by Image 1) */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#EFE8DE] space-y-4">
            <h4 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              Live Telemetry & Safety Grid
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
                <span className="text-[#78716C]">Locomotive Unit</span>
                <span className="font-mono font-bold text-[#1C1917]">{train.currentStatus.locoNumber}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
                <span className="text-[#78716C]">Kavach Collision Shield</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active & Locked
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
                <span className="text-[#78716C]">Destination Weather</span>
                <span className="font-bold text-[#1C1917] flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-500" /> 28°C Clear Sky
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
                <span className="text-[#78716C]">On-Board Pantry</span>
                <span className="font-bold text-emerald-600">Available</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
