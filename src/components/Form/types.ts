import React, { PropsWithChildren } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LucideIcon } from 'lucide-react';

export interface FormActionsProps {
  /**
   * Altura máxima customizada para o container (padrão: 100vh)
   */
  customMaxHeight?: string;

  /**
   * Estados de loading para diferentes ações
   */
  isLoadingCreate?: boolean;
  isLoadingUpdate?: boolean;
  isLoadingDelete?: boolean;
  isLoadingForm?: boolean;

  /**
   * Handlers para ações
   */
  handleDelete?: () => void | Promise<void>;
  handleSubmit?: (e?: React.BaseSyntheticEvent) => void | Promise<void>;

  /**
   * ID do item sendo editado (null = criar novo)
   */
  identifier?: string | null;

  /**
   * Desabilita botões específicos
   */
  disabled?: {
    remove?: boolean;
    update?: boolean;
    save?: boolean;
  };

  /**
   * Esconde ações específicas
   */
  hiddenActions?: {
    destroy?: boolean;
    update?: boolean;
    create?: boolean;
    back?: boolean;
    title?: boolean;
  };

  /**
   * Callback customizado para atualização
   */
  onUpdate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void> | void;

  /**
   * Métodos do react-hook-form
   */
  formMethods: UseFormReturn<any>;

  /**
   * Ações extras customizadas
   */
  ExtraActions?: React.ReactNode;
}

export type FormProps = PropsWithChildren<
  FormActionsProps & 
  Omit<React.HTMLProps<HTMLFormElement>, 'disabled'> & {
    /**
     * Overflow do container (padrão: 'auto')
     */
    containerOverflow?: 'auto' | 'hidden' | 'scroll' | 'visible' | 'inherit';

    /**
     * Props do FormHeader (cabeçalho da página)
     * Se não fornecido, será buscado automaticamente do cadastro baseado na rota atual
     */
    header?: {
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

      /**
       * Conteúdo customizado (botões, etc.)
       */
      children?: React.ReactNode;
    };

    /**
     * Se false, desabilita a busca automática do header do cadastro
     * (padrão: true - busca automaticamente se header não for fornecido)
     */
    autoHeader?: boolean;
  }
>;

