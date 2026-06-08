/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Worry, MeditationMode, AppScreen, FontSizeOption } from './types';
import { WorryInput } from './components/WorryInput';
import { ShredderAnimation } from './components/ShredderAnimation';
import { SessionScreen } from './components/SessionScreen';
import { CongratulationsScreen } from './components/CongratulationsScreen';
import { audio } from './utils/audio';
import { RefreshCw, Sparkles, BrainCircuit, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOCAL_STORAGE_KEY = 'mental_shredder_days_completed';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('input');
  const [worries, setWorries] = useState<Worry[]>([]);
  const [activeMode, setActiveMode] = useState<MeditationMode>('aterramento');
  const [volume, setVolume] = useState(0.5);

  // Accessibility Font size options ('normal' | 'large' for age 40+ legibility)
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');

  // 15 days tracker history
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // Load completed days from localStorage upon startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setCompletedDays(JSON.parse(saved));
      } else {
        setCompletedDays([]);
      }
    } catch (err) {
      console.warn("Failed to read completed days from space database:", err);
    }
  }, []);

  // Initialize volume inside the sound library on load
  useEffect(() => {
    audio.setVolume(volume);
  }, []);

  const handleAddWorry = (text: string) => {
    const newWorry: Worry = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      createdAt: Date.now(),
      crushed: false,
    };
    setWorries((prev) => [...prev, newWorry]);
  };

  const handleRemoveWorry = (id: string) => {
    setWorries((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSetMode = (mode: MeditationMode) => {
    setActiveMode(mode);
    audio.setVolume(volume);
  };

  const handleSetVolume = (vol: number) => {
    setVolume(vol);
    audio.setVolume(vol);
  };

  const handleStartShredding = () => {
    // If no worries are added, create a default stress point so the user can experience the app immediately
    if (worries.length === 0) {
      handleAddWorry('Preocupações e tensões acumuladas da rotina');
    }
    setScreen('shredding');
  };

  const handleShreddingComplete = () => {
    setScreen('session');
  };

  const handleEndSession = () => {
    audio.stop();
    setWorries([]);
    setScreen('input');
  };

  // Called when all 3 cycles of 10 breaths are successfully completed! (Mark day done)
  const handleSessionComplete = () => {
    audio.stop();
    setWorries([]);

    // Calculate next consecutive incomplete day in the 15 days journey
    let updatedHistory = [...completedDays];
    const nextDay = completedDays.length + 1;
    if (nextDay <= 15 && !completedDays.includes(nextDay)) {
      updatedHistory.push(nextDay);
    } else if (completedDays.length >= 15) {
      // Loop or reset after completing whole 15 days journey
      updatedHistory = [1];
    }
    
    setCompletedDays(updatedHistory);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      console.error("Failed to commit habit tracking day registry:", err);
    }

    setScreen('congratulations');
  };

  return (
    <div 
      className="min-h-screen bg-transparent text-slate-800 flex flex-col font-sans selection:bg-sky-200/50 overflow-hidden" 
      id="triturador-app-root"
    >
      
      {/* Decorative ambient glowing circles: Restful Light Theme Gradient backdrops */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-sky-200/20 to-transparent pointer-events-none z-0" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-sky-200/30 filter blur-3xl rounded-full pointer-events-none z-0" />

      {/* Persistent Premium Header (Matches mockup screenshot perfectly) */}
      <header className="relative w-full z-20 border-b border-[#2d1254]/50 bg-gradient-to-r from-[#0a051d] via-[#15072b] to-[#04010b] px-5 py-4 flex items-center justify-between shadow-lg shadow-black/10" id="app-header">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#8b5cf6]/30 bg-[#1e1045]/60 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <Lock className="text-purple-400 w-5 h-5 flex-shrink-0" strokeWidth={2.4} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-wide leading-tight font-sans">
              SOS Ansiedade
            </span>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#de8eff] via-[#ff7ec9] to-[#bf83ff] tracking-widest uppercase font-mono mt-0.5">
              TRITURADOR DE CARGA MENTAL
            </span>
          </div>
        </div>
        
        {/* Universal Font Size button selector inline in Header matching mockup screenshot */}
        <button
          type="button"
          onClick={() => setFontSize((f) => (f === 'large' ? 'normal' : 'large'))}
          className="border border-[#7c3aed]/40 bg-[#150a2e]/80 hover:bg-[#251052]/90 text-white rounded-xl px-4 py-1.5 flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all duration-200 active:scale-95 shadow-md shadow-purple-950/20"
          id="header-font-toggle"
        >
          <span className="text-[10px] font-extrabold tracking-tight">
            {fontSize === 'large' ? 'Letra Normal' : 'Letra Grande'}
          </span>
          <span className="text-[11px] hover:scale-110 transition-transform">🔍</span>
        </button>
      </header>

      {/* Main Container Layer */}
      <main className="flex-1 flex flex-col justify-between items-center relative z-10 py-3 w-full max-w-lg mx-auto" id="app-stage">
        <AnimatePresence mode="wait">
          {screen === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full flex-1 flex flex-col"
            >
              <WorryInput
                worries={worries}
                onAddWorry={handleAddWorry}
                onRemoveWorry={handleRemoveWorry}
                activeMode={activeMode}
                onSetMode={handleSetMode}
                volume={volume}
                onSetVolume={handleSetVolume}
                onStartShredding={handleStartShredding}
                fontSize={fontSize}
                onSetFontSize={setFontSize}
                completedDays={completedDays}
              />
            </motion.div>
          )}

          {screen === 'shredding' && (
            <motion.div
              key="shredding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <ShredderAnimation
                worries={worries}
                onComplete={handleShreddingComplete}
              />
            </motion.div>
          )}

          {screen === 'session' && (
            <motion.div
              key="session"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full flex-1 flex flex-col"
            >
              <SessionScreen
                worries={worries}
                activeMode={activeMode}
                volume={volume}
                onSetVolume={handleSetVolume}
                onEndSession={handleEndSession}
                onSessionComplete={handleSessionComplete}
                fontSize={fontSize}
              />
            </motion.div>
          )}

          {screen === 'congratulations' && (
            <motion.div
              key="congratulations"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full flex-1 flex flex-col"
            >
              <CongratulationsScreen
                completedDays={completedDays}
                fontSize={fontSize}
                onGoHome={handleEndSession}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
