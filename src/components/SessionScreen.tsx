/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Worry, MeditationMode, ReframedWorry, ReframeResponse, FontSizeOption } from '../types';
import { audio } from '../utils/audio';
import { Play, Pause, VolumeX, Volume2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BreathingProgressHud } from './BreathingProgressHud';
import { RestShiningScreen } from './RestShiningScreen';
import { WisdomCarousel } from './WisdomCarousel';
import { BreathingRainCanvas } from './BreathingRainCanvas';

interface SessionScreenProps {
  worries: Worry[];
  activeMode: MeditationMode;
  volume: number;
  onSetVolume: (vol: number) => void;
  onEndSession: () => void;
  onSessionComplete: () => void;
  fontSize: FontSizeOption;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty';

const CHROMO_CONFIG = {
  inhale: {
    text: 'Inspire profundamente pelo nariz',
    colorName: 'Azul Celeste',
    colorHex: '#38bdf8',
    bgHex: '#e0f2fe',
    textColor: '#0369a1',
    shadowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.45)]',
    textTag: 'text-sky-700 font-bold',
    meaning: 'Calmante neural e reconexão silenciosa',
    scaling: 1.35
  },
  hold: {
    text: 'Segure o ar nos pulmões',
    colorName: 'Verde Regenerador',
    colorHex: '#10b981',
    bgHex: '#d1fae5',
    textColor: '#047857',
    shadowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.45)]',
    textTag: 'text-emerald-700 font-bold',
    meaning: 'Equilíbrio cardíaco e harmonização interna',
    scaling: 1.35
  },
  exhale: {
    text: 'Solte devagar pelo nariz',
    colorName: 'Violeta Transmutador',
    colorHex: '#a855f7',
    bgHex: '#f3e8ff',
    textColor: '#6b21a8',
    shadowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    textTag: 'text-purple-700 font-bold',
    meaning: 'Transmutação de cargas mentais e alívio',
    scaling: 0.85
  },
  holdEmpty: {
    text: 'Mantenha os pulmões vazios',
    colorName: 'Índigo Profundo',
    colorHex: '#4f46e5',
    bgHex: '#e0e7ff',
    textColor: '#3730a3',
    shadowClass: 'shadow-[0_0_25px_rgba(79,70,229,0.35)]',
    textTag: 'text-indigo-700 font-bold',
    meaning: 'Concentração profunda e limpeza dos ruídos',
    scaling: 0.82
  }
};

