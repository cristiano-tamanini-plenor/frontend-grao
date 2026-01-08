# Feature: Cadastros

## Visão Geral

A feature de **Cadastros** é um módulo administrativo que permite gerenciar diferentes tipos de cadastros no sistema. Cada cadastro representa uma funcionalidade ou página do sistema que pode ser configurada com ícone, rota, ordem de exibição e status ativo/inativo.

## Funcionalidades

### 1. Listagem de Cadastros
- Exibe todos os cadastros em uma tabela (DataGrid)
- Ordenação padrão por campo `order` (ascendente)
- Suporte a busca/filtro
- Suporte a exportação de dados
- Configuração de colunas visíveis
- Paginação (20 itens por página)

### 2. Criação de Cadastro
- Formulário completo para criação de novos cadastros
- Validação de campos obrigatórios
- Seleção de ícone via autocomplete (lucide-react)
- Definição de tipo (page ou crud)

### 3. Edição de Cadastro
- Edição de todos os campos do cadastro
- Carregamento automático dos dados existentes
- Validação de campos

### 4. Exclusão de Cadastro
- Exclusão com confirmação via dialog
- Validação de permissões antes de excluir

## Estrutura de Dados

### Modelo de Dados (Frontend)

```typescript
interface Cadastro {
  id: string;
  name: string;                    // Nome do cadastro (ex: "Usuários")
  description: string | null;      // Descrição opcional
  code: string;                    // Código único (ex: "USERS")
  type: 'page' | 'crud';          // Tipo do cadastro
  icon: string | null;             // Nome do ícone do lucide-react
  route: string | null;            // Rota no sistema (ex: "/usuarios")
  order: number;                   // Ordem de exibição (default: 0)
  active: boolean;                 // Status ativo/inativo
  created_at: string;              // Data de criação (ISO 8601)
  updated_at: string;              // Data de atualização (ISO 8601)
}
```

### Schema de Validação (Zod)

```typescript
cadastroFormSchema = {
  name: string (min 1) - obrigatório
  description: string | null - opcional
  code: string (min 1) - obrigatório
  type: 'page' | 'crud' - default: 'page'
  icon: string | null - opcional
  route: string | null - opcional
  order: number (int, min 0) - default: 0
  active: boolean - default: true
}
```

## Endpoints da API (NestJS)

### Base URL
```
/cadastros
```

### 1. Listar Todos os Cadastros
**GET** `/cadastros`

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Usuários",
    "description": "Gerenciamento de usuários do sistema",
    "code": "USERS",
    "type": "crud",
    "icon": "Users",
    "route": "/usuarios",
    "order": 1,
    "active": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Query Parameters (Opcional):**
- `orderBy`: Campo para ordenação (default: "order")
- `orderDirection`: "asc" | "desc" (default: "asc")

### 2. Buscar Cadastro por ID
**GET** `/cadastros/:id`

**Parâmetros:**
- `id` (path): ID do cadastro (number)

**Resposta:**
```json
{
  "id": 1,
  "name": "Usuários",
  "description": "Gerenciamento de usuários do sistema",
  "code": "USERS",
  "type": "crud",
  "icon": "Users",
  "route": "/usuarios",
  "order": 1,
  "active": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erros:**
- `404`: Cadastro não encontrado

### 3. Criar Novo Cadastro
**POST** `/cadastros`

**Body:**
```json
{
  "name": "Usuários",
  "description": "Gerenciamento de usuários do sistema",
  "code": "USERS",
  "type": "crud",
  "icon": "Users",
  "route": "/usuarios",
  "order": 1,
  "active": true
}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Usuários",
  "description": "Gerenciamento de usuários do sistema",
  "code": "USERS",
  "type": "crud",
  "icon": "Users",
  "route": "/usuarios",
  "order": 1,
  "active": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Validações:**
- `name`: obrigatório, string não vazia
- `code`: obrigatório, string não vazia, único
- `type`: deve ser "page" ou "crud"
- `order`: número inteiro >= 0

**Erros:**
- `400`: Dados inválidos
- `409`: Código já existe

### 4. Atualizar Cadastro
**PATCH** `/cadastros/:id`

**Parâmetros:**
- `id` (path): ID do cadastro (number)

**Body:**
```json
{
  "name": "Usuários Atualizado",
  "description": "Nova descrição",
  "code": "USERS",
  "type": "crud",
  "icon": "UserCircle",
  "route": "/usuarios",
  "order": 2,
  "active": true
}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Usuários Atualizado",
  "description": "Nova descrição",
  "code": "USERS",
  "type": "crud",
  "icon": "UserCircle",
  "route": "/usuarios",
  "order": 2,
  "active": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:20:00.000Z"
}
```

**Validações:**
- Mesmas validações do POST
- `code`: se alterado, deve ser único

**Erros:**
- `400`: Dados inválidos
- `404`: Cadastro não encontrado
- `409`: Código já existe (se alterado)

### 5. Excluir Cadastro
**DELETE** `/cadastros/:id`

**Parâmetros:**
- `id` (path): ID do cadastro (number)

**Resposta:**
- `204 No Content` (sem body)

**Erros:**
- `404`: Cadastro não encontrado
- `409`: Cadastro está em uso e não pode ser excluído (se aplicável)

## Autenticação

Todos os endpoints requerem autenticação via Bearer Token:

```
Authorization: Bearer <access_token>
```

## Permissões

A feature utiliza o sistema de permissões RBAC. As permissões necessárias são:

- `cadastros:create` - Criar cadastros
- `cadastros:read` - Visualizar cadastros
- `cadastros:update` - Editar cadastros
- `cadastros:delete` - Excluir cadastros

## Mapeamento de Campos

### Backend → Frontend

