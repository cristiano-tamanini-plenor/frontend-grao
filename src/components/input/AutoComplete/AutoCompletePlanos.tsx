import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, Package } from 'lucide-react';
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
import { usePlanos } from '@/pages/private/plan/hooks/usePlans';

interface AutoCompletePlanosProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 10;

export const AutoCompletePlanos = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Selecione um plano...',
  required = false,
}: AutoCompletePlanosProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Busca planos do backend NestJS
  const { data: planos = [], isLoading } = usePlanos();
  
  // Filtra apenas planos ativos
  const activePlanos = useMemo(() => {
    return planos.filter(plano => plano.active);
  }, [planos]);
  
  // Filtra planos baseado na busca
  const filteredPlanos = useMemo(() => {
    if (!searchQuery.trim()) {
      return activePlanos;
    }
    const query = searchQuery.toLowerCase();
    return activePlanos.filter((plano) =>
      plano.name.toLowerCase().includes(query) ||
      (plano.description?.toLowerCase().includes(query) ?? false)
    );
  }, [activePlanos, searchQuery]);
  
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
  
  // Planos visíveis (lazy loading)
  const visiblePlanos = useMemo(() => {
    return filteredPlanos.slice(0, visibleCount);
  }, [filteredPlanos, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredPlanos.length) {
      // Carrega mais 10 planos
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredPlanos.length));
    }
  }, [visibleCount, filteredPlanos.length]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedPlano = activePlanos.find((plano) => plano.id === field.value);

        return (
          <FormItem>
            {label && <FormLabel>{label}{required && ' *'}</FormLabel>}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full justify-between',
                      !field.value && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Carregando planos...</span>
                        </>
                      ) : selectedPlano ? (
                        <>
                          <Package className="h-4 w-4 shrink-0" />
                          <span>{selectedPlano.name}</span>
                        </>
                      ) : (
                        <span>{placeholder}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Buscar plano..." 
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
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Carregando planos...
                        </div>
                      </CommandEmpty>
                    ) : visiblePlanos.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim() 
                          ? `Nenhum plano encontrado para "${searchQuery}"`
                          : activePlanos.length === 0
                          ? 'Nenhum plano ativo disponível.'
                          : 'Nenhum plano encontrado.'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {visiblePlanos.map((plano) => (
                          <CommandItem
                            key={plano.id}
                            value={plano.name}
                            onSelect={() => {
                              field.onChange(plano.id);
                              setOpen(false);
                              setSearchQuery('');
                              setVisibleCount(ITEMS_PER_PAGE);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                plano.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <Package className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">{plano.name}</span>
                              {plano.description && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {plano.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                        {visibleCount < filteredPlanos.length && (
                          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Carregando mais planos... ({visibleCount} de {filteredPlanos.length})
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
