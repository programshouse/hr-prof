import { useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  FileText,
  CreditCard,
  Home,
  Clock,
  GitBranch,
  LogOut,
  Award,
  Fingerprint,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/error/EmptyState';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { Pagination } from '@/components/ui/Pagination';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { toast, Toaster } from 'sonner';
import {
  useAllBranches,
  useAllDepartments,
  useAllShifts,
  useAllPositions,
} from '@/shared/hooks';
import { useFilter } from '@/shared/hooks/useFilter';
import OvertimeSummaryCards from '../components/OvertimeSummaryCards';
import EmployeeFingerprintIssuesCrudModal from '../components/EmployeeFingerprintIssuesCrudModal';
import EmployeeAllRequests from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeAllRequests';
import EmployeeHolidays from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeHolidays';
import EmployeeRewardsAndPenalties from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeRewardsAndPenalties';
import EmployeeExceptions from '@/features/employees/components/EmplyeeProfile.jsx/EmployeeExceptions';
import SalaryCalculationModal from '@/features/salaries/components/payroll/SalaryCalculationModal';
import { attendanceApi } from '@/features/attendance/api/attendance.api';
import { overtimeApi } from '../api/overtime.api';
import { salariesApi } from '@/features/salaries/api/salariesApi';
import { employeesApi } from '@/features/employees/api/employees.api';
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';
import i18n from '@/i18n';

const TIME_KEYS = new Set(['check_in', 'check_out', 'shift_start', 'shift_end']);

const STICKY_DATE_WIDTH = 110;
const STICKY_DAY_WIDTH = 110;

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\s+/g, ' ');
}

function isMissingTimeValue(value) {
  if (value == null) return true;

  const normalized = normalizeText(value);

  return (
    normalized === '' ||
    normalized === '--' ||
    normalized === '--:--' ||
    normalized === '-' ||
    normalized === '---' ||
    normalized === '----' ||
    normalized === 'null' ||
    normalized === 'undefined' ||
    normalized === 'n/a' ||
    normalized === 'na'
  );
}

