import { Outlet } from 'react-router';
import { Sidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';

export function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar user={user} /> */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="container p-8">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
      <Toaster />
    </div>
  );
} 