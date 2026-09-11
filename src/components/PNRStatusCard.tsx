'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Search, CheckCircle2, AlertCircle, Shield, Sparkles, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PNRStatusCardProps {
  onTrackTrainByNumber?: (trainNum: string) => void;
}

export const PNRStatusCard: React.FC<PNRStatusCardProps> = ({ onTrackTrainByNumber }) => {
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
        date: 'Today, 06:00 AM',
        from: 'New Delhi (NDLS)',
        to: 'Varanasi Jn (BSB)',
        coach: 'E1',
        seat: 'Seat 42 (Window)',
        bookingStatus: 'CNF (Confirmed)',
        chartStatus: 'Chart Prepared • Coach Position Locked',
        prediction: '100% Guaranteed',
      });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF5A1F', '#FF7A00', '#10B981'],
      });
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFE8DE] relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-[#FFF2EB] text-[#FF5A1F] border border-[#FF5A1F]/20">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-xl text-[#1C1917]">
            PNR Status & Confirmation Tracker
          </h3>
          <p className="text-xs text-[#78716C]">Instant 10-Digit Indian Railways PNR Query & Coach Position</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter 10-digit PNR Number..."
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] text-sm font-semibold text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#FF5A1F] transition-all font-mono"
          />
        </div>
        <button
          onClick={handleCheckPNR}
          disabled={loading}
          className="px-6 py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#E44810] text-white text-sm font-bold shadow-orange-glow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Verifying...' : 'Check Status'}</span>
        </button>
      </div>

      {/* Result Card: Boarding pass format inspired by reference image */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFE8DE]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716C] block">PNR Number</span>
              <span className="text-lg font-mono font-black text-[#1C1917]">{result.pnr}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {result.bookingStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#78716C] block">Train</span>
              <span className="font-bold text-[#1C1917]">{result.trainNumber} {result.trainName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#78716C] block">Journey Date</span>
              <span className="font-bold text-[#1C1917]">{result.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#78716C] block">Coach & Berth</span>
              <span className="font-bold text-[#FF5A1F]">{result.coach} • {result.seat}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#78716C] block">Chart Status</span>
              <span className="font-bold text-emerald-600">Chart Prepared</span>
            </div>
          </div>

          {/* Barcode Strip */}
          <div className="pt-3 border-t border-dashed border-[#EFE8DE] flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest text-[#78716C]">
              |||| | ||||| || |||||| | |||| ||||
            </span>
            <a
              href="#tracking"
              className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              Track This Train Live ➔
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};
