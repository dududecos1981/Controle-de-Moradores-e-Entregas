'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Building,
  KeyRound,
  UserPlus,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Phone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export default function MobileLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'primeiro_acesso' | 'esqueci_senha'>('login');

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados de Primeiro Acesso
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [bloco, setBloco] = useState('A');
  const [apartamento, setApartamento] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showCadastroPassword, setShowCadastroPassword] = useState(false);
  const [aceiteLGPD, setAceiteLGPD] = useState(true);

  // Estados de Recuperação de Senha
  const [recEmail, setRecEmail] = useState('');
  const [recCpf, setRecCpf] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  // Feedback e Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatCPF = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatPhone = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const registeredUsersStr = localStorage.getItem('morador_registered_users');
      const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];
      const matched = registeredUsers.find(
        (u: any) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.senha === loginPassword,
      );

      // Usuário master de emergência
      const isDefaultMorador =
        loginEmail.trim() === 'morador@condominio.com.br' && loginPassword === 'SenhaSegura123!';

      if (matched || isDefaultMorador) {
        const user = matched || {
          id: 'usr-morador-01',
          nome: 'Morador',
          email: loginEmail.trim(),
          telefone: '',
          bloco: 'A',
          apartamento: '101',
        };

        localStorage.setItem('morador_auth_token', 'jwt-' + Date.now());
        localStorage.setItem('morador_auth_user', JSON.stringify(user));
        router.push('/');
      } else {
        setErrorMessage('E-mail ou senha incorretos. Clique em "Esqueci a Senha" para redefinir.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handlePrimeiroAcesso = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (senhaCadastro.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 dígitos.');
      setIsLoading(false);
      return;
    }

    if (senhaCadastro !== confirmaSenha) {
      setErrorMessage('A confirmação de senha não confere.');
      setIsLoading(false);
      return;
    }

    if (!aceiteLGPD) {
      setErrorMessage('É obrigatório aceitar o termo LGPD para continuar.');
      setIsLoading(false);
      return;
    }

    const novoMorador = {
      id: `usr-mor-${Date.now()}`,
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: emailCadastro.trim().toLowerCase(),
      telefone: telefone.trim(),
      bloco,
      apartamento: apartamento.trim(),
      senha: senhaCadastro,
      condominio_nome: 'Condomínio Residencial',
      lgpd_aceite: true,
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      const registeredUsersStr = localStorage.getItem('morador_registered_users');
      const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

      const exists = registeredUsers.some(
        (u: any) => u.email.toLowerCase() === novoMorador.email || u.cpf === novoMorador.cpf,
      );

      if (exists) {
        setErrorMessage('Este e-mail ou CPF já possui cadastro. Faça o login ou recupere a senha.');
        setIsLoading(false);
        return;
      }

      registeredUsers.push(novoMorador);
      localStorage.setItem('morador_registered_users', JSON.stringify(registeredUsers));

      // Salva sessão
      localStorage.setItem('morador_auth_token', 'jwt-' + Date.now());
      localStorage.setItem('morador_auth_user', JSON.stringify(novoMorador));

      setSuccessMessage('Primeiro acesso concluído com sucesso!');
      setTimeout(() => router.push('/'), 800);
    }, 400);
  };

  const handleRecuperarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (novaSenha.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 dígitos.');
      setIsLoading(false);
      return;
    }

    if (novaSenha !== confirmaNovaSenha) {
      setErrorMessage('A confirmação da nova senha não confere.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const registeredUsersStr = localStorage.getItem('morador_registered_users');
      let registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

      const userIndex = registeredUsers.findIndex(
        (u: any) =>
          u.email.toLowerCase() === recEmail.trim().toLowerCase() &&
          (u.cpf.replace(/\D/g, '') === recCpf.replace(/\D/g, '') || !u.cpf),
      );

      const isDefaultMorador = recEmail.trim().toLowerCase() === 'morador@condominio.com.br';

      if (userIndex !== -1) {
        registeredUsers[userIndex].senha = novaSenha;
        localStorage.setItem('morador_registered_users', JSON.stringify(registeredUsers));
      } else if (isDefaultMorador) {
        registeredUsers.push({
          id: `usr-mor-rec-${Date.now()}`,
          nome: 'Morador Titular',
          cpf: recCpf.trim() || '000.000.000-00',
          email: recEmail.trim().toLowerCase(),
          bloco: 'A',
          apartamento: '101',
          senha: novaSenha,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('morador_registered_users', JSON.stringify(registeredUsers));
      } else {
        setErrorMessage('Nenhum cadastro de morador localizado com este E-mail e CPF.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Senha redefinida com sucesso! Você já pode entrar.');
      setLoginEmail(recEmail.trim());
      setLoginPassword(novaSenha);

      setTimeout(() => {
        setActiveTab('login');
        setIsLoading(false);
      }, 1200);
    }, 400);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md min-h-[100dvh] sm:min-h-[750px] bg-[#101726] sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 shadow-2xl flex flex-col justify-between p-5 sm:p-6 relative sm:ring-1 sm:ring-slate-700/50 text-white overflow-y-auto">
      {/* Imagem de Fundo dos Edifícios */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/images/building_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/85 via-[#101726]/90 to-[#070A11]/95 pointer-events-none" />

      {/* Luz de Fundo */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/25 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Topo */}
      <div className="pt-4 text-center space-y-2 z-10">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <Building className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">App do Morador</h1>
          <p className="text-[11px] text-slate-400">Controle de Encomendas & Convites</p>
        </div>
      </div>

      {/* Card do Formulário */}
      <div className="bg-[#182238]/95 backdrop-blur-md border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 my-4 z-10">
        {/* Abas: Login vs Primeiro Acesso vs Esqueci Senha */}
        <div className="grid grid-cols-3 bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('primeiro_acesso');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'primeiro_acesso'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>1º Acesso</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('esqueci_senha');
              setErrorMessage(null);
              setSuccessMessage(null);
              if (loginEmail && !recEmail) setRecEmail(loginEmail);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'esqueci_senha'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recuperar</span>
          </button>
        </div>

        {/* Mensagens de Alerta */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 1: LOGIN */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('esqueci_senha');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setRecEmail(loginEmail);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no App</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('primeiro_acesso')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Primeiro acesso? Cadastre seu apartamento
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: PRIMEIRO ACESSO */}
        {/* ========================================================================= */}
        {activeTab === 'primeiro_acesso' && (
          <form onSubmit={handlePrimeiroAcesso} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Nome do Morador Titular
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Nome e Sobrenome"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  required
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Bloco / Torre
                </label>
                <select
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="A">Bloco A</option>
                  <option value="B">Bloco B</option>
                  <option value="C">Bloco C</option>
                  <option value="TORRE_1">Torre 1</option>
                  <option value="TORRE_2">Torre 2</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Apartamento
                </label>
                <input
                  type="text"
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  required
                  placeholder="Ex: 101, PH01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                E-mail para Login
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Senha
                </label>
                <input
                  type={showCadastroPassword ? 'text' : 'password'}
                  value={senhaCadastro}
                  onChange={(e) => setSenhaCadastro(e.target.value)}
                  required
                  placeholder="Mín. 6 dígitos"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Confirmar
                </label>
                <input
                  type={showCadastroPassword ? 'text' : 'password'}
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  required
                  placeholder="Repita a senha"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={aceiteLGPD}
                onChange={(e) => setAceiteLGPD(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span className="text-[10px] text-slate-400 leading-tight">
                Aceito o tratamento dos meus dados para controle de encomendas e segurança conforme a LGPD.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Criar Cadastro & Entrar</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: ESQUECI A SENHA (RECUPERAÇÃO) */}
        {/* ========================================================================= */}
        {activeTab === 'esqueci_senha' && (
          <form onSubmit={handleRecuperarSenha} className="space-y-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
              <p className="font-bold flex items-center gap-1 mb-0.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Recuperação de Senha
              </p>
              Digite seu E-mail e CPF cadastrados para definir uma nova senha.
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                CPF do Morador
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recCpf}
                  onChange={(e) => setRecCpf(formatCPF(e.target.value))}
                  required
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    placeholder="Mín. 6 dígitos"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-7 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNovaSenha ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Confirmar
                </label>
                <input
                  type={showNovaSenha ? 'text' : 'password'}
                  value={confirmaNovaSenha}
                  onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                  required
                  placeholder="Repita a senha"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Redefinir Senha e Salvar</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Lembrou sua senha? <span className="text-indigo-400 font-semibold">Voltar ao Login</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Rodapé LGPD */}
      <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 z-10 pb-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Conformidade com a LGPD (Lei nº 13.709/2018)</span>
      </div>
    </div>
  );
}
