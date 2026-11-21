
import { useAuthStore } from '@/services/auth/auth.store';

export function toBooleanFlag(value) {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true'
  );
}

export function getEffectivePermissions(state) {
  const auth = state || useAuthStore.getState();

  const raw =
    (Array.isArray(auth?.permissions) &&
    auth.permissions.length > 0
      ? auth.permissions
      : Array.isArray(auth?.user?.permissions)
        ? auth.user.permissions
        : []) || [];

  return raw
    .map((p) =>
      (typeof p === 'string' ? p : p?.name || '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

export function isUserSuperAdmin(state) {
  const auth = state || useAuthStore.getState();

  return toBooleanFlag(auth?.user?.is_super_admin);
}

export function hasItemPermission(
  requiredPermissions,
  userPermissions = [],
  isSuperAdmin = false
) {
  if (isSuperAdmin) return true;

  if (
    !requiredPermissions ||
    requiredPermissions.length === 0
  ) {
    return true;
  }

  const rawUserPerms = Array.isArray(userPermissions)
    ? userPermissions
    : [];

  if (rawUserPerms.length === 0) return false;

  const normalizedUserPerms = rawUserPerms
    .map((p) =>
      (typeof p === 'string' ? p : p?.name || '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);

  if (normalizedUserPerms.length === 0) return false;

  if (normalizedUserPerms.includes('*')) return true;

  const requiredList = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return requiredList.some((req) => {
    if (!req) return false;

    const r = String(req).trim().toLowerCase();

    // 1. Exact permission match
    if (normalizedUserPerms.includes(r)) {
      return true;
    }

    // 2. Wildcard requirement
    if (r.endsWith('.*')) {
      const prefix = r.slice(0, -1);
      const baseName = r.slice(0, -2);

      return normalizedUserPerms.some(
        (p) => p.startsWith(prefix) || p === baseName
      );
    }

    // 3. User has module wildcard permission
    const dotIndex = r.indexOf('.');

    if (dotIndex > 0) {
      const moduleName = r.slice(0, dotIndex);

      if (
        normalizedUserPerms.includes(`${moduleName}.*`) ||
        normalizedUserPerms.includes(moduleName)
      ) {
        return true;
      }
    }

    return false;
  });
}

export const ASSETS_ROUTE_PERMISSIONS = ['assets.index'];

export const EMPLOYEE_ASSETS_ROUTE_PERMISSIONS = ['employee_assets.index'];

// Asset statistics are accessed through the employee-assets endpoint.
export const ASSETS_STATS_PERMISSIONS = ['employee_assets.index'];

export function hasPermission(permission) {
  const auth = useAuthStore.getState();

  if (isUserSuperAdmin(auth)) return true;

  const userPerms = getEffectivePermissions(auth);

  return hasItemPermission(permission, userPerms, false);
}

/**
 * Reactively evaluate whether the authenticated user satisfies a permission requirement.
 *
 * @param {string | string[]} permission
 * @returns {boolean}
 */
export function useHasPermission(permission) {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const auth = { user, permissions };

  if (isUserSuperAdmin(auth)) return true;

  return hasItemPermission(
    permission,
    getEffectivePermissions(auth),
    false
  );
}

export function hasRole(role) {
  const { user } = useAuthStore.getState();

  return user?.role === role;
}

export function hasAnyRole(roles) {
  const { user } = useAuthStore.getState();

  return roles.includes(user?.role);
}

export function hasAllPermissions(permissions) {
  const auth = useAuthStore.getState();

  if (isUserSuperAdmin(auth)) return true;

  const userPerms = getEffectivePermissions(auth);

  return permissions.every((permission) =>
    hasItemPermission(permission, userPerms, false)
  );
}

// =====================================================
// Route Permissions Mapping
// =====================================================

export const ROUTE_PERMISSIONS = [
  { path: '/', perms: ['home.index'] },
  { path: '/home-header', perms: ['home.index'] },
  { path: '/table', perms: ['applicants.index'] },
  { path: '/applicants', perms: ['applicants.index'] },
  { path: '/public-questions', perms: ['interview_questions.index'] },
  { path: '/interview-questions', perms: ['interview_questions.index'] },
  { path: '/interview-sections', perms: ['interview_sections.index'] },
  { path: '/interviews', perms: ['interviews.index'] },
  { path: '/internship', perms: ['internship.index'] },
  { path: '/internships', perms: ['internship.index'] },
  { path: '/candidates', perms: ['candidates.index'] },
  { path: '/positions', perms: ['positions.index'] },
  { path: '/positions/report', perms: ['positions.index'] },
  { path: '/positions-employees', perms: ['positions.index'] },
  { path: '/jobs', perms: ['positions.index'] },
  { path: '/employees', perms: ['employees.index'] },
  { path: '/inactive-employees', perms: ['employees.inactive_index'] },
  { path: '/employees/inactive', perms: ['employees.inactive_index'] },
  { path: '/total-employees', perms: ['employees.total_employees'] },
  { path: '/employees/total', perms: ['employees.total_employees'] },
  { path: '/tree-of-employees', perms: ['head_managers.index'] },
  { path: '/structure', perms: ['head_managers.index', 'departments.index'] },
  { path: '/departments-list', perms: ['departments.index'] },
  { path: '/departments/report', perms: ['departments.index'] },
  { path: '/departments', perms: ['departments.index'] },
  { path: '/expiring-national-ids', perms: ['employees.expiring_national_ids'] },
  { path: '/expiring-contracts', perms: ['employees.expiring_contracts'] },
  { path: '/expiry-dates', perms: ['employees.expiring_national_ids', 'employees.expiring_contracts'] },
  { path: '/daily-report', perms: ['attendances.reports'] },
  { path: '/attendance', perms: ['attendances.index'] },
  { path: '/overview', perms: ['attendances.index'] },
  { path: '/attendance/overview', perms: ['attendances.index'] },
  { path: '/finger-print-issues', perms: ['attendances.fingerprint_issues'] },
  { path: '/attendance/fingerprint-issues', perms: ['attendances.fingerprint_issues'] },
  { path: '/employees-with-schedule-overrides', perms: ['Exceptions.index'] },
  { path: '/exceptions', perms: ['Exceptions.index'] },
  { path: '/salaries', perms: ['payroll.index'] },
  { path: '/account-payroll-sheet', perms: ['payroll.account_sheet'] },
  { path: '/salary-sheet', perms: ['payroll.sheet'] },
  { path: '/overtime-summary', perms: ['reports.overtime_summary'] },
  { path: '/account-payroll-freelance-sheet', perms: ['payroll.freelance_hours'] },
  { path: '/freelance-payroll', perms: ['payroll.freelance_hours'] },
  { path: '/account-payroll-tasks-sheet', perms: ['payroll.freelance_tasks'] },
  { path: '/freelance-tasks-payroll', perms: ['payroll.freelance_tasks'] },
  { path: '/all-employees', perms: ['salary_changes.index'] },
  { path: '/salary-updates', perms: ['salary_changes.index'] },
  { path: '/accountant-sheet', perms: ['payroll.accountant_sheet'] },
  { path: '/overtime-minutes-summary', perms: ['reports.overtime_summary'] },
  { path: '/salary-overtime', perms: ['payroll.overtime'] },
  { path: '/overtime-sheet', perms: ['reports.overtime_sheet'] },
  { path: '/deduction-minutes-summary', perms: ['reports.deductions'] },
  { path: '/late-sheet', perms: ['reports.late_sheet'] },
  { path: '/salary-methods', perms: ['salary_methods.index'] },
  { path: '/absence-report', perms: ['reports.absence'] },
  { path: '/absence-sheet', perms: ['reports.absence'] },
  { path: '/joined-during-period', perms: ['reports.joined_employees'] },
  { path: '/joined-employees-sheet', perms: ['reports.joined_employees'] },
  { path: '/left-during-period', perms: ['reports.left_employees'] },
  { path: '/left-employees-sheet', perms: ['reports.left_employees'] },
  { path: '/header-kpi-stats', perms: ['kpi.index'] },
  { path: '/kpi-performance', perms: ['kpi.index'] },
  { path: '/kpi-sheet', perms: ['kpi.sheet'] },
  { path: '/commissions', perms: ['commissions.index'] },
  { path: '/commission-performance', perms: ['commissions.index'] },
  { path: '/meetings', perms: ['meetings.index'] },
  { path: '/meetings-sheet', perms: ['meetings.index'] },
  { path: '/freelancer-employees', perms: ['freelance_employee_tasks.index'] },
  { path: '/freelancers', perms: ['freelance_employee_tasks.index'] },
  { path: '/general-holidays', perms: ['holidays.general'] },
  { path: '/official-holiday-attendances', perms: ['holidays.official_attendance'] },
  { path: '/total-holidays', perms: ['holidays.index'] },
  { path: '/weekends', perms: ['weekends.index'] },
  { path: '/rewards', perms: ['rewards.index'] },
  { path: '/penalties', perms: ['penalties.index'] },
  { path: '/leaves', perms: ['leaves.index'] },
  { path: '/holidays', perms: ['holidays.index'] },
  { path: '/remotely', perms: ['remotely.index'] },
  { path: '/overtime', perms: ['overtime.index'] },
  { path: '/loans', perms: ['loans.index'] },
  { path: '/resignations', perms: ['resignations.index'] },
  { path: '/branch-transfers', perms: ['branch_transfers.index'] },
  { path: '/allowances', perms: ['employee_allowances.index'] },
  { path: '/missions', perms: ['missions.index'] },
  { path: '/external-missions', perms: ['missions.index'] },
  { path: '/freelance-employee-tasks', perms: ['freelance_employee_tasks.index'] },
  { path: '/employee-tasks', perms: ['employee_tasks.index'] },
  { path: '/tasks', perms: ['freelance_employee_tasks.index', 'employee_tasks.index'] },
  { path: '/assets', perms: ['assets.index'] },
  { path: '/assets/employees', perms: ['employee_assets.index'] },
  { path: '/admins', perms: ['admins.index'] },
  { path: '/permissions', perms: ['admins.manage_permissions'] },
  { path: '/permissions/management', perms: ['admins.manage_permissions'] },
  { path: '/activity-logs', perms: ['activity_logs.index'] },
  { path: '/employee-credentials', perms: ['employee_credentials.index'] },
  { path: '/users', perms: ['employee_credentials.index'] },
  { path: '/settings', perms: ['settings.index'] },
];

// =====================================================
// Route Permission Helpers
// =====================================================

export function getRoutePermissions(path) {
  if (!path) return [];

  const normalizedPath =
    path === '/'
      ? '/'
      : `/${String(path)
          .split('?')[0]
          .split('#')[0]
          .replace(/^\/+|\/+$/g, '')}`;

  const route = ROUTE_PERMISSIONS.find(
    (item) => item.path === normalizedPath
  );

  return route?.perms || [];
}

export function canAccessRoute(
  path,
  permissions = [],
  isSuperAdmin = false
) {
  if (isSuperAdmin) return true;

  const requiredPermissions = getRoutePermissions(path);

  if (requiredPermissions.length === 0) {
    return false;
  }

  return hasItemPermission(
    requiredPermissions,
    permissions,
    false
  );
}

// =====================================================
// Default Authorized Route
// =====================================================

export function getDefaultAuthorizedRoute(
  permissions = [],
  isSuperAdmin = false
) {
  if (isSuperAdmin) return '/';

  const userPerms = Array.isArray(permissions)
    ? permissions
    : [];

  // Dashboard has highest priority
  if (
    hasItemPermission(
      ['home.index'],
      userPerms,
      false
    )
  ) {
    return '/';
  }

  // Priority order for initial redirect
  const priorityPaths = [
    '/employees',
    '/applicants',
    '/daily-report',
    '/overview',
    '/account-payroll-sheet',
    '/accountant-sheet',
    '/leaves',
    '/holidays',
    '/weekends',
    '/employee-tasks',
    '/interviews',
    '/candidates',
    '/departments-list',
    '/permissions',
  ];

  for (const path of priorityPaths) {
    if (canAccessRoute(path, userPerms, false)) {
      return path;
    }
  }

  // Check every other configured route
  for (const route of ROUTE_PERMISSIONS) {
    if (
      route.path !== '/' &&
      canAccessRoute(route.path, userPerms, false)
    ) {
      return route.path;
    }
  }

  // No matching permissions
  return '/unauthorized';
}
