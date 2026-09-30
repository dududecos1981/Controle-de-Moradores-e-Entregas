'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  X,
  Info,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  ShieldCheck,
} from 'lucide-react';
import { AreaComumMorador, ReservaMorador, ViewMode } from '@/lib/types';
import { INITIAL_AREAS_MORADOR } from '@/lib/mobileStore';
import { mobileApi } from '@/lib/api';

interface Props {
  reservas: ReservaMorador[];
  onAddReserva: (nova: ReservaMorador) => void;
  viewMode?: ViewMode;
}

const PERIODS = [
  { id: 'MANHA' as const, label: 'Manhã', hours: '08:00 - 12:00', icon: Sunrise },
  { id: 'TARDE' as const, label: 'Tarde', hours: '13:00 - 17:00', icon: Sun },
  { id: 'NOITE' as const, label: 'Noite', hours: '18:00 - 23:00', icon: Moon },
  { id: 'INTEGRAL' as const, label: 'Dia Todo', hours: '08:00 - 23:00', icon: Sparkles },
];

export default function ReservasMoradorScreen({
  reservas,
  onAddReserva,
  viewMode = 'amplo',
}: Props) {
  const [areas, setAreas] = useState<AreaComumMorador[]>(INITIAL_AREAS_MORADOR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(INITIAL_AREAS_MORADOR[0].id);
  const [dataReserva, setDataReserva] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  );
  const [periodo, setPeriodo] = useState<'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'>('NOITE');
  const [convidados, setConvidados] = useState(15);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    async function loadAreas() {
      try {
        const data = await mobileApi.getAreasComuns();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AreaComumMorador[] = data.map((a: any) => ({
            id: a.id,
            nome: a.nome,
            descricao: a.descricao || '',
            capacidade_maxima: a.capacidade_maxima || a.capacidade || 30,
            foto_url: a.foto_url || '',
            regras: a.regras_uso || a.regras || '',
            dias_antecedencia_max: 30,
          }));
          setAreas(mapped);
          if (mapped[0]) setSelectedAreaId(mapped[0].id);
        }
      } catch (e) {
        console.warn('Erro ao buscar áreas comuns:', e);
      }
    }
    loadAreas();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const area = areas.find((a) => a.id === selectedAreaId);
    if (!area) return;

    const nova: ReservaMorador = {
      id: `res-m-${Date.now()}`,
      area_id: area.id,
      area_nome: area.nome,
      data_reserva: dataReserva,
      periodo,
      status: 'CONFIRMADO',
      convidados_estimados: convidados,
      observacoes,
      created_at: new Date().toISOString(),
    };

    onAddReserva(nova);
    setIsModalOpen(false);
  };

  const openForArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Topo Amplo */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white">Espaços & Lazer</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Reserve churrasqueiras, salão gourmet e quadras
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar</span>
        </button>
      </div>

      {/* Minhas Reservas Ativas Amplas */}
      {reservas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-300 px-1">
            Minhas Reservas Ativas ({reservas.length})
          </h3>
          <div className="space-y-3">
            {reservas.map((res) => (
              <div
                key={res.id}
                className="bg-[#141D30] border-2 border-indigo-500/30 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-indigo-400 uppercase">
                      {new Date(res.data_reserva + 'T12:00:00').toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-sm font-black text-white">
                      {new Date(res.data_reserva + 'T12:00:00').getDate()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate">{res.area_nome}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">
                      Turno: <strong className="text-cyan-300">{res.periodo}</strong>{' '}
                      {res.convidados_estimados ? `• ${res.convidados_estimados} convidados` : ''}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catálogo de Áreas Comuns Amplas */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 px-1">
          Espaços Disponíveis para Reserva
        </h3>
        <div className="space-y-4">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-[#141D30] border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-3"
            >
              {area.foto_url && (
                <div className="h-40 sm:h-48 w-full relative">
                  <img src={area.foto_url} alt={area.nome} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-emerald-300 shadow-md">
                    Livre para Reserva
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white">{area.nome}</h4>
                      <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        Capacidade para até {area.capacidade_maxima || 30} pessoas
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-5 pt-0 space-y-3">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{area.descricao}</p>

                {area.regras && (
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs text-indigo-300 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                    <span>{area.regras}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => openForArea(area.id)}
                  className="w-full min-h-[48px] py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar {area.nome}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Reserva Amplo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#141D30] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>Agendar Espaço Comum</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Espaço Escolhido */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Espaço Selecionado *
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} (Capacidade: {a.capacidade_maxima || 30} pessoas)
                    </option>
                  ))}
                </select>
              </div>

              {/* Data da Reserva */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Data do Evento *
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={dataReserva}
                    onChange={(e) => setDataReserva(e.target.value)}
                    required
                    className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Seletor de Período Amplo */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Turno / Período *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PERIODS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = periodo === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPeriodo(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <div>
                          <h5 className="text-xs sm:text-sm font-black">{p.label}</h5>
                          <p className={`text-[10px] sm:text-[11px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {p.hours}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantidade de Convidados Ampla com Controles */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Estimativa de Convidados
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConvidados(Math.max(1, convidados - 5))}
                    className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg border border-slate-700 flex items-center justify-center transition-transform active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={convidados}
                    onChange={(e) => setConvidados(Number(e.target.value))}
                    min={1}
                    className="flex-1 min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl text-center text-base sm:text-lg font-black text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setConvidados(convidados + 5)}
                    className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg border border-slate-700 flex items-center justify-center transition-transform active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Reserva</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

