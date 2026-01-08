import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ChargeStatus, CHARGE_STATUS_LABELS, BillingType, BILLING_TYPE_LABELS, DEFAULT_STATUS_FILTERS } from '../types';

// Opções de status
const STATUS_OPTIONS = Object.values(ChargeStatus).map(status => ({
  value: status,
  label: CHARGE_STATUS_LABELS[status],
}));

// Opções de billingType (excluindo DEBIT_CARD se não for necessário, ou incluindo se for)
const BILLING_TYPE_OPTIONS = [
  BillingType.BOLETO,
  BillingType.CREDIT_CARD,
  BillingType.PIX,
].map(type => ({
  value: type,
  label: BILLING_TYPE_LABELS[type],
}));

export function ChargesStatusFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  
  // Lê os status selecionados da URL (ou usa os padrões se não houver)
  const selectedStatuses = useMemo(() => {
    const statusParam = searchParams.get('status');
    if (!statusParam) {
      // Se não houver na URL, retorna os valores padrão
      return DEFAULT_STATUS_FILTERS.map(s => s as string);
    }
    // Suporta tanto array quanto string única
    if (statusParam.includes(',')) {
      return statusParam.split(',').filter(Boolean);
    }
    return [statusParam];
  }, [searchParams]);
  
  // Lê os billingTypes selecionados da URL
  const selectedBillingTypes = useMemo(() => {
    const billingTypeParam = searchParams.get('billingType');
    if (!billingTypeParam) return [];
    // Suporta tanto array quanto string única
    if (billingTypeParam.includes(',')) {
      return billingTypeParam.split(',').filter(Boolean);
    }
    return [billingTypeParam];
  }, [searchParams]);
  
  // Estado local para os checkboxes (inicializa com os valores da URL ou padrões)
  const [localSelectedStatuses, setLocalSelectedStatuses] = useState<string[]>(() => {
    return selectedStatuses.length > 0 
      ? selectedStatuses 
      : DEFAULT_STATUS_FILTERS.map(s => s as string);
  });
  const [localSelectedBillingTypes, setLocalSelectedBillingTypes] = useState<string[]>(selectedBillingTypes);
  
  // Sincroniza estado local com URL quando a URL mudar externamente
  useEffect(() => {
    setLocalSelectedStatuses(selectedStatuses.length > 0 
      ? selectedStatuses 
      : DEFAULT_STATUS_FILTERS.map(s => s as string));
  }, [selectedStatuses]);
  
  useEffect(() => {
    setLocalSelectedBillingTypes(selectedBillingTypes);
  }, [selectedBillingTypes]);
  
  // Handler para mudança de checkbox de status
  const handleStatusToggle = (status: string) => {
    const newSelected = localSelectedStatuses.includes(status)
      ? localSelectedStatuses.filter(s => s !== status)
      : [...localSelectedStatuses, status];
    
    setLocalSelectedStatuses(newSelected);
  };
  
  // Handler para mudança de checkbox de billingType
  const handleBillingTypeToggle = (billingType: string) => {
    const newSelected = localSelectedBillingTypes.includes(billingType)
      ? localSelectedBillingTypes.filter(b => b !== billingType)
      : [...localSelectedBillingTypes, billingType];
    
    setLocalSelectedBillingTypes(newSelected);
  };
  
  // Handler para aplicar filtros
  const handleApply = () => {
    const params = new URLSearchParams(searchParams);
    
    // Verifica se os status selecionados são os padrões
    const defaultStatusStrings = DEFAULT_STATUS_FILTERS.map(s => s as string);
    const isDefaultStatus = localSelectedStatuses.length === defaultStatusStrings.length &&
      defaultStatusStrings.every(status => localSelectedStatuses.includes(status));
    
    if (isDefaultStatus) {
      // Se são os padrões, remove da URL para manter limpa
      params.delete('status');
    } else if (localSelectedStatuses.length > 0) {
      params.set('status', localSelectedStatuses.join(','));
    } else {
      params.delete('status');
    }
    
    if (localSelectedBillingTypes.length > 0) {
      params.set('billingType', localSelectedBillingTypes.join(','));
    } else {
      params.delete('billingType');
    }
    
    setSearchParams(params, { replace: true });
    setOpen(false);
  };
  
  // Handler para limpar filtros (volta para os valores padrão)
  const handleClear = () => {
    const defaultStatusStrings = DEFAULT_STATUS_FILTERS.map(s => s as string);
    setLocalSelectedStatuses(defaultStatusStrings);
    setLocalSelectedBillingTypes([]);
    const params = new URLSearchParams(searchParams);
    params.delete('status');
    params.delete('billingType');
    setSearchParams(params, { replace: true });
    setOpen(false);
  };
  
  // Considera que há filtros ativos se houver billingType OU se os status forem diferentes dos padrões
  const hasActiveFilters = useMemo(() => {
    const hasBillingTypeFilter = selectedBillingTypes.length > 0;
    const hasNonDefaultStatus = selectedStatuses.length > 0 && 
      (selectedStatuses.length !== DEFAULT_STATUS_FILTERS.length ||
       !DEFAULT_STATUS_FILTERS.every(status => selectedStatuses.includes(status as string)));
    return hasBillingTypeFilter || hasNonDefaultStatus;
  }, [selectedStatuses, selectedBillingTypes]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "gap-2",
            hasActiveFilters && "bg-primary text-primary-foreground"
          )}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[340px] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4 space-y-4">
          {/* Filtro de Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Situações das cobranças</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {STATUS_OPTIONS.map((status) => {
                const isChecked = localSelectedStatuses.includes(status.value);
                return (
                  <div
                    key={status.value}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={isChecked}
                      onCheckedChange={() => handleStatusToggle(status.value)}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="text-sm font-normal cursor-pointer flex-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Filtro de BillingType */}
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-sm font-semibold">Forma de pagamento</h4>
            <div className="space-y-2">
              {BILLING_TYPE_OPTIONS.map((billingType) => {
                const isChecked = localSelectedBillingTypes.includes(billingType.value);
                return (
                  <div
                    key={billingType.value}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={`billingType-${billingType.value}`}
                      checked={isChecked}
                      onCheckedChange={() => handleBillingTypeToggle(billingType.value)}
                    />
                    <label
                      htmlFor={`billingType-${billingType.value}`}
                      className="text-sm font-normal cursor-pointer flex-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {billingType.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={(() => {
                // Desabilita apenas se já estiver nos valores padrão e sem billingType
                const defaultStatusStrings = DEFAULT_STATUS_FILTERS.map(s => s as string);
                const isDefaultStatus = localSelectedStatuses.length === defaultStatusStrings.length &&
                  defaultStatusStrings.every(status => localSelectedStatuses.includes(status));
                return isDefaultStatus && localSelectedBillingTypes.length === 0;
              })()}
            >
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

