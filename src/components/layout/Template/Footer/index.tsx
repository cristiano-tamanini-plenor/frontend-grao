import { ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Footer component for page layouts.
 * This is a basic footer wrapper that can be extended.
 */
export default function Footer({ children, className = "" }: FooterProps) {
  return (
    <footer 
      className={`h-8 w-full border-t ${className}`}
      style={{ backgroundColor: 'hsl(var(--footer-bg-color))' }}
    >
      {children || (
        <div className="p-2 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Grupo Primo. Todos os direitos reservados.
        </div>
      )}
    </footer>
  );
}