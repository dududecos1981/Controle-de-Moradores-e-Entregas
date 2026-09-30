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
import { mobileApi } from '@/lib/api';

const DEFAULT_SYSTEM_USERS = [
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    nome: 'Carlos Eduardo (Morador)',
    email: 'morador@portaria.com',
    cpf: '000.000.000-04',
    telefone: '11999990004',
    bloco: 'A',
    apartamento: '101',
    perfil: 'MORADOR',
    senha: 'Morador@123456',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    nome: 'Porteiro de Plantão',
    email: 'porteiro@portaria.com',
    cpf: '000.000.000-03',
    telefone: '11999990002',
    bloco: 'A',
    apartamento: '101',
    perfil: 'PORTEIRO',
    senha: 'Porteiro@123456',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    nome: 'Administrador Geral',
    email: 'admin@portaria.com',
    cpf: '000.000.000-01',
    telefone: '11999990001',
    bloco: 'A',
    apartamento: '101',
    perfil: 'ADMINISTRADOR',
    senha: 'Admin@123456',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    nome: 'Síndico Condominial',
    email: 'sindico@portaria.com',
    cpf: '000.000.000-02',
    telefone: '11999990003',
    bloco: 'B',
    apartamento: 'PH01',
    perfil: 'SINDICO',
    senha: 'Sindico@123456',
  },
];

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanDigits = loginEmail.replace(/\D/g, '');

    // 1. Tenta login direto via API / Neon DB
    try {
      const res = await mobileApi.login(loginEmail.trim(), loginPassword);
      if (res?.user) {
        const user = {
          id: res.user.id,
          nome: res.user.nome_completo || res.user.nome,
          email: res.user.email,
          cpf: res.user.cpf,
          telefone: res.user.telefone || '',
          bloco: res.user.unidade_bloco || 'A',
          apartamento: res.user.unidade_numero || '101',
        };
        localStorage.setItem('morador_auth_token', res.accessToken || ('jwt-' + Date.now()));
        localStorage.setItem('morador_auth_user', JSON.stringify(user));
        router.push('/');
        return;
      }
    } catch (err: any) {
      console.warn('Tentando fallback local no mobile:', err?.message);
    }

    // 2. Busca nas contas padrão institucionais
    const defaultUser = DEFAULT_SYSTEM_USERS.find(
      (u) =>
        (u.email.toLowerCase() === cleanEmail || (u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits)) &&
        u.senha === loginPassword,
    );

    if (defaultUser) {
      localStorage.setItem('morador_auth_token', 'jwt-' + Date.now());
      localStorage.setItem('morador_auth_user', JSON.stringify(defaultUser));
      router.push('/');
      return;
    }

    // 3. Fallback local para contas registradas
    const registeredUsersStr = localStorage.getItem('morador_registered_users');
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];
    const matched = registeredUsers.find(
      (u: any) =>
        (u.email.toLowerCase() === cleanEmail || (u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits)) &&
        u.senha === loginPassword,
    );

    if (matched) {
      const user = matched;
      localStorage.setItem('morador_auth_token', 'jwt-' + Date.now());
      localStorage.setItem('morador_auth_user', JSON.stringify(user));
      router.push('/');
      return;
    }

    setErrorMessage('E-mail ou senha incorretos. Verifique seus dados ou cadastre-se no 1º Acesso.');
    setIsLoading(false);
  };

  const handlePrimeiroAcesso = async (e: React.FormEvent) => {
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
      nome_completo: nome.trim(),
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

    // 1. Tenta salvar na API / Neon DB
    try {
      await mobileApi.register({
        nome_completo: novoMorador.nome_completo,
        cpf: novoMorador.cpf,
        email: novoMorador.email,
        senha: novoMorador.senha,
        telefone: novoMorador.telefone,
        perfil: 'MORADOR',
        unidade_bloco: novoMorador.bloco,
        unidade_numero: novoMorador.apartamento,
      });
    } catch (err: any) {
      console.warn('Persistência remota mobile (fallback local ativo):', err?.message);
    }

    // 2. Persiste localmente
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
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
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

    // 1. Tenta redefinir na API / Neon DB
    try {
      await mobileApi.redefinirSenha(recEmail.trim(), recCpf.trim(), novaSenha);
      
      const registeredUsersStr = localStorage.getItem('morador_registered_users');
      if (registeredUsersStr) {
        let registeredUsers = JSON.parse(registeredUsersStr);
        const idx = registeredUsers.findIndex(
          (u: any) => u.email?.toLowerCase() === recEmail.trim().toLowerCase()
        );
        if (idx !== -1) {
          registeredUsers[idx].senha = novaSenha;
          localStorage.setItem('morador_registered_users', JSON.stringify(registeredUsers));
        }
      }

      setSuccessMessage('Senha redefinida no banco de dados com sucesso! Você já pode entrar.');
      setLoginEmail(recEmail.trim());
      setLoginPassword(novaSenha);

      setTimeout(() => {
        setActiveTab('login');
        setIsLoading(false);
      }, 1200);
      return;
    } catch (err: any) {
      console.warn('Tentando redefinição local:', err?.message);
    }

    // 2. Fallback local
    const registeredUsersStr = localStorage.getItem('morador_registered_users');
    let registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

    const userIndex = registeredUsers.findIndex(
      (u: any) =>
        u.email.toLowerCase() === recEmail.trim().toLowerCase() &&
        (u.cpf.replace(/\D/g, '') === recCpf.replace(/\D/g, '') || !u.cpf),
    );

    if (userIndex !== -1) {
      registeredUsers[userIndex].senha = novaSenha;
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
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md min-h-[100dvh] sm:min-h-[750px] bg-[#101726] sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 shadow-2xl flex flex-col justify-between p-5 sm:p-6 relative sm:ring-1 sm:ring-slate-700/50 text-white overflow-y-auto">
      {/* Imagem de Fundo dos Edifícios */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/images/building_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/85 via-[#101726]/90 to-[#070A11]" />
      {/* Luz de Fundo */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/25 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-600/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Topo Amplo */}
      <div className="pt-2 sm:pt-4 text-center space-y-2 z-10">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <Building className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">App do Morador</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">Controle de Encomendas, Convites & Portaria</p>
        </div>
      </div>

      {/* Card do Formulário Amplo */}
      <div className="bg-[#182238]/95 backdrop-blur-md border-2 border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-4 z-10">
        {/* Abas: Login vs Primeiro Acesso */}
        <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('primeiro_acesso');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'primeiro_acesso'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>1º Acesso</span>
          </button>
        </div>

        {/* Mensagens de Alerta */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 1: LOGIN */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                E-mail Cadastrado *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Senha *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('esqueci_senha');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setRecEmail(loginEmail);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[54px] bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no App</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Acesso Rápido de Demonstração */}
            <div className="pt-3 border-t border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                ⚡ Acesso Rápido de Demonstração:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('morador@portaria.com');
                    setLoginPassword('Morador@123456');
                    setErrorMessage(null);
                  }}
                  className="py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-cyan-300 text-left flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>👤 Morador</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('porteiro@portaria.com');
                    setLoginPassword('Porteiro@123456');
                    setErrorMessage(null);
                  }}
                  className="py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-emerald-300 text-left flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>👮 Porteiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@portaria.com');
                    setLoginPassword('Admin@123456');
                    setErrorMessage(null);
                  }}
                  className="py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-indigo-300 text-left flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>⚙️ Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('sindico@portaria.com');
                    setLoginPassword('Sindico@123456');
                    setErrorMessage(null);
                  }}
                  className="py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-amber-300 text-left flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>👔 Síndico</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('primeiro_acesso')}
                className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-bold"
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
          <form onSubmit={handlePrimeiroAcesso} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                Nome do Morador Titular *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Nome e Sobrenome"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  CPF *
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  required
                  placeholder="000.000.000-00"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Bloco / Torre *
                </label>
                <input
                  type="text"
                  list="mobile-login-blocos-list"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  placeholder="Ex: Bloco A, Torre 1"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
                <datalist id="mobile-login-blocos-list">
                  <option value="Bloco A" />
                  <option value="Bloco B" />
                  <option value="Bloco C" />
                  <option value="Bloco D" />
                  <option value="Torre 1" />
                  <option value="Torre 2" />
                  <option value="Quadra 1" />
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Apartamento *
                </label>
                <input
                  type="text"
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  required
                  placeholder="Ex: 101, PH01"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                E-mail para Login *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Senha *
                </label>
                <input
                  type={showCadastroPassword ? 'text' : 'password'}
                  value={senhaCadastro}
                  onChange={(e) => setSenhaCadastro(e.target.value)}
                  required
                  placeholder="Mín. 6 dígitos"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Confirmar Senha *
                </label>
                <input
                  type={showCadastroPassword ? 'text' : 'password'}
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  required
                  placeholder="Repita a senha"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={aceiteLGPD}
                onChange={(e) => setAceiteLGPD(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span className="text-xs text-slate-300 leading-snug">
                Aceito o tratamento dos meus dados para controle de encomendas e segurança conforme a LGPD.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[54px] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Criar Cadastro & Entrar</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: ESQUECI A SENHA (RECUPERAÇÃO) */}
        {/* ========================================================================= */}
        {activeTab === 'esqueci_senha' && (
          <form onSubmit={handleRecuperarSenha} className="space-y-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs sm:text-sm text-amber-200">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Recuperação de Senha
              </p>
              Digite seu E-mail e CPF cadastrados para definir uma nova senha.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                E-mail Cadastrado *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  required
                  placeholder="seuemail@exemplo.com"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                CPF do Morador *
              </label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={recCpf}
                  onChange={(e) => setRecCpf(formatCPF(e.target.value))}
                  required
                  placeholder="000.000.000-00"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    placeholder="Mín. 6 dígitos"
                    className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl pl-4 pr-10 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Confirmar Nova Senha *
                </label>
                <input
                  type={showNovaSenha ? 'text' : 'password'}
                  value={confirmaNovaSenha}
                  onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                  required
                  placeholder="Repita a senha"
                  className="w-full min-h-[52px] bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[54px] bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Redefinir Senha e Salvar</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs sm:text-sm text-slate-400 hover:text-white"
              >
                Lembrou sua senha? <span className="text-indigo-400 font-bold">Voltar ao Login</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Rodapé LGPD */}
      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2 z-10 pb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Conformidade com a LGPD (Lei nº 13.709/2018)</span>
      </div>
    </div>
  );
}
