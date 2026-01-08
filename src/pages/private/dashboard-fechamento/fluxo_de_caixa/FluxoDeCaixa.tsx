import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter } from 'lucide-react';
import DataGrid from '@/components/DataGrid';

// Dados mock do fluxo de caixa
const fluxoDeCaixaData = [
  {
    id: 1,
    category: "Saldo inicial",
    january: 16579.99,
    february: 16001.52,
    march: 21080.67,
    april: 26272.8,
    may: 30772.54,
    june: 27619.38,
    july: 32352.61,
    august: 45174.32,
    september: 46848.71,
    october: 32342.45,
    november: 11373.25,
    december: 11373.25
  },
  {
    id: 2,
    category: "01 - Receitas Operacionais",
    january: 42297.57,
    february: 42504.58,
    march: 46165.55,
    april: 45224.36,
    may: 44139.68,
    june: 45955.79,
    july: 55790.3,
    august: 47059.36,
    september: 51587.5,
    october: 24206.26,
    november: 0,
    december: 0,
    total: 444930.95
  },
  {
    id: 3,
    category: "01.01 - Receitas de Serviço",
    january: 42297.57,
    february: 42504.58,
    march: 46165.55,
    april: 45224.36,
    may: 44139.68,
    june: 45955.79,
    july: 55790.3,
    august: 47059.36,
    september: 51587.5,
    october: 24206.26,
    november: 0,
    december: 0,
    total: 444930.95
  },
  {
    id: 4,
    category: "01.01.01 - Receitas Recorrentes (fee mensal)",
    january: 42297.57,
    february: 42504.58,
    march: 46165.55,
    april: 45224.36,
    may: 44139.68,
    june: 45955.79,
    july: 55790.3,
    august: 47059.36,
    september: 51587.5,
    october: 24206.26,
    november: 0,
    december: 0,
    total: 444930.95
  },
  {
    id: 5,
    category: "02 - Despesas Operacionais",
    january: -36844.71,
    february: -30119.1,
    march: -33307.17,
    april: -32546.29,
    may: -32336.51,
    june: -29617.09,
    july: -31334.81,
    august: -33035.62,
    september: -32879.8,
    october: -21283.78,
    november: 0,
    december: 0,
    total: -313304.88
  },
  {
    id: 6,
    category: "02.01 - Impostos sobre Vendas e Serviços",
    january: -3739.25,
    february: -3948.04,
    march: -4192.12,
    april: -4680.22,
    may: -322.85,
    june: -326.3,
    july: -329.63,
    august: -333.5,
    september: -337.01,
    october: 0,
    november: 0,
    december: 0,
    total: -18208.92
  },
  {
    id: 7,
    category: "02.01.01 - Simples Nacional",
    january: -3428.56,
    february: -3634.29,
    march: -3875.38,
    april: -4360.57,
    may: 0,
    june: 0,
    july: -329.63,
    august: -333.5,
    september: -337.01,
    october: 0,
    november: 0,
    december: 0,
    total: -16298.94
  },
  {
    id: 8,
    category: "02.01.09 - Parcelamento Simples",
    january: -310.69,
    february: -313.75,
    march: -316.74,
    april: -319.65,
    may: -322.85,
    june: -326.3,
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0,
    total: -1909.98
  },
  {
    id: 9,
    category: "02.02 - Despesas com Prestação de Serviço",
    january: -14297.62,
    february: -12633.56,
    march: -14435.48,
    april: -14447.67,
    may: -14269.67,
    june: -14782.28,
    july: -17376.86,
    august: -15416.06,
    september: -15791.24,
    october: -8549.8,
    november: 0,
    december: 0,
    total: -142000.24
  },
  {
    id: 10,
    category: "02.02.05 - Aluguel de Espaços e Ambientes",
    january: -3056.14,
    february: -1511.72,
    march: -1620.97,
    april: -1620.96,
    may: -1620.96,
    june: -1620.96,
    july: -1620.96,
    august: -1620.96,
    september: -1511.72,
    october: -1511.72,
    november: 0,
    december: 0,
    total: -17317.07
  },
  {
    id: 11,
    category: "02.02.06 - Ferramentas, Softwares e Sistemas - Prestação de Serviço",
    january: 0,
    february: 0,
    march: -590.36,
    april: -753.55,
    may: -479.77,
    june: -626.17,
    july: -825.4,
    august: -700.82,
    september: -407.42,
    october: 0,
    november: 0,
    december: 0,
    total: -4383.49
  },
  {
    id: 12,
    category: "02.02.07 - Maquinas e Equipamentos p/ Operação",
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: -406.29,
    june: -406.24,
    july: -406.24,
    august: -406.24,
    september: -406.24,
    october: -406.24,
    november: 0,
    december: 0,
    total: -2437.49
  },
  {
    id: 13,
    category: "02.02.10 - Royalties",
    january: -10574.43,
    february: -10626.17,
    march: -11541.43,
    april: -11306.1,
    may: -11034.94,
    june: -11488.98,
    july: -13947.6,
    august: -11764.87,
    september: -12896.91,
    october: -6051.59,
    november: 0,
    december: 0,
    total: -111233.02
  },
  {
    id: 14,
    category: "02.02.11 - Internet e Telefone",
    january: -389.72,
    february: -144.89,
    march: -289.76,
    april: -303.32,
    may: -369.31,
    june: -388.42,
    july: -357.96,
    august: -702.71,
    september: -356.03,
    october: -356.08,
    november: 0,
    december: 0,
    total: -3658.2
  },
  {
    id: 15,
    category: "02.02.12 - Água e Energia Elétrica",
    january: -217.33,
    february: -290.78,
    march: -332.96,
    april: -403.74,
    may: -298.4,
    june: -191.51,
    july: -158.7,
    august: -160.46,
    september: -152.92,
    october: -194.17,
    november: 0,
    december: 0,
    total: -2400.97
  },
  {
    id: 16,
    category: "02.02.13 - Materiais de Uso/Consumo",
    january: -60,
    february: -60,
    march: -60,
    april: -60,
    may: -60,
    june: -60,
    july: -60,
    august: -60,
    september: -60,
    october: -30,
    november: 0,
    december: 0,
    total: -570
  },
  {
    id: 17,
    category: "02.03 - Salários, Encargos e Pessoal",
    january: -17756.01,
    february: -12998.12,
    march: -13590.47,
    april: -12416.4,
    may: -17079.69,
    june: -12463.18,
    july: -12450.65,
    august: -16701.04,
    september: -14614.7,
    october: -12547.66,
    november: 0,
    december: 0,
    total: -142617.92
  },
  {
    id: 18,
    category: "02.03.01 - Pró-labore",
    january: -1335,
    february: -1351.02,
    march: -1351.02,
    april: -1351.02,
    may: -1351.02,
    june: -1351.02,
    july: -1351.02,
    august: -1351.02,
    september: -1351.02,
    october: -1351.02,
    november: 0,
    december: 0,
    total: -13494.18
  },
  {
    id: 19,
    category: "02.03.03 - Salários e Remunerações Operacional",
    january: -10405.13,
    february: -7620.39,
    march: -6848.98,
    april: -7897.88,
    may: -7570.32,
    june: -6056.66,
    july: -6098.52,
    august: -8038.99,
    september: -7140.56,
    october: -6271.08,
    november: 0,
    december: 0,
    total: -73948.51
  },
  {
    id: 20,
    category: "02.03.05 - INSS",
    january: -1634.25,
    february: -676.96,
    march: -989.98,
    april: -996.61,
    may: -1169.07,
    june: -1008.93,
    july: -835.74,
    august: -1511.17,
    september: -1656.86,
    october: -1077.36,
    november: 0,
    december: 0,
    total: -11556.93
  },
  {
    id: 21,
    category: "02.03.06 - FGTS",
    january: -929.51,
    february: -449.19,
    march: -608.47,
    april: -824.48,
    may: -1274.55,
    june: -532.63,
    july: -530.69,
    august: -965.79,
    september: -680.88,
    october: -660.28,
    november: 0,
    december: 0,
    total: -7456.47
  },
  {
    id: 22,
    category: "02.03.08 - Benefícios (VT, VR, VA, Saúde e Outros)",
    january: -3452.12,
    february: -2900.56,
    march: -3792.02,
    april: -1346.41,
    may: -5714.73,
    june: -3513.94,
    july: -3634.68,
    august: -1461.91,
    september: -3785.38,
    october: -3187.92,
    november: 0,
    december: 0,
    total: -32789.67
  },
  {
    id: 23,
    category: "Geração de Caixa Operacional",
    january: 5452.86,
    february: 12385.48,
    march: 12858.38,
    april: 12678.07,
    may: 11803.17,
    june: 16338.7,
    july: 24455.49,
    august: 14023.74,
    september: 18707.7,
    october: 2922.48,
    november: 0,
    december: 0,
    total: 131626.07
  },
  {
    id: 24,
    category: "03 - Receitas Não Operacionais",
    january: 0,
    february: 0,
    march: 462.92,
    april: 0,
    may: 0,
    june: 435.72,
    july: 282.91,
    august: 0,
    september: 732.57,
    october: 0,
    november: 0,
    december: 0,
    total: 1914.12
  },
  {
    id: 25,
    category: "04 - Despesas Não Operacionais",
    january: -556.33,
    february: -556.33,
    march: -556.33,
    april: -556.33,
    may: -556.33,
    june: -683.15,
    july: -556.33,
    august: -556.33,
    september: -27406.53,
    october: -5000,
    november: 0,
    december: 0,
    total: -36983.99
  },
  {
    id: 26,
    category: "05 - Distribuição de Lucros",
    january: -5475,
    february: -6750,
    march: -7572.84,
    april: -7622,
    may: -14400,
    june: -11358.04,
    july: -11360.36,
    august: -11793.02,
    september: -6540,
    october: -18891.68,
    november: 0,
    december: 0,
    total: -101762.94
  },
  {
    id: 27,
    category: "Geração de Caixa do Período",
    january: -578.47,
    february: 5079.15,
    march: 5192.13,
    april: 4499.74,
    may: -3153.16,
    june: 4733.23,
    july: 12821.71,
    august: 1674.39,
    september: -14506.26,
    october: -20969.2,
    november: 0,
    december: 0,
    total: -5206.74
  },
  {
    id: 28,
    category: "Saldo final",
    january: 16001.52,
    february: 21080.67,
    march: 26272.8,
    april: 30772.54,
    may: 27619.38,
    june: 32352.61,
    july: 45174.32,
    august: 46848.71,
    september: 32342.45,
    october: 11373.25,
    november: 11373.25,
    december: 11373.25
  }
];

