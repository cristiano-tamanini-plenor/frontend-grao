import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { StepableDateRange } from '@/components/input/StepableDateRange';
import type { DateRange } from 'react-day-picker';
import { format, parse, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { UseFormReturn, FormProvider } from 'react-hook-form';
import { AutoCompleteAsaasCustomers } from '../../customers/components/AutoCompleteAsaasCustomers';

interface SubscriptionsFiltersProps {
  form: UseFormReturn<{ customerId?: string }>;
}

export function SubscriptionsFilters({ form }: SubscriptionsFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);
  
  // Calcula o mês atual como padrão
  const getCurrentMonthRange = (): DateRange => {
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: endOfMonth(now),
    };
  };
  
  // Converte as datas da URL para DateRange
  const dateRangeFromUrl = useMemo(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate && endDate) {
      try {
        const from = parse(startDate, 'yyyy-MM-dd', new Date());
        const to = parse(endDate, 'yyyy-MM-dd', new Date());
        
        if (isValid(from) && isValid(to)) {
          return {
            from,
            to,
          } as DateRange;
        }
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [searchParams]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(dateRangeFromUrl);

  // Inicializa com o mês atual se não houver filtros na URL
  useEffect(() => {
    if (!hasInitialized.current && !dateRangeFromUrl) {
      const currentMonthRange = getCurrentMonthRange();
      setDateRange(currentMonthRange);
      
      // Atualiza a URL com o mês atual
      const params = new URLSearchParams();
      params.set('startDate', format(currentMonthRange.from, 'yyyy-MM-dd'));
      params.set('endDate', format(currentMonthRange.to, 'yyyy-MM-dd'));
      setSearchParams(params, { replace: true });
      
      hasInitialized.current = true;
    } else if (dateRangeFromUrl) {
      setDateRange(dateRangeFromUrl);
      hasInitialized.current = true;
    }
  }, [dateRangeFromUrl, setSearchParams]);

  // Handler para quando o usuário seleciona um novo intervalo
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    
    const params = new URLSearchParams();
    
    if (newRange?.from && newRange?.to) {
      // Converte Date para formato YYYY-MM-DD
      const startDate = format(newRange.from, 'yyyy-MM-dd');
      const endDate = format(newRange.to, 'yyyy-MM-dd');
      
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    }
    
    setSearchParams(params, { replace: true });
  };

  const handleClear = () => {
    // Ao limpar, volta para o mês atual
    const currentMonthRange = getCurrentMonthRange();
    setDateRange(currentMonthRange);
    
    const params = new URLSearchParams();
    params.set('startDate', format(currentMonthRange.from, 'yyyy-MM-dd'));
    params.set('endDate', format(currentMonthRange.to, 'yyyy-MM-dd'));
    setSearchParams(params, { replace: true });
  };

  const hasFilters = dateRange?.from && dateRange?.to;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filtro de Cliente */}
      <div className="w-[320px]">
        <FormProvider {...form}>
          <AutoCompleteAsaasCustomers
            control={form.control}
            name="customerId"
            label=""
            placeholder="Selecione um cliente..."
            required={false}
          />
        </FormProvider>
      </div>
      
      {/* Filtro de Data */}
      <div className="w-[320px]">
        <StepableDateRange
          placeholder="Selecione o período"
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}

