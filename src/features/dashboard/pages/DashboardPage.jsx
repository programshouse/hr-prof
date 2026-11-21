import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth/auth.store';
import {
  hasItemPermission,
  toBooleanFlag,
  getDefaultAuthorizedRoute,
} from '@/lib/permissions';
import { DeptBarChart } from '../components/DeptBarChart';
import { EmployeeTrendLineChart } from '../components/EmployeeTrendLineChart';
import SummaryStatGrid from '../components/SummaryStatGrid';
import EmployeesTable from '../components/EmployeesTable';
import ExpiringEmployeesTables from '../components/ExpiringEmployeesTables';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, permissions } = useAuthStore();
  const isSuperAdmin = toBooleanFlag(user?.is_super_admin);

  const effectivePermissions =
    Array.isArray(user?.permissions) && user.permissions.length > 0
      ? user.permissions
      : Array.isArray(permissions)
        ? permissions
        : [];

  const canViewDashboard = hasItemPermission(
    ['dashboard.*', 'dashboard.index', 'dashboard', 'home.*'],
    effectivePermissions,
    isSuperAdmin
  );

  if (!canViewDashboard) {
    const fallback = getDefaultAuthorizedRoute(effectivePermissions, isSuperAdmin);
    return <Navigate to={fallback === '/' ? '/employees' : fallback} replace />;
  }

  return (
    <div className="space-y-6 lg:space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
      <SummaryStatGrid />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DeptBarChart />
        <EmployeeTrendLineChart />
      </div>
      <ExpiringEmployeesTables compact />
      <EmployeesTable />
    </div>
  );
}
