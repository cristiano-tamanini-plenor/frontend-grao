# Sistema de CRUD Otimizado

Este documento descreve a estrutura otimizada para criação de telas CRUD no projeto.

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── crud/
│   │   ├── ActionButtons.tsx    # Botões de ação reutilizáveis
│   │   └── README.md            # Este arquivo
│   ├── ListHeader/
│   │   └── index.tsx            # Header para páginas de listagem
│   └── ui/                      # Componentes shadcn/ui
├── hooks/
│   ├── usePermission.ts         # Hook para verificar permissões
│   ├── useBreadcrumbs.ts        # Hook para gerar breadcrumbs
│   └── useCurrentRoute.ts       # Hook para informações da rota
├── utils/
│   └── When.tsx                 # Componente para renderização condicional
└── modules/
    └── [nome-do-modulo]/
        ├── types.ts             # Tipos TypeScript
        ├── schemas/
        │   └── [modulo].schemas.ts  # Schemas de validação (Zod)
        ├── services/
        │   └── [modulo].service.ts  # Serviços de API
        ├── hooks/
        │   └── use[Modulo].tsx      # Hooks React Query
        └── components/
            └── [Modulo]Filters.tsx  # Filtros específicos
```

## 🎯 Componentes Principais

### 1. ListHeader

Componente de cabeçalho para páginas de listagem com breadcrumbs, título e botões de ação.

```tsx
import { ListHeader } from '@/components/ListHeader';
import { Package } from 'lucide-react';

<ListHeader 
  icon={Package}
  title="Módulos do Sistema"
  canCreate={canCreate}
  addButtonRoute="novo"
>
  {/* Filtros e botões personalizados */}
  <SearchInput />
  <FilterButton />
</ListHeader>
```

**Props:**
- `icon`: Ícone da página (Lucide Icon)
- `title`: Título customizado (opcional, usa breadcrumb por padrão)
- `canCreate`: Se deve mostrar o botão de adicionar
- `addButtonLabel`: Label do botão adicionar
- `addButtonRoute`: Rota ao clicar no botão (padrão: 'novo')
- `customBreadcrumbs`: Breadcrumbs customizados
- `breadcrumbLabels`: Labels customizados para breadcrumbs
- `onAdd`: Callback customizado ao adicionar
- `children`: Componentes de filtros/ações

### 2. ActionButtons

Coleção de botões pré-configurados para ações comuns:

```tsx
import { 
  AddButton, 
  DeleteButton, 
  EditButton, 
  BackButton,
  SaveButton,
  CancelButton,
  RefreshButton,
  FilterButton,
  SearchButton,
  ExportButton,
  ImportButton,
  ViewButton
} from '@/components/crud/ActionButtons';

// Exemplo de uso
<RefreshButton 
  onClick={() => refetch()} 
  disabled={isLoading}
  showLabel={false}  // Mostra apenas o ícone
/>
```

**Props comuns:**
- `label`: Texto do botão
- `showIcon`: Mostrar ícone (padrão: true)
- `showLabel`: Mostrar texto (padrão: true)
- Todas as props do Button do shadcn/ui

### 3. When / Unless

Componentes para renderização condicional:

```tsx
import { When, Unless } from '@/utils/When';

<When is={canEdit}>
  <EditButton onClick={handleEdit} />
</When>

<Unless is={isLoading}>
  <DataTable data={data} />
</Unless>
```

## 🔐 Sistema de Permissões

### Hook usePermission

```tsx
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { canCreate, canEdit, canDelete, canView } = usePermission('modules');
  
  return (
    <When is={canCreate}>
      <AddButton onClick={handleAdd} />
    </When>
  );
}
```

### Adicionar novas permissões

1. Adicione no tipo `Permission` em `src/lib/rbac/permissions.ts`:

```typescript
export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'modules.view'
  | 'modules.create'
  | 'seu-recurso.view'     // ← Adicione aqui
  | 'seu-recurso.create';
```

2. Adicione nos `rolePermissions` para cada role:

```typescript
const rolePermissions: Record<AppRole, Permission[]> = {
  OWNER: [
    'users.view',
    'seu-recurso.view',    // ← Adicione aqui
    'seu-recurso.create',
  ],
  // ...
};
```

## 🗂️ Como Criar um Novo CRUD

### Passo 1: Criar os Tipos

```typescript
// src/modules/seu-modulo/types.ts
export interface SeuModulo {
  id: string;
  name: string;
  // ... outros campos
  created_at: string;
  updated_at: string;
}

export interface SeuModuloFormData {
  name: string;
  // ... campos do formulário
}

export interface SeuModuloFilters {
  search?: string;
  active?: boolean;
}
```

### Passo 2: Criar os Schemas de Validação

```typescript
// src/modules/seu-modulo/schemas/seu-modulo.schemas.ts
import { z } from 'zod';

export const seuModuloFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  // ... outros campos
});

export type SeuModuloFormSchema = z.infer<typeof seuModuloFormSchema>;
```

### Passo 3: Criar o Serviço

```typescript
// src/modules/seu-modulo/services/seu-modulo.service.ts
import { apiClient } from '@/lib/api/client';

