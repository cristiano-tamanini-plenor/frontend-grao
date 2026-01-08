import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

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
  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

interface ImageUploadProps {
  label: string;
  description?: string;
  currentImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({ 
  label, 
  description, 
  currentImageUrl, 
  onImageChange,
  accept = 'image/jpeg,image/png,image/gif',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o preview quando currentImageUrl mudar
  useEffect(() => {
    if (selectedFile) {
      // Se há um arquivo selecionado, cria preview local
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (currentImageUrl) {
      // Se há uma URL do backend, constrói a URL completa
      const fullUrl = buildImageUrl(currentImageUrl);
      setPreviewUrl(fullUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [currentImageUrl, selectedFile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`);
      return;
    }

    // Validar tipo
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      toast.error('Por favor, selecione uma imagem JPEG, PNG ou GIF.');
      return;
    }

    setSelectedFile(file);
    onImageChange?.(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    // Limpa o arquivo selecionado, mas mantém a preview da URL original se existir
    const fullUrl = buildImageUrl(currentImageUrl);
    setPreviewUrl(fullUrl);
    onImageChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="flex items-start gap-4">
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="space-y-2 flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {previewUrl ? 'Alterar imagem' : 'Escolher imagem'}
          </Button>
        </div>
      </div>
    </div>
  );
}

