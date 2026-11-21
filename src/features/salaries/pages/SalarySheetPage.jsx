import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Search,
  X,
  Eye,
  ChevronsLeft,
  ChevronsRight,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { Pagination } from '@/components/ui/Pagination';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { toast } from 'sonner';
import { useAllBranches, useAllDepartments, useAllShifts, useAllPositions } from '@/shared/hooks';
import { useFilter } from '@/shared/hooks/useFilter';
import { salariesApi } from '../api/salariesApi';
import EmployeeFingerprintIssuesCrudModal from '@/features/overtime/components/EmployeeFingerprintIssuesCrudModal';

import SheetDialogTrigger from '@/features/attendanceOverview/components/AttendanceSheetDialogTrigger.jsx';
import AbsenceDialogTrigger from '@/features/attendanceOverview/components/AbsenceDialogTrigger.jsx';
import OvertimeDialogTrigger from '@/features/attendanceOverview/components/OvertimeDialogTrigger.jsx';
import KpiSheetDialogTrigger from '../components/payroll/KpiSheetDialogTrigger';
import LateDeductionModal from '../components/payroll/LateDeductionModal.jsx';
import SalaryCalculationModal from '../components/payroll/SalaryCalculationModal.jsx';
import RewardsDeductionsDialogTrigger from '../components/RewardsDeductionsDialogTrigger.jsx';

import OvertimeSheetDialogTrigger from '../components/payroll/OvertimeSheetDialogTrigger';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const getTableSections = (t) => [
  {
    title: t('salaries.sheet.sections.employeeInformation'),
    columns: [
      { key: 'code', label: t('salaries.sheet.columns.code') },
      { key: 'name', label: t('tables.headers.name') },
      { key: 'phone', label: t('salaries.sheet.columns.phone') },
      { key: 'position', label: t('salaries.sheet.columns.position') },
      { key: 'department', label: t('salaries.sheet.columns.department') },
      { key: 'branch', label: t('salaries.sheet.columns.branch') },
      { key: 'shift', label: t('salaries.sheet.columns.shift') },
      { key: 'contract_type', label: t('salaries.sheet.columns.contractType') },
      { key: 'salary_type', label: t('salaries.sheet.columns.salaryType') },
      { key: 'salary_method', label: t('salaries.sheet.columns.salaryMethod') },
    ],
  },
  {
    title: t('salaries.sheet.sections.salaryDetails'),
    columns: [
      { key: 'base_salary', label: t('salaries.sheet.columns.baseSalary') },
      { key: 'daily_rate', label: t('salaries.sheet.columns.dailyRate') },
      { key: 'hourly_rate', label: t('salaries.sheet.columns.hourlyRate') },
      { key: 'kpi_target', label: t('salaries.sheet.columns.kpiTarget') },
      { key: 'kpi_percent', label: t('salaries.sheet.columns.kpiPercent') },
      { key: 'kpi_amount', label: t('salaries.sheet.columns.kpiAmount') },
      { key: 'attendance_days', label: t('salaries.sheet.columns.attendanceDays') },
      { key: 'remotely_days', label: t('salaries.sheet.columns.remotelyDays') },
      { key: 'absence_days', label: t('salaries.sheet.columns.absenceDays') },
    ],
  },
  {
    title: t('salaries.sheet.sections.hoursAndDeficit'),
    columns: [
      { key: 'required_monthly_hours', label: t('salaries.sheet.columns.requiredHours') },
      { key: 'worked_hours', label: t('salaries.sheet.columns.workedHours') },
      { key: 'deficit_hours', label: t('salaries.sheet.columns.deficitHours') },
      { key: 'deficit_amount', label: t('salaries.sheet.columns.deficitAmount') },
      { key: 'approved_overtime_minutes', label: t('salaries.sheet.columns.overtimeMinutes') },
      { key: 'overtime_amount', label: t('salaries.sheet.columns.overtimeAmount') },
    ],
  },
  {
    title: t('salaries.sheet.sections.commissionAndRewards'),
    columns: [
      { key: 'commission_percent', label: t('salaries.sheet.columns.commissionPercent') },
      { key: 'commission_base', label: t('salaries.sheet.columns.commissionBase') },
      { key: 'commission_amount', label: t('salaries.sheet.columns.commissionAmount') },
      { key: 'rewards_total', label: t('salaries.sheet.columns.rewardsTotal') },
      { key: 'penalties_total', label: t('salaries.sheet.columns.penaltiesTotal') },
    ],
  },
  {
    title: t('salaries.sheet.sections.deductionsAndInsurance'),
    columns: [
      { key: 'loan_installments', label: t('salaries.sheet.columns.loanInstallments') },
      { key: 'insurance', label: t('salaries.sheet.columns.insurance') },
      { key: 'insurance_salary', label: t('salaries.sheet.columns.insuranceSalary') },
      { key: 'insurance_percentage', label: t('salaries.sheet.columns.insurancePercentage') },
      { key: 'late_deduction', label: t('salaries.sheet.columns.lateDeduction') },
      { key: 'absence_deduction', label: t('salaries.sheet.columns.absenceDeduction') },
      { key: 'unpaid_leave_deduction', label: t('salaries.sheet.columns.unpaidLeaveDeduction') },
      { key: 'total_deductions', label: t('salaries.sheet.columns.totalDeductions') },
    ],
  },
  {
    title: t('salaries.sheet.sections.finalSummary'),
    columns: [
      { key: 'net_salary', label: t('salaries.sheet.columns.netSalary') },
      { key: 'wallet_number', label: t('salaries.sheet.columns.walletNumber') },
      { key: 'card_number', label: t('salaries.sheet.columns.cardNumber') },
      { key: 'has_fingerprint', label: t('salaries.sheet.columns.hasFingerprint') },
      { key: 'employee_type', label: t('salaries.sheet.columns.employeeType') },
    ],
  },
  {
    title: t('salaries.sheet.sections.actions'),
    columns: [{ key: 'actions', label: t('tables.headers.action') }],
  },
];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMonthParam(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatDateForApi(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthRange(year, month) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);

  return {
    from: formatDateForApi(from),
    to: formatDateForApi(to),
  };
}

