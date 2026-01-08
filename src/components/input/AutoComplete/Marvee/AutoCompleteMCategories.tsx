import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2, Tag, X } from 'lucide-react';
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
import { useCategories } from '@/pages/private/@marvee/category/hooks/useCategories';
import type { Category } from '@/pages/private/@marvee/category/services/categories.service';

interface AutoCompleteCategoriesProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

// Função para ordenar categorias por código (category)
const sortCategoriesByCode = (cats: Category[]): Category[] => {
  return [...cats].sort((a, b) => {
    const codeA = a.category || '';
    const codeB = b.category || '';
    
    // Compara código por partes (ex: "02.01.04" -> ["02", "01", "04"])
    const partsA = codeA.split('.').map(part => parseInt(part, 10) || 0);
    const partsB = codeB.split('.').map(part => parseInt(part, 10) || 0);
    
    // Compara parte por parte
    const maxLength = Math.max(partsA.length, partsB.length);
    for (let i = 0; i < maxLength; i++) {
      const partA = partsA[i] ?? 0;
      const partB = partsB[i] ?? 0;
      
      if (partA !== partB) {
        return partA - partB;
      }
    }
    
    // Se os códigos são iguais, ordena por descrição
    return (a.description || '').localeCompare(b.description || '');
  });
};

