import type { Metadata } from 'next';
import './globals.css';
import CleanStorageInit from '@/components/CleanStorageInit';

export const metadata: Metadata = {
  title: 'Morador Pro - Meu Condomínio',
  description: 'Aplicativo do morador para controle de encomendas recebidas e convites temporários com QR Code.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#070A11] min-h-screen flex items-center justify-center p-0 sm:p-6 relative selection:bg-indigo-500 selection:text-white">
        {/* Camada Estilizada de Fundo dos Edifícios */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/building_bg.jpg')" }}
        />
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#070A11]/85 via-[#090D16]/92 to-[#070A11]/98" />

        <CleanStorageInit />
        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
