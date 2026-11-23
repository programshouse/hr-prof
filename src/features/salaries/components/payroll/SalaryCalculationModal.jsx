import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Wallet,
  Info,
  SquarePen,
  Mail,
  MessageCircle,
  Download,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { captureElementAsPng } from '@/lib/export/captureElementAsImage';
import { Button } from '@/components/ui/button';
import { salariesApi } from '../../api/salariesApi';
import { employeesApi } from '@/features/employees/api/employees.api';
import { sharedEmployeesApi } from '@/shared/api/employees.api';
import { attendanceApi } from '@/features/attendance/api/attendance.api';
import SalaryManualUpdateModal from './SalaryManualUpdateModal';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { formatValueWithUnitSuffix } from '@/utils/durationLabels';
import SalaryCalculationDetailsView from './SalaryCalculationDetailsView';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

const SALARY_CALCULATION_EXPORT_COLUMNS = [
  { key: 'label', label: 'Item' },
  { key: 'value', label: 'Amount' },
];

const getDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return '';

  if (typeof value === 'object') {
    return (
      value?.name ??
      value?.title ??
      value?.label ??
      value?.full_name ??
      value?.branch_name ??
      value?.department_name ??
      value?.position_name ??
      value?.company_name ??
      value?.company_title ??
      ''
    );
  }

  return String(value);
};

const normalizeWorkMode = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const humanizeWorkMode = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const normalizeDayName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const formatScheduleTime = (value) => {
  const text = String(value || '').trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) {
    return text.slice(0, 5);
  }

  return text;
};

const parseScheduleArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    return Object.values(value);
  }

  return [];
};