export function SessionScreen({
  worries,
  activeMode,
  volume,
  onSetVolume,
  onEndSession,
  onSessionComplete,
  fontSize,
}: SessionScreenProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [breathCount, setBreathCount] = useState(1);
  const [cycleCount, setCycleCount] = useState(1);
  const [inRestInterval, setInRestInterval] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(8);

  const [loadingReframes, setLoadingReframes] = useState(false);
  const [reframes, setReframes] = useState<ReframedWorry[]>([]);
  const [activeReframeIdx, setActiveReframeIdx] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const isLarge = fontSize === 'large';
  const textTitle = isLarge ? 'text-2xl font-bold' : 'text-lg font-bold';
  const textSubtitle = isLarge ? 'text-base font-medium' : 'text-sm';

  useEffect(() => {
    audio.start(activeMode);
    audio.setVolume(volume);
    setIsPlaying(true);
    analyserRef.current = audio.getAnalyser();

    return () => {
      audio.stop();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeMode]);

  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  // Synchronically stream current breathing phase to the premium 432Hz Audio Engine
  useEffect(() => {
    if (isPlaying && !inRestInterval) {
      audio.setBreathingPhase(breathingPhase);
    }
  }, [breathingPhase, isPlaying, inRestInterval]);

  // Fetch or generate reframed mantras from the AI proxy endpoint
  useEffect(() => {
    const fetchReframes = async () => {
      if (worries.length === 0) {
        setReframes([
          {
            original: "Mente inquieta e agitada",
            mantra: "Sua respiração é a sua âncora soberana. Deixe de lado as pressões do relógio."
          },
          {
            original: "Necessidade de controle",
            mantra: "A paz interior desabrocha quando você aceita o ritmo divino de cada dia."
          }
        ]);
        return;
      }

      setLoadingReframes(true);
      try {
        const textWorries = worries.map(w => w.text);
        const resp = await fetch('/api/reframe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worries: textWorries })
        });
        
        if (resp.ok) {
          const data: ReframeResponse = await resp.json();
          if (data.success) {
            setReframes(data.reframes || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reframed wisdom:", err);
      } finally {
        setLoadingReframes(false);
      }
    };

    fetchReframes();
  }, [worries]);

  // Breathing Rhythm Loop (Box breathing sequence)
  useEffect(() => {
    if (!isPlaying || inRestInterval) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setBreathingPhase((current) => {
            switch (current) {
              case 'inhale': return 'hold';
              case 'hold': return 'exhale';
              case 'exhale': return 'holdEmpty';
              case 'holdEmpty': 
                setBreathCount((b) => {
                  if (b >= 10) {
                    setInRestInterval(true);
                    setRestSecondsLeft(8);
                    return 1;
                  }
                  return b + 1;
                });
                return 'inhale';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, inRestInterval, cycleCount]);

  // Rest interval countdown timer (8 seconds)
  useEffect(() => {
    if (!isPlaying || !inRestInterval) return;

    audio.triggerShredSound();

    const restInterval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restInterval);
          if (cycleCount >= 3) {
            onSessionComplete();
          } else {
            setCycleCount((c) => c + 1);
            setInRestInterval(false);
            setSecondsLeft(4);
            setBreathingPhase('inhale');
          }
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(restInterval);
  }, [isPlaying, inRestInterval, cycleCount]);

  // Simplified Spectrum wave drawing routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 360;
    canvas.height = 45;

    const renderWave = () => {
      const analyser = analyserRef.current;
      const bufferLength = analyser ? analyser.frequencyBinCount : 32;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying && !inRestInterval) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        const now = Date.now() * 0.0015;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(0, 15 + Math.sin(now + i * 0.3) * 12 + Math.cos(now * 0.5 + i * 0.15) * 6);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 1.8;

      const activeChromo = CHROMO_CONFIG[breathingPhase];
      const gradLine = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradLine.addColorStop(0, 'rgba(203, 213, 225, 0.05)');
      gradLine.addColorStop(0.5, inRestInterval ? '#10b981' : activeChromo.colorHex);
      gradLine.addColorStop(1, 'rgba(203, 213, 225, 0.05)');
      ctx.strokeStyle = gradLine;

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const percent = dataArray[i] / 255;
        const normHeight = percent * (canvas.height * 0.7);
        const yPos = (canvas.height / 2) + (i % 2 === 0 ? normHeight : -normHeight);

        if (i === 0) {
          ctx.moveTo(x, yPos);
        } else {
          const prevY = (canvas.height / 2) + ((i - 1) % 2 === 0 ? (dataArray[i - 1] / 255) * (canvas.height * 0.7) : -(dataArray[i - 1] / 255) * (canvas.height * 0.7));
          ctx.bezierCurveTo(x - sliceWidth / 2, prevY, x - sliceWidth / 2, yPos, x, yPos);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, breathingPhase, inRestInterval]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audio.stop();
      setIsPlaying(false);
    } else {
      audio.start(activeMode);
      audio.setVolume(volume);
      analyserRef.current = audio.getAnalyser();
      setIsPlaying(true);
    }
  };

  const activeChromo = CHROMO_CONFIG[breathingPhase];

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full px-5 py-3 justify-between select-none text-slate-800 bg-transparent relative" id="session-container">
      
      {/* Premium Full-Screen Ambient Backdrop Glow (Bathes the entire page in subtle, calm healing pastel shifts) */}
      <div 
        className="fixed inset-0 -z-10 opacity-35 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${activeChromo.bgHex} 0%, rgba(255, 255, 255, 0) 80%)`,
          transition: 'all 2200ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* 1. Breathing progress HUD sub-component */}
      <BreathingProgressHud 
        cycleCount={cycleCount} 
        breathCount={breathCount} 
        inRestInterval={inRestInterval} 
      />

      <AnimatePresence mode="wait">
        {inRestInterval ? (
          <RestShiningScreen 
            cycleCount={cycleCount} 
            restSecondsLeft={restSecondsLeft} 
            textTitle={textTitle} 
            textSubtitle={textSubtitle} 
          />
        ) : (
          <motion.div
            key="breath-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-space-between relative"
          >
            {/* 2. Interactive Chromotherapy Breathing Ring with Worry Rain backdrops */}
            <div className="flex flex-col items-center justify-center py-6 relative overflow-hidden min-h-[260px] rounded-3xl" id="breath-stage">
              
              {/* Rain canvas backdrops continuously vaporizing worries on-screen */}
              <BreathingRainCanvas 
                worries={worries} 
                currentColor={activeChromo.colorHex} 
                isPlaying={isPlaying} 
              />

              {/* Glowing breathing ring accent circle */}
              <div 
                className="absolute w-[180px] h-[180px] rounded-full filter blur-3xl transition-all duration-1000 opacity-20 pointer-events-none z-0" 
                style={{ backgroundColor: activeChromo.colorHex }}
              />

              <div className="mb-4 text-center z-10 relative">
                <span className="text-[9px] uppercase font-mono tracking-widest font-bold text-slate-500">
                  Cromoterapia Ativa:
                </span>
                <span className={`block font-bold text-xs tracking-wider ${activeChromo.textTag}`}>
                  {activeChromo.colorName} — {activeChromo.meaning}
                </span>
              </div>

              {/* Central Pulsating Chromotherapy Ring */}
              <motion.div
                animate={{ scale: activeChromo.scaling }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className={`w-[144px] h-[144px] rounded-full flex items-center justify-center relative transition-all duration-1000 z-10 ${activeChromo.shadowClass}`}
                style={{ 
                  borderColor: activeChromo.colorHex,
                  borderWidth: '1.5px',
                  background: `radial-gradient(circle, ${activeChromo.bgHex} 0%, ${activeChromo.bgHex}ea 60%, ${activeChromo.colorHex}3a 100%)`
                }}
                id="breath-ring-element"
              >
                {/* SVG Progress Arc representing remaining seconds left inside active phase */}
                <svg className="absolute inset-x-0 inset-y-0 w-full h-full -rotate-90 z-0" viewBox="0 0 144 144">
                  <circle
                    cx="72"
                    cy="72"
                    r="67"
                    className="stroke-slate-200/25 fill-none"
                    strokeWidth="3.5"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="67"
                    className="fill-none"
                    stroke={activeChromo.colorHex}
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 67}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 67 * (1 - secondsLeft / 4)
                    }}
                    transition={{ duration: 1, ease: 'linear' }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner glassmorphic card overlay for numbers container */}
                <div className="absolute inset-[10px] bg-white/70 backdrop-blur-[4px] rounded-full flex flex-col items-center justify-center border border-white/60 shadow-inner z-10">
                  <motion.span 
                    key={secondsLeft}
                    initial={{ scale: 0.85, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono text-3xl font-extrabold transition-all duration-1000 tracking-tight"
                    style={{ color: activeChromo.textColor }}
                  >
                    {secondsLeft}s
                  </motion.span>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={breathingPhase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className={`text-sm font-bold tracking-wide mt-5 text-center min-h-[25px] z-10 ${activeChromo.textTag}`}
                  id="breathing-live-label"
                >
                  {activeChromo.text}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* 3. Audio spectrum curve lines */}
            <div className="bg-white rounded-xl border border-slate-200/80 py-1 px-3 mb-2 shadow-xs" id="wave-visualizer-container">
              <canvas ref={canvasRef} className="w-full h-[32px]" id="spectrum-wave-canvas" />
            </div>

            {/* 4. AI Wisdom carousel displaying rewritten positive mantras */}
            <div className="flex-1 flex flex-col justify-center min-h-[125px] max-h-[160px] mb-2" id="wisdom-box">
              <WisdomCarousel 
                reframes={reframes} 
                loadingReframes={loadingReframes} 
                activeReframeIdx={activeReframeIdx} 
                onPrev={() => setActiveReframeIdx((prev) => (prev - 1 + reframes.length) % reframes.length)} 
                onNext={() => setActiveReframeIdx((prev) => (prev + 1) % reframes.length)} 
                textSubtitle={textSubtitle} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. In-session audio state and cancellation selectors */}
      <div className="space-y-2 pt-2 border-t border-slate-150/60 animate-fade-in" id="session-footer">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`p-3 rounded-xl border cursor-pointer hover:scale-102 active:scale-98 transition-all ${
              isPlaying
                ? 'bg-slate-100/80 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-emerald-55 bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={isPlaying ? 'Pausar áudio' : 'Continuar áudio'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <div className="flex-1 bg-white border border-slate-201 border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
            <VolumeX size={12} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 appearance-none cursor-pointer bg-slate-200 accent-sky-500"
              id="volume-slider-session"
            />
            <Volume2 size={12} className="text-slate-500" />
          </div>

          <button
            type="button"
            onClick={onEndSession}
            className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1 transition-all"
            id="interrupt-session-btn"
          >
            <AlertTriangle size={13} className="text-red-500" />
            <span>Interromper</span>
          </button>
        </div>
      </div>
    </div>
  );
}
