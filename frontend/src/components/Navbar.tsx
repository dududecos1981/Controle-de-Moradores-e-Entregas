'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Bell, Shield, Building, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      setDate(
        now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-700/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg">
      {/* Informações do Condomínio */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900/90 border border-slate-700/90 rounded-xl shadow-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black text-white tracking-wide">
            Condomínio Residencial Pro
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Sistema Ativo
          </span>
        </div>
      </div>

      {/* Relógio Digital da Portaria */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-950/90 border border-slate-700 rounded-xl shadow-inner">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-mono font-black text-cyan-300 tracking-wider">
              {time || '--:--:--'}
            </span>
            <span className="text-xs text-slate-300 font-semibold capitalize hidden md:inline">
              {date}
            </span>
          </div>
        </div>

        {/* Notificações */}
        <button
          type="button"
          className="relative p-2.5 text-slate-200 hover:text-white rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 transition-colors shadow-sm"
          title="Notificações em tempo real"
        >
          <Bell className="w-4 h-4 text-indigo-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>
    </header>
  );
}
