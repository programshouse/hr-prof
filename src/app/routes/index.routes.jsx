// src/routes/index.routes.jsx

import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthGuard, GuestGuard, SuperAdminGuard, EmployeeAreaGuard, PermissionGuard } from './guards';
import {
  ASSETS_ROUTE_PERMISSIONS,
  EMPLOYEE_ASSETS_ROUTE_PERMISSIONS,
} from '@/lib/permissions';

import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

import { lazy } from 'react';

// Redirect component for internship to employee routing
const InternshipToEmployeeRedirect = () => {
  const pathSegments = window.location.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  return <Navigate to={`/employees/${id}`} replace />;
};

const LoansListPage = lazy(() => import('@/features/loans/pages/LoansListPage'));

const LoginPage = lazy(() => import('@/features/pages/LoginPage'));

const SsoLogin = lazy(() => import('@/features/auth/SsoLogin'));

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ExpiringContractsPage = lazy(() => import('@/features/dashboard/pages/ExpiringContractsPage'));
const ExpiringNationalIdsPage = lazy(() => import('@/features/dashboard/pages/ExpiringNationalIdsPage'));

const EmployeesListPage = lazy(() => import('@/features/employees/pages/EmployeesListPage'));

const InactiveEmployeesPage = lazy(
  () => import('@/features/employees/pages/InactiveEmployeesPage')
);

const TotalEmployeesPage = lazy(() => import('@/features/employees/pages/TotalEmployeesPage'));

const EmployeeDetailsPage = lazy(() => import('@/features/employees/pages/EmployeeDetailsPage'));

const AttendancePage = lazy(() => import('@/features/attendance/pages/AttendancePage'));

const EmployeeAttendancePage = lazy(
  () => import('@/features/attendance/pages/EmployeeAttendancePage')
);

const AttendanceOverviewPage = lazy(
  () => import('@/features/attendanceOverview/pages/AttendanceOverviewPage')
);

const PayrollPage = lazy(() => import('@/features/payroll/pages/PayrollPage'));

const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

const PenaltiesListPage = lazy(() => import('@/features/penalties/pages/PenaltiesListPage'));

const LeavesListPage = lazy(() => import('@/features/leaves/pages/LeavesListPage'));

const HolidaysListPage = lazy(() => import('@/features/holidays/pages/HolidaysListPage'));

const TotalHolidaysPage = lazy(() => import('@/features/holidays/pages/TotalHolidaysPage'));

const OfficialHolidayAttendancesPage = lazy(
  () =>
    import(
      '@/features/official-holiday-attendances/pages/OfficialHolidayAttendancesPage'
    )
);

const WeekendsListPage = lazy(() => import('@/features/weekends/pages/WeekendsListPage'));

const InternshipsListPage = lazy(() => import('@/features/internships/pages/InternshipsListPage'));

const RewardsListPage = lazy(() => import('@/features/rewards/pages/RewardsListPage'));

const RemotelyListPage = lazy(() => import('@/features/remotely/pages/RemotelyListPage'));

const OvertimeListPage = lazy(() => import('@/features/overtime/pages/OvertimeListPage'));

const KpiEmployeesListPage = lazy(() => import('@/features/kpi/pages/KpiEmployeesListPage'));

const KpiPerformanceFormPage = lazy(
  () => import('@/features/kpi/pages/KpiPerformanceFormPage.jsx')
);

const FreelancersPage = lazy(() => import('@/features/kpi/pages/FreelancersPage.jsx'));

const CommissionEmployeesListPage = lazy(
  () => import('@/features/commission/pages/CommissionEmployeesListPage')
);

const CommissionPerformanceFormPage = lazy(
  () => import('@/features/commission/pages/CommissionPerformanceFormPage')
);

const GeneralHolidaysPage = lazy(
  () => import('@/features/generalholidays/pages/GeneralHolidaysPage')
);

const ResignationsListPage = lazy(
  () => import('@/features/resignations/pages/ResignationsListPage')
);

const BranchTransfersListPage = lazy(
  () => import('@/features/branch-transfers/pages/BranchTransfersListPage')
);

const FingerprintIssuesPage = lazy(
  () => import('@/features/fingerprintIssues/pages/FingerprintIssuesPage')
);

const SalariesPage = lazy(() => import('@/features/salaries/pages/SalariesPage'));

