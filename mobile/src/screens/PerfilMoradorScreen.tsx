'use client';

import React from 'react';
import { User, Building, Phone, Mail, ShieldCheck, FileText, Bell, Lock } from 'lucide-react';
import { CURRENT_MORADOR } from '@/lib/mobileStore';

export default function PerfilMoradorScreen() {
  return (
    <div className="space-y-5 pb-6">
      {/* Cartão de Identificação do Morador */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-900/60 to-slate-900 border border-indigo-500/30 shadow-xl text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 text-indigo-300 font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          {CURRENT_MORADOR.nome.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{CURRENT_MORADOR.nome}</h3>
          <p className="text-xs text-indigo-300 font-medium">Morador Titular</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/70 border border-indigo-800/50 rounded-full text-xs font-bold text-indigo-200">
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          Bloco {CURRENT_MORADOR.bloco} • Apto {CURRENT_MORADOR.apartamento}
        </div>
      </div>

      {/* Informações da Unidade */}
      <div className="bg-[#141D30] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
          Dados da Unidade
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              E-mail
            </span>
            <span className="font-semibold text-white">{CURRENT_MORADOR.email}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              Telefone
            </span>
            <span className="font-semibold text-white">{CURRENT_MORADOR.telefone}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Condomínio
            </span>
            <span className="font-semibold text-white">{CURRENT_MORADOR.condominio_nome}</span>
          </div>
        </div>
      </div>

      {/* Conformidade e Privacidade LGPD */}
      <div className="bg-[#141D30] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="text-xs font-bold">Privacidade & LGPD Ativa</h4>
        </div>
        <p className="text-[11px] text-slate-400">
          Seus dados estão protegidos sob a Lei Geral de Proteção de Dados (Lei 13.709/2018). As fotos e registros de encomendas são restritos à sua portaria.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Termo de Consentimento v1.0</span>
          <span className="text-emerald-400 font-bold">Aceito</span>
        </div>
      </div>
    </div>
  );
}
