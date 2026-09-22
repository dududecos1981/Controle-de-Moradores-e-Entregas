'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { INITIAL_ENCOMENDAS, INITIAL_VISITANTES, INITIAL_MORADORES } from '@/lib/store';
import { sounds } from '@/lib/SoundEffects';

export default function RelatoriosPage() {
  const [selectedTipo, setSelectedTipo] = useState<'ENCOMENDAS' | 'VISITANTES' | 'MORADORES' | 'VEICULOS'>('ENCOMENDAS');
  const [periodo, setPeriodo] = useState('MES_ATUAL');

  const handlePrint = () => {
    sounds.playBarcodeBeep();
    window.print();
  };

  const handleDownloadCSV = () => {
    sounds.playSuccessChime();
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `relatorio_${selectedTipo.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (selectedTipo === 'ENCOMENDAS') {
      headers = ['Data Recebimento', 'Unidade', 'Morador', 'Transportadora', 'Codigo Rastreio', 'Status', 'Data Retirada'];
      rows = INITIAL_ENCOMENDAS.map((e) => [
        `"${new Date(e.data_recebimento).toLocaleDateString('pt-BR')}"`,
        `"Bloco ${e.unidade_bloco} - ${e.unidade_numero}"`,
        `"${e.morador_nome}"`,
        `"${e.transportadora}"`,
        `"${e.codigo_barras_qrcode}"`,
        `"${e.status}"`,
        `"${e.data_retirada ? new Date(e.data_retirada).toLocaleDateString('pt-BR') : 'Pendente'}"`,
      ]);
    } else if (selectedTipo === 'VISITANTES') {
      headers = ['Data/Hora', 'Nome Completo', 'Tipo', 'Documento', 'Empresa', 'Placa Veiculo', 'Status Acesso'];
      rows = INITIAL_VISITANTES.map((v) => [
        `"${v.data_cadastro || ''}"`,
        `"${v.nome_completo}"`,
        `"${v.tipo}"`,
        `"${v.cpf || v.rg || ''}"`,
        `"${v.empresa || '-'}"`,
        `"${v.placa_veiculo || '-'}"`,
        `"${v.status_acesso || 'LIBERADO'}"`,
      ]);
    } else if (selectedTipo === 'MORADORES') {
      headers = ['Unidade', 'Nome Completo', 'CPF', 'Email', 'Telefone', 'Perfil', 'Status'];
      rows = INITIAL_MORADORES.map((m) => [
        `"Bloco ${m.unidade_bloco} - ${m.unidade_numero}"`,
        `"${m.nome_completo}"`,
        `"${m.cpf}"`,
        `"${m.email}"`,
        `"${m.telefone}"`,
        `"${m.perfil}"`,
        `"${m.status}"`,
      ]);
    } else {
      headers = ['Placa', 'Marca/Modelo', 'Tipo', 'Unidade', 'Vaga Garagem'];
      rows = [
        ['"BRA2E19"', '"Toyota Corolla Cross"', '"CARRO"', '"Bloco A - 101"', '"Vaga G-12"'],
        ['"MOT3A44"', '"Honda CB 500F"', '"MOTO"', '"Bloco A - 101"', '"Vaga Moto M-03"'],
        ['"XYZ8J99"', '"Jeep Compass Limited"', '"CARRO"', '"Bloco B - PH01"', '"Vaga Coberta PH-01/02"'],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            Central de Relatórios & Exportações
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Geração de relatórios operacionais para administração, auditoria e prestação de contas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-indigo-400" /> Imprimir / PDF
          </button>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Baixar Planilha (CSV)
          </button>
        </div>
      </div>

      {/* Seletores de Tipo de Relatório */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <button
          onClick={() => setSelectedTipo('ENCOMENDAS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedTipo === 'ENCOMENDAS'
              ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/30'
              : 'bg-[#121a2f] border-slate-800 hover:border-slate-700'
          }`}
        >
          <Package className="w-6 h-6 text-indigo-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Encomendas & Pacotes</h3>
          <p className="text-xs text-slate-400 mt-0.5">Histórico de recebimentos e baixas</p>
        </button>

        <button
          onClick={() => setSelectedTipo('VISITANTES')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedTipo === 'VISITANTES'
              ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/30'
              : 'bg-[#121a2f] border-slate-800 hover:border-slate-700'
          }`}
        >
          <Users className="w-6 h-6 text-emerald-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Fluxo de Visitantes</h3>
          <p className="text-xs text-slate-400 mt-0.5">Livro de portaria e prestadores</p>
        </button>

        <button
          onClick={() => setSelectedTipo('MORADORES')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedTipo === 'MORADORES'
              ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/30'
              : 'bg-[#121a2f] border-slate-800 hover:border-slate-700'
          }`}
        >
          <Building className="w-6 h-6 text-blue-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Censo de Moradores</h3>
          <p className="text-xs text-slate-400 mt-0.5">Relação cadastral por unidade</p>
        </button>

        <button
          onClick={() => setSelectedTipo('VEICULOS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedTipo === 'VEICULOS'
              ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/30'
              : 'bg-[#121a2f] border-slate-800 hover:border-slate-700'
          }`}
        >
          <Car className="w-6 h-6 text-amber-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Veículos & Garagem</h3>
          <p className="text-xs text-slate-400 mt-0.5">Mapeamento de vagas e placas</p>
        </button>
      </div>

      {/* Tabela Formatada para Visualização e Impressão */}
      <div className="bg-[#121a2f] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Cabeçalho de Impressão */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white print:text-black">
              Relatório Executivo: {selectedTipo}
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} | Condomínio Residencial
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-indigo-400 print:text-slate-800">
              SUPE Portaria PRO
            </span>
          </div>
        </div>

        {/* Conteúdo da Tabela */}
        <div className="overflow-x-auto">
          {selectedTipo === 'ENCOMENDAS' && (
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-400 print:text-black uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Recebido Em</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Morador</th>
                  <th className="py-3 px-4">Transportadora</th>
                  <th className="py-3 px-4">Código / Rastreio</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {INITIAL_ENCOMENDAS.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 px-4 font-mono">{new Date(e.data_recebimento).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4 font-bold">Bloco {e.unidade_bloco} - {e.unidade_numero}</td>
                    <td className="py-3 px-4">{e.morador_nome}</td>
                    <td className="py-3 px-4">{e.transportadora}</td>
                    <td className="py-3 px-4 font-mono">{e.codigo_barras_qrcode}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 print:text-black">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTipo === 'VISITANTES' && (
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-400 print:text-black uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nome do Visitante</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Status Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {INITIAL_VISITANTES.map((v) => (
                  <tr key={v.id}>
                    <td className="py-3 px-4 font-bold">{v.nome_completo}</td>
                    <td className="py-3 px-4">{v.tipo}</td>
                    <td className="py-3 px-4 font-mono">{v.cpf || v.rg || '-'}</td>
                    <td className="py-3 px-4">{v.empresa || '-'}</td>
                    <td className="py-3 px-4 font-mono">{v.placa_veiculo || '-'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 print:text-black">{v.status_acesso || 'LIBERADO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTipo === 'MORADORES' && (
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-400 print:text-black uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Nome Completo</th>
                  <th className="py-3 px-4">CPF</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {INITIAL_MORADORES.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-4 font-bold">Bloco {m.unidade_bloco} - {m.unidade_numero}</td>
                    <td className="py-3 px-4 font-bold">{m.nome_completo}</td>
                    <td className="py-3 px-4 font-mono">{m.cpf}</td>
                    <td className="py-3 px-4">{m.telefone}</td>
                    <td className="py-3 px-4">{m.perfil}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 print:text-black">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTipo === 'VEICULOS' && (
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-900/80 print:bg-slate-100 text-slate-400 print:text-black uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Marca / Modelo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Vaga Garagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-white print:text-black">BRA2E19</td>
                  <td className="py-3 px-4">Toyota Corolla Cross</td>
                  <td className="py-3 px-4">CARRO</td>
                  <td className="py-3 px-4 font-bold">Bloco A - 101</td>
                  <td className="py-3 px-4 font-mono text-amber-400 print:text-black">Vaga G-12 (Térreo)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-white print:text-black">MOT3A44</td>
                  <td className="py-3 px-4">Honda CB 500F</td>
                  <td className="py-3 px-4">MOTO</td>
                  <td className="py-3 px-4 font-bold">Bloco A - 101</td>
                  <td className="py-3 px-4 font-mono text-amber-400 print:text-black">Vaga Moto M-03</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-white print:text-black">XYZ8J99</td>
                  <td className="py-3 px-4">Jeep Compass Limited</td>
                  <td className="py-3 px-4">CARRO</td>
                  <td className="py-3 px-4 font-bold">Bloco B - PH01</td>
                  <td className="py-3 px-4 font-mono text-amber-400 print:text-black">Vaga Coberta PH-01/02</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
