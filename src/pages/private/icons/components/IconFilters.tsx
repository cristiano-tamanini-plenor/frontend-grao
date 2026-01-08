import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InputText } from '@/components/input/InputText';
import { InputSelect } from '@/components/input/InputSelect';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';

interface IconFiltersForm {
  name: string;
  type: string;
  status: string;
}

export function IconFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const formMethods = useForm<IconFiltersForm>({
    defaultValues: {
      name: searchParams.get('name') || '',
      type: searchParams.get('type') || '',
      status: searchParams.get('status') || '',
    },
  });

  const { watch, reset } = formMethods;
  const name = watch('name');
  const type = watch('type');
  const status = watch('status');

  // Atualiza URL quando os filtros mudam
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (name) params.set('name', name);
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    
    setSearchParams(params, { replace: true });
  }, [name, type, status, setSearchParams]);

  const handleClear = () => {
    reset({
      name: '',
      type: '',
      status: '',
    });
    setSearchParams({}, { replace: true });
  };

  const hasFilters = name || type || status;

  return (
    <FormProvider {...formMethods}>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-[200px]">
            <InputText
              control={formMethods.control}
              name="name"
              placeholder="Nome do ícone..."
            />
          </div>
          
          <div className="w-[150px]">
            <InputSelect
              control={formMethods.control}
              name="type"
              placeholder="Todas as variantes"
              options={[
                { value: 'Linear', label: 'Linear' },
                { value: 'Outline', label: 'Outline' },
                { value: 'TwoTone', label: 'TwoTone' },
                { value: 'Bulk', label: 'Bulk' },
                { value: 'Broken', label: 'Broken' },
                { value: 'Bold', label: 'Bold' },
              ]}
            />
          </div>
          
          <div className="w-[130px]">
            <InputSelect
              control={formMethods.control}
              name="status"
              placeholder="Todos"
              options={[
                { value: 'true', label: 'Ativo' },
                { value: 'false', label: 'Inativo' },
              ]}
            />
          </div>
        </div>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </FormProvider>
  );
}

