'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Bell, Shield, Search } from 'lucide-react';

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
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#111827]/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Informações do Condomínio */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Condomínio Residencial Jardins</span>
        </div>
      </div>

      {/* Relógio Digital da Portaria */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
              {time || '--:--:--'}
            </span>
            <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">
              {date}
            </span>
          </div>
        </div>

        {/* Notificações */}
        <button
          type="button"
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Notificações em tempo real"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
        </button>
      </div>
    </header>
  );
}