function formatTimeTo12h(timeStr) {
  if (!timeStr || isMissingTimeValue(timeStr)) return '--';

  const [hours, minutes] = String(timeStr).split(':');
  const h = parseInt(hours, 10);

  if (Number.isNaN(h)) return timeStr;

  const isAr = i18n.language.startsWith('ar');
  const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : isAr ? 'ص' : 'AM';
  const h12 = h % 12 || 12;

  return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function translateDay(value, t) {
  const day = normalizeText(value);

  const days = {
    sunday: 'sunday',
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
  };

  return days[day] ? t(`days.${days[day]}`) : value || '--';
}

function translateAttendanceStatus(value, t) {
  if (value == null || value === '') return '--';

  const status = normalizeText(value);

  if (status.includes('official holiday allowance')) {
    return t('overtime.sheet.attendanceStatus.officialHolidayAllowance');
  }

  if (status === 'week end' || status === 'weekend' || status === 'day off') {
    return t('overtime.sheet.attendanceStatus.dayOff');
  }

  if (status.includes('present')) return t('overtime.sheet.attendanceStatus.present');
  if (status.includes('absent')) return t('overtime.sheet.attendanceStatus.absent');
  if (status.includes('late')) return t('overtime.sheet.attendanceStatus.late');
  if (status.includes('early')) return t('overtime.sheet.attendanceStatus.early');
  if (status.includes('on time')) return t('overtime.sheet.attendanceStatus.onTime');

  return value;
}

function translatePermission(value, t) {
  if (value == null || value === '') return '--';

  const permission = normalizeText(value);

  if (
    value === true ||
    permission === 'true' ||
    permission === 'yes' ||
    permission === 'permitted'
  ) {
    return t('overtime.sheet.permission.permitted');
  }

  if (
    value === false ||
    permission === 'false' ||
    permission === 'no' ||
    permission === 'not permitted' ||
    permission.includes('not permitted') ||
    permission.includes('rejected')
  ) {
    return t('overtime.sheet.permission.notPermitted');
  }

  return value;
}

function translateDeductionStatus(value, t) {
  if (value == null || value === '') return '--';

  const deduction = normalizeText(value);

  if (value === true || deduction === 'true' || deduction.includes('applied')) {
    return t('overtime.sheet.deductionStatus.applied');
  }

  if (
    value === false ||
    deduction === 'false' ||
    deduction.includes('no deduction') ||
    deduction === 'not applied'
  ) {
    return t('overtime.sheet.deductionStatus.noDeduction');
  }

  return value;
}

function translateHolidayType(value, t) {
  if (value == null || value === '') return '--';

  const holidayType = normalizeText(value);

  if (holidayType.includes('annual')) return t('overtime.sheet.holidayTypes.annual');
  if (holidayType.includes('sick')) return t('overtime.sheet.holidayTypes.sick');
  if (holidayType.includes('casual')) return t('overtime.sheet.holidayTypes.casual');
  if (holidayType.includes('official')) return t('overtime.sheet.holidayTypes.official');

  return value;
}

function translateHolidayValue(value, row, t) {
  if (row?.is_absent) return t('common.yes');

  if (value == null || value === '') return '--';

  const holiday = normalizeText(value);

  if (value === true || holiday === 'true' || holiday === 'yes') return t('common.yes');
  if (value === false || holiday === 'false' || holiday === 'no') return t('common.no');

  return translateHolidayType(value, t);
}

function formatCellValue(row, columnKey, t) {
  const value = row?.[columnKey];

  if (value == null || value === '' || value === undefined) return '--';

  if (TIME_KEYS.has(columnKey)) return formatTimeTo12h(value);

  if (columnKey === 'day') return translateDay(value, t);

  if (columnKey === 'attendance_status') {
    return translateAttendanceStatus(value, t);
  }

  if (columnKey === 'has_approved_leave') {
    return translatePermission(value, t);
  }

  if (columnKey === 'deduction_status') {
    return translateDeductionStatus(value, t);
  }

  if (columnKey === 'is_holiday') {
    return translateHolidayValue(value, row, t);
  }

  if (columnKey === 'holiday_type') {
    return translateHolidayType(value, t);
  }

  return value;
}

function getTranslatedRows(rows, columns, t) {
  return rows.map((row) => {
    const translatedRow = { ...row };

    columns.forEach((column) => {
      translatedRow[column.key] = formatCellValue(row, column.key, t);
    });

    return translatedRow;
  });
}

const getRequestModuleButtons = (t) => [
  { id: 'leaves', label: t('requests.table.types.leaves', 'Leaves'), icon: FileText },
  { id: 'days-off', label: t('requests.table.types.daysOff', 'Days Off'), icon: Calendar },
  { id: 'loans', label: t('requests.table.types.loans', 'Loans'), icon: CreditCard },
  { id: 'remotely', label: t('requests.table.types.remotely', 'Remotely'), icon: Home },
  { id: 'overtimes', label: t('requests.table.types.overtimes', 'Overtimes'), icon: Clock },
  {
    id: 'branch-transfers',
    label: t('requests.table.types.branchTransfers', 'Branch Transfers'),
    icon: GitBranch,
  },
  { id: 'resignations', label: t('requests.table.types.resignations', 'Resignations'), icon: LogOut },
];

const getOvertimeTableSections = (t) => [
  {
    title: t('overtime.sheet.sections.dailyAttendance'),
    columns: [
      { key: 'date', label: t('overtime.sheet.columns.date') },
      { key: 'day', label: t('overtime.sheet.columns.day') },
      { key: 'check_in', label: t('overtime.sheet.columns.checkIn') },
      { key: 'check_out', label: t('overtime.sheet.columns.checkOut') },
      { key: 'shift_start', label: t('overtime.sheet.columns.shiftStart') },
      { key: 'shift_end', label: t('overtime.sheet.columns.shiftEnd') },
      { key: 'attendance_status', label: t('overtime.sheet.columns.attendanceStatus') },
      { key: 'has_approved_leave', label: t('overtime.sheet.columns.havePermission') },
      { key: 'deduction_status', label: t('overtime.sheet.columns.deductionStatus') },
      { key: 'deduction_amount', label: t('overtime.sheet.columns.deductionAmount') },
      { key: 'is_holiday', label: t('overtime.sheet.columns.holiday') },
      { key: 'holiday_type', label: t('overtime.sheet.columns.holidayType') },
      { key: 'holiday_amount', label: t('overtime.sheet.columns.amount') },
      { key: 'expected_working_hours', label: t('overtime.sheet.columns.expectedWorkingHours') },
      { key: 'actual_working_hours', label: t('overtime.sheet.columns.actualWorkingHours') },
      { key: 'total_delay', label: t('overtime.sheet.columns.totalDelay') },
      { key: 'total_overtime_hours', label: t('overtime.sheet.columns.totalOvertimeHours') },
      { key: 'overtime_amount', label: t('overtime.sheet.columns.overtimeAmount') },
      { key: 'reason', label: t('overtime.sheet.columns.reason') },
    ],
  },
];

function pickEmployeeDisplayNameFromApiPayload(payload) {
  if (!payload) return '';

  const root = payload?.data != null ? payload.data : payload;

  if (!root || typeof root !== 'object') return '';

  const employee = root.employee ?? root;
  const applicant = root.applicant ?? employee?.applicant;

  const parts = (e) =>
    [e?.first_name, e?.middle_name, e?.last_name]
      .filter((n) => n && String(n).trim() !== '')
      .join(' ');

  return (
    employee?.full_name ||
    employee?.name ||
    employee?.employee_name ||
    applicant?.full_name ||
    parts(applicant) ||
    parts(employee) ||
    ''
  );
}

function pickNameFromOvertimeMonthPayload(d) {
  if (!d || typeof d !== 'object') return '';

  const root = d.data && typeof d.data === 'object' && !Array.isArray(d.data) ? d.data : d;

  return root.employee?.full_name || root.employee?.name || root.employee_name || root.full_name || '';
}

const getHolidayConfig = (t) => ({
  casual: {
    label: t('overtime.sheet.holidayTypes.casual'),
    className: 'bg-blue-100 text-blue-700 font-medium',
  },
  sick: {
    label: t('overtime.sheet.holidayTypes.sick'),
    className: 'bg-red-50 text-red-600 font-medium',
  },
  annual: {
    label: t('overtime.sheet.holidayTypes.annual'),
    className: 'bg-purple-100 text-purple-700 font-medium',
  },
  official: {
    label: t('overtime.sheet.holidayTypes.official'),
    className: 'bg-yellow-100 text-yellow-700 font-medium',
  },
});

function getCellStyling(row, columnKey, t) {
  const actualHours = toNumber(String(row.actual_working_hours || '').replace(/[^\d.]/g, ''));

  const attendance = normalizeText(row.attendance_status);
  const permission = normalizeText(row.has_approved_leave);
  const deduction = normalizeText(row.deduction_status);
  const holiday = normalizeText(row.is_holiday);
  const day = normalizeText(row.day);

  const checkInMissing = isMissingTimeValue(row.check_in);
  const checkOutMissing = isMissingTimeValue(row.check_out);
  const holidayConfig = getHolidayConfig(t);

  if (columnKey === 'day' && day === 'friday') {
    return 'bg-sky-100 text-sky-700 font-medium';
  }

  if (columnKey === 'check_in' && checkInMissing) {
    return 'bg-red-50 text-red-600 font-medium';
  }

  if (columnKey === 'check_out' && checkOutMissing) {
    return 'bg-red-50 text-red-600 font-medium';
  }

  if (
    (columnKey === 'check_in' || columnKey === 'check_out') &&
    attendance.includes('absent')
  ) {
    return 'bg-red-50 text-red-600 font-medium';
  }

  if (columnKey === 'attendance_status') {
    if (attendance.includes('present')) {
      return 'bg-green-100 text-green-600 font-medium';
    }

    if (attendance.includes('official holiday allowance')) {
      return 'bg-yellow-100 text-yellow-700 font-medium';
    }

    if (attendance.includes('week end') || attendance.includes('day off')) {
      return 'bg-blue-100 text-blue-700 font-medium';
    }

    if (attendance.includes('late')) {
      return 'bg-amber-50 text-amber-600 font-medium';
    }

    if (attendance.includes('early')) {
      return 'bg-orange-50 text-orange-600 font-medium';
    }

    if (attendance.includes('absent')) {
      return 'bg-red-50 text-red-600 font-medium';
    }

    if (attendance.includes('on time')) {
      return 'bg-slate-50 text-slate-600 font-medium';
    }
  }

  if (columnKey === 'has_approved_leave') {
    if (permission === 'true' || row.has_approved_leave === true || permission === 'permitted') {
      return 'text-success font-medium';
    }

    if (
      permission.includes('not permitted') ||
      permission === 'no' ||
      permission.includes('rejected') ||
      permission === 'false' ||
      row.has_approved_leave === false
    ) {
      return 'text-red-600 font-medium';
    }
  }

  if (columnKey === 'deduction_status') {
    if (deduction.includes('applied') || row.deduction_status === true) {
      return 'bg-red-50 text-red-600 font-medium';
    }

    if (deduction.includes('no deduction') || row.deduction_status === false) {
      return 'bg-slate-100 text-slate-600 font-medium';
    }
  }

  if (columnKey === 'is_holiday') {
    if (holiday.includes('casual')) {
      return holidayConfig.casual.className;
    }

    if (holiday.includes('sick')) {
      return holidayConfig.sick.className;
    }

    if (holiday.includes('annual')) {
      return holidayConfig.annual.className;
    }
  }

  if (columnKey === 'holiday_type') {
    const holidayType = normalizeText(row.holiday_type);

    if (holidayType.includes('annual')) {
      return holidayConfig.annual.className;
    }

    if (holidayType.includes('sick')) {
      return holidayConfig.sick.className;
    }

    if (holidayType.includes('casual')) {
      return holidayConfig.casual.className;
    }

    if (holidayType.includes('official')) {
      return holidayConfig.official.className;
    }
  }

  if (columnKey === 'actual_working_hours') {
    if (actualHours > 9) {
      return 'bg-green-50 text-green-600 font-medium';
    }

    if (actualHours > 0 && actualHours < 9) {
      return 'bg-amber-50 text-amber-600 font-medium';
    }
  }

  return '';
}

function getStickyCellClass(columnKey, baseBg = 'bg-white') {
  if (columnKey === 'date') {
    return `sticky z-20 ${baseBg}`;
  }

  if (columnKey === 'day') {
    return `sticky z-20 ${baseBg}`;
  }

  return '';
}

export default function OvertimeSheetPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const setBreadcrumbName = useBreadcrumbStore((state) => state.setName);
  const scrollerRef = useRef(null);

  const isAr = i18n.language.startsWith('ar');

  const getStickyStyle = (columnKey) => {
    if (columnKey === 'date') {
      return {
        [isAr ? 'right' : 'left']: 0,
        width: `${STICKY_DATE_WIDTH}px`,
        minWidth: `${STICKY_DATE_WIDTH}px`,
      };
    }

    if (columnKey === 'day') {
      return {
        [isAr ? 'right' : 'left']: `${STICKY_DATE_WIDTH}px`,
        width: `${STICKY_DAY_WIDTH}px`,
        minWidth: `${STICKY_DAY_WIDTH}px`,
      };
    }

    return undefined;
  };

  const { month, year, date } = useMemo(() => {
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
  }, [searchParams]);

  const employeeId = searchParams.get('employee-id') || searchParams.get('employee_id');
  const returnNextEmployeeId = searchParams.get('return_next_employee_id');
  const returnPage = searchParams.get('return_page') || '1';
  const returnPageSize = searchParams.get('return_pageSize') || '20';
  const search = searchParams.get('search') || '';
  const shiftId = searchParams.get('shift_id') || '';
  const positionId = searchParams.get('position_id') || '';
  const departmentId = searchParams.get('department_id') || '';
  const branchId = searchParams.get('branch_id') || '';
  const contractType = searchParams.get('contract_type') || '';

  useEffect(() => {
    if (employeeId && (!searchParams.get('month') || !searchParams.get('year'))) {
      const params = new URLSearchParams(searchParams);
      params.set('month', String(month));
      params.set('year', String(year));
      setSearchParams(params);
    }
  }, [employeeId, month, year, searchParams, setSearchParams]);

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    shift_id: searchParams.get('shift_id') || '',
    position_id: searchParams.get('position_id') || '',
    department_id: searchParams.get('department_id') || '',
    branch_id: searchParams.get('branch_id') || '',
  }));

  useAllBranches();
  useAllDepartments();
  useAllShifts();
  useAllPositions();

  useFilter(filters, setFilters, 'search');

  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  const allColumns = useMemo(() => getOvertimeTableSections(t).flatMap((s) => s.columns), [t]);
  const [showSalaryCalculation, setShowSalaryCalculation] = useState(false);
  const requestModuleButtons = useMemo(() => getRequestModuleButtons(t), [t]);
  const [employeeSectionModal, setEmployeeSectionModal] = useState(null);
  const [activeRequestModule, setActiveRequestModule] = useState('leaves');

  const openRequestsModule = (moduleId) => {
    setActiveRequestModule(moduleId);
    setEmployeeSectionModal('requests');
  };

  const closeEmployeeSectionModal = () => {
    setEmployeeSectionModal(null);
  };

  const { data: employeePayrollData } = useQuery({
    queryKey: ['employeePayrollSheet', employeeId, year, month],
    queryFn: () => salariesApi.getEmployeePayrollSheet(parseInt(employeeId, 10), year, month),
    enabled: !!employeeId && showSalaryCalculation,
  });

  const { data: allEmployeesData } = useQuery({
    queryKey: ['salarySheet', year, month, {}, 1, 1000],
    queryFn: () =>
      salariesApi.getSalarySheet({
        year,
        month,
        page: 1,
        pageSize: 200,
      }),
    enabled: !!employeeId && !!year && !!month,
  });

  const allEmployees = useMemo(() => allEmployeesData?.data ?? [], [allEmployeesData?.data]);

  const { data: employeeDetails } = useQuery({
    queryKey: ['overtimeSheetEmployee', employeeId],
    queryFn: () => employeesApi.getEmployee(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });

  const employeeRecord = useMemo(
    () => employeeDetails?.data?.data ?? employeeDetails?.data ?? employeeDetails ?? null,
    [employeeDetails]
  );

  const currentEmployeeIndex = useMemo(() => {
    if (!employeeId || allEmployees.length === 0) return 0;

    const currentIndex = allEmployees.findIndex((emp) => String(emp.id) === String(employeeId));

    return currentIndex !== -1 ? currentIndex : 0;
  }, [allEmployees, employeeId]);

  const handleBackToSalaryAndOpenNext = () => {
    const params = new URLSearchParams();

    params.set('month', String(month));
    params.set('year', String(year));
    params.set('page', String(returnPage));
    params.set('pageSize', String(returnPageSize));

    if (search) params.set('search', search);
    if (shiftId) params.set('shift_id', shiftId);
    if (positionId) params.set('position_id', positionId);
    if (departmentId) params.set('department_id', departmentId);
    if (branchId) params.set('branch_id', branchId);
    if (contractType) params.set('contract_type', contractType);

    if (returnNextEmployeeId) {
      params.set('auto_open_overtime_employee_id', String(returnNextEmployeeId));
    }

    navigate(`/salary-sheet?${params.toString()}`);
  };

  const queryKey = ['overtimeSheet', year, month, filters, currentPage, pageSize, employeeId];

  const { data: overtimeData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      if (employeeId) {
        return overtimeApi.getMonthAttendanceDetails(
          employeeId,
          `${year}-${String(month).padStart(2, '0')}`
        );
      }

      return attendanceApi.getOvertimeSheet({
        year,
        month,
        page: currentPage,
        pageSize,
        ...filters,
      });
    },
    enabled: !!year && !!month,
    staleTime: 0,
  });

  const rows = employeeId
    ? overtimeData?.overtime_data ??
      overtimeData?.rows ??
      overtimeData?.attendance_details ??
      overtimeData?.daily_attendance ??
      overtimeData?.records ??
      []
    : overtimeData?.overtime_data ?? overtimeData?.data ?? [];

  const pagination = employeeId ? {} : overtimeData?.meta?.pagination ?? {};
  const lastPage = Math.max(1, toNumber(pagination.last_page, 1));

  const overtimeEmployeeDisplayName = useMemo(() => {
    if (!employeeId) return '';

    const row = allEmployees[currentEmployeeIndex];

    const fromSalarySheet =
      row && String(row.id) === String(employeeId)
        ? row.name || row.full_name || row.employee_name
        : '';

    if (fromSalarySheet) return fromSalarySheet;

    const fromEmployeeApi = pickEmployeeDisplayNameFromApiPayload(employeeDetails);
    if (fromEmployeeApi) return fromEmployeeApi;

    return pickNameFromOvertimeMonthPayload(overtimeData);
  }, [employeeId, allEmployees, currentEmployeeIndex, employeeDetails, overtimeData]);

  useEffect(() => {
    if (!employeeId) {
      setBreadcrumbName('overtime-sheet', '');
      return;
    }

    if (!overtimeEmployeeDisplayName) {
      setBreadcrumbName('overtime-sheet', '');
      return;
    }

    setBreadcrumbName('overtime-sheet', overtimeEmployeeDisplayName);
  }, [employeeId, overtimeEmployeeDisplayName, setBreadcrumbName]);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);

    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('date');
    params.delete('page');

    setSearchParams(params);
  };

  const formatMonthDisplay = (d) => {
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const isCurrentMonth = () => {
    const now = new Date();

    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const handlePageChange = (page) => {
    const next = Math.min(Math.max(1, page), lastPage);
    const params = new URLSearchParams(searchParams);

    if (next > 1) params.set('page', String(next));
    else params.delete('page');

    setSearchParams(params);
  };

  const handleExport = (format) => {
    if (!rows?.length) {
      toast.error(t('overtime.actions.noDataToExport'));
      return;
    }

    const translatedRows = getTranslatedRows(rows, allColumns, t);
    const fileName = `overtime-sheet-${new Date().toISOString().split('T')[0]}`;

    if (format === 'excel') {
      exportToExcel({
        rows: translatedRows,
        columns: allColumns,
        fileName,
      });
    } else if (format === 'pdf') {
      exportToPdf({
        rows: translatedRows,
        columns: allColumns,
        fileName,
        title: t('overtime.actions.exportReportTitle'),
      });
    } else if (format === 'print') {
      printTable({
        rows: translatedRows,
        columns: allColumns,
        title: t('overtime.actions.exportReportTitle'),
      });
    }
  };

  const syncScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
  };

  return (
    <>
      <style>{`
        .overtime-sheet-scroll-area {
          max-height: calc(100vh - 320px);
          overflow: auto;
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #e2e8f0;
        }

        .overtime-sheet-scroll-area::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .overtime-sheet-scroll-area::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 9999px;
        }

        .overtime-sheet-scroll-area::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 9999px;
        }

        .overtime-sheet-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-4">
          <div className="flex items-center gap-2">
            {employeeId && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBackToSalaryAndOpenNext}
                title={t('overtime.actions.backToSalarySheet')}
              >
                <ArrowLeft className="size-4 sm:size-5" />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              title={t('overtime.actions.previousMonth')}
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
              title={t('overtime.actions.nextMonth')}
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

          <ExportDialog
            title={t('overtime.actions.exportDialogTitle')}
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
              {t('overtime.actions.export')}
            </Button>
          </ExportDialog>
        </div>

        <OvertimeSummaryCards data={overtimeData} />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4 text-xs font-semibold shadow-sm"
                onClick={() => {
                  if (employeeId) {
                    setShowSalaryCalculation(true);
                  }
                }}
                disabled={!employeeId}
              >
                {t('overtime.actions.showSalarySheet')}
              </Button>

              <Button
                variant="reset1"
                size="sm"
                className="h-10 px-4 text-xs font-semibold shadow-sm"
                onClick={() => handleExport('excel')}
              >
                <Download className="mr-1.5 h-4 w-4" />
                {t('overtime.actions.exportData')}
              </Button>
            </div>
          </div>
        </div>

        {employeeId && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              {t('overtime.employeeActions.title')}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {requestModuleButtons.map((module) => {
                const ModuleIcon = module.icon;

                return (
                  <Button
                    key={module.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md px-3 text-xs font-semibold shadow-xs"
                    onClick={() => openRequestsModule(module.id)}
                  >
                    <ModuleIcon className="mr-1.5 h-4 w-4" />
                    {module.label}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-3 text-xs font-semibold shadow-xs"
                onClick={() => setEmployeeSectionModal('holidays')}
              >
                <Calendar className="mr-1.5 h-4 w-4" />
                {t('employees.profile.sidebar.holidays')}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-3 text-xs font-semibold shadow-xs"
                onClick={() => setEmployeeSectionModal('rewards-penalties')}
              >
                <Award className="mr-1.5 h-4 w-4" />
                {t('employees.profile.sidebar.rewardsAndPenalties')}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-3 text-xs font-semibold shadow-xs"
                onClick={() => setEmployeeSectionModal('fingerprint-issues')}
              >
                <Fingerprint className="mr-1.5 h-4 w-4" />
                {t('navigation.fingerprintIssues', 'Fingerprint Issues')}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-3 text-xs font-semibold shadow-xs"
                onClick={() => setEmployeeSectionModal('exceptions')}
              >
                <AlertCircle className="mr-1.5 h-4 w-4" />
                {t('employees.profile.manager.exceptions.title', 'Exceptions')}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              {t('overtime.colorLegend.title')}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {[
              { labelKey: 'present', color: 'bg-green-100 border-green-200' },
              { labelKey: 'absent', color: 'bg-red-50 border-red-200' },
              { labelKey: 'late', color: 'bg-amber-50 border-amber-200' },
              { labelKey: 'early', color: 'bg-orange-50 border-orange-200' },
              { labelKey: 'onTime', color: 'bg-slate-50 border-slate-200' },
              { labelKey: 'weekend', color: 'bg-blue-100 border-blue-200' },
              { labelKey: 'holiday', color: 'bg-yellow-100 border-yellow-200' },
              { labelKey: 'friday', color: 'bg-sky-100 border-sky-200' },
              { labelKey: 'annual', color: 'bg-purple-100 border-purple-200' },
              { labelKey: 'moreThan9h', color: 'bg-green-50 border-green-200' },
              { labelKey: 'permission', color: 'bg-green-600 border-green-700 text-white' },
            ].map((item) => (
              <div key={item.labelKey} className="flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded-sm border ${item.color}`} />
                <span
                  className={`text-slate-600 ${
                    item.labelKey === 'permission' ? 'text-slate-800' : ''
                  }`}
                >
                  {t(`overtime.colorLegend.${item.labelKey}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="relative">
            <div
              ref={scrollerRef}
              onScroll={syncScrollState}
              onMouseEnter={syncScrollState}
              dir={isAr ? 'rtl' : 'ltr'}
              className="overtime-sheet-scroll-area"
            >
              <Table
                containerClassName="overflow-x-visible overflow-y-visible"
                className="min-w-max border-separate border-spacing-0"
              >
                <colgroup>
                  <col style={{ width: `${STICKY_DATE_WIDTH}px` }} />
                  <col style={{ width: `${STICKY_DAY_WIDTH}px` }} />
                </colgroup>

                <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:bg-slate-50">
                  <TableRow className="bg-slate-50 shadow-[0_1px_0_0_rgb(226_232_240)]">
                    {allColumns.map((col) => {
                      const isDate = col.key === 'date';
                      const isDay = col.key === 'day';

                      return (
                        <TableHead
                          key={col.key}
                          style={getStickyStyle(col.key)}
                          className={`
                            border-b border-r border-slate-200 last:border-r-0
                            px-4 py-3 text-[13px] font-semibold text-slate-700 whitespace-nowrap
                            ${isDate ? 'sticky z-30 bg-slate-50' : ''}
                            ${isDay ? 'sticky z-30 bg-slate-50' : ''}
                          `}
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
                        {allColumns.map((col) => (
                          <TableCell
                            key={col.key}
                            style={getStickyStyle(col.key)}
                            className={`
                              border-b border-r border-slate-200 last:border-r-0
                              px-4 py-3 text-[13px] text-slate-700 whitespace-nowrap
                              ${getStickyCellClass(col.key, 'bg-white')}
                            `}
                          >
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : rows.length ? (
                    rows.map((row, index) => (
                      <TableRow
                        key={row.id ?? row.code ?? `${row.name}-${row.phone}-${index}`}
                        className="hover:bg-slate-50/40"
                      >
                        {allColumns.map((col) => {
                          const cellStyle = getCellStyling(row, col.key, t);

                          return (
                            <TableCell
                              key={col.key}
                              style={getStickyStyle(col.key)}
                              className={`
                                border-b border-r border-slate-200 last:border-r-0
                                px-4 py-3 text-[13px] text-slate-700 whitespace-nowrap
                                ${getStickyCellClass(col.key, 'bg-white')}
                                ${cellStyle}
                              `}
                            >
                              {formatCellValue(row, col.key, t)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={allColumns.length} className="p-6">
                        <EmptyState title={t('overtime.sheet.emptyState')} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
      </div>

      <SalaryCalculationModal
        open={showSalaryCalculation}
        onOpenChange={setShowSalaryCalculation}
        data={employeePayrollData?.data}
      />

      <Dialog
        open={employeeSectionModal === 'requests'}
        onOpenChange={(open) => !open && closeEmployeeSectionModal()}
      >
        <DialogContent className="max-h-[92vh] !w-[1200px] !max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('requests.title')}
              {overtimeEmployeeDisplayName ? ` — ${overtimeEmployeeDisplayName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <EmployeeAllRequests
            employeeId={employeeId}
            employee={employeeRecord}
            initialRequestTab={activeRequestModule}
            syncSearchParams={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeSectionModal === 'holidays'}
        onOpenChange={(open) => !open && closeEmployeeSectionModal()}
      >
        <DialogContent className="max-h-[92vh] !w-[1200px] !max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('employees.profile.details.holidays.title')}
              {overtimeEmployeeDisplayName ? ` — ${overtimeEmployeeDisplayName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <EmployeeHolidays employeeId={employeeId} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeSectionModal === 'rewards-penalties'}
        onOpenChange={(open) => !open && closeEmployeeSectionModal()}
      >
        <DialogContent className="max-h-[92vh] !w-[1200px] !max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('employees.profile.sidebar.rewardsAndPenalties')}
              {overtimeEmployeeDisplayName ? ` — ${overtimeEmployeeDisplayName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <EmployeeRewardsAndPenalties
            employeeId={employeeId}
            employeeName={overtimeEmployeeDisplayName}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeSectionModal === 'fingerprint-issues'}
        onOpenChange={(open) => !open && closeEmployeeSectionModal()}
      >
        <DialogContent className="max-h-[92vh] !w-[1200px] !max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('navigation.fingerprintIssues', 'Fingerprint Issues')}
              {overtimeEmployeeDisplayName ? ` — ${overtimeEmployeeDisplayName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <EmployeeFingerprintIssuesCrudModal
            employeeId={employeeId}
            employee={employeeRecord}
            employeeName={overtimeEmployeeDisplayName}
            month={month}
            year={year}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={employeeSectionModal === 'exceptions'}
        onOpenChange={(open) => !open && closeEmployeeSectionModal()}
      >
        <DialogContent className="max-h-[92vh] !w-[1200px] !max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('employees.profile.manager.exceptions.title', 'Exceptions')}
              {overtimeEmployeeDisplayName ? ` — ${overtimeEmployeeDisplayName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <EmployeeExceptions employeeId={employeeId} />
        </DialogContent>
      </Dialog>

    </>
  );
}