# Perfis de Usuário - Documentação

## Visão Geral

O módulo de **Perfis de Usuário** permite criar e gerenciar perfis de acesso que definem permissões granulares para usuários dentro de uma empresa. Cada perfil está vinculado a um plano e pode ter diferentes níveis de acesso aos módulos e cadastros (CRUDs e Páginas) disponíveis no plano.

## Funcionalidades

### 1. Lista de Perfis
- Exibe todos os perfis de usuário cadastrados
- Mostra o nome do perfil e o total de usuários associados
- Permite selecionar um perfil para edição ou criar um novo

### 2. Configuração de Perfil

#### Nome do Perfil
- Campo obrigatório que identifica o perfil

#### Associação de Usuários
- Botão "Usuários" que abre um modal para associar usuários ao perfil
- Exibe o contador de usuários associados

#### Permissões de Páginas
- Botão com ícone de documento que abre um modal específico para gerenciar permissões de páginas
- Páginas são itens do tipo "page" que só possuem permissão de visualização (read)

#### Árvore de Permissões

A árvore de permissões exibe uma estrutura hierárquica:

**Nível 1 - Módulos:**
- Checkbox principal: controla a visibilidade do módulo e todas as permissões dos cadastros filhos
- Checkboxes de ações em massa: LER, CRIAR, EDITAR, EXCLUIR
  - Ao marcar/desmarcar, aplica a ação a todos os cadastros CRUD do módulo
- Botão de expandir/colapsar: mostra/oculta os cadastros do módulo

**Nível 2 - Cadastros (apenas CRUD):**
- Cadastros do tipo "crud" são exibidos na lista principal
- Possuem permissões individuais: LER, CRIAR, EDITAR, EXCLUIR
- Cadastros do tipo "page" são gerenciados no modal separado de Páginas

**Regras de Permissão:**
- Se um módulo não está visível, seus cadastros também não são acessíveis
- Cadastros do tipo "crud" podem ter todas as permissões (read, create, edit, delete)
- Cadastros do tipo "page" só possuem permissão de visualização (read)

## Estrutura de Dados

### Interfaces TypeScript

```typescript
// Ação de permissão
type PermissionAction = 'read' | 'create' | 'edit' | 'delete';

// Permissões de um cadastro
interface Permission {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// Cadastro dentro de um módulo
interface CadastroPermission {
  id: string;
  code: string;
  name: string;
  type: 'crud' | 'page';
  route: string;
  permissions: Permission;
  groupId?: string;      // Se está dentro de um grupo
  groupName?: string;
}

// Módulo com seus cadastros
interface ModulePermission {
  id: string;
  code: string;
  name: string;
  icon?: string;
  visible: boolean;      // Visibilidade do módulo
  cadastros: CadastroPermission[];
}

// Perfil de usuário
interface UserProfile {
  id: string;
  name: string;
  totalUsers: number;
  modulesPermissions: ModulePermission[];
}
```

## Modelo de Banco de Dados

### Diagrama de Relacionamentos

```
companies (empresas)
  └── plan_id → planos (plano contratado)
        └── planos_modulos (módulos do plano)
              ├── modules (definição do módulo)
              └── planos_grupos (grupos dentro do módulo)
                    └── planos_itens (itens do grupo)
                          └── cadastros (definição do cadastro)

user_profiles (perfis de usuário)
  ├── company_id → companies
  └── plan_id → planos

user_profile_permissions (permissões do perfil)
  ├── user_profile_id → user_profiles
  ├── module_id → modules
  ├── cadastro_id → cadastros (nullable)
  └── permissions (JSON)

user_profile_users (associação usuário-perfil)
  ├── user_profile_id → user_profiles
  └── user_id → users
```

### Tabelas Propostas

#### 1. `user_profiles`
Armazena os perfis de usuário criados para cada empresa/plano.

```sql
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT user_profiles_company_name_unique UNIQUE (company_id, name)
);

-- Índices
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_plan_id ON user_profiles(plan_id);
CREATE INDEX idx_user_profiles_active ON user_profiles(active);

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles from their company"
ON public.user_profiles
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM user_companies 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "OWNER can manage profiles"
ON public.user_profiles
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM user_companies 
    WHERE user_id = auth.uid() 
    AND role = 'OWNER'
  )
);
```

