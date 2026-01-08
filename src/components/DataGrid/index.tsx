import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GridColDef, GridRowParams, GridSortModel, GridRowSelectionModel, GridCallbackDetails, GridRowId, useGridApiRef, useKeepGroupedColumnsHidden } from '@mui/x-data-grid-premium';
import { DataGridProps } from './types';
import { StyledDataGrid, DataGridContainer } from './style';
import { ptBRLocalization } from './localization';
import { useTheme } from '../../theme';

const DataGridPremiumComponent: React.FC<DataGridProps> = ({
  id,
  data,
  columns,
  pagination = true,
  pageSize: initialPageSize = 20,
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  onRowSelect,
  enableRowSelection = false,
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
  height = '500px',
  searchable = true,
  exportable = true,
  columnConfigurable = true,
  configurable = true,
  enableRowGrouping = false,
  enableAggregation = false,
  enableExcelExport = true,
  rowGroupingModel = [],
}) => {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [internalSelectedRowId, setInternalSelectedRowId] = useState<GridRowId | null>(null);
  const apiRef = useGridApiRef();
  const { isDark } = useTheme();

  // Padrão controlled/uncontrolled: usa selectedRowId prop se fornecido, senão usa estado interno
  const currentSelectedRowId = selectedRowId !== undefined ? selectedRowId : internalSelectedRowId;

  // Preparar initialState base
  const baseInitialState = useMemo(() => {
    const state: any = {
      pinnedColumns: {
        left: columns.filter(col => col.freezeable).map(col => col.accessorKey || col.key),
        right: columns.filter(col => col.freezeableRight).map(col => col.accessorKey || col.key),
      },
      rowGrouping: {
        model: rowGroupingModel,
      },
      aggregation: {
        model: {},
      },
    };
    // Adicionar expanded apenas se houver agrupamento
    if (enableRowGrouping && rowGroupingModel.length > 0) {
      state.expanded = true;
      // Esconder a coluna de agrupamento automática
      state.columns = {
        columnVisibilityModel: {
          __row_group_by_columns_group__: false,
        },
      };
    }
    return state;
  }, [columns, rowGroupingModel, enableRowGrouping]);

  // Usar useKeepGroupedColumnsHidden - hook sempre deve ser chamado
  // O hook gerencia automaticamente a visibilidade das colunas agrupadas
  const hiddenColumnsResult = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: baseInitialState,
  });

  // Garantir que a coluna original usada para agrupamento permaneça visível
  let initialStateWithHiddenColumns = (enableRowGrouping && rowGroupingModel.length > 0)
    ? hiddenColumnsResult
    : baseInitialState;

  // Se tiver agrupamento, garantir que:
  // 1. A coluna especial de agrupamento seja escondida
  // 2. A coluna original (moduleName) permaneça visível
  if (enableRowGrouping && rowGroupingModel.length > 0) {
    if (!initialStateWithHiddenColumns.columns) {
      initialStateWithHiddenColumns.columns = { columnVisibilityModel: {} };
    }
    if (!initialStateWithHiddenColumns.columns.columnVisibilityModel) {
      initialStateWithHiddenColumns.columns.columnVisibilityModel = {};
    }
    
    // Esconder apenas a coluna especial de agrupamento
    initialStateWithHiddenColumns.columns.columnVisibilityModel.__row_group_by_columns_group__ = false;
    
    // Garantir que as colunas originais usadas para agrupamento permaneçam visíveis
    rowGroupingModel.forEach((field) => {
      initialStateWithHiddenColumns.columns.columnVisibilityModel[field] = true;
    });
  }

  // Converter colunas do formato atual para o formato do MUI DataGrid
  const muiColumns: GridColDef[] = useMemo(() => {
    return columns.map((column) => {
      const colDef: GridColDef = {
        field: column.accessorKey || column.key,
        headerName: column.header,
        width: column.width || 150,
        minWidth: column.minWidth || 50,
        sortable: column.sortable !== false,
        hideable: column.hideable !== false,
        resizable: column.resizable !== false,
        align: column.cellAlign === 'center' ? 'center' : 
               column.cellAlign === 'right' ? 'right' : 'left',
        headerAlign: column.headerAlign === 'center' ? 'center' : 
                     column.headerAlign === 'right' ? 'right' : 'left',
        renderCell: column.cell ? (params) => {
          const { value, row, id } = params;
          return column.cell!(value, row, parseInt(id.toString()));
        } : undefined,
        // Recursos Premium - agrupamento e agregação
        groupable: enableRowGrouping,
        aggregable: enableAggregation,
      };

      // Se a coluna tem flex, não define maxWidth para permitir expansão ilimitada
      if (column.flex) {
        colDef.flex = 1;
        // Não define maxWidth quando flex está ativo, permitindo expansão total
        if (column.maxWidth !== undefined) {
          colDef.maxWidth = column.maxWidth;
        }
        // Remove width fixo quando flex está ativo
        delete colDef.width;
      } else {
        // Para colunas sem flex, aplica maxWidth padrão se não especificado
        colDef.maxWidth = column.maxWidth || 500;
      }

      return colDef;
    });
  }, [columns, enableRowGrouping, enableAggregation]);

  // Converter dados para incluir id único se não existir
  const rowsWithId = useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      id: row.id || `row-${index}`,
    }));
  }, [data]);

  // Handlers para eventos
  const handleRowClick = useCallback((params: GridRowParams) => {
    // Atualiza seleção interna automaticamente (somente se não for controlled)
    if (selectedRowId === undefined) {
      setInternalSelectedRowId(params.id);
    }
    
    // Chama callback customizado se fornecido
    if (onRowClick) {
      onRowClick(params.row, params.id);
    }
  }, [onRowClick, selectedRowId]);

  const handleRowDoubleClick = useCallback((params: GridRowParams) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(params.row, params.id);
    }
  }, [onRowDoubleClick]);

  const handleRowSelectionModelChange = useCallback((newSelection: GridRowSelectionModel, details: GridCallbackDetails) => {
    if (onRowSelect && Array.isArray(newSelection) && newSelection.length > 0) {
      const selectedRow = rowsWithId.find(row => row.id === newSelection[0]);
      onRowSelect(newSelection[0], selectedRow);
    }
  }, [onRowSelect, rowsWithId]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
  }, []);

  // Função para aplicar classes CSS personalizadas nas linhas
  const getRowClassName = useCallback((params: any) => {
    return params.id === currentSelectedRowId ? 'Mui-selected' : '';
  }, [currentSelectedRowId]);

  // Aplicar estilos diretamente nos elementos DOM para garantir que funcionem no modo dark
  useEffect(() => {
    if (!isDark) return;

    const applyDarkStyles = () => {
      const backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim();
      
      if (!backgroundColor) return;

      const bgColor = `hsl(${backgroundColor})`;
      
      // Aplicar estilos em todas as células congeladas (esquerda e direita)
      const pinnedLeftCells = document.querySelectorAll('.MuiDataGrid-cell--pinnedLeft');
      pinnedLeftCells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.setProperty('background-color', bgColor, 'important');
      });

      const pinnedRightCells = document.querySelectorAll('.MuiDataGrid-cell--pinnedRight');
      pinnedRightCells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.setProperty('background-color', bgColor, 'important');
      });

      // Aplicar estilos no container de colunas congeladas
      const pinnedColumns = document.querySelectorAll('.MuiDataGrid-pinnedColumns');
      pinnedColumns.forEach((container) => {
        const containerEl = container as HTMLElement;
        containerEl.style.setProperty('background-color', bgColor, 'important');
        const cells = container.querySelectorAll('.MuiDataGrid-cell');
        cells.forEach((cell) => {
          const cellEl = cell as HTMLElement;
          cellEl.style.setProperty('background-color', bgColor, 'important');
        });
      });

      // Aplicar estilos nos fillers de colunas congeladas (esquerda e direita)
      const pinnedLeftFillers = document.querySelectorAll('.MuiDataGrid-filler--pinnedLeft');
      pinnedLeftFillers.forEach((filler) => {
        const fillerEl = filler as HTMLElement;
        fillerEl.style.setProperty('background-color', bgColor, 'important');
      });

      const pinnedRightFillers = document.querySelectorAll('.MuiDataGrid-filler--pinnedRight');
      pinnedRightFillers.forEach((filler) => {
        const fillerEl = filler as HTMLElement;
        fillerEl.style.setProperty('background-color', bgColor, 'important');
      });

      // Aplicar estilos em fillers dentro de colunas congeladas
      const pinnedColumnsFillers = document.querySelectorAll('.MuiDataGrid-pinnedColumns .MuiDataGrid-filler');
      pinnedColumnsFillers.forEach((filler) => {
        const fillerEl = filler as HTMLElement;
        fillerEl.style.setProperty('background-color', bgColor, 'important');
      });

      // Aplicar também em linhas hover e selecionadas (esquerda e direita)
      const selectedLeftRows = document.querySelectorAll('.MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedLeft');
      selectedLeftRows.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.setProperty('background-color', bgColor, 'important');
      });

      const selectedRightRows = document.querySelectorAll('.MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedRight');
      selectedRightRows.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.setProperty('background-color', bgColor, 'important');
      });

      const hoveredLeftRows = document.querySelectorAll('.MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft');
      hoveredLeftRows.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.setProperty('background-color', bgColor, 'important');
      });

      const hoveredRightRows = document.querySelectorAll('.MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight');
      hoveredRightRows.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.setProperty('background-color', bgColor, 'important');
      });
    };

    // Aplicar imediatamente
    const timeoutId = setTimeout(applyDarkStyles, 0);

    // Observar mudanças no DOM (quando novas linhas são renderizadas)
    const observer = new MutationObserver(() => {
      setTimeout(applyDarkStyles, 0);
    });
    
    // Tentar encontrar o container do grid
    const gridContainer = id 
      ? document.querySelector(`#${id}`)
      : document.querySelector('.MuiDataGrid-root');
    
    if (gridContainer) {
      observer.observe(gridContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Aplicar periodicamente para garantir (fallback)
    const interval = setInterval(applyDarkStyles, 200);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isDark, id, rowsWithId]);

  return (
    <DataGridContainer id={id} className="flex-1 min-h-0 overflow-hidden">
      <StyledDataGrid
        rows={rowsWithId}
        columns={muiColumns}
        loading={loading}
        rowHeight={36}
        autoHeight={false}
        apiRef={apiRef}
        initialState={initialStateWithHiddenColumns}
        pagination={pagination}
        paginationMode="client"
        sortingMode="client"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        getRowClassName={getRowClassName}
        rowSelectionModel={
          enableRowSelection && selectedRowId
            ? { type: 'include', ids: new Set([selectedRowId]) }
            : { type: 'include', ids: new Set() }
        }
        onRowSelectionModelChange={handleRowSelectionModelChange}
        checkboxSelection={enableRowSelection}
        disableRowSelectionOnClick={!enableRowSelection}
        disableColumnMenu={!columnConfigurable}
        disableColumnFilter={!searchable}
        disableColumnSelector={!configurable}
        rowGroupingColumnMode="single"
        aggregationFunctions={{}}
        localeText={ptBRLocalization}
        defaultGroupingExpansionDepth={-1}
        disableChildrenFiltering={true}
        disableChildrenSorting={true}
        hideFooter={false}
        disableRowGrouping={false}
        sx={{
          // Estilos inline para garantir que os toggles sejam escondidos
          '& .MuiDataGrid-groupingCriteriaCell > *:first-of-type': {
            display: 'none !important',
            width: '0 !important',
            minWidth: '0 !important',
            padding: '0 !important',
            margin: '0 !important',
            visibility: 'hidden !important',
            opacity: '0 !important',
          },
          // Estilos para colunas congeladas - sempre aplicar
          '& .MuiDataGrid-cell--pinnedLeft': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-cell--pinnedRight': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-pinnedColumns': {
            backgroundColor: 'hsl(var(--background)) !important',
            '& .MuiDataGrid-cell': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-cell--pinnedLeft': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-cell--pinnedRight': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
          },
          '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedLeft': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedRight': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedLeft': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          '& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedRight': {
            backgroundColor: 'hsl(var(--background)) !important',
          },
          // Estilos específicos para modo dark com maior especificidade
          ...(isDark && {
            '& .MuiDataGrid-cell--pinnedLeft': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-cell--pinnedRight': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-pinnedColumns': {
              backgroundColor: 'hsl(var(--background)) !important',
              '& .MuiDataGrid-cell': {
                backgroundColor: 'hsl(var(--background)) !important',
              },
              '& .MuiDataGrid-cell--pinnedLeft': {
                backgroundColor: 'hsl(var(--background)) !important',
              },
              '& .MuiDataGrid-cell--pinnedRight': {
                backgroundColor: 'hsl(var(--background)) !important',
              },
              '& .MuiDataGrid-filler': {
                backgroundColor: 'hsl(var(--background)) !important',
              },
            },
            '& .MuiDataGrid-filler--pinnedLeft': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-filler--pinnedRight': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedLeft': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell--pinnedRight': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedLeft': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
            '& .MuiDataGrid-row.Mui-selected:hover .MuiDataGrid-cell--pinnedRight': {
              backgroundColor: 'hsl(var(--background)) !important',
            },
          }),
        }}
      />
    </DataGridContainer>
  );
};

export default DataGridPremiumComponent;
