'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

const PUBLIC_ROUTES = ['/login', '/cadastro'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isMoradorRoute = pathname === '/morador';

  useEffect(() => {
    if (isLoading) return;

    // Se o usuário NÃO está autenticado e tenta acessar qualquer página protegida
    if (!currentUser && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    // Se o usuário ESTÁ autenticado e acessa a tela de login ou cadastro
    if (currentUser && isPublicRoute) {
      if (currentUser.perfil === 'MORADOR') {
        router.replace('/morador');
      } else {
        router.replace('/');
      }
      return;
    }

    // Se o perfil for MORADOR e tentar acessar rotas operacionais da portaria
    if (currentUser && currentUser.perfil === 'MORADOR' && pathname !== '/morador') {
      router.replace('/morador');
    }
  }, [currentUser, isLoading, isPublicRoute, pathname, router]);

  // Se estiver em rota pública (/login ou /cadastro) ou rota do morador, renderiza sem Sidebar/Navbar de portaria
  if (isPublicRoute || isMoradorRoute || currentUser?.perfil === 'MORADOR' || (!isLoading && !currentUser)) {
    return (
      <div className="min-h-screen w-full flex flex-col relative z-10">
        {children}
      </div>
    );
  }

  // Para operadores de Portaria e Administradores logados: layout completo com Sidebar e Navbar
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
