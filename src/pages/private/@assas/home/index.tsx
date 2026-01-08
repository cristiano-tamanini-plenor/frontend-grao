import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAsaasHome } from './hooks/useAsaasHome';
import { asaasHomeService } from './services/home.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Wallet, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Users, 
  CreditCard, 
  Receipt, 
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useState } from 'react';
export default function AsaasHome() {
  const navigate = useNavigate();
  const { data: homeData, isLoading, refetch } = useAsaasHome();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [showProcessingAmount, setShowProcessingAmount] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [apiToken, setApiToken] = useState('');

  // Mutation para configurar integração
  const configureIntegrationMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return asaasHomeService.configureIntegration(currentCompany.id, token);
    },
    onSuccess: async () => {
      toast.success('Integração configurada com sucesso!');
      setIsIntegrationModalOpen(false);
      setApiToken('');
      // Recarrega os dados da home
      queryClient.invalidateQueries({ queryKey: ['asaas-home', currentCompany?.id] });
      // Força o refetch imediato
      await refetch();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro ao configurar integração';
      toast.error(errorMessage);
    },
  });

  const handleOpenIntegrationModal = () => {
    setIsIntegrationModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setIsIntegrationModalOpen(false);
    setApiToken('');
  };

  const handleSubmitIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiToken.trim()) {
      toast.error('Por favor, insira a chave de API');
      return;
    }
    configureIntegrationMutation.mutate(apiToken.trim());
  };

  // Formata data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Formata valor monetário
  const formatCurrencyValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Dados padrão enquanto carrega
  const balance = homeData?.balance || { balance: 0, processingAmount: 0 };
  const transactions = homeData?.recentTransactions || [];
  const integrationStatus = homeData?.integrationStatus || { isConnected: false };
  const counts = homeData?.counts || { activeCustomers: 0, activeSubscriptions: 0, totalCharges: 0 };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Asaas</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenIntegrationModal}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : integrationStatus.isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-red-600">Desconectado</span>
            </>
          )}
        </Button>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Saldo e Movimentações - Esquerda */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
            <CardTitle className="text-lg font-semibold">Extrato</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/extrato')}
              className="text-muted-foreground hover:text-foreground"
            >
              Ver mais <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col min-h-0">
            {/* Saldo */}
            <div className="space-y-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saldo em conta</span>
              </div>
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  formatCurrencyValue(balance.balance)
                )}
              </div>
              
              {/* Em processamento */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Em processamento</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowProcessingAmount(!showProcessingAmount)}
                  >
                    {showProcessingAmount ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm font-medium">
                    {showProcessingAmount 
                      ? formatCurrencyValue(balance.processingAmount)
                      : '••••••'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Últimas movimentações */}
            <div className="space-y-4 pt-4 flex flex-col min-h-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold">Últimas movimentações</span>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma movimentação recente
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/extrato')}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {transaction.description}
                          </span>
                          {transaction.customerName && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.customerName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.status && (
                            <>
                              <span>•</span>
                              <span>{transaction.status}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === 'credit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrencyValue(transaction.value)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coluna direita - Features */}
        <div className="flex flex-col gap-4">
            {/* Card Clientes */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/asaas-clientes')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">Clientes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground inline-block" />
                    ) : (
                      counts.activeCustomers.toLocaleString('pt-BR')
                    )}
                  </span>
                  <CardDescription className="text-sm">
                    {counts.activeCustomers === 1 ? 'cliente ativo' : 'clientes ativos'}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>

            {/* Card Assinaturas */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/asaas-assinaturas')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">Assinaturas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground inline-block" />
                    ) : (
                      counts.activeSubscriptions.toLocaleString('pt-BR')
                    )}
                  </span>
                  <CardDescription className="text-sm">
                    {counts.activeSubscriptions === 1 ? 'assinatura ativa' : 'assinaturas ativas'}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>

            {/* Card Cobranças */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/asaas-cobrancas')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">Cobranças</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground inline-block" />
                    ) : (
                      counts.totalCharges.toLocaleString('pt-BR')
                    )}
                  </span>
                  <CardDescription className="text-sm">
                    {counts.totalCharges === 1 ? 'cobrança' : 'cobranças'}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Modal de Configuração de Integração */}
      <Dialog open={isIntegrationModalOpen} onOpenChange={handleCloseIntegrationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Integração Asaas</DialogTitle>
            <DialogDescription>
              Insira sua chave de API do Asaas para conectar a integração. A chave será validada antes de ser salva.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitIntegration}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-token">Chave de API</Label>
                <Input
                  id="api-token"
                  type="password"
                  placeholder="Digite sua chave de API do Asaas"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  disabled={configureIntegrationMutation.isPending}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Você pode encontrar sua chave de API nas configurações da sua conta Asaas.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseIntegrationModal}
                disabled={configureIntegrationMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={configureIntegrationMutation.isPending || !apiToken.trim()}
              >
                {configureIntegrationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  'Configurar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

