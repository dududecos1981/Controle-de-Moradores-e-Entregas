'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Building,
  Package,
  AlertTriangle,
  Users,
  Shield,
  MessageSquare,
  Clock,
  RefreshCw,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { ComunicadoIA } from '@/lib/types';
import { INITIAL_COMUNICADOS } from '@/lib/store';
import { api } from '@/lib/api';
import SoundEffects from '@/lib/SoundEffects';

export default function ComunicadosIAPage() {
  const [comunicados, setComunicados] = useState<ComunicadoIA[]>([]);
  const [tipo, setTipo] = useState<'ENCOMENDA' | 'MANUTENCAO' | 'ASSEMBLEIA' | 'SEGURANCA' | 'AVISO_GERAL'>('MANUTENCAO');
  const [destinatarios, setDestinatarios] = useState<'TODOS' | 'BLOCO' | 'UNIDADE_ESPECIFICA'>('BLOCO');
  const [bloco, setBloco] = useState('A');
  const [unidade, setUnidade] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [tom, setTom] = useState<'cordial' | 'formal' | 'urgente'>('cordial');
  
  // Estados de IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultadoGerado, setResultadoGerado] = useState<{
    titulo: string;
    mensagem: string;
    mensagem_whatsapp: string;
    sugestao_horario?: string;
  } | null>(null);

  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedZap, setCopiedZap] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'mural'>('whatsapp');

  useEffect(() => {
    const saved = localStorage.getItem('portaria_comunicados');
    if (saved) {
      try {
        setComunicados(JSON.parse(saved));
      } catch (e) {
        setComunicados(INITIAL_COMUNICADOS);
      }
    } else {
      setComunicados(INITIAL_COMUNICADOS);
      localStorage.setItem('portaria_comunicados', JSON.stringify(INITIAL_COMUNICADOS));
    }
  }, []);

  const saveComunicados = (updated: ComunicadoIA[]) => {
    setComunicados(updated);
    localStorage.setItem('portaria_comunicados', JSON.stringify(updated));
  };

  const handleGerarIA = async () => {
    if (!detalhes) {
      alert('Por favor, informe alguns detalhes ou tópicos da mensagem para a IA redigir.');
      return;
    }

    setIsGenerating(true);
    setResultadoGerado(null);

    try {
      const response = await api.gerarComunicadoIA({
        tipo,
        destinatarios,
        bloco: destinatarios === 'BLOCO' ? bloco : undefined,
        unidade: destinatarios === 'UNIDADE_ESPECIFICA' ? unidade : undefined,
        detalhes,
        tom,
      });

      if (response && response.data) {
        setResultadoGerado(response.data);
        SoundEffects.playSuccess();
      }
    } catch (err: any) {
      console.error('Erro ao gerar via IA:', err);
      alert('Erro ao processar solicitação de IA. Verifique sua conexão.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSalvarEEnviar = () => {
    if (!resultadoGerado) return;

    const novo: ComunicadoIA = {
      id: `com-${Date.now()}`,
      titulo: resultadoGerado.titulo,
      tipo,
      destinatarios,
      bloco_alvo: destinatarios === 'BLOCO' ? bloco : undefined,
      unidade_alvo: destinatarios === 'UNIDADE_ESPECIFICA' ? unidade : undefined,
      mensagem: resultadoGerado.mensagem,
      mensagem_whatsapp: resultadoGerado.mensagem_whatsapp,
      criado_em: new Date().toISOString(),
      enviado: true,
    };

    const updated = [novo, ...comunicados];
    saveComunicados(updated);
    SoundEffects.playSuccess();
    alert('Comunicado salvo e disparado para o mural digital e canais de notificação!');
  };

  const handleCopy = (text: string, type: 'app' | 'zap') => {
    navigator.clipboard.writeText(text);
    if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    } else {
      setCopiedZap(true);
      setTimeout(() => setCopiedZap(false), 2000);
    }
    SoundEffects.playBeep();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Assistente IA & Comunicados da Portaria
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Google Gemini Integrado
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Redija comunicados prediais, avisos de encomendas e alertas com inteligência artificial e formatação para WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Formulário de Configuração do Prompt (5 colunas) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Parâmetros do Comunicado</h3>
          </div>

          {/* Tipo de Mensagem */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tipo de Comunicado</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'MANUTENCAO', label: 'Manutenção', icon: AlertTriangle },
                { id: 'ENCOMENDA', label: 'Encomendas', icon: Package },
                { id: 'ASSEMBLEIA', label: 'Assembleia', icon: Users },
                { id: 'SEGURANCA', label: 'Segurança', icon: Shield },
                { id: 'AVISO_GERAL', label: 'Aviso Geral', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = tipo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTipo(item.id as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destinatários */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Público Alvo / Destinatários</label>
            <select
              value={destinatarios}
              onChange={(e) => setDestinatarios(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="TODOS">Todos os Moradores (Condomínio Todo)</option>
              <option value="BLOCO">Apenas um Bloco Específico</option>
              <option value="UNIDADE_ESPECIFICA">Unidade Específica (Apto)</option>
            </select>
          </div>

          {destinatarios === 'BLOCO' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Bloco / Torre Destino</label>
              <input
                type="text"
                list="comunicados-blocos-list"
                placeholder="Ex: Bloco A, Torre 1"
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <datalist id="comunicados-blocos-list">
                <option value="Bloco A" />
                <option value="Bloco B" />
                <option value="Bloco C" />
                <option value="Bloco D" />
                <option value="Torre 1" />
                <option value="Torre 2" />
                <option value="Quadra 1" />
              </datalist>
            </div>
          )}

          {destinatarios === 'UNIDADE_ESPECIFICA' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Número da Unidade (Apto)</label>
              <input
                type="text"
                placeholder="Ex: A-101 ou B-PH01"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Tom da Mensagem */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tom da Redação</label>
            <div className="flex items-center gap-2">
              {['cordial', 'formal', 'urgente'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTom(t as any)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs capitalize font-medium transition-all ${
                    tom === t
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Detalhes / Tópicos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Instruções / Pontos-Chave para a IA *
            </label>
            <textarea
              rows={4}
              placeholder="Ex: Manutenção no elevador social Bloco A terça-feira das 9h às 12h para troca de cabos de segurança..."
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Botão de Geração */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGerarIA}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-98"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Redigindo com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                ✨ Gerar Comunicado com IA
              </>
            )}
          </button>
        </div>

        {/* Painel Direito: Resultado Gerado & Histórico (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box de Resultado */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Pré-visualização do Comunicado</h3>
                {resultadoGerado && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Gerado com Sucesso
                  </span>
                )}
              </div>

              {resultadoGerado && (
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === 'whatsapp'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setActiveTab('mural')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === 'mural'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mural App
                  </button>
                </div>
              )}
            </div>

            {resultadoGerado ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <h4 className="text-sm font-black text-white">{resultadoGerado.titulo}</h4>
                  {resultadoGerado.sugestao_horario && (
                    <p className="text-[11px] text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Sugestão de envio: {resultadoGerado.sugestao_horario}
                    </p>
                  )}
                </div>

                {activeTab === 'whatsapp' ? (
                  <div className="p-4 bg-[#0b141a] border border-[#202c33] rounded-2xl relative group">
                    <pre className="text-xs text-emerald-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {resultadoGerado.mensagem_whatsapp}
                    </pre>

                    <button
                      onClick={() => handleCopy(resultadoGerado.mensagem_whatsapp, 'zap')}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-white text-xs font-semibold rounded-lg shadow transition-colors"
                    >
                      {copiedZap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedZap ? 'Copiado!' : 'Copiar Zap'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative group">
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {resultadoGerado.mensagem}
                    </p>

                    <button
                      onClick={() => handleCopy(resultadoGerado.mensagem, 'app')}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                    >
                      {copiedApp ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedApp ? 'Copiado!' : 'Copiar Texto'}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleSalvarEEnviar}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publicar no Mural & Disparar
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600 stroke-1" />
                <p className="text-xs font-medium">Preencha as instruções ao lado e clique em &quot;Gerar Comunicado com IA&quot;.</p>
                <p className="text-[11px] text-slate-600">O sistema gerará versões formatadas para WhatsApp e Mural Digital.</p>
              </div>
            )}
          </div>

          {/* Histórico de Comunicados */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Histórico de Comunicados Enviados ({comunicados.length})
            </h3>

            <div className="space-y-3">
              {comunicados.map((com) => (
                <div
                  key={com.id}
                  className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{com.titulo}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {com.tipo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{com.mensagem}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Destino: {com.destinatarios} {com.bloco_alvo ? `(Bloco ${com.bloco_alvo})` : ''}</span>
                    <span>{new Date(com.criado_em).toLocaleDateString('pt-BR')}</span>
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
