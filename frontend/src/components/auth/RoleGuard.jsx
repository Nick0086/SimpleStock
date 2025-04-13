import { useAuth } from '@/contexts/AuthContext';

export function RoleGuard({ 
  children, 
  roles, 
  fallback = null 
}) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return children;
}

// Usage example:
export function AdminPanel() {
  return (
    <RoleGuard roles={['admin']}>
      <div>Admin only content</div>
    </RoleGuard>
  );
}

export function ManagerTools() {
  return (
    <RoleGuard 
      roles={['admin', 'manager']}
      fallback={<div>Access denied</div>}
    >
      <div>Management tools</div>
    </RoleGuard>
  );
} 