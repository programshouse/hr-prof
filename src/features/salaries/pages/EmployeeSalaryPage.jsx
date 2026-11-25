// src/features/salaries/pages/EmployeeSalaryPage.jsx
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useTranslation } from 'react-i18next';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { salariesApi } from '../api/salariesApi';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { resolveLocalizedPayrollEmployee } from '@/lib/utils/employeeDisplayName';
import { useAllPositions } from '@/shared/hooks';
import { employeesApi } from '@/features/employees/api/employees.api';

// Modals
import RewardModal from '@/features/rewards/components/RewardModal';
import DeleteRewardModal from '@/features/rewards/components/DeleteRewardModal';
import PenaltyModal from '@/features/penalties/components/PenaltyModal';
import DeletePenaltyModal from '@/features/penalties/components/DeletePenaltyModal';
import LeaveModal from '@/features/leaves/components/LeaveModal';
import DeleteLeaveModal from '@/features/leaves/components/DeleteLeaveModal';
import HolidayModal from '@/features/holidays/components/HolidayModal';
// redeploy test for vercel holiday modal
import DeleteHolidayModal from '../../holidays/components/DeleteHolidayModal';
import KpiScoreModal from '../components/payroll/KpiScoreModal';
import DeductionsSheetModal from '../components/payroll/DeductionsSheetModal';
import DeleteKpiModal from '../components/payroll/DeleteKpiModal';
import OvertimeModal from '@/features/overtime/components/OvertimeModal';
import DeleteOvertimeModal from '@/features/overtime/components/DeleteOvertimeModal';
// Allowance components and hooks
import AllowanceFormDialog from '@/features/allowances/components/AllowanceFormDialog';
import DeleteAllowanceDialog from '@/features/allowances/components/DeleteAllowanceDialog';
import { useAllowanceMutations } from '@/features/allowances/hooks/useAllowanceMutations';

// Freelance task components and hooks
import { TaskFormDialog } from '@/features/tasks/components/TaskFormDialog';
import { DeleteTaskDialog } from '@/features/tasks/components/DeleteTaskDialog';
import { useUpdateFreelanceEmployeeTask, useDeleteFreelanceEmployeeTask } from '@/features/tasks/hooks/useFreelanceEmployeeTasks';

// Sub-components
import { PayrollHeader } from '../components/payroll/PayrollHeader';
import { PayrollSummaryCards } from '../components/payroll/PayrollSummaryCards';
import { PayrollAbsenceAttendance } from '../components/payroll/PayrollAbsenceAttendance';
import { PayrollRewardsTable } from '../components/payroll/PayrollRewardsTable';
import { PayrollDeductionsTable } from '../components/payroll/PayrollDeductionsTable';
import { PayrollAbsenceTable } from '../components/payroll/PayrollAbsenceTable';
import { PayrollKpiItemsTable } from '../components/payroll/PayrollKpiItemsTable';
import { PayrollCommissionTable } from '../components/payroll/PayrollCommissionTable';
import { PayrollRemoteRequestsTable } from '../components/payroll/PayrollRemoteRequestsTable';
import { PayrollOvertimeRequestsTable } from '../components/payroll/PayrollOvertimeRequestsTable';
import { PayrollApprovedLeavesTable } from '../components/payroll/PayrollApprovedLeavesTable';
import { PayrollAllowancesTable } from '../components/payroll/PayrollAllowancesTable';
import { PayrollFreelanceTasksTable } from '../components/payroll/PayrollFreelanceTasksTable';

