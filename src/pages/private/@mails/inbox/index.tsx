import { Mail, Paperclip, RefreshCw } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { useMemo, useState } from 'react';
import { useInbox, useEmail, useSyncEmails } from './hooks/useEmails';
import type { Email } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function Inbox() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca emails recebidos
  const { data: emails = [], isLoading } = useInbox();

  // Hook para sincronizar emails
  const { mutate: syncEmails, isPending: isSyncing } = useSyncEmails();

  // Busca email completo quando um email é selecionado
  const { data: fullEmail, isLoading: isLoadingFullEmail } = useEmail(
    selectedEmail?.id ?? null
  );

  // Handler para clique na linha
  const handleRowClick = (row: Email) => {
    setSelectedEmail(row);
    setIsModalOpen(true);
  };

  // Formata data e hora
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  // Formata data apenas
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  // Formata endereço de email para exibição
  const formatEmailAddress = (address: { name: string; address: string }) => {
    if (address.name && address.name.trim()) {
      return `${address.name} <${address.address}>`;
    }
    return address.address;
  };

  // Formata lista de destinatários
  const formatToAddresses = (addresses: Array<{ name: string; address: string }>) => {
    return addresses.map(formatEmailAddress).join(', ');
  };

  const columns = useMemo(
    () => [
      {
        key: 'from_address',
        header: 'De',
        accessorKey: 'from_address',
        minWidth: 250,
        flex: true,
        cell: (value: { name: string; address: string }) => (
          <div className="flex flex-col">
            <span className="text-xs font-medium">
              {value.name || value.address}
            </span>
            {value.name && (
              <span className="text-xs text-muted-foreground">
                {value.address}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'subject',
        header: 'Assunto',
        accessorKey: 'subject',
        minWidth: 300,
        flex: true,
        cell: (value: string | null, row: Email) => (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">
              {value || '(Sem assunto)'}
            </span>
            {row.snippet && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {row.snippet}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'received_at',
        header: 'Data',
        accessorKey: 'received_at',
        width: 180,
        cell: (value: string) => (
          <span className="text-xs">{formatDate(value)}</span>
        ),
      },
      {
        key: 'has_attachments',
        header: 'Anexos',
        accessorKey: 'has_attachments',
        width: 100,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: boolean) => {
          if (value) {
            return (
              <div className="flex justify-center">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }
          return '—';
        },
      },
      {
        key: 'ai_processed',
        header: 'Processado',
        accessorKey: 'ai_processed',
        width: 120,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: boolean) => {
          if (value) {
            return (
              <span className="px-2 py-1 rounded text-xs font-medium text-green-600 bg-green-50">
                Sim
              </span>
            );
          }
          return (
            <span className="px-2 py-1 rounded text-xs font-medium text-gray-600 bg-gray-50">
              Não
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader icon={Mail} title="Caixa de Entrada" canCreate={false}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncEmails()}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </ListHeader>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="emails-inbox-grid"
          data={emails}
          columns={columns}
          pagination={true}
          pageSize={20}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum email encontrado"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Modal de Visualização de Email */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedEmail?.subject || '(Sem assunto)'}
            </DialogTitle>
          </DialogHeader>

          {isLoadingFullEmail ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">
                Carregando email...
              </span>
            </div>
          ) : fullEmail ? (
            <div className="space-y-6 py-4">
              {/* Informações do Email */}
              <div className="space-y-3 border-b pb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    De
                  </p>
                  <p className="text-sm">{formatEmailAddress(fullEmail.from_address)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Para
                  </p>
                  <p className="text-sm">{formatToAddresses(fullEmail.to_address)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Data
                    </p>
                    <p className="text-sm">
                      {formatDateTime(fullEmail.received_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Pasta
                    </p>
                    <p className="text-sm">{fullEmail.folder}</p>
                  </div>
                </div>
                {fullEmail.has_attachments && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Anexos
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Este email contém anexos
                    </p>
                  </div>
                )}
              </div>

              {/* Corpo do Email */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Mensagem
                </p>
                {fullEmail.body_html ? (
                  <div
                    className="prose prose-sm max-w-none text-sm border rounded-lg p-4 bg-muted/50"
                    dangerouslySetInnerHTML={{ __html: fullEmail.body_html }}
                  />
                ) : fullEmail.body_text ? (
                  <div className="text-sm whitespace-pre-wrap border rounded-lg p-4 bg-muted/50">
                    {fullEmail.body_text}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Este email não possui conteúdo.
                  </p>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Informações Adicionais
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Processado por IA: </span>
                    <span>
                      {fullEmail.ai_processed ? (
                        <span className="text-green-600 font-medium">Sim</span>
                      ) : (
                        <span className="text-gray-600">Não</span>
                      )}
                    </span>
                  </div>
                  {fullEmail.accountConfig && (
                    <div>
                      <span className="text-muted-foreground">Conta: </span>
                      <span>{fullEmail.accountConfig.smtp_user || fullEmail.accountConfig.smtp_host}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedEmail ? (
            // Fallback: mostra dados básicos se não conseguir carregar o email completo
            <div className="space-y-6 py-4">
              <div className="space-y-3 border-b pb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    De
                  </p>
                  <p className="text-sm">
                    {formatEmailAddress(selectedEmail.from_address)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Para
                  </p>
                  <p className="text-sm">
                    {formatToAddresses(selectedEmail.to_address)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Data
                  </p>
                  <p className="text-sm">
                    {formatDateTime(selectedEmail.received_at)}
                  </p>
                </div>
              </div>
              {selectedEmail.snippet && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Resumo
                  </p>
                  <p className="text-sm">{selectedEmail.snippet}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

