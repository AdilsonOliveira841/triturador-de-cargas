/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Worry } from '../types';
import { audio } from '../utils/audio';
import { Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShredderAnimationProps {
  worries: Worry[];
  onComplete: () => void;
}

interface RainCapsule {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number; // falling velocity
  width: number;
  height: number;
  exploded: boolean;
  comfortPhrase: string;
}

interface ExplosionSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number; // 0 to 1
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

const getComfortPhrase = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('finan') || t.includes('dinheiro') || t.includes('contas') || t.includes('pagar') || t.includes('banco')) {
    return "✓ Crença Financeira Dissolvida: A abundância material começa com a clareza mental.";
  }
  if (t.includes('saude') || t.includes('corpo') || t.includes('doen') || t.includes('dor') || t.includes('morte')) {
    return "✓ Angústia Física Dissolvida: Seu corpo se regenera e descansa a partir de agora.";
  }
  if (t.includes('trabalho') || t.includes('prazo') || t.includes('tempo') || t.includes('projeto') || t.includes('entregar')) {
    return "✓ Cobrança de Produtividade Dissolvida: Você é de valor imensurável, independente do seu fazer.";
  }
  if (t.includes('futuro') || t.includes('ansiedade') || t.includes('amanha') || t.includes('medo') || t.includes('inquieta')) {
    return "✓ Medo do Futuro Dissolvido: O amanhã não começou. O momento presente está seguro.";
  }
  if (t.includes('familia') || t.includes('brigou') || t.includes('discuss') || t.includes('relaciona') || t.includes('amigo')) {
    return "✓ Conflito Interpessoal Dissolvido: Seu coração é soberano, e você dita sua própria paz.";
  }
  return "✓ Amarra Mental Dissolvida: Esse fardo foi desfeito em luz. Você está leve e livre para respirar.";
};

