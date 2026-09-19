'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';
  const isMoradorPage = pathname === '/morador';

  return (
    <AuthProvider>
      <AuthGuard>
        {isAuthPage || isMoradorPage ? (
          <div className="w-full min-h-screen bg-[#070A11]">{children}</div>
        ) : (
          <div className="min-h-screen w-full flex bg-[#0B0F19]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
            </div>
          </div>
        )}
      </AuthGuard>
    </AuthProvider>
  );
}
