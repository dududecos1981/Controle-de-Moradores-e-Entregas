'use client';

import { useEffect } from 'react';

export default function CleanStorageInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCleaned = localStorage.getItem('portaria_data_cleaned_v3');
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
      localStorage.removeItem('portaria_registered_users');
      localStorage.removeItem('portaria_moradores_contas');
      localStorage.removeItem('portaria_colaboradores');
      localStorage.removeItem('portaria_auth_user');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.setItem('portaria_data_cleaned_v3', 'true');
    }
  }, []);

  return null;
}
