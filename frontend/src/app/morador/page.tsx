'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  QrCode,
  Share2,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  LogOut,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Sparkles,
  X,
  Phone,
  MessageSquare,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Encomenda, StatusEntrega } from '@/lib/types';
import SoundEffects from '@/lib/SoundEffects';

interface Convite {
  id: string;
  nome_convidado: string;
  tipo: 'VISITA' | 'PRESTADOR' | 'FESTA';
  data: string;
  hora_inicio: string;
  hora_fim: string;
  token_qrcode: string;
  status: 'ATIVO' | 'UTILIZADO' | 'EXPIRADO';
  criado_em: string;
}

interface VeiculoMorador {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  tipo: 'CARRO' | 'MOTO';
}

export default function MoradorDashboardPage() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'encomendas' | 'convites' | 'veiculos' | 'lgpd'>('encomendas');

  // Encomendas da unidade
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [selectedEncomendaQr, setSelectedEncomendaQr] = useState<Encomenda | null>(null);

  // Convites com QR Code
  const [convites, setConvites] = useState<Convite[]>([]);
  const [isNovoConviteModalOpen, setIsNovoConviteModalOpen] = useState(false);
  const [selectedConviteQr, setSelectedConviteQr] = useState<Convite | null>(null);
  const [novoConvite, setNovoConvite] = useState({
    nome_convidado: '',
    tipo: 'VISITA' as 'VISITA' | 'PRESTADOR' | 'FESTA',
    data: new Date().toISOString().split('T')[0],
    hora_inicio: '14:00',
    hora_fim: '22:00',
  });

  // Veículos
  const [veiculos, setVeiculos] = useState<VeiculoMorador[]>([]);
  const [isNovoVeiculoModalOpen, setIsNovoVeiculoModalOpen] = useState(false);
  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '',
    modelo: '',
    cor: '',
    tipo: 'CARRO' as 'CARRO' | 'MOTO',
  });

  // Carrega dados da unidade do morador logado
  useEffect(() => {
    if (!currentUser) return;

    // Encomendas
    const savedEnc = localStorage.getItem('portaria_encomendas');
    if (savedEnc) {
      try {
        const allEnc: Encomenda[] = JSON.parse(savedEnc);
        const minhasEnc = allEnc.filter(
          (e) =>
            e.unidade_bloco === currentUser.unidade_bloco &&
            e.unidade_numero === currentUser.unidade_numero,
        );
        setEncomendas(minhasEnc);
      } catch (e) {
        console.error(e);
      }
    }

    // Convites
    const keyConvites = `morador_convites_${currentUser.unidade_bloco}_${currentUser.unidade_numero}`;
    const savedCnv = localStorage.getItem(keyConvites);
    if (savedCnv) {
      try {
        setConvites(JSON.parse(savedCnv));
      } catch (e) {
        console.error(e);
      }
    }

    // Veículos
    const keyVeiculos = `morador_veiculos_${currentUser.unidade_bloco}_${currentUser.unidade_numero}`;
    const savedVeic = localStorage.getItem(keyVeiculos);
    if (savedVeic) {
      try {
        setVeiculos(JSON.parse(savedVeic));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  // Salvar Convite
  const handleCriarConvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoConvite.nome_convidado.trim()) return;

    const token = `QR-${currentUser?.unidade_bloco}${currentUser?.unidade_numero}-${Date.now().toString().slice(-6)}`;
    const novo: Convite = {
      id: `cnv-${Date.now()}`,
      nome_convidado: novoConvite.nome_convidado.trim(),
      tipo: novoConvite.tipo,
      data: novoConvite.data,
      hora_inicio: novoConvite.hora_inicio,
      hora_fim: novoConvite.hora_fim,
      token_qrcode: token,
      status: 'ATIVO',
      criado_em: new Date().toISOString(),
    };

    const updated = [novo, ...convites];
    setConvites(updated);
    if (currentUser) {
      localStorage.setItem(
        `morador_convites_${currentUser.unidade_bloco}_${currentUser.unidade_numero}`,
        JSON.stringify(updated),
      );
    }
    setIsNovoConviteModalOpen(false);
    setNovoConvite({
      nome_convidado: '',
      tipo: 'VISITA',
      data: new Date().toISOString().split('T')[0],
      hora_inicio: '14:00',
      hora_fim: '22:00',
    });
    SoundEffects.playSuccess();
  };

  // Compartilhar WhatsApp
  const handleShareWhatsapp = (convite: Convite) => {
    const text = `🏢 *CONVITE DE ACESSO - CONDOMÍNIO JARDINS*\n\nOlá ${convite.nome_convidado}!\nVocê foi autorizado a visitar a unidade *Bloco ${currentUser?.unidade_bloco} - Apto ${currentUser?.unidade_numero}*.\n\n📅 Data: ${new Date(convite.data).toLocaleDateString('pt-BR')}\n⏰ Horário: ${convite.hora_inicio} às ${convite.hora_fim}\n🔑 Código de Acesso / Token: *${convite.token_qrcode}*\n\nBasta apresentar este código ou o QR Code na portaria principal.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Salvar Veículo
  const handleSalvarVeiculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoVeiculo.placa.trim() || !novoVeiculo.modelo.trim()) return;

    const novo: VeiculoMorador = {
      id: `v-${Date.now()}`,
      placa: novoVeiculo.placa.toUpperCase().trim(),
      modelo: novoVeiculo.modelo.trim(),
      cor: novoVeiculo.cor.trim(),
      tipo: novoVeiculo.tipo,
    };

    const updated = [...veiculos, novo];
    setVeiculos(updated);
    if (currentUser) {
      localStorage.setItem(
        `morador_veiculos_${currentUser.unidade_bloco}_${currentUser.unidade_numero}`,
        JSON.stringify(updated),
      );
    }
    setIsNovoVeiculoModalOpen(false);
    setNovoVeiculo({ placa: '', modelo: '', cor: '', tipo: 'CARRO' });
    SoundEffects.playSuccess();
  };

  // Métricas
  const pacotesPendentes = encomendas.filter((e) => e.status === 'AGUARDANDO_RETIRADA').length;
  const convitesAtivos = convites.filter((c) => c.status === 'ATIVO').length;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col pb-12">
      {/* Top Header do Morador */}
      <header className="h-20 bg-[#0F172A]/90 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">Portal do Morador</h2>
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[10px] font-extrabold">
                Bloco {currentUser?.unidade_bloco || 'A'} • Apto {currentUser?.unidade_numero || '101'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Condomínio Residencial Jardins</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-bold text-white">{currentUser?.nome_completo}</p>
              <p className="text-[10px] text-slate-400">{currentUser?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Banner de Boas-Vindas & Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Encomendas na Portaria</p>
              <h3 className="text-2xl font-black text-white mt-1">{pacotesPendentes}</h3>
              <p className="text-[11px] text-amber-400 mt-0.5 font-semibold">
                {pacotesPendentes === 1 ? '1 pacote aguardando' : `${pacotesPendentes} pacotes aguardando`}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950/50 border border-amber-800/40 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Convites de Visitantes</p>
              <h3 className="text-2xl font-black text-white mt-1">{convitesAtivos}</h3>
              <p className="text-[11px] text-cyan-400 mt-0.5 font-semibold">
                {convitesAtivos === 1 ? '1 convite ativo' : `${convitesAtivos} convites ativos`}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Veículos na Vaga</p>
              <h3 className="text-2xl font-black text-white mt-1">{veiculos.length}</h3>
              <p className="text-[11px] text-emerald-400 mt-0.5 font-semibold">Vaga Liberada</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center">
              <Car className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Barra de Navegação por Abas */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0F172A] border border-slate-800 rounded-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('encomendas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'encomendas'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Minhas Encomendas ({encomendas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('convites')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'convites'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Convites com QR Code ({convites.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('veiculos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'veiculos'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            Meus Veículos ({veiculos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lgpd')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'lgpd'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacidade & LGPD
          </button>
        </div>

        {/* ABA 1: MINHAS ENCOMENDAS */}
        {activeTab === 'encomendas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Histórico de Encomendas</h3>
                <p className="text-xs text-slate-400">Pacotes entregues e registrados pelos porteiros para a sua unidade.</p>
              </div>
            </div>

            {encomendas.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Nenhuma encomenda registrada no momento</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Assim que a portaria receber e bipar uma nova caixa ou envelope para o seu apartamento, ele aparecerá aqui com foto e QR Code de liberação.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {encomendas.map((enc) => (
                  <div
                    key={enc.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      enc.status === 'AGUARDANDO_RETIRADA'
                        ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-950/20'
                        : 'bg-slate-900/50 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{enc.transportadora}</h4>
                          <p className="text-[11px] font-mono text-slate-400">{enc.codigo_rastreio || enc.codigo_barras_qrcode}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          enc.status === 'AGUARDANDO_RETIRADA'
                            ? 'bg-amber-950 text-amber-300 border-amber-800/50'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                        }`}
                      >
                        {enc.status === 'AGUARDANDO_RETIRADA' ? 'Aguardando Retirada' : 'Entregue'}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <p className="font-semibold">{enc.descricao_pacote || 'Pacote Convencional'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Recebido em {new Date(enc.data_recebimento).toLocaleString('pt-BR')} por {enc.porteiro_recebedor_nome || 'Portaria'}
                      </p>
                    </div>

                    {enc.status === 'AGUARDANDO_RETIRADA' && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEncomendaQr(enc)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Exibir QR Code na Portaria
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: CONVITES COM QR CODE */}
        {activeTab === 'convites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Convites & Pré-Autorizações</h3>
                <p className="text-xs text-slate-400">Emita passes rápidos com QR Code para liberar seus convidados na portaria sem filas.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNovoConviteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Novo Convite
              </button>
            </div>

            {convites.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <QrCode className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Nenhum convite criado</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Crie autorizações para visitas familiares, entregadores ou prestadores de serviço e envie diretamente pelo WhatsApp.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {convites.map((cnv) => (
                  <div key={cnv.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{cnv.nome_convidado}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          {cnv.tipo}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ativo
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                      <p>📅 Data: {new Date(cnv.data).toLocaleDateString('pt-BR')}</p>
                      <p>⏰ Horário: {cnv.hora_inicio} às {cnv.hora_fim}</p>
                      <p className="text-cyan-300 font-bold">🔑 Token: {cnv.token_qrcode}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedConviteQr(cnv)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        Ver QR Code
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareWhatsapp(cnv)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: MEUS VEÍCULOS */}
        {activeTab === 'veiculos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Veículos Cadastrados na Unidade</h3>
                <p className="text-xs text-slate-400">Placas autorizadas para abertura automática dos portões da garagem.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNovoVeiculoModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Veículo
              </button>
            </div>

            {veiculos.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Nenhum veículo cadastrado</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Cadastre as placas dos carros ou motos da sua vaga para agilizar a entrada na portaria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {veiculos.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono px-2.5 py-1 bg-slate-950 border border-slate-700 text-cyan-300 rounded-lg">
                        {v.placa}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{v.tipo}</span>
                    </div>
                    <p className="text-xs font-bold text-white">{v.modelo}</p>
                    <p className="text-[11px] text-slate-400">Cor: {v.cor || 'Não informada'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 4: PRIVACIDADE & LGPD */}
        {activeTab === 'lgpd' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Conformidade LGPD (Lei nº 13.709/2018)</h3>
                <p className="text-xs text-slate-400">Seus direitos e controle de privacidade de dados.</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <p>
                <strong>Status do Consentimento:</strong> <span className="text-emerald-400 font-bold">ATIVO & AUDITADO</span>
              </p>
              <p>
                Os seus dados de cadastro, biometria e registros de encomendas são mantidos sob rígidos controles de segurança e isolamento por unidade (Row Level Security).
              </p>
              <p className="text-slate-400 text-[11px]">
                Você pode solicitar atualização, exportação ou anonimização dos seus dados pessoais entrando em contato com a administração do condomínio.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal QR Code de Encomenda */}
      {selectedEncomendaQr && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white">Apresentar na Portaria</h3>
              <button
                type="button"
                onClick={() => setSelectedEncomendaQr(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              {/* QR Code Simulado SVG */}
              <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center p-2 rounded-lg">
                <QrCode className="w-36 h-36 text-slate-950" />
                <span className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                  {selectedEncomendaQr.codigo_barras_qrcode}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-300">
              <p className="font-bold text-white">{selectedEncomendaQr.transportadora}</p>
              <p className="text-slate-400 text-[11px] mt-1">{selectedEncomendaQr.descricao_pacote}</p>
            </div>

            <p className="text-[11px] text-slate-400">
              Apresente este código para o porteiro escanear e liberar o seu pacote.
            </p>
          </div>
        </div>
      )}

      {/* Modal QR Code de Convite */}
      {selectedConviteQr && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white">QR Code de Autorização</h3>
              <button
                type="button"
                onClick={() => setSelectedConviteQr(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center p-2 rounded-lg">
                <QrCode className="w-36 h-36 text-cyan-950" />
                <span className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                  {selectedConviteQr.token_qrcode}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-300">
              <p className="font-bold text-white">{selectedConviteQr.nome_convidado}</p>
              <p className="text-slate-400 text-[11px] mt-1 font-mono">
                {new Date(selectedConviteQr.data).toLocaleDateString('pt-BR')} • {selectedConviteQr.hora_inicio} às {selectedConviteQr.hora_fim}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleShareWhatsapp(selectedConviteQr)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              Enviar pelo WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Modal Criar Novo Convite */}
      {isNovoConviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Criar Novo Convite com QR Code</h3>
              <button
                type="button"
                onClick={() => setIsNovoConviteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarConvite} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nome do Convidado / Prestador</label>
                <input
                  type="text"
                  required
                  value={novoConvite.nome_convidado}
                  onChange={(e) => setNovoConvite({ ...novoConvite, nome_convidado: e.target.value })}
                  placeholder="Ex: Carlos Mendes"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tipo de Acesso</label>
                <select
                  value={novoConvite.tipo}
                  onChange={(e) => setNovoConvite({ ...novoConvite, tipo: e.target.value as any })}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="VISITA">Visita Comum / Familiar</option>
                  <option value="PRESTADOR">Prestador de Serviço / Manutenção</option>
                  <option value="FESTA">Festa / Evento Social</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Data da Visita</label>
                <input
                  type="date"
                  required
                  value={novoConvite.data}
                  onChange={(e) => setNovoConvite({ ...novoConvite, data: e.target.value })}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Horário Início</label>
                  <input
                    type="time"
                    required
                    value={novoConvite.hora_inicio}
                    onChange={(e) => setNovoConvite({ ...novoConvite, hora_inicio: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Horário Término</label>
                  <input
                    type="time"
                    required
                    value={novoConvite.hora_fim}
                    onChange={(e) => setNovoConvite({ ...novoConvite, hora_fim: e.target.value })}
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Gerar Convite com QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Veículo */}
      {isNovoVeiculoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Cadastrar Veículo</h3>
              <button
                type="button"
                onClick={() => setIsNovoVeiculoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarVeiculo} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Placa do Veículo</label>
                <input
                  type="text"
                  required
                  value={novoVeiculo.placa}
                  onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })}
                  placeholder="Ex: ABC1E23"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Modelo</label>
                <input
                  type="text"
                  required
                  value={novoVeiculo.modelo}
                  onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                  placeholder="Ex: Jeep Compass"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Cor</label>
                  <input
                    type="text"
                    value={novoVeiculo.cor}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })}
                    placeholder="Ex: Prata"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Tipo</label>
                  <select
                    value={novoVeiculo.tipo}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, tipo: e.target.value as any })}
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="CARRO">Carro</option>
                    <option value="MOTO">Moto</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
