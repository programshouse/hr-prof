import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserMinus,
  UserCheck,
  Clock,
  LayoutDashboard,
  ChevronLeft,
  Menu,
  Settings,
  LogOut,
  ClipboardList,
  CircleAlert,
  Medal,
  CalendarClock,
  Home,
  Handshake,
  ArrowRightLeft,
  Banknote,
  FileText,
  ChevronDown,
  Fingerprint,
  ChartNoAxesColumnIncreasing,
  DollarSign,
  Package,
  GraduationCap,
  CalendarRange,
  UserCheck2,
  TrendingUp,
  Building2,
  UserPlus,
  BriefcaseBusiness,
  MapPinned,
  ClipboardCheck,
  Settings2,
  Scale,
  Network,
  ClockFading,
  List,
  FileSpreadsheet,
  CalendarMinus,
  Shield,
  UserRoundPlus,
  UserRoundMinus,
  FileUser,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/services/auth/auth.store';
import {
  ASSETS_ROUTE_PERMISSIONS,
  EMPLOYEE_ASSETS_ROUTE_PERMISSIONS,
  hasItemPermission,
  toBooleanFlag,
} from '@/lib/permissions';
import { useDashboardHeader } from '@/features/dashboard/hooks/useDashboardHeader';
import { useEffect, useState } from 'react';

/* =========================================================
 * Menu Items
 * ======================================================= */

const getMenuItems = (t) => [
  {
    path: '/',
    label: t('navigation.dashboard'),
    icon: LayoutDashboard,
    permissions: [
      'home.index',
      'home.*',
      'dashboard.*',
      'dashboard.index',
      'dashboard',
    ],
  },
];

/* =========================================================
 * Employee Profile
 * ======================================================= */

const getEmployeeProfileGroup = (t, profilePath) => ({
  label: t('navigation.profile', 'Profile'),
  icon: UserCheck,

  children: [
    {
      path: `${profilePath}?tab=personalInformation`,
      label: t(
        'employees.profile.tabs.personalInformation',
        'Personal Information',
      ),
      icon: UserCheck,
      tab: 'personalInformation',
    },

    {
      path: `${profilePath}?tab=qualifications`,
      label: t('employees.profile.tabs.qualifications', 'Qualifications'),
      icon: GraduationCap,
      tab: 'qualifications',
    },

    {
      path: `${profilePath}?tab=activity`,
      label: t('employees.profile.tabs.activity', 'Activity'),
      icon: ClipboardList,
      tab: 'activity',
    },

    {
      path: `${profilePath}?tab=totalHoliday`,
      label: t('employees.profile.tabs.totalHoliday', 'Total Holiday'),
      icon: CalendarRange,
      tab: 'totalHoliday',
    },

    {
      path: `${profilePath}?tab=rewardsAndPenalties`,
      label: t(
        'employees.profile.tabs.rewardsAndPenalties',
        'Rewards & Penalties',
      ),
      icon: Medal,
      tab: 'rewardsAndPenalties',
    },

    {
      path: `${profilePath}?tab=salary`,
      label: t('employees.profile.tabs.salary', 'Salary'),
      icon: DollarSign,
      tab: 'salary',
    },

    {
      path: `${profilePath}?tab=meetings`,
      label: t('employees.profile.tabs.meetings', 'Meetings'),
      icon: Users,
      tab: 'meetings',
    },

    {
      path: `${profilePath}?tab=assets`,
      label: t('employees.profile.tabs.assets', 'Assets'),
      icon: Package,
      tab: 'assets',
    },

    {
      path: `${profilePath}?tab=exceptions`,
      label: t('employees.profile.tabs.exceptions', 'Exceptions'),
      icon: CircleAlert,
      tab: 'exceptions',
    },
  ],
});

/* =========================================================
 * Employee Requests
 * ======================================================= */

const getEmployeeRequestsGroup = (t, profilePath) => ({
  label: t('employees.profile.tabs.requests', 'Requests'),

  icon: ClipboardCheck,

  children: [
    {
      path: `${profilePath}?tab=requests&subtab=leaves`,
      label: t('requests.table.types.leaves', 'Leaves'),
      icon: FileText,
      tab: 'requests',
      subtab: 'leaves',
    },

    {
      path: `${profilePath}?tab=requests&subtab=days-off`,
      label: t('requests.table.types.daysOff', 'Days Off'),
      icon: CalendarClock,
      tab: 'requests',
      subtab: 'days-off',
    },

    {
      path: `${profilePath}?tab=requests&subtab=loans`,
      label: t('requests.table.types.loans', 'Loans'),
      icon: Banknote,
      tab: 'requests',
      subtab: 'loans',
    },

    {
      path: `${profilePath}?tab=requests&subtab=remotely`,
      label: t('requests.table.types.remotely', 'Remotely'),
      icon: Home,
      tab: 'requests',
      subtab: 'remotely',
    },

    {
      path: `${profilePath}?tab=requests&subtab=overtimes`,
      label: t('requests.table.types.overtimes', 'Overtimes'),
      icon: Clock,
      tab: 'requests',
      subtab: 'overtimes',
    },

    {
      path: `${profilePath}?tab=requests&subtab=branch-transfers`,
      label: t('requests.table.types.branchTransfers', 'Branch Transfers'),
      icon: ArrowRightLeft,
      tab: 'requests',
      subtab: 'branch-transfers',
    },

    {
      path: `${profilePath}?tab=requests&subtab=resignations`,
      label: t('requests.table.types.resignations', 'Resignations'),
      icon: Handshake,
      tab: 'requests',
      subtab: 'resignations',
    },
  ],
});

/* =========================================================
 * Employee KPI
 * ======================================================= */

const getEmployeeKpiGroup = (t, profilePath) => ({
  label: t('employees.profile.tabs.kpiPerformance', 'KPI Performance'),

  icon: ChartNoAxesColumnIncreasing,

  children: [
    {
      path: `${profilePath}?tab=kpiPerformance&subtab=items`,
      label: t('kpi.tabs.items', 'Items'),
      icon: List,
      tab: 'kpiPerformance',
      subtab: 'items',
    },

    {
      path: `${profilePath}?tab=kpiPerformance&subtab=performance`,
      label: t('kpi.tabs.performance', 'Performance'),
      icon: TrendingUp,
      tab: 'kpiPerformance',
      subtab: 'performance',
    },
  ],
});

