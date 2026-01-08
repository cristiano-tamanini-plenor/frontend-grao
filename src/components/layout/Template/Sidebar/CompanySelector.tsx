import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, Settings, Plus, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCompany } from "@/pages/private/company/hooks/useCompany";
import { CompanyFormModal } from "@/pages/private/company/form";
import { EmailConfigModal } from "@/pages/private/company/components/EmailConfigModal";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { buildCompanyAvatarUrl } from "@/pages/private/company/services/companies.service";

export function CompanySelector() {
  const { currentCompany, companies, setCompany, refreshCompanies } = useCompany();
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEmailConfigModalOpen, setIsEmailConfigModalOpen] = useState(false);
  const navigate = useNavigate();

  // Permissões
  const canCreateCompany = role === 'OWNER' || role === 'MEMBER';
  const canEditCompany = role !== 'GUEST';

  const handleCompanyChange = (companyId: string) => {
    // Só redireciona se for uma empresa diferente da atual
    if (currentCompany?.id !== companyId) {
      // Limpar erros de imagem ao mudar de empresa
      setImageErrors(new Set());
      setCompany(companyId);
      // Redirecionar para splash para mostrar o efeito de troca de empresa
      navigate("/splash", { replace: true });
    }
  };

  const handleImageError = (companyId: string) => {
    setImageErrors((prev) => new Set(prev).add(companyId));
  };

  const hasValidAvatar = (company: typeof currentCompany) => {
    return company?.avatar_url && company.avatar_url.trim() !== "" && !imageErrors.has(company.id);
  };

  const handleEditCompany = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    await refreshCompanies();
    setIsEditModalOpen(false);
  };

  const handleCreateCompany = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = async () => {
    await refreshCompanies();
    setIsCreateModalOpen(false);
  };

  // Limpar erros de imagem quando a empresa atual mudar
  useEffect(() => {
    if (currentCompany?.id) {
      setImageErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentCompany.id);
        return newSet;
      });
    }
  }, [currentCompany?.id]);

  const filteredCompanies = companies.filter((company) => {
    const searchLower = searchQuery.toLowerCase();
    const name = company.name.toLowerCase();
    const nickname = (company.system_nickname || "").toLowerCase();
    return name.includes(searchLower) || nickname.includes(searchLower);
  });

  if (!currentCompany) return null;

  return (
    <TooltipProvider>
      <DropdownMenu onOpenChange={(open) => { if (!open) setSearchQuery(""); }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center justify-center h-10 w-10 rounded-lg overflow-hidden hover:opacity-80 transition-all duration-200 bg-primary/10 border border-sidebar-border/50"
                aria-label={currentCompany.system_nickname || currentCompany.name}
              >
                {hasValidAvatar(currentCompany) ? (
                  <img 
                    key={`trigger-${currentCompany.id}-${currentCompany.avatar_url}`}
                    src={buildCompanyAvatarUrl(currentCompany.avatar_url) || ''} 
                    alt={currentCompany.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('[CompanySelector] Erro ao carregar avatar (trigger):', {
                        companyId: currentCompany.id,
                        avatarUrl: currentCompany.avatar_url,
                        builtUrl: buildCompanyAvatarUrl(currentCompany.avatar_url),
                        error: e
                      });
                      handleImageError(currentCompany.id);
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <p>{currentCompany.system_nickname || currentCompany.name}</p>
          </TooltipContent>
        </Tooltip>
      <DropdownMenuContent 
        align="start" 
        side="right"
        sideOffset={8}
        className="w-[320px] p-0 z-[200]"
      >
        {/* Header com info da empresa atual */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 border border-border/50">
              {hasValidAvatar(currentCompany) ? (
                <img 
                  key={`header-${currentCompany.id}-${currentCompany.avatar_url}`}
                  src={buildCompanyAvatarUrl(currentCompany.avatar_url) || ''} 
                  alt={currentCompany.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error('[CompanySelector] Erro ao carregar avatar (header):', {
                      companyId: currentCompany.id,
                      avatarUrl: currentCompany.avatar_url,
                      builtUrl: buildCompanyAvatarUrl(currentCompany.avatar_url),
                      error: e
                    });
                    handleImageError(currentCompany.id);
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {currentCompany.system_nickname || currentCompany.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Business • 4 membros
              </p>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="p-1">
          <DropdownMenuItem 
            className="flex items-center gap-3 py-2.5 px-3"
            onClick={canEditCompany ? handleEditCompany : undefined}
            disabled={!canEditCompany}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-3 py-2.5 px-3"
            onClick={canEditCompany ? () => setIsEmailConfigModalOpen(true) : undefined}
            disabled={!canEditCompany}
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Configurações de Email</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Seção de alternância de empresas */}
        <div className="p-2">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            Alternar empresa
          </p>
          
          {/* Campo de busca */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Lista de empresas */}
          <div className="max-h-[240px] overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma empresa encontrada
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => handleCompanyChange(company.id)}
                  className={cn(
                    "cursor-pointer flex items-center gap-3 py-2.5 px-2 rounded-md",
                    currentCompany.id === company.id && "bg-accent"
                  )}
                >
                  <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0 bg-primary/10 border border-border/50">
                    {company.avatar_url && company.avatar_url.trim() !== "" && !imageErrors.has(company.id) ? (
                      <img 
                        key={`list-${company.id}-${company.avatar_url}`}
                        src={buildCompanyAvatarUrl(company.avatar_url) || ''} 
                        alt={company.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error('[CompanySelector] Erro ao carregar avatar:', {
                            companyId: company.id,
                            avatarUrl: company.avatar_url,
                            builtUrl: buildCompanyAvatarUrl(company.avatar_url),
                            error: e
                          });
                          handleImageError(company.id);
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {company.system_nickname || company.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {company.name}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>

          {/* Botão criar nova empresa - somente para Proprietários e Membros */}
          {canCreateCompany && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-3 py-2.5 px-2 mt-1 rounded-md border-t"
              onClick={handleCreateCompany}
            >
              <div className="h-8 w-8 rounded-md flex items-center justify-center bg-muted flex-shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-sm">Criar empresa</span>
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <CompanyFormModal
      open={isEditModalOpen}
      onOpenChange={setIsEditModalOpen}
      company={currentCompany}
      onSuccess={handleEditSuccess}
    />

    <CompanyFormModal
      open={isCreateModalOpen}
      onOpenChange={setIsCreateModalOpen}
      company={null}
      onSuccess={handleCreateSuccess}
    />

    <EmailConfigModal
      open={isEmailConfigModalOpen}
      onOpenChange={setIsEmailConfigModalOpen}
      companyId={currentCompany.id}
    />
    </TooltipProvider>
  );
}

