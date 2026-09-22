'use client';

import { useEffect } from 'react';

export default function CleanStorageInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCleaned = localStorage.getItem('mobile_data_cleaned_v2');
    if (!isCleaned) {
      localStorage.removeItem('morador_encomendas');
      localStorage.removeItem('morador_convites');
      localStorage.removeItem('morador_ocorrencias');
      localStorage.removeItem('morador_reservas');
      localStorage.removeItem('morador_veiculos');
      localStorage.setItem('mobile_data_cleaned_v2', 'true');
    }
  }, []);

  return null;
}
