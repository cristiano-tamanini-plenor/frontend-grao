import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ServerPaginationProps {
  /** Página atual (0-indexed) */
  page: number;
  /** Tamanho da página atual */
  pageSize: number;
  /** Total de registros */
  totalCount: number;
  /** Se há mais páginas */
  hasMore: boolean;
  /** Quantidade de itens na página atual */
  currentPageItems: number;
  /** Callback quando a página muda */
  onPageChange: (page: number) => void;
  /** Callback quando o tamanho da página muda */
  onPageSizeChange: (pageSize: number) => void;
  /** Tamanho máximo permitido por página */
  maxPageSize?: number;
  /** Opções de tamanho de página disponíveis */
  pageSizeOptions?: number[];
  /** Se está carregando */
  loading?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

export function ServerPagination({
  page,
  pageSize,
  totalCount,
  hasMore,
  currentPageItems,
  onPageChange,
  onPageSizeChange,
  maxPageSize = 150,
  pageSizeOptions = [10, 20, 50, 100, 150],
  loading = false,
  className = '',
}: ServerPaginationProps) {
  const [pageInput, setPageInput] = useState(String(page + 1));
  const totalPages = Math.ceil(totalCount / pageSize);

  // Sincroniza o input quando a página muda externamente
  useEffect(() => {
    setPageInput(String(page + 1));
  }, [page]);

  // Filtra opções de tamanho de página baseado no máximo
  const availablePageSizeOptions = pageSizeOptions.filter(
    (size) => size <= maxPageSize
  );

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
  };

  const handlePageInputBlur = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (
      !isNaN(pageNumber) &&
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== page + 1
    ) {
      onPageChange(pageNumber - 1);
    } else {
      // Se inválido, restaura o valor atual
      setPageInput(String(page + 1));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
    }
  };

  const goToFirstPage = () => {
    onPageChange(0);
  };

  const goToPreviousPage = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      onPageChange(page + 1);
    }
  };

  const goToLastPage = () => {
    if (totalPages > 0) {
      onPageChange(totalPages - 1);
    }
  };

  if (totalCount === 0) {
    return null;
  }

  const startItem = page * pageSize + 1;
  const endItem = page * pageSize + currentPageItems;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-t bg-background text-sm ${className}`}
    >
      {/* Informações de paginação */}
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          Mostrando {startItem} até {endItem} de {totalCount} registros
        </span>

        {/* Seletor de tamanho de página */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Itens por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const newPageSize = parseInt(value, 10);
              onPageSizeChange(newPageSize);
              // Reset para primeira página quando mudar o tamanho
              onPageChange(0);
            }}
            disabled={loading}
          >
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirstPage}
          disabled={page === 0 || loading}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-2" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={page === 0 || loading}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Página</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={pageInput}
            onChange={(e) => handlePageInputChange(e.target.value)}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            disabled={loading}
            className="w-16 h-8 text-center"
          />
          <span className="text-muted-foreground">de {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={!hasMore || loading}
          className="h-8"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToLastPage}
          disabled={!hasMore || loading || page === totalPages - 1}
          className="h-8"
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-2" />
        </Button>
      </div>
    </div>
  );
}