/* =========================================================
 * Employee Settings
 * ======================================================= */

const getEmployeeSettingsGroup = (t, profilePath) => ({
  label: t('navigation.settings', 'Settings'),

  icon: Settings,

  children: [
    {
      path: `${profilePath}?tab=payrollSetting`,
      label: t('employees.profile.tabs.payrollSetting', 'Payroll Setting'),
      icon: Settings2,
      tab: 'payrollSetting',
    },
  ],
});

/* =========================================================
 * Employee Team
 * ======================================================= */

const getEmployeeTeamGroup = (t, profilePath) => ({
  label: t('navigation.team', 'Team'),

  icon: Users,

  children: [
    {
      path: `${profilePath}?tab=teams&subtab=members`,
      label: t('employees.profile.manager.tabs.members', 'Members'),
      icon: Users,
      tab: 'teams',
      subtab: 'members',
    },

    {
      path: `${profilePath}?tab=teams&subtab=attendance`,
      label: t('employees.profile.manager.tabs.attendance', 'Attendance'),
      icon: Clock,
      tab: 'teams',
      subtab: 'attendance',
    },

    {
      path: `${profilePath}?tab=teams&subtab=requests`,
      label: t('employees.profile.manager.tabs.requests', 'Requests'),
      icon: FileText,
      tab: 'teams',
      subtab: 'requests',
    },

    {
      path: `${profilePath}?tab=teams&subtab=kpi`,
      label: t('employees.profile.tabs.kpiPerformance', 'KPI'),
      icon: ChartNoAxesColumnIncreasing,
      tab: 'teams',
      subtab: 'kpi',
    },
  ],
});

/* =========================================================
 * Hiring
 * ======================================================= */

const getHiringGroup = (t) => ({
  label: t('navigation.hiring'),
  icon: UserPlus,

  children: [
    {
      path: '/applicants',
      label: t('navigation.applicants'),
      icon: UserPlus,
      permissions: ['applicants.*', 'applicants.index', 'applicants.show'],
    },

    {
      path: '/public/questions',
      label: t('navigation.publicQuestions', 'Public Questions'),
      icon: FileText,
      permissions: [
        'questions.*',
        'public_questions.*',
        'jobs.*',
        'jobs.index',
      ],
    },

    {
      path: '/interviews',
      label: t('navigation.interviews'),
      icon: UserCheck2,
      permissions: ['interviews.*', 'interviews.index'],
    },

    {
      path: '/internships',
      label: t('navigation.internships'),
      icon: GraduationCap,
      permissions: [
        'internship.index',
        'internship.*',
        'internships.*',
        'internships.index',
      ],
    },

    {
      path: '/candidates',
      label: t('navigation.candidates'),
      icon: UserCheck,
      permissions: ['candidates.index', 'candidates.*'],
    },

    {
      path: '/jobs',
      label: t('navigation.jobs'),
      icon: BriefcaseBusiness,
      permissions: ['jobs.*', 'jobs.index'],
    },
  ],
});

/* =========================================================
 * Expiry Group
 * ======================================================= */

const getExpiryGroup = (t) => ({
  label: t('navigation.expiry', 'Expiry'),

  icon: CalendarClock,

  children: [
    {
      path: '/expiring-national-ids',
      label: t('navigation.expiryDate', 'Expiry Date'),
      icon: FileUser,
      permissions: [
        'employees.expiring_national_ids',
        'expiring_national_ids.*',
        'expiring_national_ids.index',
        'national_ids.*',
        'expiry.*',
      ],
    },

    {
      path: '/expiring-contracts',
      label: t('navigation.contract', 'Contract'),
      icon: FileText,
      permissions: [
        'employees.expiring_contracts',
        'expiring_contracts.*',
        'expiring_contracts.index',
        'contracts.*',
        'expiry.*',
      ],
    },
  ],
});

/* =========================================================
 * Structure
 * ======================================================= */

const getStructureGroup = (t) => ({
  label: t('navigation.structure'),
  icon: Network,

  children: [
    {
      path: '/structure',
      label: t('navigation.organizationStructure'),
      icon: Network,
      permissions: [
        'head_managers.index',
        'head_managers.*',
        'structure.*',
        'departments.*',
        'departments.index',
        'positions.*',
      ],
    },

    {
      path: '/departments/report',
      label: t('navigation.departments'),
      icon: Building2,
      permissions: ['departments.index', 'departments.*', 'departments.report'],
    },

    {
      path: '/positions/report',
      label: t('navigation.positions'),
      icon: BriefcaseBusiness,
      permissions: ['positions.index', 'positions.*', 'positions.report'],
    },
  ],
});

/* =========================================================
 * Assets
 * ======================================================= */

const getAssetsGroup = (t) => ({
  label: t('navigation.assets'),
  icon: Package,

  children: [
    {
      path: '/assets',
      label: t('navigation.assetsList'),
      icon: Package,
      permissions: ASSETS_ROUTE_PERMISSIONS,
    },

    {
      path: '/assets/employees',
      label: t('navigation.assetsEmployees'),
      icon: Users,
      permissions: EMPLOYEE_ASSETS_ROUTE_PERMISSIONS,
    },
  ],
});

/* =========================================================
 * Employees
 * ======================================================= */

const getEmployeesGroup = (t) => ({
  label: t('navigation.employees'),
  icon: Users,

  children: [
    {
      path: '/employees',
      label: t('navigation.active'),
      icon: UserCheck,
      permissions: ['employees.index', 'employees.show'],
    },

    {
      path: '/employees/inactive',
      label: t('navigation.inactive'),
      icon: UserMinus,
      permissions: [
        'employees.inactive_index',
        'employees.inactive',
      ],
    },

    {
      path: '/employees/total',
      label: t('navigation.total'),
      icon: Users,
      permissions: [
        'employees.total_employees',
        'employees.total',
      ],
    },
  ],
});

/* =========================================================
 * Attendance
 * ======================================================= */

