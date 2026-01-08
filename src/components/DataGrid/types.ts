import { DataGridPremiumProps, GridValidRowModel } from '@mui/x-data-grid-premium';
import React from 'react';

// Interfaces compatíveis com o DataGrid atual
export interface Column {
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
  freezeableRight?: boolean;
  flex?: boolean;
}

export interface DataGridProps<R extends GridValidRowModel = any> {
  id: string;
  data: R[];
  columns: Column[];
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: R, rowId: any) => void;
  onRowDoubleClick?: (row: R, rowId: any) => void;
  selectedRowId?: any;
  onRowSelect?: (rowId: any, row?: R) => void;
  enableRowSelection?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  height?: string | number;
  searchable?: boolean;
  exportable?: boolean;
  columnConfigurable?: boolean;
  configurable?: boolean;
  // Recursos Premium específicos
  enableRowGrouping?: boolean;
  enableAggregation?: boolean;
  enableExcelExport?: boolean;
  disableSaveGridState?: boolean;
  saveGridStateIdentifier?: string;
  rowGroupingModel?: string[]; // Campos para agrupar automaticamente
}

export interface TSADataGridProps<R extends GridValidRowModel = any> 
  extends Omit<DataGridPremiumProps, 'rows' | 'columns' | 'onRowClick' | 'onRowDoubleClick'>, Partial<DataGridProps<R>> {}

