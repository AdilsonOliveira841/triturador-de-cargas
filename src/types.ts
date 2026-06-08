/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MeditationMode = 'aterramento' | 'renovacao';

export type FontSizeOption = 'normal' | 'large';

export interface CompletionHistory {
  completedDays: number[]; // Array of completed day indices (e.g. [1, 2, 3])
  lastCompletedTimestamp?: number;
}

export interface Worry {
  id: string;
  text: string;
  createdAt: number;
  crushed: boolean;
  x?: number; // relative horizontal position 0-100
  y?: number; // relative vertical position 0-100
  rotation?: number; // angle in degrees
}

export type AppScreen = 'input' | 'shredding' | 'session' | 'congratulations';

export interface ReframedWorry {
  original: string;
  mantra: string;
}

export interface ReframeResponse {
  success: boolean;
  reframes: ReframedWorry[];
  wisdomText: string;
}
