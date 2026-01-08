export interface NPSMensalData {
  mes: string;
  votos: number | null;
  notas: number | null;
}

export function useMDNPSMensal() {
  // Dados mockados do NPS
  const data: NPSMensalData[] = [
    { mes: 'Jan', votos: 12, notas: 8.2 },
    { mes: 'Fev', votos: 15, notas: 8.5 },
    { mes: 'Mar', votos: 18, notas: 8.7 },
    { mes: 'Abr', votos: 14, notas: 8.4 },
    { mes: 'Mai', votos: 20, notas: 8.8 },
    { mes: 'Jun', votos: 16, notas: 8.6 },
    { mes: 'Jul', votos: 22, notas: 9.0 },
    { mes: 'Ago', votos: 19, notas: 8.9 },
    { mes: 'Set', votos: 21, notas: 8.8 },
    { mes: 'Out', votos: 24, notas: 9.1 },
    { mes: 'Nov', votos: null, notas: null },
    { mes: 'Dez', votos: null, notas: null },
  ];

  return {
    data,
  };
}

