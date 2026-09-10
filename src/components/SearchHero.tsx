'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  Search,
  MapPin,
  Train as TrainIcon,
  Compass,
  Flame,
  Radio,
  Navigation,
  ChevronDown,
} from 'lucide-react';
import { Train } from '../types/train';
import { STATIONS, POPULAR_ROUTES, TRAINS } from '../data/trainData';

interface SearchHeroProps {
  activeTab: 'stations' | 'trainNumber' | 'stationRadar';
  setActiveTab: (tab: 'stations' | 'trainNumber' | 'stationRadar') => void;
  sourceCode: string;
  setSourceCode: (code: string) => void;
  destCode: string;
  setDestCode: (code: string) => void;
  trainQuery: string;
  setTrainQuery: (q: string) => void;
  selectedStationRadar: string;
  setSelectedStationRadar: (code: string) => void;
  onSearchStations: () => void;
  onSelectTrain: (train: Train) => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  activeTab,
  setActiveTab,
  sourceCode,
  setSourceCode,
  destCode,
  setDestCode,
  trainQuery,
  setTrainQuery,
  selectedStationRadar,
  setSelectedStationRadar,
  onSearchStations,
  onSelectTrain,
}) => {
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');

  const filteredSources = useMemo(() => {
    return STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(sourceFilter.toLowerCase()) ||
        s.code.toLowerCase().includes(sourceFilter.toLowerCase()) ||
        s.city.toLowerCase().includes(sourceFilter.toLowerCase())
    );
  }, [sourceFilter]);

  const filteredDests = useMemo(() => {
    return STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(destFilter.toLowerCase()) ||
        s.code.toLowerCase().includes(destFilter.toLowerCase()) ||
        s.city.toLowerCase().includes(destFilter.toLowerCase())
    );
  }, [destFilter]);

  const trainSuggestions = useMemo(() => {
    if (!trainQuery.trim()) return TRAINS.slice(0, 4);
    const q = trainQuery.toLowerCase();
    return TRAINS.filter(
      (t) =>
        t.trainNumber.includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.sourceName.toLowerCase().includes(q) ||
        t.destinationName.toLowerCase().includes(q)
    );
  }, [trainQuery]);

  const handleSwapStations = () => {
    const temp = sourceCode;
    setSourceCode(destCode);
    setDestCode(temp);
  };

  const getStationLabel = (code: string) => {
    const found = STATIONS.find((s) => s.code === code);
    return found ? found.name : code;
  };

  return (
    <div className="relative">
      {/* ===== FULL-SCREEN HERO WITH CINEMATIC IMAGE ===== */}
      <section className="relative h-screen min-h-[720px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,10,5,0.75)_100%)]" />

        {/* Social Media Side Bar (as in reference UI) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-green-400 hover:border-green-400/50 hover:bg-green-500/10 transition-all duration-300"
            title="Instagram"
          >
            <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-green-400 hover:border-green-400/50 hover:bg-green-500/10 transition-all duration-300"
            title="Facebook"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-green-400 hover:border-green-400/50 hover:bg-green-500/10 transition-all duration-300"
            title="X (Twitter)"
          >
            <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-green-300">
              A Place Where Nature and Travel Unites
            </span>
          </motion.div>

          {/* Hero Headline — Playfair Display / Serif styling matching reference */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <span className="text-white">Visit the </span>
            <span className="text-gradient-green italic">Most Epic Train</span>
            <br />
            <span className="text-white">Station </span>
            <span className="text-white">in the </span>
            <span className="text-gradient-green italic">World</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base sm:text-lg text-gray-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Live GPS telemetry, platform board indicators, speed monitoring, and AI-powered ETA forecasting for Indian Railways.
          </motion.p>

          {/* Scroll CTA Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center"
          >
            <a
              href="#search-section"
              className="flex flex-col items-center gap-2 text-white/50 hover:text-green-400 transition-colors"
            >
              <span className="text-xs tracking-widest uppercase font-mono">Explore & Search Below</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ===== FLOATING SEARCH PANEL OVER HERO BOTTOM ===== */}
      <section id="search-section" className="relative z-20 -mt-24 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="glass rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-visible">
            {/* Top glowing line */}
            <div className="absolute inset-x-16 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent" />

            {/* Tab Selection */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-[#050a05] rounded-2xl border border-white/5 mb-6 max-w-fit">
              {([
                { id: 'stations' as const, icon: ArrowRightLeft, label: 'Spot by Route' },
                { id: 'trainNumber' as const, icon: TrainIcon, label: 'Train No. / Name' },
                { id: 'stationRadar' as const, icon: Radio, label: 'Station Board' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Stations */}
            {activeTab === 'stations' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Source */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[11px] font-mono font-medium text-green-400 uppercase mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> From Station
                    </label>
                    <div
                      onClick={() => { setSourceDropdownOpen(!sourceDropdownOpen); setDestDropdownOpen(false); }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050a05] border border-white/10 hover:border-green-500/40 cursor-pointer text-white transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-400 font-mono text-xs font-bold">{sourceCode}</span>
                        <span className="font-medium text-sm truncate">{getStationLabel(sourceCode)}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                    {sourceDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0a1a0a] border border-green-500/30 rounded-2xl p-2 shadow-2xl max-h-64 overflow-y-auto">
                        <input type="text" placeholder="Search station..." value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-[#050a05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-green-400 mb-2" autoFocus />
                        {filteredSources.map((s) => (
                          <div key={s.code} onClick={() => { setSourceCode(s.code); setSourceDropdownOpen(false); setSourceFilter(''); }}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-green-500/10 cursor-pointer text-xs text-gray-200 transition-colors">
                            <span>{s.name} <span className="text-gray-500">({s.city})</span></span>
                            <span className="font-mono font-bold text-green-400">{s.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swap */}
                  <div className="md:col-span-2 flex justify-center">
                    <motion.button whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.95 }} onClick={handleSwapStations}
                      className="p-3.5 rounded-2xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 transition-colors">
                      <ArrowRightLeft className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Destination */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[11px] font-mono font-medium text-green-400 uppercase mb-1.5 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" /> To Destination
                    </label>
                    <div
                      onClick={() => { setDestDropdownOpen(!destDropdownOpen); setSourceDropdownOpen(false); }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050a05] border border-white/10 hover:border-green-500/40 cursor-pointer text-white transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold">{destCode}</span>
                        <span className="font-medium text-sm truncate">{getStationLabel(destCode)}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                    {destDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0a1a0a] border border-green-500/30 rounded-2xl p-2 shadow-2xl max-h-64 overflow-y-auto">
                        <input type="text" placeholder="Search destination..." value={destFilter} onChange={(e) => setDestFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-[#050a05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-green-400 mb-2" autoFocus />
                        {filteredDests.map((s) => (
                          <div key={s.code} onClick={() => { setDestCode(s.code); setDestDropdownOpen(false); setDestFilter(''); }}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-green-500/10 cursor-pointer text-xs text-gray-200 transition-colors">
                            <span>{s.name} <span className="text-gray-500">({s.city})</span></span>
                            <span className="font-mono font-bold text-emerald-400">{s.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button & Popular Routes */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-400" /> Popular:</span>
                    {POPULAR_ROUTES.slice(0, 3).map((r, idx) => (
                      <button key={idx} onClick={() => { setSourceCode(r.from); setDestCode(r.to); }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 text-gray-400 hover:text-green-300 transition-all">
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSearchStations}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(74,222,128,0.4)] transition-all"
                  >
                    <Search className="w-4 h-4" /> Find Live Trains
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Train Number */}
            {activeTab === 'trainNumber' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="relative">
                  <label className="block text-[11px] font-mono font-medium text-green-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <TrainIcon className="w-3.5 h-3.5" /> Enter Train Number or Name
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="e.g. 22436, Vande Bharat, Rajdhani..."
                      value={trainQuery} onChange={(e) => setTrainQuery(e.target.value)}
                      className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-[#050a05] border border-white/10 hover:border-green-500/40 focus:border-green-400 text-white placeholder-gray-500 focus:outline-none text-sm font-medium transition-all" />
                    <Search className="w-5 h-5 text-green-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {trainSuggestions.map((train) => (
                    <motion.div key={train.id} whileHover={{ scale: 1.02 }} onClick={() => onSelectTrain(train)}
                      className="p-3.5 rounded-2xl bg-[#050a05] hover:bg-green-500/5 border border-white/5 hover:border-green-500/30 cursor-pointer flex items-center justify-between transition-all group">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-green-500/15 text-green-400 font-mono text-xs font-bold">{train.trainNumber}</span>
                          <span className="font-semibold text-xs text-white group-hover:text-green-300 transition-colors">{train.trainName}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{train.sourceCode} ➔ {train.destinationCode} • {train.duration}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        {train.currentStatus.currentSpeedKmH} km/h
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tab 3: Station Radar */}
            {activeTab === 'stationRadar' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <label className="block text-[11px] font-mono font-medium text-green-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" /> Select Station for Live Departure Board
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { code: 'NDLS', name: 'New Delhi' },{ code: 'CNB', name: 'Kanpur Central' },
                    { code: 'BSB', name: 'Varanasi Jn' },{ code: 'MMCT', name: 'Mumbai Central' },
                    { code: 'HWH', name: 'Howrah Jn' },{ code: 'SBC', name: 'Bengaluru' },
                    { code: 'LKO', name: 'Lucknow' },{ code: 'MAS', name: 'Chennai Central' },
                  ].map((st) => (
                    <button key={st.code} onClick={() => setSelectedStationRadar(st.code)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        selectedStationRadar === st.code
                          ? 'bg-green-500/15 border-green-400 text-white shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                          : 'bg-[#050a05] border-white/5 text-gray-400 hover:border-white/10'
                      }`}>
                      <div className="font-mono font-bold text-xs text-green-400">{st.code}</div>
                      <div className="text-xs font-medium truncate">{st.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
