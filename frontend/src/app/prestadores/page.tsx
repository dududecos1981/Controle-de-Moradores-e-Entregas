'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HardHat,
  Wrench,
  Search,
  Plus,
  Filter,
  Car,
  Shield,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Camera,
  X,
  Sparkles,
  UserCheck,
  FileText,
  ShieldCheck,
  LogIn,
  LogOut,
  Briefcase,
  QrCode,
  Check,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { PrestadorServico, RegistroAcesso } from '@/lib/types';
import { INITIAL_PRESTADORES, INITIAL_UNIDADES, INITIAL_MORADORES } from '@/lib/store';
import WebcamCapture from '@/components/WebcamCapture';
import SoundEffects from '@/lib/SoundEffects';

const ESPECIALIDADES_COMUNS = [
  'Eletricista',
  'Encanador / Hidráulica',
  'Internet / Telecom',
  'Pintor',
  'Ar-Condicionado / Climatização',
  'Reforma & Obras',
  'Gás & Aquecedores',
  'Marcenaria / Móveis',
  'Limpeza & Faxina',
  'Vidraçaria / Esquadrias',
  'Dedetização',
  'Outro Serviço',
];

export default function PrestadoresPage() {
  const [prestadores, setPrestadores] = useState<PrestadorServico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'DENTRO' | 'LIBERADO' | 'CONCLUIDO'>('TODOS');
  const [especialidadeFilter, setEspecialidadeFilter] = useState('TODOS');

  // Modais
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPrestador, setSelectedPrestador] = useState<PrestadorServico | null>(null);
  const [editingPrestadorId, setEditingPrestadorId] = useState<string | null>(null);
  const [prestadorToDelete, setPrestadorToDelete] = useState<PrestadorServico | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    rg: '',
    telefone: '',
    empresa: '',
    especialidade: 'Eletricista',
    foto_url: '',
    placa_veiculo: '',
    modelo_veiculo: '',
    unidade_destino_bloco: 'A',
    unidade_destino_numero: '101',
    morador_responsavel: '',
    cracha_numero: '',
    observacoes: '',
  });

  // Inicialização com LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('portaria_prestadores');
    if (saved) {
      try {
        setPrestadores(JSON.parse(saved));
      } catch (e) {
        setPrestadores(INITIAL_PRESTADORES);
      }
    } else {
      setPrestadores(INITIAL_PRESTADORES);
      localStorage.setItem('portaria_prestadores', JSON.stringify(INITIAL_PRESTADORES));
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const savePrestadores = (updated: PrestadorServico[]) => {
    setPrestadores(updated);
    localStorage.setItem('portaria_prestadores', JSON.stringify(updated));
  };

  // Métricas
  const totalPrestadores = prestadores.length;
  const prestadoresDentro = prestadores.filter((p) => p.status_acesso === 'DENTRO').length;
  const servicosConcluidos = prestadores.filter((p) => p.status_acesso === 'CONCLUIDO').length;
  const totalEmpresas = new Set(prestadores.map((p) => p.empresa.toLowerCase())).size;

  // Filtragem
  const filteredPrestadores = prestadores.filter((p) => {
    const matchesSearch =
      p.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cpf && p.cpf.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.placa_veiculo && p.placa_veiculo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      `${p.unidade_destino_bloco} ${p.unidade_destino_numero}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' ? true : p.status_acesso === statusFilter;
    const matchesEsp = especialidadeFilter === 'TODOS' ? true : p.especialidade === especialidadeFilter;

    return matchesSearch && matchesStatus && matchesEsp;
  });

  // Abrir Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingPrestadorId(null);
    setFormData({
      nome_completo: '',
      cpf: '',
      rg: '',
      telefone: '',
      empresa: '',
      especialidade: 'Eletricista',
      foto_url: '',
      placa_veiculo: '',
      modelo_veiculo: '',
      unidade_destino_bloco: 'A',
      unidade_destino_numero: '101',
      morador_responsavel: '',
      cracha_numero: `CR-0${Math.floor(Math.random() * 89 + 10)}`,
      observacoes: '',
    });
    setIsCadastroModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (prestador: PrestadorServico) => {
    setEditingPrestadorId(prestador.id);
    setFormData({
      nome_completo: prestador.nome_completo,
      cpf: prestador.cpf || '',
      rg: prestador.rg || '',
      telefone: prestador.telefone || '',
      empresa: prestador.empresa,
      especialidade: prestador.especialidade,
      foto_url: prestador.foto_url || '',
      placa_veiculo: prestador.placa_veiculo || '',
      modelo_veiculo: prestador.modelo_veiculo || '',
      unidade_destino_bloco: prestador.unidade_destino_bloco,
      unidade_destino_numero: prestador.unidade_destino_numero,
      morador_responsavel: prestador.morador_responsavel || '',
      cracha_numero: prestador.cracha_numero || '',
      observacoes: prestador.observacoes || '',
    });
    setIsCadastroModalOpen(true);
  };

  // Registrar Entrada (Check-in)
  const handleCheckIn = (prestador: PrestadorServico) => {
    const nowHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updated = prestadores.map((p) => {
      if (p.id === prestador.id) {
        return {
          ...p,
          status_acesso: 'DENTRO' as const,
          hora_entrada: nowHora,
          hora_saida: undefined,
        };
      }
      return p;
    });
    savePrestadores(updated);

    // Registra no histórico de acessos
    const novoAcesso: RegistroAcesso = {
      id: `ac-${Date.now()}`,
      tipo_pessoa: 'PRESTADOR_SERVICO',
      nome: prestador.nome_completo,
      documento: prestador.cpf || prestador.rg,
      unidade_bloco: prestador.unidade_destino_bloco,
      unidade_numero: prestador.unidade_destino_numero,
      foto_url: prestador.foto_url,
      tipo_movimentacao: 'ENTRADA',
      data_hora: new Date().toISOString(),
      metodo_validacao: 'PORTARIA_MANUAL',
      empresa: prestador.empresa,
      servico_descricao: `${prestador.especialidade} - Entrada autorizada`,
      autorizado_por: prestador.morador_responsavel || 'Portaria',
      porteiro_responsavel: 'João Portaria',
      veiculo_placa: prestador.placa_veiculo,
    };

    const savedAcessos = localStorage.getItem('portaria_acessos');
    const acessosList: RegistroAcesso[] = savedAcessos ? JSON.parse(savedAcessos) : [];
    localStorage.setItem('portaria_acessos', JSON.stringify([novoAcesso, ...acessosList]));

    SoundEffects.playSuccess();
    showToast(`Entrada registrada para ${prestador.nome_completo} (${prestador.empresa}).`, 'success');
  };

  // Registrar Saída (Check-out)
  const handleCheckOut = (prestador: PrestadorServico) => {
    const nowHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updated = prestadores.map((p) => {
      if (p.id === prestador.id) {
        return {
          ...p,
          status_acesso: 'CONCLUIDO' as const,
          hora_saida: nowHora,
        };
      }
      return p;
    });
    savePrestadores(updated);

    // Registra no histórico de acessos
    const novoAcesso: RegistroAcesso = {
      id: `ac-${Date.now()}`,
      tipo_pessoa: 'PRESTADOR_SERVICO',
      nome: prestador.nome_completo,
      documento: prestador.cpf || prestador.rg,
      unidade_bloco: prestador.unidade_destino_bloco,
      unidade_numero: prestador.unidade_destino_numero,
      foto_url: prestador.foto_url,
      tipo_movimentacao: 'SAIDA',
      data_hora: new Date().toISOString(),
      metodo_validacao: 'PORTARIA_MANUAL',
      empresa: prestador.empresa,
      servico_descricao: `${prestador.especialidade} - Saída concluída`,
      autorizado_por: prestador.morador_responsavel || 'Portaria',
      porteiro_responsavel: 'João Portaria',
      veiculo_placa: prestador.placa_veiculo,
    };

    const savedAcessos = localStorage.getItem('portaria_acessos');
    const acessosList: RegistroAcesso[] = savedAcessos ? JSON.parse(savedAcessos) : [];
    localStorage.setItem('portaria_acessos', JSON.stringify([novoAcesso, ...acessosList]));

    SoundEffects.playAlert();
    showToast(`Saída concluída para ${prestador.nome_completo}. Crachá liberado.`, 'info');
  };

  // Salvar Prestador (Novo ou Edição)
  const handleSavePrestador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.empresa || !formData.unidade_destino_numero) {
      alert('Por favor, preencha Nome Completo, Empresa e Número da Unidade.');
      return;
    }

    if (editingPrestadorId) {
      // Atualização
      const updated = prestadores.map((p) => {
        if (p.id === editingPrestadorId) {
          return {
            ...p,
            ...formData,
            placa_veiculo: formData.placa_veiculo ? formData.placa_veiculo.toUpperCase().trim() : undefined,
          };
        }
        return p;
      });
      savePrestadores(updated);
      SoundEffects.playSuccess();
      showToast(`Dados de "${formData.nome_completo}" atualizados com sucesso!`, 'success');
    } else {
      // Novo
      const nowHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const novo: PrestadorServico = {
        id: `prest-${Date.now()}`,
        ...formData,
        placa_veiculo: formData.placa_veiculo ? formData.placa_veiculo.toUpperCase().trim() : undefined,
        status_acesso: 'DENTRO',
        hora_entrada: nowHora,
        data_cadastro: new Date().toISOString(),
      };
      savePrestadores([novo, ...prestadores]);

      // Registra entrada no feed de acessos
      const novoAcesso: RegistroAcesso = {
        id: `ac-${Date.now()}`,
        tipo_pessoa: 'PRESTADOR_SERVICO',
        nome: novo.nome_completo,
        documento: novo.cpf || novo.rg,
        unidade_bloco: novo.unidade_destino_bloco,
        unidade_numero: novo.unidade_destino_numero,
        foto_url: novo.foto_url,
        tipo_movimentacao: 'ENTRADA',
        data_hora: new Date().toISOString(),
        metodo_validacao: 'PORTARIA_MANUAL',
        empresa: novo.empresa,
        servico_descricao: `${novo.especialidade} (Início do Serviço)`,
        autorizado_por: novo.morador_responsavel || 'Portaria',
        porteiro_responsavel: 'João Portaria',
        veiculo_placa: novo.placa_veiculo,
      };
      const savedAcessos = localStorage.getItem('portaria_acessos');
      const acessosList: RegistroAcesso[] = savedAcessos ? JSON.parse(savedAcessos) : [];
      localStorage.setItem('portaria_acessos', JSON.stringify([novoAcesso, ...acessosList]));

      SoundEffects.playSuccess();
      showToast(`Prestador "${novo.nome_completo}" cadastrado e liberado para entrada!`, 'success');
    }

    setIsCadastroModalOpen(false);
  };

  // Excluir Prestador
  const handleOpenDeleteModal = (prestador: PrestadorServico) => {
    setPrestadorToDelete(prestador);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!prestadorToDelete) return;
    const updated = prestadores.filter((p) => p.id !== prestadorToDelete.id);
    savePrestadores(updated);
    SoundEffects.playAlert();
    showToast(`Prestador "${prestadorToDelete.nome_completo}" foi excluído.`, 'alert');
    setIsDeleteModalOpen(false);
    setPrestadorToDelete(null);
  };

  // Abrir Crachá / Badge
  const handleOpenBadge = (prestador: PrestadorServico) => {
    setSelectedPrestador(prestador);
    setIsBadgeModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60'
                : toastMessage.type === 'alert'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700/60'
                : 'bg-indigo-950/90 text-indigo-200 border-indigo-700/60'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : toastMessage.type === 'alert' ? (
              <Trash2 className="w-4 h-4 text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            )}
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Gestão de Prestadores de Serviço
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <HardHat className="w-3.5 h-3.5" />
              Controle de Obras & Manutenção
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Cadastro de técnicos, controle de entrada/saída, crachás digitais e autorizações de unidades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo Prestador de Serviço
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Presentes no Prédio
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{prestadoresDentro}</span>
            <span className="text-xs text-slate-400 font-medium">técnicos em atendimento</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Total Cadastrados</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalPrestadores}</span>
            <span className="text-xs text-slate-400 font-medium">prestadores na base</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Empresas Parceiras</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalEmpresas}</span>
            <span className="text-xs text-slate-400 font-medium">empresas registradas</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Serviços Concluídos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{servicosConcluidos}</span>
            <span className="text-xs text-slate-400 font-medium">saídas registradas</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, empresa, especialidade, unidade ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="DENTRO">Presente no Prédio</option>
            <option value="LIBERADO">Liberado / Aguardando</option>
            <option value="CONCLUIDO">Serviço Concluído</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
            <span>Especialidade:</span>
          </div>
          <select
            value={especialidadeFilter}
            onChange={(e) => setEspecialidadeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todas Especialidades</option>
            {ESPECIALIDADES_COMUNS.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Prestadores de Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrestadores.map((prestador) => (
          <div
            key={prestador.id}
            className={`bg-[#111827] border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group ${
              prestador.status_acesso === 'DENTRO'
                ? 'border-amber-500/50 shadow-amber-500/5'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-md shadow-amber-500/20 shrink-0 overflow-hidden">
                    {prestador.foto_url ? (
                      <img
                        src={prestador.foto_url}
                        alt={prestador.nome_completo}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-sm">
                        {prestador.nome_completo.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {prestador.nome_completo}
                    </h3>
                    <p className="text-xs font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-amber-400/80" />
                      {prestador.empresa}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    prestador.status_acesso === 'DENTRO'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800/50'
                      : prestador.status_acesso === 'CONCLUIDO'
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-cyan-950 text-cyan-400 border-cyan-800/40'
                  }`}
                >
                  {prestador.status_acesso === 'DENTRO' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                  {prestador.status_acesso}
                </span>
              </div>

              {/* Informações de Destino e Serviço */}
              <div className="mt-4 space-y-2 py-3 border-y border-slate-800/60 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-500" />
                    Especialidade:
                  </span>
                  <span className="text-slate-200 font-semibold">{prestador.especialidade}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    Unidade Destino:
                  </span>
                  <span className="text-slate-200 font-bold">
                    Bloco {prestador.unidade_destino_bloco} • Apto {prestador.unidade_destino_numero}
                  </span>
                </div>

                {prestador.morador_responsavel && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Autorizado por:
                    </span>
                    <span className="text-slate-300 truncate max-w-[150px]">{prestador.morador_responsavel}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Contato:
                  </span>
                  <span className="font-mono text-slate-300">{prestador.telefone || 'Não informado'}</span>
                </div>

                {prestador.placa_veiculo && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      Veículo:
                    </span>
                    <span className="font-mono text-slate-300">
                      {prestador.placa_veiculo} {prestador.modelo_veiculo ? `(${prestador.modelo_veiculo})` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Horários / Crachá */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Entrada: {prestador.hora_entrada || '--:--'}</span>
                  {prestador.hora_saida && <span>• Saída: {prestador.hora_saida}</span>}
                </div>
                {prestador.cracha_numero && (
                  <span className="font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-amber-300">
                    {prestador.cracha_numero}
                  </span>
                )}
              </div>
            </div>

            {/* Ações do Card */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
              {prestador.status_acesso === 'DENTRO' ? (
                <button
                  onClick={() => handleCheckOut(prestador)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Registrar Saída
                </button>
              ) : (
                <button
                  onClick={() => handleCheckIn(prestador)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-800/50 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Registrar Entrada
                </button>
              )}

              <button
                onClick={() => handleOpenBadge(prestador)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                title="Visualizar Crachá de Acesso"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                onClick={() => handleOpenEditModal(prestador)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                title="Editar Dados do Prestador"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleOpenDeleteModal(prestador)}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-800/40 transition-colors"
                title="Excluir Prestador"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrestadores.length === 0 && (
        <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-2xl">
          <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhum prestador de serviço encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">
            Ajuste os filtros de busca ou clique no botão acima para cadastrar um novo prestador.
          </p>
        </div>
      )}

      {/* MODAL 1: Cadastro e Edição de Prestador */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingPrestadorId ? 'Editar Prestador de Serviço' : 'Novo Prestador de Serviço'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cadastre a empresa, técnico, veículo e autorização da unidade.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCadastroModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePrestador} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Seção 1: Dados do Profissional & Empresa */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  1. Dados do Técnico & Empresa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Nome Completo do Prestador *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Ferreira"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Empresa Prestadora / Razão Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: EletroFix Instalações / Enel / Claro"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Especialidade / Tipo de Serviço</label>
                    <select
                      value={formData.especialidade}
                      onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {ESPECIALIDADES_COMUNS.map((esp) => (
                        <option key={esp} value={esp}>
                          {esp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CPF do Técnico</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Unidade Destino & Autorização */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  2. Unidade de Atendimento & Autorização
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Bloco</label>
                    <select
                      value={formData.unidade_destino_bloco}
                      onChange={(e) => setFormData({ ...formData, unidade_destino_bloco: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="A">Bloco A</option>
                      <option value="B">Bloco B</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Número da Unidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 101, PH01"
                      value={formData.unidade_destino_numero}
                      onChange={(e) => setFormData({ ...formData, unidade_destino_numero: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Crachá da Portaria</label>
                    <input
                      type="text"
                      placeholder="Ex: CR-042"
                      value={formData.cracha_numero}
                      onChange={(e) => setFormData({ ...formData, cracha_numero: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-xs font-semibold text-slate-300">Morador Responsável / Autorizador</label>
                    <input
                      type="text"
                      placeholder="Ex: Roberto Albuquerque (Síndico) ou Mariana Fernandes"
                      value={formData.morador_responsavel}
                      onChange={(e) => setFormData({ ...formData, morador_responsavel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Veículo do Prestador */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  3. Veículo de Serviço (Opcional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Placa do Veículo</label>
                    <input
                      type="text"
                      placeholder="Ex: ABC1D23"
                      value={formData.placa_veiculo}
                      onChange={(e) => setFormData({ ...formData, placa_veiculo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 uppercase font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Modelo e Cor</label>
                    <input
                      type="text"
                      placeholder="Ex: Fiat Fiorino Branca"
                      value={formData.modelo_veiculo}
                      onChange={(e) => setFormData({ ...formData, modelo_veiculo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Foto Biométrica */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  4. Foto Biométrica / Identificação
                </h4>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.foto_url ? (
                      <img src={formData.foto_url} alt="Foto Prestador" className="w-full h-full object-cover" />
                    ) : (
                      <HardHat className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setIsWebcamOpen(true)}
                      className="flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-colors w-full sm:w-auto"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capturar Foto via Webcam
                    </button>
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem..."
                      value={formData.foto_url}
                      onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 5: Observações */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Observações & Escopo do Serviço</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Troca de fiação, reparo hidráulico, ferramentas autorizadas..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCadastroModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all"
                >
                  {editingPrestadorId ? 'Salvar Alterações' : 'Cadastrar & Liberar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Crachá Digital de Acesso */}
      {isBadgeModalOpen && selectedPrestador && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsBadgeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Visual do Crachá */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 text-center shadow-xl relative overflow-hidden">
              <div className="w-full py-1 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-md mb-4">
                CRACHÁ DE PRESTADOR DE SERVIÇO
              </div>

              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-1 shadow-lg overflow-hidden mb-3">
                {selectedPrestador.foto_url ? (
                  <img
                    src={selectedPrestador.foto_url}
                    alt={selectedPrestador.nome_completo}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-2xl">
                    {selectedPrestador.nome_completo.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="text-base font-black text-white">{selectedPrestador.nome_completo}</h3>
              <p className="text-xs font-bold text-amber-400">{selectedPrestador.empresa}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{selectedPrestador.especialidade}</p>

              <div className="mt-4 py-2 px-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Destino:</span>
                  <strong className="text-white">
                    Bloco {selectedPrestador.unidade_destino_bloco} - Apto {selectedPrestador.unidade_destino_numero}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Crachá:</span>
                  <strong className="font-mono text-amber-400">{selectedPrestador.cracha_numero || 'CR-000'}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Entrada:</span>
                  <strong className="text-slate-300">{selectedPrestador.hora_entrada || '--:--'}</strong>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portaria Pro • Validação Segura</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl w-full justify-center transition-colors"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                Imprimir Crachá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirmação de Exclusão */}
      {isDeleteModalOpen && prestadorToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-black text-white">Excluir Prestador de Serviço?</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Tem certeza que deseja remover o cadastro de{' '}
              <strong className="text-white">{prestadorToDelete.nome_completo}</strong> da empresa{' '}
              <strong className="text-amber-400">{prestadorToDelete.empresa}</strong>?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WEBCAM */}
      {isWebcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsWebcamOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              Captura Biométrica / Foto do Prestador
            </h3>
            <WebcamCapture
              onPhotoCaptured={(dataUrl) => {
                setFormData({ ...formData, foto_url: dataUrl });
                setIsWebcamOpen(false);
              }}
              currentPhotoUrl={formData.foto_url}
            />
          </div>
        </div>
      )}
    </div>
  );
}
