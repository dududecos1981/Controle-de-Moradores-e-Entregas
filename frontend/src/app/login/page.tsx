'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Building,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SoundEffects from '@/lib/SoundEffects';

export default function LoginPage() {
  const { login } = useAuth();
  const [tipoAcesso, setTipoAcesso] = useState<'PORTARIA' | 'MORADOR'>('PORTARIA');
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectTipo = (tipo: 'PORTARIA' | 'MORADOR') => {
    setTipoAcesso(tipo);
    setErrorMessage(null);
    setIdentificador('');
    setSenha('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identificador.trim() || !senha.trim()) {
      setErrorMessage('Por favor, informe seu identificador (E-mail/CPF) e senha de acesso.');
      SoundEffects.playError();
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(identificador, senha);
      if (res.success) {
        SoundEffects.playSuccess();
      } else {
        setErrorMessage(res.message || 'Credenciais inválidas. Verifique os dados informados.');
        SoundEffects.playError();
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
      SoundEffects.playError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Container Principal */}
      <div className="w-full max-w-md space-y-6">
        {/* Header com Logotipo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            SUPE <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">PRO</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sistema Unificado de Portaria, Moradores e Entregas
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-[#0F172A]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Seletor de Tipo de Acesso */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 gap-1">
            <button
              type="button"
              onClick={() => handleSelectTipo('PORTARIA')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tipoAcesso === 'PORTARIA'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Portaria / Gestão
            </button>
            <button
              type="button"
              onClick={() => handleSelectTipo('MORADOR')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tipoAcesso === 'MORADOR'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Morador / App
            </button>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/50 flex items-start gap-3 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identificador */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{tipoAcesso === 'PORTARIA' ? 'E-mail Institucional ou CPF' : 'E-mail do Morador ou CPF'}</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder={tipoAcesso === 'PORTARIA' ? 'porteiro@condominio.com.br' : 'seu-email@dominio.com ou CPF'}
                  className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Senha de Acesso</label>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">Esqueceu?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 text-white text-xs pl-10 pr-10 py-3 rounded-xl border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Lembrar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                Manter conectado neste dispositivo
              </label>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                'Autenticando...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar no {tipoAcesso === 'PORTARIA' ? 'Painel da Portaria' : 'App do Morador'}
                </>
              )}
            </button>
          </form>

          {/* Links de Cadastro */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Ainda não possui acesso?{' '}
              <Link href="/cadastro" className="text-cyan-400 font-bold hover:underline">
                Primeiro cadastro
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé de Segurança e LGPD */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Criptografia SSL Nativa
          </span>
          <span>•</span>
          <span>Conforme Lei 13.709/2018 (LGPD)</span>
        </div>
      </div>
    </div>
  );
}