export const seuModuloService = {
  async list(filters?) {
    // Build query params from filters
    const params = new URLSearchParams();
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString();
    const endpoint = `/seu-modulo${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    return response || [];
  },
  
  async getById(id: string) {
    const response = await apiClient.get(`/seu-modulo/${id}`);
    return response;
  },
  
  async create(data) {
    const response = await apiClient.post('/seu-modulo', data);
    return response;
  },
  
  async update(id: string, data) {
    const response = await apiClient.put(`/seu-modulo/${id}`, data);
    return response;
  },
  
  async delete(id: string) {
    await apiClient.delete(`/seu-modulo/${id}`);
  },
};
```

### Passo 4: Criar os Hooks React Query

```typescript
// src/modules/seu-modulo/hooks/useSeuModulo.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'seu-modulo';

export function useSeuModulo(filters?) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => seuModuloService.list(filters),
  });
}

export function useCreateSeuModulo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: seuModuloService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: 'Sucesso', description: 'Item criado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

// ... outros hooks (update, delete)
```

### Passo 5: Criar o Componente de Filtros

```typescript
// src/modules/seu-modulo/components/SeuModuloFilters.tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function SeuModuloFilters({ filters, onFiltersChange }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };
  
  return (
    <form onSubmit={handleSearchSubmit}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-8"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>
    </form>
  );
}
```

### Passo 6: Criar a Página de Listagem

```typescript
// src/pages/private/seu-modulo/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import { RefreshButton } from '@/components/crud/ActionButtons';
import { When } from '@/utils/When';

export default function SeuModuloPage() {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermission('seu-modulo');
  const [filters, setFilters] = useState({});
  
  const { data = [], isLoading, refetch } = useSeuModulo(filters);
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <ListHeader 
        icon={Package}
        title="Seu Módulo"
        canCreate={canCreate}
      >
        <SeuModuloFilters filters={filters} onFiltersChange={setFilters} />
        <RefreshButton onClick={() => refetch()} disabled={isLoading} />
      </ListHeader>
      
      {/* Sua tabela ou grid aqui */}
    </div>
  );
}
```

### Passo 7: Criar a Página de Formulário

```typescript
// src/pages/private/seu-modulo/form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { SaveButton, BackButton } from '@/components/crud/ActionButtons';

export default function SeuModuloForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  const form = useForm({
    resolver: zodResolver(seuModuloFormSchema),
    defaultValues: { /* ... */ },
  });
  
  const createMutation = useCreateSeuModulo();
  const updateMutation = useUpdateSeuModulo();
  
  const onSubmit = async (data) => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    navigate('/seu-modulo');
  };
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Campos do formulário */}
          
          <div className="flex justify-end gap-2">
            <BackButton onClick={() => navigate('/seu-modulo')} />
            <SaveButton type="submit" />
          </div>
        </form>
      </Form>
    </div>
  );
}
```

## 🎨 Dicas de Uso

### Breadcrumbs Customizados

```tsx
const customBreadcrumbs = [
  { label: 'Início', href: '/home' },
  { label: 'Configurações', href: '/config' },
  { label: 'Meu Item', active: true },
];

<ListHeader customBreadcrumbs={customBreadcrumbs} />
```

### Labels de Breadcrumbs Customizados

```tsx
const breadcrumbLabels = {
  'meu-modulo': 'Minha Tela Personalizada',
  'form': 'Edição',
};

<ListHeader breadcrumbLabels={breadcrumbLabels} />
```

### Botões com Apenas Ícone

```tsx
<RefreshButton showLabel={false} />
<DeleteButton showLabel={false} />
```

### Filtros Avançados

```tsx
<ListHeader canCreate={canCreate}>
  <Input placeholder="Buscar..." />
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="active">Ativo</SelectItem>
      <SelectItem value="inactive">Inativo</SelectItem>
    </SelectContent>
  </Select>
  <Button variant="outline">Limpar Filtros</Button>
</ListHeader>
```

## 📦 Exemplo Completo

Veja a implementação completa em:
- **Listagem**: `src/pages/private/module/index.tsx`
- **Formulário**: `src/pages/private/module/form.tsx`
- **Serviços**: `src/modules/modules/services/modules.service.ts`
- **Hooks**: `src/modules/modules/hooks/useModules.tsx`
- **Tipos**: `src/modules/modules/types.ts`

## 🚀 Vantagens desta Estrutura

1. **Reutilização**: Componentes e hooks podem ser usados em múltiplos CRUDs
2. **Consistência**: Todas as telas seguem o mesmo padrão visual e de comportamento
3. **Manutenibilidade**: Mudanças em componentes base afetam todas as telas
4. **Produtividade**: Criar novos CRUDs é muito mais rápido
5. **Tipo Seguro**: TypeScript garante segurança de tipos em toda a aplicação
6. **Validação**: Zod valida dados no cliente antes de enviar ao servidor
7. **Otimização**: React Query gerencia cache e sincronização de dados
8. **Permissões**: Sistema RBAC integrado em todos os componentes

