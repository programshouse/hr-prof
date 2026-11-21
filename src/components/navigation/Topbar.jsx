import React, { useEffect, useMemo, useState } from 'react';
import { Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/services/auth/auth.store';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';
import { queryClient } from '@/lib/react-query';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import NotificationBell from '@/features/notifications/components/NotificationBell';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';

const kebabToCamel = (str) =>
  str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

const PATH_SEGMENT_OVERRIDES = {
  'assets/employees': 'navigation.assetsEmployees',
  'employees/inactive': 'navigation.inactive',
  'employees/total': 'navigation.total',
  'attendance/overview': 'navigation.overview',
  'attendance/fingerprint-issues': 'navigation.fingerprintIssues',
  'attendance/employee': 'navigation.employee',
  'departments/report': 'navigation.departments',
  'positions/report': 'navigation.positions',
  'permissions/management': 'navigation.permissionManagement',
  'salary-updates': 'navigation.salaryUpdates',
  'salary-sheet': 'navigation.salarySheet',
  'accountant-sheet': 'navigation.accountantSheet',
  'overtime-sheet': 'navigation.overtimeSheet',
  'overtime-summary': 'navigation.overtimeSummary',
  'late-sheet': 'navigation.lateSheet',
  'meetings-sheet': 'navigation.meetingsSheet',
  'general-holidays': 'navigation.generalHolidays',
  'total-holidays': 'navigation.totalHolidays',
  'branch-transfers': 'navigation.branchTransfer',
  'activity-logs': 'navigation.activityLogs',
  'commission-performance': 'navigation.commissionPerformance',
  'kpi-performance': 'navigation.kpiPerformance',
  'external-missions': 'navigation.externalMissions',
  'employee-tasks': 'navigation.employeeTasks',
  'resignations': 'navigation.resign',
  'overtime': 'navigation.overTime',
  'permissions': 'navigation.permissions',
};

const SEGMENT_OVERRIDES = {
  assets: 'navigation.assets',
  resignations: 'navigation.resign',
  remotely: 'navigation.remotely',
  overtime: 'navigation.overTime',
  report: 'navigation.report',
  apply: 'navigation.applicants',
  new: 'common.addNew',
  edit: 'common.edit',
};

export function Topbar() {
  const { t, i18n } = useTranslation();

  const { clearAuth } = useAuthStore();
  const { fetchEmployee } = useEmployeeStore();

  const breadcrumbNames = useBreadcrumbStore((state) => state.names);

  const isRTL = i18n.language === 'ar';

  const [employeeCodes, setEmployeeCodes] = useState({});
  const [isEmployeeCrumbLoading, setIsEmployeeCrumbLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const pathSegments = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname]
  );

  // ==============================
  // FETCH EMPLOYEE CODE (ID → CODE)
  // ==============================
  useEffect(() => {
    const numericSegments = pathSegments.filter(seg => /^\d+$/.test(seg));

    if (numericSegments.length === 0) {
      setEmployeeCodes({});
      return;
    }

    const load = async () => {
      setIsEmployeeCrumbLoading(true);

      try {
        const cached = queryClient.getQueryData(['employees']) || [];
        const codesMap = {};

        for (const employeeId of numericSegments) {
          if (employeeCodes[employeeId]) {
            codesMap[employeeId] = employeeCodes[employeeId];
            continue;
          }

          const found = cached.find(
            (e) =>
              String(e.id) === String(employeeId) ||
              String(e.employee_id) === String(employeeId)
          );

          let code = found?.employee_code || found?.code || found?.data?.employee_code || found?.data?.code;

          if (!code) {
            try {
              const employee = await fetchEmployee(employeeId, false);
              code =
                employee?.employee_code ||
                employee?.code ||
                employee?.data?.employee_code ||
                employee?.data?.code;
            } catch (err) {
              code = employeeId;
            }
          }

          codesMap[employeeId] = code || employeeId;
        }

        setEmployeeCodes((prev) => ({ ...prev, ...codesMap }));
      } catch (err) {
        console.error('Error fetching employee codes:', err);
      } finally {
        setIsEmployeeCrumbLoading(false);
      }
    };

    load();
  }, [pathSegments, fetchEmployee]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const formatSegmentTitle = (segment, index) => {
    const pathKey = pathSegments.slice(0, index + 1).join('/');

    if (breadcrumbNames[pathKey]) return breadcrumbNames[pathKey];
    if (breadcrumbNames[segment]) return breadcrumbNames[segment];

    const pathOverride = PATH_SEGMENT_OVERRIDES[pathKey];
    if (pathOverride) return t(pathOverride);

    const segmentOverride = SEGMENT_OVERRIDES[segment.toLowerCase()];
    if (segmentOverride) return t(segmentOverride);

    // ==============================
    // EMPLOYEE ID → EMPLOYEE CODE
    // ==============================
    if (/^\d+$/.test(segment)) {
      return employeeCodes[segment] ||
        (isEmployeeCrumbLoading ? '...' : segment);
    }

    const camelKey = kebabToCamel(segment.toLowerCase());
    const navKey = `navigation.${camelKey}`;
    const translated = t(navKey);
    if (translated !== navKey) return translated;

    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-col gap-2 border-b border-gray-300 px-3 py-2 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-3"
    >
      {/* Breadcrumb */}
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            {pathSegments.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{t('navigation.dashboard')}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    {t('navigation.dashboard')}
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {pathSegments.map((segment, index) => {
                  const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                  const isLast = index === pathSegments.length - 1;
                  const displayTitle = formatSegmentTitle(segment, index);

                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>
                            {displayTitle}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right Side */}
      <div className="flex w-full gap-3 sm:w-auto sm:items-center">
        <LanguageSwitcher />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="input"
              size="icon"
              className="size-8 rounded-full border-2 border-gray-200"
            >
              <User className="text-primary size-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem onClick={handleLogout}>
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}