import React, { useState, useMemo, useCallback } from 'react';
import { DataGridPro, GridColDef, GridRowParams, GridSortModel, GridRowSelectionModel, GridCallbackDetails } from '@mui/x-data-grid-pro';
import { Box } from '@mui/material';

// Interfaces compatíveis com o DataGrid atual
interface Column {
  key: string;
  header: string;
  accessorKey?: string;
  cell?: (value: any, row: any, index?: number) => React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  headerAlign?: 'left' | 'center' | 'right';
  cellAlign?: 'left' | 'center' | 'right';
  sortable?: boolean;
  hideable?: boolean;
  resizable?: boolean;
  freezeable?: boolean;
  flex?: boolean;
}

interface DataGridProProps {
  id: string;
  data: any[];
  columns: Column[];
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: any, rowId: any) => void;
  onRowDoubleClick?: (row: any, rowId: any) => void;
  selectedRowId?: any;
  onRowSelect?: (rowId: any, row?: any) => void;
  enableRowSelection?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  height?: string | number;
  searchable?: boolean;
  exportable?: boolean;
  columnConfigurable?: boolean;
  configurable?: boolean;
}

const DataGridProComponent: React.FC<DataGridProProps> = ({
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
}) => {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Converter colunas do formato atual para o formato do MUI DataGrid
  const muiColumns: GridColDef[] = useMemo(() => {
    return columns.map((column) => ({
      field: column.accessorKey || column.key,
      headerName: column.header,
      width: column.width || 150,
      minWidth: column.minWidth || 50,
      maxWidth: column.maxWidth || 500,
      sortable: column.sortable !== false,
      hideable: column.hideable !== false,
      resizable: column.resizable !== false,
      flex: column.flex ? 1 : undefined,
      align: column.cellAlign === 'center' ? 'center' : 
             column.cellAlign === 'right' ? 'right' : 'left',
      headerAlign: column.headerAlign === 'center' ? 'center' : 
                   column.headerAlign === 'right' ? 'right' : 'left',
      renderCell: column.cell ? (params) => {
        const { value, row, id } = params;
        return column.cell!(value, row, parseInt(id.toString()));
      } : undefined,
    }));
  }, [columns]);

  // Converter dados para incluir id único se não existir
  const rowsWithId = useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      id: row.id || `row-${index}`,
    }));
  }, [data]);

  // Handlers para eventos
  const handleRowClick = useCallback((params: GridRowParams) => {
    if (onRowClick) {
      onRowClick(params.row, params.id);
    }
  }, [onRowClick]);

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

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGridPro
        rows={rowsWithId}
        columns={muiColumns}
        loading={loading}
        rowHeight={36}
        initialState={{
          pinnedColumns: {
            left: columns.filter(col => col.freezeable).map(col => col.key),
          },
        }}
        pagination={pagination}
        paginationMode="client"
        sortingMode="client"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        rowSelectionModel={selectedRowId ? [selectedRowId] as any : undefined}
        onRowSelectionModelChange={handleRowSelectionModelChange}
        checkboxSelection={enableRowSelection}
        disableRowSelectionOnClick={!enableRowSelection}
        disableColumnMenu={!columnConfigurable}
        disableColumnFilter={!searchable}
        disableColumnSelector={!configurable}
        sx={{
          height: '100%',
          width: '100%',
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
            height: '100% !important',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid hsl(var(--border))',
            borderRight: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            fontSize: 'calc(1rem - 4px)',
            display: 'flex',
            alignItems: 'center',
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderBottom: '1px solid hsl(var(--border))',
            minHeight: '36px !important',
            maxHeight: '36px !important',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            height: '36px !important',
            minHeight: '36px !important',
            maxHeight: '36px !important',
            '&:hover': {
              backgroundColor: 'hsl(var(--primary-hover))',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'hsl(var(--primary-foreground))',
            fontWeight: 600,
          },
          '& .MuiDataGrid-sortIcon': {
            color: 'hsl(var(--primary-foreground))',
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'hsl(var(--accent))',
            },
            '&.Mui-selected': {
              backgroundColor: 'hsl(var(--accent))',
              '&:hover': {
                backgroundColor: 'hsl(var(--accent))',
              },
            },
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
        }}
      />
    </Box>
  );
};

export default DataGridProComponent;