export const AutoCompleteMCategories = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Categoria Marvee',
  description,
  placeholder = 'Selecione uma categoria...',
  required = false,
}: AutoCompleteCategoriesProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedCategoryCache, setSelectedCategoryCache] = useState<Category | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Adiciona listener de wheel para capturar eventos em elementos filhos e fazer scroll no container
  useEffect(() => {
    if (listRef.current) {
      const container = listRef.current;
      
      // Adiciona listener de wheel para capturar eventos em elementos filhos
      const handleWheel = (e: WheelEvent) => {
        // Verifica se o evento está dentro do container
        if (container.contains(e.target as Node)) {
          // Se o target não é o container, faz scroll manual
          if (e.target !== container) {
            e.preventDefault();
            e.stopPropagation();
            container.scrollTop += e.deltaY;
          }
        }
      };
      
      // Usa capture phase para pegar o evento antes que chegue nos filhos
      container.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      
      return () => {
        container.removeEventListener('wheel', handleWheel, { capture: true });
      };
    }
  }, [open]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Observa o valor do campo
  const selectedCategoryId = useWatch({ control, name });
  
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
  
  // Prepara filtros para a busca - sempre carrega todas as categorias
  // e faz filtro local (a API não tem parâmetro de busca genérico)
  const filters = useMemo(() => {
    return {
      page: 1,
      pageSize: 100, // Carrega mais itens inicialmente
    };
  }, []);

  // Busca categorias
  const { data: categoriesResponse, isLoading } = useCategories(filters);
  const categories = useMemo(() => {
    if (!categoriesResponse) return [];
    
    // Se a resposta for um array direto (sem meta/data), retorna o array
    if (Array.isArray(categoriesResponse)) {
      return sortCategoriesByCode(categoriesResponse);
    }
    
    const categoriesList = categoriesResponse.data || [];
    
    // Mostra todas as categorias (não filtra por status)
    let allCategories = categoriesList;
    
    // Se há uma categoria selecionada que não está na lista, inclui o cache se existir
    if (selectedCategoryId && selectedCategoryCache && selectedCategoryCache.id === selectedCategoryId) {
      const isInList = allCategories.some(c => c.id === selectedCategoryId);
      if (!isInList) {
        // Adiciona a categoria do cache no início da lista
        allCategories = [selectedCategoryCache, ...allCategories];
      }
    }
    
    // Ordena por código
    return sortCategoriesByCode(allCategories);
  }, [categoriesResponse, selectedCategoryId, selectedCategoryCache]);
  
  // Atualiza o cache da categoria selecionada quando ela é encontrada na lista
  useEffect(() => {
    if (selectedCategoryId) {
      const found = categories.find(c => c.id === selectedCategoryId);
      if (found) {
        setSelectedCategoryCache(found);
      }
    } else {
      setSelectedCategoryCache(null);
    }
  }, [selectedCategoryId, categories]);
  
  // Organiza categorias em ordem hierárquica (level 1, depois seus filhos level 2, depois seus filhos level 3)
  const hierarchicalCategories = useMemo(() => {
    const level1 = sortCategoriesByCode(categories.filter(cat => cat.level === 1));
    const level2 = sortCategoriesByCode(categories.filter(cat => cat.level === 2));
    const level3 = sortCategoriesByCode(categories.filter(cat => cat.level === 3));
    
    const result: Category[] = [];
    
    // Para cada categoria de nível 1 (já ordenadas)
    level1.forEach(cat1 => {
      result.push(cat1);
      
      // Adiciona seus filhos de nível 2 (ordenados)
      const children2 = sortCategoriesByCode(level2.filter(cat2 => cat2.category_id === cat1.id));
      children2.forEach(cat2 => {
        result.push(cat2);
        
        // Adiciona seus filhos de nível 3 (ordenados)
        const children3 = sortCategoriesByCode(level3.filter(cat3 => cat3.category_id === cat2.id));
        children3.forEach(cat3 => {
          result.push(cat3);
        });
      });
    });
    
    return result;
  }, [categories]);
  
  // Filtra categorias mantendo a hierarquia (se um filho corresponde, inclui os pais)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return hierarchicalCategories;
    }
    
    const query = searchQuery.toLowerCase();
    const matchingIds = new Set<number>();
    
    // Primeiro, encontra todas as categorias que correspondem à busca
    hierarchicalCategories.forEach((category) => {
      const categoryMatch = category.category?.toLowerCase().includes(query);
      const descriptionMatch = category.description?.toLowerCase().includes(query);
      
      if (categoryMatch || descriptionMatch) {
        matchingIds.add(category.id);
        
        // Se é nível 3, adiciona seus pais (nível 2 e 1)
        if (category.level === 3 && category.category_id) {
          matchingIds.add(category.category_id);
          
          // Encontra o pai de nível 2 e depois o pai de nível 1
          const parent2 = hierarchicalCategories.find(c => c.id === category.category_id);
          if (parent2 && parent2.category_id) {
            matchingIds.add(parent2.category_id);
          }
        }
        
        // Se é nível 2, adiciona seu pai (nível 1)
        if (category.level === 2 && category.category_id) {
          matchingIds.add(category.category_id);
        }
      }
    });
    
    // Filtra mantendo apenas categorias que correspondem ou são pais de categorias que correspondem
    return hierarchicalCategories.filter((category) => matchingIds.has(category.id));
  }, [hierarchicalCategories, searchQuery]);
  
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

  // Categorias visíveis (lazy loading)
  const visibleCategories = useMemo(() => {
    return filteredCategories.slice(0, visibleCount);
  }, [filteredCategories, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < hierarchicalCategories.length) {
      // Carrega mais itens
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, hierarchicalCategories.length));
    }
  }, [visibleCount, hierarchicalCategories.length]);

  // Gera o label da categoria: category - description
  const getCategoryLabel = (category: Category) => {
    const categoryCode = category.category || '';
    const description = category.description || '';
    
    if (categoryCode && description) {
      return `${categoryCode} - ${description}`;
    }
    return categoryCode || description || 'Sem descrição';
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Busca a categoria selecionada na lista atual ou no cache
        const selectedCategory = 
          filteredCategories.find((category) => category.id === field.value) ||
          categories.find((category) => category.id === field.value) ||
          (field.value && selectedCategoryCache?.id === field.value ? selectedCategoryCache : null);

        const handleClear = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          field.onChange(undefined);
          setSearchQuery('');
          setSelectedCategoryCache(null);
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
              <Popover 
                open={open} 
                onOpenChange={setOpen} 
                modal={false}
              >
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
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                              <span className="truncate">Carregando categorias...</span>
                            </>
                          ) : selectedCategory ? (
                            <>
                              <Tag className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {getCategoryLabel(selectedCategory)}
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
                  className="p-0 z-[9999]" 
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => {
                    e.preventDefault();
                  }}
                  style={{
                    width: popoverWidth ? `${popoverWidth}px` : undefined,
                    minWidth: popoverWidth ? `${popoverWidth}px` : undefined,
                  }}
                >
                  <Command shouldFilter={false} className="max-h-none">
                    <CommandInput
                      placeholder="Buscar por categoria ou descrição..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredCategories.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery.trim() 
                          ? `Nenhuma categoria encontrada para "${searchQuery}"`
                          : 'Nenhuma categoria encontrada.'}
                      </CommandEmpty>
                    ) : (
                      <div
                        ref={listRef}
                        className="max-h-[300px] overflow-y-auto overflow-x-hidden"
                        onScroll={handleScroll}
                        style={{
                          pointerEvents: 'auto',
                          touchAction: 'pan-y',
                          overscrollBehavior: 'contain',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      >
                        <CommandGroup>
                            {visibleCategories.map((category) => {
                              const isLevel3 = category.level === 3;
                              const isSelected = category.id === field.value;
                              
                              // Calcula indentação baseada no nível
                              const indentClass = 
                                category.level === 1 ? 'pl-0' :
                                category.level === 2 ? 'pl-4' :
                                'pl-8';
                              
                              return (
                                <CommandItem
                                  key={category.id}
                                  value={`${category.category || ''} ${category.description || ''}`}
                                  onSelect={() => {
                                    if (!isLevel3) return;
                                    field.onChange(category.id);
                                    setSelectedCategoryCache(category);
                                    setOpen(false);
                                    setSearchQuery('');
                                    setVisibleCount(ITEMS_PER_PAGE);
                                  }}
                                  disabled={!isLevel3}
                                  className={cn(
                                    indentClass,
                                    !isLevel3 && 'opacity-60 cursor-not-allowed',
                                    !isLevel3 && 'hover:bg-transparent'
                                  )}
                                  onMouseDown={(e) => {
                                    if (isLevel3) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onClick={(e) => {
                                    if (isLevel3) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4 shrink-0',
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <Tag className="mr-2 h-4 w-4 shrink-0" />
                                  <span className={cn(
                                    'truncate',
                                    !isLevel3 && 'text-muted-foreground'
                                  )}>
                                    {getCategoryLabel(category)}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                          {visibleCount < hierarchicalCategories.length && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                              Mostrando {visibleCount} de {hierarchicalCategories.length} categorias
                            </div>
                          )}
                      </div>
                    )}
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

