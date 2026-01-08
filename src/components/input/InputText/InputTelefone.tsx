import { useState, useMemo, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { countries, defaultCountry, type Country } from '@/lib/utils/countries';
import { fromE164ToDisplay, applyBRPhoneMask } from '@/lib/utils/phone';

interface InputTelefoneProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

// Função para detectar país a partir do valor E.164
const detectCountryFromValue = (value: string): Country => {
  if (!value) return defaultCountry;
  
  const numbers = value.replace(/\D/g, '');
  // Procura pelo código do país mais longo primeiro (ex: 1242 antes de 1)
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of sortedCountries) {
    if (numbers.startsWith(country.dialCode)) {
      return country;
    }
  }
  return defaultCountry;
};

export const InputTelefone = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = '(11) 91234-5678',
  required = false,
}: InputTelefoneProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const watchedValue = useWatch({ control, name });
  const fieldValue = String(watchedValue || '');
  
  // Detecta e atualiza o país baseado no valor do campo (quando o valor vem de fora)
  useEffect(() => {
    const detected = detectCountryFromValue(fieldValue);
    if (detected.code !== selectedCountry.code) {
      setSelectedCountry(detected);
    }
  }, [fieldValue]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Formata o número para exibição usando o país selecionado
        const displayValue = fieldValue
          ? fromE164ToDisplay(fieldValue, selectedCountry.dialCode)
          : '';

        const handleCountryChange = (country: Country) => {
          setSelectedCountry(country); // Atualiza o estado local imediatamente
          setOpen(false);
          setSearchQuery('');
          
          // Se já existe um número, converte para o novo código do país
          if (fieldValue) {
            const numbers = fieldValue.replace(/\D/g, '');
            
            // Encontra o país atual para remover seu código
            const currentCountry = detectCountryFromValue(fieldValue);
            
            // Remove o código do país atual se existir
            let localNumber = numbers;
            if (numbers.startsWith(currentCountry.dialCode)) {
              localNumber = numbers.slice(currentCountry.dialCode.length);
            }
            
            // Adiciona o novo código do país
            const newValue = localNumber ? `+${country.dialCode}${localNumber}` : '';
            field.onChange(newValue);
          } else {
            // Se não há número, apenas limpa o campo quando troca de país
            field.onChange('');
          }
        };

        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value;
          
          // Se o campo está vazio, limpa o valor
          if (!inputValue.trim()) {
            field.onChange('');
            return;
          }
          
          // Aplica máscara brasileira apenas se for Brasil
          const masked = selectedCountry.code === 'BR' 
            ? applyBRPhoneMask(inputValue)
            : inputValue.replace(/\D/g, '');
          
          // Converte para E.164 apenas se houver números
          const numbers = masked.replace(/\D/g, '');
          if (numbers) {
            const e164 = `+${selectedCountry.dialCode}${numbers}`;
            field.onChange(e164);
          } else {
            field.onChange('');
          }
        };

        return (
          <FormItem>
            {label && <FormLabel>{label}{required && ' *'}</FormLabel>}
            <FormControl>
              <div className="flex gap-2">
                {/* Seletor de País */}
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[140px] justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm">+{selectedCountry.dialCode}</span>
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Código do país"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredCountries.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.code}
                              onSelect={() => handleCountryChange(country)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCountry.code === country.code
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="mr-2 text-lg">{country.flag}</span>
                              <span className="flex-1">{country.name}</span>
                              <span className="text-muted-foreground">+{country.dialCode}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Campo de Telefone */}
                <Input
                  type="tel"
                  placeholder={placeholder}
                  value={displayValue}
                  onChange={handlePhoneChange}
                  className="flex-1"
                />
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

