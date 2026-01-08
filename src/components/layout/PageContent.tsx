import { cn } from '@/lib/utils';

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("flex-1 min-h-0 h-full", className)}>
      {children}
    </div>
  );
}
