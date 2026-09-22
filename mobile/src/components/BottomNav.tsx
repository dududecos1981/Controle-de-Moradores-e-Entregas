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
    <nav className="h-16 bg-[#101726]/95 backdrop-blur-lg border-t border-slate-800/80 flex items-center justify-around px-1 z-30 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-bounce">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
