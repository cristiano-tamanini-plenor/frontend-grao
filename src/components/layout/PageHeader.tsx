import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, icon, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:h-16 shrink-0 gap-4 sm:items-center border-b px-4 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-xl font-semibold truncate">{title}</h1>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex gap-2 shrink-0">
          {children}
        </div>
      )}
    </header>
  );
}
