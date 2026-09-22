'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  X,
  Info,
} from 'lucide-react';
import { AreaComumMorador, ReservaMorador } from '@/lib/types';
import { INITIAL_AREAS_MORADOR } from '@/lib/mobileStore';

interface Props {
  reservas: ReservaMorador[];
  onAddReserva: (nova: ReservaMorador) => void;
}

export default function ReservasMoradorScreen({ reservas, onAddReserva }: Props) {
  const [areas] = useState<AreaComumMorador[]>(INITIAL_AREAS_MORADOR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(INITIAL_AREAS_MORADOR[0].id);
  const [dataReserva, setDataReserva] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  );
  const [periodo, setPeriodo] = useState<'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'>('NOITE');
  const [convidados, setConvidados] = useState(15);
  const [observacoes, setObservacoes] = useState('');

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

  return (
    <div className="space-y-4 pb-20">
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Espaços & Lazer</h2>
          <p className="text-[11px] text-slate-300">Reserve churrasqueiras, salões e quadras</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Reservar Espaço
        </button>
      </div>

      {/* Minhas Reservas */}
      {reservas.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Minhas Reservas Ativas</h3>
          <div className="space-y-2">
            {reservas.map((res) => (
              <div
                key={res.id}
                className="bg-[#182238] border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase">
                      {new Date(res.data_reserva + 'T12:00:00').toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-xs font-black text-white">
                      {new Date(res.data_reserva + 'T12:00:00').getDate()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{res.area_nome}</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Período da {res.periodo} {res.convidados_estimados ? `• ${res.convidados_estimados} pessoas` : ''}
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catálogo de Áreas */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Espaços do Condomínio</h3>
        <div className="space-y-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-[#182238] border border-slate-700/80 rounded-2xl overflow-hidden shadow-md"
            >
              {area.foto_url && (
                <div className="h-28 w-full relative">
                  <img src={area.foto_url} alt={area.nome} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-300">
                    Disponível
                  </div>
                </div>
              )}
              <div className="p-3 space-y-1.5">
                <h4 className="text-xs font-bold text-white">{area.nome}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2">{area.descricao}</p>
                {area.regras && (
                  <p className="text-[10px] text-indigo-300 pt-1 border-t border-slate-800">
                    ℹ️ {area.regras}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182238] border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Agendar Espaço Comum
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Espaço Escolhido
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Data do Evento
                </label>
                <input
                  type="date"
                  value={dataReserva}
                  onChange={(e) => setDataReserva(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Período
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MANHA">Manhã (08h às 12h)</option>
                  <option value="TARDE">Tarde (13h às 17h)</option>
                  <option value="NOITE">Noite (18h às 23h)</option>
                  <option value="INTEGRAL">Integral (Dia Todo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Estimativa de Convidados
                </label>
                <input
                  type="number"
                  value={convidados}
                  onChange={(e) => setConvidados(Number(e.target.value))}
                  min={1}
                  placeholder="Qtd. de pessoas"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
