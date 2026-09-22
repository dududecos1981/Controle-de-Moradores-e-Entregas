'use client';

import { useEffect } from 'react';

export default function CleanStorageInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCleaned = localStorage.getItem('portaria_data_cleaned_v2');
    if (!isCleaned) {
      localStorage.removeItem('portaria_encomendas');
      localStorage.removeItem('portaria_moradores');
      localStorage.removeItem('portaria_visitantes');
      localStorage.removeItem('portaria_prestadores');
      localStorage.removeItem('portaria_acessos');
      localStorage.removeItem('portaria_comunicados');
      localStorage.removeItem('portaria_ocorrencias');
      localStorage.removeItem('portaria_reservas');
      localStorage.removeItem('portaria_veiculos');
      localStorage.removeItem('portaria_logs_auditoria');
      localStorage.setItem('portaria_data_cleaned_v2', 'true');
    }
  }, []);

  return null;
}
