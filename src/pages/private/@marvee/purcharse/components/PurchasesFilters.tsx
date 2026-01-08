import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { StepableDateRange } from '@/components/input/StepableDateRange';
import type { DateRange } from 'react-day-picker';
import { format, parse, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { Input } from '@/components/ui/input';

export function PurchasesFilters() {
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
  const [codeReference, setCodeReference] = useState<string>(
    searchParams.get('code_reference') || ''
  );

  // Inicializa com o mês atual se não houver filtros na URL
  useEffect(() => {
    if (!hasInitialized.current && !dateRangeFromUrl) {
      const currentMonthRange = getCurrentMonthRange();
      setDateRange(currentMonthRange);

      // Atualiza a URL com o mês atual
      const params = new URLSearchParams();
      params.set('dateStart', format(currentMonthRange.from, 'yyyy-MM-dd'));
      params.set('dateEnd', format(currentMonthRange.to, 'yyyy-MM-dd'));
      if (codeReference) {
        params.set('code_reference', codeReference);
      }
      setSearchParams(params, { replace: true });

      hasInitialized.current = true;
    } else if (dateRangeFromUrl) {
      setDateRange(dateRangeFromUrl);
      hasInitialized.current = true;
    }
  }, [dateRangeFromUrl, setSearchParams, codeReference]);

  // Handler para quando o usuário seleciona um novo intervalo
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);

    const params = new URLSearchParams();

    if (newRange?.from && newRange?.to) {
      // Converte Date para formato YYYY-MM-DD
      const startDate = format(newRange.from, 'yyyy-MM-dd');
      const endDate = format(newRange.to, 'yyyy-MM-dd');

      params.set('dateStart', startDate);
      params.set('dateEnd', endDate);
    }

    if (codeReference) {
      params.set('code_reference', codeReference);
    }

    setSearchParams(params, { replace: true });
  };

  // Handler para código de referência
  const handleCodeReferenceChange = (value: string) => {
    setCodeReference(value);

    const params = new URLSearchParams();

    // Mantém as datas se existirem
    const startDate = searchParams.get('dateStart');
    const endDate = searchParams.get('dateEnd');
    if (startDate) params.set('dateStart', startDate);
    if (endDate) params.set('dateEnd', endDate);

    if (value) {
      params.set('code_reference', value);
    } else {
      params.delete('code_reference');
    }

    setSearchParams(params, { replace: true });
  };

  const handleClear = () => {
    // Ao limpar, volta para o mês atual
    const currentMonthRange = getCurrentMonthRange();
    setDateRange(currentMonthRange);
    setCodeReference('');

    const params = new URLSearchParams();
    params.set('dateStart', format(currentMonthRange.from, 'yyyy-MM-dd'));
    params.set('dateEnd', format(currentMonthRange.to, 'yyyy-MM-dd'));
    setSearchParams(params, { replace: true });
  };

  const hasFilters =
    (dateRange?.from && dateRange?.to) || codeReference.trim() !== '';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="w-[320px]">
        <StepableDateRange
          placeholder="Selecione o período"
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      <div className="w-[200px]">
        <Input
          placeholder="Código de referência"
          value={codeReference}
          onChange={(e) => handleCodeReferenceChange(e.target.value)}
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

