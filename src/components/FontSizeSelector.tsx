/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FontSizeOption } from '../types';

interface FontSizeSelectorProps {
  fontSize: FontSizeOption;
  onSetFontSize: (size: FontSizeOption) => void;
}

export function FontSizeSelector({ fontSize, onSetFontSize }: FontSizeSelectorProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs mb-4 flex items-center justify-between" id="font-selector-banner">
      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">
        Acessibilidade visual:
      </span>
      <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50" id="font-toggle-tabs">
        <button
          type="button"
          onClick={() => onSetFontSize('normal')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
            fontSize === 'normal'
              ? 'bg-white text-sky-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="font-normal-btn"
        >
          Letra Normal
        </button>
        <button
          type="button"
          onClick={() => onSetFontSize('large')}
          className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all ${
            fontSize === 'large'
              ? 'bg-white text-sky-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="font-large-btn"
        >
          Letra Grande (A+)
        </button>
      </div>
    </div>
  );
}
