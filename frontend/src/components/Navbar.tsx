'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Bell, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
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
    <header className="h-16 bg-[#111827]/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Informações do Condomínio */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">Condomínio Residencial Jardins</span>
        </div>
      </div>

      {/* Área Direita: Relógio, Operador Logado e Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Relógio Digital da Portaria */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
              {time || '--:--:--'}
            </span>
            <span className="text-[10px] text-slate-400 ml-2 hidden lg:inline">
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
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
        </button>

        {/* Operador / Usuário Ativo */}
        {currentUser && (
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white truncate max-w-[150px]">
                {currentUser.nome_completo.split(' ')[0]}
              </p>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                  currentUser.perfil === 'ADMINISTRADOR'
                    ? 'bg-purple-950 text-purple-300 border-purple-800/40'
                    : currentUser.perfil === 'SINDICO'
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-800/40'
                    : currentUser.perfil === 'PORTEIRO'
                    ? 'bg-blue-950 text-blue-300 border-blue-800/40'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800/40'
                }`}
              >
                {currentUser.perfil}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 p-2 bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/40 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all"
              title="Encerrar Sessão (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