const getAttendanceGroup = (t) => ({
  label: t('navigation.attendance'),
  icon: Clock,

  children: [
    {
      path: '/attendance',
      label: t('navigation.checkIn'),
      icon: Clock,
      permissions: [
        'attendances.index',
        'attendance.index',
        'attendance.*',
        'attendances.*',
        'daily_report.*',
      ],
    },

    {
      path: '/attendance/overview',
      label: t('navigation.overview'),
      icon: ClipboardList,
      permissions: [
        'attendances.index',
        'attendance.index',
        'attendance.*',
        'attendances.*',
        'attendance.overview',
        'attendances.overview',
      ],
    },

    {
      path: '/attendance/fingerprint-issues',
      label: t('navigation.fingerprintIssues'),
      icon: Fingerprint,
      permissions: [
        'attendances.fingerprint_issues',
        'fingerprint_issues.*',
        'attendance.fingerprint_issues',
        'attendances.fingerprint_issues',
        'attendance.*',
      ],
    },

    {
      path: '/exceptions',
      label: t('navigation.exceptions'),
      icon: UserMinus,
      permissions: ['Exceptions.index', 'exceptions.index', 'exceptions.*'],
    },
  ],
});

/* =========================================================
 * Sheets
 * ======================================================= */

const getSheetsGroup = (t) => ({
  label: t('navigation.sheets') || 'Sheets',

  icon: FileSpreadsheet,

  children: [
    {
      path: '/overtime-summary',
      label: t('navigation.overtimeSummary') || 'Overtime Summary',
      icon: FileSpreadsheet,
      permissions: [
        'payroll.index',
        'payroll.*',
        'payroll.monthly_overtime_summary',
        'overtime_summary.*',
        'overtime_summary.index',
        'overtime.*',
      ],
    },

    {
      path: '/late-sheet',
      label: t('navigation.lateSheet') || 'Late Sheet',
      icon: Clock,
      permissions: [
        'deductions.index',
        'deductions.*',
        'late_sheets.*',
        'late_sheet.*',
        'lates.*',
        'attendance.*',
      ],
    },

    {
      path: '/absence-sheet',
      label: t('navigation.absenceSheet') || 'Absence Report',
      icon: FileUser,
      // The absence-report API requires its own permission.
      // employees.index alone must not expose this page.
      permissions: ['absence_report.all_employees_absence_report'],
    },

    {
      path: '/joined-employees-sheet',
      label: t('navigation.joinedEmployees') || 'Joined Employees',
      icon: UserRoundPlus,
      permissions: [
        'employees.joined_during_period',
        'joined_employees.*',
        'joined_employees_sheet.*',
      ],
    },

    {
      path: '/left-employees-sheet',
      label: t('navigation.leftEmployees') || 'Left Employees',
      icon: UserRoundMinus,
      permissions: [
        'employees.left_during_period',
        'left_employees.*',
        'left_employees_sheet.*',
      ],
    },
  ],
});

/* =========================================================
 * Salary
 * ======================================================= */

const getSalaryDetailsGroup = (t) => ({
  label: t('navigation.salaryDetails'),

  icon: DollarSign,

  children: [
    {
      path: '/salaries',
      label: t('navigation.salaries'),
      icon: DollarSign,
      permissions: ['salaries.index', 'salaries.*', 'salary.*'],
    },

    {
      path: '/salary-sheet',
      label: t('navigation.salarySheet'),
      icon: FileText,
      permissions: [
        'account_payroll_sheet.index',
        'account_payroll_sheet.*',
        'salaries.*',
        'salary_sheets.*',
        'salaries.sheet',
        'salary_sheets.index',
      ],
    },

    {
      path: '/salary-overtime',
      label: t('navigation.salaryOvertime'),
      icon: Clock,
      permissions: [
        'overtime.index',
        'overtime.*',
        'salaries.*',
        'salary_overtimes.*',
        'salary_overtime.index',
        'overtimes.*',
      ],
    },

    {
      path: '/freelance-payroll',
      label: t('navigation.freelancePayroll'),
      icon: FileText,
      permissions: [
        'account_payroll_sheet.index',
        'account_payroll_sheet.*',
        'salaries.*',
        'freelance_payrolls.*',
        'freelancers.*',
        'freelance_payroll.index',
      ],
    },

    {
      path: '/freelance-tasks-payroll',
      label: t('navigation.freelanceTasksPayroll'),
      icon: ClipboardList,
      permissions: [
        'account_payroll_sheet.index',
        'account_payroll_sheet.*',
        'freelance_employee_tasks.index',
        'freelance_employee_tasks.*',
        'salaries.*',
        'freelance_tasks_payrolls.*',
        'freelancers.*',
      ],
    },

    {
      path: '/salary-updates',
      label: t('navigation.salaryUpdates'),
      icon: Banknote,
      permissions: [
        'salary_changes.index',
        'salary_changes.*',
        'salaries.*',
        'salary_updates.*',
        'salary_updates.index',
      ],
    },

    {
      path: '/accountant-sheet',
      label: t('navigation.accountantSheet'),
      icon: FileText,
      permissions: [
        'accountant_sheet.index',
        'accountant_sheet.*',
        'salaries.*',
        'accountant_sheets.*',
      ],
    },

    {
      path: '/insurance-employees',
      label: t('navigation.insuranceEmployees'),
      icon: Shield,
      permissions: [
        'insured_employees.insured_employees',
        'insured_employees.*',
        'insurance_employees.*',
        'insurance_employees.index',
      ],
    },
  ],
});

/* =========================================================
 * Requests
 * ======================================================= */

const getRequestsGroup = (t) => ({
  label: t('navigation.requests'),
  icon: ClipboardList,

  children: [
    {
      path: '/leaves',
      label: t('navigation.leaves'),
      icon: CalendarClock,
      permissions: ['leaves.index', 'leaves.*', 'requests.*'],
    },

    {
      path: '/holidays',
      label: t('navigation.dayoff'),
      icon: CalendarClock,
      permissions: [
        'holidays.index',
        'holidays.*',
        'days_off.*',
        'days_off.index',
        'requests.*',
      ],
    },

    {
      path: '/remotely',
      label: t('navigation.remotely'),
      icon: Home,
      permissions: [
        'remotely.index',
        'remotely.*',
        'remotelies.*',
        'requests.*',
      ],
    },

    {
      path: '/overtime',
      label: t('navigation.overTime'),
      icon: Clock,
      permissions: [
        'overtime.index',
        'overtime.*',
        'overtimes.*',
        'requests.*',
      ],
    },

    {
      path: '/loans',
      label: t('navigation.loans'),
      icon: Banknote,
      permissions: ['loans.index', 'loans.*', 'requests.*'],
    },

    {
      path: '/resignations',
      label: t('navigation.resign'),
      icon: Handshake,
      permissions: ['resignations.index', 'resignations.*', 'requests.*'],
    },

    {
      path: '/branch-transfers',
      label: t('navigation.branchTransfer'),
      icon: ArrowRightLeft,
      permissions: [
        'branch_transfers.index',
        'branch_transfers.*',
        'branch-transfers.*',
        'requests.*',
      ],
    },
  ],
});

