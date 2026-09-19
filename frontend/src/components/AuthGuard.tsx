'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/cadastro'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // Se não estiver logado e tentar acessar rota protegida
    if (!currentUser && !isPublic) {
      router.push('/login');
      return;
    }

    // Se já estiver logado e tentar acessar tela de login/cadastro
    if (currentUser && isPublic) {
      if (currentUser.perfil === 'MORADOR') {
        router.push('/morador');
      } else {
        router.push('/');
      }
      return;
    }

    // Se for MORADOR tentando acessar áreas da portaria
    if (currentUser && currentUser.perfil === 'MORADOR' && pathname !== '/morador') {
      router.push('/morador');
    }
  }, [currentUser, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A11] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 animate-pulse">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          Verificando credenciais de acesso...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
