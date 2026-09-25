'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  PackagePlus,
  Building2,
  Users,
  Sparkles,
  Shield,
  Activity,
  Boxes,
  Lock,
  HardHat,
  Car,
  AlertCircle,
  Calendar,
  ShieldCheck,
  FileText,
  LogOut,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const OPERACAO_ITEMS = [
  {
    name: 'Dashboard Geral',
    href: '/',
    icon: LayoutDashboard,
    badge: 'Ao Vivo',
  },
  {
    name: 'Registro de Encomendas',
    href: '/encomendas',
    icon: PackagePlus,
    badge: 'Scanner',
  },
  {
    name: 'Cadastro de Visitantes',
    href: '/visitantes',
    icon: UserPlus,
    badge: 'Webcam',
  },
  {
    name: 'Prestadores de Serviço',
    href: '/prestadores',
    icon: HardHat,
    badge: 'Controle',
  },
];

const GESTAO_ITEMS = [
  {
    name: 'Moradores & Unidades',
    href: '/moradores',
    icon: Users,
    badge: 'Fichas',
  },
  {
    name: 'Veículos & Garagem',
    href: '/veiculos',
    icon: Car,
    badge: 'Placas',
  },
  {
    name: 'Livro de Ocorrências',
    href: '/ocorrencias',
    icon: AlertCircle,
    badge: 'Chamados',
  },
  {
    name: 'Reserva de Áreas',
    href: '/reservas',
    icon: Calendar,
    badge: 'Lazer',
  },
];

const GOVERNANCA_ITEMS = [
  {
    name: 'Trilha Auditoria LGPD',
    href: '/auditoria-lgpd',
    icon: ShieldCheck,
    badge: 'Art. 18',
  },
  {
    name: 'Central de Relatórios',
    href: '/relatorios',
    icon: FileText,
    badge: 'CSV/PDF',
  },
  {
    name: 'Assistente IA & Avisos',
    href: '/comunicados-ia',
    icon: Sparkles,
    badge: 'Gemini',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  // Não exibe a barra lateral na tela de login
  if (pathname === '/login' || pathname === '/cadastro') return null;

  const userInitials = currentUser?.nome_completo
    ? currentUser.nome_completo
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP';

  return (
    <aside className="w-64 bg-[#0F172A]/95 backdrop-blur-2xl border-r border-slate-700/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-2xl relative z-20 select-none">
      {/* Logo / Header Fixo no Topo */}
      <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-slate-900/70 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 border border-indigo-400/40 shrink-0">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-base font-black text-white tracking-wide flex items-center gap-1.5 truncate">
            Portaria <span className="text-indigo-400 font-extrabold">PRO</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium truncate">Gestão & Acessos</p>
        </div>
      </div>

      {/* Área Central Rolável com Barra de Rolagem Personalizada e Visível */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar p-3 space-y-4">
        {/* Links de Navegação */}
        <nav className="space-y-4 pb-2">
          {/* Seção 1: Operação */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 rounded-lg flex items-center justify-between mb-2 shadow-sm">
              <span>Operação da Portaria</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="space-y-1">
              {OPERACAO_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-indigo-400 group-hover:text-cyan-300'
                        }`}
                      />
                      <span className="text-[12.5px]">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-slate-900 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Gestão Condominial */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-800/50 rounded-lg flex items-center justify-between mb-2 shadow-sm">
              <span>Gestão Condominial</span>
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="space-y-1">
              {GESTAO_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-cyan-400 group-hover:text-indigo-300'
                        }`}
                      />
                      <span className="text-[12.5px]">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-slate-900 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Governança & IA */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 rounded-lg flex items-center justify-between mb-2 shadow-sm">
              <span>Governança & Relatórios</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              {GOVERNANCA_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-emerald-400 group-hover:text-teal-300'
                        }`}
                      />
                      <span className="text-[12.5px]">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-slate-900 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Rodapé Fixo / Status e Usuário Logado */}
      <div className="p-3 border-t border-slate-700/80 bg-slate-900/85 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="flex items-center gap-2 text-slate-200 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
            Neon PostgreSQL
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-700/60 px-2 py-0.5 rounded-md">
            SSL Ativo
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-inner">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-indigo-600/40 border border-indigo-400/30">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.nome_completo || 'Operador'}
              </p>
              <p className="text-[11px] text-indigo-300 font-semibold truncate capitalize">
                {currentUser?.perfil?.toLowerCase() || 'Portaria'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
            title="Sair / Desconectar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
