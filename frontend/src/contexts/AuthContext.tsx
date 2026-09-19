'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_UNIDADES } from '@/lib/store';

export type PerfilUsuario = 'ADMINISTRADOR' | 'SINDICO' | 'PORTEIRO' | 'MORADOR';

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

interface AuthContextType {
  currentUser: UsuarioAuth | null;
  isLoading: boolean;
  login: (identificador: string, senha: string) => Promise<{ success: boolean; message?: string }>;
  registerMorador: (data: RegisterMoradorData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoUser: (perfil: PerfilUsuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários padrão do sistema (Homologação & Demonstração)
const DEFAULT_SYSTEM_USERS: (UsuarioAuth & { senha_hash: string })[] = [
  {
    id: 'usr-admin-01',
    nome_completo: 'Carlos Silva (Administrador Geral)',
    email: 'admin@condominio.com.br',
    cpf: '111.222.333-44',
    telefone: '(11) 98765-4321',
    perfil: 'ADMINISTRADOR',
    senha_hash: 'SenhaSegura123!',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    lgpd_termo_aceito: true,
  },
  {
    id: 'usr-porteiro-01',
    nome_completo: 'João Portaria (Plantão Diurno)',
    email: 'porteiro.joao@condominio.com.br',
    cpf: '222.333.444-55',
    telefone: '(11) 97654-3210',
    perfil: 'PORTEIRO',
    senha_hash: 'SenhaSegura123!',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    lgpd_termo_aceito: true,
  },
  {
    id: 'usr-sindico-01',
    nome_completo: 'Roberto Albuquerque (Síndico)',
    email: 'sindico.roberto@condominio.com.br',
    cpf: '444.555.666-77',
    telefone: '(11) 95432-1098',
    perfil: 'SINDICO',
    unidade_bloco: 'B',
    unidade_numero: 'PH01',
    senha_hash: 'SenhaSegura123!',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    lgpd_termo_aceito: true,
  },
  {
    id: 'usr-morador-01',
    nome_completo: 'Mariana Fernandes',
    email: 'mariana.fernandes@email.com',
    cpf: '333.444.555-66',
    telefone: '(11) 96543-2109',
    perfil: 'MORADOR',
    unidade_bloco: 'A',
    unidade_numero: '101',
    is_responsavel_unidade: true,
    senha_hash: 'SenhaSegura123!',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    lgpd_termo_aceito: true,
  },
];

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

  // Login com E-mail ou CPF
  const login = async (identificador: string, senha: string): Promise<{ success: boolean; message?: string }> => {
    const cleanId = identificador.trim().toLowerCase();
    const cleanDigits = identificador.replace(/\D/g, '');

    // Busca nas contas padrão
    let found = DEFAULT_SYSTEM_USERS.find(
      (u) =>
        (u.email.toLowerCase() === cleanId ||
          (u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits)) &&
        u.senha_hash === senha,
    );

    // Busca nas contas de moradores cadastradas dinamicamente
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
      perfil: found.perfil,
      unidade_bloco: found.unidade_bloco,
      unidade_numero: found.unidade_numero,
      is_responsavel_unidade: found.is_responsavel_unidade,
      avatar_url: found.avatar_url,
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

  // Cadastro de Novo Morador
  const registerMorador = async (data: RegisterMoradorData): Promise<{ success: boolean; message?: string }> => {
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

    // Efetua login automático
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

    setCurrentUser(authUser);
    localStorage.setItem('portaria_auth_user', JSON.stringify(authUser));

    router.push('/morador');
    return { success: true };
  };

  // Logout seguro
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('portaria_auth_user');
    router.push('/login');
  };

  // Alternador de Usuário Demo para testes em 1 clique
  const switchDemoUser = (perfil: PerfilUsuario) => {
    const demoUser = DEFAULT_SYSTEM_USERS.find((u) => u.perfil === perfil) || DEFAULT_SYSTEM_USERS[0];
    const authUser: UsuarioAuth = {
      id: demoUser.id,
      nome_completo: demoUser.nome_completo,
      email: demoUser.email,
      cpf: demoUser.cpf,
      telefone: demoUser.telefone,
      perfil: demoUser.perfil,
      unidade_bloco: demoUser.unidade_bloco,
      unidade_numero: demoUser.unidade_numero,
      is_responsavel_unidade: demoUser.is_responsavel_unidade,
      avatar_url: demoUser.avatar_url,
      lgpd_termo_aceito: demoUser.lgpd_termo_aceito,
    };

    setCurrentUser(authUser);
    localStorage.setItem('portaria_auth_user', JSON.stringify(authUser));

    if (authUser.perfil === 'MORADOR') {
      router.push('/morador');
    } else {
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        registerMorador,
        logout,
        switchDemoUser,
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
