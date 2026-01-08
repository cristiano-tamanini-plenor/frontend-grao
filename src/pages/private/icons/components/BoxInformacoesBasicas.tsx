import { useFormContext } from 'react-hook-form';
import { InputText, InputTextarea } from '@/components/input/InputText';
import { InputSwitch } from '@/components/input';
import { InputSelect } from '@/components/input/InputSelect';
import { PIcon } from '@/components/ui/p-icon';
import type { IconFormSchema } from '../schemas/icon.schemas';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

/**
 * Constrói a URL completa da imagem a partir de uma URL relativa
 */
function buildImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Se já é uma URL completa (http:// ou https://), retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se é uma URL relativa, adiciona a base da API
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export function BoxInformacoesBasicas() {
  const formMethods = useFormContext<IconFormSchema>();
  const selectedVariant = formMethods.watch('variant') || 'Linear';
  const selectedName = formMethods.watch('name');
  const selectedType = formMethods.watch('type') || 'lib';
  const selectedFile = formMethods.watch('file');
  const selectedFileDark = formMethods.watch('file_dark');
  const currentIconUrl = formMethods.watch('url');
  const currentIconUrlDark = formMethods.watch('url_dark');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrlDark, setPreviewUrlDark] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDarkInputRef = useRef<HTMLInputElement>(null);

  // Atualiza preview quando arquivo ou URL muda (light)
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentIconUrl && selectedType === 'png') {
      const fullUrl = buildImageUrl(currentIconUrl);
      setPreviewUrl(fullUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile, currentIconUrl, selectedType]);

  // Atualiza preview quando arquivo ou URL muda (dark)
  useEffect(() => {
    if (selectedFileDark) {
      const objectUrl = URL.createObjectURL(selectedFileDark);
      setPreviewUrlDark(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentIconUrlDark && selectedType === 'png') {
      const fullUrl = buildImageUrl(currentIconUrlDark);
      setPreviewUrlDark(fullUrl);
    } else {
      setPreviewUrlDark(null);
    }
  }, [selectedFileDark, currentIconUrlDark, selectedType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isDark: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (file.type !== 'image/png') {
      toast.error('Apenas arquivos PNG são permitidos');
      const ref = isDark ? fileDarkInputRef.current : fileInputRef.current;
      if (ref) {
        ref.value = '';
      }
      return;
    }

    // Validar tamanho (1MB)
    if (file.size > 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 1MB');
      const ref = isDark ? fileDarkInputRef.current : fileInputRef.current;
      if (ref) {
        ref.value = '';
      }
      return;
    }

    if (isDark) {
      formMethods.setValue('file_dark', file, { shouldValidate: true, shouldDirty: true });
    } else {
      formMethods.setValue('file', file, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleRemoveFile = (isDark: boolean = false) => {
    if (isDark) {
      formMethods.setValue('file_dark', null, { shouldValidate: true, shouldDirty: true });
      if (fileDarkInputRef.current) {
        fileDarkInputRef.current.value = '';
      }
    } else {
      formMethods.setValue('file', null, { shouldValidate: true, shouldDirty: true });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Tipo de Ícone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputSelect
          control={formMethods.control}
          name="type"
          label="Tipo de Ícone"
          placeholder="Selecione o tipo"
          description="Biblioteca: ícone predefinido | PNG: arquivo personalizado"
          options={[
            { value: 'lib', label: 'Biblioteca (lib)', code: 'Biblioteca (lib)' },
            { value: 'png', label: 'PNG (arquivo)', code: 'PNG (arquivo)' },
          ]}
          required
        />

        {/* Nome do Ícone */}
        <InputText
          control={formMethods.control}
          name="name"
          label="Nome do Ícone"
          placeholder={selectedType === 'lib' ? 'Ex: Home, User, Setting2' : 'Ex: meu-icone-customizado'}
          description={selectedType === 'lib' ? 'Digite o nome exato do ícone do iconsax-reactjs' : 'Nome do ícone personalizado'}
          required
        />
      </div>

      {/* Variante - apenas para tipo lib */}
      {selectedType === 'lib' && (
        <InputSelect
          control={formMethods.control}
          name="variant"
          label="Variante"
          placeholder="Selecione a variante"
          description="Estilo visual do ícone"
          options={[
            { value: 'Linear', label: 'Linear', code: 'Linear' },
            { value: 'Outline', label: 'Outline', code: 'Outline' },
            { value: 'TwoTone', label: 'TwoTone', code: 'TwoTone' },
            { value: 'Bulk', label: 'Bulk', code: 'Bulk' },
            { value: 'Broken', label: 'Broken', code: 'Broken' },
            { value: 'Bold', label: 'Bold', code: 'Bold' },
          ]}
          required
        />
      )}

      {/* Upload de Arquivos PNG - apenas para tipo png */}
      {selectedType === 'png' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arquivo PNG Light */}
            <FormField
              control={formMethods.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Arquivo PNG Light {!currentIconUrl ? '*' : ''}
                  </FormLabel>
                  <FormDescription>
                    {currentIconUrl 
                      ? 'Deixe em branco para manter o arquivo atual, ou selecione um novo arquivo. Tamanho máximo: 1MB.'
                      : 'Tamanho máximo: 1MB. Apenas arquivos PNG são permitidos.'
                    }
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleFileSelect(e, false)}
                        className="hidden"
                      />
                      <div className="flex items-start gap-4">
                        {previewUrl && (
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Preview Light"
                              className="h-24 w-24 object-contain rounded-md border bg-background"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => handleRemoveFile(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {selectedFile ? 'Alterar' : (currentIconUrl ? 'Substituir' : 'Escolher PNG Light')}
                          </Button>
                          {selectedFile && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Arquivo PNG Dark */}
            <FormField
              control={formMethods.control}
              name="file_dark"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Arquivo PNG Dark {!currentIconUrlDark ? '*' : ''}
                  </FormLabel>
                  <FormDescription>
                    {currentIconUrlDark 
                      ? 'Deixe em branco para manter o arquivo atual, ou selecione um novo arquivo. Tamanho máximo: 1MB.'
                      : 'Tamanho máximo: 1MB. Apenas arquivos PNG são permitidos.'
                    }
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        ref={fileDarkInputRef}
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleFileSelect(e, true)}
                        className="hidden"
                      />
                      <div className="flex items-start gap-4">
                        {previewUrlDark && (
                          <div className="relative">
                            <img
                              src={previewUrlDark}
                              alt="Preview Dark"
                              className="h-24 w-24 object-contain rounded-md border bg-background dark:bg-gray-800"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => handleRemoveFile(true)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileDarkInputRef.current?.click()}
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {selectedFileDark ? 'Alterar' : (currentIconUrlDark ? 'Substituir' : 'Escolher PNG Dark')}
                          </Button>
                          {selectedFileDark && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {selectedFileDark.name} ({(selectedFileDark.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Preview do Ícone - apenas para tipo lib */}
      {selectedName && selectedType === 'lib' && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 border rounded bg-background">
              <PIcon name={selectedName} variant={selectedVariant} size={32} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Preview do Ícone</p>
              <p className="text-xs text-muted-foreground">
                Nome: {selectedName} | Variante: {selectedVariant}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categoria */}
      <InputText
        control={formMethods.control}
        name="category"
        label="Categoria"
        placeholder="Ex: navigation, user, action"
        description="Categoria para organização dos ícones"
      />

      {/* Descrição */}
      <InputTextarea
        control={formMethods.control}
        name="description"
        label="Descrição"
        placeholder="Descreva o propósito deste ícone..."
        description="Breve descrição sobre quando usar este ícone"
        textareaProps={{
          className: 'resize-none',
          rows: 3,
        }}
      />

      {/* Ativo */}
      <InputSwitch
        control={formMethods.control}
        name="active"
        label="Ícone Ativo"
        description="Define se o ícone está ativo e disponível para uso"
      />
    </div>
  );
}

