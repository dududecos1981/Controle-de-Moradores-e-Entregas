import type { Metadata } from 'next';
import './globals.css';
import AppLayoutWrapper from '@/components/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'SUPE Pro - Controle de Portaria, Moradores & Entregas',
  description: 'Sistema corporativo de controle de portaria, gestão de encomendas com leitor óptico, visitantes com biometria facial e portal do morador.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#070A11] text-slate-100 min-h-screen antialiased">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
