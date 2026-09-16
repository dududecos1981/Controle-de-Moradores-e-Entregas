'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  PackagePlus,
  Building2,
  Shield,
  Activity,
  Boxes,
  Lock,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    name: 'Dashboard Encomendas',
    href: '/',
    icon: LayoutDashboard,
    badge: 'Tempo Real',
  },
  {
    name: 'Cadastro de Visitantes',
    href: '/visitantes',
    icon: UserPlus,
    badge: 'Webcam',
  },
  {
    name: 'Registro de Encomendas',
    href: '/encomendas',
    icon: PackagePlus,
    badge: 'Scanner',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Logo / Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Portaria Pro</h1>
            <p className="text-[11px] text-slate-400 font-medium">Gestão & Acessos</p>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operação da Portaria
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé / Status da Infraestrutura Neon */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Neon DB Serverless
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
            SSL Ativo
          </span>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            JP
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">João Portaria</p>
            <p className="text-[10px] text-slate-400 truncate">Plantão Diurno • Portaria 1</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
