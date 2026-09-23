import type { Metadata } from 'next';
import './globals.css';
import CleanStorageInit from '@/components/CleanStorageInit';
import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Portaria Pro - Controle de Acessos & Encomendas',
  description: 'Sistema operacional de portaria, cadastro rápido de visitantes com webcam e rastreio de encomendas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col antialiased relative selection:bg-indigo-500 selection:text-white">
        {/* Camada Estilizada de Fundo dos Edifícios */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/building_bg.jpg')" }}
        />
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0a0f1d]/85 via-[#0B0F19]/90 to-[#070A11]/95" />

        <AuthProvider>
          <CleanStorageInit />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
