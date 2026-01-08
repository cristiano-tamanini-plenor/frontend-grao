import { useState, useMemo, useRef, useCallback } from 'react';
import { Upload, FileText, Trash2, Eye, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stack } from '@/components/Stack';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import {
  useFreightImports,
  useUploadFreightImport,
  useDeleteFreightImport,
  useFreightImport,
} from './hooks/useFreightImports';
import type { FreightImport, FreightImportItem } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImportacaoFretes() {
  const { currentCompany } = useCompany();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null);
  const [deleteImportId, setDeleteImportId] = useState<number | null>(null);

  const { data: imports, isLoading } = useFreightImports();
  const { data: importDetails } = useFreightImport(selectedImportId);
  const uploadMutation = useUploadFreightImport();
  const deleteMutation = useDeleteFreightImport();

  const validateFile = (file: File): string | null => {
    // Validar extensão
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Por favor, selecione um arquivo CSV.';
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Arquivo muito grande. Máximo ${MAX_FILE_SIZE_MB}MB.`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSuccessMessage(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  /**
   * Remove o BOM (Byte Order Mark) UTF-8 do arquivo se presente
   */
  const removeBOM = async (file: File): Promise<File> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Verifica se tem BOM UTF-8 (EF BB BF)
    if (uint8Array.length >= 3 && uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
      // Remove os primeiros 3 bytes (BOM)
      const withoutBOM = uint8Array.slice(3);
      return new File([withoutBOM], file.name, { type: file.type });
    }
    
    return file;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo CSV');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Remove BOM se presente antes do upload
      const fileWithoutBOM = await removeBOM(selectedFile);
      const result = await uploadMutation.mutateAsync(fileWithoutBOM);
      setSuccessMessage(result.message || 'Importação realizada com sucesso!');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        setIsImportModalOpen(false);
        setSuccessMessage(null);
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao fazer upload do arquivo');
    }
  };

  const handleCloseModal = () => {
    setIsImportModalOpen(false);
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteImportId) return;

    try {
      await deleteMutation.mutateAsync(deleteImportId);
      setDeleteImportId(null);
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'import_date',
        header: 'Data de Importação',
        accessorKey: 'import_date',
        width: 180,
        cell: (value: string) => {
          try {
            return format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
          } catch {
            return value;
          }
        },
      },
      {
        key: 'items_count',
        header: 'Itens',
        accessorKey: 'items',
        width: 100,
        cell: (value: FreightImportItem[] | undefined, row: FreightImport) => {
          const total = value?.length || 0;
          const progress = row.import_progress;
          if (progress) {
            return (
              <div className="flex flex-col">
                <span>{total}</span>
                {progress.percentage < 100 && (
                  <span className="text-xs text-muted-foreground">
                    {progress.imported}/{total} importados
                  </span>
                )}
              </div>
            );
          }
          return <span>{total}</span>;
        },
      },
      {
        key: 'import_progress',
        header: 'Progresso',
        accessorKey: 'import_progress',
        width: 150,
        cell: (value: FreightImport['import_progress'], row: FreightImport) => {
          if (!value) return <span className="text-muted-foreground">-</span>;
          
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${value.percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {value.percentage}%
              </span>
            </div>
          );
        },
      },
      {
        key: 'file_url',
        header: 'Arquivo',
        accessorKey: 'file_url',
        flex: true,
        cell: (value: string, row: FreightImport) => {
          const fileName = value.split('/').pop() || 'arquivo.csv';
          return (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate">{fileName}</span>
            </div>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        accessorKey: 'status',
        width: 200,
        cell: (value: string) => {
          const isImported = value === 'imported';
          return (
            <Badge variant={isImported ? 'default' : 'secondary'}>
              {isImported ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Importado
                </>
              ) : (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Pendente
                </>
              )}
            </Badge>
          );
        },
      },
      {
        key: 'actions',
        header: 'Ações',
        width: 150,
        cell: (_: any, row: FreightImport) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImportId(row.id)}
              className="h-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteImportId(row.id)}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (!currentCompany) {
    return (
      <Stack>
        <ListHeader icon={Upload} title="Importação de Fretes" canCreate={false} />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhuma empresa selecionada</AlertTitle>
          <AlertDescription>
            Selecione uma empresa para gerenciar as importações de fretes.
          </AlertDescription>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack>
      {/* Header */}
      <ListHeader icon={Upload} title="Importação de Fretes" canCreate={false}>
        <Button
          onClick={() => setIsImportModalOpen(true)}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
      </ListHeader>

      {/* DataGrid */}
      <DataGrid
        id="freight-imports-grid"
        data={imports || []}
        columns={columns}
        pagination={true}
        pageSize={20}
        enableRowSelection={false}
        loading={isLoading}
        emptyMessage="Nenhuma importação encontrada. Clique em 'Importar CSV' para começar."
        height="100%"
        searchable={true}
        exportable={true}
        columnConfigurable={true}
      />

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedImportId} onOpenChange={(open) => !open && setSelectedImportId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Importação #{selectedImportId}</DialogTitle>
            <DialogDescription>
              {importDetails && (
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Data:</strong>{' '}
                      {format(new Date(importDetails.import_date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <Badge variant={importDetails.status === 'imported' ? 'default' : 'secondary'}>
                        {importDetails.status === 'imported' ? 'Importado' : 'Pendente'}
                      </Badge>
                    </div>
                    <div>
                      <strong>Total de itens:</strong> {importDetails.items?.length || 0}
                    </div>
                    {importDetails.import_progress && (
                      <div>
                        <strong>Progresso:</strong>{' '}
                        <span className="text-sm">
                          {importDetails.import_progress.imported} de {importDetails.import_progress.total} importados
                          {' '}({importDetails.import_progress.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                  {importDetails.import_progress && importDetails.import_progress.percentage < 100 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progresso de importação no Marvee</span>
                        <span className="text-muted-foreground">
                          {importDetails.import_progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${importDetails.import_progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {importDetails && importDetails.items && importDetails.items.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-3">Itens Importados</h3>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">ID Sislogica</th>
                        <th className="px-3 py-2 text-left">Cliente</th>
                        <th className="px-3 py-2 text-left">Número CTE</th>
                        <th className="px-3 py-2 text-left">Status CT-e</th>
                        <th className="px-3 py-2 text-left">Status Importação</th>
                        <th className="px-3 py-2 text-left">ID Marvee</th>
                        <th className="px-3 py-2 text-left">Valor CTE</th>
                        <th className="px-3 py-2 text-left">Data Emissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importDetails.items.map((item) => {
                        // Compatibilidade: usar cte_status se disponível, senão usar status legado
                        const cteStatus = item.cte_status || item.status || '-';
                        const importStatus = item.import_status || 'pending';
                        
                        return (
                          <tr key={item.id} className="border-t hover:bg-muted/50">
                            <td className="px-3 py-2">{item.sislogica_id}</td>
                            <td className="px-3 py-2">{item.customer || '-'}</td>
                            <td className="px-3 py-2">{item.cte_number || '-'}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline">{cteStatus}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <Badge variant={importStatus === 'imported' ? 'default' : 'secondary'}>
                                {importStatus === 'imported' ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Importado
                                  </>
                                ) : (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Pendente
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">
                              {item.marvee_id || (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.cte_value
                                ? new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }).format(item.cte_value)
                                : '-'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.generation_date
                                ? format(new Date(item.generation_date), 'dd/MM/yyyy', {
                                    locale: ptBR,
                                  })
                                : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Importação */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        } else {
          setIsImportModalOpen(true);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar CSV de Fretes</DialogTitle>
            <DialogDescription>
              Selecione ou arraste um arquivo CSV para importar os dados de fretes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Informações sobre a importação</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Arquivo CSV com tamanho máximo de {MAX_FILE_SIZE_MB}MB</li>
                  <li>O arquivo deve conter todas as colunas obrigatórias na primeira linha</li>
                  <li>Itens com IDs duplicados serão ignorados automaticamente</li>
                  <li>O campo `id` (sislogica_id) é obrigatório e não pode duplicar</li>
                </ul>
              </AlertDescription>
            </Alert>
            {/* Área de Drag and Drop */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50',
                selectedFile && 'border-primary bg-primary/5'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Arraste o arquivo aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSV até {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Selecionar arquivo
                  </Button>
                </div>
              )}
            </div>

            {/* Mensagens de Erro */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Mensagens de Sucesso */}
            {successMessage && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={uploadMutation.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteImportId} onOpenChange={(open) => !open && setDeleteImportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta importação? Esta ação não pode ser desfeita e
              removerá todos os itens associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Stack>
  );
}
