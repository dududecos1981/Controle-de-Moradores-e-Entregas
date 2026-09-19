import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Morador Pro - Controle de Acesso',
    short_name: 'Morador Pro',
    description: 'Aplicativo do morador para controle de encomendas e convites com QR Code',
    start_url: '/',
    display: 'standalone',
    background_color: '#070A11',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
