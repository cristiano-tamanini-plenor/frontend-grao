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
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/pages/private/user/services/users.service';
import type { UserWithRole } from '@/pages/private/user/types';

interface AutoCompleteUserProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const AutoCompleteUser = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Usuário',
  description,
  placeholder = 'Selecione um usuário...',
  required = false,
}: AutoCompleteUserProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [selectedUserCache, setSelectedUserCache] = useState<UserWithRole | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Observa o valor do campo
  const selectedUserId = useWatch({ control, name });
  
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
  
  // Busca usuários
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-autocomplete'],
    queryFn: () => usersService.listUsers(),
  });
  
  // Filtra apenas usuários ativos
  const activeUsers = useMemo(() => {
    return users.filter(user => user.is_active);
  }, [users]);
  
  // Filtra usuários localmente (para busca mais rápida)
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return activeUsers;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return activeUsers.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      return nameMatch || emailMatch;
    });
  }, [activeUsers, debouncedSearchQuery]);
  
  // Atualiza o cache do usuário selecionado quando ele é encontrado na lista
  useEffect(() => {
    if (selectedUserId) {
      const found = activeUsers.find(u => u.id === selectedUserId);
      if (found) {
        setSelectedUserCache(found);
      }
    } else {
      setSelectedUserCache(null);
    }
  }, [selectedUserId, activeUsers]);
  
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
  
  // Usuários visíveis (lazy loading)
  const visibleUsers = useMemo(() => {
    return filteredUsers.slice(0, visibleCount);
  }, [filteredUsers, visibleCount]);
  
  // Handler para scroll infinito
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isNearBottom && visibleCount < filteredUsers.length) {
      // Carrega mais itens
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredUsers.length));
    }
  }, [visibleCount, filteredUsers.length]);

  // Gera o label do usuário: Name (Email)
  const getUserLabel = (user: UserWithRole) => {
    return `${user.name} (${user.email})`;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Busca o usuário selecionado na lista atual ou no cache
        const selectedUser = 
          filteredUsers.find((user) => user.id === field.value) ||
          activeUsers.find((user) => user.id === field.value) ||
          (field.value && selectedUserCache?.id === field.value ? selectedUserCache : null);

        const handleClear = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          field.onChange(null);
          setSearchQuery('');
          setSelectedUserCache(null);
        };

        const handleSelect = (userId: string) => {
          field.onChange(userId);
          const user = activeUsers.find(u => u.id === userId);
          if (user) {
            setSelectedUserCache(user);
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
                        disabled={isLoading}
                      >
                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                              <span className="truncate">Carregando usuários...</span>
                            </>
                          ) : selectedUser ? (
                            <>
                              <User className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {getUserLabel(selectedUser)}
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
                              title="Limpar seleção"
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
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar por nome ou email..."
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
                      ) : filteredUsers.length === 0 ? (
                        <CommandEmpty>
                          {searchQuery.trim() 
                            ? `Nenhum usuário encontrado para "${searchQuery}"`
                            : 'Nenhum usuário encontrado.'}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {visibleUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.name} ${user.email}`}
                              onSelect={() => {
                                handleSelect(user.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 shrink-0',
                                  user.id === field.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <User className="mr-2 h-4 w-4 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                          {visibleCount < filteredUsers.length && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                              Mostrando {visibleCount} de {filteredUsers.length} usuários
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
