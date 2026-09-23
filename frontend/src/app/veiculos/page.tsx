'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Plus,
  Filter,
  Shield,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Bike,
  Truck,
  Hash,
  User,
  Key,
} from 'lucide-react';
import { VeiculoCompleto } from '@/lib/types';
import { api } from '@/lib/api';
import { sounds } from '@/lib/SoundEffects';

const INITIAL_VEICULOS: VeiculoCompleto[] = [];

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<VeiculoCompleto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [blocoFilter, setBlocoFilter] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    placa: '',
    marca_modelo: '',
    cor: '',
    tipo: 'CARRO' as const,
    unidade_bloco: 'A',
    unidade_numero: '101',
    proprietario_nome: '',
    vaga_garagem: '',
    observacoes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('portaria_veiculos');
    if (saved) {
      try {
        setVeiculos(JSON.parse(saved));
      } catch (e) {
        setVeiculos(INITIAL_VEICULOS);
      }
    } else {
      setVeiculos(INITIAL_VEICULOS);
      localStorage.setItem('portaria_veiculos', JSON.stringify(INITIAL_VEICULOS));
    }
  }, []);

  const saveVeiculos = (updated: VeiculoCompleto[]) => {
    setVeiculos(updated);
    localStorage.setItem('portaria_veiculos', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenModal = (veiculo?: VeiculoCompleto) => {
    if (veiculo) {
      setEditingId(veiculo.id);
      setFormData({
        placa: veiculo.placa,
        marca_modelo: veiculo.marca_modelo,
        cor: veiculo.cor || '',
        tipo: veiculo.tipo as any,
        unidade_bloco: veiculo.unidade_bloco,
        unidade_numero: veiculo.unidade_numero,
        proprietario_nome: veiculo.proprietario_nome || '',
        vaga_garagem: veiculo.vaga_garagem || '',
        observacoes: veiculo.observacoes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        placa: '',
        marca_modelo: '',
        cor: '',
        tipo: 'CARRO',
        unidade_bloco: 'A',
        unidade_numero: '101',
        proprietario_nome: '',
        vaga_garagem: '',
        observacoes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa.trim() || !formData.marca_modelo.trim()) return;

    const cleanPlaca = formData.placa.trim().toUpperCase();

    if (editingId) {
      const updated = veiculos.map((v) =>
        v.id === editingId
          ? {
              ...v,
              ...formData,
              placa: cleanPlaca,
            }
          : v,
      );
      saveVeiculos(updated);
      sounds.playSuccessChime();
      showToast(`Veículo ${cleanPlaca} atualizado com sucesso!`);
    } else {
      const novoVeiculo: VeiculoCompleto = {
        id: `v-${Date.now()}`,
        unidade_id: `u-${formData.unidade_bloco}-${formData.unidade_numero}`,
        unidade_bloco: formData.unidade_bloco,
        unidade_numero: formData.unidade_numero,
        proprietario_nome: formData.proprietario_nome || 'Morador Titular',
        placa: cleanPlaca,
        marca_modelo: formData.marca_modelo,
        cor: formData.cor,
        tipo: formData.tipo,
        vaga_garagem: formData.vaga_garagem,
        ativo: true,
        observacoes: formData.observacoes,
        created_at: new Date().toISOString(),
      };

      const updated = [novoVeiculo, ...veiculos];
      saveVeiculos(updated);
      sounds.playSuccessChime();
      showToast(`Veículo ${cleanPlaca} cadastrado com sucesso!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, placa: string) => {
    if (confirm(`Tem certeza que deseja excluir o veículo placa ${placa}?`)) {
      const updated = veiculos.filter((v) => v.id !== id);
      saveVeiculos(updated);
      showToast(`Veículo ${placa} removido.`);
    }
  };

  // Filtragem
  const filteredVeiculos = veiculos.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.placa.toLowerCase().includes(term) ||
      v.marca_modelo.toLowerCase().includes(term) ||
      (v.proprietario_nome && v.proprietario_nome.toLowerCase().includes(term)) ||
      (v.vaga_garagem && v.vaga_garagem.toLowerCase().includes(term)) ||
      `${v.unidade_bloco} ${v.unidade_numero}`.toLowerCase().includes(term);

    const matchesTipo = tipoFilter === 'TODOS' || v.tipo === tipoFilter;
    const matchesBloco = blocoFilter === 'TODOS' || v.unidade_bloco === blocoFilter;

    return matchesSearch && matchesTipo && matchesBloco;
  });

  const totalCarros = veiculos.filter((v) => v.tipo === 'CARRO').length;
  const totalMotos = veiculos.filter((v) => v.tipo === 'MOTO').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
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
            <Car className="w-7 h-7 text-indigo-400" />
            Controle de Veículos & Vagas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Identificação de placas, vagas demarcadas e permissões de acesso veicular
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Cadastrar Veículo
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121a2f] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Cadastrado</p>
            <p className="text-xl font-black text-white">{veiculos.length}</p>
          </div>
        </div>

        <div className="bg-[#121a2f] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Carros</p>
            <p className="text-xl font-black text-white">{totalCarros}</p>
          </div>
        </div>

        <div className="bg-[#121a2f] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Motos</p>
            <p className="text-xl font-black text-white">{totalMotos}</p>
          </div>
        </div>

        <div className="bg-[#121a2f] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Vagas Mapeadas</p>
            <p className="text-xl font-black text-white">{veiculos.filter((v) => v.vaga_garagem).length}</p>
          </div>
        </div>
      </div>

      {/* Barra de Busca & Filtros */}
      <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, modelo, morador..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="CARRO">Carros</option>
            <option value="MOTO">Motos</option>
            <option value="BICICLETA">Bicicletas</option>
          </select>

          <select
            value={blocoFilter}
            onChange={(e) => setBlocoFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Blocos</option>
            {Array.from(new Set(veiculos.map((v) => v.unidade_bloco).filter(Boolean))).map((b) => (
              <option key={b} value={b}>
                {b.toLowerCase().includes('bloco') || b.toLowerCase().includes('torre') || b.toLowerCase().includes('quadra') ? b : `Bloco ${b}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVeiculos.map((v) => (
          <div
            key={v.id}
            className="bg-[#121a2f] border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg space-y-4 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                  {v.tipo === 'MOTO' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-lg font-black font-mono tracking-wider text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {v.placa}
                  </span>
                  <p className="text-xs font-bold text-slate-300 mt-1">{v.marca_modelo}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                {v.tipo}
              </span>
            </div>

            <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> Unidade:
                </span>
                <span className="font-bold text-slate-200">
                  Bloco {v.unidade_bloco} - Apto {v.unidade_numero}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500" /> Titular:
                </span>
                <span className="font-semibold text-slate-300">{v.proprietario_nome}</span>
              </div>

              {v.vaga_garagem && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Key className="w-3.5 h-3.5 text-slate-500" /> Vaga Demarcada:
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {v.vaga_garagem}
                  </span>
                </div>
              )}

              {v.cor && (
                <div className="flex items-center justify-between">
                  <span>Cor Predominante:</span>
                  <span className="text-slate-300 font-medium">{v.cor}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
              <button
                onClick={() => handleOpenModal(v)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(v.id, v.placa)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a2f] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-400" />
                {editingId ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Placa (Mercosul/Padrão) *
                  </label>
                  <input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    required
                    placeholder="BRA2E19"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Tipo do Veículo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CARRO">Carro / Automóvel</option>
                    <option value="MOTO">Motocicleta</option>
                    <option value="BICICLETA">Bicicleta</option>
                    <option value="CAMINHAO">Caminhão / Utilitário</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Marca & Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.marca_modelo}
                    onChange={(e) => setFormData({ ...formData, marca_modelo: e.target.value })}
                    required
                    placeholder="Ex: Toyota Corolla Cross"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cor</label>
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    placeholder="Ex: Prata, Preto"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Bloco / Torre</label>
                  <input
                    type="text"
                    required
                    list="veiculos-blocos-list"
                    placeholder="Ex: Bloco A, Torre 1"
                    value={formData.unidade_bloco}
                    onChange={(e) => setFormData({ ...formData, unidade_bloco: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="veiculos-blocos-list">
                    <option value="Bloco A" />
                    <option value="Bloco B" />
                    <option value="Bloco C" />
                    <option value="Bloco D" />
                    <option value="Torre 1" />
                    <option value="Torre 2" />
                    <option value="Quadra 1" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Apto / Nº</label>
                  <input
                    type="text"
                    value={formData.unidade_numero}
                    onChange={(e) => setFormData({ ...formData, unidade_numero: e.target.value })}
                    required
                    placeholder="101"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Vaga Garagem</label>
                  <input
                    type="text"
                    value={formData.vaga_garagem}
                    onChange={(e) => setFormData({ ...formData, vaga_garagem: e.target.value })}
                    placeholder="G-12"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Nome do Morador / Titular
                </label>
                <input
                  type="text"
                  value={formData.proprietario_nome}
                  onChange={(e) => setFormData({ ...formData, proprietario_nome: e.target.value })}
                  placeholder="Nome do condômino responsável"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
                  placeholder="Observações adicionais..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
