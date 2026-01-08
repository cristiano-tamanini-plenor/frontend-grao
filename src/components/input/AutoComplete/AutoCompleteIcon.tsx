import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { PIcon } from '@/components/ui/p-icon';
import { useIcons } from '@/pages/private/icons/hooks/useIcon';
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

interface AutoCompleteIconProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 20;

export const AutoCompleteIcon = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Selecione um ícone...',
  required = false,
}: AutoCompleteIconProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Busca apenas ícones ativos do backend
  const { data: icons = [], isLoading } = useIcons({ status: 'true' });
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

  // Constrói a URL completa da imagem a partir de uma URL relativa
  const buildImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  // Detecta se o tema atual é dark
  const isDarkTheme = (): boolean => {
    if (typeof window === 'undefined') return false;
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
      return true;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  };

  // Obtém a URL do ícone baseada no tema atual
  const getIconUrl = (icon: { url?: string | null; url_dark?: string | null }): string | null => {
    const isDark = isDarkTheme();
    const url = isDark && icon.url_dark ? icon.url_dark : icon.url;
    return buildImageUrl(url);
  };

  // Transforma os ícones do backend em formato compatível
  const allIcons = useMemo(() => {
    return icons.map((icon) => ({
      name: icon.name,
      value: Number(icon.id), // Usa o ID do ícone como valor (número)
      variant: icon.variant,
      id: icon.id,
      type: icon.type || 'lib',
      url: icon.url || null,
      url_dark: icon.url_dark || null,
      // Valor único para o CommandItem (combinação de ID e nome para busca)
      searchValue: `${icon.id}-${icon.name}-${icon.variant}`,
    }));
  }, [icons]);
  
  // Filtra ícones baseado na busca
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIcons;
    }
    const query = searchQuery.toLowerCase();
    return allIcons.filter((icon) =>
      icon.name.toLowerCase().includes(query)
    );
  }, [allIcons, searchQuery]);
  
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
  
  // Ícones visíveis (lazy loading)
  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredIcons.length) {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredIcons.length));
    }
  }, [visibleCount, filteredIcons.length]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Converte o valor do campo para número para comparação
        const fieldValue = typeof field.value === 'string' ? Number(field.value) : field.value;
        const selectedIcon = allIcons.find((icon) => icon.value === fieldValue);

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
                      {selectedIcon ? (
                        <>
                          {selectedIcon.type === 'png' && selectedIcon.url ? (
                            <img
                              src={getIconUrl(selectedIcon) || ''}
                              alt={selectedIcon.name}
                              className="w-4 h-4 object-contain"
                            />
                          ) : (
                            <PIcon 
                              name={selectedIcon.name} 
                              variant={selectedIcon.variant} 
                              size={16} 
                            />
                          )}
                          <span>{selectedIcon.name}</span>
                        </>
                      ) : (
                        <span>{isLoading ? 'Carregando ícones...' : placeholder}</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[400px] p-0 z-[100]" 
                align="start"
                style={{ pointerEvents: 'auto' }}
              >
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Buscar ícone..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList 
                    ref={listRef}
                    onScroll={handleScroll}
                    className="max-h-[300px]"
                    style={{ 
                      pointerEvents: 'auto',
                      touchAction: 'pan-y',
                      overscrollBehavior: 'contain'
                    }}
                  >
                    {isLoading ? (
                      <CommandEmpty>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Carregando ícones...
                      </CommandEmpty>
                    ) : allIcons.length === 0 ? (
                      <CommandEmpty>Nenhum ícone cadastrado no sistema.</CommandEmpty>
                    ) : visibleIcons.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim() 
                          ? `Nenhum ícone encontrado para "${searchQuery}"`
                          : 'Nenhum ícone disponível.'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {visibleIcons.map((icon) => (
                          <CommandItem
                            key={`${icon.id}-${icon.variant}`}
                            value={icon.searchValue}
                            onSelect={() => {
                              field.onChange(icon.value);
                              setOpen(false);
                              setSearchQuery('');
                              setVisibleCount(ITEMS_PER_PAGE);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                icon.value === fieldValue ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {icon.type === 'png' && icon.url ? (
                              <img
                                src={getIconUrl(icon) || ''}
                                alt={icon.name}
                                className="w-4 h-4 object-contain mr-2"
                              />
                            ) : (
                              <PIcon 
                                name={icon.name} 
                                variant={icon.variant} 
                                size={16} 
                                className="mr-2" 
                              />
                            )}
                            <span className="flex-1">{icon.name}</span>
                            {icon.type === 'lib' && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {icon.variant}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                        {visibleCount < filteredIcons.length && (
                          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Carregando mais ícones... ({visibleCount} de {filteredIcons.length})
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
