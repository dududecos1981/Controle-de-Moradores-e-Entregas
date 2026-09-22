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
  PackageCheck,
  X,
} from 'lucide-react';
import BottomNav, { TabType } from '@/components/BottomNav';
import FeedEncomendasScreen from '@/screens/FeedEncomendasScreen';
import CriarConviteScreen from '@/screens/CriarConviteScreen';
import PerfilMoradorScreen from '@/screens/PerfilMoradorScreen';
import OcorrenciasMoradorScreen from '@/screens/OcorrenciasMoradorScreen';
import ReservasMoradorScreen from '@/screens/ReservasMoradorScreen';
import VeiculosMoradorScreen from '@/screens/VeiculosMoradorScreen';
import {
  EncomendaMorador,
  ConviteVisitante,
  OcorrenciaMorador,
  ReservaMorador,
} from '@/lib/types';
import {
  INITIAL_MORADOR_ENCOMENDAS,
  INITIAL_CONVITES,
  INITIAL_OCORRENCIAS_MORADOR,
  INITIAL_RESERVAS_MORADOR,
} from '@/lib/mobileStore';
import { mobileSocket } from '@/lib/socket';

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<TabType>('encomendas');
  const [encomendas, setEncomendas] = useState<EncomendaMorador[]>([]);
  const [convites, setConvites] = useState<ConviteVisitante[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaMorador[]>([]);
  const [reservas, setReservas] = useState<ReservaMorador[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [liveAlert, setLiveAlert] = useState<{ title: string; desc: string } | null>(null);

  useEffect(() => {
    // Carrega dados locais
    const savedEnc = localStorage.getItem('morador_encomendas');
    if (savedEnc) {
      try {
        setEncomendas(JSON.parse(savedEnc));
      } catch (e) {
        setEncomendas(INITIAL_MORADOR_ENCOMENDAS);
      }
    } else {
      setEncomendas(INITIAL_MORADOR_ENCOMENDAS);
      localStorage.setItem('morador_encomendas', JSON.stringify(INITIAL_MORADOR_ENCOMENDAS));
    }

    const savedCnv = localStorage.getItem('morador_convites');
    if (savedCnv) {
      try {
        setConvites(JSON.parse(savedCnv));
      } catch (e) {
        setConvites(INITIAL_CONVITES);
      }
    } else {
      setConvites(INITIAL_CONVITES);
      localStorage.setItem('morador_convites', JSON.stringify(INITIAL_CONVITES));
    }

    const savedOc = localStorage.getItem('morador_ocorrencias');
    if (savedOc) {
      try {
        setOcorrencias(JSON.parse(savedOc));
      } catch (e) {
        setOcorrencias(INITIAL_OCORRENCIAS_MORADOR);
      }
    } else {
      setOcorrencias(INITIAL_OCORRENCIAS_MORADOR);
      localStorage.setItem('morador_ocorrencias', JSON.stringify(INITIAL_OCORRENCIAS_MORADOR));
    }

    const savedRes = localStorage.getItem('morador_reservas');
    if (savedRes) {
      try {
        setReservas(JSON.parse(savedRes));
      } catch (e) {
        setReservas(INITIAL_RESERVAS_MORADOR);
      }
    } else {
      setReservas(INITIAL_RESERVAS_MORADOR);
      localStorage.setItem('morador_reservas', JSON.stringify(INITIAL_RESERVAS_MORADOR));
    }

    // Conexão WebSocket em tempo real para a Unidade A-101
    mobileSocket.connect('A', '101');
    const unsubPackage = mobileSocket.on('encomenda_chegou', (data) => {
      setLiveAlert({
        title: '📦 Nova Encomenda Recebida!',
        desc: data.mensagem || 'Um pacote seu acaba de ser registrado na portaria.',
      });
      // Atualiza lista
      if (data.encomenda) {
        setEncomendas((prev) => [data.encomenda, ...prev]);
      }
    });

    const unsubOc = mobileSocket.on('ocorrencia_respondida', (data) => {
      setLiveAlert({
        title: '🔔 Resposta da Administração',
        desc: data.mensagem || 'Sua ocorrência foi respondida pelo síndico.',
      });
    });

    // Relógio do status bar
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
      unsubPackage();
      unsubOc();
    };
  }, []);

  const handleConfirmWithdrawal = (id: string, signatureUrl: string) => {
    const updated = encomendas.map((enc) => {
      if (enc.id === id) {
        return {
          ...enc,
          status: 'RETIRADO' as const,
          data_retirada: new Date().toISOString(),
          retirado_por_nome: 'Mariana Fernandes (App Morador)',
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

  const handleAddOcorrencia = (nova: OcorrenciaMorador) => {
    const updated = [nova, ...ocorrencias];
    setOcorrencias(updated);
    localStorage.setItem('morador_ocorrencias', JSON.stringify(updated));
  };

  const handleAddReserva = (nova: ReservaMorador) => {
    const updated = [nova, ...reservas];
    setReservas(updated);
    localStorage.setItem('morador_reservas', JSON.stringify(updated));
  };

  const pendingCount = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA').length;

  return (
    <div className="w-full max-w-sm sm:max-w-md h-[100dvh] sm:h-[840px] bg-[#101726] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative sm:ring-1 sm:ring-slate-700/50">
      {/* Dynamic Island / Top Notch */}
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

      {/* Push Alert Popup em Tempo Real */}
      {liveAlert && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3.5 rounded-2xl shadow-2xl border border-indigo-400/40 flex items-start justify-between gap-3 animate-in slide-in-from-top-4">
          <div className="flex items-start gap-2.5">
            <PackageCheck className="w-5 h-5 text-indigo-200 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-white">{liveAlert.title}</p>
              <p className="text-[11px] text-indigo-100 mt-0.5 leading-snug">{liveAlert.desc}</p>
            </div>
          </div>
          <button onClick={() => setLiveAlert(null)} className="text-indigo-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header do Morador */}
      <header className="px-5 py-3.5 bg-[#101726]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
            MF
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              Mariana Fernandes
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Bloco A • Apto 101</p>
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
        {activeTab === 'ocorrencias' && (
          <OcorrenciasMoradorScreen
            ocorrencias={ocorrencias}
            onAddOcorrencia={handleAddOcorrencia}
          />
        )}
        {activeTab === 'reservas' && (
          <ReservasMoradorScreen
            reservas={reservas}
            onAddReserva={handleAddReserva}
          />
        )}
        {activeTab === 'veiculos' && <VeiculosMoradorScreen />}
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
