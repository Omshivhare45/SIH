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
        seat: 'Seat 42 (Window / No Meal Flag)',
        bookingStatus: 'CNF (Confirmed)',
        chartStatus: 'Chart Not Prepared (Final chart 4 hrs before departure)',
      });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }, 600);
  };

  return (
    <div className="backdrop-blur-2xl bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-white">PNR Status & Berth Confirmation Predictor</h3>
          <p className="text-xs text-slate-400">10-Digit Indian Railways PNR Live Query</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Enter 10-digit PNR Number..."
          value={pnrInput}
          onChange={(e) => setPnrInput(e.target.value)}
          maxLength={10}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={handleCheckPNR}
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">PNR NUMBER</span>
              <span className="font-mono font-bold text-white text-sm">{result.pnr}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {result.bookingStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Train:</span>
              <strong className="text-white">{result.trainNumber} - {result.trainName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Journey:</span>
              <strong className="text-slate-200">{result.from} ➔ {result.to}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Seat Allocated:</span>
              <strong className="text-cyan-300">{result.coach}, {result.seat}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Charting:</span>
              <strong className="text-amber-300">{result.chartStatus}</strong>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
