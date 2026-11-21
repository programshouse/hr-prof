// src/features/employees/components/form/StepEmploymentDetails.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import DatePickerInput from '@/components/ui/date-picker-input';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useManagers } from '@/features/settings/hooks/useManagers';
import { useAllShifts } from '@/shared/hooks/useAllShifts';

const getShiftName = (shift) => String(shift?.name_en || shift?.name_ar || '').toLowerCase();

const isFreelancerShift = (shift) => {
  const name = getShiftName(shift);
  return name.includes('freelancer') || name.includes('free lancer') || name.includes('freelance');
};

const isFreelancerHoursShift = (shift) => {
  const name = getShiftName(shift);
  return isFreelancerShift(shift) && (name.includes('(h)') || name.includes('hour'));
};

const isFreelancerTasksShift = (shift) => {
  const name = getShiftName(shift);
  return isFreelancerShift(shift) && (name.includes('task') || name.includes('(tasks)'));
};

function DatePickerField({ label, required, fieldName, register, watch, setValue, error }) {
  const value = watch(fieldName) || '';

  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>

      {/* keep field registered in RHF */}
      <input type="hidden" {...register(fieldName)} />

      <DatePickerInput
        value={value}
        onChange={(iso) =>
          setValue(fieldName, iso, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />

      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

const DAYS = [
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
];

// Contract types
const CONTRACT_TYPES = [
  { id: 'job', labelKey: 'employees.form.contractTypes.job' },
  { id: 'internship', labelKey: 'employees.form.contractTypes.internship' },
];

function normalizeWeeklyDaysShape(value) {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }

  if (Array.isArray(value)) {
    const obj = {};

    value.forEach((row) => {
      const dayKey = String(row?.day || '').toLowerCase();
      if (!dayKey) return;

      obj[dayKey] = {
        enabled: true,
        from: row?.start_time || row?.from || '',
        to: row?.end_time || row?.to || '',
      };
    });

    return obj;
  }

  if (typeof value === 'object') return value;

  return {};
}

export default function StepEmploymentDetails({ register, setValue, watch, errors }) {
  const { t } = useTranslation();
  const hasManuallySetWorkingMode = React.useRef(false);
  const hasManuallySetFixedShift = React.useRef(false);
  const hasInitializedSchedule = React.useRef(false);
  const employeeShiftId = watch('employee.shift_id');
  const fixedShift = watch('employee.fixed_shift');

  const employeeErrors = errors?.employee || {};

  const { data: departments } = useAllDepartments();
  const { data: branches } = useAllBranches();
  const { data: employees = [] } = useAllEmployees();
  const { data: managers } = useManagers();
  const { data: shifts } = useAllShifts();
  const taskManagerValue = watch('employee.task_manager');
  const selectedTaskManagerIds = Array.isArray(taskManagerValue)
    ? taskManagerValue.map((id) => String(id))
    : [];

  React.useEffect(() => {
    register('employee.task_manager');
  }, [register]);

  const selectedShift = React.useMemo(
    () => shifts?.find((s) => String(s.id) === String(employeeShiftId)),
    [shifts, employeeShiftId]
  );

  const selectedShiftIsFreelancer = isFreelancerShift(selectedShift);
  const selectedShiftIsFreelancerHours = isFreelancerHoursShift(selectedShift);

  const employeeEmploymentType = watch('employee.employment_type') || '';

  const isFreelancer = employeeEmploymentType === 'freelancer' || selectedShiftIsFreelancer;

  const isPartTime = employeeEmploymentType === 'part_time' && !isFreelancer;

  const isFullTime = !isFreelancer && !isPartTime;

  const partTimeMode =
    watch('employee.part_time_mode') ||
    (selectedShiftIsFreelancerHours || isPartTime || isFreelancer ? 'hours' : 'days');

  const showWorkingModeSection = isPartTime || isFreelancer;
  const showHoursField = (isPartTime || isFreelancer) && partTimeMode === 'hours';

  const showDaysSchedule = isFullTime || (isPartTime && partTimeMode === 'days');
  const showFixedShiftSection = isFullTime || (isPartTime && partTimeMode === 'days');

  const weeklyWorkDaysRaw = watch('employee.weekly_work_days');
  const weeklyWorkDays = React.useMemo(
    () => normalizeWeeklyDaysShape(weeklyWorkDaysRaw),
    [weeklyWorkDaysRaw]
  );

  const weeklyWorkDaysJson = React.useMemo(
    () => JSON.stringify(weeklyWorkDays || {}),
    [weeklyWorkDays]
  );

  const fixedFrom = watch('employee.fixed_from') || '';
  const fixedTo = watch('employee.fixed_to') || '';

  const updateWeeklyDays = React.useCallback(
    (nextValue, opts = {}) => {
      setValue('employee.weekly_work_days', nextValue, {
        shouldDirty: opts.shouldDirty ?? true,
        shouldValidate: opts.shouldValidate ?? true,
      });
    },
    [setValue]
  );

  const updateDayField = React.useCallback(
    (dayKey, patch, opts = {}) => {
      const current = normalizeWeeklyDaysShape(watch('employee.weekly_work_days'));

      const nextValue = {
        ...current,
        [dayKey]: {
          enabled: current?.[dayKey]?.enabled ?? false,
          from: current?.[dayKey]?.from || '',
          to: current?.[dayKey]?.to || '',
          ...patch,
        },
      };

      updateWeeklyDays(nextValue, opts);
    },
    [updateWeeklyDays, watch]
  );

  const handleWorkingModeChange = (mode) => {
    hasManuallySetWorkingMode.current = true;

    setValue('employee._manually_set_working_mode', true, {
      shouldDirty: false,
      shouldValidate: false,
    });

    setValue('employee.part_time_mode', mode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (isFreelancer && mode === 'hours') {
      const freelancerHoursShift = shifts?.find(isFreelancerHoursShift);

      if (freelancerHoursShift) {
        setValue('employee.shift_id', freelancerHoursShift.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      setValue('employee.part_time_type', 'hours', {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    if (mode === 'days') {
      setValue('employee.monthly_hours_required', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    // optional: switching to hours clears weekly days
    if (mode === 'hours') {
      setValue(
        'employee.weekly_work_days',
        {},
        {
          shouldDirty: true,
          shouldValidate: false,
        }
      );
      setValue('employee.fixed_shift', false, {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue('employee.fixed_from', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue('employee.fixed_to', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  };

  const handleFixedShiftChange = (value) => {
    // Mark that user has manually set this value
    hasManuallySetFixedShift.current = true;

    const bool = value === 'yes';

    setValue('employee.fixed_shift', bool, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!bool) {
      setValue('employee.fixed_from', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue('employee.fixed_to', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  };

  const handleShiftChange = (shiftId) => {
    const shift = shifts?.find((s) => String(s.id) === String(shiftId));

    const detectedFreelancer = isFreelancerShift(shift);
    const detectedFreelancerHours = isFreelancerHoursShift(shift);
    const detectedFreelancerTasks = isFreelancerTasksShift(shift);

    const lowerName = getShiftName(shift);
    const detectedPartTime = lowerName.includes('part time') || lowerName.includes('part-time');

    setValue('employee.shift_id', shiftId, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (detectedFreelancer) {
      setValue('employee.employment_type', 'freelancer', {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue('employee.employment_type_id', 3, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue(
        'employee.weekly_work_days',
        {},
        {
          shouldDirty: true,
          shouldValidate: false,
        }
      );

      setValue('employee.fixed_shift', false, {
        shouldDirty: true,
        shouldValidate: false,
      });

      setValue('employee.fixed_from', '', {
        shouldDirty: true,
        shouldValidate: false,
      });

      setValue('employee.fixed_to', '', {
        shouldDirty: true,
        shouldValidate: false,
      });

      if (detectedFreelancerHours) {
        setValue('employee.part_time_mode', 'hours', {
          shouldDirty: true,
          shouldValidate: true,
        });

        setValue('employee.part_time_type', 'hours', {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      if (detectedFreelancerTasks) {
        setValue('employee.part_time_mode', undefined, {
          shouldDirty: true,
          shouldValidate: false,
        });

        setValue('employee.part_time_type', undefined, {
          shouldDirty: true,
          shouldValidate: false,
        });

        setValue('employee.monthly_hours_required', '', {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      return;
    }

    if (detectedPartTime) {
      setValue('employee.employment_type', 'part_time', {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue('employee.employment_type_id', 2, {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (!watch('employee.part_time_mode')) {
        setValue('employee.part_time_mode', 'hours', {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      return;
    }

    setValue('employee.employment_type', 'full_time', {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('employee.employment_type_id', 1, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('employee.part_time_mode', undefined, {
      shouldDirty: false,
      shouldValidate: false,
    });

    setValue('employee.part_time_type', undefined, {
      shouldDirty: false,
      shouldValidate: false,
    });

    setValue('employee.monthly_hours_required', '', {
      shouldDirty: false,
      shouldValidate: false,
    });
  };

  React.useEffect(() => {
    if (!selectedShift) return;

    if (isFreelancerShift(selectedShift)) {
      setValue('employee.employment_type', 'freelancer', {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.employment_type_id', 3, {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue(
        'employee.weekly_work_days',
        {},
        {
          shouldDirty: false,
          shouldValidate: false,
        }
      );

      setValue('employee.fixed_shift', false, {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.fixed_from', '', {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.fixed_to', '', {
        shouldDirty: false,
        shouldValidate: false,
      });

      if (isFreelancerHoursShift(selectedShift)) {
        setValue('employee.part_time_mode', 'hours', {
          shouldDirty: false,
          shouldValidate: false,
        });

        setValue('employee.part_time_type', 'hours', {
          shouldDirty: false,
          shouldValidate: false,
        });
      }
    }
  }, [selectedShift, setValue]);

  React.useEffect(() => {
    if (!employeeShiftId) return;
    if (!Array.isArray(shifts) || shifts.length === 0) return;

    const shift = shifts.find((s) => String(s.id) === String(employeeShiftId));
    if (!shift) return;

    const detectedFreelancer = isFreelancerShift(shift);
    const detectedFreelancerHours = isFreelancerHoursShift(shift);
    const detectedFreelancerTasks = isFreelancerTasksShift(shift);

    const lowerName = getShiftName(shift);
    const detectedPartTime = lowerName.includes('part time') || lowerName.includes('part-time');

    if (detectedFreelancer) {
      setValue('employee.employment_type', 'freelancer', {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.employment_type_id', 3, {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue(
        'employee.weekly_work_days',
        {},
        {
          shouldDirty: false,
          shouldValidate: false,
        }
      );

      setValue('employee.fixed_shift', false, {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.fixed_from', '', {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.fixed_to', '', {
        shouldDirty: false,
        shouldValidate: false,
      });

      if (detectedFreelancerHours) {
        setValue('employee.part_time_mode', 'hours', {
          shouldDirty: false,
          shouldValidate: false,
        });

        setValue('employee.part_time_type', 'hours', {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      if (detectedFreelancerTasks) {
        setValue('employee.part_time_mode', undefined, {
          shouldDirty: false,
          shouldValidate: false,
        });

        setValue('employee.part_time_type', undefined, {
          shouldDirty: false,
          shouldValidate: false,
        });

        setValue('employee.monthly_hours_required', '', {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      return;
    }

    if (detectedPartTime) {
      setValue('employee.employment_type', 'part_time', {
        shouldDirty: false,
        shouldValidate: false,
      });

      setValue('employee.employment_type_id', 2, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [employeeShiftId, shifts, setValue]);

  // Auto-detect or default Working Mode based on data
  const watchedMonthlyHours = watch('employee.monthly_hours_required');
  const currentMode = watch('employee.part_time_mode');
  const hasManuallySetInForm = watch('employee._manually_set_working_mode');

  // ✅ FIX: auto-detect runs only if NO mode is set, and stops once user picks
  React.useEffect(() => {
    if (!isPartTime) return;
    if (hasManuallySetWorkingMode.current || hasManuallySetInForm) return;
    if (currentMode) return;

    const hasHours = Number(watchedMonthlyHours) > 0;
    const hasDays = Object.values(weeklyWorkDays).some((d) => d?.enabled === true);

    if (hasDays && !hasHours) {
      setValue('employee.part_time_mode', 'days', { shouldValidate: true });
    } else {
      setValue('employee.part_time_mode', 'hours', { shouldDirty: false });
    }
  }, [
    isPartTime,
    hasManuallySetInForm,
    currentMode,
    watchedMonthlyHours,
    weeklyWorkDaysJson,
    weeklyWorkDays,
    setValue,
  ]);

  React.useEffect(() => {
    if (!showDaysSchedule) return;
    if (isPartTime && partTimeMode !== 'days') return;
    if (hasManuallySetFixedShift.current) return;

    const enabledDays = Object.entries(weeklyWorkDays)
      .filter(([_, dayData]) => dayData?.enabled === true)
      .map(([dayKey, dayData]) => ({
        day: dayKey,
        from: dayData?.from || '',
        to: dayData?.to || '',
      }));

    if (enabledDays.length < 2) return;

    const firstDay = enabledDays[0];
    const allSameTime = enabledDays.every(
      (day) => day.from === firstDay.from && day.to === firstDay.to
    );

    const shouldBeFixed = allSameTime;

    if (fixedShift !== shouldBeFixed) {
      setValue('employee.fixed_shift', shouldBeFixed, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    if (shouldBeFixed) {
      if ((watch('employee.fixed_from') || '') !== (firstDay.from || '')) {
        setValue('employee.fixed_from', firstDay.from || '', {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      if ((watch('employee.fixed_to') || '') !== (firstDay.to || '')) {
        setValue('employee.fixed_to', firstDay.to || '', {
          shouldDirty: false,
          shouldValidate: false,
        });
      }
    }
  }, [
    weeklyWorkDaysJson,
    weeklyWorkDays,
    showDaysSchedule,
    isPartTime,
    partTimeMode,
    fixedShift,
    setValue,
    watch,
  ]);

  React.useEffect(() => {
    if (!showDaysSchedule) return;
    if (fixedShift !== true) return;
    if (!fixedFrom || !fixedTo) return;

    const current = normalizeWeeklyDaysShape(watch('employee.weekly_work_days'));
    let changed = false;

    const next = { ...current };

    Object.keys(next).forEach((dayKey) => {
      if (!next?.[dayKey]?.enabled) return;

      const curFrom = next[dayKey]?.from || '';
      const curTo = next[dayKey]?.to || '';

      if (curFrom !== fixedFrom || curTo !== fixedTo) {
        next[dayKey] = {
          ...next[dayKey],
          from: fixedFrom,
          to: fixedTo,
        };
        changed = true;
      }
    });

    if (changed) {
      updateWeeklyDays(next, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [
    showDaysSchedule,
    fixedShift,
    fixedFrom,
    fixedTo,
    weeklyWorkDaysJson,
    updateWeeklyDays,
    watch,
  ]);

  const rawDaysFromApi = watch('employee._weekly_work_days_raw');

  React.useEffect(() => {
    if (!rawDaysFromApi || hasInitializedSchedule.current) return;

    let daysArray = [];

    try {
      daysArray = typeof rawDaysFromApi === 'string' ? JSON.parse(rawDaysFromApi) : rawDaysFromApi;
    } catch {
      daysArray = [];
    }

    if (Array.isArray(daysArray) && daysArray.length > 0) {
      const newData = {};

      daysArray.forEach((item) => {
        const dayKey = String(item.day || '').toLowerCase();

        if (dayKey && DAYS.some((d) => d.key === dayKey)) {
          newData[dayKey] = {
            enabled: true,
            from: item.start_time || '',
            to: item.end_time || '',
          };
        }
      });

      if (Object.keys(newData).length > 0) {
        setValue('employee.weekly_work_days', newData, {
          shouldDirty: false,
          shouldValidate: false,
        });
        hasInitializedSchedule.current = true;
      }
    }
  }, [rawDaysFromApi, setValue]);

  React.useEffect(() => {
    if (isFreelancer || isFullTime) {
      setValue('employee._manually_set_working_mode', false, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [isFreelancer, isFullTime, setValue]);

  return (
    <StepSection title={t('employees.form.employmentDetails')}>
      {/* Basic employment grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Code */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_code" required>
            {t('employees.form.code')}
          </Label>
          <Input
            id="employee_code"
            className="h-9 text-sm"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register('employee.code', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              },
            })}
          />
          {employeeErrors.code && (
            <p className="mt-1 text-xs text-red-500">
              {employeeErrors.code.message || t('employees.form.codeIsRequired')}
            </p>
          )}
        </div>

        {/* Company (department) */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_department_id" required>
            {t('employees.form.company')}
          </Label>
          <Select
            value={watch('employee.department_id')?.toString() || ''}
            onValueChange={(v) =>
              setValue('employee.department_id', v, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="employee_department_id" className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.selectDepartment')} />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name_en || dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('employee.department_id')} />
          {employeeErrors.department_id && (
            <p className="mt-1 text-xs text-red-500">
              {employeeErrors.department_id.message || t('employees.form.departmentIsRequired')}
            </p>
          )}
        </div>

        {/* Branch */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_branch_id">{t('employees.form.branch')}</Label>
          <Select
            value={
              Array.isArray(watch('employee.branch_id'))
                ? watch('employee.branch_id')?.[0]?.toString() || ''
                : watch('employee.branch_id')?.toString() || ''
            }
            onValueChange={(v) =>
              setValue('employee.branch_id', [Number(v)], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="employee_branch_id" className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.selectBranch')} />
            </SelectTrigger>
            <SelectContent>
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name_en || branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('employee.branch_id')} />
        </div>

        {/* Head Manager */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_manager_id">{t('employees.form.headManager')}</Label>
          <Select
            value={watch('employee.manager_id')?.toString() || ''}
            onValueChange={(v) =>
              setValue('employee.manager_id', v ? Number(v) : undefined, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="employee_manager_id" className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.selectManager')} />
            </SelectTrigger>
            <SelectContent>
              {(managers?.data || managers || []).map((mgr) => {
                const name = mgr.full_name || `Manager #${mgr.id}`;

                return (
                  <SelectItem key={mgr.id} value={String(mgr.id)}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('employee.manager_id')} />
          {/* {employeeErrors.manager_id && (
            <p className="mt-1 text-xs text-red-500">
              {employeeErrors.manager_id.message || t('employees.form.headManagerIsRequired')}
            </p>
          )} */}
        </div>

        {/* Permission To Add Tasks */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_task_manager">{t('employees.form.permissionToAddTasks')}</Label>
          <EmployeeMultiSelectCombobox
            value={selectedTaskManagerIds}
            employees={employees}
            placeholder={t('employees.form.selectEmployees')}
            searchPlaceholder={t('employees.form.searchEmployees')}
            emptyMessage={t('employees.form.noEmployeesFound')}
            selectedLabel={t('employees.form.selectedEmployees')}
            clearAllLabel={t('employees.form.clearAll')}
            formatSelectedLabel={(count) =>
              t('employees.form.selectedEmployeesCount', { count })
            }
            onChange={(values) =>
              setValue(
                'employee.task_manager',
                values
                  .filter((value) => value !== null && value !== undefined && value !== '')
                  .map((value) => Number(value))
                  .filter((value) => Number.isFinite(value) && value > 0),
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              )
            }
          />
        </div>

        {/* Fingerprint */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_has_fingerprint" required>
            {t('employees.form.fingerprint')}
          </Label>
          <Select
            value={
              watch('employee.has_fingerprint') === 1 || watch('employee.has_fingerprint') === true
                ? '1'
                : watch('employee.has_fingerprint') === 0 ||
                    watch('employee.has_fingerprint') === false
                  ? '0'
                  : ''
            }
            onValueChange={(v) =>
              setValue('employee.has_fingerprint', v === '1' ? 1 : 0, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="employee_has_fingerprint" className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('employees.form.yes')}</SelectItem>
              <SelectItem value="0">{t('employees.form.no')}</SelectItem>
            </SelectContent>
          </Select>
          {employeeErrors.has_fingerprint && (
            <p className="mt-1 text-xs text-red-500">
              {employeeErrors.has_fingerprint.message || t('employees.form.fingerprintRequired')}
            </p>
          )}
        </div>

        {/* Shift */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_shift_id" required>
            {t('employees.form.shift')}
          </Label>
          <Select value={employeeShiftId?.toString() || ''} onValueChange={handleShiftChange}>
            <SelectTrigger id="employee_shift_id" className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.selectShift')} />
            </SelectTrigger>
            <SelectContent>
              {shifts?.map((shift) => (
                <SelectItem key={shift.id} value={String(shift.id)}>
                  {shift.name_en || shift.name_ar || `Shift #${shift.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('employee.shift_id')} />
          <input type="hidden" {...register('employee.employment_type_id')} />
          <input type="hidden" {...register('employee.employment_type')} />
          {employeeErrors.shift_id && (
            <p className="mt-1 text-xs text-red-500">
              {employeeErrors.shift_id.message || t('employees.form.shiftIsRequired')}
            </p>
          )}
        </div>

        {/* Contract Type */}
        <div className="space-y-1.5">
          <Label htmlFor="employee_contract_type">{t('employees.form.contractType')}</Label>
          <Select
            value={watch('employee.contract_type') || ''}
            onValueChange={(v) =>
              setValue('employee.contract_type', v, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="employee_contract_type" className="h-9 text-sm">
              <SelectValue placeholder={t('employees.form.selectContractType')} />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((ct) => (
                <SelectItem key={ct.id} value={ct.id}>
                  {t(ct.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <DatePickerField
          label={t('employees.form.startDate')}
          required
          fieldName="employee.join_date"
          register={register}
          watch={watch}
          setValue={setValue}
          error={employeeErrors.join_date}
        />

        {/* End Date */}
        <DatePickerField
          label={t('employees.form.endDate')}
          required
          fieldName="employee.end_date"
          register={register}
          watch={watch}
          setValue={setValue}
          error={employeeErrors.end_date}
        />
      </div>

      {showWorkingModeSection && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" {...register('employee.part_time_mode')} />
          <input type="hidden" {...register('employee.part_time_type')} />
          <input type="hidden" {...register('employee._manually_set_working_mode')} />

          {/* Working Mode */}
          <div className="space-y-1.5">
            <Label required>{t('employees.form.workingMode')}</Label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Hours */}
              <label
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition',
                  partTimeMode === 'hours' ? 'text-primary' : 'text-slate-600'
                )}
              >
                <input
                  type="radio"
                  name="employee.part_time_mode"
                  className="sr-only"
                  checked={partTimeMode === 'hours'}
                  onChange={() => handleWorkingModeChange('hours')}
                />
                <span
                  className={cn(
                    'inline-flex size-3 items-center justify-center rounded-full border',
                    partTimeMode === 'hours' ? 'border-primary' : 'border-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      partTimeMode === 'hours' ? 'bg-primary' : 'bg-transparent'
                    )}
                  />
                </span>
                <span>{t('employees.form.hours')}</span>
              </label>

              {/* Days */}
              <label
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition',
                  partTimeMode === 'days' ? 'text-primary' : 'text-slate-600'
                )}
              >
                <input
                  type="radio"
                  name="employee.part_time_mode"
                  className="sr-only"
                  checked={partTimeMode === 'days'}
                  onChange={() => handleWorkingModeChange('days')}
                />
                <span
                  className={cn(
                    'inline-flex size-3 items-center justify-center rounded-full border',
                    partTimeMode === 'days' ? 'border-primary' : 'border-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      partTimeMode === 'days' ? 'bg-primary' : 'bg-transparent'
                    )}
                  />
                </span>
                <span>{t('employees.form.daysLabel')}</span>
              </label>
            </div>
          </div>

          {showHoursField && (
            <div className="space-y-1.5">
              <Label htmlFor="employee_monthly_hours_required" required>
                {t('employees.form.totalHours')}
              </Label>
              <Input
                id="employee_monthly_hours_required"
                className="h-9 text-sm"
                placeholder={t('employees.form.totalHoursPlaceholder')}
                {...register('employee.monthly_hours_required')}
              />
              {employeeErrors.monthly_hours_required && (
                <p className="mt-1 text-xs text-red-500">
                  {employeeErrors.monthly_hours_required.message ||
                    t('employees.form.totalHoursIsRequired')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {showFixedShiftSection && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label required>{t('employees.form.fixedShift')}</Label>
              <div className="flex flex-wrap items-center gap-3">
                <label
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition',
                    fixedShift === true ? 'text-primary' : 'text-slate-600'
                  )}
                >
                  <input
                    type="radio"
                    name="employee.fixed_shift"
                    className="sr-only"
                    checked={fixedShift === true}
                    onChange={() => handleFixedShiftChange('yes')}
                  />
                  <span
                    className={cn(
                      'inline-flex size-3 items-center justify-center rounded-full border',
                      fixedShift === true ? 'border-primary' : 'border-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        fixedShift === true ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                  </span>
                  <span>{t('employees.form.yes')}</span>
                </label>

                {/* No */}
                <label
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition',
                    fixedShift === false ? 'text-primary' : 'text-slate-600'
                  )}
                >
                  <input
                    type="radio"
                    name="employee.fixed_shift"
                    className="sr-only"
                    checked={fixedShift === false}
                    onChange={() => handleFixedShiftChange('no')}
                  />
                  <span
                    className={cn(
                      'inline-flex size-3 items-center justify-center rounded-full border',
                      fixedShift === false ? 'border-primary' : 'border-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        fixedShift === false ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                  </span>
                  <span>{t('employees.form.no')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* From / To – only when fixed shift = Yes */}
          {fixedShift === true && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input type="hidden" {...register('employee.fixed_from')} />
              <input type="hidden" {...register('employee.fixed_to')} />

              <div className="space-y-1.5">
                <Label required htmlFor="employee_fixed_from">
                  {t('employees.form.from')}
                </Label>
                <Input
                  id="employee_fixed_from"
                  type="time"
                  className="h-9 w-full text-sm"
                  value={fixedFrom}
                  onChange={(e) =>
                    setValue('employee.fixed_from', e.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label required htmlFor="employee_fixed_to">
                  {t('employees.form.to')}
                </Label>
                <Input
                  id="employee_fixed_to"
                  type="time"
                  className="h-9 w-full text-sm"
                  value={fixedTo}
                  onChange={(e) =>
                    setValue('employee.fixed_to', e.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <Label className="mb-3 block text-sm font-medium">
              {t('employees.form.workingDaysAndHours')}
            </Label>

            <div className="space-y-3">
              {DAYS.map((day) => {
                const dayData = weeklyWorkDays?.[day.key] || {};
                const enabled = dayData?.enabled ?? false;

                return (
                  <div key={day.key} className="flex items-center gap-3 text-sm">
                    <Switch
                      checked={!!enabled}
                      onCheckedChange={(checked) => {
                        updateDayField(
                          day.key,
                          {
                            enabled: checked,
                            from:
                              checked && fixedShift === true && fixedFrom
                                ? fixedFrom
                                : dayData?.from || '',
                            to:
                              checked && fixedShift === true && fixedTo
                                ? fixedTo
                                : dayData?.to || '',
                          },
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          }
                        );
                      }}
                    />
                    <span className="w-24">{t(`employees.form.days.${day.key}`)}</span>

                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      disabled={!enabled || fixedShift === true}
                      value={dayData?.from || ''}
                      onChange={(e) =>
                        updateDayField(
                          day.key,
                          { from: e.target.value },
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                    />
                    <span className="text-xs text-slate-400">{t('employees.form.to')}</span>
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      disabled={!enabled || fixedShift === true}
                      value={dayData?.to || ''}
                      onChange={(e) =>
                        updateDayField(
                          day.key,
                          { to: e.target.value },
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-1.5 sm:col-span-2 lg:col-span-3">
        <Label htmlFor="employee_contract_file">{t('employees.form.contractFile')}</Label>
        <Input
          id="employee_contract_file"
          type="file"
          className="h-9 text-sm"
          {...register('employee.contract_file')}
        />
      </div>
    </StepSection>
  );
}
