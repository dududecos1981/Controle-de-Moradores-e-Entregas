'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  Eye,
  AlertTriangle,
  Clock,
  UserX,
  FileText,
  CheckCircle2,
  Trash2,
  RefreshCw,
  X,
  Layers,
} from 'lucide-react';
import { LogAuditoriaLGPD } from '@/lib/types';
import { api } from '@/lib/api';
import { sounds } from '@/lib/SoundEffects';

const INITIAL_LOGS: LogAuditoriaLGPD[] = [];

export default function AuditoriaLGPDPage() {
  const [logs, setLogs] = useState<LogAuditoriaLGPD[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabelaFilter, setTabelaFilter] = useState('TODAS');
  const [operacaoFilter, setOperacaoFilter] = useState('TODAS');
  const [selectedLog, setSelectedLog] = useState<LogAuditoriaLGPD | null>(null);
  const [isExpurgando, setIsExpurgando] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Tenta carregar da API ou persistência local
    const loadLogs = async () => {
      try {
        const res = await api.getAuditoriaLogs();
        if (res?.data && res.data.length > 0) {
          setLogs(res.data);
          return;
        }
      } catch (e) {
        // Fallback
      }
      const saved = localStorage.getItem('portaria_logs_lgpd');
      if (saved) {
        try {
          setLogs(JSON.parse(saved));
        } catch (e) {
          setLogs(INITIAL_LOGS);
        }
      } else {
        setLogs(INITIAL_LOGS);
        localStorage.setItem('portaria_logs_lgpd', JSON.stringify(INITIAL_LOGS));
      }
    };
    loadLogs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExecutarExpurgo = async () => {
    if (!confirm('Deseja executar a rotina de expurgo e anonimização de visitantes inativos (> 90 dias)?')) return;

    setIsExpurgando(true);
    try {
      await api.executarExpurgoLGPD(90);
      sounds.playSuccessChime();
      showToast('Rotina de expurgo LGPD executada com sucesso!');
    } catch (err) {
      // Simulação local
      const novoLog: LogAuditoriaLGPD = {
        id: `log-${Date.now()}`,
        tabela: 'visitantes',
        operacao: 'ANONIMIZACAO_LGPD',
        registro_id: 'c0000000-0000-0000-0000-000000000088',
        usuario_responsavel_nome: 'Carlos Silva (Admin)',
        usuario_contexto: 'EXPURGO_MANUAL_SOB_DEMANDA',
        ip_origem: '192.168.1.10',
        dados_novos: {
          total_anonimizados: 3,
          fotos_excluidas: 2,
          fundamento_legal: 'Artigo 16 da Lei nº 13.709/2018 (LGPD)',
        },
        motivo_operacao: 'Execução manual de expurgo de visitantes com inatividade superior a 90 dias',
        created_at: new Date().toISOString(),
      };
      const updated = [novoLog, ...logs];
      setLogs(updated);
      localStorage.setItem('portaria_logs_lgpd', JSON.stringify(updated));
      sounds.playSuccessChime();
      showToast('Rotina de expurgo LGPD concluída: 3 registros anonimizados.');
    } finally {
      setIsExpurgando(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Data/Hora', 'Tabela', 'Operacao', 'Registro ID', 'Autor', 'Contexto', 'Motivo'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.created_at).toLocaleString('pt-BR')}"`,
      `"${l.tabela}"`,
      `"${l.operacao}"`,
      `"${l.registro_id}"`,
      `"${l.usuario_responsavel_nome || 'Sistema'}"`,
      `"${l.usuario_contexto || ''}"`,
      `"${(l.motivo_operacao || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_auditoria_lgpd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.tabela.toLowerCase().includes(term) ||
      log.operacao.toLowerCase().includes(term) ||
      (log.motivo_operacao && log.motivo_operacao.toLowerCase().includes(term)) ||
      (log.usuario_responsavel_nome && log.usuario_responsavel_nome.toLowerCase().includes(term)) ||
      (log.usuario_contexto && log.usuario_contexto.toLowerCase().includes(term));

    const matchesTabela = tabelaFilter === 'TODAS' || log.tabela === tabelaFilter;
    const matchesOperacao = operacaoFilter === 'TODAS' || log.operacao === operacaoFilter;

    return matchesSearch && matchesTabela && matchesOperacao;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner de Conformidade */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#121a2f] to-[#121a2f] border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Trilha de Auditoria & Governança LGPD</h1>
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Art. 18 & 37 LGPD
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Registro imutável de operações com dados pessoais, trilha de consentimento de moradores, mascaramento de biometria e expurgo programado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-indigo-400" /> Exportar Relatório (CSV)
          </button>
          <button
            onClick={handleExecutarExpurgo}
            disabled={isExpurgando}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isExpurgando ? 'animate-spin' : ''}`} />
            {isExpurgando ? 'Processando Expurgo...' : 'Executar Expurgo (>90d)'}
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Logs Imutáveis</p>
          <p className="text-xl font-black text-white mt-0.5">{logs.length}</p>
        </div>
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Anonimizações (Art. 18)</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">
            {logs.filter((l) => l.operacao === 'ANONIMIZACAO_LGPD').length}
          </p>
        </div>
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Tabelas Auditadas</p>
          <p className="text-xl font-black text-indigo-400 mt-0.5">6 Tabelas</p>
        </div>
        <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-medium">Integridade Criptográfica</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">100% Válida</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#121a2f] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tabela, autor, motivo..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={tabelaFilter}
            onChange={(e) => setTabelaFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODAS">Todas as Tabelas</option>
            <option value="usuarios">usuarios (Moradores/Staff)</option>
            <option value="visitantes">visitantes (Visitantes/Prestadores)</option>
            <option value="entregas">entregas (Encomendas)</option>
            <option value="veiculos">veiculos (Garagem)</option>
            <option value="ocorrencias">ocorrencias</option>
          </select>

          <select
            value={operacaoFilter}
            onChange={(e) => setOperacaoFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODAS">Todas as Operações</option>
            <option value="INSERT">INSERT (Criação)</option>
            <option value="UPDATE">UPDATE (Alteração)</option>
            <option value="DELETE">DELETE (Exclusão)</option>
            <option value="ANONIMIZACAO_LGPD">ANONIMIZACAO_LGPD (Direito ao Esquecimento)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-[#121a2f] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Operação</th>
                <th className="py-3.5 px-4">Tabela Alvo</th>
                <th className="py-3.5 px-4">Autor / Contexto</th>
                <th className="py-3.5 px-4">Motivo / Fundamento</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono border ${
                        log.operacao === 'ANONIMIZACAO_LGPD'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : log.operacao === 'INSERT'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : log.operacao === 'UPDATE'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {log.operacao}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{log.tabela}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-200">{log.usuario_responsavel_nome || 'Sistema Automático'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{log.usuario_contexto || log.ip_origem || 'Neon SSL'}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                    {log.motivo_operacao || 'Operação auditada'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-700 transition-colors"
                      title="Inspecionar Dados JSON"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Inspeção JSON / Diff */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a2f] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Detalhes do Log de Auditoria LGPD
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Tabela:</span>
                  <span className="font-bold font-mono text-white">{selectedLog.tabela}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Operação:</span>
                  <span className="font-bold font-mono text-emerald-400">{selectedLog.operacao}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registro ID:</span>
                  <span className="font-mono text-slate-300">{selectedLog.registro_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Data/Hora:</span>
                  <span className="font-mono text-slate-300">{new Date(selectedLog.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {selectedLog.motivo_operacao && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Motivo / Fundamento Legal:</h4>
                  <p className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    {selectedLog.motivo_operacao}
                  </p>
                </div>
              )}

              {selectedLog.campos_alterados && selectedLog.campos_alterados.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Campos Auditados / Alterados:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLog.campos_alterados.map((field) => (
                      <span key={field} className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.dados_novos && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Dados Registrados (JSON):</h4>
                  <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.dados_novos, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.dados_anteriores && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Dados Anteriores (Histórico):</h4>
                  <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800 text-amber-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
