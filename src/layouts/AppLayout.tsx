import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import CreateWorkspaceDialog from '@/features/workspace/components/CreateWorkspaceDialog';

export default function AppLayout() {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Sidebar onCreateWorkspace={() => setCreateOpen(true)} />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300',
          isSidebarOpen ? 'pl-64' : 'pl-[72px]',
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
