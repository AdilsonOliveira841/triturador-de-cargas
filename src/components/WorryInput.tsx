/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Worry, MeditationMode, FontSizeOption } from '../types';
import { VolumeX, Volume2, Plus, Trash2, Headphones, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JourneyTracker } from './JourneyTracker';
import { DisclaimerFooter } from './DisclaimerFooter';

interface WorryInputProps {
  worries: Worry[];
  onAddWorry: (text: string) => void;
  onRemoveWorry: (id: string) => void;
  activeMode: MeditationMode;
  onSetMode: (mode: MeditationMode) => void;
  volume: number;
  onSetVolume: (vol: number) => void;
  onStartShredding: () => void;
  fontSize: FontSizeOption;
  onSetFontSize: (size: FontSizeOption) => void;
  completedDays: number[];
}

export function WorryInput({
  worries,
  onAddWorry,
  onRemoveWorry,
  activeMode,
  onSetMode,
  volume,
  onSetVolume,
  onStartShredding,
  fontSize,
  onSetFontSize,
  completedDays,
}: WorryInputProps) {
  const [inputText, setInputText] = useState('');

  // Scaling typography class hooks helper
  const isLarge = fontSize === 'large';
  const textSubtitle = isLarge ? 'text-base' : 'text-sm';
  const textBody = isLarge ? 'text-sm font-medium' : 'text-xs';
  const textBtn = isLarge ? 'text-base font-semibold' : 'text-sm font-semibold';
  const inputPad = isLarge ? 'py-4 text-base' : 'py-3 text-sm';

  const suggestions = [
    'Cobranças internas e pressões de prazos',
    'Preocupação com finanças ou contas futuras',
    'Ansiedade e agitação acumulada da rotina',
    'Insegurança sobre tomadas de decisões',
    'Esgotamento ou cansaço acumulado hoje',
  ];

  const availableSuggestions = suggestions.filter(
    (sug) => !worries.some((w) => w.text === sug)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAddWorry(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full px-5 py-2 justify-between select-none bg-transparent" id="worry-input-container">
      
      {/* 2. Brand Warning Description Block */}
      <div className="text-center space-y-3 pt-3">
        <motion.div 
          initial={{ opacity: 0.9 }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-250 bg-sky-50 text-[10px] font-mono text-sky-600 tracking-wide uppercase font-bold"
          id="fones-warning"
        >
          <Headphones size={13} className="text-sky-500 animate-bounce" />
          <span>Fones recomendados para uma ótima experiência</span>
        </motion.div>

        <p className={`text-slate-650 ${textSubtitle} px-1 leading-relaxed text-center font-sans tracking-wide`}>
          Escreva tudo que está tirando sua paz. Suas crenças e tensões limitantes serão trituradas e dissolvidas, abrindo espaço para respirar.
        </p>
      </div>

      {/* 3. Center Section: Creative Sandboxed Box for Carga Additions */}
      <div className="flex-1 flex flex-col my-4 justify-center min-h-[170px]" id="worries-sandbox">
        {/* Worry Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center mb-3" id="worry-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Qual pensamento ou fardo pesa hoje?..."
            className={`w-full pl-4 pr-12 ${inputPad} bg-white border border-slate-200 focus:border-sky-450 focus:ring-1 focus:ring-sky-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none shadow-xs transition-all duration-200`}
            id="worry-input-field"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 p-2 bg-gradient-to-r from-sky-400 to-blue-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-lg shadow cursor-pointer transition-all"
            id="add-worry-btn"
          >
            <Plus size={16} />
          </button>
        </form>

        {/* Suggestions Chest always visible and persistent, filtering out duplicates */}
        {availableSuggestions.length > 0 && (
          <div className="mb-3 animate-fade-in" id="suggestions-chest-box">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider pl-1 font-bold mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-sky-400 animate-pulse" />
              Sugestões (toque para carregar no cofre):
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto custom-scrollbar p-0.5">
              {availableSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAddWorry(sug)}
                  className="text-left text-[10px] text-slate-650 bg-white hover:bg-sky-55 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 py-1 px-2.5 rounded-lg truncate transition-all duration-150 cursor-pointer shadow-2xs max-w-full font-medium"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Lists Area with suggestion buttons */}
        <div className="flex-1 max-h-[135px] overflow-y-auto pr-1 space-y-2 custom-scrollbar" id="worry-grate-list">
          <AnimatePresence initial={false}>
            {worries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-white/60"
                id="worry-empty-state"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400">
                    Cofre de Cargas Vazio
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-[280px]">
                    Toque nas sugestões acima ou digite um fardo para carregá-lo no cofre e triturar.
                  </p>
                </div>
              </motion.div>
            ) : (
              worries.map((worry) => (
                <motion.div
                  key={worry.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl group relative shadow-xs"
                  style={{
                    borderLeft: `3.5px solid #0ea5e9`
                  }}
                  id={`worry-${worry.id}`}
                >
                  <span className={`${textSubtitle} text-slate-700 font-sans tracking-wide leading-relaxed pr-8 select-text`}>
                    {worry.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveWorry(worry.id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-md absolute right-1.5 cursor-pointer transition-colors"
                    id={`remove-${worry.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Modular visual tracker for 15 days calmness pattern */}
      <JourneyTracker completedDays={completedDays} />

      {/* 5. Bottom Controls (Modes, Sliders, Actions) */}
      <div className="space-y-3" id="controls-panel">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative space-y-3 animate-fade-in" id="audio-settings-card">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200" id="mode-tabs">
            <button
              type="button"
              onClick={() => onSetMode('aterramento')}
              className={`flex-1 text-center py-2 rounded-lg ${textBody} font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeMode === 'aterramento'
                  ? 'bg-white text-sky-600 shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              id="tab-aterramento"
            >
              Aterramento
            </button>
            <button
              type="button"
              onClick={() => onSetMode('renovacao')}
              className={`flex-1 text-center py-2 rounded-lg ${textBody} font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeMode === 'renovacao'
                  ? 'bg-white text-sky-600 shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              id="tab-renovacao"
            >
              Renovação
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-1" id="volume-row">
            <span className="text-xs text-slate-400 flex items-center">
              <VolumeX size={14} />
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-sky-500 outline-none"
              id="volume-slider"
            />
            <span className="text-xs text-slate-500 flex items-center">
              <Volume2 size={14} />
            </span>
          </div>
        </div>

        {/* Start button trigger */}
        <button
          onClick={onStartShredding}
          className="w-full py-3.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white rounded-xl shadow-md cursor-pointer hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sky-100/50"
          id="shred-and-start-btn"
        >
          <Sparkles size={16} />
          <span className={textBtn}>Triturar Cargas e Iniciar</span>
        </button>
      </div>

      {/* 6. Medical/Psychological Legal Ethics advisory warning */}
      <DisclaimerFooter fontSize={fontSize === 'large' ? 'large' : 'normal'} />
    </div>
  );
}
