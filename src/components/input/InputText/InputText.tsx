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

interface InputTextProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  inputProps?: Omit<ComponentProps<typeof Input>, 'placeholder'>;
}

export const InputText = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required = false,
  inputProps,
}: InputTextProps<TFieldValues>) => {
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
                placeholder={placeholder}
                {...field}
                {...restInputProps}
                onChange={(e) => {
                  if (customOnChange) {
                    // Chama o onChange customizado e depois atualiza o field
                    customOnChange(e);
                    // Atualiza o campo do formulário com o valor do evento (que pode ter sido transformado)
                    field.onChange(e.target.value);
                  } else {
                    field.onChange(e);
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