interface FluxoDeCaixaProps {
  isPresentationMode?: boolean;
}

const FluxoDeCaixa: React.FC<FluxoDeCaixaProps> = ({ isPresentationMode = false }) => {
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    if (value === 0) return "R$ 0,00";
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return formatted;
  };

  // Função para determinar o estilo da categoria baseado na hierarquia
  const getCategoryStyle = (category: string) => {
    if (category === "Saldo inicial" || category === "Saldo final") {
      return "bg-gray-100 font-semibold";
    }
    if (category.includes("Geração de Caixa")) {
      return "bg-blue-50 font-semibold";
    }
    if (category.match(/^\d{2} - /)) {
      return "bg-teal-50 font-semibold";
    }
    if (category.match(/^\d{2}\.\d{2} - /)) {
      return "bg-teal-25 font-medium";
    }
    return "bg-white";
  };

  // Função para determinar o nível de indentação
  const getIndentationLevel = (category: string) => {
    if (category === "Saldo inicial" || category === "Saldo final") return 0;
    if (category.includes("Geração de Caixa")) return 0;
    if (category.match(/^\d{2} - /)) return 0;
    if (category.match(/^\d{2}\.\d{2} - /)) return 1;
    if (category.match(/^\d{2}\.\d{2}\.\d{2} - /)) return 2;
    return 0;
  };

  // Configuração das colunas do DataGrid
  const columns = useMemo(() => [
    {
      key: 'category',
      header: 'Categoria',
      accessorKey: 'category',
      minWidth: 300,
      flex: true, // Nova propriedade para esticar ao máximo
      resizable: false, // Não permitir redimensionamento manual
      cell: (value: string, row: any) => {
        const level = getIndentationLevel(value);
        const style = getCategoryStyle(value);
        return (
          <div className={`${style} pl-${level * 4}`}>
            <span className="text-sm">{value}</span>
          </div>
        );
      },
      headerAlign: 'left' as const,
      cellAlign: 'left' as const,
      sortable: true,
      freezeable: true
    },
    {
      key: 'january',
      header: 'Janeiro',
      accessorKey: 'january',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'february',
      header: 'Fevereiro',
      accessorKey: 'february',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'march',
      header: 'Março',
      accessorKey: 'march',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'april',
      header: 'Abril',
      accessorKey: 'april',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'may',
      header: 'Maio',
      accessorKey: 'may',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'june',
      header: 'Junho',
      accessorKey: 'june',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'july',
      header: 'Julho',
      accessorKey: 'july',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'august',
      header: 'Agosto',
      accessorKey: 'august',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'september',
      header: 'Setembro',
      accessorKey: 'september',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'october',
      header: 'Outubro',
      accessorKey: 'october',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'november',
      header: 'Novembro',
      accessorKey: 'november',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    },
    {
      key: 'december',
      header: 'Dezembro',
      accessorKey: 'december',
      width: 120,
      cell: (value: number) => (
        <span className="text-sm font-mono text-right block">
          {formatCurrency(value)}
        </span>
      ),
      headerAlign: 'center' as const,
      cellAlign: 'right' as const,
      sortable: true
    }
  ], []);

  return (
    <Card className={`w-full ${isPresentationMode ? 'h-full max-w-none' : 'h-[600px]'}`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isPresentationMode ? 'pb-0' : 'pb-4'}`}>
        <CardTitle className={`text-xl font-semibold ${isPresentationMode ? 'text-2xl' : ''}`}>Fluxo de Caixa</CardTitle>
        {!isPresentationMode && (
          <div className="flex items-center gap-2">
            <Select defaultValue="detalhado">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Apresentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detalhado">Detalhado</SelectItem>
                <SelectItem value="resumido">Resumido</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="sem-percentual">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Representação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem-percentual">Sem %</SelectItem>
                <SelectItem value="com-percentual">Com %</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="realizado">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="previsto">Previsto</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="2025">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <div className="h-full">
          <DataGrid
            id="fluxo-de-caixa"
            data={fluxoDeCaixaData}
            columns={columns}
            pagination={false}
            height="100%"
            searchable={false}
            exportable={false}
            columnConfigurable={true}
            configurable={!isPresentationMode}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FluxoDeCaixa;
