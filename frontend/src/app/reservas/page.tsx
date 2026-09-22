'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Eye,
  DollarSign,
  Utensils,
  PartyPopper,
  Trophy,
  Settings,
  Edit2,
  Trash2,
  Info,
} from 'lucide-react';
import { AreaComum, ReservaArea, PeriodoReserva, StatusReserva } from '@/lib/types';
import { api } from '@/lib/api';
import { sounds } from '@/lib/SoundEffects';

const INITIAL_AREAS_BASE: AreaComum[] = [
  {
    id: 'area-01',
    nome: 'Espaço Gourmet & Churrasqueira',
    descricao: 'Espaço climatizado com churrasqueira a carvão, freezer horizontal, cooktop por indução e mesas.',
    capacidade_maxima: 0,
    taxa_reserva: 0,
    foto_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    regras: 'Horário de uso e normas conforme regimento interno do condomínio.',
    status: 'DISPONIVEL',
  },
  {
    id: 'area-02',
    nome: 'Salão Nobre de Festas',
    descricao: 'Salão amplo com sistema de som integrado, iluminação cênica, cozinha de apoio e sanitários.',
    capacidade_maxima: 0,
    taxa_reserva: 0,
    foto_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    regras: 'Entrega de lista de convidados na portaria conforme regras locais.',
    status: 'DISPONIVEL',
  },
  {
    id: 'area-03',
    nome: 'Quadra Poliesportiva & Beach Tennis',
    descricao: 'Quadra iluminada com piso modular e quadra de areia para esportes.',
    capacidade_maxima: 0,
    taxa_reserva: 0,
    foto_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    regras: 'Uso compartilhado e agendamento por turnos.',
    status: 'DISPONIVEL',
  },
];

const INITIAL_RESERVAS: ReservaArea[] = [];