#### 2. `user_profile_module_permissions`
Armazena as permissões de visibilidade dos módulos para cada perfil.

```sql
CREATE TABLE public.user_profile_module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_profile_module_permissions_unique UNIQUE (user_profile_id, module_id)
);

-- Índices
CREATE INDEX idx_user_profile_module_permissions_profile ON user_profile_module_permissions(user_profile_id);
CREATE INDEX idx_user_profile_module_permissions_module ON user_profile_module_permissions(module_id);
```

#### 3. `user_profile_cadastro_permissions`
Armazena as permissões detalhadas de cada cadastro (CRUD ou Página) para cada perfil.

```sql
CREATE TABLE public.user_profile_cadastro_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  cadastro_id UUID NOT NULL REFERENCES cadastros(id) ON DELETE CASCADE,
  can_read BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_profile_cadastro_permissions_unique UNIQUE (user_profile_id, cadastro_id)
);

-- Índices
CREATE INDEX idx_user_profile_cadastro_permissions_profile ON user_profile_cadastro_permissions(user_profile_id);
CREATE INDEX idx_user_profile_cadastro_permissions_cadastro ON user_profile_cadastro_permissions(cadastro_id);
```

**Nota:** Para cadastros do tipo "page", apenas `can_read` será utilizado. Os campos `can_create`, `can_edit` e `can_delete` devem ser sempre `false` para este tipo.

#### 4. `user_profile_users`
Tabela de associação muitos-para-muitos entre perfis e usuários.

```sql
CREATE TABLE public.user_profile_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT user_profile_users_unique UNIQUE (user_profile_id, user_id)
);

-- Índices
CREATE INDEX idx_user_profile_users_profile ON user_profile_users(user_profile_id);
CREATE INDEX idx_user_profile_users_user ON user_profile_users(user_id);
```

### Triggers

