import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { When } from '@/utils/When';
import { cn } from '@/lib/utils';

export interface FormTitleProps {
  /**
   * Título do formulário
   */
  title?: string | React.ReactNode;

  /**
   * Ícone para o título
   */
  Icon?: LucideIcon;

  /**
   * Subtítulo ou descrição
   */
  subtitle?: string | React.ReactNode;

  /**
   * Esconder a linha divisória
   */
  hideDivider?: boolean;

  /**
   * Classes customizadas
   */
  className?: string;

  /**
   * Conteúdo customizado (usado como título se title não for fornecido)
   */
  children?: React.ReactNode;
}

export function FormTitle({
  title,
  Icon,
  subtitle,
  hideDivider = false,
  className,
  children,
}: FormTitleProps) {
  return (
    <div className={cn('space-y-2 w-full mb-4', className)}>
      {/* Título com ícone */}
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h2 className="text-xl font-semibold">
          {title || children}
        </h2>
      </div>

      {/* Subtítulo */}
      <When is={Boolean(subtitle)}>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </When>

      {/* Divisória */}
      <When is={!hideDivider}>
        <Separator />
      </When>
    </div>
  );
}

