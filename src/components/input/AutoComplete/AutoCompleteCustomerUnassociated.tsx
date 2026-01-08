import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, Building2, X } from 'lucide-react';
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
import { customersService } from '@/pages/private/customer/services/customers.service';
import type { Customer } from '@/pages/private/customer/types';

interface AutoCompleteCustomerUnassociatedProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const AutoCompleteCustomerUnassociated = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Cliente',
  description,
  placeholder = 'Selecione um cliente não associado...',
  required = false,
  disabled = false,
}: AutoCompleteCustomerUnassociatedProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedCustomerCache, setSelectedCustomerCache] = useState<Customer | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Observa o valor do campo (pode ser number ou string, dependendo do schema)
  const selectedCustomerId = useWatch({ control, name });
  
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
  
  // Busca clientes não associados
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers-unassociated'],
    queryFn: () => customersService.listUnassociatedCustomers(),
  });
  
  // Filtra clientes localmente (para busca mais rápida)
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return customers;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    return customers.filter(customer => {
      const name = (customer.name || '').toLowerCase();
      const fantasyName = (customer.fantasy_name || '').toLowerCase();
      return name.includes(query) || fantasyName.includes(query);
    });
  }, [customers, debouncedSearchQuery]);
  
  // Atualiza o cache do cliente selecionado quando ele é encontrado na lista
  useEffect(() => {
    if (selectedCustomerId !== undefined && selectedCustomerId !== null && customers.length > 0) {
      const customerIdStr = String(selectedCustomerId);
      const found = customers.find(c => String(c.id) === customerIdStr);
      if (found) {
        setSelectedCustomerCache(found);
      } else {
        // Se não encontrou, limpa o cache para evitar mostrar valor incorreto
        setSelectedCustomerCache(null);
      }
    } else {
      setSelectedCustomerCache(null);
    }
  }, [selectedCustomerId, customers]);
  
  // Ajusta a largura do popover baseado no trigger
  useEffect(() => {
    if (triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);
  
  // Reset do contador quando a busca muda
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [debouncedSearchQuery]);
  
  // Gera o label do cliente
  const getCustomerLabel = useCallback((customer: Customer): string => {
    return customer.fantasy_name || customer.name || 'Cliente sem nome';
  }, []);
  
  // Scroll infinito
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && visibleCount < filteredCustomers.length) {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCustomers.length));
    }
  }, [visibleCount, filteredCustomers.length]);
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldValueStr = field.value !== undefined && field.value !== null ? String(field.value) : null;
        const selectedCustomer = filteredCustomers.find((c) => String(c.id) === fieldValueStr) || selectedCustomerCache;

        const handleClear = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          field.onChange(null);
          setSearchQuery('');
          setSelectedCustomerCache(null);
        };

        const handleSelect = (customerId: string) => {
          // Mantém como string para consistência com Customer.id
          field.onChange(customerId);
          const customer = customers.find(c => String(c.id) === customerId);
          if (customer) {
            setSelectedCustomerCache(customer);
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
                        disabled={isLoading || disabled}
                      >
                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                              <span className="truncate">Carregando clientes...</span>
                            </>
                          ) : selectedCustomer ? (
                            <>
                              <Building2 className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {getCustomerLabel(selectedCustomer)}
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
                              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              role="button" tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClear(e as any); } }}
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
                  className="w-full p-0 z-[9999]"
                  align="start"
                  style={{ width: popoverWidth ? `${popoverWidth}px` : 'auto' }}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar cliente..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList
                      ref={listRef}
                      onScroll={handleScroll}
                      className="max-h-[300px]"
                    >
                      {isLoading ? (
                        <CommandEmpty>
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        </CommandEmpty>
                      ) : filteredCustomers.length === 0 ? (
                        <CommandEmpty>Nenhum cliente não associado encontrado.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredCustomers.slice(0, visibleCount).map((customer) => {
                            const isSelected = String(customer.id) === fieldValueStr;
                            return (
                              <CommandItem
                                key={customer.id}
                                value={getCustomerLabel(customer)}
                                onSelect={() => handleSelect(String(customer.id))}
                                className={cn('cursor-pointer', isSelected && 'bg-accent')}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{getCustomerLabel(customer)}</span>
                                  {customer.name && customer.fantasy_name && customer.name !== customer.fantasy_name && (
                                    <span className="text-xs text-muted-foreground">
                                      {customer.name}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
};

