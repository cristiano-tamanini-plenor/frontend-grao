import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, FolderKanban, X } from 'lucide-react';
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
import { useCostCenters } from '@/pages/private/@marvee/cost_center/hooks/useCostCenters';
import type { CostCenter } from '@/pages/private/@marvee/cost_center/services/cost-centers.service';

interface AutoCompleteCostCenterProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const AutoCompleteCostCenter = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Centro de Custo Marvee',
  description,
  placeholder = 'Selecione um centro de custo...',
  required = false,
}: AutoCompleteCostCenterProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedCostCenterCache, setSelectedCostCenterCache] = useState<CostCenter | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Observa o valor do campo
  const selectedCostCenterId = useWatch({ control, name });
  
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
  
  // Prepara filtros para a busca
  const filters = useMemo(() => {
    const query = debouncedSearchQuery.trim();
    if (!query) {
      return {
        page: 1,
        pageSize: 100, // Carrega mais itens inicialmente
      };
    }
    
    // Busca por nome
    return {
      name: query,
      page: 1,
      pageSize: 100,
    };
  }, [debouncedSearchQuery]);
  
  // Busca cost centers
  const { data: costCentersResponse, isLoading } = useCostCenters(filters);
  const costCenters = useMemo(() => {
    if (!costCentersResponse) return [];
    
    // Se a resposta for um array direto (sem meta/data), retorna o array
    if (Array.isArray(costCentersResponse)) {
      return costCentersResponse;
    }
    
    return costCentersResponse.data || [];
  }, [costCentersResponse]);
  
  // Atualiza o cache do centro de custo selecionado quando ele é encontrado na lista
  useEffect(() => {
    if (selectedCostCenterId) {
      const found = costCenters.find(c => c.id === selectedCostCenterId);
      if (found) {
        setSelectedCostCenterCache(found);
      }
    } else {
      setSelectedCostCenterCache(null);
    }
  }, [selectedCostCenterId, costCenters]);
  
  // Filtra cost centers localmente também (para busca mais rápida)
  const filteredCostCenters = useMemo(() => {
    if (!searchQuery.trim()) {
      return costCenters;
    }
    const query = searchQuery.toLowerCase();
    return costCenters.filter((costCenter) => {
      const nameMatch = costCenter.name?.toLowerCase().includes(query);
      const codeMatch = costCenter.code?.toString().toLowerCase().includes(query);
      const descriptionMatch = costCenter.description?.toLowerCase().includes(query);
      return nameMatch || codeMatch || descriptionMatch;
    });
  }, [costCenters, searchQuery]);
  
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
  
  // Cost centers visíveis (lazy loading)
  const visibleCostCenters = useMemo(() => {
    return filteredCostCenters.slice(0, visibleCount);
  }, [filteredCostCenters, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredCostCenters.length) {
      // Carrega mais itens
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCostCenters.length));
    }
  }, [visibleCount, filteredCostCenters.length]);

  // Gera o label do centro de custo: Código - Nome
  const getCostCenterLabel = (costCenter: CostCenter) => {
    if (costCenter.code) {
      return `${costCenter.code} - ${costCenter.name}`;
    }
    return costCenter.name || '';
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Busca o centro de custo selecionado na lista atual ou no cache
        const selectedCostCenter = 
          filteredCostCenters.find((costCenter) => costCenter.id === field.value) ||
          costCenters.find((costCenter) => costCenter.id === field.value) ||
          (field.value && selectedCostCenterCache?.id === field.value ? selectedCostCenterCache : null);

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange(undefined);
          setSearchQuery('');
          setSelectedCostCenterCache(null);
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
                              <span className="truncate">Carregando centros de custo...</span>
                            </>
                          ) : selectedCostCenter ? (
                            <>
                              <FolderKanban className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {getCostCenterLabel(selectedCostCenter)}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground truncate">{placeholder}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {field.value && (
                            <button
                              type="button"
                              onClick={handleClear}
                              className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground opacity-70 hover:opacity-100 transition-opacity shrink-0"
                              title="Limpar filtro"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                        </div>
                      </Button>
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0 z-[100]" 
                  align="start"
                  style={{
                    width: popoverWidth ? `${popoverWidth}px` : undefined,
                    minWidth: popoverWidth ? `${popoverWidth}px` : undefined,
                  }}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar por nome, código ou descrição..."
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
                      ) : filteredCostCenters.length === 0 ? (
                        <CommandEmpty>
                          {searchQuery.trim() 
                            ? `Nenhum centro de custo encontrado para "${searchQuery}"`
                            : 'Nenhum centro de custo encontrado.'}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {visibleCostCenters.map((costCenter) => (
                            <CommandItem
                              key={costCenter.id}
                              value={`${costCenter.code || ''} ${costCenter.name} ${costCenter.description || ''}`}
                              onSelect={() => {
                                field.onChange(costCenter.id);
                                setSelectedCostCenterCache(costCenter);
                                setOpen(false);
                                setSearchQuery('');
                                setVisibleCount(ITEMS_PER_PAGE);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 shrink-0',
                                  costCenter.id === field.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <FolderKanban className="mr-2 h-4 w-4 shrink-0" />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate font-medium">
                                  {getCostCenterLabel(costCenter)}
                                </span>
                                {costCenter.description && (
                                  <span className="truncate text-xs text-muted-foreground">
                                    {costCenter.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                          {visibleCount < filteredCostCenters.length && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                              Mostrando {visibleCount} de {filteredCostCenters.length} centros de custo
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

