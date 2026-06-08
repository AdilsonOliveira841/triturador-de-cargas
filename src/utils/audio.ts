/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeditationMode } from '../types';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;
  private currentMode: MeditationMode = 'aterramento';
  private isPlaying: boolean = false;

  // Sound nodes
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private lfoNoise: OscillatorNode | null = null;
  private lfoNoiseGain: GainNode | null = null;

  // Binaural nodes
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private LeftGain: GainNode | null = null;
  private RightGain: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;

  // Synthesized Ambient Pads (chords) for Renovação
  private chordOscillators: OscillatorNode[] = [];
  private chordGains: GainNode[] = [];
  private lfoPads: OscillatorNode[] = [];

  // 432Hz Solfeggio pure anchor tone
  private pure432Oscillator: OscillatorNode | null = null;
  private pure432Gain: GainNode | null = null;

  constructor() {
    // Audio Context is initialized lazily upon first user action
  }

  private initCtx() {
    if (!this.ctx) {
      // Support standard and legacy web audio
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public triggerShredSound() {
    this.initCtx();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // Helper: Generate structured crackling white noise for paper tearing
    const bufferSize = ctx.sampleRate * 0.8; // 0.8 seconds duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Create complex crunchy paper textures
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const t = i / bufferSize;
      
      // Base crackle: noise amplitude modulated by rapid low-frequency crackles
      const crackleFreq = Math.sin(t * 80) * Math.cos(t * 300);
      const isCrackle = Math.random() < 0.15 ? 1 : 0.05;
      
      // Amplitudinal envelope curve
      const envelope = Math.pow(1 - t, 1.8) * (1 + 0.3 * Math.sin(t * 40));
      
      data[i] = white * envelope * isCrackle * (0.8 + 0.2 * crackleFreq);
    }

    // Shred continuous sound source
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Adding dynamic bandpass filter
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(650, now);
    bandpass.frequency.exponentialRampToValueAtTime(180, now + 0.8);
    bandpass.Q.setValueAtTime(3.0, now);

    // Gain envelope
    const shredGain = ctx.createGain();
    shredGain.gain.setValueAtTime(0, now);
    // Instant attack for start of tear
    shredGain.gain.linearRampToValueAtTime(0.7, now + 0.04);
    // Dynamic tearing steps
    shredGain.gain.linearRampToValueAtTime(0.4, now + 0.2);
    shredGain.gain.linearRampToValueAtTime(0.6, now + 0.35);
    // Decaying tail
    shredGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    // Combine
    noiseSource.connect(bandpass);
    bandpass.connect(shredGain);
    
    // Connect directly to output so it plays even if master meditator is quiet/muted
    shredGain.connect(ctx.destination);

    // Play
    noiseSource.start(now);
    noiseSource.stop(now + 0.8);

    // Add a deeper heavy thump at the beginning of the crush
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(110, now);
    thump.frequency.exponentialRampToValueAtTime(35, now + 0.25);

    thumpGain.gain.setValueAtTime(0.5, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    thump.start(now);
    thump.stop(now + 0.25);
  }

  public triggerBoomSound() {
    this.initCtx();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // 1. Heavy resonant sub-bass sweep (The "BOOMMM")
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    // Dynamic deep downward sweep for weight
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.95);

    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.linearRampToValueAtTime(0.5, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    // Filter to keep sub clean but heavy
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(150, now);

    subOsc.connect(lpFilter);
    lpFilter.connect(subGain);
    subGain.connect(ctx.destination);

    // 2. High-frequency release sparkle (simulating the dynamic dispersion of worry)
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'triangle';
    sparkleOsc.frequency.setValueAtTime(880, now);
    sparkleOsc.frequency.exponentialRampToValueAtTime(440, now + 0.5);

    sparkleGain.gain.setValueAtTime(0.12, now);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(1000, now);
    bpFilter.Q.setValueAtTime(4.0, now);

    sparkleOsc.connect(bpFilter);
    bpFilter.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);

    // Start all
    subOsc.start(now);
    subOsc.stop(now + 1.05);

    sparkleOsc.start(now);
    sparkleOsc.stop(now + 0.6);
  }

  public triggerRainPopSound() {
    this.initCtx();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // A low-frequency soft explosion thud representing the mental discharge of the worry
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    // Apply scaling relative to master volume setting
    subGain.gain.setValueAtTime(0.12 * this.volume, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain ? this.masterGain : ctx.destination);

    // Organic, crispy vaporization explosion sound: soft noise burst with bandpass sweep
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Linear random white mixed with a quick geometric decay
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / bufferSize), 2.5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.3);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.07 * this.volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain ? this.masterGain : ctx.destination);

    // Warm high-pitched crystal transmuting pulse
    const sparkOsc = ctx.createOscillator();
    const sparkGain = ctx.createGain();
    sparkOsc.type = 'triangle';
    sparkOsc.frequency.setValueAtTime(864, now); // Solfeggio 2 * 432 Hz octave!
    sparkOsc.frequency.exponentialRampToValueAtTime(432, now + 0.2);

    sparkGain.gain.setValueAtTime(0.02 * this.volume, now);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    sparkOsc.connect(sparkGain);
    sparkGain.connect(this.masterGain ? this.masterGain : ctx.destination);

    // Fire sound triggers
    subOsc.start(now);
    subOsc.stop(now + 0.36);
    noise.start(now);
    noise.stop(now + 0.36);
    sparkOsc.start(now);
    sparkOsc.stop(now + 0.21);
  }

  public setBreathingPhase(phase: 'inhale' | 'hold' | 'exhale' | 'holdEmpty') {
    this.initCtx();
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    
    // Dynamic acoustic sweeping of the ambient soundscape representation
    if (this.noiseFilter) {
      if (phase === 'inhale') {
        // High frequency expansion as if air expands in lungs
        this.noiseFilter.frequency.exponentialRampToValueAtTime(this.currentMode === 'aterramento' ? 220 : 680, now + 3.8);
      } else if (phase === 'hold') {
        // Warm, resonant suspension
        this.noiseFilter.frequency.setValueAtTime(this.currentMode === 'aterramento' ? 220 : 680, now);
      } else if (phase === 'exhale') {
        // Calming deep sweep down as hot air releases
        this.noiseFilter.frequency.exponentialRampToValueAtTime(this.currentMode === 'aterramento' ? 105 : 320, now + 3.8);
      } else {
        // Silent empty peace
        this.noiseFilter.frequency.setValueAtTime(this.currentMode === 'aterramento' ? 105 : 320, now);
      }
    }

    // Swell or dim the pure Solfeggio 432Hz volume to represent organic inhalation cycles
    if (this.pure432Gain) {
      if (phase === 'inhale') {
        // Comfortable, slow Solfeggio swell
        this.pure432Gain.gain.linearRampToValueAtTime(0.07, now + 3.8);
      } else if (phase === 'hold') {
        // Balanced stable projection
        this.pure432Gain.gain.setValueAtTime(0.07, now);
      } else if (phase === 'exhale') {
        // Deep release and dissipation
        this.pure432Gain.gain.linearRampToValueAtTime(0.02, now + 3.8);
      } else {
        // Quiescent, beautiful void
        this.pure432Gain.gain.setValueAtTime(0.015, now);
      }
    }

    // Adjust the synthesized G-major chord gain levels
    if (this.chordGains.length > 0) {
      this.chordGains.forEach((gainNode) => {
        try {
          if (phase === 'inhale') {
            gainNode.gain.linearRampToValueAtTime(0.04, now + 3.8);
          } else if (phase === 'hold') {
            gainNode.gain.setValueAtTime(0.04, now);
          } else if (phase === 'exhale') {
            gainNode.gain.linearRampToValueAtTime(0.015, now + 3.8);
          } else {
            gainNode.gain.setValueAtTime(0.008, now);
          }
        } catch (e) {
          // Guard against stale audio elements
        }
      });
    }
  }

  // Generate Grounding Brown Noise
  private createBrownNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = 4 * ctx.sampleRate; // 4 seconds looping buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise algorithm (integration of white noise)
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      // Normalize volume
      data[i] *= 3.5;
    }
    return buffer;
  }

  // Generate Pink Noise
  private createPinkNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = 4 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Paul Kellet's refined method
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      // Normalize
      data[i] *= 0.11;
    }
    return buffer;
  }

  public start(mode: MeditationMode) {
    this.initCtx();
    if (this.isPlaying) {
      if (this.currentMode === mode) return;
      this.stop(); // Switch modes cleanly
    }

    const ctx = this.ctx!;
    const now = ctx.currentTime;
    this.currentMode = mode;
    this.isPlaying = true;

    // 1. Noise Generator configuration (swirling soundscapes)
    const noiseBuffer = mode === 'aterramento' 
      ? this.createBrownNoiseBuffer() 
      : this.createPinkNoiseBuffer();

    this.noiseNode = ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseFilter = ctx.createBiquadFilter();
    
    if (mode === 'aterramento') {
      // Grounding: Low pass filtered brown noise, representing heavy, comforting warmth
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setValueAtTime(140, now);
      this.noiseFilter.Q.setValueAtTime(1.0, now);

      // Low LFO to sweep filter cutoff frequency softly, like deep respirations
      this.lfoNoise = ctx.createOscillator();
      this.lfoNoise.type = 'sine';
      this.lfoNoise.frequency.setValueAtTime(0.06, now); // ~16 seconds cycle

      this.lfoNoiseGain = ctx.createGain();
      this.lfoNoiseGain.gain.setValueAtTime(50, now); // swing +/- 50Hz

      this.lfoNoise.connect(this.lfoNoiseGain);
      this.lfoNoiseGain.connect(this.noiseFilter.frequency);
      this.lfoNoise.start(now);
    } else {
      // Renewal: Soft bandpass filter over pink noise, simulating fresh wind
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.setValueAtTime(450, now);
      this.noiseFilter.Q.setValueAtTime(1.5, now);

      this.lfoNoise = ctx.createOscillator();
      this.lfoNoise.type = 'sine';
      this.lfoNoise.frequency.setValueAtTime(0.08, now); // Speed sweeps

      this.lfoNoiseGain = ctx.createGain();
      this.lfoNoiseGain.gain.setValueAtTime(180, now); // wider sweeps in mid range

      this.lfoNoise.connect(this.lfoNoiseGain);
      this.lfoNoiseGain.connect(this.noiseFilter.frequency);
      this.lfoNoise.start(now);
    }

    const noiseGain = ctx.createGain();
    // Fade in noise gently
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(mode === 'aterramento' ? 0.35 : 0.15, now + 3);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);
    
    this.noiseNode.start(now);

    // 1.5. Pure 432Hz Solfeggio backdrop harmonic drone
    this.pure432Oscillator = ctx.createOscillator();
    this.pure432Oscillator.type = 'sine';
    this.pure432Oscillator.frequency.setValueAtTime(432, now); // Pure therapeutic frequency
    
    this.pure432Gain = ctx.createGain();
    this.pure432Gain.gain.setValueAtTime(0, now);
    // Build a very quiet, gentle backdrop resonance
    this.pure432Gain.gain.linearRampToValueAtTime(0.03, now + 5);
    
    this.pure432Oscillator.connect(this.pure432Gain);
    this.pure432Gain.connect(this.masterGain!);
    this.pure432Oscillator.start(now);

    // 2. Binaural Beat generators (separated left / right channels aligned to 432 Hz harmonics)
    // Left channel frequency is mathematically aligned to a subdivision of 432Hz
    // Grounding: 432 / 4 = 108 Hz
    // Renewal: 432 / 2 = 216 Hz
    const freqLeft = mode === 'aterramento' ? 108 : 216;
    
    // Right channel mismatch frequency creates the therapeutic binaural brain wave modulation
    // Aterramento -> 4Hz Delta (108 to 112) for restful trance
    // Renovacao -> 10Hz Alpha (216 to 226) for clear focus
    const freqRight = mode === 'aterramento' ? 112 : 226;

    this.leftOscillator = ctx.createOscillator();
    this.leftOscillator.type = 'sine';
    this.leftOscillator.frequency.setValueAtTime(freqLeft, now);

    this.rightOscillator = ctx.createOscillator();
    this.rightOscillator.type = 'sine';
    this.rightOscillator.frequency.setValueAtTime(freqRight, now);

    this.LeftGain = ctx.createGain();
    this.RightGain = ctx.createGain();
    
    // Low binaural beat volumes - should be subtle and pleasant
    this.LeftGain.gain.setValueAtTime(0, now);
    this.LeftGain.gain.linearRampToValueAtTime(0.08, now + 4);
    
    this.RightGain.gain.setValueAtTime(0, now);
    this.RightGain.gain.linearRampToValueAtTime(0.08, now + 4);

    this.merger = ctx.createChannelMerger(2);

    this.leftOscillator.connect(this.LeftGain);
    this.rightOscillator.connect(this.RightGain);

    this.LeftGain.connect(this.merger, 0, 0);  // Left oscillator to Left channel
    this.RightGain.connect(this.merger, 0, 1); // Right oscillator to Right channel

    this.merger.connect(this.masterGain!);

    this.leftOscillator.start(now);
    this.rightOscillator.start(now);

    // 3. Mode special additions: Synthesizer chord pads for 'renovacao' mode
    if (mode === 'renovacao') {
      // Create a lush G-major-7 / C-major-9 relaxing drone
      // Base frequencies: C2 (65.4Hz), G2 (98Hz), C3 (131Hz), E3 (164.8Hz), B3 (246.9Hz)
      const padFreqs = [65.4, 98.0, 131.0, 164.8, 246.9];
      
      padFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Triangle oscillators have a very warm, flute-like tone when lowpass-filtered
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Low cutoff to hide high harmonics, keeping sound soft
        filter.frequency.setValueAtTime(250 + Math.random() * 100, now);

        // Slow swelling gain LFOs that are out of sync (multi-phasic chords!)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        
        // Unsynchronized very low cycles (0.02Hz to 0.05Hz) so chords swell dynamically
        lfo.frequency.setValueAtTime(0.015 + idx * 0.008, now);
        lfo.type = 'sine';

        lfoGain.gain.setValueAtTime(0.015, now); // swell amplitude
        
        // Base gain envelope for entry
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 5);

        // Chain LFO to pad volume
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        lfo.start(now);
        osc.start(now);

        this.chordOscillators.push(osc);
        this.chordGains.push(gain);
        this.lfoPads.push(lfo);
      });
    }
  }

  public stop() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    const now = this.ctx ? this.ctx.currentTime : 0;

    // Clean stop helper for generators
    try {
      if (this.noiseNode) {
        this.noiseNode.stop(now);
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.lfoNoise) {
        this.lfoNoise.stop(now);
        this.lfoNoise.disconnect();
        this.lfoNoise = null;
      }
      if (this.leftOscillator) {
        this.leftOscillator.stop(now);
        this.leftOscillator.disconnect();
        this.leftOscillator = null;
      }
      if (this.rightOscillator) {
        this.rightOscillator.stop(now);
        this.rightOscillator.disconnect();
        this.rightOscillator = null;
      }
      if (this.pure432Oscillator) {
        this.pure432Oscillator.stop(now);
        this.pure432Oscillator.disconnect();
        this.pure432Oscillator = null;
      }
    } catch (e) {
      // Ignore double-stop exceptions
    }

    if (this.pure432Gain) {
      this.pure432Gain.disconnect();
      this.pure432Gain = null;
    }

    // Stop pads if running
    this.chordOscillators.forEach(osc => {
      try { osc.stop(now); osc.disconnect(); } catch(e){}
    });
    this.chordOscillators = [];
    
    this.chordGains.forEach(gain => gain.disconnect());
    this.chordGains = [];
    
    this.lfoPads.forEach(lfo => {
      try { lfo.stop(now); lfo.disconnect(); } catch(e){}
    });
    this.lfoPads = [];

    // Disconnect routing chains
    if (this.noiseFilter) { this.noiseFilter.disconnect(); this.noiseFilter = null; }
    if (this.lfoNoiseGain) { this.lfoNoiseGain.disconnect(); this.lfoNoiseGain = null; }
    if (this.LeftGain) { this.LeftGain.disconnect(); this.LeftGain = null; }
    if (this.RightGain) { this.RightGain.disconnect(); this.RightGain = null; }
    if (this.merger) { this.merger.disconnect(); this.merger = null; }
  }

  // Retrieve an AnalyserNode for generating visual animations
  public getAnalyser(): AnalyserNode | null {
    if (!this.ctx || !this.masterGain) return null;
    
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 64; // Small fft for fast, aesthetic responsive bars
    this.masterGain.connect(analyser);
    return analyser;
  }
}

// Single active instance
export const audio = new SoundEngine();
