import { Outlet } from 'react-router';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';

export function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <Sidebar className="w-64" />
      </div>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className=" p-8">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
      <Toaster />
    </div>
  );
} 