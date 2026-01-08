import React, { PropsWithChildren } from 'react';
import { LucideIcon } from 'lucide-react';
import { When } from '@/utils/When';
import { cn } from '@/lib/utils';

export interface FormHeaderProps extends PropsWithChildren {
  /**
   * Título da página de formulário
   */
  title: string;

  /**
   * Subtítulo/descrição da página
   */
  subtitle?: string;

  /**
   * Ícone da página
   */
  icon?: LucideIcon;

  /**
   * Tamanho do ícone (padrão: 'large' = h-8 w-8)
   */
  iconSize?: 'default' | 'large';

  /**
   * Classes customizadas
   */
  className?: string;
}

/**
 * Componente de cabeçalho para páginas de formulário
 * Equivalente ao ListHeader mas específico para formulários
 * 
 * @example
 * <FormHeader
 *   icon={User}
 *   title={userId ? 'Editar Usuário' : 'Novo Usuário'}
 *   subtitle="Preencha as informações"
 * >
 *   <BackButton onClick={handleBack} />
 * </FormHeader>
 */
export function FormHeader({
  title,
  subtitle,
  icon: Icon,
  iconSize = 'large',
  className,
  children,
}: FormHeaderProps) {
  const iconClassName = iconSize === 'large' ? 'h-8 w-8 text-primary' : 'h-6 w-6 text-primary';

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-shrink-0', className)}>
      <div className="flex items-center gap-3">
        <When is={Icon}>
          <Icon className={iconClassName} />
        </When>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <When is={Boolean(subtitle)}>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </When>
        </div>
      </div>

      {/* Área de ações (botões, etc) */}
      <When is={Boolean(children)}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {children}
        </div>
      </When>
    </div>
  );
}

