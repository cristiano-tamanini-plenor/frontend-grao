import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, User, X } from 'lucide-react';
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
import { useAvailableCustomers } from '@/pages/private/@marvee/customer/hooks/useCustomers';
import type { Customer } from '@/pages/private/@marvee/customer/services/customers.service';
import { Label } from '@/components/ui/label';

interface CustomerSelectProps {
  value?: number | string;
  onChange?: (value: number | string | undefined) => void;
  label?: string;
  placeholder?: string;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function CustomerSelect({
  value,
  onChange,
  label = 'Cliente',
  placeholder = 'Selecione um cliente...',
}: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedCustomerCache, setSelectedCustomerCache] = useState<Customer | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        pageSize: 100,
      };
    }

    return {
      search: query,
      page: 1,
      pageSize: 100,
    };
  }, [debouncedSearchQuery]);

  // Busca customers disponíveis
  const { data: customersResponse, isLoading } = useAvailableCustomers(filters);
  const customers = useMemo(() => {
    if (!customersResponse) return [];

    if (Array.isArray(customersResponse)) {
      return customersResponse;
    }

    const customersList = customersResponse.data || [];
    const availableCustomers = customersList;

    if (value && selectedCustomerCache && selectedCustomerCache.id === value) {
      const isInList = availableCustomers.some(c => c.id === value);
      if (!isInList) {
        return [selectedCustomerCache, ...availableCustomers];
      }
    }

    return availableCustomers;
  }, [customersResponse, value, selectedCustomerCache]);

  // Atualiza o cache do cliente selecionado
  useEffect(() => {
    if (value) {
      const found = customers.find(c => c.id === value);
      if (found) {
        setSelectedCustomerCache(found);
      }
    } else {
      setSelectedCustomerCache(null);
    }
  }, [value, customers]);

  // Filtra customers localmente
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const query = searchQuery.toLowerCase();
    const numbersOnly = query.replace(/\D/g, '');
    return customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(query);
      const fantasyNameMatch = customer.fantasy_name?.toLowerCase().includes(query);
      const cnpjcpfMatch = customer.cnpjcpf?.replace(/\D/g, '').includes(numbersOnly);
      return nameMatch || fantasyNameMatch || cnpjcpfMatch;
    });
  }, [customers, searchQuery]);

  // Reset visible count quando busca mudar ou quando abrir
  useEffect(() => {
    if (open) {
      setVisibleCount(ITEMS_PER_PAGE);
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

  // Gera o label do cliente
  const getCustomerLabel = (customer: Customer) => {
    const cnpjcpf = customer.cnpjcpf ? formatCpfCnpj(customer.cnpjcpf) : null;
    const fantasyName = customer.fantasy_name || customer.name || '';

    if (cnpjcpf) {
      return `${cnpjcpf} - ${fantasyName}`;
    }
    return fantasyName;
  };

  const selectedCustomer =
    filteredCustomers.find((customer) => customer.id === value) ||
    customers.find((customer) => customer.id === value) ||
    (value && selectedCustomerCache?.id === value ? selectedCustomerCache : null);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
    setSearchQuery('');
    setSelectedCustomerCache(null);
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="customer-select">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Button
              ref={triggerRef}
              variant="outline"
              role="combobox"
              className={cn(
                'w-full justify-between min-w-0 pr-2',
                !value && 'text-muted-foreground'
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
                      {getCustomerLabel(selectedCustomer)}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground truncate">{placeholder}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {value && (
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
                      value={`${customer.cnpjcpf || ''} ${customer.name} ${customer.fantasy_name || ''}`}
                      onSelect={() => {
                        onChange?.(customer.id);
                        setSelectedCustomerCache(customer);
                        setOpen(false);
                        setSearchQuery('');
                        setVisibleCount(ITEMS_PER_PAGE);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          customer.id === value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <User className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {getCustomerLabel(customer)}
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
  );
}

