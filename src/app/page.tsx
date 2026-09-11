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
  Heart,
  Clock,
  Ticket,
  ExternalLink
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

  // Active Live Train selection for modal/tracker (defaults to 22436 Vande Bharat)
  const [selectedLiveTrain, setSelectedLiveTrain] = useState<Train | null>(TRAINS[0]);
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
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#FF5A1F', '#FF7A00', '#1C1917'],
    });
    // Smoothly scroll down to search results
    setTimeout(() => {
      const resultsEl = document.getElementById('search-results');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectTrain = (train: Train) => {
    setSelectedLiveTrain(train);
    setTimeout(() => {
      const trackEl = document.getElementById('tracking');
      if (trackEl) {
        trackEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#1C1917] relative overflow-x-hidden">
      {/* Floating Warm Golden Particles */}
      <ParticleBackground />

      {/* Top Desktop Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="relative z-10 pb-20">
        
        {/* Full Desktop Hero & Search Section */}
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

        {/* Live Train Spotlight Tracker View (Where Is My Train Core Experience) */}
        <AnimatePresence>
          {selectedLiveTrain && (
            <motion.div
              id="tracking"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="mt-6"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#FF5A1F] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 animate-pulse text-[#FF5A1F]" />
                  REAL-TIME GPS TELEMETRY ACTIVE
                </span>
                <button
                  onClick={() => setSelectedLiveTrain(null)}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] underline font-mono transition-colors cursor-pointer"
                >
                  Collapse Live View
                </button>
              </div>

              <LiveTrainTracker
                train={selectedLiveTrain}
                onOpenCoachLayout={() => setCoachModalTrain(selectedLiveTrain)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Station Search Results Section */}
        <div id="search-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE8DE] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" />
                <h3 className="text-2xl font-extrabold text-[#1C1917]">
                  Trains between <span className="text-[#FF5A1F]">{sourceCode}</span> and <span className="text-[#1C1917]">{destCode}</span>
                </h3>
              </div>
              <p className="text-xs text-[#78716C] mt-1 font-medium">
                {displayTrains.length} High-Speed & Superfast Express Services Available for Today
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#1C1917] font-mono bg-white px-3.5 py-1.5 rounded-2xl border border-[#EFE8DE] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>99.4% Network Telemetry Live</span>
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

        {/* Live Station Radar Board */}
        <div id="stations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <StationRadar
            stationCode={selectedStationRadar}
            onSelectTrain={handleSelectTrain}
          />
        </div>

        {/* Live Network Telemetry Stats & Quick Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-3xl p-6 flex items-center gap-4 border border-[#EFE8DE] shadow-soft hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] border border-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#78716C] uppercase">Average Punctuality</span>
                <div className="text-xl font-black text-[#1C1917] font-mono mt-0.5">
                  98.2% <span className="text-emerald-600 text-xs font-sans font-bold">On Time</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 flex items-center gap-4 border border-[#EFE8DE] shadow-soft hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] border border-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#78716C] uppercase">ISRO NavIC Telemetry</span>
                <div className="text-xl font-black text-[#1C1917] font-mono mt-0.5">
                  24/24 Sats <span className="text-emerald-600 text-xs font-sans font-bold">Locked</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 flex items-center gap-4 border border-[#EFE8DE] shadow-soft hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] border border-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#78716C] uppercase">Kavach Safety Grid</span>
                <div className="text-xl font-black text-[#1C1917] font-mono mt-0.5">
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
        <footer id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-[#EFE8DE] text-xs text-[#78716C]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FF5A1F] flex items-center justify-center text-white shadow-xs">
                <TrainIcon className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-[#1C1917]">
                Track<span className="text-[#FF5A1F]">Rail</span>
              </span>
              <span className="text-[#D6CEC4]">|</span>
              <span>Where Is My Train Desktop Live Status</span>
            </div>

            <div className="flex items-center gap-6 font-medium">
              <a href="#" className="hover:text-[#FF5A1F] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#FF5A1F] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#FF5A1F] transition-colors">IRCTC Live API</a>
              <a href="#" className="hover:text-[#FF5A1F] transition-colors">CRIS Grid</a>
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
                colors: ['#FF5A1F', '#FF7A00', '#10B981'],
              });
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