function CellWithEye({
  value,
  valueClassName = 'text-slate-700',
  onClick,
  title,
  titleKey = 'salaries.sheet.labels.viewDetails',
  t,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={t ? t(titleKey) : title}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-50"
    >
      <span className={valueClassName}>{value ?? '--'}</span>
      <Eye className="h-4 w-4 text-slate-400" />
    </button>
  );
}

function KpiItemsDialogTrigger({ value, row }) {
  const { t } = useTranslation();
  const kpiItems = useMemo(() => {
    if (Array.isArray(row?.kpi_items)) return row.kpi_items;
    if (Array.isArray(row?.kpiItems)) return row.kpiItems;
    if (Array.isArray(row?.kpi_details)) return row.kpi_details;
    if (Array.isArray(row?.kpiDetails)) return row.kpiDetails;
    return [];
  }, [row]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-50"
        >
          <span className="text-slate-700">{value ?? '--'}</span>
          <Eye className="h-4 w-4 text-slate-400" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white">
        <DialogHeader className="mt-2">
          <DialogTitle className="text-base font-semibold">{t('kpiItemsDialog.title')}</DialogTitle>
          <div className="text-sm text-slate-500">
            {row?.code ? `${row.code} - ` : ''}
            {row?.name || t('kpiItemsDialog.employee')}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>{t('kpiItemsDialog.columns.name')}</TableHead>
                <TableHead>{t('kpiItemsDialog.columns.score')}</TableHead>
                <TableHead>{t('kpiItemsDialog.columns.maxScore')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {kpiItems.length ? (
                kpiItems.map((item, index) => (
                  <TableRow key={item?.id ?? index} className="[&>td]:py-3">
                    <TableCell>{item?.name || item?.title || item?.label || '--'}</TableCell>
                    <TableCell>{item?.score ?? item?.value ?? '--'}</TableCell>
                    <TableCell>{item?.max_score ?? item?.maxScore ?? '--'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-slate-500">
                    {t('kpiItemsDialog.messages.noItemsFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SalarySheetPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [lateModalState, setLateModalState] = useState({
    open: false,
    employeeId: null,
  });

  const [salaryModalState, setSalaryModalState] = useState({
    open: false,
    row: null,
  });

  const [showFingerprintIssues, setShowFingerprintIssues] = useState(false);

  const getCurrentMonthYear = () => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const dateParam = searchParams.get('date');

    if (monthParam && yearParam) {
      const m = Number(monthParam);
      const y = Number(yearParam);
      const d = new Date(y, m - 1, 1);
      return { month: m, year: y, date: d };
    }

    const d = dateParam ? new Date(dateParam) : new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear(), date: d };
  };

  const { month, year, date } = getCurrentMonthYear();
  const employeeId = searchParams.get('employee-id') || searchParams.get('employee_id');

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    shift_id: searchParams.get('shift_id') || '',
    position_id: searchParams.get('position_id') || '',
    department_id: searchParams.get('department_id') || '',
    branch_id: searchParams.get('branch_id') || '',
    contract_type: searchParams.get('contract_type') || '',
  }));

  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('pageSize')) || 20);

  const { data: branches = [] } = useAllBranches();
  const { data: companies = [] } = useAllDepartments();
  const { data: shifts = [] } = useAllShifts();
  const { data: positions = [] } = useAllPositions();

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    setFilters,
    'search',
    {
      search: searchParams.get('search') || '',
      shift_id: searchParams.get('shift_id') || '',
      position_id: searchParams.get('position_id') || '',
      department_id: searchParams.get('department_id') || '',
      branch_id: searchParams.get('branch_id') || '',
      contract_type: searchParams.get('contract_type') || '',
    }
  );

  const hasAnyFilter =
    !!filters.search ||
    !!filters.shift_id ||
    !!filters.position_id ||
    !!filters.department_id ||
    !!filters.branch_id ||
    !!filters.contract_type;

  const allColumns = useMemo(() => getTableSections(t).flatMap((section) => section.columns), [t]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    if (currentPage > 1) params.set('page', String(currentPage));
    if (pageSize !== 20) params.set('pageSize', String(pageSize));

    if (filters.search) params.set('search', filters.search);
    if (filters.shift_id && filters.shift_id !== 'all') {
      params.set('shift_id', String(filters.shift_id));
    }
    if (filters.position_id && filters.position_id !== 'all') {
      params.set('position_id', String(filters.position_id));
    }
    if (filters.department_id && filters.department_id !== 'all') {
      params.set('department_id', String(filters.department_id));
    }
    if (filters.branch_id && filters.branch_id !== 'all') {
      params.set('branch_id', String(filters.branch_id));
    }
    if (filters.contract_type && filters.contract_type !== 'all') {
      params.set('contract_type', String(filters.contract_type));
    }
    if (employeeId) {
      params.set('employee_id', String(employeeId));
    }

    const nextString = params.toString();
    const currentString = searchParams.toString();

    if (nextString !== currentString) {
      setSearchParams(params, { replace: true });
    }
  }, [month, year, currentPage, pageSize, filters, employeeId, searchParams, setSearchParams]);

  const { data: salaryData, isLoading } = useQuery({
    queryKey: ['salarySheet', year, month, filters, currentPage, pageSize],
    queryFn: () =>
      salariesApi.getSalarySheet({
        year,
        month,
        page: currentPage,
        pageSize,
        ...filters,
      }),
    enabled: !!year && !!month,
  });

  const rows = salaryData?.data ?? [];
  const pagination = salaryData?.meta?.pagination ?? {};
  const lastPage = Math.max(1, toNumber(pagination.last_page, 1));

  const monthParam = formatMonthParam(year, month);
  const { from, to } = getMonthRange(year, month);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('date');
    params.delete('page');

    setCurrentPage(1);
    setSearchParams(params);
  };

  const formatMonthDisplay = (d) =>
    d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

  const isCurrentMonth = () => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const handlePageChange = (page) => {
    const next = Math.min(Math.max(1, page), lastPage);
    setCurrentPage(next);
  };

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 20;
    setPageSize(num);
    setCurrentPage(1);
  };

  const handleExport = (format) => {
    if (!rows?.length) {
      toast.error(t('salaries.sheet.messages.noDataToExport'));
      return;
    }

    const reportTitle = t('salaries.sheet.title', 'Salary Sheet Report');
    const sections = getTableSections(t).filter((section) => section.title !== t('salaries.sheet.sections.actions'));

    const tables = sections.map((section) => ({
      title: section.title,
      columns: section.columns,
      rows: rows.map((row) => {
        const rowData = {};
        section.columns.forEach((col) => {
          // Format values for export if needed
          let value = row[col.key];
          if (value === null || value === undefined) {
            value = '--';
          } else if (typeof value === 'boolean') {
            value = value ? t('common.yes') : t('common.no');
          }
          rowData[col.key] = value;
        });
        return rowData;
      }),
    }));

    const fileName = `salary-sheet-${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      exportToExcel({
        tables,
        fileName,
        title: reportTitle,
        subtitle: `${t('common.month')}: ${month} / ${t('common.year')}: ${year}`,
      });
    } else if (format === 'pdf') {
      exportToPdf({
        tables,
        fileName,
        title: reportTitle,
        subtitle: `${t('common.month')}: ${month} / ${t('common.year')}: ${year}`,
      });
    } else if (format === 'print') {
      printTable({
        tables,
        title: reportTitle,
        subtitle: `${t('common.month')}: ${month} / ${t('common.year')}: ${year}`,
      });
    }
  };

  const handleShowOvertime = (employee) => {
    const currentIndex = rows.findIndex((row) => String(row.id) === String(employee.id));
    const nextEmployee =
      currentIndex >= 0 && currentIndex < rows.length - 1 ? rows[currentIndex + 1] : null;

    const params = new URLSearchParams();
    params.set('employee_id', employee.id);
    // Overtime sheet expects month & year separately (month as number 1-12)
    params.set('month', String(month));
    params.set('year', year);

    if (nextEmployee?.id) {
      params.set('return_next_employee_id', String(nextEmployee.id));
    }

    params.set('return_page', String(currentPage));
    params.set('return_pageSize', String(pageSize));

    if (filters.search) params.set('search', filters.search);
    if (filters.shift_id) params.set('shift_id', filters.shift_id);
    if (filters.position_id) params.set('position_id', filters.position_id);
    if (filters.department_id) params.set('department_id', filters.department_id);
    if (filters.branch_id) params.set('branch_id', filters.branch_id);
    if (filters.contract_type) params.set('contract_type', filters.contract_type);

    navigate(`/overtime-sheet?${params.toString()}`);
  };

  useEffect(() => {
    const autoOpenEmployeeId = searchParams.get('auto_open_overtime_employee_id');
    if (!autoOpenEmployeeId) return;

    const params = new URLSearchParams(searchParams);
    params.delete('auto_open_overtime_employee_id');
    setSearchParams(params, { replace: true });

    const nextEmployee = rows.find((row) => String(row.id) === String(autoOpenEmployeeId));
    if (!nextEmployee) return;

    const currentIndex = rows.findIndex((row) => String(row.id) === String(nextEmployee.id));
    const nextAfterThat =
      currentIndex >= 0 && currentIndex < rows.length - 1 ? rows[currentIndex + 1] : null;

    const overtimeParams = new URLSearchParams();
    overtimeParams.set('employee_id', nextEmployee.id);
    overtimeParams.set('month', String(month));
    overtimeParams.set('year', year);

    if (nextAfterThat?.id) {
      overtimeParams.set('return_next_employee_id', String(nextAfterThat.id));
    }

    overtimeParams.set('return_page', String(currentPage));
    overtimeParams.set('return_pageSize', String(pageSize));

    if (filters.search) overtimeParams.set('search', filters.search);
    if (filters.shift_id) overtimeParams.set('shift_id', filters.shift_id);
    if (filters.position_id) overtimeParams.set('position_id', filters.position_id);
    if (filters.department_id) overtimeParams.set('department_id', filters.department_id);
    if (filters.branch_id) overtimeParams.set('branch_id', filters.branch_id);
    if (filters.contract_type) overtimeParams.set('contract_type', filters.contract_type);

    navigate(`/overtime-sheet?${overtimeParams.toString()}`, { replace: true });
  }, [searchParams, rows, month, year, currentPage, pageSize, filters, navigate, setSearchParams]);

  const { data: allEmployeesData } = useQuery({
    queryKey: ['salarySheet', year, month, {}, 1, 1000],
    queryFn: () =>
      salariesApi.getSalarySheet({
        year,
        month,
        page: 1,
        // Backend validation: per_page must be <= 200
        pageSize: 200,
      }),
    enabled: !!employeeId && !!year && !!month,
  });

  const allEmployees = useMemo(() => allEmployeesData?.data ?? [], [allEmployeesData?.data]);

  const selectedEmployeeId = employeeId ? String(employeeId) : '';

  const currentEmployeeIndex =
    !selectedEmployeeId || allEmployees.length === 0
      ? 0
      : Math.max(
          0,
          allEmployees.findIndex((emp) => String(emp.id) === selectedEmployeeId)
        );

  const handlePreviousEmployee = () => {
    if (currentEmployeeIndex > 0) {
      const prevEmployee = allEmployees[currentEmployeeIndex - 1];
      navigate(`/salary-sheet?employee_id=${prevEmployee.id}&month=${month}&year=${year}`);
    }
  };

  const handleNextEmployee = () => {
    if (currentEmployeeIndex < allEmployees.length - 1) {
      const nextEmployee = allEmployees[currentEmployeeIndex + 1];
      navigate(`/salary-sheet?employee_id=${nextEmployee.id}&month=${month}&year=${year}`);
    }
  };

  const handleFirstEmployee = () => {
    if (allEmployees.length > 0) {
      const firstEmployee = allEmployees[0];
      navigate(`/salary-sheet?employee_id=${firstEmployee.id}&month=${month}&year=${year}`);
    }
  };

  const handleLastEmployee = () => {
    if (allEmployees.length > 0) {
      const lastEmployee = allEmployees[allEmployees.length - 1];
      navigate(`/salary-sheet?employee_id=${lastEmployee.id}&month=${month}&year=${year}`);
    }
  };

  const canGoPrevious = currentEmployeeIndex > 0;
  const canGoNext = currentEmployeeIndex < allEmployees.length - 1;

  const buildSalaryCalculationData = (row) => ({
    ...row,
    employee: {
      ...row,
      id: row?.id,
      name: row?.name,
      code: row?.code,
      position: row?.position,
      department: row?.department,
      phone: row?.phone,
      email: row?.email,
      shift: row?.shift,
      shift_name: row?.shift_name || row?.shift,
      type: row?.type || row?.employment_type,
      employment_type: row?.employment_type || row?.type,
      part_time_type: row?.part_time_type,
      monthly_hours_required:
        row?.monthly_hours_required || row?.required_monthly_hours,
      year,
      month,
    },
    employee_name: row?.name,
    shift: row?.shift,
    shift_name: row?.shift_name || row?.shift,
    header: {
      year,
      month,
      shift: row?.shift,
      net_salary: row?.net_salary ?? 0,
      total_deductions: row?.total_deductions ?? 0,
      tasks_count: row?.tasks_count ?? 0,
      required_monthly_hours:
        row?.required_monthly_hours ?? row?.monthly_hours_required ?? 0,
      worked_hours: row?.worked_hours ?? 0,
    },
    basic_salary: row?.base_salary ?? 0,
    rates: {
      daily_rate: row?.daily_rate,
      hourly_rate: row?.hourly_rate,
    },
    kpi: {
      target: row?.kpi_target ?? 0,
      payout: row?.kpi_amount ?? 0,
      achieved_percent: row?.kpi_percent ?? 0,
    },
    additions_breakdown: {
      overtime_payout: row?.overtime_amount ?? 0,
      rewards_total: row?.rewards_total ?? 0,
      commission_total: row?.commission_amount ?? 0,
      tasks_count: row?.tasks_count ?? 0,
      freelance_tasks_total: row?.freelance_tasks_total ?? 0,
    },
    deductions_breakdown: {
      penalties_total: row?.penalties_total ?? 0,
      loan_installments: row?.loan_installments ?? 0,
      insurance: row?.insurance ?? 0,
      absence_deduction: row?.absence_deduction ?? 0,
      late_deduction: row?.late_deduction ?? 0,
    },
    attendance_details: {
      absent_days_without_request_or_rejected: row?.absence_days ?? 0,
      required_monthly_hours:
        row?.required_monthly_hours ?? row?.monthly_hours_required ?? 0,
      worked_hours: row?.worked_hours ?? 0,
    },
    absence_attendance: {
      Holidays: {
        used_days_in_month: row?.leaves_used_days ?? 0,
        remaining_days_end_of_month: row?.remaining_holidays ?? 0,
      },
    },
  });

  const renderCellContent = (row, col) => {
    switch (col.key) {
      case 'attendance_days':
        return (
          <SheetDialogTrigger
            value={row?.attendance_days ?? '--'}
            employeeId={row?.id}
            month={monthParam}
          />
        );

      case 'absence_days':
        return (
          <AbsenceDialogTrigger
            value={row?.absence_days ?? '--'}
            employeeId={row?.id}
            from={from}
            to={to}
          />
        );

      case 'approved_overtime_minutes':
        return (
          <OvertimeSheetDialogTrigger
            value={row?.approved_overtime_minutes ?? '--'}
            employeeId={row?.id}
            year={year}
            month={month}
          />
        );
      case 'late_deduction':
        return (
          <CellWithEye
            value={row?.late_deduction ?? '--'}
            valueClassName="text-red-500"
            titleKey="salaries.sheet.labels.viewLateDeductionSheet"
            t={t}
            onClick={() =>
              setLateModalState({
                open: true,
                employeeId: row?.id,
              })
            }
          />
        );

      case 'net_salary':
        return (
          <CellWithEye
            value={row?.net_salary ?? '--'}
            valueClassName="text-slate-700"
            titleKey="salaries.sheet.labels.viewNetSalarySheet"
            t={t}
            onClick={() =>
              setSalaryModalState({
                open: true,
                row,
              })
            }
          />
        );

      case 'kpi_amount':
        return (
          <KpiSheetDialogTrigger
            value={row?.kpi_amount ?? '--'}
            employeeId={row?.id}
            year={year}
            month={month}
          />
        );
      case 'rewards_total':
        return (
          <RewardsDeductionsDialogTrigger
            value={row?.rewards_total ?? '--'}
            type="rewards"
            employeeId={row?.id}
            year={year}
            month={month}
          />
        );

      case 'penalties_total':
        return (
          <RewardsDeductionsDialogTrigger
            value={row?.penalties_total ?? '--'}
            type="penalties"
            employeeId={row?.id}
            year={year}
            month={month}
          />
        );

      case 'actions':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShowOvertime(row)}
            className="h-8 w-8 p-0"
            title={t('salaries.sheet.buttons.viewOvertimePage')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );

      default:
        return row?.[col.key] ?? '--';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <style>{`
        .salary-sheet-scroll-area {
          max-height: calc(100vh - 320px);
          overflow: auto;
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #e2e8f0;
        }

        .salary-sheet-scroll-area::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .salary-sheet-scroll-area::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 9999px;
        }

        .salary-sheet-scroll-area::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 9999px;
        }

        .salary-sheet-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setMonth(newDate.getMonth() - 1);
              handleDateChange(newDate);
            }}
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="size-3 sm:size-4" />
                <span>{formatMonthDisplay(date)}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && handleDateChange(newDate)}
                initialFocus
                toDate={new Date()}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setMonth(newDate.getMonth() + 1);
              handleDateChange(newDate);
            }}
            disabled={isCurrentMonth()}
          >
            <ChevronRight className="size-4 sm:size-5" />
          </Button>
        </div>

        {employeeId && allEmployees.length > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFirstEmployee}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0"
              title={t('salaries.sheet.buttons.firstEmployee')}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousEmployee}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0"
              title={t('salaries.sheet.buttons.previousEmployee')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-medium text-slate-600">
              {currentEmployeeIndex + 1} / {allEmployees.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextEmployee}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
              title={t('salaries.sheet.buttons.nextEmployee')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLastEmployee}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
              title={t('salaries.sheet.buttons.lastEmployee')}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ExportDialog
          title={t('salaries.sheet.buttons.exportSalarySheet')}
          onPdf={() => handleExport('pdf')}
          onExcel={() => handleExport('excel')}
          onPrint={() => handleExport('print')}
        >
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 rounded-md px-4 text-xs font-semibold shadow-xs"
          >
            <Download className="mr-1.5 h-4 w-4" />
            {t('common.export')}
          </Button>
        </ExportDialog>
      </div>

      {employeeId && allEmployees[currentEmployeeIndex] && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {allEmployees[currentEmployeeIndex].name}
              </h3>
              <p className="text-sm text-slate-600">
                {t('salaries.sheet.labels.code')}: {allEmployees[currentEmployeeIndex].code} | {t('salaries.sheet.labels.position')}:{' '}
                {allEmployees[currentEmployeeIndex].position} | {t('salaries.sheet.labels.department')}:{' '}
                {allEmployees[currentEmployeeIndex].department}
              </p>
            </div>
            {allEmployees.length > 1 && (
              <div className="text-sm text-slate-500">
                {t('salaries.sheet.labels.employee')} {currentEmployeeIndex + 1} {t('salaries.sheet.labels.of')} {allEmployees.length}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-md px-3 text-xs font-semibold shadow-xs"
              onClick={() => setShowFingerprintIssues(true)}
            >
              <Fingerprint className="mr-1.5 h-4 w-4" />
              {t('navigation.fingerprintIssues', 'Fingerprint Issues')}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="w-full">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap xl:items-center xl:gap-3">
              <div className="relative w-full xl:w-[320px] 2xl:w-[340px]">
                <Search
                  className={
                    isRTL
                      ? 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400'
                      : 'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400'
                  }
                />
                <Input
                  dir={isRTL ? 'rtl' : 'ltr'}
                  placeholder={t('filters.search')}
                  value={searchTerm}
                  onChange={(e) => {
                    handleSearchChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={
                    isRTL
                      ? 'h-10 w-full rounded-md border-slate-200 pr-9 pl-3 text-right text-sm text-slate-700 shadow-sm placeholder:text-right'
                      : 'h-10 w-full rounded-md border-slate-200 pl-9 pr-3 text-left text-sm text-slate-700 shadow-sm placeholder:text-left'
                  }
                />
              </div>

              <div className="w-full xl:w-[150px]">
                <Select
                  dir={isRTL ? 'rtl' : 'ltr'}
                  value={filters.shift_id}
                  onValueChange={(val) => {
                    handleChange('shift_id', val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <SelectValue placeholder={t('filters.type')} />
                  </SelectTrigger>
                  <SelectContent
                    className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <SelectItem value="all" className={isRTL ? 'text-right' : 'text-left'}>{t('filters.allShifts')}</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem
                        key={shift.id}
                        value={String(shift.id)}
                        className={isRTL ? 'text-right' : 'text-left'}
                      >
                        {shift.name_en || shift.name_ar || shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full xl:w-[170px]">
                <Select
                  dir={isRTL ? 'rtl' : 'ltr'}
                  value={filters.position_id}
                  onValueChange={(val) => {
                    handleChange('position_id', val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <SelectValue placeholder={t('filters.position')} />
                  </SelectTrigger>
                  <SelectContent
                    className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <SelectItem value="all" className={isRTL ? 'text-right' : 'text-left'}>{t('filters.allPositions')}</SelectItem>
                    {positions.map((position) => (
                      <SelectItem
                        key={position.id}
                        value={String(position.id)}
                        className={isRTL ? 'text-right' : 'text-left'}
                      >
                        {position.title_en || position.name_en || position.name_ar || position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full xl:w-[170px]">
                <Select
                  dir={isRTL ? 'rtl' : 'ltr'}
                  value={filters.department_id}
                  onValueChange={(val) => {
                    handleChange('department_id', val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <SelectValue placeholder={t('filters.company')} />
                  </SelectTrigger>
                  <SelectContent
                    className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <SelectItem value="all" className={isRTL ? 'text-right' : 'text-left'}>{t('filters.allCompanies')}</SelectItem>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={String(company.id)}
                        className={isRTL ? 'text-right' : 'text-left'}
                      >
                        {company.name_en || company.name_ar || company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full xl:w-[170px]">
                <Select
                  dir={isRTL ? 'rtl' : 'ltr'}
                  value={filters.branch_id}
                  onValueChange={(val) => {
                    handleChange('branch_id', val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <SelectValue placeholder={t('filters.branch')} />
                  </SelectTrigger>
                  <SelectContent
                    className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <SelectItem value="all" className={isRTL ? 'text-right' : 'text-left'}>{t('filters.allBranches')}</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem
                        key={branch.id}
                        value={String(branch.id)}
                        className={isRTL ? 'text-right' : 'text-left'}
                      >
                        {branch.name_en || branch.name_ar || branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full xl:w-[170px]">
                <Select
                  dir={isRTL ? 'rtl' : 'ltr'}
                  value={filters.contract_type}
                  onValueChange={(val) => {
                    handleChange('contract_type', val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className={`h-10 w-full border-slate-200 bg-white text-sm text-slate-600 shadow-sm ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  >
                    <SelectValue placeholder={t('filters.contractType')} />
                  </SelectTrigger>
                  <SelectContent
                    className={`max-h-60 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <SelectItem value="all" className={isRTL ? 'text-right' : 'text-left'}>{t('filters.allContractTypes')}</SelectItem>
                    <SelectItem value="job" className={isRTL ? 'text-right' : 'text-left'}>{t('salaries.sheet.labels.job')}</SelectItem>
                    <SelectItem value="internship" className={isRTL ? 'text-right' : 'text-left'}>{t('salaries.sheet.labels.internship')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasAnyFilter && (
                <div className="w-full xl:w-auto">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleReset();
                      setCurrentPage(1);
                    }}
                    className="h-10 w-full justify-center px-3 text-slate-500 hover:text-red-500 xl:w-auto"
                  >
                    <X className="size-4" />
                    <span className="ml-1 text-sm font-medium">{t('filters.clear')}</span>
                  </Button>
                </div>
              )}

              <div className="w-full xl:ml-auto xl:w-auto">
                <Button
                  variant="reset1"
                  size="sm"
                  className="h-10 w-full justify-center px-4 text-xs font-semibold shadow-sm xl:w-auto"
                  onClick={() => handleExport('excel')}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  {t('common.export')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{t('salaries.sheet.labels.show')}</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-16 border-slate-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className={isRTL ? 'text-right' : 'text-left'}>10</SelectItem>
              <SelectItem value="20" className={isRTL ? 'text-right' : 'text-left'}>20</SelectItem>
              <SelectItem value="50" className={isRTL ? 'text-right' : 'text-left'}>50</SelectItem>
              <SelectItem value="100" className={isRTL ? 'text-right' : 'text-left'}>100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm font-medium text-slate-700">{t('salaries.sheet.labels.entries')}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ExportDialog
            title={t('salaries.sheet.buttons.exportSalarySheet')}
            onPdf={() => handleExport('pdf')}
            onExcel={() => handleExport('excel')}
            onPrint={() => handleExport('print')}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 rounded-md px-3 text-xs font-semibold shadow-xs"
            >
              <Download className="mr-1.5 h-4 w-4" />
              {t('common.export')}
            </Button>
          </ExportDialog>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="salary-sheet-scroll-area relative">
          <Table
            containerClassName="overflow-x-visible overflow-y-visible"
            className="min-w-max border-separate border-spacing-0"
          >
            <colgroup>
              <col className="w-20" />
              <col className="min-w-[150px]" />
            </colgroup>

            <TableHeader className="[&_th]:sticky [&_th]:top-0">
              <TableRow className="bg-slate-50 shadow-[0_1px_0_0_rgb(226_232_240)]">
                {allColumns.map((col) => {
                  const isFixedColumn =
                    col.key === 'code' || col.key === 'name' || col.key === 'actions';

                  return (
                    <TableHead
                      key={col.key}
                      className={`border-r border-b border-slate-200 px-4 py-3 text-[13px] font-semibold whitespace-nowrap text-slate-700 last:border-r-0 ${
                        isFixedColumn ? 'sticky z-40 bg-slate-50' : 'z-30 bg-slate-50'
                      } ${col.key === 'code' ? 'top-0 left-0 w-20' : ''} ${
                        col.key === 'name' ? 'top-0 left-20 min-w-[150px]' : ''
                      } ${col.key === 'actions' ? 'top-0 right-0 w-20' : ''}`}
                    >
                      {col.label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/40">
                    {allColumns.map((col, idx) => {
                      const isFixedColumn =
                        col.key === 'code' || col.key === 'name' || col.key === 'actions';

                      return (
                        <TableCell
                          key={idx}
                          className={`border-r border-b border-slate-200 px-4 py-3 text-[13px] whitespace-nowrap text-slate-700 last:border-r-0 ${
                            isFixedColumn ? 'sticky z-20 bg-white' : ''
                          } ${col.key === 'code' ? 'left-0 w-20' : ''} ${
                            col.key === 'name' ? 'left-20 min-w-[150px]' : ''
                          } ${col.key === 'actions' ? 'right-0 w-20 ' : ''}`}
                        >
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id ?? row.code ?? `${row.name}-${row.phone}`}
                    className="hover:bg-slate-50/40"
                  >
                    {allColumns.map((col) => {
                      const isFixedColumn =
                        col.key === 'code' || col.key === 'name' || col.key === 'actions';

                      return (
                        <TableCell
                          key={col.key}
                          className={`border-r border-b border-slate-200 px-4 py-3 text-[13px] whitespace-nowrap text-slate-700 last:border-r-0 ${
                            isFixedColumn ? 'sticky z-20 bg-white' : ''
                          } ${col.key === 'code' ? 'left-0 w-20' : ''} ${
                            col.key === 'name' ? 'left-20 min-w-[150px]' : ''
                          } ${col.key === 'actions' ? 'right-0 w-20' : ''}`}
                        >
                          {renderCellContent(row, col)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={allColumns.length}
                    className="px-4 py-10 text-start text-xl font-medium text-slate-500"
                  >
                    {t('salaries.sheet.messages.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {lastPage > 1 && (
        <div>
          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <LateDeductionModal
        open={lateModalState.open}
        onOpenChange={(open) =>
          setLateModalState((prev) => ({
            ...prev,
            open,
          }))
        }
        employeeId={lateModalState.employeeId}
        year={year}
        month={month}
      />

      <SalaryCalculationModal
        open={salaryModalState.open}
        onOpenChange={(open) =>
          setSalaryModalState((prev) => ({
            ...prev,
            open,
          }))
        }
        data={salaryModalState.row ? buildSalaryCalculationData(salaryModalState.row) : null}
      />

      <Dialog open={showFingerprintIssues} onOpenChange={setShowFingerprintIssues}>
        <DialogContent className="max-h-[92vh] !w-[1200px] !max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('navigation.fingerprintIssues', 'Fingerprint Issues')}
              {allEmployees[currentEmployeeIndex]?.name
                ? ` — ${allEmployees[currentEmployeeIndex].name}`
                : ''}
            </DialogTitle>
          </DialogHeader>

          <EmployeeFingerprintIssuesCrudModal
            employeeId={employeeId}
            employee={
              allEmployees[currentEmployeeIndex]
                ? {
                    employee_code: allEmployees[currentEmployeeIndex].code,
                    name: allEmployees[currentEmployeeIndex].name,
                    shift: allEmployees[currentEmployeeIndex].shift,
                  }
                : null
            }
            employeeName={allEmployees[currentEmployeeIndex]?.name}
            month={month}
            year={year}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
