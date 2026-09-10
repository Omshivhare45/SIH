'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Train as TrainIcon, 
  Search, 
  MapPin, 
  Radio, 
  Navigation, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Navbar } from '../components/Navbar';
import { ParticleBackground } from '../components/ParticleBackground';
import { SearchHero } from '../components/SearchHero';
import { TrainCard } from '../components/TrainCard';
import { LiveTrainTracker } from '../components/LiveTrainTracker';
import { StationRadar } from '../components/StationRadar';
import { CoachSeatModal } from '../components/CoachSeatModal';
import { PNRStatusCard } from '../components/PNRStatusCard';
import { TRAINS, STATIONS } from '../data/trainData';
import { Train } from '../types/train';

export default function Home() {
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<'stations' | 'trainNumber' | 'stationRadar'>('stations');
  const [sourceCode, setSourceCode] = useState<string>('NDLS');
  const [destCode, setDestCode] = useState<string>('BSB');
  const [trainQuery, setTrainQuery] = useState<string>('');
  const [selectedStationRadar, setSelectedStationRadar] = useState<string>('NDLS');

  // Active Live Train selection for modal/tracker
  const [selectedLiveTrain, setSelectedLiveTrain] = useState<Train | null>(null);
  const [coachModalTrain, setCoachModalTrain] = useState<Train | null>(null);
  const [searched, setSearched] = useState<boolean>(true);

  // Filtered Trains for Station Search
  const matchingTrains = useMemo(() => {
    return TRAINS.filter((t) => {
      const matchSource = t.sourceCode === sourceCode || t.route.some((r) => r.stationCode === sourceCode);
      const matchDest = t.destinationCode === destCode || t.route.some((r) => r.stationCode === destCode);
      return matchSource && matchDest;
    });
  }, [sourceCode, destCode]);

  // If no direct route in small mock, show all relevant trains so user always enjoys the UI
  const displayTrains = matchingTrains.length > 0 ? matchingTrains : TRAINS.slice(0, 3);

  const handleSearchStations = () => {
    setSearched(true);
    setSelectedLiveTrain(null);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  const handleSelectTrain = (train: Train) => {
    setSelectedLiveTrain(train);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Dynamic Animated Canvas Background */}
      <ParticleBackground speedMultiplier={selectedLiveTrain ? 1.5 : 0.8} />

      {/* Top Glass Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="relative z-10 pb-20">
        {/* Hero Search Section */}
        <SearchHero
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sourceCode={sourceCode}
          setSourceCode={setSourceCode}
          destCode={destCode}
          setDestCode={setDestCode}
          trainQuery={trainQuery}
          setTrainQuery={setTrainQuery}
          selectedStationRadar={selectedStationRadar}
          setSelectedStationRadar={setSelectedStationRadar}
          onSearchStations={handleSearchStations}
          onSelectTrain={handleSelectTrain}
        />

        {/* Live Train Spotlight Tracker View */}
        <AnimatePresence>
          {selectedLiveTrain && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mt-6"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 animate-spin" />
                  REAL-TIME GPS TELEMETRY ACTIVE
                </span>
                <button
                  onClick={() => setSelectedLiveTrain(null)}
                  className="text-xs text-slate-400 hover:text-white underline font-mono"
                >
                  ← Close Live View
                </button>
              </div>

              <LiveTrainTracker
                train={selectedLiveTrain}
                onOpenCoachLayout={() => setCoachModalTrain(selectedLiveTrain)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab 3 Station Radar Board */}
        {activeTab === 'stationRadar' && !selectedLiveTrain && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
            <StationRadar
              stationCode={selectedStationRadar}
              onSelectTrain={handleSelectTrain}
            />
          </div>
        )}

        {/* Station Search Results View */}
        {activeTab === 'stations' && !selectedLiveTrain && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <TrainIcon className="w-5 h-5 text-cyan-400" />
                  Trains between <span className="text-cyan-400">{sourceCode}</span> and <span className="text-blue-400">{destCode}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {displayTrains.length} High-Speed & Superfast Express Services Available
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                99.4% Network Telemetry Live
              </div>
            </div>

            {/* List of Train Cards */}
            <div className="space-y-4">
              {displayTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  onTrackLive={handleSelectTrain}
                  onOpenCoach={(t) => setCoachModalTrain(t)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Direct Train Number List if Tab is Train Number and no specific live train open */}
        {activeTab === 'trainNumber' && !selectedLiveTrain && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Featured Indian Railway Trains
              </h3>
              <p className="text-xs text-slate-400">
                Click any train to track live GPS, speedometer, and station countdown
              </p>
            </div>

            <div className="space-y-4">
              {TRAINS.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  onTrackLive={handleSelectTrain}
                  onOpenCoach={(t) => setCoachModalTrain(t)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Live Network Telemetry & Quick Features Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Average Punctuality</span>
                <div className="text-lg font-black text-white font-mono">98.2% <span className="text-emerald-400 text-xs font-sans">On Time</span></div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">ISRO NavIC Constellation</span>
                <div className="text-lg font-black text-white font-mono">24/24 Sats <span className="text-cyan-400 text-xs font-sans">Locked</span></div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Kavach Collision Safety</span>
                <div className="text-lg font-black text-white font-mono">100% Active</div>
              </div>
            </div>
          </div>

          {/* PNR Status Lookup Simulator */}
          <PNRStatusCard />
        </div>
      </div>

      {/* Interactive Coach & Seat Modal */}
      <AnimatePresence>
        {coachModalTrain && (
          <CoachSeatModal
            train={coachModalTrain}
            onClose={() => setCoachModalTrain(null)}
            onBookSuccess={() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
