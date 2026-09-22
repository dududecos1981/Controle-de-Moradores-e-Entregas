'use client';

import React, { useState } from 'react';
import {
  Car,
  Plus,
  Bike,
  Key,
  ShieldCheck,
  X,
} from 'lucide-react';
import { VeiculoMorador } from '@/lib/types';
import { INITIAL_VEICULOS_MORADOR } from '@/lib/mobileStore';

export default function VeiculosMoradorScreen() {
  const [veiculos, setVeiculos] = useState<VeiculoMorador[]>(INITIAL_VEICULOS_MORADOR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [tipo, setTipo] = useState<'CARRO' | 'MOTO' | 'BICICLETA' | 'OUTRO'>('CARRO');
  const [vaga, setVaga] = useState('Vaga G-12 (Térreo)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !modelo.trim()) return;

    const novo: VeiculoMorador = {
      id: `v-m-${Date.now()}`,
      placa: placa.trim().toUpperCase(),
      marca_modelo: modelo,
      cor,
      tipo,
      vaga_garagem: vaga,
    };

    setVeiculos([...veiculos, novo]);
    setPlaca('');
    setModelo('');
    setCor('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Meus Veículos & Garagem</h2>
          <p className="text-[11px] text-slate-400">Veículos cadastrados para acesso à portaria</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      {/* Cartões de Veículos */}
      <div className="space-y-3">
        {veiculos.map((v) => (
          <div
            key={v.id}
            className="bg-[#182238] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
                  {v.tipo === 'MOTO' ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-sm font-black font-mono tracking-wider text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {v.placa}
                  </span>
                  <p className="text-xs font-bold text-slate-200 mt-1">{v.marca_modelo}</p>
                </div>
              </div>

              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase">
                {v.tipo}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Vaga:
              </span>
              <span className="font-bold text-amber-400">{v.vaga_garagem || 'Vaga Padrão'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar Veículo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182238] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-400" />
                Cadastrar Veículo
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Placa (Mercosul/Padrão) *
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  required
                  placeholder="BRA2E19"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CARRO">Carro</option>
                  <option value="MOTO">Moto</option>
                  <option value="BICICLETA">Bicicleta</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Marca & Modelo *
                </label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                  placeholder="Ex: Corolla Cross"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  placeholder="Ex: Prata"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
