import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StepableDateRange } from '@/components/input/StepableDateRange';
import type { DateRange } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { UseFormReturn, FormProvider } from 'react-hook-form';
import { AutoCompleteAsaasCustomers } from '../../customers/components/AutoCompleteAsaasCustomers';
import { ChargesStatusFilters } from './ChargesStatusFilters';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ChargesFiltersProps {
  form: UseFormReturn<{ customerId?: string }>;
}

export function ChargesFilters({ form }: ChargesFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);
  const dateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calcula a data de hoje como padrão
  const getTodayRange = (): DateRange => {
    const today = new Date();
    // Remove horas, minutos, segundos e milissegundos
    today.setHours(0, 0, 0, 0);
    return {
      from: today,
      to: today,
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

  // Inicializa o estado: se há datas na URL, usa elas; senão, usa a data de hoje
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    return dateRangeFromUrl || getTodayRange();
  });

  // Inicializa com a data de hoje se não houver filtros na URL
  useEffect(() => {
    if (!hasInitialized.current) {
      if (!dateRangeFromUrl) {
        // Se não há datas na URL, inicializa com hoje e atualiza a URL
        const todayRange = getTodayRange();
        setDateRange(todayRange);
        
        const params = new URLSearchParams(searchParams);
        params.set('startDate', format(todayRange.from, 'yyyy-MM-dd'));
        params.set('endDate', format(todayRange.to, 'yyyy-MM-dd'));
        setSearchParams(params, { replace: true });
      } else {
        // Se há datas na URL, garante que o estado está sincronizado
        setDateRange(dateRangeFromUrl);
      }
      hasInitialized.current = true;
    } else if (dateRangeFromUrl) {
      // Atualiza quando as datas da URL mudarem (mas só se já foi inicializado)
      setDateRange(dateRangeFromUrl);
    }
  }, [dateRangeFromUrl, setSearchParams, searchParams]);

  // Limpa o timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (dateUpdateTimeoutRef.current) {
        clearTimeout(dateUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Handler para quando o usuário seleciona um novo intervalo
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    // Atualiza o estado local imediatamente para feedback visual
    setDateRange(newRange);
    
    // Limpa o timeout anterior se existir
    if (dateUpdateTimeoutRef.current) {
      clearTimeout(dateUpdateTimeoutRef.current);
    }
    
    // Cria um novo timeout de 1 segundo para atualizar a URL
    dateUpdateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      if (newRange?.from && newRange?.to) {
        // Converte Date para formato YYYY-MM-DD
        const startDate = format(newRange.from, 'yyyy-MM-dd');
        const endDate = format(newRange.to, 'yyyy-MM-dd');
        
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      } else {
        params.delete('startDate');
        params.delete('endDate');
      }
      
      setSearchParams(params, { replace: true });
      dateUpdateTimeoutRef.current = null;
    }, 1000);
  };

  const hasFilters = dateRange?.from && dateRange?.to;

  // Estado do checkbox de problemas
  const showProblemsOnly = searchParams.get('showProblemsOnly') === 'true';

  const handleShowProblemsToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set('showProblemsOnly', 'true');
    } else {
      params.delete('showProblemsOnly');
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Checkbox de Filtro de Problemas */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showProblemsOnly"
          checked={showProblemsOnly}
          onCheckedChange={handleShowProblemsToggle}
        />
        <Label
          htmlFor="showProblemsOnly"
          className="text-sm font-normal cursor-pointer whitespace-nowrap"
        >
          Inconformidades
        </Label>
      </div>

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
      
      {/* Filtro de Status e BillingType */}
      <ChargesStatusFilters />
      
      {/* Filtro de Data */}
      <div className="w-[320px]">
        <StepableDateRange
          placeholder="Selecione o período"
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
}

