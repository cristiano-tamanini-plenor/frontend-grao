import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { userProfilesService } from '@/pages/private/user-profile/services/user-profiles.service';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { X, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AutoCompleteUserProfilesProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export function AutoCompleteUserProfiles<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = 'Perfis de Usuário',
  placeholder = 'Selecione os perfis',
  description,
  required = false,
}: AutoCompleteUserProfilesProps<TFieldValues>) {
  const { currentCompany } = useCompany();
  const [open, setOpen] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['user-profiles', currentCompany?.id],
    queryFn: () => {
      if (!currentCompany?.id) return Promise.resolve([]);
      return userProfilesService.getProfilesByCompany(currentCompany.id);
    },
    enabled: !!currentCompany?.id,
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues = Array.isArray(field.value) ? field.value : [];
        
        const handleSelect = (profileId: string) => {
          const newValue = selectedValues.includes(profileId)
            ? selectedValues.filter((id: string) => id !== profileId)
            : [...selectedValues, profileId];
          field.onChange(newValue);
        };

        const handleRemove = (profileId: string) => {
          field.onChange(selectedValues.filter((id: string) => id !== profileId));
        };

        return (
          <FormItem>
            {label && <FormLabel>{label}{required && ' *'}</FormLabel>}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !selectedValues.length && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selectedValues.length > 0
                        ? `${selectedValues.length} perfil(is) selecionado(s)`
                        : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar perfil..." />
                  <CommandEmpty>
                    {isLoading ? 'Carregando...' : 'Nenhum perfil encontrado.'}
                  </CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {profiles.map((profile) => (
                      <CommandItem
                        key={profile.id}
                        value={profile.name}
                        onSelect={() => handleSelect(profile.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValues.includes(profile.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {profile.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedValues.map((profileId: string) => {
                  const profile = profiles.find(p => p.id === profileId);
                  if (!profile) return null;
                  return (
                    <Badge key={profileId} variant="secondary" className="gap-1">
                      {profile.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(profileId);
                        }}
                        className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
