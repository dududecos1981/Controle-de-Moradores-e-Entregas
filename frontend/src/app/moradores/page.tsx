'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Filter,
  Car,
  Shield,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  UserX,
  Camera,
  X,
  Sparkles,
  Package,
  UserCheck,
  FileText,
  ChevronRight,
  ShieldCheck,
  Lock,
  HeartHandshake,
  UserPlus,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Morador, Veiculo, Dependente, ContatoEmergencia, StatusEntrega } from '@/lib/types';
import { INITIAL_MORADORES, INITIAL_ENCOMENDAS, INITIAL_VISITANTES } from '@/lib/store';
import { api } from '@/lib/api';
import WebcamCapture from '@/components/WebcamCapture';
import SoundEffects from '@/lib/SoundEffects';

export default function MoradoresPage() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [blocoFilter, setBlocoFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  
  // Modais
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moradorToDelete, setMoradorToDelete] = useState<Morador | null>(null);
  const [deleteActionType, setDeleteActionType] = useState<'excluir' | 'anonimizar'>('excluir');
  const [deleteReason, setDeleteReason] = useState('Solicitação de descredenciamento da unidade');
  const [selectedMorador, setSelectedMorador] = useState<Morador | null>(null);
  const [editingMoradorId, setEditingMoradorId] = useState<string | null>(null);
  const [activeTabPerfil, setActiveTabPerfil] = useState<'cadastrais' | 'veiculos' | 'encomendas' | 'visitas'>('cadastrais');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    unidade_bloco: 'A',
    unidade_numero: '',
    perfil: 'MORADOR' as 'MORADOR' | 'SINDICO' | 'PORTEIRO' | 'ADMINISTRADOR',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'PENDENTE_APROVACAO',
    avatar_url: '',
    observacoes: '',
    lgpd_termo_aceito: true,
  });

  // Listas do formulário
  const [veiculosList, setVeiculosList] = useState<Veiculo[]>([]);
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: '', modelo: '', cor: '', tipo: 'CARRO' as const, vaga: '' });

  const [dependentesList, setDependentesList] = useState<Dependente[]>([]);
  const [novoDependente, setNovoDependente] = useState({ nome: '', parentesco: 'Cônjuge', cpf: '', data_nascimento: '' });

  const [contatosEmergenciaList, setContatosEmergenciaList] = useState<ContatoEmergencia[]>([]);
  const [novoContato, setNovoContato] = useState({ nome: '', telefone: '', parentesco: 'Familiar' });

  const [encomendasList, setEncomendasList] = useState<any[]>([]);
  const [visitantesList, setVisitantesList] = useState<any[]>([]);

  // Inicialização com LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('portaria_moradores');
    if (saved) {
      try {
        setMoradores(JSON.parse(saved));
      } catch (e) {
        setMoradores([]);
      }
    } else {
      setMoradores([]);
    }

    const savedEnc = localStorage.getItem('portaria_encomendas');
    if (savedEnc) {
      try { setEncomendasList(JSON.parse(savedEnc)); } catch (e) { setEncomendasList([]); }
    }
    const savedVis = localStorage.getItem('portaria_visitantes');
    if (savedVis) {
      try { setVisitantesList(JSON.parse(savedVis)); } catch (e) { setVisitantesList([]); }
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const saveMoradores = (updated: Morador[]) => {
    setMoradores(updated);
    localStorage.setItem('portaria_moradores', JSON.stringify(updated));
  };

  // Métricas
  const totalMoradores = moradores.filter((m) => !m.lgpd_anonimizado).length;
  const totalVeiculos = moradores.reduce((acc, m) => acc + (m.veiculos?.length || 0), 0);
  const unidadesOcupadas = new Set(moradores.map((m) => `${m.unidade_bloco}-${m.unidade_numero}`)).size;
  const totalLgpdOk = moradores.filter((m) => m.lgpd_termo_aceito && !m.lgpd_anonimizado).length;

  // Filtragem
  const filteredMoradores = moradores.filter((m) => {
    if (m.lgpd_anonimizado) return false;
    const matchesSearch =
      m.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${m.unidade_bloco} ${m.unidade_numero}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.veiculos && m.veiculos.some((v) => v.placa.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesBloco = blocoFilter === 'TODOS' ? true : m.unidade_bloco === blocoFilter;
    const matchesStatus = statusFilter === 'TODOS' ? true : m.status === statusFilter;

    return matchesSearch && matchesBloco && matchesStatus;
  });

  // Abertura de Cadastro / Edição
  const handleOpenCreateModal = () => {
    setEditingMoradorId(null);
    setFormData({
      nome_completo: '',
      cpf: '',
      email: '',
      telefone: '',
      unidade_bloco: '',
      unidade_numero: '',
      perfil: 'MORADOR',
      status: 'ATIVO',
      avatar_url: '',
      observacoes: '',
      lgpd_termo_aceito: true,
    });
    setVeiculosList([]);
    setDependentesList([]);
    setContatosEmergenciaList([]);
    setIsCadastroModalOpen(true);
  };

  const handleOpenEditModal = (morador: Morador) => {
    setEditingMoradorId(morador.id);
    setFormData({
      nome_completo: morador.nome_completo,
      cpf: morador.cpf,
      email: morador.email,
      telefone: morador.telefone,
      unidade_bloco: morador.unidade_bloco,
      unidade_numero: morador.unidade_numero,
      perfil: morador.perfil as any,
      status: morador.status || 'ATIVO',
      avatar_url: morador.avatar_url || '',
      observacoes: morador.observacoes || '',
      lgpd_termo_aceito: morador.lgpd_termo_aceito,
    });
    setVeiculosList(morador.veiculos || []);
    setDependentesList(morador.dependentes || []);
    setContatosEmergenciaList(morador.contatos_emergencia || []);
    setIsCadastroModalOpen(true);
  };

  // Manipulação de Veículos
  const handleAddVeiculo = () => {
    if (!novoVeiculo.placa || !novoVeiculo.modelo) {
      alert('Preencha a Placa e o Modelo do veículo.');
      return;
    }
    const v: Veiculo = {
      id: `v-${Date.now()}`,
      placa: novoVeiculo.placa.toUpperCase().trim(),
      modelo: novoVeiculo.modelo.trim(),
      cor: novoVeiculo.cor || 'Não informada',
      tipo: novoVeiculo.tipo || 'CARRO',
      vaga: novoVeiculo.vaga || undefined,
    };
    setVeiculosList([...veiculosList, v]);
    setNovoVeiculo({ placa: '', modelo: '', cor: '', tipo: 'CARRO', vaga: '' });
  };

  const handleRemoveVeiculo = (id: string) => {
    setVeiculosList(veiculosList.filter((v) => v.id !== id));
  };

  // Manipulação de Dependentes
  const handleAddDependente = () => {
    if (!novoDependente.nome) {
      alert('Informe o nome do dependente.');
      return;
    }
    const dep: Dependente = {
      id: `dep-${Date.now()}`,
      nome: novoDependente.nome.trim(),
      parentesco: novoDependente.parentesco || 'Outro',
      cpf: novoDependente.cpf || undefined,
      data_nascimento: novoDependente.data_nascimento || undefined,
    };
    setDependentesList([...dependentesList, dep]);
    setNovoDependente({ nome: '', parentesco: 'Cônjuge', cpf: '', data_nascimento: '' });
  };

  const handleRemoveDependente = (id: string) => {
    setDependentesList(dependentesList.filter((d) => d.id !== id));
  };

  // Manipulação de Contatos de Emergência
  const handleAddContatoEmergencia = () => {
    if (!novoContato.nome || !novoContato.telefone) {
      alert('Informe Nome e Telefone para o contato de emergência.');
      return;
    }
    const contato: ContatoEmergencia = {
      nome: novoContato.nome.trim(),
      telefone: novoContato.telefone.trim(),
      parentesco: novoContato.parentesco || 'Familiar',
    };
    setContatosEmergenciaList([...contatosEmergenciaList, contato]);
    setNovoContato({ nome: '', telefone: '', parentesco: 'Familiar' });
  };

  const handleRemoveContatoEmergencia = (index: number) => {
    setContatosEmergenciaList(contatosEmergenciaList.filter((_, i) => i !== index));
  };

  // Limpar Avatar / Foto
  const handleClearAvatar = () => {
    setFormData({ ...formData, avatar_url: '' });
  };

  // Salvar (Criar ou Atualizar)
  const handleSaveMorador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.cpf || !formData.unidade_numero) {
      alert('Por favor, preencha Nome Completo, CPF e Número da Unidade.');
      return;
    }

    if (editingMoradorId) {
      // Atualizar existente
      const updated = moradores.map((m) => {
        if (m.id === editingMoradorId) {
          const updatedMorador: Morador = {
            ...m,
            ...formData,
            veiculos: veiculosList,
            dependentes: dependentesList,
            contatos_emergencia: contatosEmergenciaList,
          };
          return updatedMorador;
        }
        return m;
      });
      saveMoradores(updated);

      // Atualiza também o selecionado se o modal de perfil estiver aberto
      if (selectedMorador && selectedMorador.id === editingMoradorId) {
        setSelectedMorador({
          ...selectedMorador,
          ...formData,
          veiculos: veiculosList,
          dependentes: dependentesList,
          contatos_emergencia: contatosEmergenciaList,
        });
      }

      // Tenta sincronizar com a API se disponível
      try {
        await api.updateMorador(editingMoradorId, {
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          email: formData.email,
          perfil: formData.perfil,
          status: formData.status,
          avatar_url: formData.avatar_url,
        });
      } catch (err) {
        // Modo offline / mock local
      }

      SoundEffects.playSuccess();
      showToast(`Cadastro de "${formData.nome_completo}" atualizado com sucesso!`, 'success');
    } else {
      // Criar novo
      const novo: Morador = {
        id: `mor-${Date.now()}`,
        unidade_id: `u-${Date.now()}`,
        ...formData,
        is_responsavel_unidade: true,
        data_cadastro: new Date().toISOString(),
        veiculos: veiculosList,
        dependentes: dependentesList,
        contatos_emergencia: contatosEmergenciaList,
        lgpd_data_aceite: new Date().toISOString(),
        lgpd_anonimizado: false,
      };
      saveMoradores([novo, ...moradores]);

      try {
        await api.createMorador(novo);
      } catch (err) {
        // Modo offline / mock local
      }

      SoundEffects.playSuccess();
      showToast(`Morador "${novo.nome_completo}" cadastrado com sucesso!`, 'success');
    }

    setIsCadastroModalOpen(false);
  };

  // Abrir Modal de Exclusão
  const handleOpenDeleteModal = (morador: Morador, actionType: 'excluir' | 'anonimizar' = 'excluir') => {
    setMoradorToDelete(morador);
    setDeleteActionType(actionType);
    setDeleteReason(
      actionType === 'excluir'
        ? 'Descredenciamento / Mudança de endereço do morador'
        : 'Solicitação expressa do titular conforme Art. 18 da LGPD',
    );
    setIsDeleteModalOpen(true);
  };

  // Confirmar Exclusão ou Anonimização
  const handleConfirmDelete = async () => {
    if (!moradorToDelete) return;

    if (deleteActionType === 'excluir') {
      // Exclusão definitiva
      const updated = moradores.filter((m) => m.id !== moradorToDelete.id);
      saveMoradores(updated);

      try {
        await api.deleteMorador(moradorToDelete.id);
      } catch (err) {
        // Offline / mock
      }

      SoundEffects.playAlert();
      showToast(`Morador "${moradorToDelete.nome_completo}" foi excluído definitivamente do sistema.`, 'alert');
    } else {
      // Anonimização LGPD
      const updated = moradores.map((m) => {
        if (m.id === moradorToDelete.id) {
          return {
            ...m,
            nome_completo: `TITULAR_ANONIMIZADO_${m.id.substring(0, 6)}`,
            cpf: `ANONIMIZADO_${m.id.substring(0, 6)}`,
            email: `anonimizado_${m.id.substring(0, 6)}@lgpd.local`,
            telefone: '(00) 00000-0000',
            avatar_url: undefined,
            veiculos: [],
            dependentes: [],
            contatos_emergencia: [],
            status: 'INATIVO' as const,
            lgpd_anonimizado: true,
          };
        }
        return m;
      });
      saveMoradores(updated);

      try {
        await api.anonimizarMorador(moradorToDelete.id, deleteReason);
      } catch (err) {
        // Offline / mock
      }

      SoundEffects.playAlert();
      showToast(`Dados de "${moradorToDelete.nome_completo}" foram anonimizados conforme LGPD Art. 18.`, 'info');
    }

    if (selectedMorador?.id === moradorToDelete.id) {
      setIsPerfilModalOpen(false);
      setSelectedMorador(null);
    }

    setIsDeleteModalOpen(false);
    setMoradorToDelete(null);
  };

  // Visualização de Perfil
  const handleViewPerfil = (morador: Morador) => {
    setSelectedMorador(morador);
    setActiveTabPerfil('cadastrais');
    setIsPerfilModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Flutuante */}
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
            Gestão de Moradores & Residentes
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
              CRUD Completo & LGPD
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Cadastro, edição detalhada, exclusão segura e gestão de privacidade LGPD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/comunicados-ia"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Criar Comunicado IA
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo Morador
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Total Moradores</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalMoradores}</span>
            <span className="text-xs text-slate-400 font-medium">titulares cadastrados</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Unidades Ocupadas</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{unidadesOcupadas}</span>
            <span className="text-xs text-slate-400 font-medium">apartamentos</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Veículos Registrados</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalVeiculos}</span>
            <span className="text-xs text-slate-400 font-medium">carros e motos</span>
          </div>
        </div>

        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Conformidade LGPD</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">100%</span>
            <span className="text-xs text-slate-400 font-medium">termos aceitos</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, unidade (Apto 101) ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Bloco:</span>
          </div>
          <select
            value={blocoFilter}
            onChange={(e) => setBlocoFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Blocos</option>
            {Array.from(new Set(moradores.map((m) => m.unidade_bloco).filter(Boolean))).map((b) => (
              <option key={b} value={b}>
                {b.toLowerCase().includes('bloco') || b.toLowerCase().includes('torre') || b.toLowerCase().includes('quadra') ? b : `Bloco ${b}`}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
            <option value="PENDENTE_APROVACAO">Pendente</option>
          </select>
        </div>
      </div>

      {/* Grid de Moradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMoradores.map((morador) => (
          <div
            key={morador.id}
            className="bg-[#111827] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden">
                    {morador.avatar_url ? (
                      <img
                        src={morador.avatar_url}
                        alt={morador.nome_completo}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-sm">
                        {morador.nome_completo.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {morador.nome_completo}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        Bloco {morador.unidade_bloco} • Apto {morador.unidade_numero}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      morador.perfil === 'SINDICO'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                        : morador.perfil === 'ADMINISTRADOR'
                        ? 'bg-purple-950/60 text-purple-400 border-purple-800/40'
                        : 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40'
                    }`}
                  >
                    {morador.perfil}
                  </span>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                      morador.status === 'ATIVO'
                        ? 'bg-emerald-950/50 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {morador.status}
                  </span>
                </div>
              </div>

              {/* Informações de Contato e Documentos */}
              <div className="mt-4 space-y-2 py-3 border-y border-slate-800/60 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Telefone:
                  </span>
                  <span className="font-mono text-slate-200">{morador.telefone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    E-mail:
                  </span>
                  <span className="text-slate-300 truncate max-w-[160px]">{morador.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    CPF:
                  </span>
                  <span className="font-mono text-slate-300">{morador.cpf}</span>
                </div>
              </div>

              {/* Veículos Cadastrados */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-cyan-400" />
                    Veículos ({morador.veiculos?.length || 0})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {morador.veiculos && morador.veiculos.length > 0 ? (
                    morador.veiculos.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-mono bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded text-slate-300"
                      >
                        {v.placa} ({v.modelo})
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Nenhum veículo cadastrado</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ações do Card */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
              <button
                onClick={() => handleViewPerfil(morador)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Ver Perfil
              </button>
              <button
                onClick={() => handleOpenEditModal(morador)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                title="Editar Cadastro do Morador"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => handleOpenDeleteModal(morador, 'excluir')}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-800/40 transition-colors"
                title="Excluir Morador Definitivamente"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleOpenDeleteModal(morador, 'anonimizar')}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400/80 hover:text-amber-400 rounded-xl border border-slate-700 transition-colors"
                title="Anonimizar Dados (LGPD Art. 18)"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMoradores.length === 0 && (
        <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhum morador encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de busca ou cadastre um novo morador.</p>
        </div>
      )}

      {/* MODAL 1: Cadastro e Edição Completa de Morador */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {editingMoradorId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingMoradorId ? 'Editar Cadastro de Morador' : 'Novo Cadastro de Morador'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Altere dados cadastrais, exclua ou adicione veículos, dependentes e foto biométrica.
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
            <form onSubmit={handleSaveMorador} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Seção 1: Dados Pessoais & Unidade */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  1. Dados Pessoais & Localização
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Fernandes"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CPF *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">E-mail</label>
                    <input
                      type="email"
                      placeholder="morador@condominio.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Perfil de Acesso</label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MORADOR">Morador</option>
                      <option value="SINDICO">Síndico / Gestor</option>
                      <option value="PORTEIRO">Porteiro / Recepção</option>
                      <option value="ADMINISTRADOR">Administrador</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Status do Cadastro</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                      <option value="BLOQUEADO">Bloqueado</option>
                      <option value="PENDENTE_APROVACAO">Pendente Aprovação</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Bloco / Torre / Quadra *</label>
                    <input
                      type="text"
                      required
                      list="moradores-blocos-list"
                      placeholder="Ex: Bloco A, Torre 1, Quadra B"
                      value={formData.unidade_bloco}
                      onChange={(e) => setFormData({ ...formData, unidade_bloco: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <datalist id="moradores-blocos-list">
                      <option value="Bloco A" />
                      <option value="Bloco B" />
                      <option value="Bloco C" />
                      <option value="Bloco D" />
                      <option value="Torre 1" />
                      <option value="Torre 2" />
                      <option value="Torre 3" />
                      <option value="Torre Norte" />
                      <option value="Torre Sul" />
                      <option value="Quadra 1" />
                      <option value="Quadra 2" />
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Número da Unidade (Apto/Casa) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 101, 204, PH01"
                      value={formData.unidade_numero}
                      onChange={(e) => setFormData({ ...formData, unidade_numero: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Foto Biométrica / Facial */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    2. Foto Biométrica Facial
                  </h4>
                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={handleClearAvatar}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Foto Morador" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setIsWebcamOpen(true)}
                      className="flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors w-full sm:w-auto"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capturar Foto via Webcam
                    </button>
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem..."
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Veículos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  3. Veículos da Unidade ({veiculosList.length})
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Placa (BRA2E19)"
                    value={novoVeiculo.placa}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 uppercase font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Modelo (Jeep)"
                    value={novoVeiculo.modelo}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Cor (Cinza)"
                    value={novoVeiculo.cor}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Vaga (V-101)"
                    value={novoVeiculo.vaga}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, vaga: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddVeiculo}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl px-3 py-1.5 transition-colors col-span-2 sm:col-span-1"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {veiculosList.map((v) => (
                    <span
                      key={v.id}
                      className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono"
                    >
                      {v.placa} - {v.modelo} {v.vaga ? `(Vaga: ${v.vaga})` : ''}
                      <button
                        type="button"
                        onClick={() => handleRemoveVeiculo(v.id)}
                        className="text-rose-400 hover:text-rose-300 ml-1 p-0.5"
                        title="Excluir Veículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {veiculosList.length === 0 && (
                    <span className="text-xs text-slate-500 italic">Nenhum veículo associado.</span>
                  )}
                </div>
              </div>

              {/* Seção 4: Dependentes & Familiares */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  4. Dependentes & Familiares da Unidade ({dependentesList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Dependente"
                    value={novoDependente.nome}
                    onChange={(e) => setNovoDependente({ ...novoDependente, nome: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Parentesco (Cônjuge, Filho)"
                    value={novoDependente.parentesco}
                    onChange={(e) => setNovoDependente({ ...novoDependente, parentesco: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="CPF (Opcional)"
                    value={novoDependente.cpf}
                    onChange={(e) => setNovoDependente({ ...novoDependente, cpf: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddDependente}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl px-3 py-1.5 transition-colors"
                  >
                    + Dependente
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dependentesList.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    >
                      <strong>{d.nome}</strong> ({d.parentesco})
                      <button
                        type="button"
                        onClick={() => handleRemoveDependente(d.id)}
                        className="text-rose-400 hover:text-rose-300 ml-1 p-0.5"
                        title="Excluir Dependente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {dependentesList.length === 0 && (
                    <span className="text-xs text-slate-500 italic">Nenhum dependente adicionado.</span>
                  )}
                </div>
              </div>

              {/* Seção 5: Contatos de Emergência */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" />
                  5. Contatos de Emergência ({contatosEmergenciaList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Contato"
                    value={novoContato.nome}
                    onChange={(e) => setNovoContato({ ...novoContato, nome: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Telefone / WhatsApp"
                    value={novoContato.telefone}
                    onChange={(e) => setNovoContato({ ...novoContato, telefone: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Parentesco / Relação"
                    value={novoContato.parentesco}
                    onChange={(e) => setNovoContato({ ...novoContato, parentesco: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddContatoEmergencia}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl px-3 py-1.5 transition-colors"
                  >
                    + Contato
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {contatosEmergenciaList.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    >
                      {c.nome} - {c.telefone} ({c.parentesco})
                      <button
                        type="button"
                        onClick={() => handleRemoveContatoEmergencia(idx)}
                        className="text-rose-400 hover:text-rose-300 ml-1 p-0.5"
                        title="Excluir Contato de Emergência"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Seção 6: Observações */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Observações & Instruções da Portaria</label>
                <textarea
                  rows={2}
                  placeholder="Instruções para entregas, autorizações permanentes, pets..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Termo LGPD */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="lgpd"
                  checked={formData.lgpd_termo_aceito}
                  onChange={(e) => setFormData({ ...formData, lgpd_termo_aceito: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="lgpd" className="text-[11px] text-slate-400 leading-relaxed">
                  Declaro que o titular autorizou expressamente o armazenamento de seus dados cadastrais e foto
                  biométrica para finalidades exclusivas de segurança predial e controle de acesso, em conformidade com
                  o Artigo 7º da Lei Geral de Proteção de Dados (LGPD nº 13.709/2018).
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {editingMoradorId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const m = moradores.find((mor) => mor.id === editingMoradorId);
                      if (m) {
                        setIsCadastroModalOpen(false);
                        handleOpenDeleteModal(m, 'excluir');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-semibold rounded-xl border border-rose-800/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Morador
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCadastroModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    {editingMoradorId ? 'Salvar Alterações' : 'Cadastrar Morador'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Perfil do Morador / Residente */}
      {isPerfilModalOpen && selectedMorador && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Perfil */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-[#111827] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg overflow-hidden shrink-0">
                  {selectedMorador.avatar_url ? (
                    <img
                      src={selectedMorador.avatar_url}
                      alt={selectedMorador.nome_completo}
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-xl">
                      {selectedMorador.nome_completo.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedMorador.nome_completo}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                      {selectedMorador.perfil}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {selectedMorador.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Bloco {selectedMorador.unidade_bloco} • Apartamento {selectedMorador.unidade_numero}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsPerfilModalOpen(false);
                    handleOpenEditModal(selectedMorador);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setIsPerfilModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Abas de Navegação do Perfil */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
              <button
                onClick={() => setActiveTabPerfil('cadastrais')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                  activeTabPerfil === 'cadastrais'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Dados Cadastrais & LGPD
              </button>
              <button
                onClick={() => setActiveTabPerfil('veiculos')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                  activeTabPerfil === 'veiculos'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Veículos ({selectedMorador.veiculos?.length || 0}) & Família
              </button>
              <button
                onClick={() => setActiveTabPerfil('encomendas')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                  activeTabPerfil === 'encomendas'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Histórico de Encomendas
              </button>
              <button
                onClick={() => setActiveTabPerfil('visitas')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                  activeTabPerfil === 'visitas'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Visitas & Acessos
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTabPerfil === 'cadastrais' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contato</span>
                      <p className="text-xs text-slate-300">
                        <strong>WhatsApp:</strong> {selectedMorador.telefone}
                      </p>
                      <p className="text-xs text-slate-300">
                        <strong>E-mail:</strong> {selectedMorador.email}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Documentação</span>
                      <p className="text-xs text-slate-300 font-mono">
                        <strong>CPF:</strong> {selectedMorador.cpf}
                      </p>
                      <p className="text-xs text-slate-300">
                        <strong>Status:</strong> {selectedMorador.status}
                      </p>
                    </div>
                  </div>

                  {/* Conformidade LGPD */}
                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">Termo de Consentimento LGPD Ativo</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Aceite registrado com consentimento explícito. O titular pode solicitar exclusão ou exercer o
                        direito de anonimização a qualquer momento.
                      </p>
                    </div>
                  </div>

                  {selectedMorador.observacoes && (
                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Observações</span>
                      <p className="text-xs text-slate-300 mt-1">{selectedMorador.observacoes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTabPerfil === 'veiculos' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Veículos Cadastrados</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMorador.veiculos && selectedMorador.veiculos.length > 0 ? (
                        selectedMorador.veiculos.map((v) => (
                          <div key={v.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                            <Car className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="text-xs font-bold text-white font-mono">{v.placa}</p>
                              <p className="text-[11px] text-slate-400">{v.modelo} • {v.cor}</p>
                              {v.vaga && <p className="text-[10px] text-indigo-400 font-medium">Vaga: {v.vaga}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic sm:col-span-2">Nenhum veículo registrado.</p>
                      )}
                    </div>
                  </div>

                  {selectedMorador.dependentes && selectedMorador.dependentes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Dependentes & Familiares</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedMorador.dependentes.map((dep) => (
                          <div key={dep.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                            <Users className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-xs font-bold text-white">{dep.nome}</p>
                              <p className="text-[11px] text-slate-400">{dep.parentesco} {dep.cpf ? `• CPF: ${dep.cpf}` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMorador.contatos_emergencia && selectedMorador.contatos_emergencia.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Contatos de Emergência</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedMorador.contatos_emergencia.map((cont, i) => (
                          <div key={i} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                            <HeartHandshake className="w-5 h-5 text-amber-400" />
                            <div>
                              <p className="text-xs font-bold text-white">{cont.nome}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{cont.telefone} ({cont.parentesco})</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTabPerfil === 'encomendas' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Encomendas da Unidade</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {encomendasList.filter((e) => e.unidade_bloco === selectedMorador.unidade_bloco && e.unidade_numero === selectedMorador.unidade_numero).map((enc) => (
                      <div key={enc.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-indigo-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{enc.transportadora}</p>
                            <p className="text-[10px] font-mono text-slate-400">{enc.codigo_barras_qrcode}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          enc.status === 'AGUARDANDO_RETIRADA'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        }`}>
                          {enc.status}
                        </span>
                      </div>
                    ))}
                    {encomendasList.filter((e) => e.unidade_bloco === selectedMorador.unidade_bloco && e.unidade_numero === selectedMorador.unidade_numero).length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-900/50 rounded-xl border border-slate-800">
                        Nenhuma encomenda registrada para esta unidade.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTabPerfil === 'visitas' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Visitas e Prestadores</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {visitantesList.filter((v) => v.unidade_destino_bloco === selectedMorador.unidade_bloco && v.unidade_destino_numero === selectedMorador.unidade_numero).map((vis) => (
                      <div key={vis.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <div>
                            <p className="text-xs font-bold text-white">{vis.nome_completo}</p>
                            <p className="text-[10px] text-slate-400">{vis.tipo} • {vis.hora_entrada}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                          {vis.status_acesso}
                        </span>
                      </div>
                    ))}
                    {visitantesList.filter((v) => v.unidade_destino_bloco === selectedMorador.unidade_bloco && v.unidade_destino_numero === selectedMorador.unidade_numero).length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-900/50 rounded-xl border border-slate-800">
                        Nenhum visitante ou prestador recente registrado para esta unidade.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Perfil */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenDeleteModal(selectedMorador, 'excluir');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl text-xs font-semibold border border-rose-800/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Morador
                </button>

                <button
                  onClick={() => {
                    handleOpenDeleteModal(selectedMorador, 'anonimizar');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Anonimizar LGPD
                </button>
              </div>

              <button
                onClick={() => setIsPerfilModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirmação de Exclusão ou Anonimização */}
      {isDeleteModalOpen && moradorToDelete && (
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

            <h3 className="text-base font-black text-white">
              {deleteActionType === 'excluir' ? 'Excluir Morador do Sistema?' : 'Anonimizar Dados do Morador?'}
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Você selecionou o morador: <strong className="text-white">{moradorToDelete.nome_completo}</strong> (Bloco{' '}
              {moradorToDelete.unidade_bloco}, Apto {moradorToDelete.unidade_numero}).
            </p>

            {/* Opções de Tipo de Ação */}
            <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tipo de Ação:
              </label>

              <label className="flex items-start gap-2 cursor-pointer p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
                <input
                  type="radio"
                  name="actionType"
                  value="excluir"
                  checked={deleteActionType === 'excluir'}
                  onChange={() => setDeleteActionType('excluir')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-rose-400 block">Exclusão Definitiva</span>
                  <span className="text-[11px] text-slate-400">
                    Remove completamente o morador e seus veículos/dependentes do sistema.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
                <input
                  type="radio"
                  name="actionType"
                  value="anonimizar"
                  checked={deleteActionType === 'anonimizar'}
                  onChange={() => setDeleteActionType('anonimizar')}
                  className="mt-0.5 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="font-bold text-amber-400 block">Anonimização LGPD (Art. 18)</span>
                  <span className="text-[11px] text-slate-400">
                    Ofusca dados pessoais irreversivelmente, preservando métricas históricas da portaria.
                  </span>
                </div>
              </label>
            </div>

            <div className="mt-3 space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">Motivo do registro:</label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

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
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all ${
                  deleteActionType === 'excluir'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
                }`}
              >
                {deleteActionType === 'excluir' ? 'Confirmar Exclusão' : 'Confirmar Anonimização'}
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
              <Camera className="w-4 h-4 text-indigo-400" />
              Captura Biométrica / Foto do Morador
            </h3>
            <WebcamCapture
              onPhotoCaptured={(dataUrl) => {
                setFormData({ ...formData, avatar_url: dataUrl });
                setIsWebcamOpen(false);
              }}
              currentPhotoUrl={formData.avatar_url}
            />
          </div>
        </div>
      )}
    </div>
  );
}
