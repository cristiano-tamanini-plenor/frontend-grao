import React, { PropsWithChildren } from 'react';
import { FormProvider } from 'react-hook-form';
import { FormActions } from './Actions';
import { FormContainer } from './Container';
import { FormTitle } from './Title';
import { FormHeader } from './Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCurrentCadastro } from '@/hooks/useCurrentCadastro';
import { useSearchParams } from 'react-router-dom';
import type { FormProps } from './types';

export * from './Actions';
export * from './Container';
export * from './Title';
export * from './Header';
export * from './types';

/**
 * Componente Form wrapper que gerencia ações, loading e estrutura
 * 
 * @example
 * ```tsx
 * const useForm = useFormUser(id);
 * 
 * <Form {...useForm}>
 *   <FormContainer>
 *     <FormTitle title="Informações" Icon={User} />
 *     <BoxInformacoes />
 *   </FormContainer>
 * </Form>
 * ```
 */
export function Form({
  children,
  customMaxHeight = '100vh',
  containerOverflow = 'auto',
  isLoadingForm = false,
  header,
  autoHeader = true,
  ...actionsProps
}: FormProps) {
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get('id') || actionsProps.identifier || null;
  const currentCadastro = useCurrentCadastro();
  
  // Se header não foi fornecido e autoHeader está habilitado, tenta buscar automaticamente do cadastro
  const shouldShowAutoHeader = !header && autoHeader && currentCadastro;
  const headerToShow = header || (shouldShowAutoHeader ? {
    title: identifier ? `Editar ${currentCadastro.name}` : `Novo ${currentCadastro.name}`,
    subtitle: identifier 
      ? `Atualize as informações do ${currentCadastro.name.toLowerCase()}`
      : `Preencha as informações para criar um novo ${currentCadastro.name.toLowerCase()}`,
    icon: currentCadastro.icon,
    iconSize: 'large' as const,
  } : null);

  return (
    <FormProvider {...actionsProps.formMethods}>
      <div className="flex flex-col relative h-full min-h-0">
        {/* Form com ações */}
        <form onSubmit={actionsProps.handleSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Header da página com ações integradas */}
          {headerToShow && (
            <div className="mb-6">
              <FormHeader
                title={headerToShow.title}
                subtitle={headerToShow.subtitle}
                icon={headerToShow.icon}
                iconSize={headerToShow.iconSize}
                className={headerToShow.className}
              >
                {headerToShow.children}
                <FormActions {...actionsProps} />
              </FormHeader>
            </div>
          )}
          
          {/* Container de conteúdo com scroll */}
          <div
            className={cn(
              'flex-1 min-h-0',
              containerOverflow === 'hidden' && 'overflow-hidden',
              containerOverflow === 'visible' && 'overflow-visible',
              containerOverflow === 'scroll' && 'overflow-y-scroll',
              containerOverflow === 'auto' && 'overflow-y-auto'
            )}
          >
            <div className="space-y-4">
              {children}
            </div>
          </div>
        </form>

        {/* Loading overlay */}
        {isLoadingForm && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </FormProvider>
  );
}

