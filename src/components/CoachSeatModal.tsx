'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, CheckCircle2, User, Sparkles, Shield, Info } from 'lucide-react';
import { Train, CoachInfo } from '../types/train';

interface CoachSeatModalProps {
  train: Train;
  onClose: () => void;
  onBookSuccess?: () => void;
}

export const CoachSeatModal: React.FC<CoachSeatModalProps> = ({ train, onClose, onBookSuccess }) => {
  const [selectedCoachIndex, setSelectedCoachIndex] = useState<number>(1);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(12);
  const [mealSelected, setMealSelected] = useState<string>('Veg Standard Thali');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  const activeCoach: CoachInfo = train.coaches[selectedCoachIndex] || train.coaches[0];

  // Realistic seat matrix
  const seats = Array.from({ length: Math.min(activeCoach.seatsCount || 40, 48) }, (_, i) => {
    const seatNo = i + 1;
    const isBooked = [3, 7, 14, 15, 21, 22, 29, 30].includes(seatNo);
    const berthType =
      activeCoach.type === 'EC' || activeCoach.type === 'CC'
        ? seatNo % 3 === 1
          ? 'Window'
          : seatNo % 3 === 2
          ? 'Middle'
          : 'Aisle'
        : seatNo % 8 === 1 || seatNo % 8 === 4
        ? 'Lower'
        : seatNo % 8 === 2 || seatNo % 8 === 5
        ? 'Middle'
        : seatNo % 8 === 3 || seatNo % 8 === 6
        ? 'Upper'
        : seatNo % 8 === 7
        ? 'Side Lower'
        : 'Side Upper';

    return {
      seatNo,
      isBooked,
      berthType,
    };
  });

  const handleConfirmSeat = () => {
    setBookingConfirmed(true);
    if (onBookSuccess) onBookSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(74,222,128,0.2)] border border-green-500/30"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#050a05]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-green-500 text-black font-mono text-xs font-bold">
                {train.trainNumber}
              </span>
              <h3
                className="font-bold text-xl text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {train.trainName}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Coach Composition & Interactive Seat Map Visualizer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Coach Horizontal Strip */}
          <div>
            <span className="text-xs font-mono text-green-400 uppercase tracking-wider block mb-2 font-semibold">
              Rake / Coach Composition:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {train.coaches.map((coach, idx) => {
                const isSelected = selectedCoachIndex === idx;
                const isEngine = coach.type === 'ENG' || coach.type === 'LOCO';
                const isPantry = coach.hasPantry || coach.type === 'PANTRY';

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCoachIndex(idx)}
                    className={`shrink-0 px-4 py-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-w-[76px] ${
                      isSelected
                        ? 'bg-green-500 text-black font-bold border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                        : 'bg-[#050a05] border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{coach.code}</span>
                    <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
                      {isEngine ? '⚡ ENGINE' : isPantry ? '🍽 PANTRY' : coach.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Coach Details & Seats Grid */}
          <div className="bg-[#050a05]/90 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div>
                <span className="text-sm font-bold text-white">
                  Coach {activeCoach.code}: {activeCoach.name}
                </span>
                <span className="text-xs text-gray-400 block">
                  Capacity: {activeCoach.seatsCount} Passengers • Air Conditioned
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-green-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Available
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block"></span> Booked
                </span>
                <span className="flex items-center gap-1 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-white inline-block"></span> Selected
                </span>
              </div>
            </div>

            {/* Seat Map */}
            {activeCoach.seatsCount === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Info className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-gray-300">
                  {activeCoach.code === 'LOCO' ? 'Locomotive Cab (Restricted Access)' : 'Specialized Utility Coach'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  No passenger seats configured in this section.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
                {seats.map((s) => {
                  const isSelected = selectedSeat === s.seatNo;
                  return (
                    <button
                      key={s.seatNo}
                      disabled={s.isBooked}
                      onClick={() => setSelectedSeat(s.seatNo)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-green-500 text-black font-bold border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.7)] scale-105'
                          : s.isBooked
                          ? 'bg-black/40 border-white/5 text-gray-700 cursor-not-allowed'
                          : 'bg-[#0a1a0a] border-white/5 hover:border-green-500/40 text-gray-300 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{s.seatNo}</span>
                      <span className="text-[9px] opacity-75 mt-0.5">{s.berthType}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* IRCTC Catering & Meals Option */}
          <div className="bg-[#050a05]/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5 text-green-400 text-xs font-bold font-mono uppercase">
              <Utensils className="w-4 h-4" />
              IRCTC e-Catering & Gourmet Meal:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {['Veg Standard Thali', 'Jain Special Meal', 'Non-Veg Biryani Special'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setMealSelected(meal)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    mealSelected === meal
                      ? 'bg-green-500/20 border-green-400 text-green-300'
                      : 'bg-[#050a05] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-semibold block">{meal}</span>
                  <span className="text-[10px] text-gray-500">Complimentary Rail Neer</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-[#050a05]/90 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-gray-400">Selected Reservation:</span>
            <div className="text-sm font-bold text-white">
              Coach {activeCoach.code}, Seat #{selectedSeat || 'None'} ({mealSelected})
            </div>
          </div>

          <div className="flex items-center gap-3">
            {bookingConfirmed ? (
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 text-green-300 border border-green-500/40 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Preference Confirmed!
              </span>
            ) : (
              <button
                onClick={handleConfirmSeat}
                className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all"
              >
                Confirm Preference
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
