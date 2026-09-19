'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCog,
  Users,
  Search,
  Plus,
  Filter,
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
  Camera,
  X,
  Sparkles,
  UserCheck,
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  Lock,
  MessageSquare,
  Check,
  Upload,
  UserX,
  Calendar,
} from 'lucide-react';
import { Colaborador, CargoColaborador, TurnoTrabalho } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import WebcamCapture from '@/components/WebcamCapture';
import SoundEffects from '@/lib/SoundEffects';

export default function ColaboradoresPage() {
  const { currentUser } = useAuth();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState<'TODOS' | CargoColaborador>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'FERIAS' | 'INATIVO'>('TODOS');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Colaborador | null>(null);

  // Formulário de Cadastro/Edição
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: 'PORTEIRO' as CargoColaborador,
    turno: 'COMERCIAL' as TurnoTrabalho,
    matricula: '',
    foto_url: '',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO' | 'FERIAS' | 'BLOQUEADO',
    senha: '',
    observacoes: '',
  });

  // Carrega lista de colaboradores
  useEffect(() => {
    const saved = localStorage.getItem('portaria_colaboradores');
    if (saved) {
      try {
        setColaboradores(JSON.parse(saved));
      } catch (e) {
        setColaboradores([]);
      }
    } else {
      setColaboradores([]);
    }
  }, []);

  const saveColaboradores = (list: Colaborador[]) => {
    setColaboradores(list);
    localStorage.setItem('portaria_colaboradores', JSON.stringify(list));
  };

  // Formatação de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData((prev) => ({ ...prev, cpf: value }));
  };

  // Formatação de Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setFormData((prev) => ({ ...prev, telefone: value }));
  };

  // Abrir Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      nome_completo: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: 'PORTEIRO',
      turno: 'COMERCIAL',
      matricula: `MAT-${Date.now().toString().slice(-4)}`,
      foto_url: '',
      status: 'ATIVO',
      senha: '',
      observacoes: '',
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (colab: Colaborador) => {
    setEditingId(colab.id);
    setFormData({
      nome_completo: colab.nome_completo,
      cpf: colab.cpf,
      email: colab.email,
      telefone: colab.telefone,
      cargo: colab.cargo,
      turno: colab.turno,
      matricula: colab.matricula || '',
      foto_url: colab.foto_url || '',
      status: colab.status,
      senha: '',
      observacoes: colab.observacoes || '',
    });
    setIsModalOpen(true);
  };

  // Salvar Colaborador (Criar ou Atualizar)
  const handleSaveColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.cpf || !formData.email) {
      SoundEffects.playError();
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (editingId) {
      // Atualizar existente
      const updated = colaboradores.map((c) => {
        if (c.id === editingId) {
          return {
            ...c,
            nome_completo: formData.nome_completo.trim(),
            cpf: formData.cpf,
            email: formData.email.trim().toLowerCase(),
            telefone: formData.telefone,
            cargo: formData.cargo,
            turno: formData.turno,
            matricula: formData.matricula.trim() || undefined,
            foto_url: formData.foto_url || undefined,
            status: formData.status,
            observacoes: formData.observacoes.trim() || undefined,
            ...(formData.senha ? { senha_hash: formData.senha } : {}),
          };
        }
        return c;
      });
      saveColaboradores(updated);
      SoundEffects.playSuccess();
    } else {
      // Criar novo
      const cleanCpf = formData.cpf.replace(/\D/g, '');
      const cleanEmail = formData.email.trim().toLowerCase();

      const exists = colaboradores.some(
        (c) => c.cpf.replace(/\D/g, '') === cleanCpf || c.email.toLowerCase() === cleanEmail,
      );

      if (exists) {
        SoundEffects.playError();
        alert('Já existe um colaborador cadastrado com este E-mail ou CPF.');
        return;
      }

      const novo: Colaborador & { senha_hash?: string } = {
        id: `usr-colab-${Date.now()}`,
        nome_completo: formData.nome_completo.trim(),
        cpf: formData.cpf,
        email: cleanEmail,
        telefone: formData.telefone,
        cargo: formData.cargo,
        turno: formData.turno,
        matricula: formData.matricula.trim() || `MAT-${Date.now().toString().slice(-4)}`,
        foto_url: formData.foto_url || undefined,
        status: formData.status,
        data_admissao: new Date().toISOString(),
        observacoes: formData.observacoes.trim() || undefined,
        lgpd_termo_aceito: true,
        senha_hash: formData.senha || 'SenhaSegura123!',
      };

      saveColaboradores([novo, ...colaboradores]);
      SoundEffects.playSuccess();
    }

    setIsModalOpen(false);
  };

  // Alternar Status Rápido (Ativo / Férias / Inativo)
  const handleToggleStatus = (id: string, newStatus: 'ATIVO' | 'FERIAS' | 'INATIVO') => {
    const updated = colaboradores.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    saveColaboradores(updated);
    SoundEffects.playBeep();
  };

  // Confirmar Exclusão
  const handleDeleteConfirm = () => {
    if (!selectedToDelete) return;
    const updated = colaboradores.filter((c) => c.id !== selectedToDelete.id);
    saveColaboradores(updated);
    setIsDeleteModalOpen(false);
    setSelectedToDelete(null);
    SoundEffects.playAlert();
  };

  // Filtragem
  const filtered = colaboradores.filter((c) => {
    const matchesSearch =
      c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.matricula && c.matricula.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCargo = cargoFilter === 'TODOS' || c.cargo === cargoFilter;
    const matchesStatus = statusFilter === 'TODOS' || c.status === statusFilter;

    return matchesSearch && matchesCargo && matchesStatus;
  });

  // Métricas
  const totalPortaria = colaboradores.filter((c) => c.cargo === 'PORTEIRO' && c.status === 'ATIVO').length;
  const totalZeladoria = colaboradores.filter((c) => c.cargo === 'ZELADOR' && c.status === 'ATIVO').length;
  const totalGestao = colaboradores.filter(
    (c) => (c.cargo === 'ADMINISTRADOR' || c.cargo === 'GERENTE' || c.cargo === 'SINDICO') && c.status === 'ATIVO',
  ).length;

  const getCargoBadge = (cargo: CargoColaborador) => {
    switch (cargo) {
      case 'ADMINISTRADOR':
        return { label: 'Administrador Geral', bg: 'bg-purple-950/80 text-purple-300 border-purple-800/50' };
      case 'GERENTE':
        return { label: 'Gerente Predial', bg: 'bg-amber-950/80 text-amber-300 border-amber-800/50' };
      case 'SINDICO':
        return { label: 'Síndico Geral', bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50' };
      case 'ZELADOR':
        return { label: 'Zelador / Manutenção', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50' };
      case 'PORTEIRO':
        return { label: 'Porteiro / Operador', bg: 'bg-blue-950/80 text-blue-300 border-blue-800/50' };
      case 'OUTRO':
        return { label: 'Outro Cargo / Função', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/50' };
      default:
        return { label: cargo, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getTurnoLabel = (turno: TurnoTrabalho) => {
    switch (turno) {
      case 'COMERCIAL':
        return 'Comercial (08h-17h)';
      case 'MANHA':
        return 'Manhã (06h-14h)';
      case 'TARDE':
        return 'Tarde (14h-22h)';
      case 'NOITE':
        return 'Noite (22h-06h)';
      case '12X36':
        return 'Escala 12x36';
      case 'OUTRO':
        return 'Outro Turno / Personalizado';
      default:
        return turno;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <UserCog className="w-7 h-7 text-indigo-400" />
              Gestão de Colaboradores & Equipe
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-xs font-bold">
              {colaboradores.length} Registrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de acesso, funções e credenciais de Administradores, Gerentes, Zeladores e Porteiros.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Colaborador
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total da Equipe</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{colaboradores.length}</h3>
            <p className="text-[10px] text-slate-500">Equipe cadastrada</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Portaria Ativa</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{totalPortaria}</h3>
            <p className="text-[10px] text-blue-400 font-semibold">Operadores em turno</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Zeladoria & Manut.</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{totalZeladoria}</h3>
            <p className="text-[10px] text-emerald-400 font-semibold">Zeladores ativos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Gestão & Adm</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{totalGestao}</h3>
            <p className="text-[10px] text-purple-400 font-semibold">Admin / Gerentes / Síndico</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="p-4 bg-[#111827] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar colaborador por nome, CPF, e-mail ou matrícula..."
            className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value as any)}
            className="bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="TODOS">Todos os Cargos</option>
            <option value="PORTEIRO">Porteiros</option>
            <option value="ZELADOR">Zeladores</option>
            <option value="GERENTE">Gerentes Prediais</option>
            <option value="SINDICO">Síndicos</option>
            <option value="ADMINISTRADOR">Administradores</option>
            <option value="OUTRO">Outros Cargos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Ativos</option>
            <option value="FERIAS">Em Férias</option>
            <option value="INATIVO">Inativos</option>
          </select>
        </div>
      </div>

      {/* Lista / Grid de Colaboradores */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <UserCog className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">Nenhum colaborador encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || cargoFilter !== 'TODOS' || statusFilter !== 'TODOS'
              ? 'Tente ajustar os filtros de pesquisa.'
              : 'Comece adicionando administradores, gerentes, zeladores ou porteiros da equipe.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Colaborador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((colab) => {
            const badge = getCargoBadge(colab.cargo);
            return (
              <div
                key={colab.id}
                className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 shadow-xl transition-all space-y-4 relative group"
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {colab.foto_url ? (
                          <img src={colab.foto_url} alt={colab.nome_completo} className="w-full h-full object-cover" />
                        ) : (
                          colab.nome_completo.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#111827] ${
                          colab.status === 'ATIVO'
                            ? 'bg-emerald-400'
                            : colab.status === 'FERIAS'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        title={`Status: ${colab.status}`}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{colab.nome_completo}</h3>
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mt-1 ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(colab)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar Colaborador"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedToDelete(colab);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Remover Colaborador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Detalhes do Colaborador */}
                <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Turno:
                    </span>
                    <span className="font-semibold text-slate-200">{getTurnoLabel(colab.turno)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      E-mail:
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 truncate max-w-[170px]" title={colab.email}>
                      {colab.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      Telefone:
                    </span>
                    <a
                      href={`https://wa.me/55${colab.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {colab.telefone}
                    </a>
                  </div>

                  {colab.matricula && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        Matrícula:
                      </span>
                      <span className="font-mono text-[11px] text-slate-300">{colab.matricula}</span>
                    </div>
                  )}
                </div>

                {/* Status Toggle Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(colab.id, 'ATIVO')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        colab.status === 'ATIVO'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Ativo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(colab.id, 'FERIAS')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        colab.status === 'FERIAS'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Férias
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(colab.id, 'INATIVO')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        colab.status === 'INATIVO'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Inativo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro / Edição de Colaborador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingId ? 'Editar Dados do Colaborador' : 'Cadastrar Novo Colaborador'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveColaborador} className="space-y-4">
              {/* Foto Biométrica */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center">
                    {formData.foto_url ? (
                      <img src={formData.foto_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  {formData.foto_url && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    Foto de Identificação
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWebcamOpen(true)}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Camera className="w-3 h-3" />
                      {formData.foto_url ? 'Recapturar' : 'Tirar Foto'}
                    </button>

                    <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-slate-700">
                      <Upload className="w-3 h-3 text-indigo-400" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setFormData((prev) => ({ ...prev, foto_url: ev.target?.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {formData.foto_url && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, foto_url: '' }))}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cargo e Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Cargo / Função *</label>
                  <select
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value as CargoColaborador })}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="PORTEIRO">👮 Porteiro / Operador de Portaria</option>
                    <option value="ZELADOR">🔧 Zelador / Manutenção</option>
                    <option value="GERENTE">🏢 Gerente Predial / Gestor</option>
                    <option value="SINDICO">👔 Síndico Geral</option>
                    <option value="ADMINISTRADOR">⚙️ Administrador do Sistema</option>
                    <option value="OUTRO">✨ Outros Cargos / Funções</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Turno / Escala *</label>
                  <select
                    value={formData.turno}
                    onChange={(e) => setFormData({ ...formData, turno: e.target.value as TurnoTrabalho })}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="COMERCIAL">Horário Comercial (08h às 17h)</option>
                    <option value="MANHA">Plantão Manhã (06h às 14h)</option>
                    <option value="TARDE">Plantão Tarde (14h às 22h)</option>
                    <option value="NOITE">Plantão Noturno (22h às 06h)</option>
                    <option value="12X36">Escala 12x36 (Dia Sim / Dia Não)</option>
                    <option value="OUTRO">⏳ Outro Turno / Personalizado</option>
                  </select>
                </div>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  placeholder="Nome completo do colaborador"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none placeholder:text-slate-600"
                />
              </div>

              {/* CPF e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">CPF *</label>
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    value={formData.telefone}
                    onChange={handleTelefoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* E-mail Institucional e Matrícula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">E-mail Institucional *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="colaborador@condominio.com.br"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Matrícula / Registro</label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    placeholder="Ex: MAT-1024"
                    className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Senha de Acesso */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {editingId ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha de Acesso *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder={editingId ? '••••••••••••' : 'Mínimo 6 dígitos'}
                    className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Observações / Anotações Internas</label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Escalas especiais, telefones de emergência, etc."
                  className="w-full bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-700/80 focus:border-indigo-500 outline-none placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
                >
                  {editingId ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Webcam */}
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
              Captura de Foto Biométrica do Colaborador
            </h3>
            <WebcamCapture
              onPhotoCaptured={(dataUrl) => {
                setFormData((prev) => ({ ...prev, foto_url: dataUrl }));
                setIsWebcamOpen(false);
              }}
              currentPhotoUrl={formData.foto_url}
            />
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {isDeleteModalOpen && selectedToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-white">Descredenciar Colaborador</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja remover o cadastro de{' '}
              <strong className="text-white">{selectedToDelete.nome_completo}</strong> ({selectedToDelete.cargo})?
              O colaborador perderá o acesso aos módulos da portaria imediatamente.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/25"
              >
                Sim, Descredenciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