/* =========================================================
 * Performance
 * ======================================================= */

const getPerformanceGroup = (t) => ({
  label: t('navigation.performance'),

  icon: TrendingUp,

  children: [
    {
      path: '/kpi-performance',
      label: t('navigation.kpiPerformance'),
      icon: ChartNoAxesColumnIncreasing,
      permissions: [
        'employee_kpi.index',
        'employee_kpi.*',
        'kpis.*',
        'kpi.*',
        'kpi_performances.*',
        'kpi.index',
      ],
    },

    {
      path: '/commission-performance',
      label: t('navigation.commissionPerformance'),
      icon: TrendingUp,
      permissions: [
        'commissions.index',
        'commissions.*',
        'commission.*',
        'commission_performances.*',
        'commission.index',
      ],
    },
  ],
});

/* =========================================================
 * Management Access
 * ======================================================= */

const getManagementAccessGroup = (t) => ({
  label: t('navigation.managementAccess'),

  icon: ClipboardCheck,

  children: [
    {
      path: '/admins',
      label: t('navigation.admins'),
      icon: Users,
      permissions: ['admins.index', 'admins.*'],
    },

    {
      path: '/permissions/management',
      label: t('navigation.permissionManagement'),
      icon: Settings2,
      permissions: [
        'list.permissions',
        'permissions.*',
        'permissions.index',
      ],
    },

    {
      path: '/activity-logs',
      label: t('navigation.activityLogs'),
      icon: FileText,
      permissions: [
        'activity_logs.index',
        'activity_logs.*',
        'activity-logs.*',
      ],
    },
  ],
});

/* =========================================================
 * Holidays
 * ======================================================= */

const getHolidaysGroup = (t) => ({
  label: t('navigation.holidays'),

  icon: CalendarRange,

  children: [
    {
      path: '/general-holidays',
      label: t('navigation.generalHolidays'),
      icon: CalendarClock,
      permissions: [
        'holidays.index',
        'holidays.*',
        'general_holidays.*',
        'general-holidays.*',
        'general_holidays.index',
      ],
    },

    {
      path: '/official-holiday-attendances',
      label: t('navigation.officialHolidayAttendance'),
      icon: CalendarClock,
      permissions: [
        'official_holiday_attendances.index',
        'official_holiday_attendances.*',
        'official_holiday_attendances.store',
        'official_holiday_attendances.show',
        'official_holiday_attendances.update',
        'official_holiday_attendances.destroy',
      ],
    },

    {
      path: '/total-holidays',
      label: t('navigation.totalHolidays'),
      icon: CalendarRange,
      permissions: [
        'holidays.index',
        'holidays.*',
        'total_holidays.*',
        'total-holidays.*',
        'total_holidays.index',
      ],
    },

    {
      path: '/weekends',
      label: t('navigation.weekends'),
      icon: CalendarMinus,
      permissions: [
        'weekends.index',
        'weekends.*',
        'weekends.update',
        'weekends.destroy',
        'weekends.remove_employee_from_weekend',
      ],
    },
  ],
});

/* =========================================================
 * Rewards / Penalties
 * ======================================================= */

const getRewardsAndPenaltiesGroup = (t) => ({
  label: `${t('navigation.rewards')} & ${t('navigation.penalties')}`,

  icon: Scale,

  children: [
    {
      path: '/rewards',
      label: t('navigation.rewards'),
      icon: Medal,
      permissions: ['rewards.index', 'rewards.*'],
    },

    {
      path: '/penalties',
      label: t('navigation.penalties'),
      icon: CircleAlert,
      permissions: ['penalties.index', 'penalties.*'],
    },
  ],
});

/* =========================================================
 * Tasks
 * ======================================================= */

const getEmployeeTasksGroup = (t) => ({
  label: t('navigation.employeeTasks') || 'Employee Tasks',

  icon: ClipboardCheck,

  children: [
    {
      path: '/tasks',
      label: t('navigation.tasks'),
      icon: List,
      permissions: [
        'employee_tasks.index',
        'employee_tasks.*',
        'tasks.*',
        'tasks.index',
      ],
    },

    {
      path: '/employee-tasks',
      label: t('navigation.employeeTasksList'),
      icon: List,
      permissions: [
        'employee_tasks.index',
        'employee_tasks.*',
        'tasks.*',
      ],
    },
  ],
});

/* =========================================================
 * Freelancers
 * ======================================================= */

const getFreelancersMenuItem = (t) => ({
  path: '/freelancers',
  label: t('navigation.freelancers'),
  icon: ClockFading,
  permissions: [
    'freelance_employee_tasks.index',
    'freelance_employee_tasks.*',
    'freelancers.*',
    'freelancers.index',
  ],
});

/* =========================================================
 * Bottom
 * ======================================================= */

const getBottomMenu = (t) => [
  {
    path: '/settings',
    label: t('navigation.settings'),
    icon: Settings,
    permissions: [
      'list.permissions',
      'salary_methods.index',
      'salary_methods.*',
      'permission',
      'permissions',
      'permission.*',
      'permissions.*',
      'permission.index',
      'permissions.index',
      'settings.*',
      'settings.index',
    ],
  },
];

/* =========================================================
 * Helpers
 * ======================================================= */

const isPathActive = (pathname, path) =>
  pathname === path || pathname.startsWith(path + '/');

/* =========================================================
 * Sidebar Link
 * ======================================================= */

