import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Configuração dos anos
const CURRENT_YEAR = 2025;
const PREVIOUS_YEAR = 2024;

// Dados mockados baseados na imagem
const mockData = [
  { mes: 'Jan', [PREVIOUS_YEAR]: 28405, [CURRENT_YEAR]: 42297, previsto: 42297 },
  { mes: 'Fev', [PREVIOUS_YEAR]: 22434, [CURRENT_YEAR]: 43479, previsto: 43479 },
  { mes: 'Mar', [PREVIOUS_YEAR]: 29133, [CURRENT_YEAR]: 47140, previsto: 47140 },
  { mes: 'Abr', [PREVIOUS_YEAR]: 25920, [CURRENT_YEAR]: 42297, previsto: 42297 },
  { mes: 'Mai', [PREVIOUS_YEAR]: 27488, [CURRENT_YEAR]: 47968, previsto: 47968 },
  { mes: 'Jun', [PREVIOUS_YEAR]: 29587, [CURRENT_YEAR]: 43536, previsto: 43536 },
  { mes: 'Jul', [PREVIOUS_YEAR]: 26726, [CURRENT_YEAR]: 59866, previsto: 59866 },
  { mes: 'Ago', [PREVIOUS_YEAR]: 30153, [CURRENT_YEAR]: 47059, previsto: 47059 },
  { mes: 'Set', [PREVIOUS_YEAR]: 20689, [CURRENT_YEAR]: 59644, previsto: 59644 },
  { mes: 'Out', [PREVIOUS_YEAR]: 43735, [CURRENT_YEAR]: 24329, previsto: 55349 }, // 24329 + 31020
  { mes: 'Nov', [PREVIOUS_YEAR]: 32670, [CURRENT_YEAR]: 0, previsto: 45000 }, // Previsão para novembro
  { mes: 'Dez', [PREVIOUS_YEAR]: 41508, [CURRENT_YEAR]: 0, previsto: 50000 }, // Previsão para dezembro
];

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  const valueInThousands = value / 1000;
  return `${valueInThousands.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} mil`;
};

// Função para formatar valores do tooltip (valores completos)
const formatTooltipValue = (value: number) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Função para calcular variação percentual entre anos
const calculateVariation = (valorAnterior: number, valorAtual: number) => {
  if (valorAnterior === 0 || valorAtual === 0) return 0;
  return ((valorAtual - valorAnterior) / valorAnterior) * 100;
};

// Função para calcular o valor máximo dos dados (incluindo previsão quando ativa)
const calculateMaxValue = (data: any[], showPrevision: boolean) => {
  const valuesToCheck = data.flatMap(item => {
    const baseValues = [item[PREVIOUS_YEAR], item[CURRENT_YEAR]];
    if (showPrevision && item.previsto) {
      baseValues.push(item.previsto);
    }
    return baseValues;
  }).filter(val => val > 0);
  return Math.max(...valuesToCheck);
};

// Função para gerar ticks dinâmicos baseados no valor máximo
const generateDynamicTicks = (maxValue: number) => {
  // Adiciona um buffer de 20% para dar "gordura" no topo
  const maxValueWithBuffer = maxValue * 1.2;
  
  // Arredonda para cima para um valor "limpo"
  const roundedMax = Math.ceil(maxValueWithBuffer / 10000) * 10000;
  
  // Calcula o intervalo baseado no valor máximo
  let interval = 10000; // padrão de 10k
  
  if (roundedMax > 100000) {
    interval = 20000; // intervalos de 20k para valores maiores
  } else if (roundedMax > 50000) {
    interval = 15000; // intervalos de 15k para valores médios
  }
  
  const ticks = [];
  for (let i = 0; i <= roundedMax; i += interval) {
    ticks.push(i);
  }
  
  return { ticks, maxValue: roundedMax };
};

// Componente customizado para mostrar valores nas barras
const CustomBarLabel = ({ x, y, width, value }: any) => {
  if (value === 0) return null;
  
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      textAnchor="middle" 
      fontSize="12" 
      fill="#374151"
    >
      {formatCurrency(value)}
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

interface ChartFaturamentoProps {
  isPresentationMode?: boolean;
}

export default function ChartFaturamento({ isPresentationMode = false }: ChartFaturamentoProps) {
  const [showPrevision, setShowPrevision] = useState(false);
  
  // Calcula os valores dinâmicos para o eixo Y
  const maxValue = calculateMaxValue(mockData, showPrevision);
  const { ticks, maxValue: yAxisMax } = generateDynamicTicks(maxValue);
  
  return (
    <div className={`w-full ${isPresentationMode ? 'h-full' : 'h-[550px]'} bg-white border border-gray-200 rounded-lg ${isPresentationMode ? 'p-2' : 'p-6'}`}>
      {/* Título - sempre visível */}
      <h2 className={`text-xl font-semibold text-center mb-4 text-gray-800 ${isPresentationMode ? 'text-2xl mb-2' : ''}`}>
        Faturamento mensal
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
        <BarChart
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
            domain={[0, yAxisMax]}
            ticks={ticks}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [formatTooltipValue(value), name]}
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
          
          {/* Barra para ano anterior - azul moderno */}
          <Bar 
            dataKey={PREVIOUS_YEAR} 
            fill="#3A5369" 
            name={PREVIOUS_YEAR.toString()}
            radius={[4, 4, 0, 0]}
            label={<CustomBarLabel />}
          />
          
          {/* Barra para ano atual - alterna entre realizado e previsão */}
          <Bar 
            dataKey={showPrevision ? "previsto" : CURRENT_YEAR} 
            fill="#15B8A6" 
            name={showPrevision ? "Previsto" : CURRENT_YEAR.toString()}
            radius={[4, 4, 0, 0]}
            label={<CustomBarLabel />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}