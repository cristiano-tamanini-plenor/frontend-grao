import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ReactNode, ComponentProps } from 'react';

interface InputTextareaProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  textareaProps?: Omit<ComponentProps<typeof Textarea>, 'placeholder'>;
}

export const InputTextarea = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required = false,
  textareaProps,
}: InputTextareaProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { onChange: customOnChange, ...restTextareaProps } = textareaProps || {};
        
        return (
          <FormItem>
            {label && <FormLabel>{label}{required && ' *'}</FormLabel>}
            <FormControl>
              <Textarea
                placeholder={placeholder}
                {...field}
                {...restTextareaProps}
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