export default function EmployeeSalaryPage() {
  const { t, i18n } = useTranslation();
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modals state
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);

  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [penaltyToDelete, setPenaltyToDelete] = useState(null);
  const [selectedPenalty, setSelectedPenalty] = useState(null);

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [kpiToDelete, setKpiToDelete] = useState(null);

  const [deductionsSheetModalOpen, setDeductionsSheetModalOpen] = useState(false);

  // Overtime state
  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
  const [overtimeToDelete, setOvertimeToDelete] = useState(null);
  const [selectedOvertime, setSelectedOvertime] = useState(null);

  // Allowance state
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [allowanceToDelete, setAllowanceToDelete] = useState(null);
  const [selectedAllowance, setSelectedAllowance] = useState(null);

  // Freelance task state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Month/year from URL
  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;

  const date = useMemo(() => new Date(year, month - 1, 1), [year, month]);

  const listPage = Number(searchParams.get('return_page')) || 1;
  const listPageSize = Number(searchParams.get('return_pageSize')) || 20;

  const listFilters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      shift_id: searchParams.get('shift_id') || '',
      position_id: searchParams.get('position_id') || '',
      department_id: searchParams.get('department_id') || '',
      branch_id: searchParams.get('branch_id') || '',
    }),
    [searchParams]
  );

  const { data: salaryListData } = useQuery({
    queryKey: ['salariesTable', year, month, listPage, listPageSize, listFilters],
    queryFn: () =>
      salariesApi.getSalariesTable({
        year,
        month,
        page: listPage,
        pageSize: listPageSize,
        ...listFilters,
      }),
    enabled: !!year && !!month,
  });

  const salaryListRows = salaryListData?.data ?? [];
  const salaryListTotalPages = Math.max(1, Number(salaryListData?.pagination?.pages ?? 1) || 1);

  const currentListIndex = salaryListRows.findIndex(
    (row) => String(row.id) === String(employeeId)
  );

  const isInSalaryList = currentListIndex >= 0 && salaryListRows.length > 0;
  const canGoPreviousEmployee = isInSalaryList && (currentListIndex > 0 || listPage > 1);
  const canGoNextEmployee =
    isInSalaryList &&
    (currentListIndex < salaryListRows.length - 1 || listPage < salaryListTotalPages);

  const buildEmployeeUrl = (targetEmployeeId, nextListPage) => {
    const params = new URLSearchParams();
    params.set('year', String(year));
    params.set('month', String(month));
    params.set('return_page', String(nextListPage));
    params.set('return_pageSize', String(listPageSize));

    if (listFilters.search) params.set('search', listFilters.search);
    if (listFilters.shift_id && listFilters.shift_id !== 'all') {
      params.set('shift_id', String(listFilters.shift_id));
    }
    if (listFilters.position_id && listFilters.position_id !== 'all') {
      params.set('position_id', String(listFilters.position_id));
    }
    if (listFilters.department_id && listFilters.department_id !== 'all') {
      params.set('department_id', String(listFilters.department_id));
    }
    if (listFilters.branch_id && listFilters.branch_id !== 'all') {
      params.set('branch_id', String(listFilters.branch_id));
    }

    return `/salaries/${targetEmployeeId}?${params.toString()}`;
  };

  const fetchSalaryListPage = (page) =>
    queryClient.fetchQuery({
      queryKey: ['salariesTable', year, month, page, listPageSize, listFilters],
      queryFn: () =>
        salariesApi.getSalariesTable({
          year,
          month,
          page,
          pageSize: listPageSize,
          ...listFilters,
        }),
    });

  const handleFirstEmployee = async () => {
    const data = await fetchSalaryListPage(1);
    const first = data?.data?.[0];
    if (!first?.id) return;
    navigate(buildEmployeeUrl(first.id, 1), { replace: true });
  };

  const handleLastEmployee = async () => {
    const data = await fetchSalaryListPage(salaryListTotalPages);
    const last = data?.data?.[data?.data?.length - 1];
    if (!last?.id) return;
    navigate(buildEmployeeUrl(last.id, salaryListTotalPages), { replace: true });
  };

  const handlePreviousEmployee = async () => {
    if (!isInSalaryList) return;

    if (currentListIndex > 0) {
      const prev = salaryListRows[currentListIndex - 1];
      if (!prev?.id) return;
      navigate(buildEmployeeUrl(prev.id, listPage), { replace: true });
      return;
    }

    if (listPage > 1) {
      const data = await fetchSalaryListPage(listPage - 1);
      const last = data?.data?.[data?.data?.length - 1];
      if (!last?.id) return;
      navigate(buildEmployeeUrl(last.id, listPage - 1), { replace: true });
    }
  };

  const handleNextEmployee = async () => {
    if (!isInSalaryList) return;

    if (currentListIndex < salaryListRows.length - 1) {
      const next = salaryListRows[currentListIndex + 1];
      if (!next?.id) return;
      navigate(buildEmployeeUrl(next.id, listPage), { replace: true });
      return;
    }

    if (listPage < salaryListTotalPages) {
      const data = await fetchSalaryListPage(listPage + 1);
      const first = data?.data?.[0];
      if (!first?.id) return;
      navigate(buildEmployeeUrl(first.id, listPage + 1), { replace: true });
    }
  };

  // Payroll Sheet Query
  const {
    data: payrollData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['employeePayrollSheet', employeeId, year, month],
    queryFn: () => salariesApi.getEmployeePayrollSheet(employeeId, year, month),
    enabled: !!employeeId,
  });

  // Deductions Query (Late deduction + sheet)
  const { data: deductionsData } = useQuery({
    queryKey: ['employeeDeductions', employeeId, year, month],
    queryFn: () => salariesApi.getEmployeeDeductions(employeeId, year, month),
    enabled: !!employeeId,
  });

  const { data: positions = [] } = useAllPositions();

  // Fetch the employee record directly so the header always receives the
  // current is_active value, even when the salary table response omits it.
  const { data: employeeDetailsResponse } = useQuery({
    queryKey: ['employeeStatusDetails', employeeId],
    queryFn: () => employeesApi.getEmployee(employeeId),
    enabled: !!employeeId,
  });

  const employeeDetails = useMemo(() => {
    return (
      employeeDetailsResponse?.data?.employee ??
      employeeDetailsResponse?.data ??
      employeeDetailsResponse?.employee ??
      employeeDetailsResponse ??
      null
    );
  }, [employeeDetailsResponse]);

  const salaryListRow = useMemo(() => {
    if (currentListIndex < 0) return null;
    return salaryListRows[currentListIndex] ?? null;
  }, [currentListIndex, salaryListRows]);

  const preferArabic = i18n.language?.startsWith('ar');

  const employee = useMemo(() => {
    const raw = payrollData?.data?.employee;

    if (!raw && !salaryListRow && !employeeDetails) return null;

    const source = raw ?? employeeDetails ?? salaryListRow;

    const resolvedEmployee = resolveLocalizedPayrollEmployee(source, {
      preferArabic,
      listRow: salaryListRow,
      positions,
    });

    const activeValue =
      employeeDetails?.is_active ??
      employeeDetails?.active ??
      salaryListRow?.is_active ??
      salaryListRow?.active ??
      raw?.is_active ??
      raw?.active ??
      false;

    const isActive =
      activeValue === 1 ||
      activeValue === '1' ||
      activeValue === true ||
      activeValue === 'true';

    return {
      ...employeeDetails,
      ...salaryListRow,
      ...resolvedEmployee,
      name:
        resolvedEmployee?.name ||
        employeeDetails?.full_name ||
        employeeDetails?.name ||
        salaryListRow?.full_name ||
        salaryListRow?.name ||
        '',
      avatar:
        resolvedEmployee?.avatar ??
        employeeDetails?.image ??
        employeeDetails?.avatar ??
        salaryListRow?.image ??
        salaryListRow?.avatar ??
        null,
      is_active: isActive,
    };
  }, [
    payrollData,
    salaryListRow,
    employeeDetails,
    preferArabic,
    positions,
  ]);

  const localizedPayrollData = useMemo(() => {
    if (!payrollData?.data) return null;
    if (!employee) return payrollData.data;

    return {
      ...payrollData.data,
      employee,
      employee_name: employee.name,
    };
  }, [payrollData, employee]);

  // Store payroll in Zustand
  const setPayrollData = usePayrollStore((state) => state.setPayrollData);

  // Allowance mutations
  const { updateAllowance, deleteAllowance } = useAllowanceMutations();

  // Freelance task mutations
  const updateTask = useUpdateFreelanceEmployeeTask();
  const deleteTask = useDeleteFreelanceEmployeeTask();

  useEffect(() => {
    if (payrollData?.status && payrollData?.data && payrollData.data.status !== false) {
      setPayrollData(localizedPayrollData || payrollData.data);
    }
  }, [payrollData, localizedPayrollData, setPayrollData]);

  const formatMonthDisplay = (d) => {
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  const refreshPayroll = () => {
    queryClient.invalidateQueries({
      queryKey: ['employeePayrollSheet', employeeId, year, month],
    });
    queryClient.invalidateQueries({
      queryKey: ['employeeDeductions', employeeId, year, month],
    });
  };

  const handleAllowanceEdit = (allowance) => {
    setSelectedAllowance({ ...allowance, employee_id: employee.id });
    setAllowanceModalOpen(true);
  };

  const handleAllowanceDelete = (allowance) => {
    setAllowanceToDelete(allowance);
  };

  const handleAllowanceSubmit = async (payload) => {
    try {
      await updateAllowance.mutateAsync({ id: selectedAllowance.id, payload });
      setAllowanceModalOpen(false);
      setSelectedAllowance(null);
      refreshPayroll();
    } catch (error) {
      console.error('Failed to update allowance:', error);
    }
  };

  const handleAllowanceDeleteConfirm = async (allowance) => {
    try {
      await deleteAllowance.mutateAsync(allowance.id);
      setAllowanceToDelete(null);
      refreshPayroll();
    } catch (error) {
      console.error('Failed to delete allowance:', error);
    }
  };

  const handleTaskEdit = (task) => {
    console.log('handleTaskEdit called with:', task);
    console.log('employee:', employee);
    setSelectedTask({ ...task, employee_id: employee.id });
    setTaskModalOpen(true);
    console.log('taskModalOpen set to true');
  };

  const handleTaskDelete = (task) => {
    console.log('handleTaskDelete called with:', task);
    setTaskToDelete(task);
    console.log('taskToDelete set:', task);
  };

  const handleTaskSubmit = async (payload) => {
    try {
      await updateTask.mutateAsync({ id: selectedTask.id, payload });
      setTaskModalOpen(false);
      setSelectedTask(null);
      refreshPayroll();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskDeleteConfirm = async (task) => {
    try {
      await deleteTask.mutateAsync(task.id);
      setTaskToDelete(null);
      refreshPayroll();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const header = payrollData?.data?.header || null;
  const absence_attendance = payrollData?.data?.absence_attendance || null;

  // Debug: Check freelance_tasks data
  console.log('Payroll Data:', payrollData?.data);
  console.log('Freelance Tasks:', payrollData?.data?.freelance_tasks);
  const attendance_details = useMemo(
    () => payrollData?.data?.attendance_details || [],
    [payrollData?.data?.attendance_details]
  );
  const tables = payrollData?.data?.tables || null;

  // Combine regular deductions with late deduction summary
  const combinedDeductions = useMemo(() => {
    const regularDeductions = tables?.deductions || [];
    const lateDeductionAmount =
      deductionsData?.total_deduction_amount ?? deductionsData?.data?.total_deduction_amount ?? 0;
    const lateRecords = deductionsData?.late ?? deductionsData?.data?.late ?? [];

    // Calculate total duration from late records (minutes)
    const totalDuration = Array.isArray(lateRecords)
      ? lateRecords.reduce((sum, record) => {
          const minutes = record?.late_minutes ?? record?.difference ?? 0;
          return sum + Number(minutes || 0);
        }, 0)
      : 0;

    // Format duration as hours:minutes (like 2:05)
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    const formattedDuration =
      hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}` : `${minutes}`;

    // Late deduction row always visible
    const lateDeduction = {
      id: 'late-deduction',
      __type: 'late_deduction',
      reason: 'Late Deduction',
      amount: Number(lateDeductionAmount || 0),
      date: `${year}-${String(month).padStart(2, '0')}-01`,
      meta: {
        count: Array.isArray(lateRecords) ? lateRecords.length : 0,
        duration: formattedDuration,
        totalMinutes: totalDuration,
      },
    };

    return [...regularDeductions, lateDeduction];
  }, [tables?.deductions, deductionsData, year, month]);

  // ✅ Export ALL sections as multi-tables
  const getTables = (t, header, absence_attendance, tables) => [
    {
      title: t('salaries.employeeSalary.summary'),
      columns: [
        { key: 'net_salary', label: t('salaries.employeeSalary.netSalary') },
        { key: 'kpi_score', label: t('salaries.employeeSalary.kpiScore') },
        { key: 'total_rewards', label: t('salaries.employeeSalary.totalRewards') },
        { key: 'total_deductions', label: t('salaries.employeeSalary.totalDeductions') },
      ],
      rows: header ? [header] : [],
    },

    {
      title: t('salaries.employeeSalary.absenceAndAttendance'),
      columns: [
        { key: 'attendance_days', label: t('salaries.employeeSalary.attendanceDays') },
        { key: 'remote_days', label: t('salaries.employeeSalary.remoteDays') },
        { key: 'absence_total', label: t('salaries.employeeSalary.absenceTotal') },
        { key: 'absence_paid', label: t('salaries.employeeSalary.absencePaid') },
        { key: 'absence_unpaid', label: t('salaries.employeeSalary.absenceUnpaid') },
        { key: 'insurance', label: t('salaries.employeeSalary.insurance') },
        { key: 'absent_without_request_days', label: t('salaries.employeeSalary.absentWithoutRequest') },
      ],
      rows: absence_attendance
        ? [
            {
              attendance_days:
                absence_attendance?.attendance_days ?? absence_attendance?.attendance ?? 0,
              remote_days: absence_attendance?.remote_days ?? absence_attendance?.remotely ?? 0,
              absence_total:
                absence_attendance?.absence?.total ?? absence_attendance?.absence_total ?? 0,
              absence_paid:
                absence_attendance?.absence?.paid ?? absence_attendance?.absence_paid ?? 0,
              absence_unpaid:
                absence_attendance?.absence?.unpaid ?? absence_attendance?.absence_unpaid ?? 0,
              insurance: absence_attendance?.insurance ?? 0,
              absent_without_request_days:
                absence_attendance?.absent_without_request_days ??
                absence_attendance?.absent_without_request ??
                0,
            },
          ]
        : [],
    },

    {
      title: t('salaries.employeeSalary.attendanceDetails'),
      columns: [
        { key: 'work_date', label: t('salaries.employeeSalary.date') },
        { key: 'clock_in', label: t('salaries.employeeSalary.clockIn') },
        { key: 'clock_out', label: t('salaries.employeeSalary.clockOut') },
        { key: 'late_minutes', label: t('salaries.employeeSalary.lateMinutes') },
        { key: 'early_leave_minutes', label: t('salaries.employeeSalary.earlyLeaveMinutes') },
        { key: 'worked_minutes', label: t('salaries.employeeSalary.workedMinutes') },
        { key: 'status', label: t('salaries.employeeSalary.status') },
      ],
      rows: attendance_details,
    },

    {
      title: t('salaries.employeeSalary.rewards'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'amount', label: t('tables.headers.amount') },
        { key: 'reason', label: t('tables.headers.reason') },
      ],
      rows: tables?.rewards || [],
    },

    {
      title: t('salaries.employeeSalary.deductions'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'amount', label: t('tables.headers.amount') },
        { key: 'reason', label: t('tables.headers.reason') },
      ],
      rows: combinedDeductions || [],
    },

    {
      title: t('salaries.employeeSalary.absence'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'days', label: t('tables.headers.days') },
        { key: 'reason', label: t('tables.headers.reason') },
      ],
      rows: tables?.absence || [],
    },

    {
      title: t('salaries.employeeSalary.kpiItems'),
      columns: [
        { key: 'name', label: t('tables.headers.name') },
        { key: 'score', label: t('tables.headers.score') },
        { key: 'max_score', label: t('tables.headers.maxScore') },
      ],
      rows: tables?.kpi_items || [],
    },

    {
      title: t('salaries.employeeSalary.commission'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'amount', label: t('tables.headers.amount') },
        { key: 'description', label: t('tables.headers.description') },
      ],
      rows: tables?.commission_rows || [],
    },

    {
      title: t('salaries.employeeSalary.remoteRequests'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'status', label: t('tables.headers.status') },
        { key: 'reason', label: t('tables.headers.reason') },
      ],
      rows: tables?.remote_requests || [],
    },

    {
      title: t('salaries.employeeSalary.overtimeRequests'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'minutes', label: t('tables.headers.minutes') },
        { key: 'status', label: t('tables.headers.status') },
      ],
      rows: tables?.overtime_requests || [],
    },

    {
      title: t('salaries.employeeSalary.approvedLeaves'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'days', label: t('tables.headers.days') },
        { key: 'type', label: t('tables.headers.type') },
      ],
      rows: tables?.approved_leaves || [],
    },

    {
      title: t('salaries.employeeSalary.allowances'),
      columns: [
        { key: 'date', label: t('tables.headers.date') },
        { key: 'amount', label: t('tables.headers.amount') },
        { key: 'type', label: t('tables.headers.type') },
      ],
      rows: tables?.allowances || [],
    },

    {
      title: t('salaries.employeeSalary.freelanceTasks'),
      columns: [
        { key: 'title', label: t('tables.headers.title') },
        { key: 'amount', label: t('tables.headers.amount') },
        { key: 'status', label: t('tables.headers.status') },
      ],
      rows: tables?.freelance_tasks || [],
    },

    {
      title: 'Monthly Payroll Sheet',
      subtitle: `${employee?.name || ''} | ${formatMonthDisplay(date)}`,
      fileName: `payroll-${employee?.name || 'employee'}-${year}-${month}`,
    },
  ];

  const tablesToExport = getTables(t, header, absence_attendance, tables);
  const exportMeta = tablesToExport.find((item) => item.fileName) || {};
  const exportTables = tablesToExport.filter((item) => !item.fileName);

  const handlePdf = () => {
    exportToPdf({
      ...exportMeta,
      tables: exportTables,
    });
  };

  const handleExcel = () => {
    exportToExcel({
      ...exportMeta,
      tables: exportTables,
    });
  };

  const handlePrint = () => {
    printTable({
      ...exportMeta,
      tables: exportTables,
    });
  };

  // ✅ NOW it's safe to early-return (after all hooks)
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !payrollData?.status) {
    return (
      <div className="p-6">
        <EmptyState
          title={t('emptyStates.errorLoadingData')}
          description={error?.message || t('emptyStates.errorLoadingDataDesc')}
        />
      </div>
    );
  }

  if (payrollData.data?.status === false) {
    return (
      <div className="p-6">
        <EmptyState
          title={t('emptyStates.payrollCalculationError')}
          description={payrollData.data.message || t('emptyStates.noPayrollDataAvailable')}
        />
      </div>
    );
  }

  if (!employee || !tables || !header || !absence_attendance) {
    return (
      <div className="p-6">
        <EmptyState
          title={t('emptyStates.incompleteData')}
          description={t('emptyStates.incompleteDataDesc')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PayrollHeader
        employee={employee}
        payrollData={localizedPayrollData}
        date={date}
        formatMonthDisplay={formatMonthDisplay}
        onPdf={handlePdf}
        onExcel={handleExcel}
        onPrint={handlePrint}
        onUpdate={refreshPayroll}
        employeeNav={
          isInSalaryList && (salaryListRows.length > 1 || salaryListTotalPages > 1)
            ? {
                index: currentListIndex,
                total: salaryListRows.length,
                canGoPrevious: canGoPreviousEmployee,
                canGoNext: canGoNextEmployee,
                onFirst: handleFirstEmployee,
                onPrevious: handlePreviousEmployee,
                onNext: handleNextEmployee,
                onLast: handleLastEmployee,
              }
            : null
        }
      />

      <PayrollSummaryCards header={header} />

      <PayrollAbsenceAttendance
        absence_attendance={absence_attendance}
        attendance_details={attendance_details}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PayrollRewardsTable
          rewards={tables.rewards}
          onEdit={(r) => {
            setSelectedReward({ ...r, employee_id: employee.id });
            setRewardModalOpen(true);
          }}
          onDelete={(r) => {
            setRewardToDelete(r);
          }}
        />

        <PayrollDeductionsTable
          deductions={combinedDeductions}
          employeeId={employeeId}
          month={`${year}-${String(month).padStart(2, '0')}`}
          onEdit={(p) => {
            if (p.id === 'late-deduction') {
              // Open deductions sheet modal to show late time records
              setDeductionsSheetModalOpen(true);
              return;
            }
            setSelectedPenalty({ ...p, employee_id: employee.id });
            setPenaltyModalOpen(true);
          }}
          onDelete={(p) => {
            // Don't allow deletion of late deduction entries
            if (p.id === 'late-deduction') return;
            setPenaltyToDelete(p);
          }}
        />

        <PayrollAbsenceTable
          absence={tables.absence}
          onEdit={(h) => {
            setSelectedHoliday({ ...h, employee_id: employee.id });
            setHolidayModalOpen(true);
          }}
          onDelete={(h) => {
            setHolidayToDelete(h);
          }}
        />

        <PayrollKpiItemsTable
          kpi_items={tables.kpi_items}
          onEdit={(k) => {
            setSelectedKpi(k);
            setKpiModalOpen(true);
          }}
          onDelete={(k) => {
            setKpiToDelete(k);
          }}
        />

        <PayrollCommissionTable
          commission_rows={tables.commission_rows}
          onEdit={(c) => {
            console.log('Edit commission:', c);
            // TODO: Implement commission edit modal
          }}
          onDelete={(c) => {
            console.log('Delete commission:', c);
            // TODO: Implement commission delete functionality
          }}
        />

        <PayrollRemoteRequestsTable
          remote_requests={tables.remote_requests || []}
          onEdit={(r) => {
            setSelectedLeave({ ...r, employee_id: employee.id });
            setLeaveModalOpen(true);
          }}
          onDelete={(r) => {
            setLeaveToDelete(r);
          }}
        />

        <PayrollOvertimeRequestsTable
          overtime_requests={tables.overtime_requests || []}
          onEdit={(o) => {
            setSelectedOvertime({ ...o, employee_id: employee.id });
            setOvertimeModalOpen(true);
          }}
          onDelete={(o) => {
            setOvertimeToDelete(o);
          }}
        />

        <PayrollApprovedLeavesTable
          approved_leaves={tables.approved_leaves || []}
          onEdit={(l) => {
            setSelectedLeave({ ...l, employee_id: employee.id });
            setLeaveModalOpen(true);
          }}
          onDelete={(l) => {
            setLeaveToDelete(l);
          }}
        />

        <PayrollAllowancesTable
          allowances={tables.allowances || []}
          onEdit={handleAllowanceEdit}
          onDelete={handleAllowanceDelete}
        />

        <PayrollFreelanceTasksTable
          freelance_tasks={payrollData?.data?.tables?.freelance_tasks || []}
          onEdit={handleTaskEdit}
          onDelete={handleTaskDelete}
        />
      </div>

      {/* Modals */}
      <RewardModal
        open={rewardModalOpen}
        onOpenChange={(open) => {
          setRewardModalOpen(open);
          if (!open) {
            setSelectedReward(null);
          }
        }}
        reward={selectedReward}
        onSuccess={refreshPayroll}
      />
      <DeleteRewardModal
        open={!!rewardToDelete}
        onOpenChange={(open) => !open && setRewardToDelete(null)}
        reward={rewardToDelete}
        onSuccess={refreshPayroll}
      />

      <PenaltyModal
        open={penaltyModalOpen}
        onOpenChange={setPenaltyModalOpen}
        penalty={selectedPenalty}
        onSuccess={refreshPayroll}
      />
      <DeletePenaltyModal
        open={!!penaltyToDelete}
        onOpenChange={(open) => !open && setPenaltyToDelete(null)}
        penalty={penaltyToDelete}
        onSuccess={refreshPayroll}
      />

      <HolidayModal
        open={holidayModalOpen}
        onOpenChange={setHolidayModalOpen}
        holiday={selectedHoliday}
        onSuccess={refreshPayroll}
      />
      <DeleteHolidayModal
        open={!!holidayToDelete}
        onOpenChange={(open) => !open && setHolidayToDelete(null)}
        holiday={holidayToDelete}
        onSuccess={refreshPayroll}
      />

      <LeaveModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        leave={selectedLeave}
        onSuccess={refreshPayroll}
      />
      <DeleteLeaveModal
        open={!!leaveToDelete}
        onOpenChange={(open) => !open && setLeaveToDelete(null)}
        leave={leaveToDelete}
        onSuccess={refreshPayroll}
      />

      <KpiScoreModal
        open={kpiModalOpen}
        onOpenChange={setKpiModalOpen}
        kpiItem={selectedKpi}
        employeeId={employee.id}
        year={year}
        month={month}
        onSuccess={refreshPayroll}
      />

      <DeleteKpiModal
        open={!!kpiToDelete}
        onOpenChange={(open) => !open && setKpiToDelete(null)}
        kpiItem={kpiToDelete}
        employeeId={employee.id}
        onSuccess={refreshPayroll}
      />

      <OvertimeModal
        open={overtimeModalOpen}
        onOpenChange={setOvertimeModalOpen}
        overtime={selectedOvertime}
        onSuccess={refreshPayroll}
      />
      <DeleteOvertimeModal
        open={!!overtimeToDelete}
        onOpenChange={(open) => !open && setOvertimeToDelete(null)}
        overtime={overtimeToDelete}
        onSuccess={refreshPayroll}
      />

      <DeductionsSheetModal
        open={deductionsSheetModalOpen}
        onOpenChange={setDeductionsSheetModalOpen}
        employeeId={employeeId}
        year={year}
        month={month}
      />

      {/* Allowance Modals */}
      <AllowanceFormDialog
        open={allowanceModalOpen}
        onOpenChange={setAllowanceModalOpen}
        allowance={selectedAllowance}
        onSubmit={handleAllowanceSubmit}
        isSubmitting={updateAllowance.isPending}
      />
      <DeleteAllowanceDialog
        open={!!allowanceToDelete}
        onOpenChange={(open) => !open && setAllowanceToDelete(null)}
        allowance={allowanceToDelete}
        onConfirm={handleAllowanceDeleteConfirm}
        isDeleting={deleteAllowance.isPending}
      />

      {/* Freelance Task Modals */}
      <TaskFormDialog
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
        isSubmitting={updateTask.isPending}
      />
      <DeleteTaskDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        task={taskToDelete}
        onConfirm={handleTaskDeleteConfirm}
        isDeleting={deleteTask.isPending}
      />
      
      {/* Debug: Show modal states */}
      {console.log('Modal states:', {
        taskModalOpen,
        selectedTask,
        taskToDelete,
        updateTaskPending: updateTask.isPending,
        deleteTaskPending: deleteTask.isPending
      })}
    </div>
  );
}
