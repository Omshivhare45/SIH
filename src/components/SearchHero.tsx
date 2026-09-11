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
  Flame,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Ticket,
} from 'lucide-react';
import { Train } from '../types/train';
import { STATIONS, POPULAR_ROUTES, TRAINS, findTrainsByQuery, PNR_RECORDS } from '../data/trainData';

export type SearchTab = 'stations' | 'trainNumber' | 'stationRadar';

interface SearchHeroProps {
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
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
  searched: boolean;
  onModifySearch?: () => void;
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
  searched,
  onModifySearch,
}) => {
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [trainDropdownOpen, setTrainDropdownOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [travelDate, setTravelDate] = useState('Today, 11 Sep');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

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

  const handleSwapStations = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  // ==========================================
  // CASE 1: SEARCHED STATE (COMPACT TOP BAR)
  // ==========================================
  if (searched && !isExpanded) {
    return (
      <section className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-[#EFE8DE] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FFF2EB] text-[#FF5A1F] flex items-center justify-center font-bold text-xs">
                {sourceCode}
              </span>
              <span className="text-sm font-bold text-[#1C1917]">{getStationShort(sourceCode)}</span>
            </div>

            <button
              onClick={handleSwapStations}
              className={`p-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#FF5A1F] border border-[#EFE8DE] transition-transform ${
                isSwapping ? 'rotate-180' : ''
              }`}
              title="Swap Stations"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FFF2EB] text-[#FF5A1F] flex items-center justify-center font-bold text-xs">
                {destCode}
              </span>
              <span className="text-sm font-bold text-[#1C1917]">{getStationShort(destCode)}</span>
            </div>

            <span className="text-[#D6CEC4] hidden sm:inline">•</span>

            <span className="text-xs font-medium text-[#78716C] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EFE8DE]">
              {travelDate}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsExpanded(true)}
              className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#1C1917] hover:text-[#FF5A1F] text-xs font-bold border border-[#EFE8DE] transition-all flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Modify Route</span>
            </button>

            <button
              onClick={onSearchStations}
              className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E44810] text-white text-xs font-bold shadow-orange-glow transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Refresh Trains</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // CASE 2: INITIAL FOCUSED SOURCE TO DESTINATION CARD
  // (Only this card is visible on screen before entering details)
  // ==========================================
  return (
    <section
      className={`px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-500 ${
        searched
          ? 'pt-24 pb-6'
          : 'min-h-[85vh] flex flex-col justify-center items-center pt-24 pb-12'
      }`}
    >
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Welcoming Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2EB] text-[#FF5A1F] border border-[#FF5A1F]/20 mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#FF5A1F]" />
            Live Train Status & GPS Spotting
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] tracking-tight">
            Where do you want to go?
          </h1>
          <p className="text-sm sm:text-base text-[#78716C] mt-2 font-normal max-w-md mx-auto">
            Enter your journey details to fetch live train running status, delay countdowns, and platform tracking.
          </p>
        </div>

        {/* The Clean Source to Destination Card (Reference Image Center Inspiration) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFE8DE] relative">
          
          {/* Segmented Mode Selector */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DE] mb-6">
            <button
              onClick={() => setActiveTab('stations')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'stations'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-[#FF5A1F]" />
              <span>Between Stations</span>
            </button>

            <button
              onClick={() => setActiveTab('trainNumber')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'trainNumber'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <TrainIcon className="w-4 h-4 text-[#FF5A1F]" />
              <span>Train No. / Name</span>
            </button>

            <button
              onClick={() => setActiveTab('stationRadar')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'stationRadar'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#EFE8DE]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#FF5A1F]" />
              <span>Station Board</span>
            </button>
          </div>

          {/* TAB 1: BETWEEN STATIONS (Default & Main Focus) */}
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] hover:border-[#FF5A1F]/50 cursor-pointer transition-all"
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
                    className={`w-11 h-11 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-orange-glow hover:bg-[#E44810] active:scale-95 transition-all duration-300 cursor-pointer ${
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] hover:border-[#FF5A1F]/50 cursor-pointer transition-all"
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
                onClick={() => {
                  if (searched) setIsExpanded(false);
                  onSearchStations();
                }}
                className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#FF5A1F] hover:bg-[#E44810] text-white font-bold text-base flex items-center justify-center gap-2 shadow-orange-glow active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Search Trains & Live Status</span>
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
                          if (searched) setIsExpanded(false);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-[#FFF2EB] transition-colors flex items-center justify-between group cursor-pointer"
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
                      onClick={() => {
                        onSelectTrain(t);
                        if (searched) setIsExpanded(false);
                      }}
                      className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE] hover:border-[#FF5A1F] text-left transition-all group flex items-center justify-between cursor-pointer"
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
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
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

              <button
                onClick={() => {
                  onSearchStations();
                  if (searched) setIsExpanded(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#E44810] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-orange-glow transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>View Terminal Departure Board</span>
              </button>
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
                    if (searched) setIsExpanded(false);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAF7F2] hover:bg-[#FFF2EB] text-[#57534E] hover:text-[#FF5A1F] border border-[#EFE8DE] transition-all duration-200 cursor-pointer"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searched && (
          <div className="text-center mt-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-[#78716C] hover:text-[#1C1917] underline font-medium"
            >
              Collapse search box ➔
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
