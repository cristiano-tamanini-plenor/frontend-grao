import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  X, 
  Save,
  Filter,
  Search,
  Download,
  Upload,
  Edit,
  Eye
} from 'lucide-react';
import { ButtonProps } from '@/components/ui/button';

interface ActionButtonProps extends ButtonProps {
  label?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  tooltip?: string;
  iconOnly?: boolean;
}

/**
 * Botão para adicionar novo item
 */
export function AddButton({ 
  label = 'Novo', 
  showIcon = true, 
  showLabel = true,
  tooltip,
  iconOnly = false,
  ...props 
}: ActionButtonProps) {
  const displayLabel = iconOnly ? false : showLabel;
  const displayTooltip = tooltip || (iconOnly ? label : undefined);
  const button = (
    <Button size={iconOnly ? 'icon' : 'default'} {...props}>
      {showIcon && <Plus className="h-4 w-4" />}
      {displayLabel && label}
    </Button>
  );

  if (displayTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {displayTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

/**
 * Botão para deletar item
 */
export function DeleteButton({ 
  label = 'Excluir', 
  showIcon = true, 
  showLabel = true,
  variant = 'destructive',
  tooltip,
  iconOnly = false,
  ...props 
}: ActionButtonProps) {
  const displayLabel = iconOnly ? false : showLabel;
  const displayTooltip = tooltip || (iconOnly ? label : undefined);
  const button = (
    <Button variant={variant} size={iconOnly ? 'icon' : 'default'} {...props}>
      {showIcon && <Trash2 className="h-4 w-4" />}
      {displayLabel && label}
    </Button>
  );

  if (displayTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {displayTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

/**
 * Botão para voltar
 */
export function BackButton({ 
  label = 'Voltar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  tooltip,
  iconOnly = false,
  ...props 
}: ActionButtonProps) {
  const displayLabel = iconOnly ? false : showLabel;
  const displayTooltip = tooltip || (iconOnly ? label : undefined);
  const button = (
    <Button variant={variant} size={iconOnly ? 'icon' : 'default'} {...props}>
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      {displayLabel && label}
    </Button>
  );

  if (displayTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {displayTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

/**
 * Botão para atualizar/refresh
 */
export function RefreshButton({ 
  label = 'Atualizar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <RefreshCw className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

/**
 * Botão para cancelar
 */
export function CancelButton({ 
  label = 'Cancelar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  tooltip,
  iconOnly = false,
  ...props 
}: ActionButtonProps) {
  const displayLabel = iconOnly ? false : showLabel;
  const displayTooltip = tooltip || (iconOnly ? label : undefined);
  const button = (
    <Button variant={variant} size={iconOnly ? 'icon' : 'default'} {...props}>
      {showIcon && <X className="h-4 w-4" />}
      {displayLabel && label}
    </Button>
  );

  if (displayTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {displayTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

/**
 * Botão para salvar
 */
export function SaveButton({ 
  label = 'Salvar', 
  showIcon = true, 
  showLabel = true,
  tooltip,
  iconOnly = false,
  ...props 
}: ActionButtonProps) {
  const displayLabel = iconOnly ? false : showLabel;
  const displayTooltip = tooltip || (iconOnly ? label : undefined);
  const button = (
    <Button size={iconOnly ? 'icon' : 'default'} {...props}>
      {showIcon && <Save className="h-4 w-4" />}
      {displayLabel && label}
    </Button>
  );

  if (displayTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {displayTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

/**
 * Botão para filtrar
 */
export function FilterButton({ 
  label = 'Filtros', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <Filter className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

/**
 * Botão para pesquisar
 */
export function SearchButton({ 
  label = 'Pesquisar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <Search className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

/**
 * Botão para exportar
 */
export function ExportButton({ 
  label = 'Exportar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <Download className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

/**
 * Botão para importar
 */
export function ImportButton({ 
  label = 'Importar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <Upload className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

/**
 * Botão para editar
 */
export function EditButton({ 
  label = 'Editar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <Edit className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

/**
 * Botão para visualizar
 */
export function ViewButton({ 
  label = 'Visualizar', 
  showIcon = true, 
  showLabel = true,
  variant = 'outline',
  ...props 
}: ActionButtonProps) {
  return (
    <Button variant={variant} {...props}>
      {showIcon && <Eye className="h-4 w-4" />}
      {showLabel && label}
    </Button>
  );
}

