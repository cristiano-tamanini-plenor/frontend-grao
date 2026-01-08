# Documentação da Feature de Módulos

## Visão Geral

A feature de **Módulos** permite gerenciar os módulos do sistema. Cada módulo representa uma funcionalidade ou seção do sistema que pode ser associada a planos e controlada por permissões de acesso baseadas em roles de usuário.

## Estrutura de Dados

### Módulo (Module)

Um módulo representa uma funcionalidade do sistema com as seguintes características:

- **Código único**: Identificador alfanumérico em maiúsculas (ex: `USERS`, `COMPANIES`)
- **Nome**: Nome amigável exibido no sistema
- **Descrição**: Texto descritivo opcional
- **Ícone**: Nome do ícone do Lucide React
- **Status**: Ativo/Inativo
- **Módulo Pai**: Referência opcional para hierarquia de módulos
- **Roles Permitidas**: Lista de tipos de usuário que podem acessar o módulo

## Endpoints da API (NestJS)

### Base URL
```
/modules
```

### 1. Listar Todos os Módulos

**GET** `/modules`

**Descrição**: Retorna todos os módulos cadastrados, ordenados por `name` (ascendente).

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "name": "Usuários",
    "description": "Gerenciamento de usuários do sistema",
    "code": "USERS",
    "icon": "Users",
    "active": true,
    "parentId": null,
    "allowedRoles": ["OWNER", "MEMBER", "MEMBER_LIMITED", "GUEST", "DEVELOPER"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Resposta com Wrapper (opcional)**:
```json
{
  "success": true,
  "message": "Módulos listados com sucesso",
  "data": [
    {
      "id": 1,
      "name": "Usuários",
      ...
    }
  ]
}
```

### 2. Buscar Módulo por ID

**GET** `/modules/:id`

**Parâmetros**:
- `id` (number, path): ID do módulo

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "name": "Usuários",
  "description": "Gerenciamento de usuários do sistema",
    "code": "USERS",
    "icon": "Users",
    "active": true,
  "parentId": null,
  "allowedRoles": ["OWNER", "MEMBER", "MEMBER_LIMITED", "GUEST"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Resposta com Wrapper (opcional)**:
```json
{
  "success": true,
  "message": "Módulo encontrado",
  "data": {
    "id": 1,
    "name": "Usuários",
    ...
  }
}
```

**Erros**:
- `404`: Módulo não encontrado

### 3. Criar Novo Módulo

**POST** `/modules`

**Body**:
```json
{
  "name": "Usuários",
  "description": "Gerenciamento de usuários do sistema",
    "code": "USERS",
    "icon": "Users",
    "active": true,
  "parentId": null,
  "allowedRoles": ["OWNER", "MEMBER", "MEMBER_LIMITED", "GUEST"]
}
```

**Resposta de Sucesso (201)**:
```json
{
  "id": 1,
  "name": "Usuários",
  "description": "Gerenciamento de usuários do sistema",
    "code": "USERS",
    "icon": "Users",
    "active": true,
  "parentId": null,
  "allowedRoles": ["OWNER", "MEMBER", "MEMBER_LIMITED", "GUEST"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Resposta com Wrapper (opcional)**:
```json
{
  "success": true,
  "message": "Módulo criado com sucesso",
  "data": {
    "id": 1,
    "name": "Usuários",
    ...
  }
}
```

**Erros**:
- `400`: Dados inválidos
- `409`: Código ou rota já existente

### 4. Atualizar Módulo

**PATCH** `/modules/:id`

**Parâmetros**:
- `id` (number, path): ID do módulo

**Body**:
```json
{
  "name": "Usuários Atualizado",
  "description": "Nova descrição",
  "code": "USERS",
  "icon": "User",
  "route": "/usuarios",
  "order": 2,
  "active": true,
  "parentId": null,
  "allowedRoles": ["OWNER", "MEMBER"]
}
```

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "name": "Usuários Atualizado",
  "description": "Nova descrição",
  "code": "USERS",
  "icon": "User",
  "route": "/usuarios",
  "order": 2,
  "active": true,
  "parentId": null,
  "allowedRoles": ["OWNER", "MEMBER"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:20:00.000Z"
}
```

**Resposta com Wrapper (opcional)**:
```json
{
  "success": true,
  "message": "Módulo atualizado com sucesso",
  "data": {
    "id": 1,
    "name": "Usuários Atualizado",
    ...
  }
}
```

**Erros**:
- `400`: Dados inválidos
- `404`: Módulo não encontrado
- `409`: Código ou rota já existente (se alterado)

### 5. Excluir Módulo

**DELETE** `/modules/:id`

**Parâmetros**:
- `id` (number, path): ID do módulo

**Resposta de Sucesso (200 ou 204)**:
- Sem corpo de resposta ou:
```json
{
  "success": true,
  "message": "Módulo excluído com sucesso"
}
```

**Erros**:
- `404`: Módulo não encontrado
- `409`: Módulo está em uso (associado a planos, etc.)

## DTOs (Data Transfer Objects)

### CreateModuleDto

```typescript
{
  name: string;                    // Obrigatório, min: 1
  description?: string | null;     // Opcional
  code: string;                    // Obrigatório, min: 1, único, maiúsculas
  icon?: string | null;            // Opcional, nome do ícone Lucide
  active: boolean;                 // Obrigatório, default: true
  parentId?: number | null;       // Opcional, ID do módulo pai
  allowedRoles: string[];          // Obrigatório, min: 1, enum: ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER']
}
```

### UpdateModuleDto

```typescript
{
  name?: string;                   // Opcional, min: 1
  description?: string | null;     // Opcional
  code?: string;                   // Opcional, min: 1, único, maiúsculas
  icon?: string | null;            // Opcional, nome do ícone Lucide
  active?: boolean;                // Opcional
  parentId?: number | null;       // Opcional, ID do módulo pai
  allowedRoles?: string[];         // Opcional, min: 1, enum: ['OWNER', 'MEMBER', 'MEMBER_LIMITED', 'GUEST', 'DEVELOPER']
}
```

## Validações

### Regras de Negócio

1. **Código**:
   - Obrigatório
   - Deve ser único no sistema
   - Apenas letras maiúsculas, números e underscore (`_`)
   - Mínimo 1 caractere

2. **Nome**:
   - Obrigatório
   - Mínimo 1 caractere

3. **Allowed Roles**:
   - Obrigatório
   - Mínimo 1 role
   - Valores permitidos: `OWNER`, `MEMBER`, `MEMBER_LIMITED`, `GUEST`, `DEVELOPER`
   - `OWNER` sempre tem acesso, mesmo que não esteja na lista

4. **Parent ID**:
   - Opcional
   - Se informado, deve referenciar um módulo existente
   - Não pode criar referência circular (módulo não pode ser pai de si mesmo ou de seus ancestrais)

5. **Exclusão**:
   - Não pode excluir módulo que está em uso (associado a planos, etc.)

## Mapeamento de Campos (Backend ↔ Frontend)

| Backend (NestJS) | Frontend (React) | Tipo | Observações |
|------------------|------------------|------|-------------|
| `id` | `id` | number → string | Conversão necessária |
| `name` | `name` | string | - |
| `description` | `description` | string \| null | - |
| `code` | `code` | string | Sempre maiúsculas |
| `icon` | `icon` | string \| null | Nome do ícone Lucide |
| `active` | `active` | boolean | - |
| `parentId` | `parent_id` | number \| null → string \| null | Conversão de ID |
| `allowedRoles` | `allowed_roles` | string[] | Array de roles |
| `createdAt` | `created_at` | string (ISO 8601) | - |
| `updatedAt` | `updated_at` | string (ISO 8601) | - |

## Tratamento de Erros

### Códigos de Status HTTP

- **200 OK**: Operação bem-sucedida (GET, PATCH)
- **201 Created**: Recurso criado com sucesso (POST)
- **204 No Content**: Recurso excluído com sucesso (DELETE)
- **400 Bad Request**: Dados inválidos ou validação falhou
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **403 Forbidden**: Usuário não tem permissão para a operação
- **404 Not Found**: Módulo não encontrado
- **409 Conflict**: Código ou rota já existe, ou módulo em uso
- **500 Internal Server Error**: Erro interno do servidor

### Formato de Erro

```json
{
  "statusCode": 400,
  "message": "Código já existe",
  "error": "Bad Request"
}
```

Ou com detalhes de validação:

```json
{
  "statusCode": 400,
  "message": "Dados inválidos",
  "error": "Bad Request",
  "errors": [
    {
      "field": "code",
      "message": "Código é obrigatório"
    },
    {
      "field": "name",
      "message": "Nome deve ter pelo menos 1 caractere"
    }
  ]
}
```

## Fluxo de Dados

### Criação de Módulo

1. Usuário preenche formulário no frontend
2. Frontend valida dados com Zod schema
3. Frontend envia `POST /modules` com `CreateModuleDto`
4. Backend valida dados e cria módulo
5. Backend retorna módulo criado
6. Frontend atualiza lista e redireciona para `/modulos`

### Atualização de Módulo

1. Usuário acessa `/modulos/form?id=1`
2. Frontend busca módulo com `GET /modules/1`
3. Frontend popula formulário com dados
4. Usuário edita e salva
5. Frontend envia `PATCH /modules/1` com `UpdateModuleDto`
6. Backend valida e atualiza módulo
7. Backend retorna módulo atualizado
8. Frontend atualiza lista e redireciona para `/modulos`

### Exclusão de Módulo

1. Usuário clica em excluir no formulário
2. Frontend confirma exclusão
3. Frontend envia `DELETE /modules/1`
4. Backend verifica se módulo está em uso
5. Se não estiver em uso, exclui módulo
6. Backend retorna sucesso
7. Frontend atualiza lista e redireciona para `/modulos`

## Observações Importantes

1. **IDs**: O backend usa `number` para IDs, mas o frontend usa `string`. É necessário fazer conversão nos serviços.

2. **Código Único**: O código do módulo deve ser único no sistema. O backend deve validar isso.

3. **Rota Única**: Se uma rota for informada, ela deve ser única no sistema. O backend deve validar isso.

4. **Roles**: O tipo `OWNER` sempre tem acesso, mesmo que não esteja na lista de `allowedRoles`.

5. **Ordenação**: A listagem de módulos deve ser ordenada por `name` (ascendente).

6. **Hierarquia**: O campo `parentId` permite criar uma hierarquia de módulos, mas não é obrigatório.

7. **Soft Delete**: Considerar implementar soft delete ao invés de exclusão física, para manter histórico.

8. **Auditoria**: Os campos `createdAt` e `updatedAt` são gerenciados automaticamente pelo backend.

## Exemplos de Uso

### Exemplo 1: Criar Módulo Simples

```json
POST /modules
{
  "name": "Dashboard",
  "code": "DASHBOARD",
  "active": true,
  "allowedRoles": ["OWNER", "MEMBER"]
}
```

### Exemplo 2: Criar Módulo Completo

```json
POST /modules
{
  "name": "Gerenciamento de Usuários",
  "description": "Módulo para gerenciar usuários do sistema",
    "code": "USERS",
    "icon": "Users",
    "active": true,
  "parentId": null,
  "allowedRoles": ["OWNER", "MEMBER", "MEMBER_LIMITED"]
}
```

### Exemplo 3: Atualizar Apenas Status

```json
PATCH /modules/1
{
  "active": false
}
```


