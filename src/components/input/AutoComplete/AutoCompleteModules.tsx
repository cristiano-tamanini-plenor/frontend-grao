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
import { useModules } from '@/pages/private/module/hooks/useModule';

interface AutoCompleteModulesProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  excludeIds?: string[]; // IDs de módulos para excluir da lista
}

const ITEMS_PER_PAGE = 10;

export const AutoCompleteModules = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Módulo',
  description,
  placeholder = 'Selecione um módulo...',
  required = false,
  excludeIds = [],
}: AutoCompleteModulesProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Busca módulos
  const { data: modules = [], isLoading } = useModules();
  
  // Filtra módulos excluídos e apenas ativos
  const availableModules = useMemo(() => {
    // Normaliza excludeIds para strings para comparação
    const excludeIdsNormalized = excludeIds.map(id => String(id));
    
    return modules.filter(
      (module) => {
        // Verifica se o módulo está ativo (default true se não especificado)
        const isActive = module.active !== false;
        // Verifica se não está na lista de exclusão (comparação normalizada)
        const moduleIdStr = String(module.id);
        const isNotExcluded = !excludeIdsNormalized.includes(moduleIdStr);
        return isActive && isNotExcluded;
      }
    );
  }, [modules, excludeIds]);
  
  // Filtra módulos baseado na busca
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableModules;
    }
    const query = searchQuery.toLowerCase();
    return availableModules.filter((module) =>
      module.name.toLowerCase().includes(query) ||
      module.code.toLowerCase().includes(query) ||
      (module.description?.toLowerCase().includes(query) ?? false)
    );
  }, [availableModules, searchQuery]);
  
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
  
  // Módulos visíveis (lazy loading)
  const visibleModules = useMemo(() => {
    return filteredModules.slice(0, visibleCount);
  }, [filteredModules, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredModules.length) {
      // Carrega mais 10 módulos
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredModules.length));
    }
  }, [visibleCount, filteredModules.length]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedModule = availableModules.find(
          (module) => module.id === field.value
        );

        return (
          <FormItem className="flex flex-col">
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    ref={triggerRef}
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full justify-between',
                      !field.value && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando módulos...
                      </>
                    ) : selectedModule ? (
                      <div className="flex items-center flex-1 min-w-0">
                        <Package className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{selectedModule.name}</span>
                        {selectedModule.code && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({selectedModule.code})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
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
                    placeholder="Buscar módulo..."
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
                    ) : filteredModules.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim() 
                          ? `Nenhum módulo encontrado para "${searchQuery}"`
                          : availableModules.length === 0
                          ? excludeIds.length > 0
                            ? 'Todos os módulos disponíveis já foram adicionados.'
                            : 'Nenhum módulo ativo disponível.'
                          : 'Nenhum módulo encontrado.'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {visibleModules.map((module) => (
                          <CommandItem
                            key={module.id}
                            value={`${module.name} ${module.code}`}
                            onSelect={() => {
                              field.onChange(module.id);
                              setOpen(false);
                              setSearchQuery('');
                              setVisibleCount(ITEMS_PER_PAGE);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                module.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <Package className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">{module.name}</span>
                              {module.code && (
                                <span className="text-xs text-muted-foreground truncate">
                                  Código: {module.code}
                                </span>
                              )}
                              {module.description && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {module.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                        {visibleCount < filteredModules.length && (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                            Mostrando {visibleCount} de {filteredModules.length} módulos
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

