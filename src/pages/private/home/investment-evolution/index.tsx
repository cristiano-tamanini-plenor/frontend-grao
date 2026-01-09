import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useInvestmentEvolution } from './useInvestmentEvolution';

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

export default function InvestmentEvolution() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { data, isLoading } = useInvestmentEvolution(selectedYear);

  const yearOptions = [2023, 2024, 2025, 2026];

  // Calcula o domínio do eixo Y dinamicamente (maior valor + 10%)
  const maxValue = data.length > 0 
    ? Math.max(...data.map(item => item.value)) * 1.1 
    : 1500000;

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Evolução dos Investimentos</CardTitle>
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
                formatter={(value: number) => [formatCurrency(value), 'Investimentos']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#10B981" 
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
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value > 0 ? "#10B981" : "#d1d5db"}
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
  );
}