```sql
-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profile_module_permissions_updated_at
BEFORE UPDATE ON public.user_profile_module_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profile_cadastro_permissions_updated_at
BEFORE UPDATE ON public.user_profile_cadastro_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

## Fluxo de Funcionamento

### 1. Carregamento Inicial

1. Ao acessar a tela, o sistema busca o plano associado à empresa atual
2. A estrutura do plano (`planStructure`) é carregada, contendo:
   - Módulos disponíveis no plano
   - Grupos dentro de cada módulo
   - Itens (cadastros) dentro de cada grupo ou diretamente no módulo
3. A função `planToPermissionsStructure()` converte a estrutura do plano em uma estrutura de permissões
4. Se um perfil já existe, suas permissões são mescladas com a estrutura do plano

### 2. Criação de Perfil

1. Usuário clica em "Novo" no ListHeader
2. Sistema limpa o formulário e carrega a estrutura base do plano
3. Por padrão:
   - Todos os módulos começam visíveis (`visible: true`)
   - Cadastros do tipo "page" começam com `read: true` e demais `false`
   - Cadastros do tipo "crud" começam com todas as permissões `false`
4. Usuário configura as permissões e salva
5. Ao salvar, sistema persiste:
   - O perfil na tabela `user_profiles`
   - Permissões de módulos em `user_profile_module_permissions`
   - Permissões de cadastros em `user_profile_cadastro_permissions`

### 3. Edição de Perfil

1. Usuário seleciona um perfil na lista
2. Sistema carrega:
   - Dados do perfil
   - Permissões de módulos e cadastros
   - Usuários associados
3. Permissões são mescladas com a estrutura atual do plano
4. Se novos módulos/cadastros foram adicionados ao plano, aparecem com permissões padrão
5. Usuário pode modificar e salvar

### 4. Salvamento de Permissões

Ao clicar em "SALVAR", o sistema deve:

1. **Validar dados:**
   - Nome do perfil é obrigatório
   - Verificar se o plano ainda existe e está ativo

2. **Persistir perfil:**
   - Criar ou atualizar registro em `user_profiles`

3. **Persistir permissões de módulos:**
   - Para cada módulo na estrutura do plano:
     - Inserir ou atualizar em `user_profile_module_permissions`
     - Definir `visible` conforme configuração

4. **Persistir permissões de cadastros:**
   - Para cada cadastro (CRUD ou Página) na estrutura do plano:
     - Inserir ou atualizar em `user_profile_cadastro_permissions`
     - Para páginas: garantir que apenas `can_read` pode ser `true`
     - Para CRUDs: salvar todas as permissões conforme configurado

5. **Associar usuários:**
   - Remover associações antigas em `user_profile_users`
   - Inserir novas associações conforme seleção

### 5. Consulta de Permissões (para uso no sistema)

Quando um usuário acessa o sistema, o backend deve:

1. Buscar todos os perfis associados ao usuário
2. Para cada perfil, buscar:
   - Permissões de módulos (`user_profile_module_permissions`)
   - Permissões de cadastros (`user_profile_cadastro_permissions`)
3. Consolidar permissões (se usuário tem múltiplos perfis, usar OR)
4. Retornar estrutura de permissões para o frontend

## APIs Sugeridas

### Backend Endpoints

#### 1. Listar Perfis
```
GET /api/user-profiles?company_id={companyId}
```

#### 2. Buscar Perfil
```
GET /api/user-profiles/{profileId}
```

#### 3. Criar Perfil
```
POST /api/user-profiles
Body: {
  company_id: string;
  plan_id: string;
  name: string;
  description?: string;
  module_permissions: Array<{
    module_id: string;
    visible: boolean;
  }>;
  cadastro_permissions: Array<{
    cadastro_id: string;
    can_read: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>;
  user_ids: string[];
}
```

#### 4. Atualizar Perfil
```
PUT /api/user-profiles/{profileId}
Body: (mesmo formato do POST)
```

#### 5. Deletar Perfil
```
DELETE /api/user-profiles/{profileId}
```

#### 6. Buscar Permissões do Usuário
```
GET /api/users/{userId}/permissions
Response: {
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
```

## Considerações de Segurança

1. **Row Level Security (RLS):**
   - Usuários só podem ver perfis de sua empresa
   - Apenas OWNERs podem criar/editar/deletar perfis

2. **Validações:**
   - Validar que módulos e cadastros pertencem ao plano do perfil
   - Validar que cadastros do tipo "page" não podem ter `can_create`, `can_edit` ou `can_delete` como `true`
   - Validar que usuários pertencem à mesma empresa

3. **Auditoria:**
   - Registrar quem criou/atualizou cada perfil
   - Manter histórico de mudanças (opcional, pode usar tabela de histórico)

## Exemplo de Uso

### Exemplo 1: Perfil "Vendedor"
- Módulo "Cadastros" visível
  - Cadastro "Clientes": read, create, edit
  - Cadastro "Produtos": read apenas
  - Página "Dashboard": read
- Módulo "Financeiro" não visível

### Exemplo 2: Perfil "Gerente"
- Todos os módulos visíveis
- Todos os cadastros com permissões completas (read, create, edit, delete)
- Todas as páginas visíveis

### Exemplo 3: Perfil "Visualizador"
- Módulos visíveis conforme necessidade
- Todos os cadastros apenas com read
- Páginas visíveis conforme necessidade

## Notas de Implementação

1. **Sincronização com Plano:**
   - Se um módulo/cadastro é removido do plano, as permissões relacionadas devem ser removidas ou marcadas como inativas
   - Se novos módulos/cadastros são adicionados ao plano, aparecem com permissões padrão nos perfis existentes

2. **Performance:**
   - Usar índices nas foreign keys
   - Considerar cache para permissões de usuários frequentemente acessadas
   - Agregar permissões de múltiplos perfis de forma eficiente

3. **Múltiplos Perfis:**
   - Um usuário pode ter múltiplos perfis
   - Neste caso, as permissões devem ser consolidadas usando OR (se qualquer perfil permite, o usuário tem acesso)
   - Considerar implementar regras de precedência se necessário

