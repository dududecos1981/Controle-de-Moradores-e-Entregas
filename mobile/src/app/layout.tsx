import type { Metadata } from 'next';
import './globals.css';

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
      <body className="bg-[#070A11] min-h-screen flex items-center justify-center p-0 sm:p-6">
        {children}
      </body>
    </html>
  );
}
