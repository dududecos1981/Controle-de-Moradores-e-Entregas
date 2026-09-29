'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Package,
  Users,
  Car,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Building,
  HardDrive,
  Database,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Lock,
  Search,
  Activity,
  ArrowDownToLine,
  Clock,
  Sparkles,
  ShieldAlert,
  Server,
  Key,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import SoundEffects from '@/lib/SoundEffects';

type RelatorioTipo =
  | 'ENCOMENDAS'
  | 'VISITANTES'
  | 'PRESTADORES'
  | 'MORADORES'
  | 'VEICULOS'
  | 'OCORRENCIAS'
  | 'RESERVAS'
  | 'LGPD_AUDITORIA';

export default function RelatoriosPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'relatorios' | 'backup'>('relatorios');

  // Estados de Relatórios
  const [selectedTipo, setSelectedTipo] = useState<RelatorioTipo>('ENCOMENDAS');
  const [periodoFiltro, setPeriodoFiltro] = useState<'HOJE' | '7_DIAS' | 'MES_ATUAL' | 'TODOS'>('MES_ATUAL');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [relatorioData, setRelatorioData] = useState<any[]>([]);
  const [isLoadingRelatorio, setIsLoadingRelatorio] = useState(false);

  // Métricas Consolidadas
  const [metricas, setMetricas] = useState<any>(null);
  const [isLoadingMetricas, setIsLoadingMetricas] = useState(false);

  // Estados de Backup
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingSql, setIsExportingSql] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isAdmin = currentUser?.perfil === 'ADMINISTRADOR';

  // Carrega métricas gerais do banco de dados
  const loadMetricas = async () => {
    if (!isAdmin) return;
    setIsLoadingMetricas(true);
    try {
      const data = await api.getAdminMetricas();
      setMetricas(data);
    } catch (err) {
      console.warn('Erro ao carregar métricas administrativas:', err);
    } finally {
      setIsLoadingMetricas(false);
    }
  };

  // Carrega dados do relatório selecionado
  const loadRelatorio = async () => {
    if (!isAdmin) return;
    setIsLoadingRelatorio(true);

    let dataInicio: string | undefined;
    let dataFim: string | undefined;

    const now = new Date();
    if (periodoFiltro === 'HOJE') {
      dataInicio = now.toISOString().split('T')[0];
      dataFim = now.toISOString().split('T')[0];
    } else if (periodoFiltro === '7_DIAS') {
      const past7 = new Date(Date.now() - 7 * 86400000);
      dataInicio = past7.toISOString().split('T')[0];
    } else if (periodoFiltro === 'MES_ATUAL') {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    try {
      const res = await api.getAdminRelatorio(selectedTipo, {
        dataInicio,
        dataFim,
        status: statusFiltro !== 'TODOS' ? statusFiltro : undefined,
      });

      if (res && Array.isArray(res.dados)) {
        setRelatorioData(res.dados);
      } else {
        setRelatorioData([]);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do relatório:', err);
      setRelatorioData([]);
    } finally {
      setIsLoadingRelatorio(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadMetricas();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadRelatorio();
    }
  }, [selectedTipo, periodoFiltro, statusFiltro, isAdmin]);

  // Exportar CSV Formatado (Compatível com Excel em UTF-8 com BOM)
  const handleDownloadCSV = () => {
    if (relatorioData.length === 0) {
      alert('Não há dados para exportar no período selecionado.');
      return;
    }
    SoundEffects.playSuccess();

    let headers: string[] = [];
    let rows: string[][] = [];

    switch (selectedTipo) {
      case 'ENCOMENDAS':
        headers = ['ID', 'Código Rastreio', 'Unidade', 'Destinatário', 'Transportadora', 'Status', 'Data Recebimento', 'Data Retirada', 'Retirado Por'];
        rows = relatorioData.map((e) => [
          e.id || '',
          e.codigo_rastreio || e.codigo_barras_qrcode || '',
          `Bloco ${e.unidade_bloco || 'A'} - Apto ${e.unidade_numero || ''}`,
          e.morador_nome || '',
          e.transportadora || '',
          e.status || '',
          e.data_recebimento ? new Date(e.data_recebimento).toLocaleString('pt-BR') : '',
          e.data_retirada ? new Date(e.data_retirada).toLocaleString('pt-BR') : 'Pendente',
          e.retirado_por_nome || '',
        ]);
        break;

      case 'VISITANTES':
      case 'PRESTADORES':
        headers = ['ID', 'Nome Completo', 'Tipo', 'Documento', 'Telefone', 'Empresa', 'Placa Veículo', 'Unidade Destino', 'Status Acesso', 'Data Cadastro'];
        rows = relatorioData.map((v) => [
          v.id || '',
          v.nome_completo || '',
          v.tipo || '',
          v.cpf || '',
          v.telefone || '',
          v.empresa || '',
          v.placa_veiculo || '',
          `Bloco ${v.unidade_bloco || 'A'} - Apto ${v.unidade_numero || ''}`,
          v.ativo ? 'ATIVO / LIBERADO' : 'CONCLUÍDO',
          v.created_at ? new Date(v.created_at).toLocaleString('pt-BR') : '',
        ]);
        break;

      case 'MORADORES':
      case 'USUARIOS':
        headers = ['ID', 'Nome Completo', 'CPF', 'E-mail', 'Telefone', 'Perfil', 'Unidade', 'Status', 'Termo LGPD'];
        rows = relatorioData.map((m) => [
          m.id || '',
          m.nome_completo || '',
          m.cpf || '',
          m.email || '',
          m.telefone || '',
          m.perfil || '',
          `Bloco ${m.unidade_bloco || 'A'} - Apto ${m.unidade_numero || ''}`,
          m.status || '',
          m.lgpd_termo_aceito ? 'Aceito' : 'Pendente',
        ]);
        break;

      case 'VEICULOS':
        headers = ['Placa', 'Marca/Modelo', 'Tipo', 'Cor', 'Unidade', 'Vaga Garagem', 'Proprietário'];
        rows = relatorioData.map((veic) => [
          veic.placa || '',
          `${veic.marca || ''} ${veic.modelo || ''}`.trim(),
          veic.tipo || '',
          veic.cor || '',
          `Bloco ${veic.unidade_bloco || 'A'} - Apto ${veic.unidade_numero || ''}`,
          veic.vaga_garagem || '',
          veic.proprietario_nome || '',
        ]);
        break;

      case 'OCORRENCIAS':
        headers = ['ID', 'Título', 'Categoria', 'Status', 'Solicitante', 'Unidade', 'Data Abertura', 'Resposta Síndico'];
        rows = relatorioData.map((o) => [
          o.id || '',
          o.titulo || '',
          o.categoria || '',
          o.status || '',
          o.solicitante_nome || '',
          `Bloco ${o.unidade_bloco || 'A'} - Apto ${o.unidade_numero || ''}`,
          o.created_at ? new Date(o.created_at).toLocaleString('pt-BR') : '',
          o.resposta_sindico || 'Aguardando resposta',
        ]);
        break;

      case 'RESERVAS':
        headers = ['ID', 'Área de Lazer', 'Data Reserva', 'Período', 'Status', 'Qtd Convidados', 'Taxa (R$)', 'Responsável', 'Unidade'];
        rows = relatorioData.map((r) => [
          r.id || '',
          r.area_nome || '',
          r.data_reserva ? new Date(r.data_reserva + 'T12:00:00').toLocaleDateString('pt-BR') : '',
          r.periodo || '',
          r.status || '',
          String(r.quantidade_pessoas || 0),
          Number(r.taxa_reserva || 0).toFixed(2),
          r.responsavel_nome || '',
          `Bloco ${r.unidade_bloco || 'A'} - Apto ${r.unidade_numero || ''}`,
        ]);
        break;

      case 'LGPD_AUDITORIA':
        headers = ['ID', 'Ação', 'Tabela', 'ID Registro', 'Responsável', 'IP Origem', 'Data/Hora'];
        rows = relatorioData.map((a) => [
          a.id || '',
          a.acao || '',
          a.tabela || '',
          a.registro_id || '',
          a.usuario_responsavel_nome || '',
          a.ip_origem || '',
          a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : '',
        ]);
        break;
    }

    const csvLines = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
    ];

    // UTF-8 BOM (\uFEFF) para garantir acentuação correta no Microsoft Excel
    const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${selectedTipo.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Imprimir Relatório Formatado
  const handlePrint = () => {
    SoundEffects.playBeep();
    window.print();
  };

  // Exportar Backup JSON
  const handleExportJson = async () => {
    setIsExportingJson(true);
    SoundEffects.playSuccess();
    try {
      const data = await api.downloadAdminBackupJson();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_portaria_neon_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      loadMetricas();
    } catch (err: any) {
      alert(`Erro ao exportar backup JSON: ${err.message}`);
    } finally {
      setIsExportingJson(false);
    }
  };

  // Exportar Script SQL Dump
  const handleExportSql = async () => {
    setIsExportingSql(true);
    SoundEffects.playSuccess();
    try {
      const sqlText = await api.downloadAdminBackupSql();
      const blob = new Blob([sqlText], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_portaria_dump_${new Date().toISOString().slice(0, 10)}.sql`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Erro ao exportar backup SQL: ${err.message}`);
    } finally {
      setIsExportingSql(false);
    }
  };

  // Processar arquivo de restauração enviado pelo usuário
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.dados && json.versao_schema) {
          setRestorePreview(json);
          setRestoreFeedback(null);
        } else {
          alert('Arquivo JSON não possui a estrutura oficial de backup.');
          setRestoreFile(null);
          setRestorePreview(null);
        }
      } catch (err) {
        alert('O arquivo selecionado não é um JSON válido.');
        setRestoreFile(null);
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Executar Restauração
  const handleConfirmRestore = async () => {
    if (!restorePreview) return;
    setIsRestoring(true);
    try {
      const res = await api.restoreAdminBackup(restorePreview);
      setRestoreFeedback({ success: true, msg: res.mensagem || 'Dados restaurados com sucesso no Neon PostgreSQL!' });
      SoundEffects.playSuccess();
      setIsConfirmModalOpen(false);
      setRestoreFile(null);
      setRestorePreview(null);
      loadMetricas();
      loadRelatorio();
    } catch (err: any) {
      setRestoreFeedback({ success: false, msg: `Falha na restauração: ${err.message}` });
      SoundEffects.playError();
      setIsConfirmModalOpen(false);
    } finally {
      setIsRestoring(false);
    }
  };

  // Filtragem local por texto
  const filteredData = relatorioData.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some((val) => String(val || '').toLowerCase().includes(term));
  });

  // ===========================================================================
  // TELA DE ACESSO NEGADO SE NÃO FOR ADMINISTRADOR
  // ===========================================================================
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111827] border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Acesso Exclusivo do Administrador</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A emissão de relatórios gerenciais consolidados e o download/restauração de backups do banco de dados são restritos ao perfil <span className="text-rose-400 font-bold">ADMINISTRADOR</span> para conformidade e segurança da LGPD.
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
              <span>Seu Perfil Atual:</span>
              <span className="font-bold text-amber-400 uppercase">{currentUser?.perfil || 'PORTARIA'}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
              <span>Usuário:</span>
              <span className="text-slate-200 truncate">{currentUser?.email || 'Nenhum usuário logado'}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Para acessar, faça login com a conta <code className="text-indigo-400 font-bold font-mono">admin@portaria.com</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            Painel do Administrador: Relatórios & Backups
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Consolidação gerencial de dados, relatórios analíticos e segurança do Neon PostgreSQL.
          </p>
        </div>

        {/* Abas Superiores: Relatórios vs Backup */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('relatorios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'relatorios'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Relatórios Gerenciais
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            Backup do Banco Neon
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* ABA 1: CENTRAL DE RELATÓRIOS GERENCIAIS */}
      {/* ======================================================================= */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          {/* Cards de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Moradores
              </span>
              <p className="text-xl font-black text-white font-mono">
                {metricas?.usuarios?.moradores ?? '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {metricas?.unidades?.total ?? '-'} unidades cadastradas
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-400" /> Encomendas
              </span>
              <p className="text-xl font-black text-amber-400 font-mono">
                {metricas?.entregas?.pendentes ?? '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {metricas?.entregas?.total ?? '-'} total recebidas
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Visitantes
              </span>
              <p className="text-xl font-black text-cyan-400 font-mono">
                {metricas?.visitantes?.total ?? '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {metricas?.visitantes?.prestadores ?? '-'} prestadores
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-emerald-400" /> Veículos
              </span>
              <p className="text-xl font-black text-emerald-400 font-mono">
                {metricas?.veiculos?.total ?? '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {metricas?.veiculos?.carros ?? '-'} carros / {metricas?.veiculos?.motos ?? '-'} motos
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Ocorrências
              </span>
              <p className="text-xl font-black text-rose-400 font-mono">
                {metricas?.ocorrencias?.abertas ?? '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {metricas?.ocorrencias?.resolvidas ?? '-'} concluídas
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Trilha LGPD
              </span>
              <p className="text-xl font-black text-teal-400 font-mono">
                {metricas?.auditoria?.total ?? '-'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Logs de segurança</p>
            </div>
          </div>

          {/* Barra de Seleção e Filtros */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 print:hidden">
            {/* Botões dos Tipos de Relatório */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'ENCOMENDAS', label: 'Encomendas', icon: Package },
                { id: 'VISITANTES', label: 'Visitantes', icon: Users },
                { id: 'PRESTADORES', label: 'Prestadores de Serviço', icon: Building },
                { id: 'MORADORES', label: 'Moradores & Usuários', icon: Users },
                { id: 'VEICULOS', label: 'Veículos & Vagas', icon: Car },
                { id: 'OCORRENCIAS', label: 'Ocorrências', icon: AlertTriangle },
                { id: 'RESERVAS', label: 'Reservas de Lazer', icon: Calendar },
                { id: 'LGPD_AUDITORIA', label: 'Auditoria LGPD', icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedTipo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTipo(item.id as RelatorioTipo)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Controles de Período, Busca e Exportação */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                {/* Período */}
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPeriodoFiltro('HOJE')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      periodoFiltro === 'HOJE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodoFiltro('7_DIAS')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      periodoFiltro === '7_DIAS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Últimos 7 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodoFiltro('MES_ATUAL')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      periodoFiltro === 'MES_ATUAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mês Atual
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodoFiltro('TODOS')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                      periodoFiltro === 'TODOS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todo o Histórico
                  </button>
                </div>

                {/* Busca rápida */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar resultados..."
                    className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Exportar CSV (Excel)
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
              </div>
            </div>
          </div>

          {/* Cabeçalho de Impressão (Apenas no modo Print) */}
          <div className="hidden print:block p-4 border-b border-black text-black mb-4">
            <h2 className="text-xl font-bold">Relatório Oficial de Gestão Condominial</h2>
            <p className="text-xs">
              Tipo: {selectedTipo} | Gerado em: {new Date().toLocaleString('pt-BR')} | Administrador Responsável: {currentUser?.nome_completo || currentUser?.email}
            </p>
          </div>

          {/* Tabela de Dados Analíticos */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Registros Carregados ({filteredData.length})
              </h3>
              {isLoadingRelatorio && (
                <span className="text-xs text-indigo-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Carregando dados do Neon...
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    {selectedTipo === 'ENCOMENDAS' && (
                      <>
                        <th className="px-4 py-3">Data / Hora</th>
                        <th className="px-4 py-3">Código / Rastreio</th>
                        <th className="px-4 py-3">Unidade</th>
                        <th className="px-4 py-3">Destinatário</th>
                        <th className="px-4 py-3">Transportadora</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Retirada</th>
                      </>
                    )}
                    {(selectedTipo === 'VISITANTES' || selectedTipo === 'PRESTADORES') && (
                      <>
                        <th className="px-4 py-3">Data Entrada</th>
                        <th className="px-4 py-3">Nome Completo</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Documento</th>
                        <th className="px-4 py-3">Empresa / Placa</th>
                        <th className="px-4 py-3">Destino</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {selectedTipo === 'MORADORES' && (
                      <>
                        <th className="px-4 py-3">Unidade</th>
                        <th className="px-4 py-3">Nome do Morador</th>
                        <th className="px-4 py-3">CPF</th>
                        <th className="px-4 py-3">E-mail</th>
                        <th className="px-4 py-3">Telefone</th>
                        <th className="px-4 py-3">Perfil</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {selectedTipo === 'VEICULOS' && (
                      <>
                        <th className="px-4 py-3">Placa</th>
                        <th className="px-4 py-3">Marca / Modelo</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Cor</th>
                        <th className="px-4 py-3">Unidade</th>
                        <th className="px-4 py-3">Vaga</th>
                        <th className="px-4 py-3">Proprietário</th>
                      </>
                    )}
                    {selectedTipo === 'OCORRENCIAS' && (
                      <>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Categoria</th>
                        <th className="px-4 py-3">Unidade</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Resposta da Administração</th>
                      </>
                    )}
                    {selectedTipo === 'RESERVAS' && (
                      <>
                        <th className="px-4 py-3">Data Evento</th>
                        <th className="px-4 py-3">Área de Lazer</th>
                        <th className="px-4 py-3">Período</th>
                        <th className="px-4 py-3">Responsável</th>
                        <th className="px-4 py-3">Unidade</th>
                        <th className="px-4 py-3">Taxa (R$)</th>
                        <th className="px-4 py-3">Status</th>
                      </>
                    )}
                    {selectedTipo === 'LGPD_AUDITORIA' && (
                      <>
                        <th className="px-4 py-3">Data / Hora</th>
                        <th className="px-4 py-3">Ação Realizada</th>
                        <th className="px-4 py-3">Tabela</th>
                        <th className="px-4 py-3">Responsável</th>
                        <th className="px-4 py-3">IP Origem</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        Nenhum registro localizado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-slate-900/50 transition-colors">
                        {selectedTipo === 'ENCOMENDAS' && (
                          <>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                              {row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '-'}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                              {row.codigo_rastreio || row.codigo_barras_qrcode}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">
                              Bloco {row.unidade_bloco || 'A'} - {row.unidade_numero}
                            </td>
                            <td className="px-4 py-3">{row.morador_nome || 'Morador'}</td>
                            <td className="px-4 py-3 text-slate-400">{row.transportadora}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  row.status === 'RETIRADO'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-slate-400">
                              {row.data_retirada
                                ? `${new Date(row.data_retirada).toLocaleDateString('pt-BR')} (${row.retirado_por_nome || ''})`
                                : 'Aguardando'}
                            </td>
                          </>
                        )}

                        {(selectedTipo === 'VISITANTES' || selectedTipo === 'PRESTADORES') && (
                          <>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                              {row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">{row.nome_completo}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                {row.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{row.cpf || '-'}</td>
                            <td className="px-4 py-3">
                              {row.empresa || ''} {row.placa_veiculo ? `(${row.placa_veiculo})` : ''}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              Bloco {row.unidade_bloco || 'A'} - {row.unidade_numero}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  row.ativo
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                }`}
                              >
                                {row.ativo ? 'LIBERADO / DENTRO' : 'CONCLUÍDO'}
                              </span>
                            </td>
                          </>
                        )}

                        {selectedTipo === 'MORADORES' && (
                          <>
                            <td className="px-4 py-3 font-bold text-indigo-300">
                              Bloco {row.unidade_bloco || 'A'} - {row.unidade_numero}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">{row.nome_completo}</td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{row.cpf}</td>
                            <td className="px-4 py-3 text-slate-300">{row.email}</td>
                            <td className="px-4 py-3 text-slate-400">{row.telefone || '-'}</td>
                            <td className="px-4 py-3 font-semibold text-slate-200">{row.perfil}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}

                        {selectedTipo === 'VEICULOS' && (
                          <>
                            <td className="px-4 py-3 font-mono font-bold text-amber-400">{row.placa}</td>
                            <td className="px-4 py-3 font-semibold text-white">
                              {row.marca} {row.modelo}
                            </td>
                            <td className="px-4 py-3 text-slate-300">{row.tipo}</td>
                            <td className="px-4 py-3 text-slate-400">{row.cor || '-'}</td>
                            <td className="px-4 py-3">
                              Bloco {row.unidade_bloco || 'A'} - {row.unidade_numero}
                            </td>
                            <td className="px-4 py-3 font-mono text-cyan-400">{row.vaga_garagem || 'Vaga Comum'}</td>
                            <td className="px-4 py-3 text-slate-300">{row.proprietario_nome || '-'}</td>
                          </>
                        )}

                        {selectedTipo === 'OCORRENCIAS' && (
                          <>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                              {row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">{row.titulo}</td>
                            <td className="px-4 py-3 text-slate-300">{row.categoria}</td>
                            <td className="px-4 py-3">
                              Bloco {row.unidade_bloco || 'A'} - {row.unidade_numero}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  row.status === 'RESOLVIDO'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300 italic">
                              {row.resposta_sindico || 'Aguardando parecer do síndico'}
                            </td>
                          </>
                        )}

                        {selectedTipo === 'RESERVAS' && (
                          <>
                            <td className="px-4 py-3 font-bold text-white">
                              {row.data_reserva ? new Date(row.data_reserva + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-4 py-3 font-semibold text-cyan-300">{row.area_nome}</td>
                            <td className="px-4 py-3 text-slate-300">{row.periodo}</td>
                            <td className="px-4 py-3">{row.responsavel_nome}</td>
                            <td className="px-4 py-3">
                              Bloco {row.unidade_bloco || 'A'} - {row.unidade_numero}
                            </td>
                            <td className="px-4 py-3 font-mono text-emerald-400">
                              R$ {Number(row.taxa_reserva || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}

                        {selectedTipo === 'LGPD_AUDITORIA' && (
                          <>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                              {row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-indigo-400">{row.acao}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-300">{row.tabela}</td>
                            <td className="px-4 py-3 text-slate-200">{row.usuario_responsavel_nome || 'Sistema'}</td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{row.ip_origem || '127.0.0.1'}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* ABA 2: BACKUP DO BANCO NEON & CONTINUIDADE OPERACIONAL */}
      {/* ======================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Status do Neon DB */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 shrink-0">
                <Server className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">PostgreSQL Neon Serverless</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE & SINCRONIZADO
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Todas as tabelas do condomínio estão ativas e preparadas para extração integral ou restauração.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadMetricas}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 self-start md:self-auto transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar Status
            </button>
          </div>

          {/* Feedback de Restauração se houver */}
          {restoreFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-in fade-in ${
                restoreFeedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {restoreFeedback.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />}
              <span>{restoreFeedback.msg}</span>
            </div>
          )}

          {/* Cards de Ação: Exportar vs Restaurar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco 1: Exportação de Backup */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Exportar Backup Completo</h3>
                    <p className="text-xs text-slate-400">Gere cópia integral de todas as tabelas</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  O backup abrange unidades, usuários, moradores, encomendas, visitantes, veículos, ocorrências, reservas e logs da LGPD com hash de integridade SHA-256.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={isExportingJson}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isExportingJson ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Baixar Backup Estruturado (.JSON)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportSql}
                  disabled={isExportingSql}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isExportingSql ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-cyan-400" />
                      Exportar Script SQL Dump (.SQL)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bloco 2: Restauração Segura */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Restaurar Dados de Backup</h3>
                    <p className="text-xs text-slate-400">Envie um arquivo .json para restauração</p>
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl bg-slate-900/40 text-center space-y-2 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      {restoreFile ? restoreFile.name : 'Clique ou arraste o arquivo .JSON de backup'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Apenas arquivos gerados pelo sistema</p>
                  </div>
                </div>

                {/* Pré-visualização do Arquivo */}
                {restorePreview && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
                    <div className="flex items-center justify-between text-indigo-400 font-bold">
                      <span>Arquivo Validado:</span>
                      <span>v{restorePreview.versao_schema}</span>
                    </div>
                    <div>Data: {new Date(restorePreview.gerado_em).toLocaleString('pt-BR')}</div>
                    <div>Total de Registros: {restorePreview.estatisticas?.total_registros ?? '-'}</div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={!restorePreview || isRestoring}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                Iniciar Restauração de Dados
              </button>
            </div>
          </div>

          {/* Seção LGPD & Auditoria de Backups */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Diretrizes de Segurança & LGPD para Backups
            </h4>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Guarda Criptografada:</strong> Os arquivos de backup contêm dados de moradores e devem ser armazenados em locais com acesso restrito e seguro.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Auditoria Obrigatória:</strong> Cada geração e restauração de backup é automaticamente registrada com IP, usuário responsável e checksum na tabela de auditoria.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Rotina Recomendada:</strong> Exporte um backup semanal para garantir a continuidade dos serviços em caso de contingências.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE RESTAURAÇÃO */}
      {/* ======================================================================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182238] border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95 text-white">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-4">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Confirmar Restauração de Dados?</h3>
                <p className="text-xs text-amber-300/80">Esta operação importará os registros no Neon DB</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Você está prestes a restaurar <strong>{restorePreview?.estatisticas?.total_registros ?? 'vários'}</strong> registro(s) contidos no arquivo{' '}
                <code className="text-indigo-300 font-mono">{restoreFile?.name}</code>.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                ⚠️ Registros com chaves conflitantes serão preservados com segurança via <code className="text-emerald-400">ON CONFLICT DO NOTHING</code>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                {isRestoring ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Sim, Restaurar Agora
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
