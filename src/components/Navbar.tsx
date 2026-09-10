'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Clock, Zap, Menu, X } from 'lucide-react';
import { railAudio } from '../utils/audio';

export const Navbar: React.FC = () => {
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
    const handleScroll = () => setScrolled(window.scrollY > 60);
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
    { label: 'Home', href: '#', active: true },
    { label: 'Live Tracking', href: '#tracking' },
    { label: 'PNR Status', href: '#pnr' },
    { label: 'Stations', href: '#stations' },
    { label: 'About', href: '#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050a05]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-green-500/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)] group-hover:shadow-[0_0_30px_rgba(74,222,128,0.8)] transition-all duration-300">
            <div className="w-5 h-5 rounded-full border-[2.5px] border-[#050a05]"></div>
            <div className="absolute w-3 h-3 rounded-full bg-[#050a05] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-1.5 h-1.5 rounded-full bg-green-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <span className="text-xl font-bold tracking-wide text-white font-sans hidden sm:block">
            RAIL<span className="text-green-400">PULSE</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 relative ${
                link.active
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
              {link.active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-green-400 rounded-full" />
              )}
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* IST Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono text-gray-300">
            <Clock className="w-3.5 h-3.5 text-green-400" />
            <span>{timeStr || '12:00:00 PM'}</span>
          </div>

          {/* Horn Button */}
          <button
            onClick={triggerHorn}
            className={`p-2 rounded-full transition-all duration-300 ${
              hornPlaying
                ? 'bg-green-500 text-black scale-110 shadow-[0_0_20px_rgba(74,222,128,0.8)]'
                : 'glass text-green-400 hover:text-green-300'
            }`}
          >
            <Zap className={`w-4 h-4 ${hornPlaying ? 'animate-bounce' : ''}`} />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-full transition-all duration-300 ${
              soundActive
                ? 'glass text-green-400 hover:text-green-300'
                : 'glass text-gray-600 hover:text-gray-400'
            }`}
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Contact Us CTA */}
          <a
            href="#tracking"
            className="hidden sm:inline-flex px-5 py-2 rounded-full border border-white/30 text-sm font-medium text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            Track Now
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-full glass text-white"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-[#050a05]/95 backdrop-blur-xl border-b border-green-500/10 p-6 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                link.active ? 'text-green-400 bg-green-500/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
