export const ptBRLocalization = {
  // Customizações adicionais se necessário
  noRowsLabel: 'Nenhum registro encontrado',
  noResultsOverlayLabel: 'Nenhum resultado encontrado',
  errorOverlayDefaultLabel: 'Ocorreu um erro',
  
  // Toolbar
  toolbarDensity: 'Densidade',
  toolbarDensityLabel: 'Densidade',
  toolbarDensityCompact: 'Compacto',
  toolbarDensityStandard: 'Padrão',
  toolbarDensityComfortable: 'Confortável',
  toolbarColumns: 'Colunas',
  toolbarColumnsLabel: 'Selecionar colunas',
  toolbarFilters: 'Filtros',
  toolbarFiltersLabel: 'Mostrar filtros',
  toolbarFiltersTooltipHide: 'Ocultar filtros',
  toolbarFiltersTooltipShow: 'Mostrar filtros',
  toolbarExport: 'Exportar',
  toolbarExportLabel: 'Exportar',
  toolbarExportCSV: 'Baixar como CSV',
  toolbarExportPrint: 'Imprimir',
  toolbarExportExcel: 'Baixar como Excel',
  
  // Columns panel
  columnsPanelTextFieldLabel: 'Encontrar coluna',
  columnsPanelTextFieldPlaceholder: 'Título da coluna',
  columnsPanelDragIconLabel: 'Reordenar coluna',
  columnsPanelShowAllButton: 'Mostrar todas',
  columnsPanelHideAllButton: 'Ocultar todas',
  
  // Filter panel
  filterPanelAddFilter: 'Adicionar filtro',
  filterPanelDeleteIconLabel: 'Excluir',
  filterPanelOperators: 'Operadores',
  filterPanelOperatorAnd: 'E',
  filterPanelOperatorOr: 'Ou',
  filterPanelColumns: 'Colunas',
  filterPanelInputLabel: 'Valor',
  filterPanelInputPlaceholder: 'Filtrar valor',
  
  // Filter operators
  filterOperatorContains: 'contém',
  filterOperatorEquals: 'é igual a',
  filterOperatorStartsWith: 'começa com',
  filterOperatorEndsWith: 'termina com',
  filterOperatorIs: 'é',
  filterOperatorNot: 'não é',
  filterOperatorAfter: 'depois de',
  filterOperatorOnOrAfter: 'em ou depois de',
  filterOperatorBefore: 'antes de',
  filterOperatorOnOrBefore: 'em ou antes de',
  filterOperatorIsEmpty: 'está vazio',
  filterOperatorIsNotEmpty: 'não está vazio',
  filterOperatorIsAnyOf: 'é qualquer um de',
  
  // Column menu
  columnMenuLabel: 'Menu',
  columnMenuShowColumns: 'Mostrar colunas',
  columnMenuFilter: 'Filtrar',
  columnMenuHideColumn: 'Ocultar',
  columnMenuUnsort: 'Desfazer ordenação',
  columnMenuSortAsc: 'Ordenar crescente',
  columnMenuSortDesc: 'Ordenar decrescente',
  
  // Column header
  columnHeaderFiltersTooltipActive: (count: number) =>
    count !== 1 ? `${count} filtros ativos` : `${count} filtro ativo`,
  columnHeaderFiltersLabel: 'Mostrar filtros',
  columnHeaderSortIconLabel: 'Ordenar',
  
  // Rows
  footerRowSelected: (count: number) =>
    count !== 1
      ? `${count.toLocaleString()} linhas selecionadas`
      : `${count.toLocaleString()} linha selecionada`,
  
  // Total rows
  footerTotalRows: 'Total de linhas:',
  footerTotalVisibleRows: (visibleCount: number, totalCount: number) =>
    `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
  
  // Pagination - MUI DataGrid específico
  labelRowsPerPage: 'Linhas por página:',
  labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
    `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  
  // Checkbox selection
  checkboxSelectionHeaderName: 'Seleção',
  checkboxSelectionSelectAllRows: 'Selecionar todas as linhas',
  checkboxSelectionUnselectAllRows: 'Desselecionar todas as linhas',
  checkboxSelectionSelectRow: 'Selecionar linha',
  checkboxSelectionUnselectRow: 'Desselecionar linha',
  
  // Boolean cell
  booleanCellTrueLabel: 'sim',
  booleanCellFalseLabel: 'não',
  
  // Actions
  actionsCellMore: 'mais',
  
  // Pinning
  pinToLeft: 'Fixar à esquerda',
  pinToRight: 'Fixar à direita',
  unpin: 'Desafixar',
  
  // Tree Data
  treeDataGroupingHeaderName: 'Grupo',
  treeDataExpand: 'ver filhos',
  treeDataCollapse: 'ocultar filhos',
  
  // Grouping
  groupingColumnHeaderName: 'Grupo',
  groupColumn: (name: string) => `Agrupar por ${name}`,
  unGroupColumn: (name: string) => `Parar de agrupar por ${name}`,
  
  // Master/detail
  detailPanelToggle: 'Alternar painel de detalhes',
  expandDetailPanel: 'Expandir',
  collapseDetailPanel: 'Recolher',
  
  // Row reordering
  rowReorderingHeaderName: 'Reordenação de linhas',
  
  // Aggregation
  aggregationMenuItemHeader: 'Agregação',
  aggregationFunctionLabelSum: 'soma',
  aggregationFunctionLabelAvg: 'média',
  aggregationFunctionLabelMin: 'mín',
  aggregationFunctionLabelMax: 'máx',
  aggregationFunctionLabelSize: 'tamanho',
};

