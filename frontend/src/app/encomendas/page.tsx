'use client';

import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  ScanBarcode,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  QrCode,
  Package,
  Sparkles,
  Layers,
} from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Encomenda, StatusEntrega } from '@/lib/types';
import { INITIAL_ENCOMENDAS, INITIAL_UNIDADES } from '@/lib/store';
import { sounds } from '@/lib/SoundEffects';

export default function EncomendasPage() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [codigoLido, setCodigoLido] = useState('');
  const [bloco, setBloco] = useState('A');
  const [apartamento, setApartamento] = useState('101');
  const [moradorNome, setMoradorNome] = useState('Mariana Fernandes');
  const [transportadora, setTransportadora] = useState('Mercado Livre Express');
  const [descricaoPacote, setDescricaoPacote] = useState('Caixa Padrão');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('portaria_encomendas');
    if (saved) {
      try {
        setEncomendas(JSON.parse(saved));
      } catch (e) {
        setEncomendas(INITIAL_ENCOMENDAS);
      }
    } else {
      setEncomendas(INITIAL_ENCOMENDAS);
      localStorage.setItem('portaria_encomendas', JSON.stringify(INITIAL_ENCOMENDAS));
    }
  }, []);

  // Atualiza morador sugerido ao trocar unidade
  useEffect(() => {
    const unidadeEncontrada = INITIAL_UNIDADES.find(
      (u) => u.bloco === bloco && u.numero === apartamento,
    );
    if (unidadeEncontrada && unidadeEncontrada.moradores && unidadeEncontrada.moradores.length > 0) {
      setMoradorNome(unidadeEncontrada.moradores[0]);
    }
  }, [bloco, apartamento]);

  const saveEncomendas = (updated: Encomenda[]) => {
    setEncomendas(updated);
    localStorage.setItem('portaria_encomendas', JSON.stringify(updated));
  };

  const handleRegisterPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoLido.trim()) {
      sounds.playErrorTone();
      return;
    }

    const novaEncomenda: Encomenda = {
      id: `enc-${Date.now()}`,
      unidade_id: `u-${bloco}-${apartamento}`,
      unidade_bloco: bloco,
      unidade_numero: apartamento,
      morador_nome: moradorNome,
      codigo_barras_qrcode: codigoLido.trim(),
      transportadora,
      descricao_pacote: descricaoPacote,
      status: 'AGUARDANDO_RETIRADA',
      data_recebimento: new Date().toISOString(),
      porteiro_recebedor_nome: 'João Portaria',
    };

    const updated = [novaEncomenda, ...encomendas];
    saveEncomendas(updated);

    sounds.playSuccessChime();
    setSuccessBanner(
      `Encomenda #${codigoLido} registrada para ${moradorNome} (Bloco ${bloco}, Apto ${apartamento})!`,
    );

    // Limpa código lido para a próxima bipagem
    setCodigoLido('');
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          Registro de Encomendas & Leitura Óptica
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
            Leitor USB + Câmera
          </span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Bipe o código de barras ou aponte a câmera para registrar pacotes instantaneamente na portaria.
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {successBanner && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-in fade-in shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Leitor e Formulário (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleRegisterPackage} className="space-y-6">
            {/* Componente de Escaneamento */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Bipagem da Etiqueta / Código de Rastreio
              </label>
              <BarcodeScanner
                currentCode={codigoLido}
                onScan={(code) => setCodigoLido(code)}
              />
            </div>

            {/* Dados da Encomenda */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                2. Destinatário e Transportadora
              </label>

              {/* Unidade e Apartamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bloco
                  </label>
                  <select
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  >
                    <option value="A">Bloco A</option>
                    <option value="B">Bloco B</option>
                    <option value="C">Bloco C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Apto / Unidade
                  </label>
                  <select
                    value={apartamento}
                    onChange={(e) => setApartamento(e.target.value)}
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  >
                    <option value="101">101</option>
                    <option value="102">102</option>
                    <option value="201">201</option>
                    <option value="202">202</option>
                    <option value="PH01">PH01 (Cobertura)</option>
                  </select>
                </div>
              </div>

              {/* Nome do Morador */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Morador / Destinatário *
                </label>
                <input
                  type="text"
                  required
                  value={moradorNome}
                  onChange={(e) => setMoradorNome(e.target.value)}
                  placeholder="Nome do morador destinatário"
                  className="w-full bg-slate-950 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Transportadora e Tipo de Pacote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Transportadora
                  </label>
                  <select
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  >
                    <option value="Mercado Livre Express">Mercado Livre Express</option>
                    <option value="Amazon Logística">Amazon Logística</option>
                    <option value="Shopee Express">Shopee Express</option>
                    <option value="Correios (Sedex/PAC)">Correios (Sedex/PAC)</option>
                    <option value="Loggi Tecnologia">Loggi</option>
                    <option value="Total Express">Total Express</option>
                    <option value="Jadlog">Jadlog</option>
                    <option value="Outra / Entrega Direta">Outra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tipo de Volume / Pacote
                  </label>
                  <select
                    value={descricaoPacote}
                    onChange={(e) => setDescricaoPacote(e.target.value)}
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  >
                    <option value="Caixa Padrão">Caixa Padrão</option>
                    <option value="Caixa Grande / Eletrodoméstico">Caixa Grande</option>
                    <option value="Envelope / Documento">Envelope / Documento</option>
                    <option value="Sacola Plástica / Roupas">Sacola Flexível</option>
                    <option value="Alimentos / Perecível">Perecível / Farmácia</option>
                  </select>
                </div>
              </div>

              {/* Botão de Gravação */}
              <button
                type="submit"
                disabled={!codigoLido.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <PackagePlus className="w-5 h-5" />
                Registrar Recebimento na Portaria
              </button>
            </div>
          </form>
        </div>

        {/* Coluna Direita: Últimas Encomendas Recebidas (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Pacotes Recém-Recebidos</h3>
              </div>
              <span className="text-xs text-slate-400">Hoje</span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {encomendas.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {item.codigo_barras_qrcode}
                    </span>
                    {item.status === 'AGUARDANDO_RETIRADA' ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                        Aguardando Retirada
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        Entregue
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.morador_nome}</span>
                    <span className="text-slate-400 font-medium">
                      Bloco {item.unidade_bloco} - Apto {item.unidade_numero}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {item.transportadora}
                    </span>
                    <span>{new Date(item.data_recebimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
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
