/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FontSizeOption } from '../types';
import { Calendar, CheckCircle2, Award, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface CongratulationsScreenProps {
  completedDays: number[];
  fontSize: FontSizeOption;
  onGoHome: () => void;
}

export function CongratulationsScreen({
  completedDays,
  fontSize,
  onGoHome
}: CongratulationsScreenProps) {
  const isLarge = fontSize === 'large';
  const textTitle = isLarge ? 'text-2xl font-bold' : 'text-xl font-bold';
  const textBodyValue = isLarge ? 'text-base font-medium' : 'text-sm';
  const textSubBodyValue = isLarge ? 'text-sm' : 'text-xs';

  const lastCompletedDay = completedDays.length > 0 ? completedDays[completedDays.length - 1] : 1;

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full px-5 py-4 justify-between bg-[#f8fafc]/95 select-none" id="congrats-container">
      
      {/* 1. Main Celebration Card */}
      <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-md text-center space-y-4 my-auto relative overflow-hidden" id="congrats-card">
        
        {/* Confetti decoration */}
        <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500" />
        
        <motion.div
          animate={{ scale: [0.95, 1.08, 1], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-650"
        >
          <Award size={32} className="text-emerald-500" />
        </motion.div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full inline-block">
            Sessão Concluída com Sucesso!
          </span>
          <h2 className={`${textTitle} text-slate-800 tracking-tight`}>
            Parabéns por cuidar da sua mente hoje!
          </h2>
        </div>

        <p className={`${textBodyValue} text-slate-600 leading-relaxed font-sans px-1`}>
          Você concluiu com sucesso todos os <strong className="text-emerald-700">3 Ciclos Completos de Respiração de Cromoterapia</strong>. Toda a carga mental inserida foi triturada, desintegrada e transmutada.
        </p>

        {/* Dynamic customized motivation message */}
        <div className="bg-emerald-50/50 border border-emerald-150/70 rounded-2xl p-4 text-left space-y-2" id="motivation-box">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wide">
            <Heart size={12} className="text-emerald-500 fill-emerald-500" />
            Voz do Bem-Estar:
          </div>
          <p className={`${textSubBodyValue} text-emerald-850 font-medium leading-relaxed font-sans`}>
            O hábito diário de esvaziar pesos fortalece seu córtex pré-frontal, induz resiliência celular e silencia os circuitos de pânico. Ao retornar amanhã para fazer o <strong>Dia {lastCompletedDay < 15 ? lastCompletedDay + 1 : 1}</strong>, você reforça essa fortaleza mental de cura!
          </p>
          <div className="text-right border-t border-emerald-100/50 pt-1.5 mt-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-700 italic">
              — Psicólogo Adilson Cardoso
            </span>
          </div>
        </div>

        {/* 15 Days Grid Table visualizer */}
        <div className="space-y-2 pt-2 text-left" id="congrats-summary-grid">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
            <span>Sua Jornada de Paz</span>
            <span className="text-emerald-600 font-bold">{completedDays.length} de 15 Dias</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5" id="congrats-days">
            {Array.from({ length: 15 }).map((_, idx) => {
              const dayNum = idx + 1;
              const isCompleted = completedDays.includes(dayNum);
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700 font-bold shadow-xs'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-mono block">D{dayNum}</span>
                  {isCompleted ? (
                    <CheckCircle2 size={9} className="text-emerald-500" />
                  ) : (
                    <span className="text-[8px] text-slate-300 font-mono">S/N</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. Primary Navigation CTA Home Button */}
      <div className="pt-4" id="congrats-footer">
        <button
          onClick={onGoHome}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:brightness-105 active:scale-98 text-white rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 font-semibold text-sm transition-all"
          id="go-home-btn"
        >
          <RefreshCw size={15} />
          <span>Iniciar Nova Jornada ou Voltar ao Início</span>
        </button>
      </div>

    </div>
  );
}
