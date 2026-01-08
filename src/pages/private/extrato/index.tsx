import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, DollarSign, ArrowUpDown } from 'lucide-react';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { useExtrato } from '@/modules/extrato/hooks/useExtrato';
import DataGrid from '@/components/DataGrid';
import { Badge } from '@/components/ui/badge';
import { ExtratoItem } from '@/modules/extrato/services/extrato.service';

export default function Extrato() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentCompany } = useCompany();
  const { extratoData, isLoading, saldoAtual, fetchExtrato } = useExtrato();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getTipoIcon = (type: number, source: string) => {
    if (source === 'transfer_out' || source === 'transfer_in') {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return <DollarSign className="h-4 w-4" />;
  };

  const getTipoColor = (type: number) => {
    return type === 1 ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Conciliado': 'default',
      'Atrasado': 'destructive',
      'Quitado': 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCNPJCPF = (cnpjcpf: string) => {
    if (!cnpjcpf) return '-';
    if (cnpjcpf.length === 11) {
      // CPF
      return cnpjcpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cnpjcpf.length === 14) {
      // CNPJ
      return cnpjcpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpjcpf;
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateRunningBalance = (index: number) => {
    // Calcular saldo acumulado baseado no saldo atual e nas transações anteriores
    let balance = saldoAtual;
    for (let i = extratoData.length - 1; i > index; i--) {
      balance -= (extratoData[i].type === 1 ? extratoData[i].value : -extratoData[i].value);
    }
    return balance;
  };

  const getAccountIcon = (accountName: string) => {
    if (accountName.toLowerCase().includes('inter')) {
      return '🏦';
    } else if (accountName.toLowerCase().includes('asaas')) {
      return '💳';
    }
    return '🏛️';
  };

  // Configuração das colunas do DataGrid
  const columns = [
    {
      key: 'type',
      header: 'Tipo',
      width: 20,
      headerAlign: 'center' as const,
      cellAlign: 'center' as const,
      cell: (_: any, row: ExtratoItem) => (
        <div className="flex justify-center items-center w-full">
          <div className={`${getTipoColor(row.type)}`}>
            {getTipoIcon(row.type, row.source)}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Data',
      width: 100,
      headerAlign: 'center' as const,
      cellAlign: 'center' as const,
      cell: (_: any, row: ExtratoItem) => (
        <span className="text-sm">
          {formatDate(row.treasury.movement_date)}
        </span>
      ),
    },
    {
      key: 'client_supplier',
      header: 'Cliente/Fornecedor',
      width: 200,
      cell: (_: any, row: ExtratoItem) => {
        const name = row.installment?.document.people.name || 
                     row.transfers?.description || 
                     'Transferência';
        return (
          <span className="text-sm truncate" title={name}>
            {name}
          </span>
        );
      },
    },
    {
      key: 'cnpj_cpf',
      header: 'CNPJ/CPF',
      width: 150,
      cell: (_: any, row: ExtratoItem) => {
        const cnpjcpf = row.installment?.document.people.cnpjcpf || '';
        return (
          <span className="text-sm">
            {cnpjcpf ? formatCNPJCPF(cnpjcpf) : '-'}
          </span>
        );
      },
    },
    {
      key: 'description',
      header: 'Descrição',
      width: 200,
      cell: (_: any, row: ExtratoItem) => {
        const description = row.installment?.document.description || 
                           row.transfers?.description || 
                           'Transferência';
        return (
          <span className="text-sm truncate" title={description}>
            {description}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      headerAlign: 'center' as const,
      cellAlign: 'center' as const,
      cell: (_: any, row: ExtratoItem) => (
        <div className="flex justify-center items-center w-full">
          {getStatusBadge(row.status)}
        </div>
      ),
    },
    {
      key: 'fiscal_document',
      header: 'Documento Fiscal',
      width: 150,
      cell: (_: any, row: ExtratoItem) => (
        <span className="text-sm">
          {row.installment?.document.code || '-'}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Valor',
      width: 120,
      headerAlign: 'right' as const,
      cellAlign: 'right' as const,
      cell: (_: any, row: ExtratoItem) => (
        <span className={`text-sm font-medium ${getTipoColor(row.type)}`}>
          {row.type === 1 ? '+' : '-'}{formatValue(Math.abs(row.value))}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Saldo',
      width: 120,
      headerAlign: 'right' as const,
      cellAlign: 'right' as const,
      cell: (_: any, row: ExtratoItem, index: number) => {
        const saldoAcumulado = calculateRunningBalance(index);
        return (
          <span className="text-sm font-medium text-green-600">
            {formatValue(saldoAcumulado)}
          </span>
        );
      },
    },
    {
      key: 'account',
      header: 'Conta',
      width: 120,
      cell: (_: any, row: ExtratoItem) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getAccountIcon(row.account.name)}</span>
          <span className="text-sm truncate" title={row.account.name}>
            {row.account.name}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      width: 150,
      cell: (_: any, row: ExtratoItem) => {
        const category = row.installment?.document.category_level_3;
        if (!category) return <span className="text-sm">-</span>;
        
        return (
          <span className="text-sm truncate" title={`${category.structure} - ${category.description}`}>
            {category.structure} - {category.description}
          </span>
        );
      },
    },
  ];

  if (authLoading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Extrato" 
        description="Visualize o extrato financeiro da empresa"
        icon={<FileText className="h-5 w-5 text-primary" />}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchExtrato()}
          disabled={isLoading}
          title="Atualizar extrato"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </PageHeader>

            {!currentCompany ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma empresa selecionada</h3>
                  <p className="text-muted-foreground">
                    Selecione uma empresa para visualizar o extrato
                  </p>
                </div>
              </div>
            ) : !currentCompany.client_id || !currentCompany.client_secret ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chaves de API não configuradas</h3>
                  <p className="text-muted-foreground">
                    Configure as chaves de API da empresa para visualizar o extrato
                  </p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando extrato...</p>
                </div>
              </div>
            ) : extratoData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há movimentações financeiras para o período selecionado
                  </p>
                  <Button onClick={() => fetchExtrato()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <DataGrid
                  id="extrato-grid"
                  data={extratoData}
                  columns={columns}
                  pagination={true}
                  pageSize={100}
                  height="500px"
                  loading={isLoading}
                  enableRowSelection={false}
                />
              </div>
            )}
    </>
  );
}
