import React, { PropsWithChildren } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FormContainerProps extends PropsWithChildren {
  /**
   * Modo de tema (dark/light) - para futura implementação
   */
  mode?: 'dark' | 'light';

  /**
   * Altura total do container
   */
  fullHeight?: boolean;

  /**
   * Classes customizadas
   */
  className?: string;
}

export function FormContainer({
  children,
  mode = 'light',
  fullHeight = false,
  className,
}: FormContainerProps) {
  return (
    <Card
      id="form-container"
      className={cn(
        'p-6',
        fullHeight && 'h-full',
        className
      )}
    >
      {children}
    </Card>
  );
}

