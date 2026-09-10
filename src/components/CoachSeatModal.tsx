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

  // Generate realistic seat matrix for active coach
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                {train.trainNumber}
              </span>
              <h3 className="font-bold text-lg text-white">{train.trainName}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Coach Composition & Interactive Seat Map Visualizer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Coach Trainset Horizontal Strip */}
          <div>
            <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider block mb-2">
              Rake / Coach Layout (Select Coach):
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
                        ? 'bg-gradient-to-b from-cyan-500/30 to-blue-600/30 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
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
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-sm font-bold text-white">
                  Coach {activeCoach.code}: {activeCoach.name}
                </span>
                <span className="text-xs text-slate-400 block">
                  Capacity: {activeCoach.seatsCount} Passengers • Air Conditioned
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Available
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50 inline-block"></span> Booked
                </span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Selected
                </span>
              </div>
            </div>

            {/* Seat Map */}
            {activeCoach.seatsCount === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Info className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-300">
                  {activeCoach.code === 'LOCO' ? 'Locomotive Cab (Restricted Access)' : 'Specialized Utility Coach'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
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
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-105'
                          : s.isBooked
                          ? 'bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{s.seatNo}</span>
                      <span className="text-[9px] opacity-80 mt-0.5">{s.berthType}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* IRCTC Catering & Meals Option */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold font-mono uppercase">
              <Utensils className="w-4 h-4" />
              IRCTC e-Catering & Gourmet Meal Preference:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {['Veg Standard Thali', 'Jain Special Meal', 'Non-Veg Biryani Special'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setMealSelected(meal)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    mealSelected === meal
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-semibold block">{meal}</span>
                  <span className="text-[10px] text-slate-500">Includes bottled Rail Neer</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with simulation confirm */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400">Selected Reservation:</span>
            <div className="text-sm font-bold text-white">
              Coach {activeCoach.code}, Seat #{selectedSeat || 'None'} ({mealSelected})
            </div>
          </div>

          <div className="flex items-center gap-3">
            {bookingConfirmed ? (
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Simulated Ticket Ready!
              </span>
            ) : (
              <button
                onClick={handleConfirmSeat}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
              >
                Confirm Seat Preference
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
