'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  Search,
  MapPin,
  Train as TrainIcon,
  Compass,
  Calendar,
  Clock,
  Radio,
  Navigation,
  ChevronDown,
  ShieldCheck,
  CloudSun,
  Flame,
  ArrowRight,
  Sparkles,
  CheckCircle2,
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
  const [trainDropdownOpen, setTrainDropdownOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [travelDate, setTravelDate] = useState('Today, 11 Sep');
  const [isSwapping, setIsSwapping] = useState(false);

  // Spotlight featured train (defaults to 22436 Vande Bharat or first train)
  const featuredTrain = TRAINS[0];

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
    if (!trainQuery.trim()) return TRAINS.slice(0, 5);
    const q = trainQuery.toLowerCase();
    return TRAINS.filter(
      (t) =>
        t.trainNumber.includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.sourceName.toLowerCase().includes(q) ||
        t.destinationName.toLowerCase().includes(q) ||
        t.sourceCode.toLowerCase().includes(q) ||
        t.destinationCode.toLowerCase().includes(q)
    );
  }, [trainQuery]);

  const handleSwapStations = () => {
    setIsSwapping(true);
    const temp = sourceCode;
    setSourceCode(destCode);
    setDestCode(temp);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const getStationName = (code: string) => {
    const found = STATIONS.find((s) => s.code === code);
    return found ? `${found.name} (${found.code})` : code;
  };

  const getStationShort = (code: string) => {
    const found = STATIONS.find((s) => s.code === code);
    return found ? found.city : code;
  };

  return (
    <section id="search" className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Welcome & Subtitle */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#FF5A1F] border border-[#FF5A1F]/20">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#FF5A1F]" />
            ISRO NavIC Telemetry Active
          </span>
          <span className="text-xs font-semibold text-[#78716C] bg-white px-3 py-1 rounded-full border border-[#EFE8DE]">
            13,000+ Indian Trains Tracked Live
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] tracking-tight leading-tight">
          Where is your train? <span className="text-[#FF5A1F]">Track it live.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#78716C] mt-2 max-w-2xl font-normal">
          Accurate real-time train running status, expected platform numbers, delay countdowns, and GPS spotter inspired by Where Is My Train.
        </p>
      </div>

      {/* Main Desktop Grid: Left Search Panel + Right Boarding Pass Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Search & Booking Card (Inspired by Image 2) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFE8DE] relative">
          
          {/* Segmented Mode Selector */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DE] mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('stations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'stations'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-[#FF5A1F]" />
              Between Stations
            </button>

            <button
              onClick={() => setActiveTab('trainNumber')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'trainNumber'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <TrainIcon className="w-4 h-4 text-[#FF5A1F]" />
              Train No. / Name
            </button>

            <button
              onClick={() => setActiveTab('stationRadar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'stationRadar'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#FF5A1F]" />
              Station Board
            </button>
          </div>

          {/* TAB 1: BETWEEN STATIONS SEARCH */}
          {activeTab === 'stations' && (
            <div className="space-y-4">
              <div className="relative">
                {/* FROM STATION INPUT */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    From Station
                  </label>
                  <div
                    onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] hover:border-[#FF5A1F]/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#FF5A1F] shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1C1917]">{getStationName(sourceCode)}</div>
                        <div className="text-xs text-[#78716C]">{getStationShort(sourceCode)}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-white rounded-lg border border-[#EFE8DE] text-[#1C1917]">
                      {sourceCode}
                    </span>
                  </div>

                  {/* Dropdown list */}
                  <AnimatePresence>
                    {sourceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute top-full left-0 right-0 z-30 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-[#EFE8DE] max-h-60 overflow-y-auto"
                      >
                        <input
                          type="text"
                          placeholder="Type station name or code..."
                          value={sourceFilter}
                          onChange={(e) => setSourceFilter(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#EFE8DE] focus:outline-none focus:border-[#FF5A1F] mb-2"
                          autoFocus
                        />
                        <div className="space-y-1">
                          {filteredSources.map((station) => (
                            <button
                              key={station.code}
                              onClick={() => {
                                setSourceCode(station.code);
                                setSourceDropdownOpen(false);
                                setSourceFilter('');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#FFF2EB] flex items-center justify-between group transition-colors"
                            >
                              <span className="font-semibold text-[#1C1917] group-hover:text-[#FF5A1F]">
                                {station.name} ({station.city})
                              </span>
                              <span className="font-mono font-bold text-[#78716C]">{station.code}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CIRCULAR ORANGE SWAP BUTTON */}
                <div className="relative my-2 flex justify-center z-10">
                  <button
                    onClick={handleSwapStations}
                    title="Swap Origin and Destination"
                    className={`w-11 h-11 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-orange-glow hover:bg-[#E44810] active:scale-95 transition-all duration-300 ${
                      isSwapping ? 'rotate-180' : ''
                    }`}
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </button>
                </div>

                {/* TO STATION INPUT */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    To Station
                  </label>
                  <div
                    onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] hover:border-[#FF5A1F]/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#FF5A1F] shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1C1917]">{getStationName(destCode)}</div>
                        <div className="text-xs text-[#78716C]">{getStationShort(destCode)}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-1 bg-white rounded-lg border border-[#EFE8DE] text-[#1C1917]">
                      {destCode}
                    </span>
                  </div>

                  {/* Dropdown list */}
                  <AnimatePresence>
                    {destDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute top-full left-0 right-0 z-30 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-[#EFE8DE] max-h-60 overflow-y-auto"
                      >
                        <input
                          type="text"
                          placeholder="Type destination station or code..."
                          value={destFilter}
                          onChange={(e) => setDestFilter(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#EFE8DE] focus:outline-none focus:border-[#FF5A1F] mb-2"
                          autoFocus
                        />
                        <div className="space-y-1">
                          {filteredDests.map((station) => (
                            <button
                              key={station.code}
                              onClick={() => {
                                setDestCode(station.code);
                                setDestDropdownOpen(false);
                                setDestFilter('');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#FFF2EB] flex items-center justify-between group transition-colors"
                            >
                              <span className="font-semibold text-[#1C1917] group-hover:text-[#FF5A1F]">
                                {station.name} ({station.city})
                              </span>
                              <span className="font-mono font-bold text-[#78716C]">{station.code}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date & Filter Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#78716C]">Date</span>
                    <span className="text-xs font-bold text-[#1C1917]">{travelDate}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#78716C]">Live GPS Only</span>
                    <span className="text-xs font-bold text-emerald-600">Active Trains</span>
                  </div>
                  <div className="w-10 h-5 bg-[#FF5A1F] rounded-full relative p-0.5 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-xs" />
                  </div>
                </div>
              </div>

              {/* High-Converting Orange Search Button */}
              <button
                onClick={onSearchStations}
                className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#FF5A1F] hover:bg-[#E44810] text-white font-bold text-base flex items-center justify-center gap-2 shadow-orange-glow active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Find Trains & Live Status</span>
              </button>
            </div>
          )}

          {/* TAB 2: BY TRAIN NUMBER / NAME */}
          {activeTab === 'trainNumber' && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                  Train Number or Train Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF5A1F]">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={trainQuery}
                    onChange={(e) => {
                      setTrainQuery(e.target.value);
                      setTrainDropdownOpen(true);
                    }}
                    onFocus={() => setTrainDropdownOpen(true)}
                    placeholder="e.g. 22436, Vande Bharat, Rajdhani, 12951..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] text-[#1C1917] placeholder-[#A8A29E] text-sm font-semibold focus:outline-none focus:border-[#FF5A1F] transition-all"
                  />
                </div>

                {/* Autocomplete Suggestions */}
                {trainDropdownOpen && trainSuggestions.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded-2xl border border-[#EFE8DE] shadow-xl space-y-1">
                    {trainSuggestions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTrain(t);
                          setTrainQuery(`${t.trainNumber} - ${t.trainName}`);
                          setTrainDropdownOpen(false);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-[#FFF2EB] transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#FF5A1F]/10 text-[#FF5A1F]">
                            {t.trainNumber}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-[#1C1917] group-hover:text-[#FF5A1F]">
                              {t.trainName}
                            </div>
                            <div className="text-xs text-[#78716C]">
                              {t.sourceName} ➔ {t.destinationName}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Track
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Select Popular Trains */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-2">
                  Popular Express Services
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRAINS.slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSelectTrain(t)}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE] hover:border-[#FF5A1F] text-left transition-all group flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#FF5A1F]">
                          {t.trainNumber} {t.trainName}
                        </div>
                        <div className="text-[11px] text-[#78716C]">
                          {t.sourceCode} ➔ {t.destinationCode}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#FF5A1F] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATION RADAR BOARD */}
          {activeTab === 'stationRadar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                  Select Railway Terminal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATIONS.slice(0, 6).map((st) => (
                    <button
                      key={st.code}
                      onClick={() => setSelectedStationRadar(st.code)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedStationRadar === st.code
                          ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-orange-glow'
                          : 'bg-[#FAF7F2] border-[#EFE8DE] text-[#1C1917] hover:border-[#FF5A1F]/50'
                      }`}
                    >
                      <span className="block font-mono text-xs font-bold">{st.code}</span>
                      <span className="text-xs font-semibold line-clamp-1">{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF2EB] border border-[#FF5A1F]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-[#FF5A1F]" />
                  <div>
                    <div className="text-xs font-bold text-[#1C1917]">Live Terminal Radar</div>
                    <div className="text-[11px] text-[#78716C]">Viewing arrivals & departures for {selectedStationRadar}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('stations');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF5A1F] text-white text-xs font-bold hover:bg-[#E44810]"
                >
                  View Board
                </button>
              </div>
            </div>
          )}

          {/* Popular Fast Routes Pills */}
          <div className="mt-6 pt-5 border-t border-[#EFE8DE]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#78716C] mb-2.5">
              <Flame className="w-4 h-4 text-[#FF5A1F]" />
              Trending Routes:
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROUTES.slice(0, 4).map((route, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSourceCode(route.from);
                    setDestCode(route.to);
                    setActiveTab('stations');
                    onSearchStations();
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#57534E] hover:text-[#FF5A1F] border border-[#EFE8DE] transition-all duration-200"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Signature Boarding Pass & Live Status Spotlight (Directly from User Images!) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#EFE8DE] relative overflow-hidden">
            
            {/* Top Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Spotlight Live Tracker
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Telemetry
              </span>
            </div>

            {/* Wavy Route Altitude Line with Distance (Inspired by Image 3) */}
            <div className="relative py-3 my-1">
              <div className="flex justify-between items-center text-xs font-mono text-[#78716C] mb-1">
                <span>Origin: {featuredTrain.sourceCode}</span>
                <span className="font-bold text-[#FF5A1F] bg-[#FFF2EB] px-2 py-0.5 rounded-full">
                  {featuredTrain.distanceKm} KM
                </span>
                <span>Dest: {featuredTrain.destinationCode}</span>
              </div>

              {/* Stylized SVG wavy path connecting Origin to Destination */}
              <div className="relative h-14 w-full flex items-center justify-center">
                <svg className="w-full h-12 overflow-visible" viewBox="0 0 300 40" fill="none">
                  {/* Background dotted wave line */}
                  <path
                    d="M 10 20 Q 75 0, 150 20 T 290 20"
                    stroke="#EFE8DE"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  {/* Glowing active route line in orange */}
                  <path
                    d="M 10 20 Q 75 0, 150 20"
                    stroke="#FF5A1F"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Origin station dot */}
                  <circle cx="10" cy="20" r="5" fill="#1C1917" />
                  <circle cx="10" cy="20" r="2.5" fill="#FFFFFF" />
                  {/* Active train location marker on wave */}
                  <circle cx="150" cy="20" r="7" fill="#FF5A1F" className="animate-pulse" />
                  <circle cx="150" cy="20" r="3.5" fill="#FFFFFF" />
                  {/* Destination dot */}
                  <circle cx="290" cy="20" r="5" fill="#FF5A1F" />
                  <circle cx="290" cy="20" r="2.5" fill="#FFFFFF" />
                </svg>

                {/* Duration Badge floating on curve */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF5A1F] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-orange-glow flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredTrain.duration}
                </div>
              </div>

              {/* Station Codes and Departure/Arrival Times */}
              <div className="flex justify-between items-end mt-1">
                <div>
                  <div className="text-2xl font-black font-sans tracking-tight text-[#1C1917]">
                    {featuredTrain.sourceCode}
                  </div>
                  <div className="text-xs text-[#78716C]">Departure {featuredTrain.departureTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-sans tracking-tight text-[#1C1917]">
                    {featuredTrain.destinationCode}
                  </div>
                  <div className="text-xs text-[#78716C]">Arrival {featuredTrain.arrivalTime}</div>
                </div>
              </div>
            </div>

            {/* Signature Orange Train Card (Inspired by Image 3) */}
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7A00] p-5 text-white shadow-orange-glow relative overflow-hidden">
              {/* Subtle background train tracks silhouette */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">
                    Fastest Service
                  </span>
                  <div className="text-lg font-black tracking-wide flex items-center gap-2">
                    {featuredTrain.trainName}
                  </div>
                </div>
                <span className="font-mono text-xs font-black bg-white/20 px-2.5 py-1 rounded-lg border border-white/25">
                  {featuredTrain.trainNumber}
                </span>
              </div>

              {/* Train Bullet Graphic & Delay Status */}
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Approaching Kanpur</div>
                    <div className="text-[11px] text-white/80">Speed: {featuredTrain.currentStatus.currentSpeedKmH} km/h • PF 3</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-white text-[#FF5A1F] px-2.5 py-1 rounded-full uppercase">
                    On Time
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger & Ticket Notch Section */}
            <div className="mt-4 pt-4 border-t border-[#EFE8DE] flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-[#78716C] block">Class & Coach</span>
                <span className="font-bold text-[#1C1917]">Executive Class • Coach E1</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#78716C] block">Seat Status</span>
                <span className="font-bold text-emerald-600">Confirmed (Seat 42A)</span>
              </div>
            </div>

            {/* Barcode Strip (Inspired by Image 3) */}
            <div className="mt-4 pt-3 border-t border-dashed border-[#EFE8DE] flex items-center justify-between">
              <div className="font-mono text-[10px] tracking-widest text-[#78716C]">
                |||| | ||||| || |||||| | |||| ||||
              </div>
              <span className="text-[10px] font-mono text-[#A8A29E]">IRCTC-AUTH-2026</span>
            </div>

            {/* Action CTA to Open Full Live Tracker */}
            <button
              onClick={() => onSelectTrain(featuredTrain)}
              className="w-full mt-4 py-3 rounded-xl bg-[#1C1917] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#FF5A1F]" />
              <span>Open Live Station Tracker & Timeline</span>
            </button>
          </div>

          {/* Mini Widgets Row (Weather, Speed, Kavach - Inspired by Image 1) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border border-[#EFE8DE] shadow-xs text-center">
              <CloudSun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-[10px] font-semibold text-[#78716C]">Varanasi</div>
              <div className="text-sm font-bold text-[#1C1917]">28°C ⛅</div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#EFE8DE] shadow-xs text-center">
              <Navigation className="w-4 h-4 text-[#FF5A1F] mx-auto mb-1 animate-pulse" />
              <div className="text-[10px] font-semibold text-[#78716C]">Top Speed</div>
              <div className="text-sm font-bold text-[#1C1917]">132 km/h</div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#EFE8DE] shadow-xs text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[10px] font-semibold text-[#78716C]">Kavach Grid</div>
              <div className="text-sm font-bold text-emerald-600">Active</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
