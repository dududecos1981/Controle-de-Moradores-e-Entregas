'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { mobileApi } from '@/lib/api';

export default function MobileAppPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('encomendas');
  const [encomendas, setEncomendas] = useState<EncomendaMorador[]>([]);
  const [convites, setConvites] = useState<ConviteVisitante[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaMorador[]>([]);
  const [reservas, setReservas] = useState<ReservaMorador[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [liveAlert, setLiveAlert] = useState<{ title: string; desc: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>({
    nome: 'Morador',
    bloco: 'A',
    apartamento: '',
  });

  useEffect(() => {
    // Validação de autenticação do morador
    const authUserStr = localStorage.getItem('morador_auth_user');
    if (!authUserStr) {
      router.replace('/login');
      return;
    }
    let userObj = { nome: 'Morador', bloco: 'A', apartamento: '' };
    try {
      userObj = JSON.parse(authUserStr);
      setCurrentUser(userObj);
    } catch (e) {}

    // 1. Carrega dados de fallback locais
    const savedEnc = localStorage.getItem('morador_encomendas');
    if (savedEnc) {
      try {
        setEncomendas(JSON.parse(savedEnc));
      } catch (e) {
        setEncomendas(INITIAL_MORADOR_ENCOMENDAS);
      }
    } else {
      setEncomendas(INITIAL_MORADOR_ENCOMENDAS);
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
    }

    // 2. Busca dados em tempo real no backend Neon DB
    async function fetchFromBackend() {
      try {
        const [encs, vsts, ocs, rsvs] = await Promise.allSettled([
          mobileApi.getEntregas(),
          mobileApi.getVisitantes(),
          mobileApi.getOcorrencias(),
          mobileApi.getReservas(),
        ]);

        if (encs.status === 'fulfilled' && Array.isArray(encs.value) && encs.value.length > 0) {
          const mapped: EncomendaMorador[] = encs.value.map((e: any) => ({
            id: e.id,
            codigo_barras_qrcode: e.codigo_barras_qrcode || e.codigo_rastreio || `PKG-${e.id.slice(0, 6)}`,
            codigo_rastreio: e.codigo_rastreio,
            transportadora: e.transportadora || 'Transportadora',
            descricao_pacote: e.descricao_pacote || e.descricao || '',
            status: e.status || 'AGUARDANDO_RETIRADA',
            data_recebimento: e.data_recebimento || e.data_chegada || e.created_at,
            data_retirada: e.data_retirada,
            retirado_por_nome: e.retirado_por_nome,
            porteiro_recebedor_nome: e.porteiro_recebedor_nome || 'Portaria',
            foto_pacote_url: e.foto_pacote_url,
            observacoes: e.observacoes,
          }));
          setEncomendas(mapped);
          localStorage.setItem('morador_encomendas', JSON.stringify(mapped));
        }

        if (vsts.status === 'fulfilled' && Array.isArray(vsts.value) && vsts.value.length > 0) {
          const mapped: ConviteVisitante[] = vsts.value.map((v: any) => ({
            id: v.id,
            nome_convidado: v.nome_completo || v.nome,
            documento: v.cpf || v.documento,
            tipo_visita: (v.tipo || 'VISITA') as any,
            data_valida: v.data_valida || new Date().toISOString().split('T')[0],
            hora_inicio: '12:00',
            hora_fim: '22:00',
            qr_code_token: v.codigo_acesso || `QR-VIS-${v.id.slice(0, 6)}`,
            status: v.ativo ? 'ATIVO' : 'UTILIZADO',
            created_at: v.created_at || new Date().toISOString(),
            observacoes: v.observacoes,
          }));
          setConvites(mapped);
          localStorage.setItem('morador_convites', JSON.stringify(mapped));
        }

        if (ocs.status === 'fulfilled' && Array.isArray(ocs.value) && ocs.value.length > 0) {
          const mapped: OcorrenciaMorador[] = ocs.value.map((o: any) => ({
            id: o.id,
            titulo: o.titulo,
            descricao: o.descricao,
            categoria: o.categoria || 'OUTRO',
            status: o.status || 'ABERTO',
            resposta_sindico: o.resposta_sindico || o.resposta,
            foto_url: o.foto_url,
            created_at: o.created_at || new Date().toISOString(),
          }));
          setOcorrencias(mapped);
          localStorage.setItem('morador_ocorrencias', JSON.stringify(mapped));
        }

        if (rsvs.status === 'fulfilled' && Array.isArray(rsvs.value) && rsvs.value.length > 0) {
          const mapped: ReservaMorador[] = rsvs.value.map((r: any) => ({
            id: r.id,
            area_id: r.area_comum_id || r.area_id,
            area_nome: r.area_comum_nome || r.area_nome || 'Área Comum',
            data_reserva: r.data_reserva,
            periodo: r.periodo || 'NOITE',
            status: r.status || 'CONFIRMADO',
            convidados_estimados: r.quantidade_pessoas || r.convidados_estimados || 10,
            observacoes: r.observacoes,
            created_at: r.created_at || new Date().toISOString(),
          }));
          setReservas(mapped);
          localStorage.setItem('morador_reservas', JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Erro ao sincronizar com backend Neon:', err);
      }
    }
    fetchFromBackend();

    // Conexão WebSocket em tempo real para a Unidade
    const userBloco = userObj.bloco || 'A';
    const userApt = userObj.apartamento || '101';
    mobileSocket.connect(userBloco, userApt);
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

    // Canal BroadcastChannel em tempo real entre abas / dispositivos
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('condominio_realtime');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NOVA_ENCOMENDA') {
          const item = event.data.data;
          setLiveAlert({
            title: '📦 Nova Encomenda Recebida!',
            desc: `Pacote #${item.codigo_rastreio} (${item.transportadora}) registrado na portaria.`,
          });
          setEncomendas((prev) => [
            {
              id: item.id || `enc-${Date.now()}`,
              codigo_barras_qrcode: item.codigo_barras_qrcode || item.codigo_rastreio || `PKG-${Date.now()}`,
              codigo_rastreio: item.codigo_rastreio,
              transportadora: item.transportadora || 'Transportadora',
              descricao_pacote: item.descricao_pacote || item.descricao || '',
              status: 'AGUARDANDO_RETIRADA',
              data_recebimento: item.data_recebimento || item.data_chegada || new Date().toISOString(),
              porteiro_recebedor_nome: item.porteiro_recebedor_nome || 'Portaria',
            },
            ...prev,
          ]);
        }
      };
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

    return () => {
      clearInterval(interval);
      unsubPackage();
      unsubOc();
      if (channel) channel.close();
    };
  }, []);

  const handleConfirmWithdrawal = async (id: string, signatureUrl: string) => {
    const updated = encomendas.map((enc) => {
      if (enc.id === id) {
        return {
          ...enc,
          status: 'RETIRADO' as const,
          data_retirada: new Date().toISOString(),
          retirado_por_nome: `${currentUser.nome || 'Morador'} (App Morador)`,
          assinatura_digital_url: signatureUrl || undefined,
        };
      }
      return enc;
    });
    setEncomendas(updated);
    localStorage.setItem('morador_encomendas', JSON.stringify(updated));

    // Persistência Neon DB
    try {
      await mobileApi.retirarEntrega(id, {
        retirado_por_nome: `${currentUser.nome || 'Morador'} (App Morador)`,
        assinatura_digital_url: signatureUrl,
      });
    } catch (e) {
      console.warn('Erro ao confirmar retirada no Neon:', e);
    }
  };

  const handleAddConvite = async (novo: ConviteVisitante) => {
    const updated = [novo, ...convites];
    setConvites(updated);
    localStorage.setItem('morador_convites', JSON.stringify(updated));

    // Persistência Neon DB
    try {
      await mobileApi.createConvite({
        nome_completo: novo.nome_convidado,
        cpf: novo.documento,
        tipo: novo.tipo_visita,
        unidade_destino_bloco: currentUser.bloco || 'A',
        unidade_destino_numero: currentUser.apartamento || '101',
        observacoes: novo.observacoes,
      });
    } catch (e) {
      console.warn('Erro ao salvar convite no Neon:', e);
    }
  };

  const handleAddOcorrencia = async (nova: OcorrenciaMorador) => {
    const updated = [nova, ...ocorrencias];
    setOcorrencias(updated);
    localStorage.setItem('morador_ocorrencias', JSON.stringify(updated));

    // Persistência Neon DB
    try {
      await mobileApi.createOcorrencia({
        titulo: nova.titulo,
        descricao: nova.descricao,
        categoria: nova.categoria,
        foto_url: nova.foto_url,
        unidade_bloco: currentUser.bloco || 'A',
        unidade_numero: currentUser.apartamento || '101',
      });
    } catch (e) {
      console.warn('Erro ao salvar ocorrencia no Neon:', e);
    }
  };

  const handleAddReserva = async (nova: ReservaMorador) => {
    const updated = [nova, ...reservas];
    setReservas(updated);
    localStorage.setItem('morador_reservas', JSON.stringify(updated));

    // Persistência Neon DB
    try {
      await mobileApi.createReserva({
        area_id: nova.area_id,
        data_reserva: nova.data_reserva,
        periodo: nova.periodo,
        convidados_estimados: nova.convidados_estimados,
        observacoes: nova.observacoes,
        unidade_bloco: currentUser.bloco || 'A',
        unidade_numero: currentUser.apartamento || '101',
      });
    } catch (e) {
      console.warn('Erro ao salvar reserva no Neon:', e);
    }
  };

  const pendingCount = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA').length;
  const initials = (currentUser.nome || 'MF')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

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
            {initials || 'MO'}
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              {currentUser.nome || 'Morador'}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              Bloco {currentUser.bloco || 'A'} • Apto {currentUser.apartamento || 'S/N'}
            </p>
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