export default function ReservasPage() {
  const [areas, setAreas] = useState<AreaComum[]>(INITIAL_AREAS_BASE);
  const [reservas, setReservas] = useState<ReservaArea[]>(INITIAL_RESERVAS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modais
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaComum | null>(null);

  // Form de Reserva (Valores e pessoas preenchidos digitalmente pelo gestor)
  const [formReserva, setFormReserva] = useState({
    area_id: INITIAL_AREAS_BASE[0].id,
    unidade_bloco: 'A',
    unidade_numero: '',
    morador_nome: '',
    morador_telefone: '',
    data_reserva: new Date(Date.now() + 3600000 * 24).toISOString().slice(0, 10),
    periodo: 'NOITE' as PeriodoReserva,
    quantidade_pessoas: '',
    taxa_acordada: '',
    observacoes: '',
  });

  // Form de Gestão de Área Comum
  const [formArea, setFormArea] = useState({
    nome: '',
    descricao: '',
    regras: '',
    foto_url: '',
    status: 'DISPONIVEL' as 'DISPONIVEL' | 'EM_MANUTENCAO' | 'INDISPONIVEL',
  });

  // Carrega do LocalStorage
  useEffect(() => {
    const savedAreas = localStorage.getItem('portaria_areas_config');
    if (savedAreas) {
      try {
        setAreas(JSON.parse(savedAreas));
      } catch (e) {
        setAreas(INITIAL_AREAS_BASE);
      }
    } else {
      setAreas(INITIAL_AREAS_BASE);
      localStorage.setItem('portaria_areas_config', JSON.stringify(INITIAL_AREAS_BASE));
    }

    const savedRes = localStorage.getItem('portaria_reservas');
    if (savedRes) {
      try {
        setReservas(JSON.parse(savedRes));
      } catch (e) {
        setReservas(INITIAL_RESERVAS);
      }
    }
  }, []);

  const saveAreas = (updated: AreaComum[]) => {
    setAreas(updated);
    localStorage.setItem('portaria_areas_config', JSON.stringify(updated));
  };

  const saveReservas = (updated: ReservaArea[]) => {
    setReservas(updated);
    localStorage.setItem('portaria_reservas', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Criar / Confirmar Reserva com parâmetros digitados pelo gestor
  const handleCreateReserva = (e: React.FormEvent) => {
    e.preventDefault();
    const area = areas.find((a) => a.id === formReserva.area_id);
    if (!area) return;

    if (!formReserva.morador_nome.trim()) {
      alert('Por favor, informe o nome do solicitante / morador.');
      return;
    }

    if (!formReserva.unidade_numero.trim()) {
      alert('Por favor, informe o número da unidade / apartamento.');
      return;
    }

    // Checa conflito de agendamento na mesma área e data/período
    const conflito = reservas.find(
      (r) =>
        r.area_id === formReserva.area_id &&
        r.data_reserva === formReserva.data_reserva &&
        r.periodo === formReserva.periodo &&
        r.status === 'CONFIRMADO',
    );

    if (conflito) {
      sounds.playErrorTone();
      alert(`Já existe uma reserva confirmada para o "${area.nome}" nesta mesma data e período.`);
      return;
    }

    const taxaNum = formReserva.taxa_acordada ? parseFloat(formReserva.taxa_acordada.replace(',', '.')) : 0;
    const pessoasNum = formReserva.quantidade_pessoas ? parseInt(formReserva.quantidade_pessoas, 10) : undefined;

    const nova: ReservaArea = {
      id: `res-${Date.now()}`,
      area_id: area.id,
      area_nome: area.nome,
      area_foto: area.foto_url,
      area_capacidade: pessoasNum || 0,
      area_taxa: isNaN(taxaNum) ? 0 : taxaNum,
      unidade_id: `u-${formReserva.unidade_bloco}-${formReserva.unidade_numero}`,
      unidade_bloco: formReserva.unidade_bloco,
      unidade_numero: formReserva.unidade_numero.trim(),
      usuario_id: 'usr-gestor',
      solicitante_nome: formReserva.morador_nome.trim(),
      solicitante_telefone: formReserva.morador_telefone.trim(),
      data_reserva: formReserva.data_reserva,
      periodo: formReserva.periodo,
      status: 'CONFIRMADO',
      convidados_estimados: pessoasNum,
      observacoes: formReserva.observacoes.trim(),
      created_at: new Date().toISOString(),
    };

    const updated = [nova, ...reservas];
    saveReservas(updated);
    sounds.playSuccessChime();
    showToast(`Reserva confirmada com sucesso para ${area.nome}!`);
    setIsReservaModalOpen(false);

    // Limpa form
    setFormReserva((prev) => ({
      ...prev,
      unidade_numero: '',
      morador_nome: '',
      morador_telefone: '',
      quantidade_pessoas: '',
      taxa_acordada: '',
      observacoes: '',
    }));
  };

  // Salvar / Editar Área do Condomínio
  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formArea.nome.trim()) return;

    if (editingArea) {
      const updated = areas.map((a) =>
        a.id === editingArea.id
          ? {
              ...a,
              nome: formArea.nome.trim(),
              descricao: formArea.descricao.trim(),
              regras: formArea.regras.trim(),
              foto_url: formArea.foto_url.trim() || a.foto_url,
              status: formArea.status,
            }
          : a,
      );
      saveAreas(updated);
      showToast('Configurações da área atualizadas com sucesso!');
    } else {
      const novaArea: AreaComum = {
        id: `area-${Date.now()}`,
        nome: formArea.nome.trim(),
        descricao: formArea.descricao.trim(),
        regras: formArea.regras.trim(),
        foto_url:
          formArea.foto_url.trim() ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        capacidade_maxima: 0,
        taxa_reserva: 0,
        status: formArea.status,
      };
      saveAreas([...areas, novaArea]);
      showToast('Nova área comum cadastrada no condomínio!');
    }

    setIsAreaModalOpen(false);
    setEditingArea(null);
  };

  const handleOpenEditArea = (area: AreaComum) => {
    setEditingArea(area);
    setFormArea({
      nome: area.nome,
      descricao: area.descricao,
      regras: area.regras,
      foto_url: area.foto_url || '',
      status: area.status,
    });
    setIsAreaModalOpen(true);
  };

  const handleOpenNewArea = () => {
    setEditingArea(null);
    setFormArea({
      nome: '',
      descricao: '',
      regras: '',
      foto_url: '',
      status: 'DISPONIVEL',
    });
    setIsAreaModalOpen(true);
  };

  const handleDeleteArea = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta área do catálogo?')) {
      const updated = areas.filter((a) => a.id !== id);
      saveAreas(updated);
      showToast('Área removida do condomínio.');
    }
  };

  const handleCancelReserva = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      const updated = reservas.map((r) => (r.id === id ? { ...r, status: 'CANCELADO' as const } : r));
      saveReservas(updated);
      showToast('Reserva cancelada.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-indigo-400" />
            Reserva de Áreas Comuns & Eventos
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Espaços de lazer e agendamentos configuráveis sob medida pelo gestor
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenNewArea}
            className="inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-slate-700 shadow-md transition-all active:scale-95"
          >
            <Settings className="w-4 h-4 text-cyan-400" /> Cadastrar Área
          </button>

          <button
            onClick={() => setIsReservaModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/30 border border-indigo-400/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nova Reserva
          </button>
        </div>
      </div>

      {/* Catálogo das Áreas Comuns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {areas.map((area) => (
          <div
            key={area.id}
            className="bg-[#121a2f]/90 backdrop-blur-md border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-indigo-500/60 transition-all"
          >
            {area.foto_url && (
              <div className="h-44 w-full relative overflow-hidden">
                <img
                  src={area.foto_url}
                  alt={area.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${
                      area.status === 'DISPONIVEL'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {area.status === 'DISPONIVEL' ? 'Disponível' : 'Em Manutenção'}
                  </span>
                </div>
              </div>
            )}

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {area.nome}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{area.descricao}</p>
              </div>

              {area.regras && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{area.regras}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEditArea(area)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Personalizar Área
                </button>

                <button
                  onClick={() => handleDeleteArea(area.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Excluir Área"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Reservas Agendadas */}
      <div className="bg-[#121a2f]/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          Calendário de Reservas Confirmadas
        </h2>

        {reservas.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">Nenhuma reserva agendada no momento</p>
            <p className="text-xs text-slate-400">
              Clique em <strong className="text-indigo-400 font-semibold">"Nova Reserva"</strong> para agendar eventos e definir pessoas e valores digitalmente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((res) => (
              <div
                key={res.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">
                      {new Date(res.data_reserva + 'T12:00:00').toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-base font-black text-white">
                      {new Date(res.data_reserva + 'T12:00:00').getDate()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {res.area_nome}
                      {res.area_taxa && res.area_taxa > 0 ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                          R$ {res.area_taxa.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Sem Taxa / Isento
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Reservado por <strong className="text-white font-bold">{res.solicitante_nome}</strong> (Bloco {res.unidade_bloco} - Apto {res.unidade_numero})
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                        Período: {res.periodo}
                      </span>
                      {res.convidados_estimados && res.convidados_estimados > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {res.convidados_estimados} pessoas/convidados
                        </span>
                      )}
                      {res.observacoes && (
                        <span className="text-[11px] text-slate-400 italic">
                          • "{res.observacoes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                      res.status === 'CONFIRMADO'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {res.status}
                  </span>

                  {res.status === 'CONFIRMADO' && (
                    <button
                      onClick={() => handleCancelReserva(res.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-colors text-xs font-bold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NOVA RESERVA (Valores & Quantidade de Pessoas Definidas Digitalmente) */}
      {/* ========================================================================= */}
      {isReservaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a2f] border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                Nova Reserva de Espaço
              </h3>
              <button onClick={() => setIsReservaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReserva} className="p-6 space-y-4">
              {/* Seleção do Espaço */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Espaço / Área Comum *
                </label>
                <select
                  value={formReserva.area_id}
                  onChange={(e) => setFormReserva({ ...formReserva, area_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Solicitante & Unidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Nome do Morador / Solicitante *
                  </label>
                  <input
                    type="text"
                    value={formReserva.morador_nome}
                    onChange={(e) => setFormReserva({ ...formReserva, morador_nome: e.target.value })}
                    required
                    placeholder="Ex: Carlos Ferreira"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Bloco</label>
                    <select
                      value={formReserva.unidade_bloco}
                      onChange={(e) => setFormReserva({ ...formReserva, unidade_bloco: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="A">Bloco A</option>
                      <option value="B">Bloco B</option>
                      <option value="C">Bloco C</option>
                      <option value="TORRE_1">Torre 1</option>
                      <option value="TORRE_2">Torre 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Apto *</label>
                    <input
                      type="text"
                      value={formReserva.unidade_numero}
                      onChange={(e) => setFormReserva({ ...formReserva, unidade_numero: e.target.value })}
                      required
                      placeholder="101, PH01"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Data & Período */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    value={formReserva.data_reserva}
                    onChange={(e) => setFormReserva({ ...formReserva, data_reserva: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Período *
                  </label>
                  <select
                    value={formReserva.periodo}
                    onChange={(e) => setFormReserva({ ...formReserva, periodo: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MANHA">Manhã (08h às 12h)</option>
                    <option value="TARDE">Tarde (13h às 17h)</option>
                    <option value="NOITE">Noite (18h às 23h)</option>
                    <option value="INTEGRAL">Dia Inteiro (09h às 22h)</option>
                  </select>
                </div>
              </div>

              {/* CAMPOS DIGITÁVEIS PELO GESTOR: QUANTIDADE DE PESSOAS E TAXA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-900/80 border border-indigo-500/30 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 uppercase mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Qtd. Pessoas / Convidados
                  </label>
                  <input
                    type="number"
                    value={formReserva.quantidade_pessoas}
                    onChange={(e) => setFormReserva({ ...formReserva, quantidade_pessoas: e.target.value })}
                    placeholder="Ex: 25 pessoas"
                    min={1}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Definido para esta situação</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 uppercase mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Taxa / Valor Acordado (R$)
                  </label>
                  <input
                    type="text"
                    value={formReserva.taxa_acordada}
                    onChange={(e) => setFormReserva({ ...formReserva, taxa_acordada: e.target.value })}
                    placeholder="0,00 ou valor custom"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 para gratuito ou valor em R$</span>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Observações / Finalidade do Evento
                </label>
                <textarea
                  value={formReserva.observacoes}
                  onChange={(e) => setFormReserva({ ...formReserva, observacoes: e.target.value })}
                  rows={2}
                  placeholder="Ex: Almoço com familiares e amigos..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReservaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GESTÃO & CADASTRO DE ÁREA COMUM PELO GESTOR */}
      {/* ========================================================================= */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a2f] border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                {editingArea ? 'Personalizar Área Comum' : 'Cadastrar Nova Área Comum'}
              </h3>
              <button onClick={() => setIsAreaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nome da Área / Espaço *
                </label>
                <input
                  type="text"
                  value={formArea.nome}
                  onChange={(e) => setFormArea({ ...formArea, nome: e.target.value })}
                  required
                  placeholder="Ex: Salão Gourmet, Sala de Cinema, Espaço Kids..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Descrição dos Equipamentos & Espaço
                </label>
                <textarea
                  value={formArea.descricao}
                  onChange={(e) => setFormArea({ ...formArea, descricao: e.target.value })}
                  rows={2}
                  placeholder="Ex: Espaço climatizado com fogão, geladeira e mesas..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Regras de Uso do Condomínio
                </label>
                <textarea
                  value={formArea.regras}
                  onChange={(e) => setFormArea({ ...formArea, regras: e.target.value })}
                  rows={2}
                  placeholder="Ex: Horário permitido até às 22h. Proibido som alto..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    URL da Foto (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formArea.foto_url}
                    onChange={(e) => setFormArea({ ...formArea, foto_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Status da Área
                  </label>
                  <select
                    value={formArea.status}
                    onChange={(e) => setFormArea({ ...formArea, status: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EM_MANUTENCAO">Em Manutenção</option>
                    <option value="INDISPONIVEL">Indisponível</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25"
                >
                  Salvar Área
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
