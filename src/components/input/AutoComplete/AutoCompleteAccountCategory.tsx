import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, FolderTree } from 'lucide-react';
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
import { useAccountCategories } from '@/pages/private/account_category/hooks/useAccountCategory';
import { AccountCategoryLevel } from '@/pages/private/account_category/types';

interface AutoCompleteAccountCategoryProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  companyId?: string | number;
  excludeId?: string | null; // Exclude this category from the list (useful when editing)
  filterByLevel?: 'primary' | 'secondary' | 'tertiary' | null; // Filter categories by level
  filterByParentId?: string | null; // Filter categories by parent category ID (useful for filtering Secondary by Primary)
}

const ITEMS_PER_PAGE = 10;

export const AutoCompleteAccountCategory = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Selecione uma categoria...',
  required = false,
  companyId,
  excludeId,
  filterByLevel,
  filterByParentId,
}: AutoCompleteAccountCategoryProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);

  // Convert companyId to number if it's a string
  const companyIdNumber = companyId ? (typeof companyId === 'string' ? Number(companyId) : companyId) : undefined;

  // Busca categorias do backend
  const { data: categories = [], isLoading } = useAccountCategories(companyIdNumber);

  // Filtra apenas categorias ativas e exclui a categoria atual se estiver editando
  // Também filtra por nível e por categoria pai se especificado
  const availableCategories = useMemo(() => {
    let filtered = categories.filter((category) => category.status);
    
    // Filtra por nível se especificado
    if (filterByLevel) {
      const levelMap: Record<string, AccountCategoryLevel> = {
        primary: AccountCategoryLevel.PRIMARY,
        secondary: AccountCategoryLevel.SECONDARY,
        tertiary: AccountCategoryLevel.TERTIARY,
      };
      const targetLevel = levelMap[filterByLevel];
      if (targetLevel) {
        filtered = filtered.filter((category) => category.level === targetLevel);
      }
    }
    
    // Filtra por categoria pai se especificado (útil para filtrar Secondary por Primary pai)
    if (filterByParentId) {
      filtered = filtered.filter((category) => category.account_category_father_id === filterByParentId);
    }
    
    if (excludeId) {
      filtered = filtered.filter((category) => category.id !== excludeId);
    }
    return filtered;
  }, [categories, excludeId, filterByLevel, filterByParentId]);

  // Filtra categorias baseado na busca
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableCategories;
    }
    const query = searchQuery.toLowerCase();
    return availableCategories.filter(
      (category) =>
        category.description?.toLowerCase().includes(query) ||
        category.structure?.toLowerCase().includes(query)
    );
  }, [availableCategories, searchQuery]);

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

  // Categorias visíveis (lazy loading)
  const visibleCategories = useMemo(() => {
    return filteredCategories.slice(0, visibleCount);
  }, [filteredCategories, visibleCount]);

  // Handler para scroll infinito
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (isNearBottom && visibleCount < filteredCategories.length) {
        // Carrega mais 10 categorias
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCategories.length));
      }
    },
    [visibleCount, filteredCategories.length]
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedCategory = availableCategories.find(
          (category) => category.id === field.value
        );

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
                    disabled={isLoading || !companyId}
                  >
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Carregando categorias...</span>
                        </>
                      ) : !companyId ? (
                        <span>Selecione uma empresa primeiro</span>
                      ) : selectedCategory ? (
                        <>
                          <FolderTree className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {selectedCategory.structure || ''} {selectedCategory.description ? `- ${selectedCategory.description}` : ''}
                          </span>
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
                    placeholder="Buscar categoria..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList ref={listRef} onScroll={handleScroll} className="max-h-[300px]">
                    {isLoading ? (
                      <CommandEmpty>
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Carregando categorias...
                        </div>
                      </CommandEmpty>
                    ) : !companyId ? (
                      <CommandEmpty>Selecione uma empresa primeiro</CommandEmpty>
                    ) : visibleCategories.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim()
                          ? `Nenhuma categoria encontrada para "${searchQuery}"`
                          : availableCategories.length === 0
                          ? 'Nenhuma categoria ativa disponível.'
                          : 'Nenhuma categoria encontrada.'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {visibleCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.description || category.structure || category.id}
                            onSelect={() => {
                              field.onChange(category.id);
                              setOpen(false);
                              setSearchQuery('');
                              setVisibleCount(ITEMS_PER_PAGE);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                category.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <FolderTree className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">
                                {category.structure || ''} {category.description ? `- ${category.description}` : ''}
                              </span>
                              {category.level && (
                                <span className="text-xs text-muted-foreground truncate">
                                  Nível: {category.level}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                        {visibleCount < filteredCategories.length && (
                          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Carregando mais categorias... ({visibleCount} de {filteredCategories.length})
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