| Backend (NestJS) | Frontend (TypeScript) |
|------------------|----------------------|
| `id` (number) | `id` (string) |
| `name` | `name` |
| `description` | `description` |
| `code` | `code` |
| `type` | `type` |
| `icon` | `icon` |
| `route` | `route` |
| `order` | `order` |
| `active` | `active` |
| `createdAt` (ISO 8601) | `created_at` (ISO 8601) |
| `updatedAt` (ISO 8601) | `updated_at` (ISO 8601) |

### Frontend → Backend

| Frontend (TypeScript) | Backend (NestJS) |
|----------------------|------------------|
| `id` (string) | `id` (number) - apenas para updates |
| `name` | `name` |
| `description` | `description` |
| `code` | `code` |
| `type` | `type` |
| `icon` | `icon` |
| `route` | `route` |
| `order` | `order` |
| `active` | `active` |

## Tratamento de Erros

### Formato de Erro da API

```json
{
  "message": "Mensagem de erro",
  "statusCode": 400,
  "error": "Bad Request"
}
```

Ou para validações múltiplas:

```json
{
  "message": [
    "name deve ser uma string",
    "code é obrigatório"
  ],
  "statusCode": 400,
  "error": "Bad Request"
}
```

### Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Recurso excluído com sucesso
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido ou ausente
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: código duplicado)
- `500 Internal Server Error`: Erro interno do servidor

## Exemplo de DTOs (NestJS)

### CreateCadastroDto

```typescript
export class CreateCadastroDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  @IsUnique('cadastros', 'code')
  code: string;

  @IsEnum(['page', 'crud'])
  @IsNotEmpty()
  type: 'page' | 'crud';

  @IsString()
  @IsOptional()
  icon?: string | null;

  @IsString()
  @IsOptional()
  route?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Default(0)
  order?: number;

  @IsBoolean()
  @IsOptional()
  @Default(true)
  active?: boolean;
}
```

### UpdateCadastroDto

```typescript
export class UpdateCadastroDto extends PartialType(CreateCadastroDto) {
  // Herda todos os campos de CreateCadastroDto como opcionais
  // Exceto code que pode ter validação diferente se alterado
}
```

## Estrutura de Arquivos

```
src/pages/private/cadastro/
├── index.tsx                    # Listagem de cadastros
├── form.tsx                     # Formulário de criação/edição
├── hooks/
│   └── useCadastro.tsx         # Hooks React Query
├── services/
│   └── cadastros.service.ts    # Serviço de comunicação com API
├── schemas/
│   └── cadastro.schemas.ts     # Schemas Zod de validação
└── README.md                    # Esta documentação
```

## Fluxo de Dados

1. **Listagem:**
   - Componente `index.tsx` → Hook `useCadastros()` → Service `listCadastros()` → API GET `/cadastros`

2. **Criação:**
   - Componente `form.tsx` → Hook `useCreateCadastro()` → Service `createCadastro()` → API POST `/cadastros`

3. **Edição:**
   - Componente `form.tsx` → Hook `useCadastro(id)` → Service `getCadastroById(id)` → API GET `/cadastros/:id`
   - Componente `form.tsx` → Hook `useUpdateCadastro()` → Service `updateCadastro(id, data)` → API PATCH `/cadastros/:id`

4. **Exclusão:**
   - Componente `form.tsx` → Hook `useDeleteCadastro()` → Service `deleteCadastro(id)` → API DELETE `/cadastros/:id`

## Notas de Implementação

1. **Conversão de ID:** O backend usa `number` para IDs, enquanto o frontend usa `string`. A conversão é feita no serviço.

2. **Datas:** O backend retorna datas em formato ISO 8601 (`createdAt`, `updatedAt`), que são mapeadas para `created_at` e `updated_at` no frontend.

3. **Valores Nulos:** Campos opcionais podem ser `null` no banco de dados. O frontend trata isso convertendo `null` para string vazia em alguns campos do formulário.

4. **Ordenação:** A listagem sempre ordena por `order` ascendente por padrão.

5. **Código Único:** O campo `code` deve ser único no sistema e é convertido para maiúsculas no frontend.

6. **Ícones:** Os ícones são nomes de componentes do `lucide-react`. O frontend valida e renderiza os ícones dinamicamente.

## Testes Recomendados

### Backend (NestJS)

1. **GET /cadastros**
   - Deve retornar lista vazia quando não há cadastros
   - Deve retornar lista ordenada por `order`
   - Deve aplicar filtros se fornecidos

2. **GET /cadastros/:id**
   - Deve retornar 404 para ID inexistente
   - Deve retornar cadastro válido para ID existente

3. **POST /cadastros**
   - Deve criar cadastro com dados válidos
   - Deve retornar 400 para dados inválidos
   - Deve retornar 409 para código duplicado

4. **PATCH /cadastros/:id**
   - Deve atualizar cadastro existente
   - Deve retornar 404 para ID inexistente
   - Deve validar código único se alterado

5. **DELETE /cadastros/:id**
   - Deve excluir cadastro existente
   - Deve retornar 404 para ID inexistente

### Frontend

1. **Listagem**
   - Deve carregar e exibir cadastros
   - Deve mostrar loading state
   - Deve tratar erros de API

2. **Formulário**
   - Deve validar campos obrigatórios
   - Deve preencher campos na edição
   - Deve salvar e redirecionar após sucesso
   - Deve exibir erros de validação

3. **Exclusão**
   - Deve mostrar dialog de confirmação
   - Deve excluir e atualizar lista após confirmação

## Melhorias Futuras

1. Filtros avançados na listagem
2. Ordenação customizável pelo usuário
3. Histórico de alterações
4. Soft delete com restauração
5. Validação de rota duplicada
6. Preview de ícone antes de salvar
7. Importação/exportação em massa