const EmployeeSalaryPage = lazy(() => import('@/features/salaries/pages/EmployeeSalaryPage'));

const SalaryUpdatesPage = lazy(() => import('@/features/salaries/pages/SalaryUpdatesPage'));

const SalaryUpdatesCreatePage = lazy(
  () => import('@/features/salaries/pages/SalaryUpdatesCreatePage')
);

const SalaryUpdatesEditPage = lazy(() => import('@/features/salaries/pages/SalaryUpdatesEditPage'));

const SalaryUpdatesViewPage = lazy(() => import('@/features/salaries/pages/SalaryUpdatesViewPage'));

const SalarySheetPage = lazy(() => import('@/features/salaries/pages/SalarySheetPage'));

const SalaryOvertimePage = lazy(
  () => import('@/features/salaries/pages/SalaryOvertime/SalaryOvertimePage')
);

const OvertimeSheetPage = lazy(() => import('@/features/overtime/pages/OvertimeSheetPage'));

const MeetingsPage = lazy(() => import('@/features/meetings/pages/MeetingsPage'));

const MeetingsSheetPage = lazy(() => import('@/features/meetings/pages/MeetingsSheetPage'));

const ExternalMissionsPage = lazy(
  () => import('@/features/external-missions/pages/ExternalMissionsPage')
);

const AssetsPage = lazy(() => import('@/features/assets/pages/AssetsPage'));
const AssetsEmployeesPage = lazy(() => import('@/features/assets/pages/AssetsEmployeesPage'));

const InterviewListPage = lazy(() => import('@/features/interviews/pages/InterviewListPage'));

const NotFoundPage = lazy(() => import('@/features/error/pages/NotFoundPage'));

// Public employee form page
const PublicEmployeeFormPage = lazy(
  () => import('@/features/employees/pages/PublicEmployeeFormPage')
);

const ApplicantsPage = lazy(() => import('@/features/applicants/pages/ApplicantsPage.jsx'));

const StructurePage = lazy(() => import('@/features/structure/pages/StructurePage'));

const InsuranceEmployeesPage = lazy(
  () => import('@/features/insurance-employees/pages/InsuranceEmployeesPage')
);

const DepartmentsReportIndexPage = lazy(
  () => import('@/features/departments/pages/DepartmentsReportIndexPage')
);

const DepartmentReportPage = lazy(
  () => import('@/features/departments/pages/DepartmentReportPage')
);

const PositionsReportIndexPage = lazy(
  () => import('@/features/positions/pages/PositionsReportIndexPage')
);

const PositionReportPage = lazy(() => import('@/features/positions/pages/PositionReportPage'));

const ExceptionsPage = lazy(() => import('@/features/exceptions/pages/ExceptionsPage'));

const PublicApplicantFormPage = lazy(
  () => import('@/features/applicants/pages/PublicApplicantFormPage')
);

const PublicQuestionsPage = lazy(() => import('@/features/jobs/pages/PublicQuestionsPage'));
const ApplicantProfilePage = lazy(() => import('@/features/applicants/pages/ApplicantProfilePage'));

const PermissionManagementPage = lazy(
  () => import('@/features/permissions/pages/PermissionManagement')
);

const AdminsPage = lazy(() => import('@/features/Admins/pages/AdminsPage'));

const UsersPage = lazy(() => import('@/features/Users/pages/UsersPage'));

const ActivityLogsPage = lazy(() => import('@/features/activity-logs/pages/ActivityLogsPage'));

const AccountantSheetPage = lazy(
  () => import('@/features/accountant-sheet/pages/AccountantSheetPage')
);

const AllowancesPage = lazy(() => import('@/features/allowances/pages/AllowancesPage'));

const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage'));

const EmployeeTasksPage = lazy(() => import('@/features/employee-tasks/pages/EmployeeTasksPage'));

const OvertimeSummaryPage = lazy(() => import('@/features/overtime/pages/OvertimeSummaryPage'));

const LateSheetPage = lazy(() => import('@/features/late-sheet/pages/LateSheetPage'));
const AbsenceSheetPage = lazy(() => import('@/features/absence-sheet/pages/AbsenceSheetPage'));
const JoinedEmployeesSheetPage = lazy(() => import('@/features/joined-employees-sheet/pages/JoinedEmployeesSheetPage'));
const LeftEmployeesSheetPage = lazy(() => import('@/features/left-employees-sheet/pages/LeftEmployeesSheetPage'));