export function ShredderAnimation({ worries, onComplete }: ShredderAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activePhrase, setActivePhrase] = useState('Desintegrando pesos emocionais...');
  const [isFinishing, setIsFinishing] = useState(false);

  // Maintain precise physical simulation records in a ref to avoid react trigger latency
  const stateRef = useRef<{
    capsules: RainCapsule[];
    sparks: ExplosionSpark[];
    shockwaves: ShockwaveRing[];
    circleX: number;
    circleY: number;
    circleRadius: number;
    animationFrameId: number;
    completed: boolean;
  }>({
    capsules: [],
    sparks: [],
    shockwaves: [],
    circleX: 0,
    circleY: 0,
    circleRadius: 65,
    animationFrameId: 0,
    completed: false,
  });

  useEffect(() => {
    // 1. Convert worries list to Rain Capsule objects
    const list = worries.length > 0 ? worries : [{ id: 'default', text: 'Preocupações e tensões acumuladas', createdAt: Date.now(), crushed: false }];
    
    // Distribute drops vertically from the top so they rain sequentially
    stateRef.current.capsules = list.map((w, idx) => {
      return {
        id: w.id,
        text: w.text,
        x: 0, // calculated in resize
        y: -100 - (idx * 260), // staggered start heights to feel like a rainfall of bubbles
        vy: 2.8 + Math.random() * 0.8, // delicate falling velocity
        width: 190,
        height: 55,
        exploded: false,
        comfortPhrase: getComfortPhrase(w.text),
      };
    });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing gracefully
    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || 420;

      const state = stateRef.current;
      state.circleX = canvas.width * 0.5;
      state.circleY = canvas.height * 0.52; // centered slightly lower for HUD spacing

      // Spread initial X positions safely around center of screen
      state.capsules.forEach((cap) => {
        // slightly fluctuate around the center vertical band
        cap.x = state.circleX + (Math.random() * 80 - 40);
      });
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Chromotherapy-inspired blast color palette (emerald greens, healing purples, celestial blues)
    const chromoBlastColors = ['#c084fc', '#38bdf8', '#34d399', '#818cf8', '#a7f3d0', '#67e8f9'];

    // Core Animation Frame Loop
    const update = () => {
      const state = stateRef.current;
      
      // Clear with soft, light, airy background representing pure consciousness
      ctx.fillStyle = '#f8fafc'; // beautiful clean slate reflection
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw beautiful soft ornamental grid background
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // --- Draw Chromotherapy Alchemical Dissolution Circle ---
      ctx.save();
      
      // Radial breathing circular aura representing pure light
      const circleGrad = ctx.createRadialGradient(
        state.circleX, state.circleY, 15,
        state.circleX, state.circleY, state.circleRadius + 45
      );
      
      // Alternating pastel violet/emerald aura
      circleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      circleGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.12)'); // Violet Transmutation
      circleGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');  // Blue Serenity
      circleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = circleGrad;
      ctx.beginPath();
      ctx.arc(state.circleX, state.circleY, state.circleRadius + 60, 0, Math.PI * 2);
      ctx.fill();

      // Draw the main physical Chromotherapy energy ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'; // calm blue
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(state.circleX, state.circleY, state.circleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Soft white inner fluid core
      const innerWink = ctx.createRadialGradient(
        state.circleX, state.circleY, 2,
        state.circleX, state.circleY, state.circleRadius - 3
      );
      innerWink.addColorStop(0, '#ffffff');
      innerWink.addColorStop(0.65, '#f0fdfa'); // emerald clean touch
      innerWink.addColorStop(1, '#e0f2fe'); // soft blue light reflection
      ctx.fillStyle = innerWink;
      ctx.beginPath();
      ctx.arc(state.circleX, state.circleY, state.circleRadius - 2, 0, Math.PI * 2);
      ctx.fill();

      // Small concentric rotating/pulsing details inside ring to look high tech and healing
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)'; // violet
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 12]);
      ctx.beginPath();
      ctx.arc(state.circleX, state.circleY, state.circleRadius - 8, Date.now() * 0.001, (Date.now() * 0.001) + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // --- Update & Draw raindrops (Worry capsules) ---
      state.capsules.forEach((cap) => {
        if (cap.exploded) return;

        // Fall down towards center
        cap.y += cap.vy;

        // Horizontal sway to look like falling rain droplets / feathers
        const offsetSway = Math.sin((Date.now() * 0.002) + (cap.y * 0.015)) * 1.5;
        const drawX = cap.x + offsetSway;

        // Visual design of belief droplet: glassmorphic card on a light theme
        ctx.save();
        ctx.shadowColor = 'rgba(148, 163, 184, 0.12)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'; // neat subtle line
        ctx.lineWidth = 1.2;

        const r = 16; // capsule rounded edge
        const cx = drawX - (cap.width / 2);
        const cy = cap.y - (cap.height / 2);
        
        // Draw capsule rounded body
        ctx.beginPath();
        ctx.moveTo(cx + r, cy);
        ctx.lineTo(cx + cap.width - r, cy);
        ctx.quadraticCurveTo(cx + cap.width, cy, cx + cap.width, cy + r);
        ctx.lineTo(cx + cap.width, cy + cap.height - r);
        ctx.quadraticCurveTo(cx + cap.width, cy + cap.height, cx + cap.width - r, cy + cap.height);
        ctx.lineTo(cx + r, cy + cap.height);
        ctx.quadraticCurveTo(cx, cy + cap.height, cx, cy + cap.height - r);
        ctx.lineTo(cx, cy + r);
        ctx.quadraticCurveTo(cx, cy, cx + r, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Little warning red thread at the left representing emotional load
        ctx.fillStyle = '#f87171'; // soft coral/red
        ctx.beginPath();
        ctx.arc(cx + 12, cy + cap.height * 0.5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Render Capsule worry letters
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#334155'; // deep readable slate grey for 40+ legibility
        ctx.font = 'bold 12px var(--font-sans), system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const limitText = cap.text.length > 22 ? cap.text.substring(0, 20) + '...' : cap.text;
        ctx.fillText(limitText, cx + 24, cy + cap.height * 0.5);

        ctx.restore();

        // TRIGGER DETONATION: When raindrop center reaches height coordinate of the circle's center
        if (cap.y >= state.circleY && !cap.exploded) {
          cap.exploded = true;

          // 1. Synthesize powerful "BOOMMMM" sound
          audio.triggerBoomSound();

          // 2. Set dynamic portuguese phrase beneath the circle
          setActivePhrase(cap.comfortPhrase);

          // 3. Spawn gorgeous visual concentric shockwave ring
          state.shockwaves.push({
            x: state.circleX,
            y: state.circleY,
            radius: 5,
            maxRadius: state.circleRadius + 90,
            color: chromoBlastColors[Math.floor(Math.random() * chromoBlastColors.length)],
            alpha: 1.0,
          });

          // Second expansion shockwave ring
          state.shockwaves.push({
            x: state.circleX,
            y: state.circleY,
            radius: 2,
            maxRadius: state.circleRadius + 40,
            color: '#ef4444', // red transmutation ring
            alpha: 0.8,
          });

          // 4. Emit 30+ highly-responsive particle sparks shooting radially
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3.5 + Math.random() * 7.5;
            state.sparks.push({
              x: state.circleX,
              y: state.circleY,
              vx: Math.cos(angle) * velocity,
              vy: Math.sin(angle) * velocity,
              size: 2.5 + Math.random() * 4,
              color: chromoBlastColors[Math.floor(Math.random() * chromoBlastColors.length)],
              alpha: 1.0,
              life: 1.0,
            });
          }
        }
      });

      // --- Progress & Draw visual explosions (Shockwaves) ---
      state.shockwaves = state.shockwaves.filter((ring) => {
        ring.radius += 4.5;
        ring.alpha -= 0.024;
        
        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) return false;

        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = 4 * ring.alpha;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        return true;
      });

      // --- Progress & Draw visual sparks (Embers) ---
      state.sparks = state.sparks.filter((spark) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        
        // slow gravity down or drag
        spark.vx *= 0.96;
        spark.vy *= 0.96;
        spark.life -= 0.022;
        spark.alpha = spark.life;

        if (spark.life <= 0) return false;

        ctx.save();
        ctx.fillStyle = spark.color;
        ctx.globalAlpha = spark.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = spark.color;
        
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      // --- Clean transition logic: Are all capsules finished? ---
      const activeCapsCount = state.capsules.filter(c => !c.exploded).length;
      if (activeCapsCount === 0 && state.sparks.length === 0 && state.shockwaves.length === 0) {
        if (!state.completed) {
          state.completed = true;
          setIsFinishing(true);
          // Small transition delay for reading the final comfort quote!
          setTimeout(() => {
            onComplete();
          }, 2400);
        }
      }

      state.animationFrameId = requestAnimationFrame(update);
    };

    stateRef.current.animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(stateRef.current.animationFrameId);
      resizeObserver.disconnect();
    };
  }, [worries, onComplete]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-[390px] min-h-[390px] max-h-[460px] relative overflow-hidden flex flex-col justify-between select-none bg-slate-50"
      id="shredder-canvas-container"
    >
      {/* Upper Status Label */}
      <div className="absolute top-5 left-0 right-0 text-center px-4 z-10 pointer-events-none" id="shredder-hud">
        <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 inline-block">
          Cromoterapia e Alquimia Mental Ativas
        </span>
        <h2 className="text-sm font-semibold text-slate-700 mt-2">
          Suas crenças estão descendo em chuva de purificação...
        </h2>
      </div>

      {/* Main Canvas covering whole visual stage */}
      <canvas ref={canvasRef} className="w-full h-full block" id="shredder-stage" />

      {/* Dynamic comfort text block displayed BELOW the circle (Matches requirements perfectly) */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10 px-6 pointer-events-none flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhrase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-white/95 border border-emerald-100 shadow-md shadow-emerald-50 py-2.5 px-4 rounded-xl max-w-sm"
          >
            <p className="text-xs text-emerald-700 font-medium leading-relaxed font-sans text-center">
              {activePhrase}
            </p>
          </motion.div>
        </AnimatePresence>
        
        {isFinishing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-sky-600 font-mono tracking-widest uppercase mt-3 font-semibold animate-pulse"
          >
            Transmutação completa! Iniciando meditação guiada...
          </motion.p>
        )}
      </div>
    </div>
  );
}
