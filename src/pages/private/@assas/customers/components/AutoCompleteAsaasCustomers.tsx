import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, User, X } from 'lucide-react';
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
import { useCustomers } from '../hooks/useCustomers';

interface AutoCompleteAsaasCustomersProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const AutoCompleteAsaasCustomers = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Cliente Asaas',
  description,
  placeholder = 'Selecione um cliente...',
  required = false,
}: AutoCompleteAsaasCustomersProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedCustomerCache, setSelectedCustomerCache] = useState<any>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Observa o valor do campo
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
  
  // Prepara filtros para a busca
  const filters = useMemo(() => {
    const query = debouncedSearchQuery.trim();
    if (!query) {
      return {
        offset: 0,
        limit: 100, // Carrega mais itens inicialmente
      };
    }
    
    // Tenta identificar se é CPF/CNPJ (apenas números, 11 ou mais dígitos)
    const numbersOnly = query.replace(/\D/g, '');
    if (numbersOnly.length >= 11) {
      return {
        cpfCnpj: numbersOnly,
        offset: 0,
        limit: 100,
      };
    }
    
    // Caso contrário, busca por nome
    return {
      name: query,
      offset: 0,
      limit: 100,
    };
  }, [debouncedSearchQuery]);
  
  // Busca customers
  const { data: customersResponse, isLoading } = useCustomers(filters);
  const customers = useMemo(() => {
    const customersList = customersResponse?.data || [];
    
    // Se há um cliente selecionado que não está na lista, inclui o cache se existir
    if (selectedCustomerId && selectedCustomerCache && selectedCustomerCache.id === selectedCustomerId) {
      const isInList = customersList.some(c => c.id === selectedCustomerId);
      if (!isInList) {
        // Adiciona o cliente do cache no início da lista
        return [selectedCustomerCache, ...customersList];
      }
    }
    
    return customersList;
  }, [customersResponse, selectedCustomerId, selectedCustomerCache]);
  
  // Atualiza o cache do cliente selecionado quando ele é encontrado na lista
  useEffect(() => {
    if (selectedCustomerId) {
      const found = customers.find(c => c.id === selectedCustomerId);
      if (found) {
        setSelectedCustomerCache(found);
      }
    } else {
      setSelectedCustomerCache(null);
    }
  }, [selectedCustomerId, customers]);
  
  // Filtra customers localmente também (para busca mais rápida)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const query = searchQuery.toLowerCase();
    const numbersOnly = query.replace(/\D/g, '');
    return customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(query);
      const cpfCnpjMatch = customer.cpfCnpj?.replace(/\D/g, '').includes(numbersOnly);
      return nameMatch || cpfCnpjMatch;
    });
  }, [customers, searchQuery]);
  
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
  
  // Customers visíveis (lazy loading)
  const visibleCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCount);
  }, [filteredCustomers, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredCustomers.length) {
      // Carrega mais itens
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCustomers.length));
    }
  }, [visibleCount, filteredCustomers.length]);

  // Formata CPF/CNPJ
  const formatCpfCnpj = (value: string | null | undefined) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return value;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Busca o cliente selecionado na lista atual ou no cache
        // Primeiro tenta na lista filtrada, depois na lista completa, depois no cache
        const selectedCustomer = 
          filteredCustomers.find((customer) => customer.id === field.value) ||
          customers.find((customer) => customer.id === field.value) ||
          (field.value && selectedCustomerCache?.id === field.value ? selectedCustomerCache : null);

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange(undefined);
          setSearchQuery('');
          setSelectedCustomerCache(null);
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
                              <span className="truncate">Carregando clientes...</span>
                            </>
                          ) : selectedCustomer ? (
                            <>
                              <User className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {selectedCustomer.cpfCnpj 
                                  ? `${formatCpfCnpj(selectedCustomer.cpfCnpj)} - ${selectedCustomer.name}`
                                  : selectedCustomer.name}
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
                className="p-0" 
                align="start"
                style={{
                  width: popoverWidth ? `${popoverWidth}px` : undefined,
                  minWidth: popoverWidth ? `${popoverWidth}px` : undefined,
                }}
              >
                <Command>
                  <CommandInput
                    placeholder="Buscar por nome ou CPF/CNPJ..."
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
                    ) : filteredCustomers.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim() 
                          ? `Nenhum cliente encontrado para "${searchQuery}"`
                          : 'Nenhum cliente encontrado.'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {visibleCustomers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={`${customer.cpfCnpj || ''} ${customer.name}`}
                            onSelect={() => {
                              // Substitui qualquer valor anterior por este único valor
                              field.onChange(customer.id);
                              setSelectedCustomerCache(customer);
                              setOpen(false);
                              setSearchQuery('');
                              setVisibleCount(ITEMS_PER_PAGE);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                customer.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <User className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">
                              {customer.cpfCnpj 
                                ? `${formatCpfCnpj(customer.cpfCnpj)} - ${customer.name}`
                                : customer.name}
                            </span>
                          </CommandItem>
                        ))}
                        {visibleCount < filteredCustomers.length && (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                            Mostrando {visibleCount} de {filteredCustomers.length} clientes
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

