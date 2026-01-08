import { Box, styled } from '@mui/material';
import { DataGridPremium } from '@mui/x-data-grid-premium';

export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  overflow: 'hidden',
  '& .MuiDataGrid-root': {
    border: 'none',
    height: '100%',
    width: '100%',
  },
  '& .MuiDataGrid-main': {
    height: '100%',
    width: '100%',
  },
  '& .MuiDataGrid-virtualScroller': {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-virtualScrollerContent': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-virtualScrollerRenderZone': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-overlayWrapper': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-overlayWrapperInner': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-overlay': {
    backgroundColor: 'hsl(var(--background)) !important',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.95rem',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '0.2px solid #EAEAEA',
    borderRight: 'none',
    color: 'hsl(var(--foreground))',
    backgroundColor: 'hsl(var(--background))',
    fontSize: 'calc(1rem - 3px)',
    display: 'flex',
    alignItems: 'center',
    '&:focus': {
      outline: 'none',
    },
    '&:focus-within': {
      outline: 'none',
    },
  },
  // Estilos para colunas fixadas (pinned columns)
  '& .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
    zIndex: 1,
    position: 'sticky',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '1px',
      backgroundColor: 'hsl(var(--border))',
      zIndex: 2,
    },
  },
  // Garantir que no modo dark as colunas congeladas tenham a mesma cor
  '.dark & .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-columnHeader--pinnedLeft': {
    backgroundColor: 'hsl(var(--primary)) !important',
    zIndex: 2,
    position: 'sticky',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '1px',
      backgroundColor: 'hsl(var(--border))',
      zIndex: 3,
    },
  },
  '& .MuiDataGrid-pinnedColumns': {
    backgroundColor: 'hsl(var(--background)) !important',
    zIndex: 1,
  },
  // Garantir que no modo dark o container de colunas congeladas tenha a cor correta
  '.dark & .MuiDataGrid-pinnedColumns': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  // Sobrescrever qualquer estilo padrão do MUI que possa estar aplicando cor branca
  '.dark & .MuiDataGrid-pinnedColumns .MuiDataGrid-cell': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-pinnedColumns .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  // Estilos para colunas fixadas à direita
  '& .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
    zIndex: 1,
    position: 'sticky',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: '1px',
      backgroundColor: 'hsl(var(--border))',
      zIndex: 2,
    },
  },
  '.dark & .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-columnHeader--pinnedRight': {
    backgroundColor: 'hsl(var(--primary)) !important',
    zIndex: 2,
    position: 'sticky',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: '1px',
      backgroundColor: 'hsl(var(--border))',
      zIndex: 3,
    },
  },
  '.dark & .MuiDataGrid-pinnedColumns .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-pinnedColumnHeaders': {
    backgroundColor: 'hsl(var(--primary)) !important',
    zIndex: 2,
  },
  // Garantir que o hover não afete as colunas fixadas incorretamente
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell:not(.MuiDataGrid-cell--pinnedLeft):not(.MuiDataGrid-cell--pinnedRight)': {
    backgroundColor: 'hsl(var(--primary) / 0.1) !important',
  },
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  // Garantir que células congeladas selecionadas no modo dark mantenham a cor correta
  '.dark & .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'hsl(var(--primary)) !important',
    color: 'hsl(var(--primary-foreground)) !important',
    borderBottom: '1px solid hsl(var(--border))',
    minHeight: '36px !important',
    maxHeight: '36px !important',
  },
  '.dark & .MuiDataGrid-columnHeaders': {
    color: '#ffffff !important',
  },
  '& .MuiDataGrid-columnHeader': {
    backgroundColor: 'hsl(var(--primary)) !important',
    color: 'hsl(var(--primary-foreground)) !important',
    height: '36px !important',
    minHeight: '36px !important',
    maxHeight: '36px !important',
    '&:hover': {
      backgroundColor: 'hsl(var(--primary-hover)) !important',
    },
  },
  '.dark & .MuiDataGrid-columnHeader': {
    color: '#ffffff !important',
  },
  '& .MuiDataGrid-columnHeader--filledGroup': {
    backgroundColor: 'hsl(var(--primary)) !important',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    color: 'hsl(var(--primary-foreground)) !important',
    fontWeight: 600,
  },
  '.dark & .MuiDataGrid-columnHeaderTitle': {
    color: '#ffffff !important',
  },
  '& .MuiDataGrid-sortIcon': {
    color: 'hsl(var(--primary-foreground)) !important',
  },
  '.dark & .MuiDataGrid-sortIcon': {
    color: '#ffffff !important',
  },
  '& .MuiDataGrid-menuIcon': {
    color: 'hsl(var(--primary-foreground)) !important',
  },
  '.dark & .MuiDataGrid-menuIcon': {
    color: '#ffffff !important',
  },
  '& .MuiDataGrid-iconButtonContainer': {
    '& .MuiIconButton-root': {
      color: 'hsl(var(--primary-foreground)) !important',
    },
  },
  '.dark & .MuiDataGrid-iconButtonContainer .MuiIconButton-root': {
    color: '#ffffff !important',
  },
  '& .MuiDataGrid-row': {
    backgroundColor: 'hsl(var(--background))',
    '--rowBorderColor': '#EAEAEA',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      backgroundColor: 'hsl(var(--primary) / 0.1) !important',
      cursor: 'pointer',
      '& .MuiDataGrid-cell:not(.MuiDataGrid-cell--pinnedLeft):not(.MuiDataGrid-cell--pinnedRight)': {
        backgroundColor: 'hsl(var(--primary) / 0.1) !important',
      },
      '& .MuiDataGrid-cell--pinnedLeft': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
      '& .MuiDataGrid-cell--pinnedRight': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
    },
    '&.Mui-selected': {
      backgroundColor: 'hsl(var(--primary) / 0.08) !important',
      borderLeft: '3px solid hsl(var(--primary))',
      '&:hover': {
        backgroundColor: 'hsl(var(--primary) / 0.12) !important',
        '& .MuiDataGrid-cell:not(.MuiDataGrid-cell--pinnedLeft):not(.MuiDataGrid-cell--pinnedRight)': {
          backgroundColor: 'hsl(var(--primary) / 0.12) !important',
        },
        '& .MuiDataGrid-cell--pinnedLeft': {
          backgroundColor: 'hsl(var(--background)) !important',
        },
        '& .MuiDataGrid-cell--pinnedRight': {
          backgroundColor: 'hsl(var(--background)) !important',
        },
      },
      '& .MuiDataGrid-cell:not(.MuiDataGrid-cell--pinnedLeft):not(.MuiDataGrid-cell--pinnedRight)': {
        backgroundColor: 'hsl(var(--primary) / 0.08) !important',
      },
      '& .MuiDataGrid-cell--pinnedLeft': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
      '& .MuiDataGrid-cell--pinnedRight': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
    },
    // Garantir que no modo dark as linhas selecionadas mantenham a cor correta nas colunas congeladas
    '.dark & .Mui-selected': {
      '& .MuiDataGrid-cell--pinnedLeft': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
      '& .MuiDataGrid-cell--pinnedRight': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
      '&:hover .MuiDataGrid-cell--pinnedLeft': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
      '&:hover .MuiDataGrid-cell--pinnedRight': {
        backgroundColor: 'hsl(var(--background)) !important',
      },
    },
    '&:focus, &:focus-within': {
      backgroundColor: 'hsl(var(--primary) / 0.08)',
      borderLeft: '3px solid hsl(var(--primary))',
      outline: 'none',
    },
  },
  '.dark & .MuiDataGrid-row': {
    '--rowBorderColor': '#282934',
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
  },
  '& .MuiTablePagination-root': {
    color: 'hsl(var(--foreground))',
  },
  '& .MuiIconButton-root': {
    color: 'hsl(var(--foreground))',
    '&:hover': {
      backgroundColor: 'hsl(var(--accent))',
    },
  },
  '& .MuiSelect-select': {
    color: 'hsl(var(--foreground))',
  },
  // Estilos específicos para recursos Premium
  '& .MuiDataGrid-groupingCriteriaCell': {
    backgroundColor: 'hsl(var(--muted))',
    // Esconder o primeiro filho que geralmente é o toggle
    '& > *:first-of-type': {
      display: 'none !important',
      width: '0 !important',
      minWidth: '0 !important',
      padding: '0 !important',
      margin: '0 !important',
      visibility: 'hidden !important',
      opacity: '0 !important',
    },
  },
  // Esconder ícones de expansão/colapso dos grupos - seletores mais específicos
  '& .MuiDataGrid-groupingCriteriaCellToggle': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  '& .MuiDataGrid-groupingCriteriaCell .MuiIconButton-root': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  '& .MuiDataGrid-groupingCriteriaCell button': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  '& .MuiDataGrid-groupingCriteriaCell [role="button"]': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  '& .MuiDataGrid-groupingCriteriaCell svg': {
    display: 'none !important',
    visibility: 'hidden !important',
    opacity: '0 !important',
    width: '0 !important',
    height: '0 !important',
  },
  // Seletores mais genéricos para pegar todos os toggles
  '& .MuiDataGrid-cell[data-field="__row_group_by_columns_group__"] button': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  '& .MuiDataGrid-row[data-row-type="group"] button': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  '& .MuiDataGrid-row[data-row-type="group"] .MuiIconButton-root': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    minWidth: '0 !important',
    padding: '0 !important',
    margin: '0 !important',
    opacity: '0 !important',
  },
  // Esconder qualquer SVG dentro de células de grupo
  '& .MuiDataGrid-row[data-row-type="group"] svg[data-testid*="expand"], & .MuiDataGrid-row[data-row-type="group"] svg[data-testid*="collapse"]': {
    display: 'none !important',
    visibility: 'hidden !important',
    opacity: '0 !important',
    width: '0 !important',
    height: '0 !important',
  },
  '& .MuiDataGrid-aggregationColumnHeader': {
    backgroundColor: 'hsl(var(--primary)) !important',
  },
  '& .MuiDataGrid-filler': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-columnHeaders .MuiDataGrid-filler': {
    backgroundColor: 'hsl(var(--primary)) !important',
  },
  // Estilos específicos para filler de colunas congeladas
  '& .MuiDataGrid-filler--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-filler--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-filler--pinnedLeft': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-filler--pinnedRight': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-pinnedColumns .MuiDataGrid-filler': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '.dark & .MuiDataGrid-pinnedColumns .MuiDataGrid-filler': {
    backgroundColor: 'hsl(var(--background)) !important',
  },
  '& .MuiDataGrid-scrollbar--horizontal': {
    backgroundColor: 'transparent !important',
    opacity: 0.3,
  },
  '& .MuiDataGrid-scrollbar--horizontal:hover': {
    opacity: 0.7,
  },
  '& .MuiDataGrid-scrollbarContent': {
    backgroundColor: 'transparent !important',
  },
  // Esconder células vazias criadas pelo DataGrid
  '& .MuiDataGrid-cellEmpty': {
    display: 'none !important',
    width: 0,
    minWidth: 0,
    padding: 0,
    margin: 0,
  },
  // Esconder linhas de grupo vazias (linhas que aparecem entre módulos)
  '& .MuiDataGrid-row[data-row-type="group"]:has(.MuiDataGrid-cellEmpty)': {
    display: 'none !important',
    height: 0,
    minHeight: 0,
    visibility: 'hidden',
  },
  // Esconder linhas de grupo onde a primeira célula está vazia
  '& .MuiDataGrid-row[data-row-type="group"]:has([data-field="moduleName"]:empty)': {
    display: 'none !important',
    height: 0,
    minHeight: 0,
    visibility: 'hidden',
  },
  // Esconder linhas que são apenas separadores de grupo (sem conteúdo real)
  '& .MuiDataGrid-row[data-row-type="group"][aria-level="1"]:not(:has([data-field="moduleName"] *))': {
    display: 'none !important',
    height: 0,
    minHeight: 0,
    visibility: 'hidden',
  },
}));

export const DataGridContainer = styled(Box)({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'transparent',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
});

