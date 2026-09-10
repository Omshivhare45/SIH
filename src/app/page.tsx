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
  Compass,
  Heart
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

  // If no direct route in small mock, show relevant trains so user always enjoys the UI
  const displayTrains = matchingTrains.length > 0 ? matchingTrains : TRAINS.slice(0, 3);

  const handleSearchStations = () => {
    setSearched(true);
    setSelectedLiveTrain(null);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#4ade80', '#22c55e', '#16a34a'],
    });
  };

  const handleSelectTrain = (train: Train) => {
    setSelectedLiveTrain(train);
    setTimeout(() => {
      window.scrollTo({
        top: window.innerHeight - 80,
        behavior: 'smooth',
      });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-[#050a05] text-[#f0fdf4] relative overflow-x-hidden">
      {/* Floating Green Glow Particles */}
      <ParticleBackground />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="relative z-10 pb-20">
        {/* Full-Screen Hero & Search Section */}
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
              id="tracking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-green-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 animate-spin text-green-400" />
                  REAL-TIME GPS TELEMETRY ACTIVE
                </span>
                <button
                  onClick={() => setSelectedLiveTrain(null)}
                  className="text-xs text-gray-400 hover:text-green-300 underline font-mono transition-colors"
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

        {/* Tab 3: Station Radar Board */}
        {activeTab === 'stationRadar' && !selectedLiveTrain && (
          <div id="stations" className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
            <StationRadar
              stationCode={selectedStationRadar}
              onSelectTrain={handleSelectTrain}
            />
          </div>
        )}

        {/* Station Search Results View */}
        {activeTab === 'stations' && !selectedLiveTrain && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3
                  className="text-2xl font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  <TrainIcon className="w-5 h-5 text-green-400" />
                  Trains between <span className="text-green-400">{sourceCode}</span> and <span className="text-emerald-400">{destCode}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {displayTrains.length} High-Speed & Superfast Express Services Available
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-green-400 font-mono bg-green-500/10 px-3.5 py-1.5 rounded-xl border border-green-500/30">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 space-y-4">
            <div className="border-b border-white/10 pb-4">
              <h3
                className="text-2xl font-bold text-white flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                <Sparkles className="w-5 h-5 text-green-400" />
                Featured Indian Railway Services
              </h3>
              <p className="text-xs text-gray-400 mt-1">
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

        {/* Live Network Telemetry Stats & Quick Features Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-3xl p-5 flex items-center gap-4 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-gray-400 uppercase">Average Punctuality</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  98.2% <span className="text-green-400 text-xs font-sans font-normal">On Time</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-5 flex items-center gap-4 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-gray-400 uppercase">ISRO NavIC Telemetry</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  24/24 Sats <span className="text-green-400 text-xs font-sans font-normal">Locked</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-5 flex items-center gap-4 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-gray-400 uppercase">Kavach Safety Grid</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  100% Active
                </div>
              </div>
            </div>
          </div>

          {/* PNR Status Lookup Simulator */}
          <div id="pnr">
            <PNRStatusCard />
          </div>
        </div>

        {/* Footer */}
        <footer id="about" className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full border-2 border-[#050a05]"></div>
              </div>
              <span className="font-bold text-sm text-white">RAIL<span className="text-green-400">PULSE</span></span>
              <span className="text-gray-600">|</span>
              <span>Next-Gen Train Status App</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-green-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-green-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-green-400 transition-colors">IRCTC APIs</a>
              <a href="#" className="hover:text-green-400 transition-colors">Status</a>
            </div>
          </div>
        </footer>
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
                colors: ['#4ade80', '#22c55e', '#16a34a'],
              });
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
