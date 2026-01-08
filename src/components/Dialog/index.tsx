import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  variant = 'destructive',
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: string;
  className?: string;
}

/**
 * Dialog genérico para exibir informações
 * Reduz código duplicado ao criar modais informativos
 */
export const InfoDialog = ({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  footer,
  width,
  className,
}: InfoDialogProps) => {
  // Se width for fornecido, usa ele e remove o max-w-lg e w-full padrão
  // Usa classes com !important para garantir que sobrescrevam o padrão
  const contentClassName = width
    ? cn(
        '!max-w-none', // Remove max-w-lg padrão
        '!w-auto', // Remove w-full padrão primeiro
        className
      )
    : className;

  // Estilo inline para garantir que o width seja aplicado (tem prioridade máxima sobre classes CSS)
  // O estilo inline sempre tem prioridade sobre classes, então isso deve funcionar
  const contentStyle = width 
    ? { 
        width: width, 
        maxWidth: 'none',
        minWidth: width // Garante que não fique menor que o width especificado
      } 
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={contentClassName || undefined} 
        style={contentStyle}
      >
        <DialogHeader>
          <DialogTitle className={Icon ? 'flex items-center gap-2' : ''}>
            {Icon && <Icon className={iconClassName || 'h-5 w-5'} />}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && (
          <DialogBody>
            <div className="space-y-4 py-4">{children}</div>
          </DialogBody>
        )}

        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Export ModalHeader
export { ModalHeader } from './ModalHeader';

