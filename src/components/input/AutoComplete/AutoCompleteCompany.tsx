import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, Building2 } from 'lucide-react';
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
import { companiesService } from '@/pages/private/company/services/companies.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AutoCompleteCompanyProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 10;

export const AutoCompleteCompany = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Selecione uma empresa...',
  required = false,
}: AutoCompleteCompanyProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);

  // Busca empresas do backend
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['all-companies'],
    queryFn: () => companiesService.listAllCompanies(),
  });

  // Filtra apenas empresas ativas
  const activeCompanies = useMemo(() => {
    return companies.filter((company) => company.is_active);
  }, [companies]);

  // Filtra empresas baseado na busca
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCompanies;
    }
    const query = searchQuery.toLowerCase();
    return activeCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        (company.system_nickname?.toLowerCase().includes(query) ?? false) ||
        (company.cnpj?.toLowerCase().includes(query) ?? false)
    );
  }, [activeCompanies, searchQuery]);

  // Reset visible count quando busca mudar ou quando abrir
  useEffect(() => {
    if (open) {
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery) {
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [searchQuery]);

  // Empresas visíveis (lazy loading)
  const visibleCompanies = useMemo(() => {
    return filteredCompanies.slice(0, visibleCount);
  }, [filteredCompanies, visibleCount]);

  // Handler para scroll infinito
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (isNearBottom && visibleCount < filteredCompanies.length) {
        // Carrega mais 10 empresas
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCompanies.length));
      }
    },
    [visibleCount, filteredCompanies.length]
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedCompany = activeCompanies.find((company) => company.id === field.value);

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && ' *'}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          <span className="truncate">Carregando empresas...</span>
                        </>
                      ) : selectedCompany ? (
                        <>
                          <Avatar className="h-5 w-5 shrink-0">
                            <AvatarImage src={selectedCompany.avatar_url || undefined} />
                            <AvatarFallback>
                              <Building2 className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {selectedCompany.system_nickname || selectedCompany.name}
                          </span>
                        </>
                      ) : (
                        <span className="truncate">{placeholder}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar empresa..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList ref={listRef} onScroll={handleScroll} className="max-h-[300px]">
                    {isLoading ? (
                      <CommandEmpty>
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Carregando empresas...
                        </div>
                      </CommandEmpty>
                    ) : visibleCompanies.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim()
                          ? `Nenhuma empresa encontrada para "${searchQuery}"`
                          : activeCompanies.length === 0
                          ? 'Nenhuma empresa ativa disponível.'
                          : 'Nenhuma empresa encontrada.'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {visibleCompanies.map((company) => (
                          <CommandItem
                            key={company.id}
                            value={company.name}
                            onSelect={() => {
                              field.onChange(company.id);
                              setOpen(false);
                              setSearchQuery('');
                              setVisibleCount(ITEMS_PER_PAGE);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                company.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <Avatar className="mr-2 h-6 w-6 shrink-0">
                              <AvatarImage src={company.avatar_url || undefined} />
                              <AvatarFallback>
                                <Building2 className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">
                                {company.system_nickname || company.name}
                              </span>
                              {company.system_nickname && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {company.name}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                        {visibleCount < filteredCompanies.length && (
                          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Carregando mais empresas... ({visibleCount} de {filteredCompanies.length})
                          </div>
                        )}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
