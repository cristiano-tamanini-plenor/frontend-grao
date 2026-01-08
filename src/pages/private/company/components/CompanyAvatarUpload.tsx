import { useState, useRef, useEffect } from 'react';
import { Upload, User as UserIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { companiesService } from '../services/companies.service';
import { buildCompanyAvatarUrl } from '../services/companies.service';

interface CompanyAvatarUploadProps {
  currentAvatarUrl?: string | null;
  companyId: string | null; // null quando é criação (ainda não tem ID)
  companyName?: string;
  onAvatarChange?: (url: string | null) => void;
  disabled?: boolean;
}

export function CompanyAvatarUpload({ 
  currentAvatarUrl, 
  companyId,
  companyName = 'EM',
  onAvatarChange,
  disabled = false
}: CompanyAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constrói a URL completa do avatar
  const fullAvatarUrl = buildCompanyAvatarUrl(currentAvatarUrl);

  // Atualiza o preview quando currentAvatarUrl mudar
  useEffect(() => {
    if (fullAvatarUrl) {
      setPreviewUrl(fullAvatarUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [fullAvatarUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem.');
      return;
    }

    // Se não tiver companyId (criação), converte para base64 e armazena
    if (!companyId) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
      
      // Converte para base64 e notifica o componente pai
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onAvatarChange?.(base64String);
      };
      reader.onerror = () => {
        toast.error('Erro ao processar a imagem');
      };
      reader.readAsDataURL(file);
      return;
    }

    setIsUploading(true);
    try {
      // Preview local
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload usando companiesService
      const url = await companiesService.uploadAvatar(file, companyId);
      
      onAvatarChange?.(url);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao fazer upload do avatar: ' + errorMessage);
      // Reverte para o avatar anterior
      setPreviewUrl(fullAvatarUrl);
    } finally {
      setIsUploading(false);
      // Limpa o input para permitir selecionar novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!companyId) {
      setPreviewUrl(null);
      setSelectedFile(null);
      onAvatarChange?.(null);
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    try {
      await companiesService.removeAvatar(companyId);
      setPreviewUrl(null);
      onAvatarChange?.(null);
      toast.success('Avatar removido com sucesso!');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao remover avatar: ' + errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const initials = companyName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={previewUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 text-center w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {companyId ? 'Alterar' : 'Selecionar'}
          </Button>
          {previewUrl && companyId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou GIF. Máx. 2MB.
        </p>
      </div>
    </div>
  );
}

