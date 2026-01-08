import React from 'react';

/**
 * Componente condicional simples para renderização baseada em condições
 * @example
 * <When is={user.isAdmin}>
 *   <AdminPanel />
 * </When>
 */
interface WhenProps {
  is: any;
  children: React.ReactNode;
}

export function When({ is, children }: WhenProps) {
  if (is) {
    return <>{children}</>;
  }
  return null;
}

/**
 * Renderiza children quando a condição NÃO é atendida
 */
export function Unless({ is, children }: WhenProps) {
  return <When is={!is}>{children}</When>;
}

