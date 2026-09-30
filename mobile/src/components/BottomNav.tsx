'use client';

import React from 'react';
import { Package, QrCode, User, AlertCircle, Calendar, Car } from 'lucide-react';

export type TabType = 'encomendas' | 'convites' | 'ocorrencias' | 'reservas' | 'veiculos' | 'perfil';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingPackagesCount?: number;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  pendingPackagesCount = 0,
}: BottomNavProps) {
  const tabs = [
    {
      id: 'encomendas' as TabType,
      label: 'Pacotes',
      icon: Package,
      badge: pendingPackagesCount > 0 ? pendingPackagesCount : undefined,
    },
    {
      id: 'convites' as TabType,
      label: 'Convites',
      icon: QrCode,
    },
    {
      id: 'ocorrencias' as TabType,
      label: 'Chamados',
      icon: AlertCircle,
    },
    {
      id: 'reservas' as TabType,
      label: 'Lazer',
      icon: Calendar,
    },
    {
      id: 'veiculos' as TabType,
      label: 'Garagem',
      icon: Car,
    },
    {
      id: 'perfil' as TabType,
      label: 'Meu Apto',
      icon: User,
    },
  ];

  return (
    <nav className="h-[68px] sm:h-20 bg-[#0c1220]/95 backdrop-blur-xl border-t-2 border-slate-800/90 flex items-center justify-around px-2 z-30 shrink-0 select-none pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative rounded-2xl ${
              isActive
                ? 'text-cyan-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Active Pill Glow */}
            <div
              className={`relative px-3 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 shadow-md shadow-indigo-500/10'
                  : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                  isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'
                }`}
              />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md animate-bounce border border-slate-950">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-0.5 tracking-tight transition-all ${
                isActive ? 'text-white font-bold' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

