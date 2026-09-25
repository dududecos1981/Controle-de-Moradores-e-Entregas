'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PerfilUsuario, CargoColaborador, TurnoTrabalho, Colaborador } from '@/lib/types';
import { INITIAL_UNIDADES } from '@/lib/store';

import { api } from '@/lib/api';

export type { PerfilUsuario };

export interface UsuarioAuth {
  id: string;
  nome_completo: string;
  email: string;
  cpf?: string;
  telefone?: string;
  perfil: PerfilUsuario;
  unidade_bloco?: string;
  unidade_numero?: string;
  is_responsavel_unidade?: boolean;
  avatar_url?: string;
  lgpd_termo_aceito?: boolean;
}

export interface RegisterMoradorData {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  unidade_bloco: string;
  unidade_numero: string;
  senha: string;
}

export interface RegisterColaboradorData {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: CargoColaborador;
  turno?: TurnoTrabalho;
  senha: string;
  foto_url?: string;
  matricula?: string;
}

interface AuthContextType {
  currentUser: UsuarioAuth | null;
  isLoading: boolean;
  login: (identificador: string, senha: string) => Promise<{ success: boolean; message?: string }>;
  registerMorador: (data: RegisterMoradorData, skipAutoRedirect?: boolean) => Promise<{ success: boolean; message?: string }>;
  registerColaborador: (data: RegisterColaboradorData, skipAutoRedirect?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base de usuários padrão limpa para inserção e cadastro manual
const DEFAULT_SYSTEM_USERS: (UsuarioAuth & { senha_hash: string })[] = [];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UsuarioAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carrega sessão salva no navegador
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('portaria_auth_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão de usuário:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login com E-mail ou CPF (conectado ao backend com fallback local)
  const login = async (identificador: string, senha: string): Promise<{ success: boolean; message?: string }> => {
    const cleanId = identificador.trim().toLowerCase();
    const cleanDigits = identificador.replace(/\D/g, '');

    // 1. Tenta autenticação real com a API / Banco Neon
    try {
      const apiRes = await api.login(identificador.trim(), senha);
      if (apiRes?.user) {
        const authUser: UsuarioAuth = {
          id: apiRes.user.id,
          nome_completo: apiRes.user.nome_completo,
          email: apiRes.user.email,
          cpf: apiRes.user.cpf,
          telefone: apiRes.user.telefone,
          perfil: apiRes.user.perfil,
          unidade_bloco: apiRes.user.unidade_bloco,
          unidade_numero: apiRes.user.unidade_numero,
          is_responsavel_unidade: apiRes.user.is_responsavel_unidade ?? true,
          lgpd_termo_aceito: true,
        };

        setCurrentUser(authUser);
        localStorage.setItem('portaria_auth_user', JSON.stringify(authUser));

        if (authUser.perfil === 'MORADOR') {
          router.push('/morador');
        } else {
          router.push('/');
        }
        return { success: true };
      }
    } catch (apiError: any) {
      console.warn('Tentando fallback local após resposta da API:', apiError?.message);
    }

    // 2. Busca nas contas padrão institucionais
    let found: any = DEFAULT_SYSTEM_USERS.find(
      (u) =>
        (u.email.toLowerCase() === cleanId ||
          (u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits)) &&
        u.senha_hash === senha,
    );

    // 3. Busca nas contas de colaboradores cadastradas
    if (!found) {
      const savedColabs = localStorage.getItem('portaria_colaboradores');
      if (savedColabs) {
        try {
          const list = JSON.parse(savedColabs);
          const colabCadastrado = list.find(
            (c: any) =>
              (c.email?.toLowerCase() === cleanId ||
                (c.cpf && c.cpf.replace(/\D/g, '') === cleanDigits)) &&
              c.senha_hash === senha,
          );
          if (colabCadastrado) {
            found = {
              id: colabCadastrado.id,
              nome_completo: colabCadastrado.nome_completo,
              email: colabCadastrado.email,
              cpf: colabCadastrado.cpf,
              telefone: colabCadastrado.telefone,
              perfil: colabCadastrado.cargo as PerfilUsuario,
              avatar_url: colabCadastrado.foto_url,
              lgpd_termo_aceito: colabCadastrado.lgpd_termo_aceito,
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 4. Busca nas contas de moradores cadastradas dinamicamente
    if (!found) {
      const savedMoradores = localStorage.getItem('portaria_moradores_contas');
      if (savedMoradores) {
        try {
          const list = JSON.parse(savedMoradores);
          const moradorCadastrado = list.find(
            (u: any) =>
              (u.email.toLowerCase() === cleanId ||
                (u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits)) &&
              u.senha_hash === senha,
          );
          if (moradorCadastrado) {
            found = moradorCadastrado;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 5. Busca nas contas registradas em portaria_registered_users
    if (!found) {
      const savedRegistered = localStorage.getItem('portaria_registered_users');
      if (savedRegistered) {
        try {
          const list = JSON.parse(savedRegistered);
          const regUser = list.find(
            (u: any) =>
              (u.email?.toLowerCase() === cleanId ||
                (u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits)) &&
              (u.senha === senha || u.senha_hash === senha),
          );
          if (regUser) {
            found = regUser;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!found) {
      return {
        success: false,
        message: 'Identificador (E-mail/CPF) ou senha incorretos. Verifique suas credenciais.',
      };
    }

    const authUser: UsuarioAuth = {
      id: found.id,
      nome_completo: found.nome_completo,
      email: found.email,
      cpf: found.cpf,
      telefone: found.telefone,
      perfil: found.perfil || found.cargo,
      unidade_bloco: found.unidade_bloco,
      unidade_numero: found.unidade_numero,
      is_responsavel_unidade: found.is_responsavel_unidade,
      avatar_url: found.avatar_url || found.foto_url,
      lgpd_termo_aceito: found.lgpd_termo_aceito,
    };

    setCurrentUser(authUser);
    localStorage.setItem('portaria_auth_user', JSON.stringify(authUser));

    // Redirecionamento por perfil
    if (authUser.perfil === 'MORADOR') {
      router.push('/morador');
    } else {
      router.push('/');
    }

    return { success: true };
  };

  // Cadastro de Colaborador (Administrador, Gerente, Síndico, Zelador, Porteiro)
  const registerColaborador = async (
    data: RegisterColaboradorData,
    skipAutoRedirect: boolean = false,
  ): Promise<{ success: boolean; message?: string }> => {
    if (!data.nome_completo || !data.email || !data.cpf || !data.senha || !data.cargo) {
      return { success: false, message: 'Preencha todos os campos obrigatórios.' };
    }

    const cleanCpf = data.cpf.replace(/\D/g, '');
    const cleanEmail = data.email.trim().toLowerCase();

    // Verifica duplicidade
    const savedColabs = localStorage.getItem('portaria_colaboradores');
    const listColabs: (Colaborador & { senha_hash: string })[] = savedColabs ? JSON.parse(savedColabs) : [];

    const exists = listColabs.some(
      (c) => c.email.toLowerCase() === cleanEmail || c.cpf.replace(/\D/g, '') === cleanCpf,
    );

    if (exists) {
      return { success: false, message: 'Já existe um colaborador cadastrado com este E-mail ou CPF.' };
    }

    const newId = `usr-colab-${Date.now()}`;
    const novoColaborador: Colaborador & { senha_hash: string } = {
      id: newId,
      nome_completo: data.nome_completo.trim(),
      cpf: data.cpf,
      email: cleanEmail,
      telefone: data.telefone,
      cargo: data.cargo,
      turno: data.turno || 'COMERCIAL',
      status: 'ATIVO',
      foto_url: data.foto_url,
      matricula: data.matricula || `MAT-${Date.now().toString().slice(-4)}`,
      data_admissao: new Date().toISOString(),
      lgpd_termo_aceito: true,
      senha_hash: data.senha,
    };

    // Tenta persistir no banco de dados via API
    try {
      await api.register({
        nome_completo: data.nome_completo.trim(),
        cpf: data.cpf,
        email: cleanEmail,
        senha: data.senha,
        telefone: data.telefone,
        perfil: data.cargo,
      });
    } catch (e: any) {
      console.warn('Persistência remota do colaborador (fallback local ativo):', e?.message);
    }

    listColabs.push(novoColaborador);
    localStorage.setItem('portaria_colaboradores', JSON.stringify(listColabs));

    // Efetua login automático como colaborador se não for pular redirecionamento
    const authUser: UsuarioAuth = {
      id: novoColaborador.id,
      nome_completo: novoColaborador.nome_completo,
      email: novoColaborador.email,
      cpf: novoColaborador.cpf,
      telefone: novoColaborador.telefone,
      perfil: novoColaborador.cargo,
      avatar_url: novoColaborador.foto_url,
      lgpd_termo_aceito: true,
    };

    if (!skipAutoRedirect) {
      setCurrentUser(authUser);
      localStorage.setItem('portaria_auth_user', JSON.stringify(authUser));
      router.push('/');
    }

    return { success: true };
  };

  // Cadastro de Novo Morador
  const registerMorador = async (
    data: RegisterMoradorData,
    skipAutoRedirect: boolean = false,
  ): Promise<{ success: boolean; message?: string }> => {
    if (!data.nome_completo || !data.email || !data.cpf || !data.senha) {
      return { success: false, message: 'Preencha todos os campos obrigatórios.' };
    }

    const cleanCpf = data.cpf.replace(/\D/g, '');
    const cleanEmail = data.email.trim().toLowerCase();

    // Verifica duplicidade
    const savedMoradores = localStorage.getItem('portaria_moradores_contas');
    const listMoradores = savedMoradores ? JSON.parse(savedMoradores) : [];

    const exists = listMoradores.some(
      (m: any) => m.email.toLowerCase() === cleanEmail || m.cpf.replace(/\D/g, '') === cleanCpf,
    );

    if (exists) {
      return { success: false, message: 'Já existe um cadastro com este E-mail ou CPF.' };
    }

    const newId = `usr-morador-${Date.now()}`;
    const novoUsuario: UsuarioAuth & { senha_hash: string } = {
      id: newId,
      nome_completo: data.nome_completo.trim(),
      email: cleanEmail,
      cpf: data.cpf,
      telefone: data.telefone,
      perfil: 'MORADOR',
      unidade_bloco: data.unidade_bloco,
      unidade_numero: data.unidade_numero,
      is_responsavel_unidade: true,
      lgpd_termo_aceito: true,
      senha_hash: data.senha,
    };

    // Tenta persistir no banco de dados via API
    try {
      await api.register({
        nome_completo: data.nome_completo.trim(),
        cpf: data.cpf,
        email: cleanEmail,
        senha: data.senha,
        telefone: data.telefone,
        perfil: 'MORADOR',
        unidade_bloco: data.unidade_bloco,
        unidade_numero: data.unidade_numero,
      });
    } catch (e: any) {
      console.warn('Persistência remota do morador (fallback local ativo):', e?.message);
    }

    // Salva na lista de contas de moradores
    listMoradores.push(novoUsuario);
    localStorage.setItem('portaria_moradores_contas', JSON.stringify(listMoradores));

    // Salva também no cadastro geral de moradores da portaria
    const savedMoradoresGeral = localStorage.getItem('portaria_moradores');
    const listGeral = savedMoradoresGeral ? JSON.parse(savedMoradoresGeral) : [];
    listGeral.push({
      id: `mor-${Date.now()}`,
      unidade_id: `u-${data.unidade_bloco}-${data.unidade_numero}`,
      unidade_bloco: data.unidade_bloco,
      unidade_numero: data.unidade_numero,
      nome_completo: data.nome_completo.trim(),
      cpf: data.cpf,
      email: cleanEmail,
      telefone: data.telefone,
      perfil: 'MORADOR',
      status: 'ATIVO',
      is_responsavel_unidade: true,
      data_cadastro: new Date().toISOString(),
      veiculos: [],
      dependentes: [],
      contatos_emergencia: [],
      observacoes: 'Cadastro efetuado via autoatendimento do morador.',
      lgpd_termo_aceito: true,
      lgpd_data_aceite: new Date().toISOString(),
      lgpd_anonimizado: false,
    });
    localStorage.setItem('portaria_moradores', JSON.stringify(listGeral));

    // Efetua login automático se não for pular redirecionamento
    const authUser: UsuarioAuth = {
      id: novoUsuario.id,
      nome_completo: novoUsuario.nome_completo,
      email: novoUsuario.email,
      cpf: novoUsuario.cpf,
      telefone: novoUsuario.telefone,
      perfil: novoUsuario.perfil,
      unidade_bloco: novoUsuario.unidade_bloco,
      unidade_numero: novoUsuario.unidade_numero,
      is_responsavel_unidade: novoUsuario.is_responsavel_unidade,
      lgpd_termo_aceito: true,
    };

    if (!skipAutoRedirect) {
      setCurrentUser(authUser);
      localStorage.setItem('portaria_auth_user', JSON.stringify(authUser));
      router.push('/morador');
    }

    return { success: true };
  };

  // Logout seguro
  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portaria_auth_user');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('portaria_session');
    }
    api.logout();
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        registerMorador,
        registerColaborador,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
