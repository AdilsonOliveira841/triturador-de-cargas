/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface RestShiningScreenProps {
  cycleCount: number;
  restSecondsLeft: number;
  textTitle: string;
  textSubtitle: string;
}

export function RestShiningScreen({
  cycleCount,
  restSecondsLeft,
  textTitle,
  textSubtitle,
}: RestShiningScreenProps) {
  return (
    <motion.div
      key="rest-interval"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8 bg-sky-500/10 rounded-3xl border border-sky-200/60 shadow-xl shadow-sky-100 my-4 space-y-6"
      id="rest-shining-screen"
    >
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        className="p-4 bg-white rounded-full shadow-md border border-sky-200"
      >
        <Sparkles size={45} className="text-sky-500" />
      </motion.div>

      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold font-mono text-sky-600 bg-white border border-sky-200/50 px-3.5 py-1 rounded-full shadow-xs tracking-widest">
          Harmonização e Descanso
        </span>
        <h3 className={`${textTitle} text-slate-800 leading-tight`}>
          Sensacional! Ciclo {cycleCount} Completo.
        </h3>
        <p className={`${textSubtitle} text-slate-650 px-2 leading-relaxed`}>
          Sua mente está se assentando. Respire naturalmente nestes 8 segundos enquanto o corpo assimila a vibração positiva:
        </p>
      </div>

      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-sky-200 flex items-center justify-center font-mono font-bold text-2xl text-sky-600 bg-white shadow-md animate-pulse">
          {restSecondsLeft}s
        </div>
      </div>
    </motion.div>
  );
}
