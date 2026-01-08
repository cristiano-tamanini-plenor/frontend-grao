import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Configuração dos anos
const CURRENT_YEAR = 2025;
const PREVIOUS_YEAR = 2024;

// Dados acumulados baseados nos dados mensais do chartFaturamento.tsx
const mockData = [
  { mes: 'Jan', [PREVIOUS_YEAR]: 28405, [CURRENT_YEAR]: 42297, previsto: 42297 },
  { mes: 'Fev', [PREVIOUS_YEAR]: 50839, [CURRENT_YEAR]: 85776, previsto: 85776 },
  { mes: 'Mar', [PREVIOUS_YEAR]: 79972, [CURRENT_YEAR]: 132916, previsto: 132916 },
  { mes: 'Abr', [PREVIOUS_YEAR]: 105892, [CURRENT_YEAR]: 175213, previsto: 175213 },
  { mes: 'Mai', [PREVIOUS_YEAR]: 133380, [CURRENT_YEAR]: 223181, previsto: 223181 },
  { mes: 'Jun', [PREVIOUS_YEAR]: 162967, [CURRENT_YEAR]: 266717, previsto: 266717 },
  { mes: 'Jul', [PREVIOUS_YEAR]: 189693, [CURRENT_YEAR]: 326583, previsto: 326583 },
  { mes: 'Ago', [PREVIOUS_YEAR]: 219846, [CURRENT_YEAR]: 373642, previsto: 373642 },
  { mes: 'Set', [PREVIOUS_YEAR]: 240535, [CURRENT_YEAR]: 433286, previsto: 433286 },
  { mes: 'Out', [PREVIOUS_YEAR]: 284270, [CURRENT_YEAR]: 457615, previsto: 488635 }, // 457615 + 31020
  { mes: 'Nov', [PREVIOUS_YEAR]: 316940, [CURRENT_YEAR]: null, previsto: 533635 }, // 457615 + 45000 + 31020
  { mes: 'Dez', [PREVIOUS_YEAR]: 358448, [CURRENT_YEAR]: null, previsto: 583635 }, // 457615 + 50000 + 45000 + 31020
];

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return '0 mil';
  const valueInThousands = Number(value) / 1000;
  return `${valueInThousands.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} mil`;
};

// Função para calcular variação percentual entre anos
const calculateVariation = (valorAnterior: number, valorAtual: number | null) => {
  if (valorAnterior === 0 || valorAtual === null) return 0;
  return ((valorAtual - valorAnterior) / valorAnterior) * 100;
};

// Componente customizado para mostrar valores nas áreas
const CustomLabel = ({ x, y, value }: any) => {
  if (!value || value === 0 || value === null) return null;
  
  return (
    <text 
      x={x} 
      y={y - 10} 
      textAnchor="middle" 
      fontSize="11" 
      fill="#374151"
      fontWeight="500"
    >
      {formatCurrency(Number(value))}
    </text>
  );
};

// Componente customizado para o XAxis com variação percentual
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const data = mockData.find(item => item.mes === payload.value);
  if (!data) return null;
  
  const variacao = calculateVariation(data[PREVIOUS_YEAR], data[CURRENT_YEAR]);
  const isPositive = variacao > 0;
  const color = isPositive ? '#10b981' : variacao < 0 ? '#ef4444' : '#6b7280';
  
  return (
    <g>
      {/* Mês */}
      <text 
        x={x} 
        y={y + 10} 
        textAnchor="middle" 
        fontSize="12" 
        fill="#6b7280"
      >
        {payload.value}
      </text>
      
      {/* Variação percentual */}
      <text 
        x={x} 
        y={y + 25} 
        textAnchor="middle" 
        fontSize="10" 
        fill={color}
        fontWeight="600"
      >
        {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
      </text>
    </g>
  );
};

interface ChartFaturamentoAcumuladoProps {
  isPresentationMode?: boolean;
}

export default function ChartFaturamentoAcumulado({ isPresentationMode = false }: ChartFaturamentoAcumuladoProps) {
  const [showPrevision, setShowPrevision] = useState(false);
  
  // Calcular o valor máximo dos dados (incluindo previsão quando ativa)
  const maxValue = Math.max(
    ...mockData.map(item => {
      const baseMax = Math.max(item[PREVIOUS_YEAR], item[CURRENT_YEAR]);
      return showPrevision && item.previsto ? Math.max(baseMax, item.previsto) : baseMax;
    })
  );
  
  // Adicionar 20% de margem no topo
  const maxValueWithMargin = Math.ceil(maxValue * 1.2);
  
  // Gerar ticks dinâmicos (5 divisões)
  const generateTicks = (max: number) => {
    const ticks = [];
    for (let i = 0; i <= 5; i++) {
      ticks.push(Math.round((max / 5) * i));
    }
    return ticks;
  };
  
  const dynamicTicks = generateTicks(maxValueWithMargin);

  return (
    <div className={`w-full ${isPresentationMode ? 'h-full' : 'h-[550px]'} bg-white border border-gray-200 rounded-lg ${isPresentationMode ? 'p-2' : 'p-6'}`}>
      {/* Título - sempre visível */}
      <h2 className={`text-xl font-semibold text-center mb-4 text-gray-800 ${isPresentationMode ? 'text-2xl mb-2' : ''}`}>
        Faturamento Acumulado {PREVIOUS_YEAR} x {CURRENT_YEAR}
      </h2>
      
      {/* Botão de previsão - sempre visível */}
      <div className={`flex justify-center ${isPresentationMode ? 'mb-1' : 'mb-2'}`}>
        <button
          onClick={() => setShowPrevision(!showPrevision)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPrevision
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showPrevision ? 'Ocultar Previsão' : 'Mostrar Previsão'}
        </button>
      </div>
      
      {/* Gráfico */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={mockData}
          margin={{
            top: 40,
            right: 30,
            left: 20,
            bottom: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="mes" 
            axisLine={false}
            tickLine={false}
            tick={<CustomXAxisTick />}
            label={{ value: '', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '14px', fill: '#374151' } }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={formatCurrency}
            domain={[0, maxValueWithMargin]}
            ticks={dynamicTicks}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="rect"
            wrapperStyle={{ paddingTop: '20px', paddingBottom: '10px' }}
          />
          
          {/* Área para ano anterior - azul */}
          <Area
            type="monotone"
            dataKey={PREVIOUS_YEAR}
            fill="#3A5369"
            fillOpacity={0.4}
            stroke="#3A5369"
            strokeWidth={2}
            name={PREVIOUS_YEAR.toString()}
            dot={{ r: 4, fill: '#fff', stroke: '#3A5369', strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: '#3A5369', strokeWidth: 2, fill: '#fff' }}
            label={<CustomLabel />}
          />
          
          {/* Área para ano atual - alterna entre realizado e previsão */}
          <Area
            type="monotone"
            dataKey={showPrevision ? "previsto" : CURRENT_YEAR}
            fill="#15B8A6"
            fillOpacity={0.4}
            stroke="#15B8A6"
            strokeWidth={2}
            name={showPrevision ? "Previsto" : CURRENT_YEAR.toString()}
            dot={{ r: 4, fill: '#fff', stroke: '#15B8A6', strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: '#15B8A6', strokeWidth: 2, fill: '#fff' }}
            label={<CustomLabel />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}