const JobsPage = lazy(() => import('@/features/jobs/pages/JobsPage'));

const CandidatesPage = lazy(() => import('@/features/candidates/pages/CandidatesPage'));

const CandidateProfilePage = lazy(() => import('@/features/candidates/pages/CandidateProfilePage'));

const FreelancePayrollSheetPage = lazy(
  () => import('@/features/salaries/pages/FreelancePayrollSheetPage')
);

const FreelanceTasksPayrollPage = lazy(
  () => import('@/features/salaries/pages/FreelanceTasksPayrollPage')
);

const FreelanceEmployeeTasksDetailsPage = lazy(
  () => import('@/features/salaries/pages/FreelanceEmployeeTasksDetailsPage')
);

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/employees/apply',
    element: <PublicEmployeeFormPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/employees/apply/:code',
    element: <PublicEmployeeFormPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/applicants/apply',
    element: <PublicApplicantFormPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/applicants/apply/:code',
    element: <PublicApplicantFormPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/public/questions',
    element: <PublicQuestionsPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/public/questions/:positionId',
    element: <PublicQuestionsPage />,
    errorElement: <ErrorBoundary />,
  },

  // Guest-only (login)
  {
    element: <GuestGuard />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
        ],
      },
    ],
  },

  // Auth-only area
  {
    element: <AuthGuard />,
    children: [
      {
        // Employee-portal logins are confined to /profile by this guard;
        // HR/admin logins pass through untouched.
        element: <EmployeeAreaGuard />,
        children: [
          {
            element: <DashboardLayout />,
            errorElement: <ErrorBoundary />,
            children: [
              { path: '/', element: <DashboardPage /> },
              { path: '/expiry-dates', element: <Navigate to="/expiring-contracts" replace /> },
              { path: '/expiring-contracts', element: <ExpiringContractsPage /> },
              { path: '/expiring-national-ids', element: <ExpiringNationalIdsPage /> },

              { path: '/employees', element: <EmployeesListPage /> },
              { path: '/employees/inactive', element: <InactiveEmployeesPage /> },
              { path: '/employees/total', element: <TotalEmployeesPage /> },
              { path: '/employees/:id', element: <EmployeeDetailsPage /> },

              // Applicants
              { path: '/applicants', element: <ApplicantsPage /> },
              { path: '/applicants/:id', element: <ApplicantProfilePage /> },

              { path: '/salaries', element: <SalariesPage /> },
              { path: '/salaries/:employeeId', element: <EmployeeSalaryPage /> },

              { path: '/freelance-payroll', element: <FreelancePayrollSheetPage /> },
              {
                path: '/freelance-tasks-payroll',
                element: <FreelanceTasksPayrollPage />,
              },
              {
                path: '/freelance-tasks-payroll/:employeeId',
                element: <FreelanceEmployeeTasksDetailsPage />,
              },

              { path: '/salary-updates', element: <SalaryUpdatesPage /> },
              { path: '/salary-updates/new', element: <SalaryUpdatesCreatePage /> },
              { path: '/salary-updates/:id/edit', element: <SalaryUpdatesEditPage /> },
              { path: '/salary-updates/:id', element: <SalaryUpdatesViewPage /> },

              { path: '/salary-sheet', element: <SalarySheetPage /> },
              {
                path: '/salary-overtime',
                element: <SalaryOvertimePage />,
              },

              { path: '/overtime-sheet', element: <OvertimeSheetPage /> },

              { path: '/meetings', element: <MeetingsPage /> },
              { path: '/meetings-sheet', element: <MeetingsSheetPage /> },

              { path: '/external-missions', element: <ExternalMissionsPage /> },

              { path: '/internships', element: <InternshipsListPage /> },
              { path: '/internships/:id', element: <InternshipToEmployeeRedirect /> },

              { path: '/attendance', element: <AttendancePage /> },
              { path: '/attendance/employee/:employeeId', element: <EmployeeAttendancePage /> },
              { path: '/attendance/overview', element: <AttendanceOverviewPage /> },
              { path: '/attendance/fingerprint-issues', element: <FingerprintIssuesPage /> },

              { path: '/payroll', element: <PayrollPage /> },

              { path: '/penalties', element: <PenaltiesListPage /> },
              { path: '/leaves', element: <LeavesListPage /> },
              { path: '/remotely', element: <RemotelyListPage /> },
              { path: '/holidays', element: <HolidaysListPage /> },
              { path: '/total-holidays', element: <TotalHolidaysPage /> },
              {
                path: '/official-holiday-attendances',
                element: <OfficialHolidayAttendancesPage />,
              },

              { path: '/weekends', element: <WeekendsListPage /> },
              { path: '/rewards', element: <RewardsListPage /> },
              { path: '/overtime', element: <OvertimeListPage /> },
              { path: '/loans', element: <LoansListPage /> },
              { path: '/branch-transfers', element: <BranchTransfersListPage /> },
              { path: '/resignations', element: <ResignationsListPage /> },
              { path: '/general-holidays', element: <GeneralHolidaysPage /> },

              { path: '/kpi-performance', element: <KpiEmployeesListPage /> },
              { path: '/kpi-performance/:employeeId', element: <KpiPerformanceFormPage /> },
              { path: '/freelancers', element: <FreelancersPage /> },

              { path: '/commission-performance', element: <CommissionEmployeesListPage /> },
              {
                path: '/commission-performance/:employeeId',
                element: <CommissionPerformanceFormPage />,
              },

              {
                path: '/assets',
                element: (
                  <PermissionGuard permission={ASSETS_ROUTE_PERMISSIONS}>
                    <AssetsPage />
                  </PermissionGuard>
                ),
              },
              {
                path: '/assets/employees',
                element: (
                  <PermissionGuard permission={EMPLOYEE_ASSETS_ROUTE_PERMISSIONS}>
                    <AssetsEmployeesPage />
                  </PermissionGuard>
                ),
              },

              { path: '/interviews', element: <InterviewListPage /> },

              { path: '/settings', element: <SettingsPage /> },

              { path: '/departments/report', element: <DepartmentsReportIndexPage /> },
              { path: '/departments/report/:departmentId', element: <DepartmentReportPage /> },
              { path: '/positions/report', element: <PositionsReportIndexPage /> },
              { path: '/positions/report/:positionId', element: <PositionReportPage /> },
              { path: '/structure', element: <StructurePage /> },
              { path: '/insurance-employees', element: <InsuranceEmployeesPage /> },

              { path: '/exceptions', element: <ExceptionsPage /> },
              { path: '/accountant-sheet', element: <AccountantSheetPage /> },
              { path: '/allowances', element: <AllowancesPage /> },
              { path: '/tasks', element: <TasksPage /> },
              { path: '/employee-tasks', element: <EmployeeTasksPage /> },

              {
                path: '/permissions/management',
                element: (
                  <PermissionGuard permission={['list.permissions', 'permissions.*', 'permissions.index']}>
                    <PermissionManagementPage />
                  </PermissionGuard>
                ),
              },
              {
                path: '/admins',
                element: (
                  <PermissionGuard permission={['admins.index', 'admins.*']}>
                    <AdminsPage />
                  </PermissionGuard>
                ),
              },
              {
                path: '/users',
                element: (
                  <PermissionGuard permission={['employee_credentials.index', 'employee_credentials.*', 'users.*', 'users.index']}>
                    <UsersPage />
                  </PermissionGuard>
                ),
              },
              {
                path: '/activity-logs',
                element: (
                  <PermissionGuard permission={['activity_logs.index', 'activity_logs.*']}>
                    <ActivityLogsPage />
                  </PermissionGuard>
                ),
              },

              { path: '/overtime-summary', element: <OvertimeSummaryPage /> },

              { path: '/late-sheet', element: <LateSheetPage /> },
              { path: '/absence-sheet', element: <PermissionGuard permission='absence_report.all_employees_absence_report'><AbsenceSheetPage /></PermissionGuard> },
              { path: '/joined-employees-sheet', element: <JoinedEmployeesSheetPage /> },
              { path: '/left-employees-sheet', element: <LeftEmployeesSheetPage /> },

              { path: '/jobs', element: <JobsPage /> },
              { path: '/jobs/:positionId', element: <JobsPage /> },

              { path: '/candidates', element: <CandidatesPage /> },
              { path: '/candidates/:id', element: <CandidateProfilePage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '/sso', element: <SsoLogin /> },

  { path: '*', element: <NotFoundPage /> },
]);