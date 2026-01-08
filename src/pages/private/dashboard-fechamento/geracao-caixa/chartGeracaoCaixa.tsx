import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dados mockados baseados na imagem
const mockData = [
  { mes: 'Jan', Operacional: 5500, Livre: -578 },
  { mes: 'Fev', Operacional: 12000, Livre: 5100 },
  { mes: 'Mar', Operacional: 13000, Livre: 5200 },
  { mes: 'Abr', Operacional: 13000, Livre: 4500 },
  { mes: 'Mai', Operacional: 12000, Livre: -3200 },
  { mes: 'Jun', Operacional: 16000, Livre: 4700 },
  { mes: 'Jul', Operacional: 24000, Livre: 0 },
  { mes: 'Ago', Operacional: 14000, Livre: 1700 },
  { mes: 'Set', Operacional: 19000, Livre: -15000 },
  { mes: 'Out', Operacional: 2900, Livre: -21000 },
  { mes: 'Nov', Operacional: 0, Livre: 0 },
  { mes: 'Dez', Operacional: 0, Livre: 0 },
];

// Função para formatar valores
const formatValue = (value: number) => {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)} mil`;
  }
  return value.toString();
};

// Componente customizado para mostrar valores nas barras
const CustomBarLabel = ({ x, y, width, value, index }: any) => {
  if (value === 0) return null;
  
  const formattedValue = formatValue(value);
  const isNegative = value < 0;
  
  return (
    <text 
      x={x + width / 2} 
      y={isNegative ? y + 15 : y - 5} 
      textAnchor="middle" 
      fontSize="11" 
      fill="#374151"
    >
      {formattedValue}
    </text>
  );
};

interface ChartGeracaoCaixaProps {
  isPresentationMode?: boolean;
}

export default function ChartGeracaoCaixa({ isPresentationMode = false }: ChartGeracaoCaixaProps) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [viewMode, setViewMode] = useState('realizado');
  const [valueMode, setValueMode] = useState('real');

  return (
    <div className={`w-full ${isPresentationMode ? 'h-full' : ''} bg-white border border-gray-200 rounded-lg ${isPresentationMode ? 'p-2' : 'p-6'}`}>
      {/* Header com título e controles - título sempre visível */}
      <div className={`flex justify-between items-center mb-6 ${isPresentationMode ? 'mb-2' : ''}`}>
        <h2 className={`text-xl font-semibold text-gray-800 ${isPresentationMode ? 'text-2xl' : ''}`}>
          Geração de Caixa
        </h2>
      
        {!isPresentationMode && (
          <div className="flex items-center gap-4">
            {/* Controles de filtro */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'realizado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('realizado')}
              >
                Realizado
              </Button>
              <Button
                variant={viewMode === 'previsto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('previsto')}
              >
                Previsto
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={valueMode === 'real' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValueMode('real')}
              >
                Real (R$)
              </Button>
              <Button
                variant={valueMode === 'percentual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValueMode('percentual')}
              >
                Percentual (%)
              </Button>
            </div>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={isPresentationMode ? '100%' : 400}>
        <BarChart
          data={mockData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
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
            tickFormatter={(value) => value.toLocaleString('pt-BR')}
            domain={[-25000, 25000]}
            ticks={[-25000, -20000, -15000, -10000, -5000, 0, 5000, 10000, 15000, 20000, 25000]}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              valueMode === 'real' ? `R$ ${value.toLocaleString('pt-BR')}` : `${value}%`,
              name
            ]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px' }}
          />
          
          {/* Barra Operacional - teal */}
          <Bar 
            dataKey="Operacional" 
            fill="#14b8a6" 
            name="Operacional"
            label={<CustomBarLabel />}
          />
          
          {/* Barra Livre - azul claro para positivos, rosa claro para negativos */}
          <Bar 
            dataKey="Livre" 
            fill="#06b6d4"
            name="Livre"
            label={<CustomBarLabel />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
