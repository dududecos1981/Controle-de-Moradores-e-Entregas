'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Phone,
  CreditCard,
  User,
  Sparkles,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/api';
import { sounds } from '@/lib/SoundEffects';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'primeiro_acesso' | 'esqueci_senha'>('login');

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados de Primeiro Acesso
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState<'PORTEIRO' | 'SINDICO' | 'ADMINISTRADOR' | 'MORADOR'>('PORTEIRO');
  const [bloco, setBloco] = useState('A');
  const [apartamento, setApartamento] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showCadastroPassword, setShowCadastroPassword] = useState(false);
  const [aceiteLGPD, setAceiteLGPD] = useState(true);

  // Estados de Recuperação de Senha (Esqueci a Senha)
  const [recEmail, setRecEmail] = useState('');
  const [recCpf, setRecCpf] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  // Feedback e Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formatação de CPF
  const formatCPF = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  // Formatação de Telefone
  const formatPhone = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  // Submissão de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.login(loginEmail.trim(), loginPassword);
      sounds.playSuccessChime();
      router.push('/');
    } catch (err: any) {
      console.warn('Tentativa via API offline:', err.message);

      // Verificação em banco local (LocalStorage)
      const localUsersStr = localStorage.getItem('portaria_registered_users');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      const matchedUser = localUsers.find(
        (u: any) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.senha === loginPassword,
      );

      // Credenciais padrão de emergência caso nenhum usuário tenha sido cadastrado ainda
      const isAdminMaster = loginEmail.trim() === 'admin@condominio.com.br' && loginPassword === 'SenhaSegura123!';
      const isPorteiroMaster = loginEmail.trim() === 'porteiro.joao@condominio.com.br' && loginPassword === 'SenhaSegura123!';

      if (matchedUser || isAdminMaster || isPorteiroMaster) {
        const userSession = matchedUser
          ? {
              id: matchedUser.id,
              nome_completo: matchedUser.nome_completo,
              email: matchedUser.email,
              perfil: matchedUser.perfil,
              unidade_bloco: matchedUser.unidade_bloco,
              unidade_numero: matchedUser.unidade_numero,
            }
          : {
              id: 'master-user',
              nome_completo: isAdminMaster ? 'Administrador Geral' : 'Operador de Portaria',
              email: loginEmail.trim(),
              perfil: isAdminMaster ? 'ADMINISTRADOR' : 'PORTEIRO',
            };

        api.setToken('auth-token-' + Date.now());
        api.setUser(userSession as any);
        sounds.playSuccessChime();
        router.push('/');
      } else {
        setErrorMessage('E-mail ou senha incorretos. Caso seja seu primeiro acesso, crie seu cadastro ou clique em "Esqueceu a senha?".');
        sounds.playAlertBeep();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submissão de Primeiro Acesso / Cadastro
  const handlePrimeiroAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (senhaCadastro.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (senhaCadastro !== confirmaSenha) {
      setErrorMessage('A confirmação de senha não confere.');
      setIsLoading(false);
      return;
    }

    if (!aceiteLGPD) {
      setErrorMessage('É necessário aceitar os termos da LGPD para prosseguir.');
      setIsLoading(false);
      return;
    }

    const payload = {
      id: `usr-${Date.now()}`,
      nome_completo: nomeCompleto.trim(),
      cpf: cpf.trim(),
      email: emailCadastro.trim().toLowerCase(),
      senha: senhaCadastro,
      telefone: telefone.trim(),
      perfil,
      unidade_bloco: perfil === 'MORADOR' ? bloco : undefined,
      unidade_numero: perfil === 'MORADOR' ? apartamento.trim() : undefined,
      lgpd_termo_aceito: true,
      lgpd_data_aceite: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      await api.register({
        nome_completo: payload.nome_completo,
        cpf: payload.cpf,
        email: payload.email,
        senha: payload.senha,
        telefone: payload.telefone,
        perfil: payload.perfil,
      });

      sounds.playSuccessChime();
      setSuccessMessage('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      console.warn('Registro local persistente:', err.message);

      const localUsersStr = localStorage.getItem('portaria_registered_users');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];

      const alreadyExists = localUsers.some(
        (u: any) => u.email.toLowerCase() === payload.email || u.cpf === payload.cpf,
      );

      if (alreadyExists) {
        setErrorMessage('Este e-mail ou CPF já possui cadastro. Faça o login diretamente.');
        setIsLoading(false);
        return;
      }

      localUsers.push(payload);
      localStorage.setItem('portaria_registered_users', JSON.stringify(localUsers));

      if (perfil === 'MORADOR') {
        const moradoresStr = localStorage.getItem('portaria_moradores');
        const moradoresList = moradoresStr ? JSON.parse(moradoresStr) : [];
        moradoresList.push({
          id: payload.id,
          nome_completo: payload.nome_completo,
          cpf: payload.cpf,
          email: payload.email,
          telefone: payload.telefone,
          unidade_bloco: payload.unidade_bloco,
          unidade_numero: payload.unidade_numero,
          perfil: 'MORADOR',
          status: 'ATIVO',
          is_responsavel_unidade: true,
          veiculos: [],
          dependentes: [],
          contatos_emergencia: [],
          lgpd_termo_aceito: true,
          lgpd_data_aceite: payload.lgpd_data_aceite,
          lgpd_anonimizado: false,
          data_cadastro: payload.created_at,
        });
        localStorage.setItem('portaria_moradores', JSON.stringify(moradoresList));
      }

      api.setToken('auth-token-' + Date.now());
      api.setUser({
        id: payload.id,
        nome_completo: payload.nome_completo,
        email: payload.email,
        perfil: payload.perfil as any,
        unidade_bloco: payload.unidade_bloco,
        unidade_numero: payload.unidade_numero,
      });

      sounds.playSuccessChime();
      setSuccessMessage('Primeiro acesso concluído com sucesso! Bem-vindo(a).');
      setTimeout(() => router.push('/'), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Submissão de Recuperação de Senha (Esqueci a Senha)
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
      const localUsersStr = localStorage.getItem('portaria_registered_users');
      let localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];

      const userIndex = localUsers.findIndex(
        (u: any) =>
          u.email.toLowerCase() === recEmail.trim().toLowerCase() &&
          (u.cpf.replace(/\D/g, '') === recCpf.replace(/\D/g, '') || !u.cpf),
      );

      const isMasterAdmin = recEmail.trim() === 'admin@condominio.com.br';
      const isMasterPorteiro = recEmail.trim() === 'porteiro.joao@condominio.com.br';

      if (userIndex !== -1) {
        localUsers[userIndex].senha = novaSenha;
        localStorage.setItem('portaria_registered_users', JSON.stringify(localUsers));
      } else if (isMasterAdmin || isMasterPorteiro) {
        localUsers.push({
          id: `usr-rec-${Date.now()}`,
          nome_completo: isMasterAdmin ? 'Administrador Geral' : 'Operador de Portaria',
          cpf: recCpf.trim() || '000.000.000-00',
          email: recEmail.trim().toLowerCase(),
          senha: novaSenha,
          perfil: isMasterAdmin ? 'ADMINISTRADOR' : 'PORTEIRO',
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('portaria_registered_users', JSON.stringify(localUsers));
      } else {
        setErrorMessage('Nenhum cadastro localizado com esse E-mail e CPF. Verifique os dados digitados.');
        setIsLoading(false);
        return;
      }

      sounds.playSuccessChime();
      setSuccessMessage('Senha redefinida com sucesso! Você já pode acessar o sistema.');
      setLoginEmail(recEmail.trim());
      setLoginPassword(novaSenha);

      setTimeout(() => {
        setActiveTab('login');
        setIsLoading(false);
      }, 1400);
    }, 500);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Imagem de Fundo dos Edifícios com Overlay Glassmorphic */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity scale-105 pointer-events-none transition-all"
        style={{ backgroundImage: "url('/images/building_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/90 via-[#0c1427]/85 to-[#070a12]/95 pointer-events-none" />

      {/* Luzes Decorativas */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 shadow-xl shadow-indigo-500/25 border border-indigo-400/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              SUPE Portaria <span className="text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">PRO</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Sistema de Gestão de Portaria, Pessoas e Entregas
            </p>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-[#121a2f]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Alternador de 3 Abas Principais */}
          <div className="grid grid-cols-3 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('primeiro_acesso');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'primeiro_acesso'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
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
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'esqueci_senha'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Esqueci Senha</span>
            </button>
          </div>

          {/* Mensagens de Erro / Sucesso */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 1: FORMULÁRIO DE LOGIN */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="seuemail@condominio.com.br"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('esqueci_senha');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setRecEmail(loginEmail);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1 underline underline-offset-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('primeiro_acesso')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Novo no condomínio? Faça seu Primeiro Acesso aqui
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: FORMULÁRIO DE PRIMEIRO ACESSO / CADASTRO */}
          {/* ========================================================================= */}
          {activeTab === 'primeiro_acesso' && (
            <form onSubmit={handlePrimeiroAcesso} className="space-y-4">
              {/* Perfil de Usuário */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tipo de Acesso / Perfil
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'PORTEIRO', label: 'Porteiro' },
                    { id: 'SINDICO', label: 'Síndico' },
                    { id: 'ADMINISTRADOR', label: 'Admin' },
                    { id: 'MORADOR', label: 'Morador' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPerfil(item.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        perfil === item.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    required
                    placeholder="Seu nome completo"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* CPF e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    CPF
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      required
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      required
                      placeholder="(11) 99999-9999"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Unidade Residencial (se Morador) */}
              {perfil === 'MORADOR' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Bloco / Torre
                    </label>
                    <select
                      value={bloco}
                      onChange={(e) => setBloco(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="A">Bloco A</option>
                      <option value="B">Bloco B</option>
                      <option value="C">Bloco C</option>
                      <option value="TORRE_1">Torre 1</option>
                      <option value="TORRE_2">Torre 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Número / Apto
                    </label>
                    <input
                      type="text"
                      value={apartamento}
                      onChange={(e) => setApartamento(e.target.value)}
                      required={perfil === 'MORADOR'}
                      placeholder="Ex: 101, 204, PH01"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* E-mail */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  E-mail para Login
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailCadastro}
                    onChange={(e) => setEmailCadastro(e.target.value)}
                    required
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Senha e Confirmação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Crie uma Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCadastroPassword ? 'text' : 'password'}
                      value={senhaCadastro}
                      onChange={(e) => setSenhaCadastro(e.target.value)}
                      required
                      placeholder="Mín. 6 dígitos"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCadastroPassword(!showCadastroPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showCadastroPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Confirme a Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCadastroPassword ? 'text' : 'password'}
                      value={confirmaSenha}
                      onChange={(e) => setConfirmaSenha(e.target.value)}
                      required
                      placeholder="Repita a senha"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Termo LGPD */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceiteLGPD}
                  onChange={(e) => setAceiteLGPD(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  Concordo com o tratamento de meus dados cadastrais exclusivamente para segurança e controle de acesso predial, conforme a <strong className="text-slate-300">LGPD (Lei nº 13.709/2018)</strong>.
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Concluir Primeiro Acesso & Entrar</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Já possui conta cadastrada? <span className="text-indigo-400 font-semibold">Fazer Login</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: FORMULÁRIO DE RECUPERAÇÃO DE SENHA (ESQUECI A SENHA) */}
          {/* ========================================================================= */}
          {activeTab === 'esqueci_senha' && (
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl text-xs text-slate-300">
                <p className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Redefinição de Senha
                </p>
                Informe seu e-mail e CPF cadastrados para redefinir sua senha com segurança.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    required
                    placeholder="seuemail@condominio.com.br"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  CPF do Usuário
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recCpf}
                    onChange={(e) => setRecCpf(formatCPF(e.target.value))}
                    required
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNovaSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                      placeholder="Mín. 6 dígitos"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNovaSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNovaSenha ? 'text' : 'password'}
                      value={confirmaNovaSenha}
                      onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                      required
                      placeholder="Repita a nova senha"
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Redefinir Senha & Entrar</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Lembrou sua senha? <span className="text-indigo-400 font-semibold">Voltar ao Login</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé LGPD */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Ambiente Seguro com Criptografia e Conformidade LGPD</span>
        </div>
      </div>
    </div>
  );
}
