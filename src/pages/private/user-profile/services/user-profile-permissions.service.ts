// TODO: Migrar para endpoint do backend NestJS quando estiver disponível
// Por enquanto, retorna permissões vazias (OWNER sempre tem acesso total)

export interface UserPermissions {
  modules: Array<{
    module_id: string;
    visible: boolean;
  }>;
  cadastros: Array<{
    cadastro_id: string;
    can_read: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>;
}

export const userProfilePermissionsService = {
  /**
   * Busca todas as permissões consolidadas do usuário
   * TODO: Implementar chamada ao endpoint do backend NestJS
   * Por enquanto, retorna permissões vazias (a filtragem é feita pelo backend na sidebar)
   */
  async getUserPermissions(userId: string, companyId: string): Promise<UserPermissions> {
    // Retorna permissões vazias - a filtragem de permissões será feita pelo backend
    // quando o endpoint de permissões estiver disponível
    return {
      modules: [],
      cadastros: [],
    };
  },
};
