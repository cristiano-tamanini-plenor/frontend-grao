# StepableDateRange

Um componente de seleção de intervalo de datas com opções pré-definidas e calendário interativo, desenvolvido para o projeto Giltec Frontend.

## Características

- **Opções pré-definidas**: Inclui opções como "Hoje", "Esta semana", "Mês atual", etc.
- **Calendário interativo**: Permite seleção manual de datas usando um calendário
- **Busca**: Campo de busca para filtrar as opções pré-definidas
- **Localização**: Suporte completo para português brasileiro (pt-BR)
- **Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Acessibilidade**: Suporte para navegação por teclado e leitores de tela

## Uso Básico

```tsx
import { StepableDateRange, DateRange } from '@/components/Elements/Input/StepableDateRange';

function MyComponent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleChangeDateRange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <StepableDateRange
      label="Selecione um período"
      name="dateRange"
      onChange={handleChangeDateRange}
      value={dateRange}
    />
  );
}
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `label` | `string` | - | Rótulo do campo |
| `name` | `string` | - | Nome do campo para formulários |
| `value` | `DateRange` | - | Valor atual do intervalo de datas |
| `onChange` | `(value: DateRange) => void` | - | Callback chamado quando o valor muda |
| `placeholder` | `string` | "Selecione um intervalo de datas" | Texto de placeholder |
| `className` | `string` | - | Classes CSS adicionais |
| `disabled` | `boolean` | `false` | Se o campo está desabilitado |
| `error` | `boolean` | `false` | Se o campo está em estado de erro |
| `required` | `boolean` | `false` | Se o campo é obrigatório |

## Interface DateRange

```tsx
export interface DateRange {
  from: Date;
  to: Date;
}
```

## Opções Pré-definidas

O componente inclui as seguintes opções pré-definidas:

- **Todos**: Intervalo completo (1900-2100)
- **Hoje**: Data atual
- **Esta semana**: Semana atual (domingo a sábado)
- **Esta semana (sáb-sex)**: Semana atual (sábado a sexta)
- **Semana passada**: Semana anterior
- **Mês atual**: Mês atual
- **Mês passado**: Mês anterior
- **Ano atual**: Ano atual

## Funcionalidades

### Seleção por Opções Pré-definidas
- Clique em qualquer opção para selecionar automaticamente o intervalo
- Campo de busca para filtrar opções
- Seleção instantânea sem necessidade de confirmação
- Opção "Todos" mostra apenas o texto "Todos" em vez de datas

### Seleção por Calendário
- Navegação entre meses com setas
- Seleção de intervalo clicando em duas datas
- **Não fecha automaticamente** - permite seleção completa do intervalo
- Visualização clara do intervalo selecionado
- Botão de confirmação para aplicar a seleção
- Indicador visual durante a seleção do intervalo

### Inputs de Data Manual
- Dois campos de texto para inserir datas no formato dd/mm/aaaa
- Validação automática de formato e consistência
- Botão "Aplicar Datas" para confirmar a seleção manual
- Atualização automática do calendário para a data inicial

### Formatação
- Datas formatadas no padrão brasileiro (dd/MM/yyyy)
- Texto descritivo do intervalo selecionado
- Suporte para localização pt-BR

## Estilização

O componente usa Tailwind CSS e segue o design system do projeto:

- Cores consistentes com o tema
- Estados visuais para hover, focus e erro
- Animações suaves para transições
- Responsividade para diferentes tamanhos de tela

## Dependências

- `react-day-picker`: Para o componente de calendário
- `date-fns`: Para manipulação de datas
- `lucide-react`: Para ícones
- `@radix-ui/react-popover`: Para o popover de seleção

## Exemplo Completo

Veja o arquivo `StepableDateRangeExample.tsx` para um exemplo completo de uso com diferentes variações do componente.

## Contribuição

Para contribuir com melhorias no componente:

1. Mantenha a consistência com o design system existente
2. Adicione testes para novas funcionalidades
3. Atualize a documentação conforme necessário
4. Siga os padrões de código do projeto
