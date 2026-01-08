import { useState, useRef, useEffect } from 'react';
import { Upload, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { profileService } from '../services/profile.service';

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName: string;
  userEmail: string;
  onAvatarChange?: (url: string) => void;
}

export function ProfileAvatarUpload({ 
  currentAvatarUrl, 
  userName, 
  userEmail, 
  onAvatarChange 
}: ProfileAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o preview quando currentAvatarUrl mudar
  useEffect(() => {
    if (currentAvatarUrl) {
      setPreviewUrl(currentAvatarUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [currentAvatarUrl]);

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

    setIsUploading(true);
    try {
      // Preview local
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload usando profileService
      const url = await profileService.uploadAvatar(file, userName, userEmail);
      
      onAvatarChange?.(url);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join('\n')
        : error.message || 'Erro desconhecido';
      toast.error('Erro ao fazer upload do avatar: ' + errorMessage);
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={previewUrl || undefined} />
        <AvatarFallback>
          <UserIcon className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-2 text-center w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Escolher arquivo
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou WEBP. Máx. 2MB.
        </p>
      </div>
    </div>
  );
}

