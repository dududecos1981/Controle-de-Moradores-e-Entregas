'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Bell,
  Lock,
  LogOut,
  Sparkles,
  Layers,
  LayoutGrid,
  Check,
  Copy,
} from 'lucide-react';
import { CURRENT_MORADOR } from '@/lib/mobileStore';
import { ViewMode } from '@/lib/types';

interface PerfilProps {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export default function PerfilMoradorScreen({
  viewMode = 'amplo',
  onViewModeChange,
}: PerfilProps) {
  const router = useRouter();
  const [morador, setMorador] = useState(CURRENT_MORADOR);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('morador_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMorador((prev) => ({
          ...prev,
          nome: parsed.nome || prev.nome,
          email: parsed.email || prev.email,
          telefone: parsed.telefone || prev.telefone,
          bloco: parsed.bloco || prev.bloco,
          apartamento: parsed.apartamento || prev.apartamento,
        }));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('morador_auth_token');
    localStorage.removeItem('morador_auth_user');
    router.replace('/login');
  };

  const copyEmail = () => {
    if (morador.email) {
      navigator.clipboard?.writeText(morador.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const initials = morador.nome
    ? morador.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MO';

  return (
    <div className="space-y-6 pb-20">
      {/* Cartão de Identificação Amplo do Morador */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900/70 border-2 border-indigo-500/40 shadow-2xl text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
          {initials}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white">{morador.nome || 'Morador'}</h3>
          <p className="text-xs sm:text-sm text-indigo-300 font-semibold mt-0.5">Morador(a) Titular</p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-950/90 border border-indigo-700/60 rounded-full text-xs sm:text-sm font-black text-cyan-300 shadow-md">
          <Building className="w-4 h-4 text-cyan-400" />
          <span>
            Bloco {morador.bloco} • Apto {morador.apartamento || '101'}
          </span>
        </div>
      </div>

      {/* Seletor de Modo de Visualização (Configurações Visuais) */}
      <div className="bg-[#141D30] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Formato de Visualização no Celular</span>
          </h4>
        </div>

        <p className="text-xs sm:text-sm text-slate-400">
          Escolha como deseja visualizar os formulários, cartões e campos no aplicativo:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange('amplo')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              viewMode === 'amplo'
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-400/50'
                : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📱</span>
              {viewMode === 'amplo' && <Check className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-black">Modo Amplo</h5>
              <p className={`text-[11px] ${viewMode === 'amplo' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Campos expandidos, toque fácil e máximo conforto
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange('compacto')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              viewMode === 'compacto'
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-400/50'
                : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📋</span>
              {viewMode === 'compacto' && <Check className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-black">Modo Compacto</h5>
              <p className={`text-[11px] ${viewMode === 'compacto' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Lista condensada para visualização rápida
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Informações da Unidade */}
      <div className="bg-[#141D30] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3">
          Dados da Unidade & Contato
        </h4>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              E-mail
            </span>
            <button
              onClick={copyEmail}
              className="font-semibold text-white truncate max-w-[200px] flex items-center gap-1.5 hover:text-cyan-300"
            >
              <span>{morador.email || 'Não informado'}</span>
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              Telefone
            </span>
            <span className="font-semibold text-white">{morador.telefone || 'Não informado'}</span>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Condomínio
            </span>
            <span className="font-semibold text-white">{morador.condominio_nome}</span>
          </div>
        </div>
      </div>

      {/* Conformidade e Privacidade LGPD */}
      <div className="bg-[#141D30] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3.5">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="text-xs sm:text-sm font-bold">Privacidade & LGPD Ativa</h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Seus dados estão protegidos sob a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Suas fotos e encomendas são de acesso restrito à portaria.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Termo LGPD v1.0</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
            Aceito & Protegido
          </span>
        </div>
      </div>

      {/* Botão de Logout Amplo */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        <span>Sair da Minha Conta</span>
      </button>
    </div>
  );
}

