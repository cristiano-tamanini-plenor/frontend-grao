import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useMDFaturamentoMensal } from './useMDFaturamentoMensal';
import ModalFaturamento from '../md-cards/cardFaturamento/modalFaturamento';
import { FaturamentoItem } from '../md-cards/useMDCards';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { analystsService } from '@/pages/private/analyst/services/analysts.service';
import { myDashboardService } from '../services/my-dashboard.service';

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Função para formatar valores simplificados
const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
};

interface MDFaturamentoMensalProps {
  analystId: number | null;
}

export default function MDFaturamentoMensal({ analystId }: MDFaturamentoMensalProps) {
  const { currentCompany } = useCompany();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { data, isLoading } = useMDFaturamentoMensal(analystId, selectedYear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonthFaturamentos, setSelectedMonthFaturamentos] = useState<FaturamentoItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedMonthNumber, setSelectedMonthNumber] = useState<number | null>(null);

  const yearOptions = [2023, 2024, 2025, 2026];

  // Busca o analista para obter o cost_center_id
  const { data: analyst } = useQuery({
    queryKey: ['analyst', analystId],
    queryFn: async () => {
      if (!analystId) return null;
      return await analystsService.getAnalystById(String(analystId));
    },
    enabled: !!analystId,
  });

  // Obtém o cost_center_id do analista ou usa '1037' como padrão
  const costCenterId = analyst?.marvee_cost_center_id 
    ? analyst.marvee_cost_center_id 
    : 1037;

  // Busca detalhes do faturamento quando um mês é selecionado
  const { data: detalhesData, isLoading: isLoadingDetalhes } = useQuery({
    queryKey: ['my-dashboard', 'detalhes-faturamento-mensal', currentCompany?.id, costCenterId, selectedMonthNumber, selectedYear],
    queryFn: async () => {
      if (!currentCompany?.id || selectedMonthNumber === null) {
        throw new Error('Parâmetros inválidos');
      }
      return await myDashboardService.getDetalhesFaturamentoMensal({
        companyId: currentCompany.id,
        cost_center_id: costCenterId,
        mes: selectedMonthNumber,
        year: selectedYear,
      });
    },
    enabled: !!currentCompany?.id && selectedMonthNumber !== null,
  });

  // Calcula o domínio do eixo Y dinamicamente (maior valor + 10%)
  const maxValue = useMemo(() => {
    if (data.length === 0) {
      return 40000;
    }
    const max = Math.max(...data.map(item => item.value));
    return max * 1.1;
  }, [data]);

  const handleBarClick = (entry: any) => {
    // Quando clicar na barra, abre o modal imediatamente e define o mês selecionado
    if (entry && entry.mesNumero !== undefined) {
      setSelectedMonth(entry.mes);
      setSelectedMonthNumber(entry.mesNumero);
      setIsModalOpen(true);
      // Limpa os dados anteriores enquanto carrega novos
      setSelectedMonthFaturamentos([]);
    }
  };

  // Quando os detalhes são carregados, atualiza os dados do modal
  useEffect(() => {
    if (!isLoadingDetalhes && detalhesData) {
      // detalhesData já é o FaturamentoResponse retornado pelo serviço
      // que tem a estrutura { success: boolean, data: any }
      // O data pode ser o array diretamente ou ter outra estrutura
      let faturamentos: FaturamentoItem[] = [];
      
      // Tenta acessar os dados seguindo o padrão do useMDCards
      if (detalhesData?.data) {
        const apiData = detalhesData.data;
        // Se apiData já é um array, usa diretamente
        if (Array.isArray(apiData)) {
          faturamentos = apiData;
        }
        // Se apiData tem uma propriedade data que é um array (estrutura aninhada)
        else if (apiData?.data && Array.isArray(apiData.data)) {
          faturamentos = apiData.data;
        }
      }
      
      // Atualiza os dados do modal (o modal já está aberto)
      setSelectedMonthFaturamentos(faturamentos);
      // Limpa o mês selecionado após carregar para permitir clicar novamente
      setSelectedMonthNumber(null);
    }
  }, [detalhesData, isLoadingDetalhes]);

  return (
    <>
      <Card>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Faturamento</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="relative">
            <ResponsiveContainer width="100%" height={370}>
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => formatCurrencyShort(value)}
                  domain={[0, maxValue]}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#15B8A6" 
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: 'top',
                    formatter: (value: number) => formatCurrencyShort(value),
                    style: {
                      fontSize: '11px',
                      fill: '#6b7280',
                      fontWeight: 500,
                    }
                  }}
                  onClick={handleBarClick}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 0 ? "#15B8A6" : "#d1d5db"}
                      style={{ cursor: entry.value > 0 ? 'pointer' : 'default' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Overlay de loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Carregando dados...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ModalFaturamento
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            // Limpa os dados quando o modal fecha
            setSelectedMonthFaturamentos([]);
            setSelectedMonth('');
            setSelectedMonthNumber(null);
          }
        }}
        faturamentos={selectedMonthFaturamentos}
        monthTitle={selectedMonth}
        isLoading={isLoadingDetalhes}
        costCenterId={costCenterId}
      />
    </>
  );
}
