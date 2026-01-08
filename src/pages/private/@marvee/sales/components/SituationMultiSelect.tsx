import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SituationMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
}

const SITUATION_OPTIONS = [
  { value: '1', label: 'Pendente' },
  { value: '2', label: 'Efetivada' },
  { value: '3', label: 'Cancelado' },
  { value: '4', label: 'Liquidado' },
];

export function SituationMultiSelect({
  value = [],
  onChange,
  label = 'Situação',
}: SituationMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (open && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    const currentValue = value || [];
    const isSelected = currentValue.includes(optionValue);
    
    const updatedValue = isSelected
      ? currentValue.filter((v) => v !== optionValue)
      : [...currentValue, optionValue];
    
    onChange?.(updatedValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentValue = value || [];
    onChange?.(currentValue.filter((v) => v !== optionValue));
  };

  const selectedOptions = SITUATION_OPTIONS.filter((opt) => value.includes(opt.value));

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            className={cn(
              'w-full justify-between min-h-10 h-auto py-2 px-3 text-left font-normal',
              !value.length && 'text-muted-foreground'
            )}
          >
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-sm text-gray-900"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="ml-0.5 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 p-0.5"
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">Selecione as situações...</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{
            width: popoverWidth ? `${popoverWidth}px` : undefined,
            minWidth: popoverWidth ? `${popoverWidth}px` : undefined,
          }}
        >
          <Command>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>Nenhuma situação encontrada.</CommandEmpty>
              <CommandGroup>
                {SITUATION_OPTIONS.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
