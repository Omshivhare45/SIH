'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Clock, Zap, Menu, X, Bell, Compass, Radio } from 'lucide-react';
import { railAudio } from '../utils/audio';

interface NavbarProps {
  onSelectTab?: (tab: 'stations' | 'trainNumber' | 'stationRadar') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTab }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [hornPlaying, setHornPlaying] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    railAudio.setSoundEnabled(next);
    if (next) railAudio.playIRChime();
  };

  const triggerHorn = () => {
    setHornPlaying(true);
    railAudio.playTrainHorn();
    setTimeout(() => setHornPlaying(false), 1200);
  };

  const navLinks = [
    { label: 'Train Status', href: '#tracking', active: true },
    { label: 'Find Trains', href: '#search', active: false },
    { label: 'Station Board', href: '#stations', active: false },
    { label: 'PNR Status', href: '#pnr', active: false },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF7F2]/90 backdrop-blur-xl shadow-[0_4px_25px_rgba(28,25,23,0.06)] border-b border-[#EFE8DE]'
          : 'bg-[#FAF7F2]/75 backdrop-blur-md border-b border-[#EFE8DE]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF7A00] flex items-center justify-center shadow-[0_4px_16px_rgba(255,90,31,0.35)] group-hover:scale-105 transition-all duration-300">
            {/* Minimalist modern train icon */}
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="16" rx="3" />
              <path d="M4 11h16" />
              <path d="M12 3v8" />
              <path d="m8 19-2 3" />
              <path d="m16 19 2 3" />
              <circle cx="8" cy="15" r="1" fill="currentColor" />
              <circle cx="16" cy="15" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#1C1917] font-sans">
                Track<span className="text-[#FF5A1F]">Rail</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF5A1F]/10 text-[#FF5A1F] px-1.5 py-0.5 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[11px] text-[#78716C] -mt-0.5 font-medium hidden sm:block">Where is my train</p>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 border border-[#EFE8DE] px-3 py-1.5 rounded-full shadow-xs">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                link.active
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917] hover:bg-black/5'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Live Telemetry Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EFE8DE] shadow-xs text-xs font-semibold text-[#1C1917]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>GPS Locked</span>
            <span className="text-[#A8A29E]">•</span>
            <span className="font-mono text-[11px] text-[#57534E] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FF5A1F]" />
              {timeStr || '12:00 PM'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundActive ? 'IR Audio Chimes Enabled' : 'Audio Muted'}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              soundActive
                ? 'bg-white border-[#EFE8DE] text-[#FF5A1F] shadow-xs hover:border-[#FF5A1F]/40'
                : 'bg-white/50 border-[#EFE8DE] text-[#A8A29E]'
            }`}
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Loco Horn Button */}
          <button
            onClick={triggerHorn}
            disabled={hornPlaying}
            title="Blow Indian Railways Locomotive Horn"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF2EB] text-[#FF5A1F] border border-[#FF5A1F]/30 hover:bg-[#FFE5D6] active:scale-95 transition-all duration-200 shadow-xs"
          >
            <Zap className={`w-3.5 h-3.5 ${hornPlaying ? 'animate-bounce text-[#FF5A1F]' : ''}`} />
            <span>Horn</span>
          </button>

          {/* Notification Button */}
          <button
            className="p-2.5 rounded-xl bg-white border border-[#EFE8DE] text-[#57534E] hover:text-[#1C1917] hover:border-[#D6CEC4] shadow-xs transition-all"
            title="Station Delay Alerts"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white border border-[#EFE8DE] text-[#1C1917]"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#EFE8DE] px-6 py-5 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold text-[#1C1917] hover:text-[#FF5A1F] py-2 border-b border-[#F5EFEA]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex items-center justify-between text-xs text-[#78716C] font-mono">
            <span>IST Time: {timeStr}</span>
            <span className="text-emerald-600 font-bold">GPS Active</span>
          </div>
        </div>
      )}
    </header>
  );
};
