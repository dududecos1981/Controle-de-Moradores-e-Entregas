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
  MessageCircle,
  Send,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  Phone,
  User,
  BellRing,
} from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Encomenda, StatusEntrega } from '@/lib/types';
import { INITIAL_ENCOMENDAS, INITIAL_UNIDADES } from '@/lib/store';
import { sounds } from '@/lib/SoundEffects';
import { WhatsAppNotification, NotificationLog } from '@/lib/WhatsAppNotification';

export default function EncomendasPage() {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [codigoLido, setCodigoLido] = useState('');
  const [bloco, setBloco] = useState('A');
  const [apartamento, setApartamento] = useState('101');
  const [moradorNome, setMoradorNome] = useState('Mariana Fernandes');
  const [moradorTelefone, setMoradorTelefone] = useState('11965432109');
  const [transportadora, setTransportadora] = useState('Mercado Livre Express');
  const [descricaoPacote, setDescricaoPacote] = useState('Caixa Padrão');
  const [autoSendNotification, setAutoSendNotification] = useState(true);

  // Estados de feedback de envio automático
  const [lastNotification, setLastNotification] = useState<{
    log: NotificationLog;
    encomenda: Encomenda;
    messageText: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  // Atualiza morador e telefone sugeridos ao trocar unidade
  useEffect(() => {
    if (!bloco || !apartamento) return;
    try {
      const savedMoradores = localStorage.getItem('portaria_moradores');
      if (savedMoradores) {
        const list = JSON.parse(savedMoradores);
        const morador = list.find(
          (m: any) =>
            m.unidade_bloco?.toLowerCase() === bloco.trim().toLowerCase() &&
            m.unidade_numero?.toLowerCase() === apartamento.trim().toLowerCase(),
        );
        if (morador) {
          setMoradorNome(morador.nome_completo);
          if (morador.telefone) setMoradorTelefone(morador.telefone);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const unidadeEncontrada = INITIAL_UNIDADES.find(
      (u) =>
        u.bloco.toLowerCase() === bloco.trim().toLowerCase() &&
        u.numero.toLowerCase() === apartamento.trim().toLowerCase(),
    );
    if (unidadeEncontrada && unidadeEncontrada.moradores && unidadeEncontrada.moradores.length > 0) {
      setMoradorNome(unidadeEncontrada.moradores[0]);
    }
  }, [bloco, apartamento]);

  const saveEncomendas = (updated: Encomenda[]) => {
    setEncomendas(updated);
    localStorage.setItem('portaria_encomendas', JSON.stringify(updated));
  };

  // Registro de pacote com DISPARO AUTOMÁTICO de notificação sem abrir nova aba
  const handleRegisterPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoLido.trim()) {
      sounds.playErrorTone();
      return;
    }

    setIsSending(true);

    const novaEncomenda: Encomenda = {
      id: `enc-${Date.now()}`,
      unidade_id: `u-${bloco}-${apartamento}`,
      unidade_bloco: bloco,
      unidade_numero: apartamento,
      morador_nome: moradorNome,
      morador_telefone: moradorTelefone,
      codigo_barras_qrcode: codigoLido.trim(),
      transportadora,
      descricao_pacote: descricaoPacote,
      status: 'AGUARDANDO_RETIRADA',
      data_recebimento: new Date().toISOString(),
      porteiro_recebedor_nome: 'João Portaria',
    };

    const updated = [novaEncomenda, ...encomendas];
    saveEncomendas(updated);

    // Disparo automático em segundo plano via WhatsApp & App do Morador
    if (autoSendNotification) {
      const res = await WhatsAppNotification.sendAutomaticPackageNotification({
        moradorNome,
        telefone: moradorTelefone,
        bloco,
        apartamento,
        transportadora,
        codigoPacote: novaEncomenda.codigo_barras_qrcode,
        descricaoPacote,
        porteiroNome: 'João Portaria',
      });

      setLastNotification({
        log: res.log,
        encomenda: novaEncomenda,
        messageText: res.messageText,
      });
    }

    setIsSending(false);
    sounds.playSuccessChime();

    // Limpa código lido para a próxima bipagem
    setCodigoLido('');
  };

  // Reenvia a notificação automaticamente em segundo plano
  const handleResendAutomatic = async (item: Encomenda) => {
    setIsSending(true);
    const res = await WhatsAppNotification.sendAutomaticPackageNotification({
      moradorNome: item.morador_nome,
      telefone: item.morador_telefone || '11965432109',
      bloco: item.unidade_bloco,
      apartamento: item.unidade_numero,
      transportadora: item.transportadora,
      codigoPacote: item.codigo_barras_qrcode,
      descricaoPacote: item.descricao_pacote,
      porteiroNome: 'João Portaria',
    });
    setLastNotification({
      log: res.log,
      encomenda: item,
      messageText: res.messageText,
    });
    setIsSending(false);
    sounds.playSuccessChime();
  };

  // Copia o texto da mensagem para a área de transferência
  const handleCopyMessage = () => {
    if (!lastNotification) return;
    navigator.clipboard.writeText(lastNotification.messageText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
          Bipe o código de barras ou use a câmera para registrar e notificar o morador automaticamente.
        </p>
      </div>

      {/* Painel de Confirmação e Envio Automático em Segundo Plano (Sem abrir telas) */}
      {lastNotification && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/60 border border-emerald-500/40 shadow-2xl shadow-emerald-950/50 animate-in fade-in space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  Notificação Enviada Automaticamente!
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
                    <Zap className="w-3 h-3 text-amber-300" />
                    WhatsApp & App do Morador
                  </span>
                </h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Encomenda <strong className="text-white font-mono">#{lastNotification.encomenda.codigo_barras_qrcode}</strong> entregue no sistema para <strong className="text-white">{lastNotification.encomenda.morador_nome}</strong> ({lastNotification.encomenda.unidade_bloco} - {lastNotification.encomenda.unidade_numero}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showDetails ? 'Ocultar Mensagem' : 'Ver Mensagem'}
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>
          </div>

          {/* Prévia Expansível da Mensagem Enviada */}
          {showDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {lastNotification.messageText}
            </div>
          )}
        </div>
      )}

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Leitor e Formulário (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleRegisterPackage} className="space-y-6">
            {/* Componente de Escaneamento com Câmera e Leitor */}
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
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Destinatário e Transportadora
                </label>

                {/* Alternador de Envio Automático */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoSendNotification}
                    onChange={(e) => setAutoSendNotification(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-300" />
                    Envio Automático (WhatsApp & Push)
                  </span>
                </label>
              </div>

              {/* Unidade e Apartamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bloco / Torre / Quadra *
                  </label>
                  <input
                    type="text"
                    required
                    list="encomendas-blocos-list"
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                    placeholder="Ex: Bloco A, Torre 1"
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  />
                  <datalist id="encomendas-blocos-list">
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
                    Apto / Sala / Casa / Unidade *
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
              </div>

              {/* Morador / Destinatário e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Morador / Destinatário *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={moradorNome}
                      onChange={(e) => setMoradorNome(e.target.value)}
                      placeholder="Nome do morador"
                      className="w-full bg-slate-950 text-white text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WhatsApp do Morador (DDD + Número) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={moradorTelefone}
                      onChange={(e) => setMoradorTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-slate-950 text-white text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Transportadora e Descrição */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Empresa / Transportadora *
                  </label>
                  <select
                    value={transportadora}
                    onChange={(e) => setTransportadora(e.target.value)}
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  >
                    <option value="Mercado Livre Express">Mercado Livre Express</option>
                    <option value="Amazon Logistics">Amazon Logistics</option>
                    <option value="Correios (Sedex / PAC)">Correios (Sedex / PAC)</option>
                    <option value="Shopee Xpress">Shopee Xpress</option>
                    <option value="Jadlog">Jadlog</option>
                    <option value="Total Express">Total Express</option>
                    <option value="FedEx / DHL">FedEx / DHL</option>
                    <option value="iFood / Delivery">iFood / Delivery</option>
                    <option value="Outra / Particular">Outra / Particular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Descrição do Volume
                  </label>
                  <input
                    type="text"
                    value={descricaoPacote}
                    onChange={(e) => setDescricaoPacote(e.target.value)}
                    placeholder="Ex: Caixa média, Envelope pardo, Sacola"
                    className="w-full bg-slate-950 text-white text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Botão de Registro com Feedback de Envio Automático */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <PackagePlus className="w-5 h-5" />
                <span>
                  {isSending
                    ? 'Registrando e Notificando Morador...'
                    : 'Registrar Encomenda & Notificar Morador Automaticamente'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Coluna Direita: Feed de Pacotes Recebidos Hoje (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Pacotes Recém-Recebidos</h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">Hoje</span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {encomendas.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {item.codigo_barras_qrcode}
                    </span>
                    {item.status === 'AGUARDANDO_RETIRADA' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Aguardando Retirada
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
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
                    <span>
                      {new Date(item.data_recebimento).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {item.status === 'AGUARDANDO_RETIRADA' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleResendAutomatic(item)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold transition-colors"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        Reenviar Notificação Automática
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
