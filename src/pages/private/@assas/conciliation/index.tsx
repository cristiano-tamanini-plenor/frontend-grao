import { useState, useMemo } from 'react';
import { useCharges } from '@/pages/private/@assas/charges/hooks/useCharges';
import { useSales } from '@/pages/private/@marvee/sales/hooks/useSales';
import { CardCharge } from './components/cardCharge';
import { CardSale } from './components/cardSale';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { CreditCard } from 'lucide-react';

export default function Conciliation() {
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // Filtros para charges - você pode adicionar controles de data depois
  const chargesFilters = useMemo(() => ({
    limit: 50,
    offset: 0,
  }), []);

  // Filtros para sales - você pode adicionar controles de data depois
  const salesFilters = useMemo(() => ({
    page: 1,
    pageSize: 50,
  }), []);

  const { data: chargesResponse, isLoading: isLoadingCharges } = useCharges(chargesFilters);
  const { data: salesResponse, isLoading: isLoadingSales } = useSales(salesFilters);

  const charges = useMemo(() => {
    return chargesResponse?.data || [];
  }, [chargesResponse]);

  const sales = useMemo(() => {
    return salesResponse?.data || [];
  }, [salesResponse]);

  const handleChargeSelect = (chargeId: string, selected: boolean) => {
    if (selected) {
      setSelectedChargeId(chargeId);
      // Se já tinha uma sale selecionada, desmarca
      if (selectedSaleId) {
        setSelectedSaleId(null);
      }
    } else {
      setSelectedChargeId(null);
    }
  };

  const handleSaleSelect = (saleId: number, selected: boolean) => {
    if (selected) {
      setSelectedSaleId(saleId);
      // Se já tinha uma charge selecionada, desmarca
      if (selectedChargeId) {
        setSelectedChargeId(null);
      }
    } else {
      setSelectedSaleId(null);
    }
  };

  const handleLink = () => {
    if (selectedChargeId && selectedSaleId) {
      // TODO: Implementar função de link
      console.log('Linking charge', selectedChargeId, 'with sale', selectedSaleId);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={CreditCard} 
          title="Conciliação"
          canCreate={false}
        />
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        {/* Coluna esquerda - Charges */}
        <div className="flex-1 flex flex-col min-w-0 w-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Cobranças Asaas</h2>
            <p className="text-sm text-muted-foreground">
              {charges.length} {charges.length === 1 ? 'cobrança encontrada' : 'cobranças encontradas'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-1">
            {isLoadingCharges ? (
              <div className="text-center text-muted-foreground py-8">
                Carregando cobranças...
              </div>
            ) : charges.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma cobrança encontrada
              </div>
            ) : (
              charges.map((charge) => (
                <CardCharge
                  key={charge.id}
                  charge={charge}
                  selected={selectedChargeId === charge.id}
                  onSelect={handleChargeSelect}
                />
              ))
            )}
          </div>
        </div>

        {/* Coluna central - Botão de link */}
        <div className="flex items-center justify-center px-4">
          <Button
            onClick={handleLink}
            disabled={!selectedChargeId || !selectedSaleId}
            size="lg"
            className="rounded-full"
          >
            <Link2 className="h-5 w-5 mr-2" />
            Vincular
          </Button>
        </div>

        {/* Coluna direita - Sales */}
        <div className="flex-1 flex flex-col min-w-0 w-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Vendas Marvee</h2>
            <p className="text-sm text-muted-foreground">
              {sales.length} {sales.length === 1 ? 'venda encontrada' : 'vendas encontradas'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-1">
            {isLoadingSales ? (
              <div className="text-center text-muted-foreground py-8">
                Carregando vendas...
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma venda encontrada
              </div>
            ) : (
              sales.map((sale) => (
                <CardSale
                  key={sale.id}
                  sale={sale}
                  selected={selectedSaleId === sale.id}
                  onSelect={handleSaleSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

