import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUpdateSaleValue } from '../hooks/useUpdateSaleValue';
import { Pencil } from 'lucide-react';

// Função para formatar valor monetário
const formatCurrency = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

// Função para remover formatação e obter apenas números
const getDigitsOnly = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para converter string de dígitos em valor numérico (centavos → reais)
const digitsToValue = (digits: string): number => {
  if (!digits || digits === '0') return 0;
  // Trata como centavos e converte para reais
  return parseFloat(digits) / 100;
};

// Função para formatar valor numérico para exibição (xxx.xxx,xx)
const formatCurrencyInput = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0,00';
  
  // Converte para centavos (multiplica por 100)
  const cents = Math.round(value * 100);
  const centsStr = cents.toString().padStart(3, '0'); // Garante pelo menos 3 dígitos
  
  // Separa parte inteira e decimal
  const decimalPart = centsStr.slice(-2); // Últimos 2 dígitos
  const integerPart = centsStr.slice(0, -2) || '0'; // Resto dos dígitos
  
  // Formata parte inteira com pontos para milhares
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedInteger},${decimalPart}`;
};

// Função para processar input digitado (preenche da direita para esquerda)
const processCurrencyInput = (inputValue: string, previousValue: number): number => {
  // Remove tudo que não é dígito
  const digits = getDigitsOnly(inputValue);
  
  if (!digits) return 0;
  
  // Converte dígitos para valor (tratando como centavos)
  return digitsToValue(digits);
};

interface EditValuePopoverProps {
  saleId: number;
  currentValue: string;
  onSuccess?: () => void;
}

const editValueSchema = z.object({
  value: z.number().min(0, 'O valor deve ser maior ou igual a zero'),
});

type EditValueFormData = z.infer<typeof editValueSchema>;

export function EditValuePopover({ saleId, currentValue, onSuccess }: EditValuePopoverProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateValue, isPending } = useUpdateSaleValue();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditValueFormData>({
    resolver: zodResolver(editValueSchema),
    defaultValues: {
      value: parseFloat(currentValue) || 0,
    },
  });

  // Foca o input quando o popover abre
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [open]);

  const handleSubmit = (data: EditValueFormData) => {
    updateValue(
      { saleId, value: data.value },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset({
      value: parseFloat(currentValue) || 0,
    });
  };

  return (
    <Popover 
      open={open} 
      onOpenChange={(newOpen) => {
        // Só permite abrir, não fecha automaticamente
        if (newOpen) {
          setOpen(true);
        }
        // Fechar só acontece via handleCancel ou ESC
      }}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-semibold hover:bg-transparent hover:underline"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {formatCurrency(currentValue)}
          <Pencil className="ml-1 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        align="end"
        onInteractOutside={(e) => {
          // Previne fechar ao clicar fora
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!isPending) {
            handleCancel();
          } else {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Previne fechar ao clicar fora
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Editar Valor</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Valor atual: <span className="font-semibold">{formatCurrency(currentValue)}</span>
            </p>
          </div>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Novo Valor</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      className="pl-10"
                      value={field.value !== null && field.value !== undefined ? formatCurrencyInput(field.value) : '0,00'}
                      onChange={(e) => {
                        const newValue = processCurrencyInput(e.target.value, field.value || 0);
                        field.onChange(newValue);
                      }}
                      onBlur={field.onBlur}
                      onKeyDown={(e) => {
                        // Permite ESC para fechar
                        if (e.key === 'Escape' && !isPending) {
                          handleCancel();
                          e.preventDefault();
                          e.stopPropagation();
                        }
                        // Previne que Enter feche o popover antes de submeter
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                        }
                        // Permite Backspace e Delete
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          // Se o valor atual for maior que 0, remove o último dígito
                          if (field.value && field.value > 0) {
                            const currentCents = Math.round(field.value * 100);
                            const newCents = Math.floor(currentCents / 10);
                            const newValue = newCents / 100;
                            field.onChange(newValue);
                            e.preventDefault();
                          }
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Move cursor para o final ao clicar
                        const target = e.target as HTMLInputElement;
                        setTimeout(() => {
                          target.setSelectionRange(target.value.length, target.value.length);
                        }, 0);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPaste={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const pastedText = e.clipboardData.getData('text');
                        const digits = getDigitsOnly(pastedText);
                        if (digits) {
                          const newValue = digitsToValue(digits);
                          field.onChange(newValue);
                        }
                      }}
                      onFocus={(e) => {
                        // Move cursor para o final ao focar
                        setTimeout(() => {
                          e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                        }, 0);
                      }}
                      disabled={isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

