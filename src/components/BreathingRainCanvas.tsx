/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Worry } from '../types';
import { audio } from '../utils/audio';

interface BreathingRainCanvasProps {
  worries: Worry[];
  currentColor: string; // The hex color of the active chromotherapy phase
  isPlaying: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface RainDrop {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  opacity: number;
  isExploding: boolean;
  explosionProgress: number;
  sparks: Spark[];
  color: string;
}

export function BreathingRainCanvas({ worries, currentColor, isPlaying }: BreathingRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive sizing
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 280;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial words list extracted from actual user worries, or fallback calm concepts
    const worryWords: string[] = [];
    if (worries && worries.length > 0) {
      worries.forEach(w => {
        // extract first few words to keep text compact on-screen
        const text = w.text.length > 25 ? w.text.slice(0, 22) + "..." : w.text;
        worryWords.push(text);
      });
    } else {
      worryWords.push("Tensão", "Cobrança", "Pressão", "Crença Limitante", "Insegurança");
    }

    // Active drops state list kept in ref to avoid react state rendering bottleneck
    const dropsRef = { current: [] as RainDrop[] };

    // Helper to spawn a single drop
    const spawnDrop = (yInit = -20): RainDrop => {
      const idx = Math.floor(Math.random() * worryWords.length);
      const text = worryWords[idx] || "Preocupação";
      return {
        id: Math.random().toString(36).substring(2, 9),
        x: Math.random() * (canvas.width - 60) + 30,
        y: yInit,
        vy: 0.8 + Math.random() * 1.2, // slow, therapeutic falling speed
        text,
        opacity: 0.8 + Math.random() * 0.2,
        isExploding: false,
        explosionProgress: 0,
        sparks: [],
        color: currentColor
      };
    };

    // Populate initial drops
    for (let i = 0; i < 4; i++) {
      dropsRef.current.push(spawnDrop(Math.random() * canvas.height * 0.8));
    }

    let animationId: number;

    const render = () => {
      if (!ctx || !canvas) return;

      // Clear with very slight transparency to leave a beautiful motion trail
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        // Manage spawn rate
        if (dropsRef.current.length < 5 && Math.random() < 0.015) {
          dropsRef.current.push(spawnDrop());
        }

        // Update and draw each raindrop
        dropsRef.current.forEach((drop, index) => {
          if (!drop.isExploding) {
            // Let the drop fall downwards
            drop.y += drop.vy;

            // Trigger explosion if it reaches the bottom half, near the center, or randomly
            const triggerY = canvas.height * 0.35 + Math.random() * (canvas.height * 0.55);
            if (drop.y >= triggerY) {
              drop.isExploding = true;
              
              // Trigger a gentle harmonic pop sound directly inside the audio engine
              audio.triggerRainPopSound();
              
              // Seed spark particles to simulate vaporizing the worries
              const sparkCount = 14 + Math.floor(Math.random() * 8);
              for (let s = 0; s < sparkCount; s++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 3.5;
                drop.sparks.push({
                  x: drop.x,
                  y: drop.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  alpha: 1.0,
                  color: currentColor, // matches chromotherapy phase perfectly
                  size: 2 + Math.random() * 3
                });
              }
            }

            // Draw drifting worry text
            ctx.save();
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = `rgba(100, 116, 139, ${drop.opacity * 0.75})`;
            ctx.textAlign = 'center';
            
            // Draw subtle deletion line through it
            const textWidth = ctx.measureText(drop.text).width;
            ctx.fillText(drop.text, drop.x, drop.y);
            
            ctx.strokeStyle = `rgba(239, 68, 68, ${drop.opacity * 0.55})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(drop.x - textWidth / 2 - 2, drop.y - 3);
            ctx.lineTo(drop.x + textWidth / 2 + 2, drop.y - 3);
            ctx.stroke();

            // Draw a tiny falling pointer/glow point at the base
            ctx.beginPath();
            ctx.arc(drop.x, drop.y + 4, 2, 0, Math.PI * 2);
            ctx.fillStyle = currentColor;
            ctx.shadowBlur = 4;
            ctx.shadowColor = currentColor;
            ctx.fill();

            ctx.restore();
          } else {
            // Update and draw explosion sparks
            drop.explosionProgress += 0.04;
            
            drop.sparks.forEach((spark) => {
              spark.x += spark.vx;
              spark.y += spark.vy;
              // adding minor gravity resistance or air friction to make it look magic
              spark.vx *= 0.96;
              spark.vy *= 0.96;
              spark.alpha -= 0.025; // fade spark

              if (spark.alpha > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
                ctx.fillStyle = spark.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = spark.color;
                ctx.globalAlpha = spark.alpha;
                ctx.fill();
                ctx.restore();
              }
            });

            // Filter out dead sparks
            drop.sparks = drop.sparks.filter(spark => spark.alpha > 0);

            // Re-spawn once explosion is complete
            if (drop.sparks.length === 0) {
              dropsRef.current[index] = spawnDrop();
            }
          }
        });
      } else {
        // Paused state: draw words static/faded out
        dropsRef.current.forEach((drop) => {
          ctx.font = '9px monospace';
          ctx.fillStyle = `rgba(148, 163, 184, 0.3)`;
          ctx.textAlign = 'center';
          ctx.fillText(drop.text, drop.x, drop.y);
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [worries, currentColor, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-70"
      id="breathing-session-rain-canvas"
    />
  );
}
