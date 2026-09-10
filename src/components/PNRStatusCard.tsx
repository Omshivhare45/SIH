'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Search, CheckCircle2, AlertCircle, Shield, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PNRStatusCard: React.FC = () => {
  const [pnrInput, setPnrInput] = useState<string>('2415893201');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCheckPNR = () => {
    if (!pnrInput || pnrInput.length < 5) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult({
        pnr: pnrInput,
        trainNumber: '22436',
        trainName: 'Vande Bharat Express',
        date: 'Tomorrow, 06:00 AM',
        from: 'New Delhi (NDLS)',
        to: 'Varanasi Jn (BSB)',
        coach: 'C3',
        seat: 'Seat 42 (Window)',
        bookingStatus: 'CNF (Confirmed)',
        chartStatus: 'Chart Prepared • Coach Position Locked',
      });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4ade80', '#22c55e', '#16a34a'],
      });
    }, 600);
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/30">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h3
            className="font-bold text-xl text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            PNR Status & Confirmation Predictor
          </h3>
          <p className="text-xs text-gray-400">10-Digit Indian Railways PNR Live Query</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          placeholder="Enter 10-digit PNR Number..."
          value={pnrInput}
          onChange={(e) => setPnrInput(e.target.value)}
          maxLength={10}
          className="flex-1 px-4 py-3.5 rounded-2xl bg-[#050a05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-green-400 transition-colors"
        />
        <button
          onClick={handleCheckPNR}
          disabled={loading}
          className="px-6 py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-5 rounded-2xl bg-[#050a05] border border-green-500/20 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-gray-500 block">PNR NUMBER</span>
              <span className="font-mono font-bold text-white text-sm">{result.pnr}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {result.bookingStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Train:</span>
              <strong className="text-white">{result.trainNumber} - {result.trainName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Journey:</span>
              <strong className="text-gray-300">{result.from} ➔ {result.to}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Seat Allocated:</span>
              <strong className="text-green-400 font-medium">{result.coach}, {result.seat}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Charting:</span>
              <strong className="text-green-300 font-medium">{result.chartStatus}</strong>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
