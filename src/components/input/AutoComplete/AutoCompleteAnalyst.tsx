import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, UserCircle, X } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analystsService } from '@/pages/private/analyst/services/analysts.service';
import type { Analyst } from '@/pages/private/analyst/types';

interface AutoCompleteAnalystProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const AutoCompleteAnalyst = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Analista',
  description,
  placeholder = 'Selecione um analista...',
  required = false,
}: AutoCompleteAnalystProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedAnalystCache, setSelectedAnalystCache] = useState<Analyst | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Observa o valor do campo (pode ser number ou string, dependendo do schema)
  const selectedAnalystId = useWatch({ control, name });
  
  // Debounce da busca
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);
  
  // Busca analistas
  const { data: analysts = [], isLoading } = useQuery({
    queryKey: ['analysts-autocomplete'],
    queryFn: () => analystsService.listAnalysts(),
  });
  
  // Filtra apenas analistas ativos
  const activeAnalysts = useMemo(() => {
    return analysts.filter(analyst => analyst.status);
  }, [analysts]);
  
  // Filtra analistas localmente (para busca mais rápida)
  const filteredAnalysts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return activeAnalysts;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return activeAnalysts.filter((analyst) => {
      const userNameMatch = analyst.user?.name?.toLowerCase().includes(query);
      const userEmailMatch = analyst.user?.email?.toLowerCase().includes(query);
      const roleMatch = analyst.role?.toLowerCase().includes(query);
      const sectorMatch = analyst.sector?.toLowerCase().includes(query);
      return userNameMatch || userEmailMatch || roleMatch || sectorMatch;
    });
  }, [activeAnalysts, debouncedSearchQuery]);
  
  // Atualiza o cache do analista selecionado quando ele é encontrado na lista
  useEffect(() => {
    if (selectedAnalystId !== undefined && selectedAnalystId !== null && activeAnalysts.length > 0) {
      const analystIdStr = String(selectedAnalystId);
      const found = activeAnalysts.find(a => String(a.id) === analystIdStr);
      if (found) {
        setSelectedAnalystCache(found);
      } else {
        // Se não encontrou, limpa o cache para evitar mostrar valor incorreto
        setSelectedAnalystCache(null);
      }
    } else {
      setSelectedAnalystCache(null);
    }
  }, [selectedAnalystId, activeAnalysts]);
  
  // Reset visible count quando busca mudar ou quando abrir
  useEffect(() => {
    if (open) {
      setVisibleCount(ITEMS_PER_PAGE);
      // Sincroniza largura do popover com o trigger
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
      }
    }
  }, [open]);
  
  useEffect(() => {
    if (searchQuery) {
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [searchQuery]);
  
  // Analistas visíveis (lazy loading)
  const visibleAnalysts = useMemo(() => {
    return filteredAnalysts.slice(0, visibleCount);
  }, [filteredAnalysts, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredAnalysts.length) {
      // Carrega mais itens
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredAnalysts.length));
    }
  }, [visibleCount, filteredAnalysts.length]);

  // Gera o label do analista: Nome do Usuário (Cargo)
  const getAnalystLabel = (analyst: Analyst) => {
    const userName = analyst.user?.name || 'Analista sem usuário';
    return `${userName}${analyst.role ? ` (${analyst.role})` : ''}`;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Converte o valor para string para comparação (aceita number ou string)
        const fieldValueStr = field.value !== undefined && field.value !== null ? String(field.value) : null;
        
        // Busca o analista selecionado na lista atual ou no cache
        const selectedAnalyst = 
          filteredAnalysts.find((analyst) => String(analyst.id) === fieldValueStr) ||
          activeAnalysts.find((analyst) => String(analyst.id) === fieldValueStr) ||
          (fieldValueStr && selectedAnalystCache && String(selectedAnalystCache.id) === fieldValueStr ? selectedAnalystCache : null);

        const handleClear = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          field.onChange(null);
          setSearchQuery('');
          setSelectedAnalystCache(null);
        };

        const handleSelect = (analystId: string) => {
          // Converte para número, pois o schema pode esperar number
          const analystIdNum = Number(analystId);
          field.onChange(isNaN(analystIdNum) ? null : analystIdNum);
          const analyst = activeAnalysts.find(a => String(a.id) === analystId);
          if (analyst) {
            setSelectedAnalystCache(analyst);
          }
          setOpen(false);
          setSearchQuery('');
          setVisibleCount(ITEMS_PER_PAGE);
        };

        return (
          <FormItem className="flex flex-col">
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <div className="w-full">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="relative w-full">
                      <Button
                        ref={triggerRef}
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between min-w-0 pr-2',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                              <span className="truncate">Carregando analistas...</span>
                            </>
                          ) : selectedAnalyst ? (
                            <>
                              <UserCircle className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {getAnalystLabel(selectedAnalyst)}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground truncate">{placeholder}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {field.value !== undefined && field.value !== null && (
                            <div
                              onClick={handleClear}
                              className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground opacity-70 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                              title="Limpar seleção"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleClear(e as any);
                                }
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                        </div>
                      </Button>
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0" 
                  align="start"
                  style={{
                    width: popoverWidth ? `${popoverWidth}px` : undefined,
                    minWidth: popoverWidth ? `${popoverWidth}px` : undefined,
                  }}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar por nome, email, cargo ou setor..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList
                      ref={listRef}
                      onScroll={handleScroll}
                      className="max-h-[300px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredAnalysts.length === 0 ? (
                        <CommandEmpty>
                          {searchQuery.trim() 
                            ? `Nenhum analista encontrado para "${searchQuery}"`
                            : 'Nenhum analista encontrado.'}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {visibleAnalysts.map((analyst) => {
                            const analystIdStr = String(analyst.id);
                            const searchValue = `${analyst.user?.name || ''} ${analyst.user?.email || ''} ${analyst.role || ''} ${analyst.sector || ''}`;
                            return (
                              <CommandItem
                                key={analyst.id}
                                value={searchValue}
                                onSelect={() => {
                                  handleSelect(analystIdStr);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4 shrink-0',
                                    fieldValueStr === analystIdStr ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <UserCircle className="mr-2 h-4 w-4 shrink-0" />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="truncate font-medium">
                                    {analyst.user?.name || 'Analista sem usuário'}
                                  </span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {analyst.role && (
                                      <span className="truncate">{analyst.role}</span>
                                    )}
                                    {analyst.sector && (
                                      <>
                                        {analyst.role && <span>•</span>}
                                        <span className="truncate">{analyst.sector}</span>
                                      </>
                                    )}
                                  </div>
                                  {analyst.user?.email && (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {analyst.user.email}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                          {visibleCount < filteredAnalysts.length && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                              Mostrando {visibleCount} de {filteredAnalysts.length} analistas
                            </div>
                          )}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

