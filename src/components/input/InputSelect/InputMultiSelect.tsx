import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface Option {
  value: string;
  label: string;
}

interface InputMultiSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  options: Option[];
  required?: boolean;
}

export function InputMultiSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  required = false,
}: InputMultiSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <div className="space-y-2">
            {options.map((option) => (
              <FormField
                key={option.value}
                control={control}
                name={name}
                render={({ field }) => {
                  const currentValue = field.value || [];
                  const isChecked = currentValue.includes(option.value);
                  
                  return (
                    <FormItem
                      key={option.value}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...currentValue, option.value]
                              : currentValue.filter((value: string) => value !== option.value);
                            field.onChange(updatedValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
