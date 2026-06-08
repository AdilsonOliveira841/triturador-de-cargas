/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BreathingProgressHudProps {
  cycleCount: number;
  breathCount: number;
  inRestInterval: boolean;
}

export function BreathingProgressHud({
  cycleCount,
  breathCount,
  inRestInterval,
}: BreathingProgressHudProps) {
  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-3.5 shadow-xs mb-1" id="session-progress-hud">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping inline-block" />
          Exercício em Progresso
        </span>
        <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded font-bold font-mono">
          Ciclo {cycleCount} de 3
        </span>
      </div>

      {/* Breath sequence tracker 1 to 10 visual pills */}
      <div className="mt-3" id="breath-progress-pills">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-650 mb-1.5">
          <span>Ciclo {cycleCount}: Série de Respirações</span>
          <span className="font-mono text-sky-600">{breathCount} / 10 completas</span>
        </div>
        <div className="flex gap-1" id="pills-row">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2.5 rounded transition-all duration-300 ${
                i < breathCount - 1
                  ? 'bg-emerald-400'
                  : i === breathCount - 1 && !inRestInterval
                  ? 'bg-sky-400 animate-pulse'
                  : 'bg-slate-150'
              }`}
              title={`Respiração ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
