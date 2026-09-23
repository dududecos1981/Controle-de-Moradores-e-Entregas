'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  Building,
  Car,
  Phone,
  FileText,
  CheckCircle2,
  Clock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import WebcamCapture from '@/components/WebcamCapture';
import { Visitante, TipoVisitante } from '@/lib/types';
import { INITIAL_VISITANTES, INITIAL_UNIDADES } from '@/lib/store';
import { sounds } from '@/lib/SoundEffects';

export default function VisitantesPage() {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipo, setTipo] = useState<TipoVisitante>('VISITANTE');
  const [empresa, setEmpresa] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [bloco, setBloco] = useState('A');
  const [apartamento, setApartamento] = useState('101');
  const [observacoes, setObservacoes] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('portaria_visitantes');
    if (saved) {
      try {
        setVisitantes(JSON.parse(saved));
      } catch (e) {
        setVisitantes(INITIAL_VISITANTES);
      }
    } else {
      setVisitantes(INITIAL_VISITANTES);
      localStorage.setItem('portaria_visitantes', JSON.stringify(INITIAL_VISITANTES));
    }
  }, []);

  const saveVisitantes = (updated: Visitante[]) => {
    setVisitantes(updated);
    localStorage.setItem('portaria_visitantes', JSON.stringify(updated));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto.trim()) return;

    const newVisitante: Visitante = {
      id: `vis-${Date.now()}`,
      nome_completo: nomeCompleto.trim(),
      cpf: documento.trim() || undefined,
      telefone: telefone.trim() || undefined,
      tipo,
      empresa: empresa.trim() || undefined,
      placa_veiculo: placaVeiculo.trim() ? placaVeiculo.toUpperCase().trim() : undefined,
      unidade_destino_bloco: bloco,
      unidade_destino_numero: apartamento,
      foto_url: fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      ativo: true,
      status_acesso: 'DENTRO',
      data_cadastro: new Date().toISOString(),
      hora_entrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      observacoes: observacoes.trim() || undefined,
    };

    const updated = [newVisitante, ...visitantes];
    saveVisitantes(updated);

    sounds.playSuccessChime();
    setSuccessMessage(`Visitante ${nomeCompleto} cadastrado e liberado com sucesso!`);

    // Reset Form
    setNomeCompleto('');
    setDocumento('');
    setTelefone('');
    setEmpresa('');
    setPlacaVeiculo('');
    setObservacoes('');
    setFotoUrl('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleConcludeVisit = (id: string) => {
    const updated = visitantes.map((v) => {
      if (v.id === id) {
        return { ...v, status_acesso: 'CONCLUIDO' as const, ativo: false };
      }
      return v;
    });
    saveVisitantes(updated);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          Cadastro Rápido de Visitantes e Prestadores
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
            Webcam Integrada
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Capture a foto facial na portaria, registre os dados essenciais e autorize o acesso à unidade.
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-in fade-in shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid Principal: Formulário + Lista Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Formulário de Cadastro (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Módulo de Captura por Webcam / Câmera */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Foto Facial / Biométrica do Visitante
              </label>
              <WebcamCapture
                currentPhotoUrl={fotoUrl}
                onPhotoCaptured={(url) => setFotoUrl(url)}
              />
            </div>

            {/* Dados Cadastrais */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                2. Informações do Visitante ou Prestador
              </label>

              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Souza"
                  className="w-full bg-slate-950 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Documento e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    CPF ou RG *
                  </label>
                  <input
                    type="text"
                    required
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Ex: 123.456.789-00"
                    className="w-full bg-slate-950 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telefone / Celular
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-slate-950 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Tipo e Empresa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Classificação / Tipo
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoVisitante)}
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  >
                    <option value="VISITANTE">Visitante (Familiar/Amigo)</option>
                    <option value="PRESTADOR_SERVICO">Prestador de Serviço</option>
                    <option value="ENTREGADOR">Entregador / Delivery</option>
                    <option value="CORRETOR">Corretor de Imóveis</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Empresa / Prestadora
                  </label>
                  <input
                    type="text"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Ex: Enel / Net / EletroFix"
                    className="w-full bg-slate-950 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Unidade Destino e Placa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bloco / Torre Destino *
                  </label>
                  <input
                    type="text"
                    required
                    list="visitantes-blocos-list"
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                    placeholder="Ex: Bloco A, Torre 1"
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  />
                  <datalist id="visitantes-blocos-list">
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Apto / Sala / Casa *
                  </label>
                  <input
                    type="text"
                    required
                    value={apartamento}
                    onChange={(e) => setApartamento(e.target.value)}
                    placeholder="Ex: 101, 204, PH01"
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    value={placaVeiculo}
                    onChange={(e) => setPlacaVeiculo(e.target.value)}
                    placeholder="Ex: BRA2E19"
                    className="w-full bg-slate-950 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-700 uppercase focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Observações da Portaria
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Autorizado pelo morador via interfone às 14h20..."
                  className="w-full bg-slate-950 text-white text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Botão de Liberação */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Salvar Cadastro & Liberar Entrada
              </button>
            </div>
          </form>
        </div>

        {/* Coluna Direita: Visitantes Presentes no Condomínio (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Visitantes no Condomínio</h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                {visitantes.filter((v) => v.status_acesso === 'DENTRO').length} presentes
              </span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {visitantes.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.foto_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                      alt={v.nome_completo}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{v.nome_completo}</h4>
                      <p className="text-[11px] text-indigo-300 font-medium">
                        Destino: Bloco {v.unidade_destino_bloco} - Apto {v.unidade_destino_numero}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {v.tipo}
                        </span>
                        {v.placa_veiculo && (
                          <span className="text-[10px] font-mono text-cyan-400">
                            🚗 {v.placa_veiculo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {v.hora_entrada || '14:00'}
                    </span>
                    {v.status_acesso === 'DENTRO' ? (
                      <button
                        type="button"
                        onClick={() => handleConcludeVisit(v.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-800/40 px-2 py-1 rounded-lg transition-all"
                      >
                        <LogOut className="w-3 h-3" />
                        Registrar Saída
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 italic">
                        Saída Registrada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
