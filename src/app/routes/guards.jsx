import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/services/auth/auth.store';
import { hasItemPermission, toBooleanFlag } from '@/lib/permissions';

function hasStoredToken() {
  return Boolean(localStorage.getItem('accessToken'));
}

export function AuthGuard() {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated && !hasStoredToken()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function GuestGuard() {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated || hasStoredToken()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function PermissionGuard({ permission, children }) {
  const { user, permissions } = useAuthStore();
  const isSuperAdmin = toBooleanFlag(user?.is_super_admin);

  if (isSuperAdmin) {
    return children || <Outlet />;
  }

  const effectivePermissions =
    Array.isArray(user?.permissions) && user.permissions.length > 0
      ? user.permissions
      : Array.isArray(permissions)
        ? permissions
        : [];

  if (!hasItemPermission(permission, effectivePermissions, isSuperAdmin)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
}

// Employee-portal route policy:
// - every employee can open their own profile and own KPI preview
// - every employee can open the Employee Tasks screen
// - a manager can also open a team member KPI screen
// Everything else stays HR/admin-only. Backend authorization remains the
// source of truth for whether a target employee actually belongs to the team.
export function EmployeeAreaGuard() {
  const { role, user, isManager } = useAuthStore();
  const location = useLocation();

  if (role !== 'employee') {
    return <Outlet />;
  }

  const ownId = String(user?.id ?? user?.employee_id ?? '');
  const ownProfilePath = ownId ? `/employees/${ownId}` : '/employees';
  const pathname = location.pathname.replace(/\/$/, '') || '/';

  if (pathname === ownProfilePath) {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'teams' && !isManager) {
      return <Navigate to={ownProfilePath} replace />;
    }
    return <Outlet />;
  }

  if (pathname === '/employee-tasks') {
    return <Outlet />;
  }

  const kpiMatch = pathname.match(/^\/kpi-performance\/([^/]+)$/);
  if (kpiMatch) {
    const targetId = String(kpiMatch[1]);

    if (targetId === ownId || isManager) {
      return <Outlet />;
    }
  }

  return <Navigate to={ownProfilePath} replace />;
}

export function SuperAdminGuard() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated && !hasStoredToken()) {
    return <Navigate to="/login" replace />;
  }

  if (!toBooleanFlag(user?.is_super_admin)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
