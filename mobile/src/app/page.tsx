'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wifi,
  Battery,
  Shield,
  Building,
  Sparkles,
  Layers,
} from 'lucide-react';
import BottomNav, { TabType } from '@/components/BottomNav';
import FeedEncomendasScreen from '@/screens/FeedEncomendasScreen';
import CriarConviteScreen from '@/screens/CriarConviteScreen';
import PerfilMoradorScreen from '@/screens/PerfilMoradorScreen';
import { EncomendaMorador, ConviteVisitante } from '@/lib/types';
import { INITIAL_MORADOR_ENCOMENDAS, INITIAL_CONVITES, CURRENT_MORADOR } from '@/lib/mobileStore';

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<TabType>('encomendas');
  const [encomendas, setEncomendas] = useState<EncomendaMorador[]>([]);
  const [convites, setConvites] = useState<ConviteVisitante[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Limpeza automática de dados fictícios legados
    const isCleaned = localStorage.getItem('morador_data_cleaned_v2');
    if (!isCleaned) {
      localStorage.removeItem('morador_encomendas');
      localStorage.removeItem('morador_convites');
      localStorage.setItem('morador_data_cleaned_v2', 'true');
    }

    // Carrega dados locais
    const savedEnc = localStorage.getItem('morador_encomendas');
    if (savedEnc) {
      try {
        setEncomendas(JSON.parse(savedEnc));
      } catch (e) {
        setEncomendas([]);
      }
    } else {
      setEncomendas([]);
    }

    const savedCnv = localStorage.getItem('morador_convites');
    if (savedCnv) {
      try {
        setConvites(JSON.parse(savedCnv));
      } catch (e) {
        setConvites([]);
      }
    } else {
      setConvites([]);
    }

    // Relógio do status bar
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmWithdrawal = (id: string, signatureUrl: string) => {
    const updated = encomendas.map((enc) => {
      if (enc.id === id) {
        return {
          ...enc,
          status: 'RETIRADO' as const,
          data_retirada: new Date().toISOString(),
          retirado_por_nome: `${CURRENT_MORADOR.nome} (App Morador)`,
          assinatura_digital_url: signatureUrl || undefined,
        };
      }
      return enc;
    });
    setEncomendas(updated);
    localStorage.setItem('morador_encomendas', JSON.stringify(updated));
  };

  const handleAddConvite = (novo: ConviteVisitante) => {
    const updated = [novo, ...convites];
    setConvites(updated);
    localStorage.setItem('morador_convites', JSON.stringify(updated));
  };

  const pendingCount = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA').length;

  return (
    <div className="w-full max-w-sm sm:max-w-md h-[100dvh] sm:h-[840px] bg-[#101726] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative sm:ring-1 sm:ring-slate-700/50">
      {/* Dynamic Island / Top Notch (Mobile frame aesthetic) */}
      <div className="h-10 bg-[#101726] shrink-0 px-6 flex items-center justify-between z-40 border-b border-slate-900">
        <span className="text-xs font-bold font-mono text-slate-200">
          {currentTime || '12:00'}
        </span>
        <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header do Morador */}
      <header className="px-5 py-3.5 bg-[#101726]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
            MR
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              {CURRENT_MORADOR.nome}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Bloco {CURRENT_MORADOR.bloco} • Apto {CURRENT_MORADOR.apartamento}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </header>

      {/* Conteúdo da Tela Selecionada */}
      <main className="flex-1 overflow-y-auto p-4 z-10">
        {activeTab === 'encomendas' && (
          <FeedEncomendasScreen
            encomendas={encomendas}
            onConfirmWithdrawal={handleConfirmWithdrawal}
          />
        )}
        {activeTab === 'convites' && (
          <CriarConviteScreen
            convites={convites}
            onAddConvite={handleAddConvite}
          />
        )}
        {activeTab === 'perfil' && <PerfilMoradorScreen />}
      </main>

      {/* Barra de Navegação Inferior */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingPackagesCount={pendingCount}
      />
    </div>
  );
}
