import React, { useState, useCallback, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, parse, isSameDay, isSameMonth, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export interface StepableDateRangeProps {
  label?: string;
  name?: string;
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
}

const PRESET_OPTIONS = [
  { label: 'Todos', getValue: () => ({ from: new Date(1900, 0, 1), to: new Date(2100, 11, 31), isAll: true }) },
  { label: 'Hoje', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Esta semana', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 0 }), to: endOfWeek(new Date(), { weekStartsOn: 0 }) }) },
  { label: 'Esta semana (sáb-sex)', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 6 }), to: endOfWeek(new Date(), { weekStartsOn: 6 }) }) },
  { label: 'Semana passada', getValue: () => {
    const lastWeek = subWeeks(new Date(), 1);
    return { from: startOfWeek(lastWeek, { weekStartsOn: 0 }), to: endOfWeek(lastWeek, { weekStartsOn: 0 }) };
  }},
  { label: 'Mês atual', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Mês passado', getValue: () => {
    const lastMonth = subMonths(new Date(), 1);
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }},
  { label: 'Ano atual', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
];

export function StepableDateRange({
  label,
  name,
  value,
  onChange,
  placeholder = "Selecione um intervalo de datas",
  className,
  disabled = false,
  error = false,
  required = false,
}: StepableDateRangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(value?.from || new Date());
  const [searchValue, setSearchValue] = useState('');
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value);
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);

  // Função para aplicar máscara automática de data
  const applyDateMask = useCallback((value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se não há números, retorna vazio
    if (numbers.length === 0) return '';
    
    // Aplica a máscara baseada no número de dígitos
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    } else {
      // Limita a 8 dígitos (dd/mm/aaaa)
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  }, []);

  const handlePresetSelect = useCallback((preset: typeof PRESET_OPTIONS[0]) => {
    const newRange = preset.getValue();
    onChange?.(newRange);
    setCurrentMonth(newRange.from);
    setTempRange(newRange);
    
    // Se for "Todos", não fechar o popover
    if (preset.label === 'Todos') {
      return;
    }
    
    setIsOpen(false);
  }, [onChange]);

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    if (!range) return;
    
    setTempRange(range);
    
    // Se temos ambas as datas, não fechar automaticamente
    if (range.from && range.to) {
      setIsSelectingRange(false);
    } else if (range.from && !range.to) {
      setIsSelectingRange(true);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const handleManualDateChange = useCallback(() => {
    if (manualStartDate && manualEndDate) {
      try {
        const startDate = parse(manualStartDate, 'dd/MM/yyyy', new Date());
        const endDate = parse(manualEndDate, 'dd/MM/yyyy', new Date());
        
        if (startDate && endDate && startDate <= endDate) {
          const newRange = { from: startDate, to: endDate };
          onChange?.(newRange);
          setTempRange(newRange);
          setCurrentMonth(startDate);
          
          // Limpar os inputs após sucesso
          setManualStartDate('');
          setManualEndDate('');
        }
      } catch (error) {
        console.error('Data inválida:', error);
      }
    }
  }, [manualStartDate, manualEndDate, onChange]);

  // Handlers para os inputs com máscara automática
  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maskedValue = applyDateMask(value);
    setManualStartDate(maskedValue);
    
    // Validação em tempo real
    if (maskedValue.length === 10) {
      try {
        const date = parse(maskedValue, 'dd/MM/yyyy', new Date());
        setStartDateError(!date || isNaN(date.getTime()));
      } catch {
        setStartDateError(true);
      }
    } else {
      setStartDateError(false);
    }
  }, [applyDateMask]);

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maskedValue = applyDateMask(value);
    setManualEndDate(maskedValue);
    
    // Validação em tempo real
    if (maskedValue.length === 10) {
      try {
        const date = parse(maskedValue, 'dd/MM/yyyy', new Date());
        setEndDateError(!date || isNaN(date.getTime()));
      } catch {
        setEndDateError(true);
      }
    } else {
      setEndDateError(false);
    }
  }, [applyDateMask]);

  const handleConfirm = useCallback(() => {
    if (tempRange?.from && tempRange?.to) {
      onChange?.(tempRange);
      setIsOpen(false);
      setIsSelectingRange(false);
    }
  }, [tempRange, onChange]);

  const formatDateRange = useCallback((range: DateRange) => {
    if (!range?.from || !range?.to) return placeholder;
    
    // Se for a opção "Todos", mostrar apenas "Todos"
    if ((range as any).isAll) {
      return 'Todos';
    }
    
    return `${format(range.from, 'dd/MM/yyyy', { locale: ptBR })} até ${format(range.to, 'dd/MM/yyyy', { locale: ptBR })}`;
  }, [placeholder]);

  // Função para detectar o tipo de período e retornar informações adicionais
  const detectPeriodInfo = useCallback((range: DateRange | undefined): { type: 'day' | 'week' | 'month' | 'custom' | null; weekStartsOn?: 0 | 6 } => {
    if (!range?.from || !range?.to) return { type: null };
    
    // Se for "Todos", não navegar
    if ((range as any).isAll) return { type: null };
    
    // Verifica se é um único dia
    if (isSameDay(range.from, range.to)) {
      return { type: 'day' };
    }
    
    // Verifica se é uma semana (domingo-sábado)
    const weekStart0 = startOfWeek(range.from, { weekStartsOn: 0 });
    const weekEnd0 = endOfWeek(range.from, { weekStartsOn: 0 });
    if (isSameDay(range.from, weekStart0) && isSameDay(range.to, weekEnd0)) {
      return { type: 'week', weekStartsOn: 0 };
    }
    
    // Verifica se é uma semana (sábado-sexta)
    const weekStart6 = startOfWeek(range.from, { weekStartsOn: 6 });
    const weekEnd6 = endOfWeek(range.from, { weekStartsOn: 6 });
    if (isSameDay(range.from, weekStart6) && isSameDay(range.to, weekEnd6)) {
      return { type: 'week', weekStartsOn: 6 };
    }
    
    // Verifica se é um mês
    const monthStart = startOfMonth(range.from);
    const monthEnd = endOfMonth(range.from);
    if (isSameDay(range.from, monthStart) && isSameDay(range.to, monthEnd)) {
      return { type: 'month' };
    }
    
    // Caso contrário, é um período personalizado
    return { type: 'custom' };
  }, []);

  // Função auxiliar para obter apenas o tipo
  const detectPeriodType = useCallback((range: DateRange | undefined): 'day' | 'week' | 'month' | 'custom' | null => {
    return detectPeriodInfo(range).type;
  }, [detectPeriodInfo]);

  // Função para navegar para o período anterior
  const navigatePrevious = useCallback(() => {
    if (!value?.from || !value?.to) return;
    
    const periodInfo = detectPeriodInfo(value);
    if (!periodInfo.type) return;
    
    let newRange: DateRange;
    
    switch (periodInfo.type) {
      case 'day':
        const prevDay = subDays(value.from, 1);
        newRange = { from: prevDay, to: prevDay };
        break;
        
      case 'week':
        const prevWeekStart = subWeeks(value.from, 1);
        const weekStartsOn = periodInfo.weekStartsOn ?? 0;
        newRange = {
          from: startOfWeek(prevWeekStart, { weekStartsOn }),
          to: endOfWeek(prevWeekStart, { weekStartsOn })
        };
        break;
        
      case 'month':
        const prevMonthStart = subMonths(value.from, 1);
        newRange = {
          from: startOfMonth(prevMonthStart),
          to: endOfMonth(prevMonthStart)
        };
        break;
        
      case 'custom':
        const daysDiff = differenceInDays(value.to, value.from);
        const newFrom = subDays(value.from, daysDiff + 1);
        const newTo = subDays(value.to, daysDiff + 1);
        newRange = { from: newFrom, to: newTo };
        break;
        
      default:
        return;
    }
    
    onChange?.(newRange);
  }, [value, detectPeriodInfo, onChange]);

  // Função para navegar para o próximo período
  const navigateNext = useCallback(() => {
    if (!value?.from || !value?.to) return;
    
    const periodInfo = detectPeriodInfo(value);
    if (!periodInfo.type) return;
    
    let newRange: DateRange;
    
    switch (periodInfo.type) {
      case 'day':
        const nextDay = addDays(value.from, 1);
        newRange = { from: nextDay, to: nextDay };
        break;
        
      case 'week':
        const nextWeekStart = addDays(value.to, 1);
        const weekStartsOn = periodInfo.weekStartsOn ?? 0;
        newRange = {
          from: startOfWeek(nextWeekStart, { weekStartsOn }),
          to: endOfWeek(nextWeekStart, { weekStartsOn })
        };
        break;
        
      case 'month':
        const nextMonthStart = addDays(endOfMonth(value.from), 1);
        newRange = {
          from: startOfMonth(nextMonthStart),
          to: endOfMonth(nextMonthStart)
        };
        break;
        
      case 'custom':
        const daysDiff = differenceInDays(value.to, value.from);
        const newFrom = addDays(value.to, 1);
        const newTo = addDays(newFrom, daysDiff);
        newRange = { from: newFrom, to: newTo };
        break;
        
      default:
        return;
    }
    
    onChange?.(newRange);
  }, [value, detectPeriodInfo, onChange]);

  const filteredPresets = useMemo(() => {
    if (!searchValue) return PRESET_OPTIONS;
    return PRESET_OPTIONS.filter(preset => 
      preset.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const displayValue = value ? formatDateRange(value) : placeholder;
  const periodType = detectPeriodType(value);
  const canNavigate = periodType !== null && !disabled;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="w-auto max-w-md inline-flex items-center">
          {/* Seta esquerda */}
          {canNavigate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigatePrevious();
              }}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-l-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors z-10 flex-shrink-0",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
              aria-label="Período anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-center text-center font-normal",
                canNavigate ? "rounded-none" : "rounded-md",
                canNavigate && "border-l-0 border-r-0",
                !value && "text-muted-foreground",
                error && "border-destructive focus:ring-destructive",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
              name={name}
              type="button"
            >
              <span className="truncate">{displayValue}</span>
            </Button>
          </PopoverTrigger>
          
          {/* Seta direita */}
          {canNavigate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-r-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors z-10 flex-shrink-0",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
              aria-label="Próximo período"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Painel esquerdo com opções pré-definidas */}
            <div className="w-64 border-r p-4">
              <div className="flex items-center border-b pb-3 mb-3">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Descrição"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              
              {/* Inputs de data manual */}
              <div className="mb-4 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Data Inicial
                  </label>
                  <Input
                    type="text"
                    placeholder="dd/mm/aaaa"
                    value={manualStartDate}
                    onChange={handleStartDateChange}
                    className={cn(
                      "h-8 text-sm",
                      startDateError && "border-red-500 focus:ring-red-500"
                    )}
                    maxLength={10}
                  />
                  {startDateError && (
                    <p className="text-xs text-red-500 mt-1">Data inválida</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Data Final
                  </label>
                  <Input
                    type="text"
                    placeholder="dd/mm/aaaa"
                    value={manualEndDate}
                    onChange={handleEndDateChange}
                    className={cn(
                      "h-8 text-sm",
                      endDateError && "border-red-500 focus:ring-red-500"
                    )}
                    maxLength={10}
                  />
                  {endDateError && (
                    <p className="text-xs text-red-500 mt-1">Data inválida</p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleManualDateChange}
                  disabled={!manualStartDate || !manualEndDate || startDateError || endDateError}
                  className="w-full h-8 text-xs"
                >
                  Aplicar Datas
                </Button>
              </div>
              
              <div className="space-y-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Painel direito com calendário */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMonthChange(addDays(currentMonth, 1))}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Calendar
                mode="range"
                selected={tempRange}
                onSelect={handleCalendarSelect}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                numberOfMonths={1}
                locale={ptBR}
                className="rounded-md border-0"
                classNames={{
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  day_selected: "bg-teal-500 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-500 focus:text-white",
                  day_range_middle: "aria-selected:bg-teal-100 aria-selected:text-teal-900",
                  day_range_end: "day-range-end",
                }}
              />
              
              {isSelectingRange && (
                <div className="mt-3 text-xs text-muted-foreground text-center">
                  Selecione a data final para completar o intervalo
                </div>
              )}
            </div>
          </div>

          {/* Botão de confirmação */}
          <div className="flex justify-end p-4 border-t">
            <Button
              onClick={handleConfirm}
              variant="outline"
              className="border-teal-500 text-teal-600 hover:bg-teal-50"
              disabled={!tempRange?.from || !tempRange?.to}
            >
              Confirmar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}