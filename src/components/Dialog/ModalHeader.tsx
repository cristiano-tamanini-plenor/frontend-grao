import { PropsWithChildren } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';
import { When } from '@/utils/When';
import { cn } from '@/lib/utils';

interface ModalHeaderProps extends PropsWithChildren {
  /**
   * Título do modal
   */
  title: string;

  /**
   * Ícone do modal
   */
  icon?: LucideIcon;

  /**
   * Classes customizadas para o título
   */
  className?: string;
}

export function ModalHeader({
  title,
  icon: Icon,
  className,
  children,
}: ModalHeaderProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className={cn('flex items-center gap-2', className)}>
          <When is={Icon}>
            <Icon className="h-5 w-5" />
          </When>
          {title}
        </DialogTitle>
      </DialogHeader>

      {/* Área de ações (botões, etc) - renderiza apenas se houver children */}
      <When is={Boolean(children)}>
        <div className="flex items-center justify-end gap-2">
          {children}
        </div>
      </When>
    </div>
  );
}

