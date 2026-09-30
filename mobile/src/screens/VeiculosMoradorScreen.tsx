'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Bike,
  Key,
  ShieldCheck,
  X,
  Sparkles,
  CheckCircle2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { VeiculoMorador, ViewMode } from '@/lib/types';
import { INITIAL_VEICULOS_MORADOR } from '@/lib/mobileStore';
import { mobileApi } from '@/lib/api';

interface Props {
  viewMode?: ViewMode;
}

const VEHICLE_TYPES = [
  { id: 'CARRO' as const, label: 'Carro / SUV', icon: Car },
  { id: 'MOTO' as const, label: 'Motocicleta', icon: Bike },
  { id: 'BICICLETA' as const, label: 'Bicicleta / Patinete', icon: Bike },
];

export default function VeiculosMoradorScreen({ viewMode = 'amplo' }: Props) {
  const [veiculos, setVeiculos] = useState<VeiculoMorador[]>(INITIAL_VEICULOS_MORADOR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [tipo, setTipo] = useState<'CARRO' | 'MOTO' | 'BICICLETA' | 'OUTRO'>('CARRO');
  const [vaga, setVaga] = useState('Vaga G-12 (Térreo)');

  useEffect(() => {
    async function loadVeiculos() {
      try {
        const data = await mobileApi.getVeiculos();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: VeiculoMorador[] = data.map((v: any) => ({
            id: v.id,
            placa: v.placa,
            marca_modelo: `${v.marca || ''} ${v.modelo || ''}`.trim() || v.marca_modelo || 'Veículo',
            cor: v.cor || '',
            tipo: (v.tipo?.toUpperCase() || 'CARRO') as any,
            vaga_garagem: v.vaga_garagem || v.vaga || 'Vaga Padrão',
          }));
          setVeiculos(mapped);
          localStorage.setItem('morador_veiculos', JSON.stringify(mapped));
        } else {
          const saved = localStorage.getItem('morador_veiculos');
          if (saved) setVeiculos(JSON.parse(saved));
        }
      } catch (err) {
        console.warn('Erro ao buscar veículos via API:', err);
        const saved = localStorage.getItem('morador_veiculos');
        if (saved) {
          try {
            setVeiculos(JSON.parse(saved));
          } catch (e) {}
        }
      }
    }
    loadVeiculos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !modelo.trim()) return;

    let authUser: any = null;
    try {
      const saved = localStorage.getItem('morador_auth_user');
      if (saved) authUser = JSON.parse(saved);
    } catch (e) {}

    const cleanPlaca = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    const novo: VeiculoMorador = {
      id: `v-m-${Date.now()}`,
      placa: cleanPlaca,
      marca_modelo: modelo.trim(),
      cor: cor.trim() || 'Não especificada',
      tipo,
      vaga_garagem: vaga,
    };

    // Atualização otimista
    const updated = [...veiculos, novo];
    setVeiculos(updated);
    localStorage.setItem('morador_veiculos', JSON.stringify(updated));

    // Persistência Neon
    try {
      await mobileApi.createVeiculo({
        placa: novo.placa,
        marca_modelo: novo.marca_modelo,
        cor: novo.cor,
        tipo: novo.tipo,
        vaga_garagem: novo.vaga_garagem,
        unidade_bloco: authUser?.bloco || 'A',
        unidade_numero: authUser?.apartamento || '101',
      });
    } catch (err) {
      console.warn('Erro ao salvar veículo no backend:', err);
    }

    setPlaca('');
    setModelo('');
    setCor('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Topo Amplo */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white">Garagem & Veículos</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Veículos cadastrados com liberação automática de cancela
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Cartões de Veículos Amplos */}
      <div className="space-y-4">
        {veiculos.map((v) => (
          <div
            key={v.id}
            className="bg-[#141D30] border-2 border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  {v.tipo === 'MOTO' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-black text-white truncate">{v.marca_modelo}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cor: {v.cor} • Tipo: {v.tipo}
                  </p>
                </div>
              </div>

              {/* Placa Padrão Mercosul Estilizada */}
              <div className="rounded-xl overflow-hidden border-2 border-slate-700 bg-white shadow-md shrink-0 w-28 text-center">
                <div className="bg-[#003399] px-2 py-0.5 flex items-center justify-between text-[8px] text-white font-bold tracking-widest">
                  <span>BRASIL</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                </div>
                <div className="text-sm font-black font-mono tracking-widest text-slate-950 py-1 bg-white">
                  {v.placa}
                </div>
              </div>
            </div>

            {/* Informações da Vaga e Acesso */}
            <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-semibold">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Vaga Designada:</span>
              </span>
              <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-800/40">
                {v.vaga_garagem || 'Vaga G-12 (Térreo)'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar Veículo Amplo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#141D30] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-400" />
                <span>Cadastrar Veículo da Unidade</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo de Veículo */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Tipo de Veículo *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {VEHICLE_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = tipo === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipo(t.id)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Placa */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Placa do Veículo (Mercosul ou Padrão) *
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex: ABC1D23 ou ABC-1234"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-mono uppercase font-black tracking-widest text-cyan-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Modelo */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-200">
                  Marca & Modelo *
                </label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                  placeholder="Ex: Toyota Corolla Cross, Honda Civic..."
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Cor e Vaga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-200">
                    Cor do Veículo
                  </label>
                  <input
                    type="text"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    placeholder="Ex: Prata, Preto, Branco"
                    className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-200">
                    Vaga de Garagem
                  </label>
                  <input
                    type="text"
                    value={vaga}
                    onChange={(e) => setVaga(e.target.value)}
                    placeholder="Ex: Vaga G-12 (Térreo)"
                    className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                  />
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
                  <span>Salvar Veículo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

