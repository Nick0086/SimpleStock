import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className=" mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user.name}</h1>
      <DashboardStats />
      <RecentActivity />
    </div>
  );
} 