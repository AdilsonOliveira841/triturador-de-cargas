/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface DisclaimerFooterProps {
  fontSize: 'normal' | 'large';
}

export function DisclaimerFooter({ fontSize }: DisclaimerFooterProps) {
  const isLarge = fontSize === 'large';
  const textClass = isLarge ? 'text-xs' : 'text-[10px]';

  return (
    <footer className="mt-4 p-4 bg-[#fdf2f2]/90 backdrop-blur-xs border border-rose-100/70 rounded-3xl text-center space-y-2 max-w-sm mx-auto shadow-sm" id="disclaimer-footer">
      <div className="flex items-center justify-center gap-1.5 text-slate-500 font-mono font-bold tracking-wider uppercase text-[8px] sm:text-[9.5px]">
        <ShieldCheck size={14} className="text-teal-500" />
        <span>CONSELHO DE PSICOLOGIA & ÉTICA PROFISSIONAL</span>
      </div>
      <p className={`${textClass} text-slate-500 leading-relaxed font-sans font-medium`}>
        Este trabalho é um recurso complementar de regulação e suporte emocional e <strong className="font-bold text-slate-700">não substitui</strong> o acompanhamento médico e psicológico especializado. Não aconselhamos, em nenhuma circunstância, a suspensão ou alteração de medicamentos prescritos sem orientação médica direta, prezando pela segurança de sua saúde integrativa.
      </p>
    </footer>
  );
}