export default function SalaryCalculationModal({ open, onOpenChange, data: propData, onUpdate }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();

  const storeData = usePayrollStore((state) => state.payrollData);

  const data = propData || storeData;

  const [openManualUpdate, setOpenManualUpdate] = useState(false);
  const [view, setView] = useState('summary');
  const exportContentRef = useRef(null);

  const employeeId = data?.employee?.id;
  const payrollYear = data?.header?.year ?? data?.employee?.year;
  const payrollMonth = data?.header?.month ?? data?.employee?.month;

  const handleGoToAttendanceSummary = () => {
    if (!employeeId || !payrollYear || !payrollMonth) {
      toast.error(
        t('salaries.salaryCalculationModal.messages.attendanceNotAvailable', {
          defaultValue: 'Attendance summary is not available for this employee.',
        })
      );
      return;
    }

    const monthValue = `${payrollYear}-${String(payrollMonth).padStart(2, '0')}`;

    // Keep the exact salary page URL so the attendance page can return here.
    const returnUrl = `${location.pathname}${location.search}${location.hash || ''}`;

    const attendanceParams = new URLSearchParams();
    attendanceParams.set('month', monthValue);
    attendanceParams.set('return_to', returnUrl);
    attendanceParams.set('from', 'salary-calculation');

    onOpenChange(false);

    navigate(`/attendance/employee/${employeeId}?${attendanceParams.toString()}`);
  };

  // The payroll-sheet payload is also used to resolve the employee salary mode.
  // In particular, the backend can return employee.type = "full_time" while
  // tables.freelance_tasks is the authoritative signal for Freelancer (Tasks).
  const payrollSheetEnabled = open && !!employeeId && !!payrollYear && !!payrollMonth;
  const payrollDetailsEnabled = payrollSheetEnabled && view === 'details';

  const { data: payrollSheetResponse, isLoading: isPayrollSheetLoading } = useQuery({
    queryKey: ['salaryCalculationSheet', employeeId, payrollYear, payrollMonth],
    queryFn: () => salariesApi.getEmployeePayrollSheet(employeeId, payrollYear, payrollMonth),
    enabled: payrollSheetEnabled,
  });

  const { data: attendanceSummaryResponse } = useQuery({
    queryKey: ['employeeAttendanceSummary', employeeId, payrollYear, payrollMonth],
    queryFn: () =>
      attendanceApi.getMonthlySummary(
        employeeId,
        `${payrollYear}-${String(payrollMonth).padStart(2, '0')}`
      ),
    enabled: payrollDetailsEnabled,
  });

  const { data: penaltiesResponse } = useQuery({
    queryKey: ['salaryCalcPenalties', employeeId, payrollYear, payrollMonth],
    queryFn: () => salariesApi.getEmployeePenalties(employeeId, payrollYear, payrollMonth),
    enabled: payrollDetailsEnabled,
  });

  const { data: rewardsResponse } = useQuery({
    queryKey: ['salaryCalcRewards', employeeId, payrollYear, payrollMonth],
    queryFn: () => salariesApi.getEmployeeRewards(employeeId, payrollYear, payrollMonth),
    enabled: payrollDetailsEnabled,
  });

  const payrollPayload =
    payrollSheetResponse?.data && payrollSheetResponse?.status !== false
      ? payrollSheetResponse.data
      : null;

  const attendanceRowsFromSummary =
    attendanceSummaryResponse?.data?.rows || attendanceSummaryResponse?.rows || [];

  const annualIncreaseDate =
    data?.header?.annualIncreaseDate ??
    data?.employee?.annualIncreaseDate ??
    data?.annualIncreaseDate ??
    payrollPayload?.header?.annualIncreaseDate ??
    payrollPayload?.employee?.annualIncreaseDate ??
    payrollPayload?.annualIncreaseDate ??
    '--';

  const sheetData = payrollPayload
    ? {
        ...data,
        ...payrollPayload,
        attendance_rows: attendanceRowsFromSummary,
        annualIncreaseDate,
        header: {
          ...(data?.header || {}),
          ...(payrollPayload?.header || {}),
          annualIncreaseDate,
        },
      }
    : {
        ...data,
        attendance_rows: attendanceRowsFromSummary,
        annualIncreaseDate,
        header: {
          ...(data?.header || {}),
          annualIncreaseDate,
        },
      };

  const penaltiesRows = penaltiesResponse?.data?.rows ?? sheetData?.tables?.penalties ?? [];

  const rewardsRows = rewardsResponse?.data?.rows ?? sheetData?.tables?.rewards ?? [];

  useEffect(() => {
    if (!open) {
      setView('summary');
    }
  }, [open]);

  const parseMoneyValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'string') {
      const numeric = parseFloat(value.replace(/[^\d.-]/g, ''));

      return Number.isNaN(numeric) ? 0 : numeric;
    }

    const numeric = Number(value);

    return Number.isNaN(numeric) ? 0 : numeric;
  };

  const formatTextValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '--';
    }

    return String(value);
  };

  const { data: deductionsData } = useQuery({
    queryKey: ['employeeDeductions', employeeId, payrollYear, payrollMonth],
    queryFn: () => salariesApi.getEmployeeDeductions(employeeId, payrollYear, payrollMonth),
    enabled: payrollDetailsEnabled,
  });

  const { data: employeeDetails } = useQuery({
    queryKey: ['employeeDetails', data?.employee?.id],
    queryFn: () => employeesApi.getEmployee(data?.employee?.id),
    enabled: open && !!data?.employee?.id,
  });

  // Payroll responses can expose a generic `type` (for example `full_time`)
  // while the employee master record carries the actual salary mode in `shift`
  // (for example `Freelancer (Tasks)`). Load the master list as an authoritative
  // fallback so the salary modal uses the real configured shift.
  const { data: employeeMasterRows = [] } = useQuery({
    queryKey: ['salaryCalculationEmployeeMasterList'],
    queryFn: sharedEmployeesApi.getAllEmployees,
    enabled: open && !!data?.employee?.id,
    staleTime: 5 * 60 * 1000,
  });

  const employee = data?.employee || {};
  const header = data?.header || {};

  const employeeDetailsData =
    employeeDetails?.data?.employee ??
    employeeDetails?.data?.data?.employee ??
    employeeDetails?.data?.data ??
    employeeDetails?.employee ??
    employeeDetails?.data ??
    employeeDetails ??
    {};

  const employeeMasterRow = Array.isArray(employeeMasterRows)
    ? employeeMasterRows.find(
        (row) => String(row?.id ?? row?.employee_id) === String(employee?.id)
      ) || null
    : null;

  const applicantData =
    data?.applicant || employeeDetailsData?.applicant || employee?.applicant || {};

  const employeeName =
    resolveEmployeeDisplayName(
      {
        ...employeeDetailsData,
        ...employee,
        applicant: applicantData,
      },
      { preferArabic: isArabic }
    ) ||
    employee?.name ||
    employee?.full_name ||
    employee?.employee_name ||
    employeeDetailsData?.full_name ||
    data?.employee_name ||
    data?.full_name ||
    data?.name ||
    applicantData?.full_name ||
    applicantData?.preferred_name ||
    [applicantData?.first_name, applicantData?.middle_name, applicantData?.last_name]
      .filter(Boolean)
      .join(' ') ||
    [
      employeeDetailsData?.first_name,
      employeeDetailsData?.middle_name,
      employeeDetailsData?.last_name,
    ]
      .filter(Boolean)
      .join(' ') ||
    'Employee Name';

  const employeeCode =
    employee?.code || employeeDetailsData?.code || applicantData?.applicant_code || '';

  const employeeImage =
    employee?.image ||
    employeeDetailsData?.image ||
    applicantData?.image ||
    applicantData?.profile_image ||
    employee?.profile_image ||
    data?.image ||
    '';

  const employeePosition = getDisplayValue(
    employee?.position ??
      employee?.position_name ??
      employeeDetailsData?.position ??
      employeeDetailsData?.position_name ??
      applicantData?.position ??
      data?.position
  );

  const employeeDepartment = getDisplayValue(
    employee?.department ??
      employee?.department_name ??
      employee?.department?.name ??
      employee?.job?.department ??
      employee?.work_info?.department ??
      employeeDetailsData?.department ??
      employeeDetailsData?.department_name ??
      employeeDetailsData?.department?.name ??
      employeeDetailsData?.job?.department ??
      employeeDetailsData?.work_info?.department ??
      applicantData?.department ??
      applicantData?.department_name ??
      applicantData?.department?.name ??
      data?.department ??
      data?.department_name ??
      data?.department?.name
  );

  const employeeShiftSource =
    employeeMasterRow?.shift ??
    employeeMasterRow?.shift_name ??
    employeeMasterRow?.work_info?.shift ??
    employeeMasterRow?.workInfo?.shift ??
    employeeDetailsData?.shift ??
    employeeDetailsData?.shift_name ??
    employeeDetailsData?.work_info?.shift ??
    employeeDetailsData?.workInfo?.shift ??
    employee?.shift ??
    employee?.shift_name ??
    employee?.work_info?.shift ??
    applicantData?.shift ??
    data?.shift ??
    data?.shift_name ??
    data?.header?.shift ??
    payrollPayload?.header?.shift;

  const employeeShiftRaw =
    typeof employeeShiftSource === 'object' && employeeShiftSource !== null
      ? ((isArabic
          ? (employeeShiftSource?.name_ar ?? employeeShiftSource?.name_en)
          : (employeeShiftSource?.name_en ?? employeeShiftSource?.name_ar)) ??
        getDisplayValue(employeeShiftSource))
      : getDisplayValue(employeeShiftSource);

  const employeeTypeRaw =
    employee?.employment_type ??
    employeeDetailsData?.employment_type ??
    employee?.type ??
    employeeDetailsData?.type ??
    data?.type ??
    data?.employment_type ??
    '';

  const employmentTypeId = Number(
    employee?.employment_type_id ??
      employeeDetailsData?.employment_type_id ??
      data?.employment_type_id
  );

  const employeeTypeNormalized = normalizeWorkMode(employeeTypeRaw);
  const employeeShiftNormalized = normalizeWorkMode(employeeShiftRaw);
  const employeeShiftText = String(employeeShiftRaw || '')
    .trim()
    .toLowerCase();

  const partTimeTypeRaw =
    employee?.part_time_type ??
    employeeDetailsData?.part_time_type ??
    employee?.part_time_mode ??
    employeeDetailsData?.part_time_mode ??
    data?.part_time_type ??
    data?.part_time_mode ??
    '';

  const partTimeTypeNormalized = normalizeWorkMode(partTimeTypeRaw);

  const configuredMonthlyHours =
    Number(
      employee?.monthly_hours_required ??
        employeeDetailsData?.monthly_hours_required ??
        data?.monthly_hours_required ??
        data?.required_monthly_hours ??
        header?.required_monthly_hours ??
        0
    ) || 0;

  const workDays = parseScheduleArray(
    employee?.workDays ??
      employee?.work_days ??
      employeeDetailsData?.workDays ??
      employeeDetailsData?.work_days ??
      employeeDetailsData?.work_info?.work_days ??
      data?.workDays ??
      data?.work_days
  );

  const weeklyWorkDays = parseScheduleArray(
    employee?.weekly_work_days ??
      employeeDetailsData?.weekly_work_days ??
      employeeDetailsData?.work_info?.weekly_work_days ??
      data?.weekly_work_days
  );

  const getScheduleDayName = (item) =>
    typeof item === 'string' ? item : (item?.day ?? item?.day_name ?? item?.name ?? '');

  const weekdayOrder = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const formatDayName = (value) => {
    const normalized = normalizeDayName(value);
    if (!normalized) return '';

    return t(`days.${normalized}`, {
      defaultValue: humanizeWorkMode(normalized),
    });
  };

  const uniqueDayNames = (rows) =>
    Array.from(
      new Map(
        rows
          .map((item) => getScheduleDayName(item))
          .filter(Boolean)
          .map((day) => [normalizeDayName(day), day])
      ).values()
    );

  const partTimeScheduleRows = weeklyWorkDays.length > 0 ? weeklyWorkDays : workDays;

  const partTimeDayNames = uniqueDayNames(partTimeScheduleRows).sort((a, b) => {
    const aIndex = weekdayOrder.indexOf(normalizeDayName(a));
    const bIndex = weekdayOrder.indexOf(normalizeDayName(b));

    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  const partTimeDaysDisplay =
    partTimeDayNames.map(formatDayName).filter(Boolean).join(', ') || '--';

  const partTimeHoursDisplay =
    Array.from(
      new Set(
        partTimeScheduleRows
          .map((item) => {
            const dayName = normalizeDayName(getScheduleDayName(item));
            const matchingWorkDay = workDays.find(
              (workDay) => normalizeDayName(getScheduleDayName(workDay)) === dayName
            );

            const source =
              typeof item === 'object' && item !== null
                ? { ...matchingWorkDay, ...item }
                : matchingWorkDay;

            const from = formatScheduleTime(source?.start_time ?? source?.start ?? source?.from);
            const to = formatScheduleTime(source?.end_time ?? source?.end ?? source?.to);

            return from || to ? `${from || '--'} - ${to || '--'}` : '';
          })
          .filter(Boolean)
      )
    ).join(', ') || '--';

  const hasOwn = (object, key) =>
    Boolean(object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key));

  // Backend contract: if a payroll-sheet response contains the freelance_tasks
  // field (even when it is an empty array), treat the employee as Freelancer (Tasks).
  // This signal intentionally overrides a generic employee.type such as full_time.
  const hasFreelanceTasksField = [
    data?.tables,
    data,
    payrollPayload?.tables,
    payrollPayload,
  ].some(
    (source) => hasOwn(source, 'freelance_tasks') || hasOwn(source, 'freelancing_tasks')
  );

  const freelanceTasksSource =
    payrollPayload?.tables?.freelance_tasks ??
    payrollPayload?.tables?.freelancing_tasks ??
    payrollPayload?.freelance_tasks ??
    payrollPayload?.freelancing_tasks ??
    data?.tables?.freelance_tasks ??
    data?.tables?.freelancing_tasks ??
    data?.freelance_tasks ??
    data?.freelancing_tasks ??
    employeeDetailsData?.freelance_tasks ??
    employeeDetailsData?.freelancing_tasks ??
    employee?.freelance_tasks ??
    employee?.freelancing_tasks ??
    [];

  const freelanceTasks = Array.isArray(freelanceTasksSource)
    ? freelanceTasksSource
    : Array.isArray(freelanceTasksSource?.data)
      ? freelanceTasksSource.data
      : Array.isArray(freelanceTasksSource?.rows)
        ? freelanceTasksSource.rows
        : Array.isArray(freelanceTasksSource?.tasks)
          ? freelanceTasksSource.tasks
          : [];

  const reportedFreelanceTasksCount =
    payrollPayload?.header?.tasks_count ??
    payrollPayload?.tasks_count ??
    payrollPayload?.freelance_tasks_count ??
    header?.tasks_count ??
    data?.tasks_count ??
    data?.freelance_tasks_count ??
    0;

  // When actual task rows are present, their length is the most reliable count.
  // Otherwise keep the backend-reported count (including zero).
  const freelanceTasksCount =
    freelanceTasks.length > 0 ? freelanceTasks.length : Number(reportedFreelanceTasksCount) || 0;

  const hasFreelanceTaskData = Boolean(
    freelanceTasks.length > 0 || Number(freelanceTasksCount) > 0
  );

  const isFreelanceTasksType =
    (employmentTypeId === 3 && partTimeTypeNormalized !== 'hours') ||
    [
      'freelance_task',
      'freelance_tasks',
      'freelancer_task',
      'freelancer_tasks',
      'task_based',
      'tasks',
    ].includes(employeeTypeNormalized) ||
    (employeeTypeNormalized === 'freelancer' && partTimeTypeNormalized !== 'hours') ||
    employeeShiftNormalized.includes('freelance_task') ||
    employeeShiftNormalized.includes('freelancer_task') ||
    employeeShiftNormalized.includes('task_based') ||
    employeeShiftText.includes('freelancer (t)') ||
    employeeShiftText.includes('freelancer (tasks)') ||
    (employeeShiftText.includes('freelancer') && employeeShiftText.includes('task')) ||
    employeeShiftText.includes('مهام');

  // Employment type IDs are authoritative and must be evaluated first so they
  // can guard all subsequent freelance-mode checks.
  // id 1 = Full Time, id 2 = Part Time, id 3 = Freelancer
  const isFullTimeEmployee =
    employmentTypeId === 1 ||
    ['full_time', 'fulltime'].includes(employeeTypeNormalized);

  const isPartTimeEmployee =
    employmentTypeId === 2 ||
    ['part_time', 'parttime', 'part_time_days', 'part_time_hours'].includes(
      employeeTypeNormalized
    ) ||
    employeeShiftNormalized.includes('part_time') ||
    employeeShiftNormalized.includes('parttime') ||
    employeeShiftText.includes('part time') ||
    employeeShiftText.includes('دوام جزئي');

  // Freelancer (Hours): only applies when the employee is actually a freelancer.
  // Part-time and full-time employees whose shift happens to be named
  // "Freelance Hours" must not be reclassified.
  const isFreelanceHours =
    !isFullTimeEmployee &&
    !isPartTimeEmployee &&
    (((employmentTypeId === 3 || employeeTypeNormalized === 'freelancer') &&
      (partTimeTypeNormalized === 'hours' || configuredMonthlyHours > 0)) ||
    ['hourly', 'freelance_hours', 'freelancer_hours'].includes(employeeTypeNormalized) ||
    employeeShiftNormalized.includes('freelance_hours') ||
    employeeShiftNormalized.includes('freelancer_hours') ||
    employeeShiftText.includes('freelancer (h)') ||
    employeeShiftText.includes('freelancer (hours)') ||
    (employeeShiftText.includes('freelancer') && employeeShiftText.includes('hour')) ||
    (employeeShiftText.includes('ساعات') &&
      (employeeShiftText.includes('مستقل') || employeeShiftText.includes('حر'))));

  const isFreelanceTasksMode =
    !isFreelanceHours &&
    !isFullTimeEmployee &&
    !isPartTimeEmployee &&
    (hasFreelanceTasksField ||
      isFreelanceTasksType ||
      (hasFreelanceTaskData &&
        partTimeTypeNormalized !== 'hours' &&
        !employeeShiftNormalized.includes('freelance_hours') &&
        !employeeShiftNormalized.includes('freelancer_hours')));

  const isPartTimeShift =
    !isFreelanceTasksMode &&
    !isFreelanceHours &&
    isPartTimeEmployee;

  const isFullTimeShift =
    !isFreelanceTasksMode &&
    !isFreelanceHours &&
    !isPartTimeShift &&
    (isFullTimeEmployee ||
      employeeShiftNormalized.includes('full_time') ||
      employeeShiftNormalized.includes('fulltime') ||
      employeeShiftText.includes('full time') ||
      employeeShiftText.includes('دوام كامل') ||
      (!employeeShiftRaw && !employeeTypeNormalized));

  const employeeShiftDisplay = isFreelanceTasksMode
    ? t('salaries.salaryCalculationModal.freelanceTasks', {
        defaultValue: 'Freelancer (Tasks)',
      })
    : isFreelanceHours
      ? t('salaries.salaryCalculationModal.freelanceHours', {
          defaultValue: 'Freelancer (Hours)',
        })
      : isPartTimeShift
        ? t('salaries.salaryCalculationModal.partTime', {
            defaultValue: 'Part Time',
          })
        : isFullTimeShift
          ? t('salaries.salaryCalculationModal.fullTime', {
              defaultValue: 'Full Time',
            })
          : employeeShiftRaw || humanizeWorkMode(employeeTypeNormalized);

  const absence_attendance = data?.absence_attendance || {
    Holidays: {
      used_days_in_month: 0,
      remaining_days_end_of_month: 0,
    },
  };

  const attendance_details = data?.attendance_details || {
    absent_days_without_request_or_rejected: 0,
  };

  const requiredFreelanceHours =
    attendance_details?.required_monthly_hours ??
    employee?.monthly_hours_required ??
    employeeDetailsData?.monthly_hours_required ??
    data?.required_monthly_hours ??
    data?.monthly_hours_required ??
    header?.required_monthly_hours ??
    0;

  const showFreelanceHours = isFreelanceHours;

  const showFreelanceTasks = !showFreelanceHours && isFreelanceTasksMode;

  const partTimeHoursValue =
    partTimeHoursDisplay && partTimeHoursDisplay !== '--'
      ? partTimeHoursDisplay
      : formatValueWithUnitSuffix(t, configuredMonthlyHours || requiredFreelanceHours || 0, 'hour');

  const shiftDetailItems = isFreelanceTasksMode
    ? [
        {
          label: t('salaries.salaryCalculationModal.tasks', {
            defaultValue: 'Tasks',
          }),
          value: freelanceTasksCount,
        },
      ]
    : isFullTimeShift
      ? []
      : isFreelanceHours
        ? [
            {
              label: t('salaries.salaryCalculationModal.items.requiredHours', {
                defaultValue: 'Required Hours',
              }),
              value: formatValueWithUnitSuffix(t, requiredFreelanceHours, 'hour'),
            },
          ]
        : isPartTimeShift
          ? [
              {
                label: t('salaries.salaryCalculationModal.days', {
                  defaultValue: 'Days',
                }),
                value: partTimeDaysDisplay,
              },
              {
                label: t('salaries.salaryCalculationModal.hours', {
                  defaultValue: 'Hours',
                }),
                value: partTimeHoursValue,
              },
            ]
          : [];

  const basic_salary =
    parseMoneyValue(data?.basic_salary) ||
    parseMoneyValue(header?.basic_salary) ||
    parseMoneyValue(employeeDetailsData?.base_salary) ||
    0;

  const kpi =
    data?.kpi && typeof data.kpi === 'object'
      ? data.kpi
      : {
          payout: data?.kpi_payout ?? 0,
          target: data?.kpi_target ?? 0,
          percentage: data?.kpi ?? data?.kpi_percentage ?? 0,
        };

  const kpiTarget = parseMoneyValue(kpi?.target);

  // KPI amount comes directly from data.kpi.payout.
  const kpiPayout = parseMoneyValue(kpi?.payout ?? data?.kpi_payout ?? header?.kpi_payout ?? 0);

  // KPI percentage comes directly from data.kpi.achieved_percent_human.
  const kpiPercentage = parseMoneyValue(
    kpi?.achieved_percent ??
      data?.kpi_achieved_percent ??
      data?.kpi_percentage ??
      data?.kpi_percent ??
      data?.kpiPercentage ??
      0
  );

  const kpiPercentageHuman =
    kpi?.achieved_percent_human ??
    data?.kpi_achieved_percent_human ??
    header?.kpi_achieved_percent_human ??
    `${kpiPercentage}%`;

  const manualBonusRaw =
    header?.manual_bonus ?? data?.manual_bonus ?? payrollPayload?.header?.manual_bonus ?? 0;

  const manualDeductionRaw =
    header?.manual_deduction ??
    data?.manual_deduction ??
    payrollPayload?.header?.manual_deduction ??
    0;

  const additions_breakdown = {
    overtime_payout: parseMoneyValue(data?.additions_breakdown?.overtime_payout),
    rewards_total: parseMoneyValue(data?.additions_breakdown?.rewards_total),
    commission_total: parseMoneyValue(data?.additions_breakdown?.commission_total),
    allowances_total: parseMoneyValue(data?.additions_breakdown?.allowances_total),
    freelance_tasks_total: parseMoneyValue(data?.additions_breakdown?.freelance_tasks_total),
    tasks_count: freelanceTasksCount,
    leave_cashouts_total: parseMoneyValue(data?.additions_breakdown?.leave_cashouts_total),
  };

  const deductions_breakdown = {
    penalties_total: parseMoneyValue(data?.deductions_breakdown?.penalties_total),
    loan_installments: parseMoneyValue(data?.deductions_breakdown?.loan_installments),
    insurance: parseMoneyValue(data?.deductions_breakdown?.insurance),
    absence_deduction: parseMoneyValue(data?.deductions_breakdown?.absence_deduction),
    late_deduction: parseMoneyValue(data?.deductions_breakdown?.late_deduction),
  };

  const sick_deduction = parseMoneyValue(data?.sick_deduction);

  const workedFreelanceHours =
    attendance_details?.worked_hours ??
    data?.worked_hours ??
    payrollPayload?.attendance_details?.worked_hours ??
    0;

  const leaveBalanceStartDate =
    data?.attendance_details?.leave_balance_start_date ??
    payrollPayload?.attendance_details?.leave_balance_start_date ??
    data?.leave_balance_start_date ??
    payrollPayload?.leave_balance_start_date ??
    '--';

  const totalLateDeduction =
    parseMoneyValue(
      deductions_breakdown?.late_deduction ??
        deductionsData?.late_deduction ??
        deductionsData?.data?.late_deduction
    ) || 0;

  const allowancesTotal =
    data?.tables?.allowances?.reduce((sum, allowance) => {
      return sum + parseMoneyValue(allowance?.amount);
    }, 0) || 0;

  const calculatedTotalDeductions = parseMoneyValue(header?.total_deductions) || 0;

  const netSalary = parseMoneyValue(header?.net_salary) || 0;

  const formatApiDisplayValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '--';
    }

    // Preserve the exact API text, including a currency/unit only when the
    // backend actually returned it (for example: "5000 aed").
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      });
    }

    return String(value);
  };

  const netSalaryDisplay = header?.internal_net_salary ?? header?.net_salary ?? netSalary;

  const whatsappNumber =
    applicantData?.whatsapp_number ||
    employeeDetailsData?.whatsapp_number ||
    employeeDetailsData?.phone ||
    employeeDetailsData?.mobile ||
    employee?.whatsapp_number ||
    employee?.phone ||
    employee?.mobile ||
    '';

  const emailAddress = applicantData?.email || employeeDetailsData?.email || employee?.email || '';

  const handleSendWhatsApp = () => {
    if (!whatsappNumber) {
      toast.error(t('salaries.salaryCalculationModal.messages.whatsappNumberNotAvailable'));

      return;
    }

    let cleanedNumber = String(whatsappNumber).replace(/[^\d]/g, '');

    if (cleanedNumber.startsWith('0')) {
      cleanedNumber = `2${cleanedNumber}`;
    }

    const url = `https://wa.me/${cleanedNumber}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      toast.error(t('salaries.salaryCalculationModal.messages.emailAddressNotAvailable'));

      return;
    }

    window.location.href = `mailto:${emailAddress}`;
  };

  const captureSalaryImageDataUrl = async () => {
    if (!data || !exportContentRef.current) {
      throw new Error('Salary export content is not available');
    }

    const images = Array.from(exportContentRef.current.querySelectorAll('img'));

    // Wait for images that are still loading. Note that img.complete can also
    // be true for a FAILED image, so naturalWidth/naturalHeight are checked
    // below before the actual capture.
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      })
    );

    // A broken <img src="..."> can make DOM-to-image/html-to-image reject
    // with the native image Error Event (exactly the Event shown in console).
    // Temporarily remove failed images from the capture. The avatar's initial
    // underneath remains visible as the fallback.
    const temporarilyExcludedImages = [];

    images.forEach((img) => {
      const imageFailed =
        img.dataset.captureFailed === 'true' ||
        !img.complete ||
        img.naturalWidth === 0 ||
        img.naturalHeight === 0;

      if (!imageFailed) return;

      temporarilyExcludedImages.push({
        img,
        src: img.getAttribute('src'),
        display: img.style.display,
        excludeAttr: img.getAttribute('data-exclude-from-image'),
      });

      img.setAttribute('data-exclude-from-image', 'true');
      img.style.display = 'none';
      img.removeAttribute('src');
    });

    try {
      // Give the browser one frame to apply the temporary image changes
      // before cloning/capturing the DOM.
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const dialogEl = exportContentRef.current.closest('[role="dialog"]');
      const captureWidth = Math.max(
        800,
        exportContentRef.current.clientWidth || (dialogEl ? dialogEl.clientWidth - 48 : 752)
      );

      return await captureElementAsPng(exportContentRef.current, {
        captureWidth,
      });
    } finally {
      temporarilyExcludedImages.forEach(({ img, src, display, excludeAttr }) => {
        if (src !== null) {
          img.setAttribute('src', src);
        }

        img.style.display = display;

        if (excludeAttr === null) {
          img.removeAttribute('data-exclude-from-image');
        } else {
          img.setAttribute('data-exclude-from-image', excludeAttr);
        }
      });
    }
  };

  const handleExportAsImage = async () => {
    try {
      const dataUrl = await captureSalaryImageDataUrl();

      const link = document.createElement('a');
      const fileName = `salary-calculation-${employeeName
        .replace(/\s+/g, '-')
        .toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;

      link.download = fileName;
      link.href = dataUrl;
      link.click();

      toast.success(t('salaries.salaryCalculationModal.messages.imageExportSuccess'));
    } catch (error) {
      console.error('Image export failed:', error);
      toast.error(t('salaries.salaryCalculationModal.messages.imageExportFailed'));
    }
  };

  const handleCopyImage = () => {
    try {
      if (!window.isSecureContext) {
        throw new Error('Copy image requires a secure context (HTTPS or localhost).');
      }

      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        throw new Error('Clipboard image copy is not supported in this browser');
      }

      // Important: call clipboard.write while we are still inside the original
      // user click. The ClipboardItem receives a Promise<Blob>, so the image can
      // finish rendering asynchronously without losing transient user activation.
      const pngBlobPromise = captureSalaryImageDataUrl().then(async (dataUrl) => {
        const response = await fetch(dataUrl);

        if (!response.ok) {
          throw new Error('Could not convert the captured image to a PNG blob');
        }

        const blob = await response.blob();

        if (blob.type === 'image/png') {
          return blob;
        }

        const buffer = await blob.arrayBuffer();
        return new Blob([buffer], { type: 'image/png' });
      });

      const clipboardItem = new ClipboardItem({
        'image/png': pngBlobPromise,
      });

      navigator.clipboard
        .write([clipboardItem])
        .then(() => {
          toast.success(
            t('salaries.salaryCalculationModal.messages.imageCopySuccess', {
              defaultValue: 'Image copied. You can paste it now.',
            })
          );
        })
        .catch((error) => {
          console.error('Copy image failed:', error);
          toast.error(
            t('salaries.salaryCalculationModal.messages.imageCopyFailed', {
              defaultValue:
                'Could not copy image. Make sure the page is opened over HTTPS or localhost and clipboard permission is allowed.',
            })
          );
        });
    } catch (error) {
      console.error('Copy image failed:', error);
      toast.error(
        error?.message ||
          t('salaries.salaryCalculationModal.messages.imageCopyFailed', {
            defaultValue: 'Could not copy image.',
          })
      );
    }
  };

  const effectiveRates = data?.rates ?? payrollPayload?.rates ?? {};
  const dailyRate = parseMoneyValue(effectiveRates?.daily_rate);
  const hourlyRate = parseMoneyValue(effectiveRates?.hourly_rate);

  const formatRate = (value) => parseMoneyValue(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const topItems = [
    {
      label: t('salaries.salaryCalculationModal.items.basicSalary'),
      value:
        data?.basic_salary ??
        header?.basic_salary ??
        employeeDetailsData?.base_salary ??
        basic_salary,
      color: 'text-slate-900',
      sectionKey: 'overview',
    },
    {
      label: t('salaries.salaryCalculationModal.items.basicKpi'),
      value: kpi?.target ?? data?.kpi_target ?? kpiTarget,
      color: 'text-slate-900',
      sectionKey: 'kpi',
    },
    {
      label: t('salaries.salaryCalculationModal.items.dailyRate'),
      value: formatRate(effectiveRates?.daily_rate ?? dailyRate),
      isText: true,
      color: 'text-slate-900',
      sectionKey: 'overview',
    },
    {
      label: t('salaries.salaryCalculationModal.items.hourlyRate'),
      value: formatRate(effectiveRates?.hourly_rate ?? hourlyRate),
      isText: true,
      color: 'text-slate-900',
      sectionKey: 'overview',
    },
  ];

  const additionItems = [
    {
      label: t('salaries.salaryCalculationModal.items.kpi', { defaultValue: 'KPI' }),
      value: `${kpiPercentageHuman} (${formatApiDisplayValue(kpi?.payout ?? data?.kpi_payout ?? header?.kpi_payout ?? kpiPayout)})`,
      color: 'text-emerald-600',
      isText: true,
      sectionKey: 'kpi',
    },
    {
      label: t('salaries.salaryCalculationModal.items.manualBonus', {
        defaultValue: 'Manual Bonus',
      }),
      value: manualBonusRaw,
      color: 'text-emerald-600',
      sectionKey: 'overview',
    },
    {
      label: t('salaries.salaryCalculationModal.items.overtime'),
      value: data?.additions_breakdown?.overtime_payout ?? additions_breakdown?.overtime_payout,
      color: 'text-emerald-600',
      sectionKey: 'overtime',
    },
    {
      label: t('salaries.salaryCalculationModal.items.rewards'),
      value: data?.additions_breakdown?.rewards_total ?? additions_breakdown?.rewards_total,
      color: 'text-emerald-600',
      sectionKey: 'rewards',
    },
    {
      label: t('salaries.salaryCalculationModal.items.commission'),
      value: data?.additions_breakdown?.commission_total ?? additions_breakdown?.commission_total,
      color: 'text-emerald-600',
      sectionKey: 'commission',
    },
    ...(showFreelanceHours
      ? [
          {
            label: t('salaries.salaryCalculationModal.items.requiredHours', {
              defaultValue: 'Required Hours',
            }),
            value: requiredFreelanceHours,
            color: 'text-slate-900',
            unit: 'hour',
          },
          {
            label: t('salaries.salaryCalculationModal.items.workedHours', {
              defaultValue: 'Worked Hours',
            }),
            value: workedFreelanceHours,
            color: 'text-emerald-600',
            unit: 'hour',
          },
        ]
      : []),
    ...(showFreelanceTasks
      ? [
          {
            label: t('salaries.salaryCalculationModal.items.freelanceTasks', {
              defaultValue: 'Freelance Tasks',
            }),
            value:
              data?.additions_breakdown?.freelance_tasks_total ??
              additions_breakdown?.freelance_tasks_total,
            color: 'text-emerald-600',
            count: freelanceTasksCount,
            countLabel:
              freelanceTasksCount === 1
                ? t('salaries.salaryCalculationModal.task', {
                    defaultValue: 'task',
                  })
                : t('salaries.salaryCalculationModal.tasks', {
                    defaultValue: 'tasks',
                  }),
            sectionKey: 'freelanceTasks',
            children: freelanceTasks.map((task, taskIndex) => ({
              id: task?.id ?? taskIndex,
              label:
                task?.task_name ??
                task?.name ??
                t('salaries.salaryCalculationModal.taskNumber', {
                  defaultValue: `Task ${taskIndex + 1}`,
                }),
              value: task?.cost ?? task?.amount ?? 0,
              color: 'text-emerald-600',
              sectionKey: 'freelanceTasks',
            })),
          },
        ]
      : []),
    {
      label: t('salaries.salaryCalculationModal.items.allowances'),
      value:
        data?.additions_breakdown?.allowances_total ??
        additions_breakdown?.allowances_total ??
        allowancesTotal,
      color: 'text-emerald-600',
      sectionKey: 'allowances',
    },
    {
      label: isArabic ? 'الإجازات السنوية' : 'Annual Leaves',
      value: absence_attendance?.Holidays?.used_days_in_month || 0,
      color: 'text-slate-900',
      unit: 'day',
      sectionKey: 'approvedLeaves',
    },
    {
      label: t('salaries.salaryCalculationModal.items.daysOffRemaining', {
        defaultValue: 'Days Off Remaining',
      }),
      value:
        absence_attendance?.Holidays?.remaining_days_end_of_month ??
        absence_attendance?.holidays?.remaining_days_end_of_month ??
        absence_attendance?.days_off_remaining ??
        data?.days_off_remaining ??
        0,
      color: 'text-slate-900',
      unit: 'day',
      sectionKey: 'approvedLeaves',
    },
    {
      label: t('salaries.salaryCalculationModal.items.leaveBalanceStartDate', {
        defaultValue: 'Leave Balance Start Date',
      }),
      value: leaveBalanceStartDate,
      color: 'text-slate-900',
      isText: true,
      sectionKey: 'overview',
    },
    {
      label: t('salaries.salaryCalculationModal.items.annualIncreaseDate', {
        defaultValue: 'Annual Increase Date',
      }),
      value: annualIncreaseDate,
      color: 'text-slate-900',
      isText: true,
      sectionKey: 'overview',
    },
  ];

  const deductionItems = [
    {
      label: t('salaries.salaryCalculationModal.items.manualDeduction', {
        defaultValue: 'Manual Deduction',
      }),
      value: manualDeductionRaw,
      color: 'text-red-500',
      sectionKey: 'deductions',
    },
    {
      label: t('salaries.salaryCalculationModal.items.penalties'),
      value: data?.deductions_breakdown?.penalties_total ?? deductions_breakdown?.penalties_total,
      color: 'text-red-500',
      sectionKey: 'deductions',
    },
    {
      label: t('salaries.salaryCalculationModal.items.loanInstallments'),
      value:
        data?.deductions_breakdown?.loan_installments ?? deductions_breakdown?.loan_installments,
      color: 'text-red-500',
      sectionKey: 'deductions',
    },
    {
      label: t('salaries.salaryCalculationModal.items.insurance'),
      value: data?.deductions_breakdown?.insurance ?? deductions_breakdown?.insurance,
      color: 'text-red-500',
      sectionKey: 'deductions',
    },
    {
      label: t('salaries.salaryCalculationModal.items.sickDeduction'),
      value: data?.sick_deduction ?? sick_deduction,
      color: 'text-red-500',
      sectionKey: 'absence',
    },
    {
      label: t('salaries.salaryCalculationModal.items.absenceDeduction'),
      value:
        data?.deductions_breakdown?.absence_deduction ?? deductions_breakdown?.absence_deduction,
      color: 'text-red-500',
      sectionKey: 'absence',
    },
    {
      label: t('salaries.salaryCalculationModal.items.absentDaysWithoutRequest'),
      value: attendance_details?.absent_days_without_request_or_rejected || 0,
      color: 'text-red-600',
      unit: 'day',
      sectionKey: 'absence',
    },
    {
      label: t('salaries.salaryCalculationModal.items.lateDeduction'),
      value:
        data?.deductions_breakdown?.late_deduction ??
        deductionsData?.late_deduction ??
        deductionsData?.data?.late_deduction ??
        totalLateDeduction,
      color: 'text-red-500',
      sectionKey: 'deductions',
    },
    {
      label: t('salaries.salaryCalculationModal.items.totalDeductions'),
      value: header?.total_deductions ?? calculatedTotalDeductions,
      color: 'text-red-600',
      sectionKey: 'deductions',
    },
  ];

  const neutralItems = additionItems.filter((item) => !/text-(emerald|green|red)-/.test(item.color || ''));
  const positiveItems = additionItems.filter((item) => /text-(emerald|green)-/.test(item.color || ''));
  const items = [...topItems, ...additionItems, ...deductionItems];

  const handleExport = (format) => {
    const employeeExportData = [
      {
        label: t('salaries.exportColumns.name', { defaultValue: 'Employee' }),
        value: employeeName,
      },
      {
        label: t('salaries.exportColumns.position', { defaultValue: 'Position' }),
        value: employeePosition || '--',
      },
      {
        label: t('salaries.exportColumns.department', {
          defaultValue: 'Department',
        }),
        value: employeeDepartment || '--',
      },
      {
        label: t('salaries.salaryCalculationModal.shift', {
          defaultValue: 'Shift',
        }),
        value: employeeShiftDisplay || '--',
      },
      ...shiftDetailItems.map((detail) => ({
        label: detail.label,
        value: String(detail.value ?? '--'),
      })),
    ];

    const formatExportItemValue = (item) =>
      item.isText
        ? formatTextValue(item.value)
        : item.unit
          ? formatValueWithUnitSuffix(t, item.value, item.unit)
          : formatApiDisplayValue(item.value);

    const salaryExportData = items.flatMap((item) => [
      {
        label: item.label,
        value: formatExportItemValue(item),
      },
      ...(item.children || []).map((child) => ({
        label: `  ↳ ${child.label}`,
        value: formatExportItemValue(child),
      })),
    ]);

    const exportData = [...employeeExportData, ...salaryExportData];

    const fileName = `salary-calculation-${employeeName
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}`;

    const title = `Salary Calculation - ${employeeName}`;

    if (format === 'excel') {
      exportToExcel({
        rows: exportData,
        columns: SALARY_CALCULATION_EXPORT_COLUMNS,
        fileName,
      });
    } else if (format === 'pdf') {
      exportToPdf({
        rows: exportData,
        columns: SALARY_CALCULATION_EXPORT_COLUMNS,
        fileName,
        title,
      });
    } else if (format === 'print') {
      printTable({
        rows: exportData,
        columns: SALARY_CALCULATION_EXPORT_COLUMNS,
        title,
      });
    }
  };

  const salarySectionTargets = {
    overview: {
      ids: ['salary-overview', 'overview-section', 'overview'],
      labels: ['Overview', 'Salary Overview', 'نظرة عامة', 'نظرة عامة على الراتب'],
    },
    kpi: {
      ids: ['salary-kpi', 'kpi-items', 'kpi-section'],
      labels: ['KPI Items', 'KPI', 'مؤشرات الأداء', 'مؤشرات الاداء'],
    },
    rewards: {
      ids: ['salary-rewards', 'rewards-section'],
      labels: ['Rewards', 'المكافآت', 'المكافات'],
    },
    deductions: {
      ids: ['salary-deductions', 'deductions-section'],
      labels: ['Deductions', 'الخصومات', 'الاستقطاعات'],
    },
    absence: {
      ids: ['salary-absence', 'absence-section'],
      labels: ['Absence', 'الغياب'],
    },
    commission: {
      ids: ['salary-commission', 'commission-section'],
      labels: ['Commission', 'Commissions', 'العمولة', 'العمولات'],
    },
    overtime: {
      ids: ['salary-overtime', 'overtime-requests', 'overtime-section'],
      labels: ['Overtime Requests', 'Overtime', 'طلبات الوقت الإضافي', 'الوقت الإضافي'],
    },
    approvedLeaves: {
      ids: ['salary-approved-leaves', 'approved-leaves', 'approved-leaves-section'],
      labels: ['Approved Leaves', 'Leaves', 'الإجازات المعتمدة', 'الإجازات'],
    },
    allowances: {
      ids: ['salary-allowance', 'salary-allowances', 'allowance-section'],
      labels: ['Allowance', 'Allowances', 'البدلات', 'بدلات'],
    },
    freelanceTasks: {
      ids: [
        'salary-freelance-tasks',
        'salary-freelancing-tasks',
        'freelance-tasks',
        'freelancing-tasks',
      ],
      labels: [
        'Freelancing Tasks',
        'Freelance Tasks',
        'Freelancer Tasks',
        'مهام العمل الحر',
        'مهام الفريلانسر',
      ],
    },
  };

  const normalizeSectionText = (value) =>
    String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const elementHasTableLikeContent = (element) => {
    if (!element) return false;

    return Boolean(
      element.matches?.('table, [role="table"]') ||
        element.querySelector?.(
          'table, [role="table"], thead, tbody, [role="rowgroup"], [role="row"]'
        )
    );
  };

  const getSectionContainer = (element) => {
    if (!element) return null;

    // Walk upward and prefer the nearest ancestor that actually contains the
    // table/list belonging to the section. This is more reliable than using
    // generic rounded classes because titles/icons often have rounded wrappers.
    let current = element;
    let fallback = null;
    let depth = 0;

    while (current && current !== document.body && depth < 10) {
      const isExplicitSection =
        current.hasAttribute?.('data-salary-section') ||
        current.matches?.('section, article, [data-slot="card"]');

      const isCardLike =
        isExplicitSection ||
        current.classList?.contains('rounded-xl') ||
        current.classList?.contains('rounded-lg') ||
        current.className?.toString?.().includes('shadow') ||
        current.className?.toString?.().includes('border');

      if (!fallback && isCardLike) {
        fallback = current;
      }

      if (isExplicitSection && elementHasTableLikeContent(current)) {
        return current;
      }

      if (elementHasTableLikeContent(current) && depth >= 1) {
        return current;
      }

      current = current.parentElement;
      depth += 1;
    }

    return fallback || element;
  };

  const findSalarySection = (sectionKey) => {
    const target = salarySectionTargets[sectionKey];
    if (!target) return null;

    // 1) Exact data attribute - preferred and deterministic when present.
    const byDataAttribute = document.querySelector(`[data-salary-section="${sectionKey}"]`);
    if (byDataAttribute) return getSectionContainer(byDataAttribute);

    // 2) Exact IDs.
    for (const id of target.ids) {
      const byId = document.getElementById(id);
      if (byId) return getSectionContainer(byId);
    }

    // 3) Robust title lookup. Search common text elements, not only elements
    // with font utility classes. This fixes sections such as "Overtime Requests"
    // when the title is rendered inside a plain div/span/p.
    const labels = target.labels.map(normalizeSectionText).filter(Boolean);
    const textElements = Array.from(
      document.querySelectorAll(
        'main h1, main h2, main h3, main h4, main h5, main h6, main p, main span, main div, h1, h2, h3, h4, h5, h6, p, span'
      )
    );

    const candidates = textElements
      .filter((element) => {
        if (!element || element.closest('[role="dialog"]')) return false;

        const text = normalizeSectionText(element.textContent);
        if (!text) return false;

        // Exact title is strongest. startsWith supports titles with a count/badge.
        return labels.some((label) => text === label || text.startsWith(`${label} `));
      })
      .map((element) => {
        const container = getSectionContainer(element);
        const elementText = normalizeSectionText(element.textContent);
        let score = 0;

        if (labels.includes(elementText)) score += 100;
        if (/^H[1-6]$/.test(element.tagName)) score += 30;
        if (elementHasTableLikeContent(container)) score += 60;
        if (container?.hasAttribute?.('data-salary-section')) score += 100;

        // Prefer a real section/card rather than a small nested wrapper.
        if (container?.matches?.('section, article, [data-slot="card"]')) {
          score += 20;
        }

        return { container, score };
      })
      .filter(({ container }) => Boolean(container))
      .sort((a, b) => b.score - a.score);

    return candidates[0]?.container || null;
  };

  const focusSalarySection = (section) => {
    if (!section) return;

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    const previousTransition = section.style.transition;
    const previousBoxShadow = section.style.boxShadow;

    section.style.transition = 'box-shadow 180ms ease';
    section.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.35)';

    window.setTimeout(() => {
      section.style.boxShadow = previousBoxShadow;

      window.setTimeout(() => {
        section.style.transition = previousTransition;
      }, 200);
    }, 1300);
  };

  const handleGoToSection = (sectionKey) => {
    if (!sectionKey) return;

    onOpenChange(false);

    // Radix Dialog can keep body scroll locked during its close animation.
    // Retry for a short period so scrolling happens only after the dialog has
    // released the page. This also covers sections rendered a little later.
    let attempt = 0;
    const maxAttempts = 10;

    const tryScroll = () => {
      attempt += 1;

      const dialogStillOpen = Boolean(document.querySelector('[role="dialog"][data-state="open"]'));
      const section = findSalarySection(sectionKey);

      if (section && !dialogStillOpen) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => focusSalarySection(section));
        });
        return;
      }

      if (attempt < maxAttempts) {
        window.setTimeout(tryScroll, 120);
        return;
      }

      if (section) {
        focusSalarySection(section);
        return;
      }

      toast.error(
        t('salaries.salaryCalculationModal.messages.sectionNotFound', {
          defaultValue: 'Could not find this section on the salary page.',
        })
      );
    };

    window.setTimeout(tryScroll, 120);
  };

  const renderEmployeeTypeSection = () => {
    const canNavigate = (sectionKey) => Boolean(sectionKey && findSalarySection(sectionKey));

    const sectionWrapper = (sectionKey, children) => {
      const navigable = canNavigate(sectionKey);
      const handleClick = navigable ? () => handleGoToSection(sectionKey) : undefined;
      const handleKeyDown = navigable
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleGoToSection(sectionKey);
            }
          }
        : undefined;

      return (
        <div
       
        
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          
        >
          {children}
        </div>
      );
    };

    // ── Freelancer (Tasks) ──────────────────────────────────────────────────
    if (isFreelanceTasksMode) {
      const tasksLabel = t('salaries.salaryCalculationModal.freelanceTasks', {
        defaultValue: 'Freelancer (Tasks)',
      });
      const countLabel =
        freelanceTasksCount === 1
          ? t('salaries.salaryCalculationModal.task', { defaultValue: 'task' })
          : t('salaries.salaryCalculationModal.tasks', { defaultValue: 'tasks' });

      return sectionWrapper('freelanceTasks', (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">{tasksLabel}</span>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-primary">
              {freelanceTasksCount} {countLabel}
            </span>
          </div>

          {freelanceTasks.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {freelanceTasks.map((task, idx) => {
                const taskName =
                  (isArabic ? task?.task_name_ar : task?.task_name_en) ??
                  task?.task_name ??
                  task?.name ??
                  t('salaries.salaryCalculationModal.taskNumber', {
                    defaultValue: `Task ${idx + 1}`,
                  });
                const taskCost = task?.cost ?? task?.amount ?? 0;

                return (
                  <div
                    key={task?.id ?? idx}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="font-medium text-slate-600">↳ {taskName}</span>
                    <span className="font-bold text-emerald-600">
                      {formatApiDisplayValue(taskCost)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            freelanceTasksCount > 0 && (
              <p className="text-xs text-slate-400">
                {t('salaries.salaryCalculationModal.taskCountOnly', {
                  defaultValue: `${freelanceTasksCount} ${countLabel}`,
                  count: freelanceTasksCount,
                })}
              </p>
            )
          )}
        </>
      ));
    }

    // ── Part Time ───────────────────────────────────────────────────────────
    if (isPartTimeShift) {
      const daysLabel = t('salaries.salaryCalculationModal.days', { defaultValue: 'Days' });

      return sectionWrapper('overview', (
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">{daysLabel}</span>
          <span className="text-sm font-semibold text-slate-900">{partTimeDaysDisplay}</span>
        </div>
      ));
    }

    // ── Freelancer (Hours) ──────────────────────────────────────────────────
    if (isFreelanceHours) {
      const requiredLabel = t('salaries.salaryCalculationModal.items.requiredHours', {
        defaultValue: 'Required Hours',
      });
      const workedLabel = t('salaries.salaryCalculationModal.items.workedHours', {
        defaultValue: 'Worked Hours',
      });

      return sectionWrapper('overview', (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-700">{requiredLabel}</span>
            <span className="font-semibold text-slate-900">
              {formatValueWithUnitSuffix(t, requiredFreelanceHours, 'hour')}
            </span>
          </div>
          {workedFreelanceHours > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500">{workedLabel}</span>
              <span className="font-semibold text-emerald-600">
                {formatValueWithUnitSuffix(t, workedFreelanceHours, 'hour')}
              </span>
            </div>
          )}
        </div>
      ));
    }

    return null;
  };

  const renderSalaryValue = (item) => {
    if (item.isText) {
      return formatTextValue(item.value);
    }

    if (item.unit) {
      return formatValueWithUnitSuffix(t, item.value, item.unit);
    }

    return formatApiDisplayValue(item.value);
  };

  const renderSalaryItem = (item, idx) => {
    const clickable = Boolean(item.sectionKey && findSalarySection(item.sectionKey));
    const children = item.children || [];

    const handleItemKeyDown = (event) => {
      if (!clickable) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleGoToSection(item.sectionKey);
      }
    };

    return (
      <div key={`${item.label}-${idx}`}>
        <div
          onClick={clickable ? () => handleGoToSection(item.sectionKey) : undefined}
          onKeyDown={clickable ? handleItemKeyDown : undefined}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          title={clickable ? `Go to ${item.label}` : undefined}
          className={`flex min-h-[37px] items-center justify-between border-b border-slate-200 py-1 ${
            clickable
              ? 'focus-visible:ring-primary/40 cursor-pointer rounded-md px-2 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:outline-none'
              : ''
          }`}
        >
          <span
            className={`text-[16px] font-semibold ${
              clickable ? 'text-primary underline' : 'text-slate-500'
            }`}
          >
            {item.label}
          </span>

          <div className="flex flex-col items-end">
            <span className={`text-[16px] font-bold ${item.color}`}>{renderSalaryValue(item)}</span>

            {item.count !== undefined && item.count !== null ? (
              <span className="mt-0.5 text-xs font-semibold text-slate-400">
                {item.count} {item.countLabel || ''}
              </span>
            ) : null}
          </div>
        </div>

        {children.length > 0 ? (
          <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-1.5">
            {children.map((child, childIndex) => {
              const childSectionKey = child.sectionKey || item.sectionKey;
              const childClickable = Boolean(childSectionKey && findSalarySection(childSectionKey));

              const childContent = (
                <>
                  <span className="min-w-0 truncate text-sm font-semibold text-slate-500">
                    ↳ {child.label}
                  </span>

                  <span className={`shrink-0 text-sm font-bold ${child.color || item.color}`}>
                    {renderSalaryValue(child)}
                  </span>
                </>
              );

              return childClickable ? (
                <button
                  key={`${child.id ?? child.label}-${childIndex}`}
                  type="button"
                  onClick={() => handleGoToSection(childSectionKey)}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-slate-100"
                >
                  {childContent}
                </button>
              ) : (
                <div
                  key={`${child.id ?? child.label}-${childIndex}`}
                  className="flex w-full items-center justify-between gap-3 px-2 py-1.5 text-start"
                >
                  {childContent}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const renderContent = () => {
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
          <Info className="mb-3 h-12 w-12 text-slate-300" />

          <p className="font-medium">
            {t('salaries.salaryCalculationModal.noSalaryDataAvailable')}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 py-2">
        {renderEmployeeTypeSection()}

        <div className="grid grid-cols-2 gap-2 @[48rem]:grid-cols-4">
          {topItems.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
              <div className="text-sm font-semibold text-slate-500">{item.label}</div>
              <div className="mt-1 break-words text-lg font-bold text-slate-900">{renderSalaryValue(item)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-2 @[36rem]:grid-cols-[1fr_auto_1fr]">
          <div>{positiveItems.map(renderSalaryItem)}</div>

          <div className="hidden w-px bg-slate-300 @[36rem]:block" />

          <div>{deductionItems.map(renderSalaryItem)}</div>
        </div>

        {neutralItems.length > 0 && (
          <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-slate-50 px-4 py-1 grid grid-cols-1 gap-x-8 @[48rem]:grid-cols-2">
            {neutralItems.map(renderSalaryItem)}
          </div>
        )}

        {findSalarySection('overview') ? (
          <button
            type="button"
            onClick={() => handleGoToSection('overview')}
            className="focus-visible:ring-primary/40 mt-1 flex w-full items-center gap-4 rounded-lg bg-[#F3F2FF] px-5 py-2 text-start transition-colors hover:bg-[#ebe9ff] focus-visible:ring-2 focus-visible:outline-none"
            title={t('salaries.salaryCalculationModal.goToOverview', {
              defaultValue: 'Go to Overview',
            })}
          >
            <div className="bg-primary flex size-10 items-center justify-center rounded-md">
              <Wallet className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-primary text-xl leading-tight font-bold">
                {t('salaries.salaryCalculationModal.totalSalary')}
              </p>

              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {formatApiDisplayValue(netSalaryDisplay)}
              </p>
            </div>
          </button>
        ) : (
          <div className="mt-1 flex w-full items-center gap-4 rounded-lg bg-[#F3F2FF] px-5 py-2">
            <div className="bg-primary flex size-10 items-center justify-center rounded-md">
              <Wallet className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-primary text-xl leading-tight font-bold">
                {t('salaries.salaryCalculationModal.totalSalary')}
              </p>

              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {formatApiDisplayValue(netSalaryDisplay)}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} className="w-5xl">
        <DialogContent
          className={
            view === 'details'
              ? '!w-[1600px] !max-w-[98vw] max-h-[94dvh] overflow-y-auto bg-slate-50'
              : '!w-[1750px] !max-w-[98vw] !max-h-none overflow-visible max-lg:!max-h-[94dvh] max-lg:overflow-y-auto'
          }
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div ref={exportContentRef} className="@container w-full min-w-0">
            <DialogHeader className="flex flex-col items-start space-y-3">
              <div className="flex w-full flex-row items-center justify-between">
                <DialogTitle>
                  {view === 'details'
                    ? t('salaries.salaryCalculationModal.details.title')
                    : t('salaries.salaryCalculationModal.title')}
                </DialogTitle>

                <div className="flex items-center gap-2" data-exclude-from-image="true">
                  {view === 'summary' && (
                    <Button
                      variant="outline"
                      onClick={handleGoToAttendanceSummary}
                      disabled={!employeeId || !payrollYear || !payrollMonth}
                      title={t('salaries.salaryCalculationModal.buttons.attendanceSummary', {
                        defaultValue: 'Attendance Summary',
                      })}
                    >
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                  )}

                  {view === 'summary' && (
                    <Button
                      variant="outline"
                      onClick={() => setView('details')}
                      title={t('salaries.salaryCalculationModal.buttons.viewDetails')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {view === 'summary' && (
                    <>
                      <ExportDialog
                        trigger={
                          <Button variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        }
                        onPdf={() => handleExport('pdf')}
                        onExcel={() => handleExport('excel')}
                        onImage={handleExportAsImage}
                        onCopyImage={handleCopyImage}
                        onPrintTable={() => handleExport('print')}
                      />

                      <Button
                        variant="outline"
                        onClick={() => setOpenManualUpdate(true)}
                        title={t('salaries.salaryCalculationModal.buttons.manualSalaryUpdate')}
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                    <span>{(employeeName || 'E').charAt(0).toUpperCase()}</span>

                    {employeeImage && (
                      <img
                        src={employeeImage}
                        alt={employeeName}
                        className="absolute inset-0 h-full w-full object-cover"
                        onLoad={(event) => {
                          event.currentTarget.dataset.captureFailed = 'false';
                          event.currentTarget.style.display = '';
                        }}
                        onError={(event) => {
                          // Keep a reliable failure marker. `complete` alone is
                          // not enough because failed images can be complete=true.
                          event.currentTarget.dataset.captureFailed = 'true';
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="truncate text-lg font-semibold text-slate-800">
                        {employeeName}
                      </h3>

                      {employeeCode && (
                        <span className="text-base font-semibold text-slate-600">
                          {employeeCode}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                      {employeePosition && (
                        <span>
                          {t('salaries.exportColumns.position', {
                            defaultValue: 'Position',
                          })}
                          : <strong className="text-slate-700">{employeePosition}</strong>
                        </span>
                      )}

                      {employeeDepartment && (
                        <span>
                          {t('salaries.exportColumns.department', {
                            defaultValue: 'Department',
                          })}
                          : <strong className="text-slate-700">{employeeDepartment}</strong>
                        </span>
                      )}

                      {employeeShiftDisplay && (
                        <span>
                          {t('salaries.salaryCalculationModal.shift', {
                            defaultValue: 'Shift',
                          })}
                          : <strong className="text-slate-700">{employeeShiftDisplay}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3" data-exclude-from-image="true">
                  <button onClick={handleSendWhatsApp} title="Open WhatsApp chat" type="button">
                    <MessageCircle className="text-success h-5 w-5 cursor-pointer" />
                  </button>

                  <button onClick={handleSendEmail} title="Open email" type="button">
                    <Mail className="text-primary h-5 w-5 cursor-pointer" />
                  </button>
                </div>
              </div>
            </DialogHeader>

            {view === 'details' ? (
              <SalaryCalculationDetailsView
                data={sheetData}
                penaltiesRows={penaltiesRows}
                rewardsRows={rewardsRows}
                isLoading={isPayrollSheetLoading && payrollSheetEnabled}
                onBack={() => setView('summary')}
              />
            ) : (
              renderContent()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SalaryManualUpdateModal
        open={openManualUpdate}
        onOpenChange={setOpenManualUpdate}
        employeeId={data?.employee?.id}
        onSuccess={() => {
          setOpenManualUpdate(false);
          onUpdate?.();
        }}
      />
    </>
  );
}
