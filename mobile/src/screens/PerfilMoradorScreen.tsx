'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building, Phone, Mail, ShieldCheck, FileText, Bell, Lock, LogOut } from 'lucide-react';
import { CURRENT_MORADOR } from '@/lib/mobileStore';

export default function PerfilMoradorScreen() {
  const router = useRouter();
  const [morador, setMorador] = useState(CURRENT_MORADOR);

  useEffect(() => {
    const saved = localStorage.getItem('morador_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMorador((prev) => ({
          ...prev,
          nome: parsed.nome || prev.nome,
          email: parsed.email || prev.email,
          telefone: parsed.telefone || prev.telefone,
          bloco: parsed.bloco || prev.bloco,
          apartamento: parsed.apartamento || prev.apartamento,
        }));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('morador_auth_token');
    localStorage.removeItem('morador_auth_user');
    router.push('/login');
  };

  const initials = morador.nome
    ? morador.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MO';

  return (
    <div className="space-y-4 pb-20">
      {/* Cartão de Identificação do Morador */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-900/60 to-slate-900 border border-indigo-500/30 shadow-xl text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 text-indigo-300 font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          {initials}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{morador.nome || 'Morador'}</h3>
          <p className="text-xs text-indigo-300 font-medium">Morador(a) Titular</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/70 border border-indigo-800/50 rounded-full text-xs font-bold text-indigo-200">
          <Building className="w-3.5 h-3.5 text-cyan-400" />
          Bloco {morador.bloco} • Apto {morador.apartamento}
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
            <span className="font-semibold text-white truncate max-w-[180px]">{morador.email || 'Não informado'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              Telefone
            </span>
            <span className="font-semibold text-white">{morador.telefone || 'Não informado'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Condomínio
            </span>
            <span className="font-semibold text-white">{morador.condominio_nome}</span>
          </div>
        </div>
      </div>

      {/* Conformidade e Privacidade LGPD */}
      <div className="bg-[#141D30] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="text-xs font-bold">Privacidade & LGPD Ativa</h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Seus dados estão protegidos sob a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Suas fotos e encomendas são de acesso restrito à portaria.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Termo LGPD v1.0</span>
          <span className="text-emerald-400 font-bold">Aceito</span>
        </div>
      </div>

      {/* Botão de Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        <span>Sair da Minha Conta</span>
      </button>
    </div>
  );
}