function SidebarLink({
  to,
  icon: Icon,
  label,
  isActive,
  sidebarCollapsed,
  isMobile,
  isRTL,
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-[3px] px-3 py-2 transition-colors',

        isActive
          ? cn(
              'border-tertiary bg-[#2B3953] font-medium',

              isRTL ? 'border-r-[5px]' : 'border-l-[5px]',
            )
          : 'hover:bg-[#2B3953] hover:text-white',

        sidebarCollapsed && 'justify-center',

        isMobile && sidebarCollapsed && 'h-10 w-10 justify-center p-0',
      )}
    >
      <Icon className="size-5 shrink-0" />

      {!sidebarCollapsed && <span>{label}</span>}
    </Link>
  );
}

/* =========================================================
 * Sidebar Group
 * ======================================================= */

function SidebarGroup({
  group,
  open,
  setOpen,
  isActive,
  sidebarCollapsed,
  isRTL,
  location,
  customActiveCheck,
}) {
  const GroupIcon = group.icon;

  const resolvedOpen = isActive || open;

  return (
    <div>
      <button
        type="button"
        onClick={() => !sidebarCollapsed && setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center gap-3 rounded-[3px] px-3 py-2 transition-colors',

          isActive || resolvedOpen
            ? 'bg-[#2B3953] font-medium'
            : 'hover:bg-[#2B3953]',

          sidebarCollapsed && 'justify-center',
        )}
      >
        <GroupIcon className="size-5 shrink-0" />

        {!sidebarCollapsed && (
          <>
            <span className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
              {group.label}
            </span>

            <ChevronDown
              className={cn(
                'size-4 transition-transform',

                resolvedOpen && 'rotate-180',
              )}
            />
          </>
        )}
      </button>

      {!sidebarCollapsed && resolvedOpen && (
        <div className={cn('relative mt-1', isRTL ? 'pr-8' : 'pl-8')}>
          <div
            className={cn(
              'absolute top-0 h-full w-px bg-white/30',

              isRTL ? 'right-5' : 'left-5',
            )}
          />

          <div className="space-y-1">
            {group.children.map((child, index) => {
              const ChildIcon = child.icon;

              const childActive = customActiveCheck
                ? customActiveCheck(child)
                : isPathActive(location.pathname, child.path);

              const isLast = index === group.children.length - 1;

              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-[3px] px-3 py-2 transition-colors',

                    childActive
                      ? 'bg-[#2B3953] font-medium'
                      : 'hover:bg-[#2B3953]',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1/2 h-px w-4 bg-white/30',

                      isRTL ? '-right-3' : '-left-3',
                    )}
                  />

                  {isLast && (
                    <span
                      className={cn(
                        'absolute top-1/2 h-full w-px bg-[#1E2A3A]',

                        isRTL ? '-right-3' : '-left-3',
                      )}
                    />
                  )}

                  <ChildIcon className="size-4 shrink-0" />

                  <span className="text-[13px]">{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Sidebar
 * ======================================================= */

export function Sidebar() {
  const { t, i18n } = useTranslation();

  const location = useLocation();

  const { sidebarCollapsed, collapseSidebar } = useUIStore();

  const { user, permissions: storePermissions, clearAuth, role, isManager } = useAuthStore();

  const isSuperAdmin = toBooleanFlag(user?.is_super_admin);

  const permissions =
    Array.isArray(user?.permissions) && user.permissions.length > 0
      ? user.permissions
      : Array.isArray(storePermissions)
        ? storePermissions
        : [];

  const isEmployeeRole = role === 'employee';

  const employeePortalId = user?.id ?? user?.employee_id;

  const employeeProfilePath = employeePortalId
    ? `/employees/${employeePortalId}`
    : '/employees';

  /* ================= Employee groups ================= */

  const employeeProfileGroup = getEmployeeProfileGroup(t, employeeProfilePath);

  const employeeRequestsGroup = getEmployeeRequestsGroup(
    t,
    employeeProfilePath,
  );

  const employeeKpiGroup = getEmployeeKpiGroup(t, employeeProfilePath);

  const employeeSettingsGroup = getEmployeeSettingsGroup(
    t,
    employeeProfilePath,
  );

  const employeeTeamGroup = getEmployeeTeamGroup(t, employeeProfilePath);

  const currentSearchParams = new URLSearchParams(location.search);

  const currentTab = currentSearchParams.get('tab') || 'personalInformation';

  const currentSubtab = currentSearchParams.get('subtab');

  const employeeTabActiveCheck = (child) =>
    location.pathname === employeeProfilePath &&
    currentTab === child.tab &&
    (child.subtab === undefined || child.subtab === currentSubtab);

  const isEmployeeProfileGroupActive = employeeProfileGroup.children.some(
    (child) => employeeTabActiveCheck(child),
  );

  const isEmployeeRequestsGroupActive = employeeRequestsGroup.children.some(
    (child) => employeeTabActiveCheck(child),
  );

  const isEmployeeKpiGroupActive = employeeKpiGroup.children.some((child) =>
    employeeTabActiveCheck(child),
  );

  const isEmployeeSettingsGroupActive = employeeSettingsGroup.children.some(
    (child) => employeeTabActiveCheck(child),
  );

  const isEmployeeTeamGroupActive = employeeTeamGroup.children.some((child) =>
    employeeTabActiveCheck(child),
  );

  /* ================= Employee state ================= */

  const [employeeProfileOpen, setEmployeeProfileOpen] = useState(true);

  const [employeeRequestsOpen, setEmployeeRequestsOpen] = useState(false);

  const [employeeKpiOpen, setEmployeeKpiOpen] = useState(false);

  const [employeeSettingsOpen, setEmployeeSettingsOpen] = useState(false);

  const [employeeTeamOpen, setEmployeeTeamOpen] = useState(true);

  const { data: headerData } = useDashboardHeader({
    enabled: !isEmployeeRole,
  });

  const licenseCode =
    headerData?.data?.license_code ?? headerData?.license_code ?? null;

  const isRTL = i18n.language === 'ar';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  /* ================= Groups ================= */

  const menuItems = getMenuItems(t);

  const bottomMenu = getBottomMenu(t);

  const filterGroup = (group) => {
    if (isSuperAdmin) return group;
    const filtered = (group.children || []).filter(
      (child) =>
        !child.isHidden &&
        hasItemPermission(child.permissions, permissions, isSuperAdmin),
    );
    return {
      ...group,
      children: filtered,
    };
  };

  const rawHiringGroup = getHiringGroup(t);

  const publicQuestionsItem = rawHiringGroup.children.find((child) =>
    child.path.startsWith('/public/questions'),
  );

  if (publicQuestionsItem) {
    publicQuestionsItem.path = user?.company_id
      ? `/public/questions?company_id=${user.company_id}`
      : '/public/questions';
  }

  const hiringGroup = filterGroup(rawHiringGroup);

  const expiryGroup = filterGroup(getExpiryGroup(t));

  const structureGroup = filterGroup(getStructureGroup(t));

  const assetsGroup = filterGroup(getAssetsGroup(t));

  const employeesGroup = filterGroup(getEmployeesGroup(t));

  const attendanceGroup = filterGroup(getAttendanceGroup(t));

  const salaryDetailsGroup = filterGroup(getSalaryDetailsGroup(t));

  const sheetsGroup = filterGroup(getSheetsGroup(t));

  const requestsGroup = filterGroup(getRequestsGroup(t));

  const performanceGroup = filterGroup(getPerformanceGroup(t));

  const managementAccessGroup = filterGroup(getManagementAccessGroup(t));

  const holidaysGroup = filterGroup(getHolidaysGroup(t));

  const rewardsAndPenaltiesGroup = filterGroup(getRewardsAndPenaltiesGroup(t));

  const employeeTasksGroup = filterGroup(getEmployeeTasksGroup(t));

  const freelancersMenuItem = getFreelancersMenuItem(t);

  /* ================= Active helpers ================= */

  const groupIsActive = (group) =>
    group.children.some((child) => isPathActive(location.pathname, child.path));

  const employeesActiveCheck = (child) =>
    child.path === '/employees'
      ? location.pathname === '/employees' ||
        location.pathname === '/employees/'
      : isPathActive(location.pathname, child.path);

  const attendanceActiveCheck = (child) =>
    child.path === '/attendance'
      ? location.pathname === '/attendance' ||
        location.pathname === '/attendance/'
      : isPathActive(location.pathname, child.path);

  const assetsActiveCheck = (child) =>
    child.path === '/assets'
      ? location.pathname === '/assets' || location.pathname === '/assets/'
      : isPathActive(location.pathname, child.path);

  /* ================= Group active ================= */

  const isExpiryActive = groupIsActive(expiryGroup);

  const isHiringActive = groupIsActive(hiringGroup);

  const isStructureActive = groupIsActive(structureGroup);

  const isSalaryDetailsActive = groupIsActive(salaryDetailsGroup);

  const isSheetsActive = groupIsActive(sheetsGroup);

  const isRequestsActive = groupIsActive(requestsGroup);

  const isPerformanceActive = groupIsActive(performanceGroup);

  const isHolidaysActive = groupIsActive(holidaysGroup);

  const isRewardsAndPenaltiesActive = groupIsActive(rewardsAndPenaltiesGroup);

  const isManagementAccessActive = groupIsActive(managementAccessGroup);

  const isEmployeeTasksActive = groupIsActive(employeeTasksGroup);

  const isEmployeesActive = employeesGroup.children.some(employeesActiveCheck);

  const isAttendanceActive = attendanceGroup.children.some(
    attendanceActiveCheck,
  );

  const isAssetsActive = assetsGroup.children.some(assetsActiveCheck);

  const isExternalMissionsActive =
    location.pathname === '/external-missions' ||
    location.pathname.startsWith('/external-missions/');

  /* ================= Open state ================= */

  const [expiryOpen, setExpiryOpen] = useState(() => isExpiryActive);

  const [salaryDetailsOpen, setSalaryDetailsOpen] = useState(
    () => isSalaryDetailsActive,
  );

  const [hiringOpen, setHiringOpen] = useState(() => isHiringActive);

  const [structureOpen, setStructureOpen] = useState(() => isStructureActive);

  const [employeesOpen, setEmployeesOpen] = useState(() => isEmployeesActive);

  const [attendanceOpen, setAttendanceOpen] = useState(
    () => isAttendanceActive,
  );

  const [requestsOpen, setRequestsOpen] = useState(() => isRequestsActive);

  const [assetsOpen, setAssetsOpen] = useState(() => isAssetsActive);

  const [performanceOpen, setPerformanceOpen] = useState(
    () => isPerformanceActive,
  );

  const [holidaysOpen, setHolidaysOpen] = useState(() => isHolidaysActive);

  const [sheetsOpen, setSheetsOpen] = useState(() => isSheetsActive);

  const [rewardsAndPenaltiesOpen, setRewardsAndPenaltiesOpen] = useState(
    () => isRewardsAndPenaltiesActive,
  );

  const [managementAccessOpen, setManagementAccessOpen] = useState(
    () => isManagementAccessActive,
  );

  const [employeeTasksOpen, setEmployeeTasksOpen] = useState(
    () => isEmployeeTasksActive,
  );

  /* ================= Logout ================= */

  const handleLogout = () => {
    clearAuth();

    window.location.href = '/login';
  };

  /* ================= Resize ================= */

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [sidebarCollapsed, isMobile]);

  /* =======================================================
   * Render
   * ===================================================== */

  return (
    <>
      {isMobile && !sidebarCollapsed && (
        <div
          onClick={collapseSidebar}
          className="fixed inset-0 z-30 bg-black/40"
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'z-40 flex flex-col bg-[#1E2A3A] text-white transition-all duration-300',

          isRTL ? 'border-l border-white/10' : 'border-r border-white/10',

          !isMobile &&
            (sidebarCollapsed
              ? 'h-screen w-16 overflow-y-auto'
              : 'h-screen w-64 overflow-y-auto'),

          isMobile
            ? sidebarCollapsed
              ? 'relative h-auto w-16 overflow-visible'
              : cn(
                  'fixed top-0 h-full w-64 overflow-y-auto',

                  isRTL ? 'right-0' : 'left-0',
                )
            : '',
        )}
      >
        {/* ================= Header ================= */}

        <div
          className={cn(
            'flex px-4 py-4 transition-all',

            sidebarCollapsed
              ? 'flex-col items-center justify-center gap-2 px-2'
              : 'flex-col gap-3 md:flex-row md:items-center md:justify-between',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2',

              sidebarCollapsed && 'justify-center',
            )}
          >
            <img
              src="/nizam.svg"
              alt="NIZAM"
              className={cn(
                'w-auto transition-all duration-300',

                sidebarCollapsed ? 'h-10 opacity-100' : 'h-12 opacity-100',
              )}
            />

            {!sidebarCollapsed && (
              <span className="font-sora text-[20px] font-bold tracking-[0.06em] text-white">
                NIZAM
              </span>
            )}
          </div>

          <Button
            variant="icon"
            size="icon"
            onClick={collapseSidebar}
            className={cn(
              'rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20',

              !sidebarCollapsed && (isRTL ? 'md:mr-auto' : 'md:ml-auto'),

              sidebarCollapsed && 'mx-auto mt-2',
            )}
          >
            {sidebarCollapsed ? (
              <Menu className="size-5" />
            ) : (
              <ChevronLeft className={cn('size-5', isRTL && 'rotate-180')} />
            )}
          </Button>
        </div>

        {/* ================= License ================= */}

        {licenseCode && !sidebarCollapsed && (
          <div className="mx-3 mb-2 border-b border-white/10 pb-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/40">
              License
            </p>

            <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <Shield className="size-4 shrink-0 text-white" />

              <span className="truncate font-mono text-[11px] font-semibold tracking-wider text-white/80">
                {licenseCode}
              </span>
            </div>
          </div>
        )}

        {/* ================= Navigation ================= */}

        <nav
          className={cn(
            'space-y-1 py-4 text-sm',

            !isMobile && 'flex-1',

            isMobile &&
              sidebarCollapsed &&
              'flex flex-wrap justify-center gap-2 px-2',
          )}
        >
          {isEmployeeRole ? (
            <>
              <SidebarGroup
                group={employeeProfileGroup}
                open={employeeProfileOpen}
                setOpen={setEmployeeProfileOpen}
                isActive={isEmployeeProfileGroupActive}
                sidebarCollapsed={sidebarCollapsed}
                isRTL={isRTL}
                location={location}
                customActiveCheck={employeeTabActiveCheck}
              />

              <SidebarGroup
                group={employeeRequestsGroup}
                open={employeeRequestsOpen}
                setOpen={setEmployeeRequestsOpen}
                isActive={isEmployeeRequestsGroupActive}
                sidebarCollapsed={sidebarCollapsed}
                isRTL={isRTL}
                location={location}
                customActiveCheck={employeeTabActiveCheck}
              />

              <SidebarGroup
                group={employeeKpiGroup}
                open={employeeKpiOpen}
                setOpen={setEmployeeKpiOpen}
                isActive={isEmployeeKpiGroupActive}
                sidebarCollapsed={sidebarCollapsed}
                isRTL={isRTL}
                location={location}
                customActiveCheck={employeeTabActiveCheck}
              />

              {isManager && (
                <SidebarGroup
                  group={employeeTeamGroup}
                  open={employeeTeamOpen}
                  setOpen={setEmployeeTeamOpen}
                  isActive={isEmployeeTeamGroupActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                  customActiveCheck={employeeTabActiveCheck}
                />
              )}

              <SidebarLink
                to="/employee-tasks"
                icon={ClipboardCheck}
                label={t('navigation.employeeTasksList', 'My Tasks')}
                isActive={isPathActive(location.pathname, '/employee-tasks')}
                sidebarCollapsed={sidebarCollapsed}
                isMobile={isMobile}
                isRTL={isRTL}
              />

              <SidebarGroup
                group={employeeSettingsGroup}
                open={employeeSettingsOpen}
                setOpen={setEmployeeSettingsOpen}
                isActive={isEmployeeSettingsGroupActive}
                sidebarCollapsed={sidebarCollapsed}
                isRTL={isRTL}
                location={location}
                customActiveCheck={employeeTabActiveCheck}
              />
            </>
          ) : (
            <>
              {/* Dashboard */}

              {menuItems
                .filter((item) =>
                  hasItemPermission(item.permissions, permissions, isSuperAdmin)
                )
                .map((item) => (
                  <SidebarLink
                    key={item.path}
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                    isActive={isPathActive(location.pathname, item.path)}
                    sidebarCollapsed={sidebarCollapsed}
                    isMobile={isMobile}
                    isRTL={isRTL}
                  />
                ))}

              {/* Hiring */}

              {hiringGroup.children.length > 0 && (
                <SidebarGroup
                  group={hiringGroup}
                  open={hiringOpen}
                  setOpen={setHiringOpen}
                  isActive={isHiringActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Employees */}

              {employeesGroup.children.length > 0 && (
                <SidebarGroup
                  group={employeesGroup}
                  open={employeesOpen}
                  setOpen={setEmployeesOpen}
                  isActive={isEmployeesActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                  customActiveCheck={employeesActiveCheck}
                />
              )}

              {/* Structure */}

              {structureGroup.children.length > 0 && (
                <SidebarGroup
                  group={structureGroup}
                  open={structureOpen}
                  setOpen={setStructureOpen}
                  isActive={isStructureActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Expiry */}

              {expiryGroup.children.length > 0 && (
                <SidebarGroup
                  group={expiryGroup}
                  open={expiryOpen}
                  setOpen={setExpiryOpen}
                  isActive={isExpiryActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Attendance */}

              {attendanceGroup.children.length > 0 && (
                <SidebarGroup
                  group={attendanceGroup}
                  open={attendanceOpen}
                  setOpen={setAttendanceOpen}
                  isActive={isAttendanceActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                  customActiveCheck={attendanceActiveCheck}
                />
              )}

              {/* Salary */}

              {salaryDetailsGroup.children.length > 0 && (
                <SidebarGroup
                  group={salaryDetailsGroup}
                  open={salaryDetailsOpen}
                  setOpen={setSalaryDetailsOpen}
                  isActive={isSalaryDetailsActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Sheets */}

              {sheetsGroup.children.length > 0 && (
                <SidebarGroup
                  group={sheetsGroup}
                  open={sheetsOpen}
                  setOpen={setSheetsOpen}
                  isActive={isSheetsActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Assets */}

              {assetsGroup.children.length > 0 && (
                <SidebarGroup
                  group={assetsGroup}
                  open={assetsOpen}
                  setOpen={setAssetsOpen}
                  isActive={isAssetsActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                  customActiveCheck={assetsActiveCheck}
                />
              )}

              {/* Performance */}

              {performanceGroup.children.length > 0 && (
                <SidebarGroup
                  group={performanceGroup}
                  open={performanceOpen}
                  setOpen={setPerformanceOpen}
                  isActive={isPerformanceActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Meetings */}

              {hasItemPermission(
                ['meetings.*', 'meetings.index'],
                permissions,
                isSuperAdmin
              ) && (
                <SidebarLink
                  to="/meetings"
                  icon={Users}
                  label={t('navigation.meetings')}
                  isActive={isPathActive(location.pathname, '/meetings')}
                  sidebarCollapsed={sidebarCollapsed}
                  isMobile={isMobile}
                  isRTL={isRTL}
                />
              )}

              {/* Freelancers */}

              {hasItemPermission(
                freelancersMenuItem.permissions,
                permissions,
                isSuperAdmin
              ) && (
                <SidebarLink
                  to={freelancersMenuItem.path}
                  icon={freelancersMenuItem.icon}
                  label={freelancersMenuItem.label}
                  isActive={isPathActive(
                    location.pathname,
                    freelancersMenuItem.path,
                  )}
                  sidebarCollapsed={sidebarCollapsed}
                  isMobile={isMobile}
                  isRTL={isRTL}
                />
              )}

              {/* Holidays */}

              {holidaysGroup.children.length > 0 && (
                <SidebarGroup
                  group={holidaysGroup}
                  open={holidaysOpen}
                  setOpen={setHolidaysOpen}
                  isActive={isHolidaysActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Rewards */}

              {rewardsAndPenaltiesGroup.children.length > 0 && (
                <SidebarGroup
                  group={rewardsAndPenaltiesGroup}
                  open={rewardsAndPenaltiesOpen}
                  setOpen={setRewardsAndPenaltiesOpen}
                  isActive={isRewardsAndPenaltiesActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Requests */}

              {requestsGroup.children.length > 0 && (
                <SidebarGroup
                  group={requestsGroup}
                  open={requestsOpen}
                  setOpen={setRequestsOpen}
                  isActive={isRequestsActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Allowances */}

              {hasItemPermission(
                [
                  'employee_allowances.index',
                  'employee_allowances.*',
                  'allowances.*',
                  'allowances.index',
                ],
                permissions,
                isSuperAdmin
              ) && (
                <SidebarLink
                  to="/allowances"
                  icon={Banknote}
                  label={t('navigation.allowances')}
                  isActive={isPathActive(location.pathname, '/allowances')}
                  sidebarCollapsed={sidebarCollapsed}
                  isMobile={isMobile}
                  isRTL={isRTL}
                />
              )}

              {/* External Missions */}

              {hasItemPermission(
                [
                  'missions.index',
                  'missions.*',
                  'external_missions.*',
                  'external-missions.*',
                  'external_missions.index',
                ],
                permissions,
                isSuperAdmin
              ) && (
                <SidebarLink
                  to="/external-missions"
                  icon={MapPinned}
                  label={t('navigation.externalMissions')}
                  isActive={isExternalMissionsActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isMobile={isMobile}
                  isRTL={isRTL}
                />
              )}

              {/* Tasks */}

              {employeeTasksGroup.children.length > 0 && (
                <SidebarGroup
                  group={employeeTasksGroup}
                  open={employeeTasksOpen}
                  setOpen={setEmployeeTasksOpen}
                  isActive={isEmployeeTasksActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Management */}

              {(isSuperAdmin || managementAccessGroup.children.length > 0) && (
                <SidebarGroup
                  group={managementAccessGroup}
                  open={managementAccessOpen}
                  setOpen={setManagementAccessOpen}
                  isActive={isManagementAccessActive}
                  sidebarCollapsed={sidebarCollapsed}
                  isRTL={isRTL}
                  location={location}
                />
              )}

              {/* Users */}

              {hasItemPermission(
                [
                  'employee_credentials.index',
                  'employee_credentials.*',
                  'users.*',
                  'users.index',
                ],
                permissions,
                isSuperAdmin
              ) && (
                <SidebarLink
                  to="/users"
                  icon={UserPlus}
                  label={t('navigation.users')}
                  isActive={isPathActive(location.pathname, '/users')}
                  sidebarCollapsed={sidebarCollapsed}
                  isMobile={isMobile}
                  isRTL={isRTL}
                />
              )}
            </>
          )}
        </nav>

        {/* ================= Bottom ================= */}

        <div
          className={cn(
            'space-y-1 py-4',

            isMobile &&
              sidebarCollapsed &&
              'flex flex-wrap justify-center gap-2 px-2',
          )}
        >
          {!isEmployeeRole &&
            bottomMenu
              .filter((item) =>
                hasItemPermission(item.permissions, permissions, isSuperAdmin)
              )
              .map((item) => (
                <SidebarLink
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  isActive={isPathActive(location.pathname, item.path)}
                  sidebarCollapsed={sidebarCollapsed}
                  isMobile={isMobile}
                  isRTL={isRTL}
                />
              ))}

          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-[3px] px-3 py-2 transition-colors hover:bg-[#2B3953]',

              sidebarCollapsed && 'justify-center',

              isMobile && sidebarCollapsed && 'h-10 w-10 justify-center p-0',
            )}
          >
            <LogOut className="size-5 shrink-0" />

            {!sidebarCollapsed && <span>{t('navigation.logout')}</span>}
          </button>

          <div className="mt-4 flex items-center gap-3 border-t-[0.3px] border-white/50 px-3 py-3">
            <div className="bg-primary flex size-8 items-center justify-center rounded-full font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {!sidebarCollapsed && (
              <div
                className={cn('text-sm', isRTL ? 'text-right' : 'text-left')}
              >
                <p className="font-medium">{user?.name || 'User'}</p>

                <p className="text-xs">
                  {user?.position_name || user?.role || 'Administrator'}
                </p>

                {isEmployeeRole && (
                  <p className="text-[10px] text-white/60">Active Employee</p>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
