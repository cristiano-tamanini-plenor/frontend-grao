import { useTheme } from '@/theme/useTheme';
import logomarcaEscura from '@/assets/logomarcaEscura.svg';
import logomarcaClara from '@/assets/logomarcaClara.svg';

interface LogomarcaProps {
  className?: string;
  alt?: string;
}

export default function Logomarca({ className = '', alt = 'Grão Logo' }: LogomarcaProps) {
  const { mode } = useTheme();
  
  // dark mode (fundo escuro) = logo clara (branca)
  // light mode (fundo claro) = logo escura (colorida)
  const logoSrc = mode === 'dark' ? logomarcaClara : logomarcaEscura;

  return (
    <img 
      src={logoSrc} 
      alt={alt} 
      className={className || 'h-8 w-auto'} 
    />
  );
}