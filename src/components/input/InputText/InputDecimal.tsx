import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ReactNode, ComponentProps } from 'react';

interface InputDecimalProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  inputProps?: Omit<ComponentProps<typeof Input>, 'placeholder' | 'type' | 'min' | 'max' | 'step'>;
}

export const InputDecimal = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required = false,
  min,
  max,
  step = 0.01,
  inputProps,
}: InputDecimalProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { onChange: customOnChange, ...restInputProps } = inputProps || {};
        
        return (
          <FormItem>
            {label && <FormLabel>{label}{required && ' *'}</FormLabel>}
            <FormControl>
              <Input
                type="number"
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                {...field}
                {...restInputProps}
                value={field.value === null || field.value === undefined ? '' : field.value}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permite campo vazio ou número válido
                  if (value === '') {
                    field.onChange(0);
                    if (customOnChange) {
                      customOnChange(e);
                    }
                    return;
                  }
                  
                  const numValue = parseFloat(value);
                  
                  // Se não for um número válido, não atualiza
                  if (isNaN(numValue)) {
                    return;
                  }
                  
                  // Aplica min/max se especificado
                  let finalValue = numValue;
                  if (min !== undefined && numValue < min) {
                    finalValue = min;
                  }
                  if (max !== undefined && numValue > max) {
                    finalValue = max;
                  }
                  
                  field.onChange(finalValue);
                  
                  if (customOnChange) {
                    customOnChange(e);
                  }
                }}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

