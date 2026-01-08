import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import * as IconsaxIcons from 'iconsax-reactjs';
import { PIcon } from '@/components/ui/p-icon';
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

interface AutoCompleteIconsaxIconProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  variant?: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
}

// Gera lista de todos os ícones disponíveis do iconsax-reactjs
const getAllIconsaxIcons = (): Array<{ name: string; value: string }> => {
  const icons: Array<{ name: string; value: string }> = [];
  
  // Itera sobre todos os exports do módulo iconsax-reactjs
  Object.keys(IconsaxIcons).forEach((iconName) => {
    // Filtra apenas componentes de ícone válidos
    // Componentes de ícone começam com letra maiúscula
    if (
      iconName && 
      typeof iconName === 'string' &&
      iconName.length > 0 &&
      /^[A-Z]/.test(iconName) && // Começa com letra maiúscula
      !iconName.startsWith('__') && // Ignora exports internos
      iconName !== 'default' // Ignora export default se existir
    ) {
      icons.push({
        name: iconName,
        value: iconName,
      });
    }
  });

  return icons.sort((a, b) => a.name.localeCompare(b.name));
};

const ITEMS_PER_PAGE = 20;

export const AutoCompleteIconsaxIcon = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Selecione um ícone...',
  required = false,
  variant = 'Linear',
}: AutoCompleteIconsaxIconProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Carrega todos os ícones uma vez (mas só renderiza os primeiros)
  const allIcons = useMemo(() => {
    const icons = getAllIconsaxIcons();
    // Debug: verifica se os ícones foram carregados
    if (process.env.NODE_ENV === 'development' && icons.length === 0) {
      console.warn('[AutoCompleteIconsaxIcon] Nenhum ícone encontrado. Total de exports:', Object.keys(IconsaxIcons).length);
    }
    return icons;
  }, []);
  
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
        const selectedIcon = allIcons.find((icon) => icon.value === field.value);

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
                  >
                    <div className="flex items-center gap-2">
                      {selectedIcon ? (
                        <>
                          <PIcon name={selectedIcon.value} variant={variant} size={16} />
                          <span>{selectedIcon.name}</span>
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
                    placeholder="Buscar ícone..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList 
                    ref={listRef}
                    onScroll={handleScroll}
                    className="max-h-[300px]"
                  >
                    {allIcons.length === 0 ? (
                      <CommandEmpty>Carregando ícones...</CommandEmpty>
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
                            key={icon.value}
                            value={icon.name}
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
                                icon.value === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <PIcon name={icon.value} variant={variant} size={16} className="mr-2" />
                            <span className="flex-1">{icon.name}</span>
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

