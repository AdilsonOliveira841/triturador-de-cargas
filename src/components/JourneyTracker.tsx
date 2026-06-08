/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface JourneyTrackerProps {
  completedDays: number[];
  isCongratsView?: boolean;
}

export function JourneyTracker({ completedDays, isCongratsView = false }: JourneyTrackerProps) {
  return (
    <div className="bg-white border border-slate-150/80 rounded-2xl p-3.5 shadow-xs mb-3 space-y-2" id="15-day-grid-container">
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block`}>
          Jornada de Calma: Registro de 15 Dias
        </span>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold font-mono">
          {completedDays.length} / 15 dias concluídos
        </span>
      </div>

      {/* 15 Days Grid Blocks with responsive scaling */}
      <div className="grid grid-cols-5 gap-1.5" id="tracking-days-grid">
        {Array.from({ length: 15 }).map((_, idx) => {
          const dayNum = idx + 1;
          const isCompleted = completedDays.includes(dayNum);
          const isNext = !isCongratsView && completedDays.length === idx; 

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-xs'
                  : isNext
                  ? 'bg-sky-50/50 border-sky-400 border-2 text-sky-700 animate-pulse font-semibold'
                  : 'bg-slate-50/40 border-slate-150 text-slate-500'
              }`}
              title={isCompleted ? `Dia ${dayNum} Concluído!` : `Dia ${dayNum}`}
            >
              <span className="text-[10px] font-mono block">D{dayNum}</span>
              {isCompleted ? (
                <CheckCircle2 size={10} className="text-emerald-500 mt-0.5" />
              ) : (
                <span className="text-[8px] uppercase tracking-wide text-slate-400 font-bold mt-0.5">
                  {isNext ? 'Hoje' : 'S/N'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
