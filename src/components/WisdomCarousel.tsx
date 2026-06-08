/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReframedWorry } from '../types';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WisdomCarouselProps {
  reframes: ReframedWorry[];
  loadingReframes: boolean;
  activeReframeIdx: number;
  onPrev: () => void;
  onNext: () => void;
  textSubtitle: string;
}

export function WisdomCarousel({
  reframes,
  loadingReframes,
  activeReframeIdx,
  onPrev,
  onNext,
  textSubtitle,
}: WisdomCarouselProps) {
  if (loadingReframes) {
    return (
      <div className="flex flex-col items-center justify-center p-5 space-y-2 bg-white rounded-xl border border-slate-150 shadow-xs h-full" id="wisdom-loading">
        <span className="w-4 h-4 border-2 border-sky-450 border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] text-slate-500 italic animate-pulse font-mono">Sintonizando frequências de bem-estar...</p>
      </div>
    );
  }

  if (reframes.length === 0) return null;

  const activeReframe = reframes[activeReframeIdx];

  return (
    <div className="bg-white border border-slate-200/85 rounded-xl p-3.5 shadow-xs flex flex-col justify-between h-full relative" id="wisdom-carousel">
      
      {/* Header tags */}
      <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-wider font-bold mb-1 text-slate-400">
        <span className="text-slate-500 flex items-center gap-1">
          <CheckCircle2 size={11} className="text-emerald-500" />
          Carga Liberada & Libertada
        </span>
        <span>{activeReframeIdx + 1} de {reframes.length}</span>
      </div>

      {/* Carousel text content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-center py-0.5">
        <p className={`text-[10px] text-red-500/80 font-sans line-through opacity-80 truncate`}>
          "{activeReframe?.original}"
        </p>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={activeReframeIdx}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.28 }}
            className={`${textSubtitle} text-slate-700 font-sans font-medium leading-relaxed mt-0.5`}
          >
            {activeReframe?.mantra}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Bottom status and author signature */}
      <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-slate-100/70" id="carousel-bottom">
        <div className="flex gap-1" id="carousel-nav">
          {reframes.length > 1 && (
            <>
              <button
                type="button"
                onClick={onPrev}
                className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer transition-colors"
                title="Carga anterior"
              >
                <ChevronLeft size={11} />
              </button>
              <button
                type="button"
                onClick={onNext}
                className="p-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer transition-colors"
                title="Próxima carga"
              >
                <ChevronRight size={11} />
              </button>
            </>
          )}
        </div>

        {/* Digital psychologist signature below therapeutic mantra affirmation */}
        <span className="text-[10px] font-mono font-bold text-slate-450 text-slate-400 italic">
          — Psicólogo Adilson Cardoso
        </span>
      </div>
    </div>
  );
}
