import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ComposedChart,
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMDFluxoGerencial } from './useMDFluxoGerencial';

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

export default function MDFluxoGerencial() {
  const { data, isLoading } = useMDFluxoGerencial();

  // Calcula o saldo (entrada - saída) para cada mês
  const dataWithSaldo = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((item) => ({
      ...item,
      saldo: item.entrada + item.saida, // saida já é negativo, então soma funciona
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle>Fluxo Gerencial</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={370}>
          <ComposedChart
            data={dataWithSaldo}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 10,
            }}
            stackOffset="sign"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="mes" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => {
                // Formata valores positivos e negativos de forma consistente
                const absValue = Math.abs(value);
                const formatted = formatCurrencyShort(absValue);
                return value < 0 ? `-${formatted}` : formatted;
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => {
                // Formata valores positivos e negativos de forma consistente
                const absValue = Math.abs(value);
                const formatted = formatCurrencyShort(absValue);
                return value < 0 ? `-${formatted}` : formatted;
              }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'saldo') {
                  return [formatCurrency(value), 'Saldo'];
                }
                const label = name === 'entrada' ? 'Entrada' : 'Saída';
                // Mostra o valor absoluto para saída no tooltip
                const displayValue = name === 'saida' ? Math.abs(value) : value;
                return [formatCurrency(displayValue), label];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              formatter={(value) => {
                if (value === 'saldo') return 'Saldo';
                return value === 'entrada' ? 'Entrada' : 'Saída';
              }}
            />
            {/* Barra de Entrada (valores positivos) - teal */}
            <Bar 
              yAxisId="left"
              dataKey="entrada" 
              fill="#15B8A6" 
              name="entrada"
              stackId="stack"
              radius={[4, 4, 0, 0]}
            />
            {/* Barra de Saída (valores negativos) - vermelho */}
            <Bar 
              yAxisId="left"
              dataKey="saida" 
              fill="#EF4444" 
              name="saida"
              stackId="stack"
              radius={[4, 4, 0, 0]}
            />
            {/* Linha de Saldo */}
            <Line 
              yAxisId="right"
              type="monotone"
              dataKey="saldo"
              stroke="#9333EA"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name="saldo"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

