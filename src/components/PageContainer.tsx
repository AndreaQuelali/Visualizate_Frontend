import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
}

export default function PageContainer({ children, title }: PageContainerProps) {
  return (
    <div className="flex flex-col gap-4">
      {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
      <div>{children}</div>
    </div>
  );
}
