import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PIcon } from '@/components/ui/p-icon';

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  onApply: () => void;
  onCancel?: () => void;
  onClear?: () => void;
  applyLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  showClearButton?: boolean;
}

/**
 * Componente reutilizável de Drawer de Filtros
 * Abre da lateral direita e contém header, body e footer
 * 
 * @example
 * <FilterDrawer
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onApply={() => {
 *     // Aplicar filtros
 *   }}
 * >
 *   <YourFilterFields />
 * </FilterDrawer>
 */
export function FilterDrawer({
  open,
  onOpenChange,
  title = 'Filtros',
  children,
  onApply,
  onCancel,
  onClear,
  applyLabel = 'Aplicar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  showClearButton = false,
}: FilterDrawerProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="border-b pb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex-1">{title}</SheetTitle>
            {showClearButton && onClear && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 shrink-0 border-blue-500 hover:bg-blue-50 flex items-center justify-center p-0"
                title="Limpar filtros"
              >
                <PIcon 
                  name="filter_remove" 
                  variant="Bulk" 
                  size={18} 
                  color="hsl(var(--primary))"
                />
                <span className="sr-only">Limpar filtros</span>
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-1 px-1">{children}</div>

        <SheetFooter className="border-t pt-4 gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Aplicando...' : applyLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

