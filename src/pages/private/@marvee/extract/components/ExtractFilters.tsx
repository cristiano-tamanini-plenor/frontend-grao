import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { StepableDateRange } from '@/components/input/StepableDateRange';
import type { DateRange } from 'react-day-picker';
import { isValid, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Converte Date para formato ISO 8601 com hora inicial/final do dia
 */
function dateToISO8601(date: Date, isEndDate: boolean = false): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (isEndDate) {
    return `${year}-${month}-${day}T23:59:59.999Z`;
  }
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

export function ExtractFilters() {
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
    const startDate = searchParams.get('dateStart');
    const endDate = searchParams.get('dateEnd');

    if (startDate && endDate) {
      try {
        // Parse ISO 8601 para Date
        const from = new Date(startDate);
        const to = new Date(endDate);

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

      // Atualiza a URL com o mês atual (formato ISO 8601)
      const params = new URLSearchParams();
      params.set('dateStart', dateToISO8601(currentMonthRange.from, false));
      params.set('dateEnd', dateToISO8601(currentMonthRange.to, true));
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
      // Converte Date para formato ISO 8601
      params.set('dateStart', dateToISO8601(newRange.from, false));
      params.set('dateEnd', dateToISO8601(newRange.to, true));
    }

    // Mantém outros parâmetros se existirem
    const accounts = searchParams.get('accounts');
    const categories = searchParams.get('categories');
    const cost_centers = searchParams.get('cost_centers');
    const status = searchParams.get('status');
    
    if (accounts) params.set('accounts', accounts);
    if (categories) params.set('categories', categories);
    if (cost_centers) params.set('cost_centers', cost_centers);
    if (status) params.set('status', status);

    setSearchParams(params, { replace: true });
  };

  const handleClear = () => {
    // Ao limpar, volta para o mês atual
    const currentMonthRange = getCurrentMonthRange();
    setDateRange(currentMonthRange);

    const params = new URLSearchParams();
    params.set('dateStart', dateToISO8601(currentMonthRange.from, false));
    params.set('dateEnd', dateToISO8601(currentMonthRange.to, true));
    setSearchParams(params, { replace: true });
  };

  const hasFilters = dateRange?.from && dateRange?.to;

  return (
    <div className="flex items-center gap-2 flex-wrap">
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

