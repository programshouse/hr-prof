import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import EmployeeInfoCard from '@/components/ui/employeeInfoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useManagers } from '@/features/settings/hooks/useManagers';
import { useAllDepartments, useAllBranches } from '@/shared/hooks';
import { useTranslation } from 'react-i18next';
import RowLine from '../shared/RowLine';
import EditRow from '../shared/EditRow';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import {
  resolveDepartmentDisplayName,
  resolveEmployeeDisplayName,
  resolveEntityDisplayName,
  resolvePositionDisplayName,
  resolveShiftDisplayName,
} from '@/lib/utils/employeeDisplayName';
import { formatRequestTimeRange } from '@/utils/requestLabels';

const DAYS = [
  { key: 'Saturday', label: 'Saturday' },
  { key: 'Sunday', label: 'Sunday' },
  { key: 'Monday', label: 'Monday' },
  { key: 'Tuesday', label: 'Tuesday' },
  { key: 'Wednesday', label: 'Wednesday' },
  { key: 'Thursday', label: 'Thursday' },
  { key: 'Friday', label: 'Friday' },
];

const DAY_ORDER = DAYS.map((day) => day.key);

const DAY_NAME_MAP = DAYS.reduce((acc, day) => {
  acc[day.key.toLowerCase()] = day.key;
  return acc;
}, {});

const normalizeDayKey = (day) => {
  const normalized = String(day || '').trim().toLowerCase();
  return DAY_NAME_MAP[normalized] || String(day || '').trim();
};

const normalizeWeeklyDayEntry = (day = {}) => ({
  ...day,
  day: normalizeDayKey(day.day),
});

const sortWeeklyDays = (days = []) => {
  return [...days].map(normalizeWeeklyDayEntry).sort((a, b) => {
    const aIndex = DAY_ORDER.indexOf(normalizeDayKey(a.day));
    const bIndex = DAY_ORDER.indexOf(normalizeDayKey(b.day));

    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
};

export default function WorkDetailsCard({
  work,
  isEditing,
  onFieldChange,
  isFreelancer,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const preferArabic = isArabic;
  const { data: shifts = [] } = useAllShifts();
  const { data: positions = [] } = useAllPositions();
  const { data: managers = [] } = useManagers();
  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();
  const { data: employees = [] } = useAllEmployees();

  const [openManager, setOpenManager] = React.useState(false);
  const [openPosition, setOpenPosition] = React.useState(false);
  const [openShift, setOpenShift] = React.useState(false);
  const [openCompany, setOpenCompany] = React.useState(false);
  const [openBranch, setOpenBranch] = React.useState(false);

  const shiftType = work.shiftType ?? work.shift_id;
  const shiftObj = shifts.find((s) => Number(s.id) === Number(shiftType));

  let shiftLabel =
    resolveShiftDisplayName(shiftObj, { preferArabic }) ||
    work?.shiftName ||
    '--';

  if (!isFreelancer) {
    if (work.part_time_type?.toLowerCase() === 'days') {
      shiftLabel = t('employees.profile.details.work.fixedDays');
    } else if (work.part_time_type?.toLowerCase() === 'hours') {
      shiftLabel = t('employees.profile.details.work.fixedHours');
    }
  }

  if (shiftLabel === '--') {
    const fixedDaysShift = shifts.find(
      (s) =>
        (s.name_en?.toLowerCase().includes('fixed') ||
          s.name?.toLowerCase().includes('fixed')) &&
        (s.name_en?.toLowerCase().includes('days') ||
          s.name?.toLowerCase().includes('days'))
    );

    if (fixedDaysShift) {
      shiftLabel =
        resolveShiftDisplayName(fixedDaysShift, { preferArabic }) ||
        fixedDaysShift.name_en ||
        fixedDaysShift.name;
    }
  }

  const selectedPositionName = work?.position ?? work?.positionName ?? '';

  const selectedCompanyName =
    (work?.company?.name_en ||
      work?.company?.name ||
      work?.companyName ||
      work?.department ||
      work?.departmentName) ??
    '';

  const selectedBranchName =
    (work?.branch?.name_en || work?.branch?.name || work?.branchName) ?? '';

  const monthlyHours =
    work.monthly_hours_required ?? work.monthlyRequiredHours ?? '';

  const backendPartType = work.part_time_type || work.partTimeType || '';

  const weekly = React.useMemo(() => {
    const workDays = (
      Array.isArray(work.weekly_work_days) && work.weekly_work_days.length > 0
        ? work.weekly_work_days
        : Array.isArray(work.days) && work.days.length > 0
          ? work.days
          : []
    )
      .map(normalizeWeeklyDayEntry)
      .filter(
        (day, index, self) =>
          index === self.findIndex((d) => normalizeDayKey(d.day) === normalizeDayKey(day.day))
      );

    return sortWeeklyDays(workDays);
  }, [work.weekly_work_days, work.days]);

  const partTimeMode =
    backendPartType === 'hours' || backendPartType === 'days'
      ? backendPartType
      : monthlyHours && !weekly.length
        ? 'hours'
        : 'days';

  const getManagerFullName = (m) =>
    resolveEmployeeDisplayName(m?.applicant ? m : { applicant: m?.applicant ?? m, ...m }, {
      preferArabic,
    }) ||
    [m?.applicant?.first_name, m?.applicant?.middle_name, m?.applicant?.last_name]
      .filter(Boolean)
      .join(' ');

  const currentManager = React.useMemo(() => {
    const id = work?.manager_id;

    if (id && managers?.length) {
      const found = managers.find((m) => String(m.id) === String(id));
      if (found) return getManagerFullName(found) || found.name || '--';
    }

    return work?.managerName || work?.manager || '--';
  }, [work?.manager_id, work?.managerName, work?.manager, managers, preferArabic]);

  const currentPosition = React.useMemo(() => {
    if (work?.position_id && positions?.length) {
      const found = positions.find((p) => String(p.id) === String(work.position_id));
      if (found) {
        return (
          resolvePositionDisplayName(found, { preferArabic, positions }) ||
          found.title_en ||
          found.name ||
          ''
        );
      }
    }

    return (
      work.positionName ||
      resolvePositionDisplayName(work, { preferArabic, positions }) ||
      selectedPositionName ||
      ''
    );
  }, [work, positions, preferArabic, selectedPositionName]);

  const currentDepartment = React.useMemo(() => {
    if (work?.department_id && departments?.length) {
      const found = departments.find((d) => String(d.id) === String(work.department_id));
      if (found) {
        return (
          resolveDepartmentDisplayName(found, { preferArabic }) ||
          resolveEntityDisplayName(found, { preferArabic })
        );
      }
    }

    return (
      work?.departmentName ||
      resolveDepartmentDisplayName(work?.department, { preferArabic }) ||
      '--'
    );
  }, [work, departments, preferArabic]);

  const currentCompany = React.useMemo(() => {
    if (work?.company_id && departments?.length) {
      const found = departments.find((c) => String(c.id) === String(work.company_id));
      if (found) return resolveEntityDisplayName(found, { preferArabic });
    }

    return (
      resolveEntityDisplayName(work?.company, { preferArabic }) ||
      work?.companyName ||
      selectedCompanyName ||
      '--'
    );
  }, [work, departments, preferArabic, selectedCompanyName]);

  const currentBranch = React.useMemo(() => {
    if (work?.branch_id && branches?.length) {
      const found = branches.find((b) => String(b.id) === String(work.branch_id));
      if (found) return resolveEntityDisplayName(found, { preferArabic });
    }

    return (
      resolveEntityDisplayName(work?.branch, { preferArabic }) ||
      work?.branchName ||
      selectedBranchName ||
      '--'
    );
  }, [work, branches, preferArabic, selectedBranchName]);

  const taskManagerIds = React.useMemo(() => {
    const raw = work?.task_manager;
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => {
        if (item == null || item === '') return null;
        if (typeof item === 'object') {
          return item.id ?? item.employee_id ?? item.manager_id ?? item.value ?? null;
        }
        return item;
      })
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 0);
  }, [work?.task_manager]);

  const taskManagerNames = React.useMemo(() => {
    if (!taskManagerIds.length) return [];

    return taskManagerIds
      .map((id) => {
        const employee = employees.find((emp) => {
          const empId =
            emp?.id ?? emp?.employee_id ?? emp?.user_id ?? emp?.employee?.id ?? emp?.employee?.employee_id;
          return String(empId) === String(id);
        });

        return (
          resolveEmployeeDisplayName(employee?.employee ?? employee, { preferArabic }) ||
          employee?.full_name ||
          employee?.name ||
          null
        );
      })
      .filter(Boolean);
  }, [employees, taskManagerIds, preferArabic]);

  const taskManagersLabel = taskManagerNames.length
    ? taskManagerNames.join(', ')
    : '--';

  return (
    <EmployeeInfoCard
      title={t('employees.profile.details.work.title')}
      isEditing={isEditing}
      onChangeItem={onFieldChange}
      items={[
        {
          label: t('employees.profile.details.work.company'),
          field: 'company_id',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.company')}
                  value={currentCompany}
                />
              );
            }

            return (
              <EditRow
                label={t('employees.profile.details.work.company')}
                value={currentCompany}
              >
                <Popover open={openCompany} onOpenChange={setOpenCompany}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="input"
                      role="combobox"
                      aria-expanded={openCompany}
                      className="h-9 w-[180px] justify-between text-sm"
                    >
                      {currentCompany ||
                        t('employees.profile.details.work.selectCompany')}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t(
                          'employees.profile.details.work.searchCompany'
                        )}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('employees.profile.details.work.noCompanyFound')}
                        </CommandEmpty>

                        <CommandGroup>
                          {departments?.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={resolveEntityDisplayName(c, { preferArabic })}
                              className="flex items-center"
                              onSelect={() => {
                                onFieldChange('company_id', c.id);
                                setOpenCompany(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4 shrink-0',
                                  String(c.id) === String(work.company_id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {resolveEntityDisplayName(c, { preferArabic })}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.work.department'),
          field: 'department_id',
          customRender: () => (
            <RowLine
              label={t('employees.profile.details.work.department')}
              value={currentDepartment}
            />
          ),
        },

        {
          label: t('employees.profile.details.work.branch'),
          field: 'branch_id',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.branch')}
                  value={currentBranch}
                />
              );
            }

            return (
              <EditRow
                label={t('employees.profile.details.work.branch')}
                value={currentBranch}
              >
                <Popover open={openBranch} onOpenChange={setOpenBranch}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="input"
                      role="combobox"
                      aria-expanded={openBranch}
                      className="h-9 w-[180px] justify-between text-sm"
                    >
                      {currentBranch ||
                        t('employees.profile.details.work.selectBranch')}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t(
                          'employees.profile.details.work.searchBranch'
                        )}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('employees.profile.details.work.noBranchFound')}
                        </CommandEmpty>

                        <CommandGroup>
                          {branches?.map((b) => {
                            const name =
                              resolveEntityDisplayName(b, { preferArabic }) ||
                              b?.title ||
                              b?.branch_name ||
                              'Unnamed Branch';

                            const isSelected =
                              String(b.id) === String(work.branch_id);

                            return (
                              <CommandItem
                                key={b.id}
                                value={name}
                                className="flex items-center"
                                onSelect={() => {
                                  onFieldChange('branch_id', b.id);
                                  setOpenBranch(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.work.manager'),
          field: 'manager_id',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.manager')}
                  value={currentManager || '--'}
                />
              );
            }

            return (
              <EditRow
                label={t('employees.profile.details.work.manager')}
                value={currentManager}
              >
                <Popover open={openManager} onOpenChange={setOpenManager}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="input"
                      role="combobox"
                      aria-expanded={openManager}
                      className="h-9 w-[180px] justify-between text-sm"
                    >
                      {currentManager ||
                        t('employees.profile.details.work.selectManager')}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t(
                          'employees.profile.details.work.searchManager'
                        )}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('employees.profile.details.work.noManagerFound')}
                        </CommandEmpty>

                        <CommandGroup>
                          {managers?.map((m) => {
                            const id =
                              m?.id ?? m?.manager_id ?? m?.value ?? m?.id_setting;

                            const label =
                              getManagerFullName(m) || m.name || m.title || '';

                            const isSelected =
                              String(id) === String(work?.manager_id);

                            return (
                              <CommandItem
                                key={id || label}
                                value={label}
                                className="flex items-center"
                                onSelect={() => {
                                  onFieldChange('manager_id', id);
                                  onFieldChange('managerName', label);
                                  setOpenManager(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {label}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.work.permissionToAddTasks'),
          field: 'task_manager',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.permissionToAddTasks')}
                  value={taskManagersLabel}
                />
              );
            }

            return (
              <EditRow
                label={t('employees.profile.details.work.permissionToAddTasks')}
                value={taskManagersLabel}
              >
                <EmployeeMultiSelectCombobox
                  value={taskManagerIds.map(String)}
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
                    onFieldChange(
                      'task_manager',
                      values
                        .map((value) => Number(value))
                        .filter((value) => Number.isFinite(value) && value > 0)
                    )
                  }
                />
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.work.position'),
          field: 'position_id',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.position')}
                  value={currentPosition || '--'}
                />
              );
            }

            return (
              <EditRow
                label={t('employees.profile.details.work.position')}
                value={currentPosition}
              >
                <Popover open={openPosition} onOpenChange={setOpenPosition}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="input"
                      role="combobox"
                      aria-expanded={openPosition}
                      className="h-9 w-[180px] justify-between text-sm"
                    >
                      {currentPosition ||
                        t('employees.profile.details.work.selectPosition')}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t(
                          'employees.profile.details.work.searchPosition'
                        )}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('employees.profile.details.work.noPositionFound')}
                        </CommandEmpty>

                        <CommandGroup>
                          {positions?.map((p) => {
                            const id = p?.id ?? p?.value ?? p?.id_setting;
                            const label =
                              resolvePositionDisplayName(p, { preferArabic, positions }) ||
                              p.title_en ||
                              p.name ||
                              '';
                            const isSelected =
                              String(id) === String(work?.position_id);

                            return (
                              <CommandItem
                                key={id || label}
                                value={label}
                                className="flex items-center"
                                onSelect={() => {
                                  onFieldChange('position_id', id);
                                  setOpenPosition(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {label}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.work.shift'),
          field: 'shiftType',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.shift')}
                  value={shiftLabel}
                />
              );
            }

            return (
              <EditRow
                label={t('employees.profile.details.work.shift')}
                value={shiftLabel}
              >
                <Popover open={openShift} onOpenChange={setOpenShift}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="input"
                      role="combobox"
                      aria-expanded={openShift}
                      className="h-9 w-[180px] justify-between text-sm"
                    >
                      {shiftLabel ||
                        t('employees.profile.details.work.selectShift')}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t(
                          'employees.profile.details.work.searchShift'
                        )}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('employees.profile.details.work.noShiftFound')}
                        </CommandEmpty>

                        <CommandGroup>
                          {shifts.map((s) => {
                            const isSelected =
                              Number(s.id) === Number(shiftType);
                            const shiftName =
                              resolveShiftDisplayName(s, { preferArabic }) ||
                              s.name_en ||
                              s.name;

                            return (
                              <CommandItem
                                key={s.id}
                                value={shiftName}
                                className="flex items-center"
                                onSelect={() => {
                                  onFieldChange('shiftType', s.id.toString());
                                  setOpenShift(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {shiftName}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </EditRow>
            );
          },
        },

        !isFreelancer && {
          label: t('employees.profile.details.work.employmentTimeMode'),
          field: 'part_time_type',
          customRender: () => {
            if (!isEditing) {
              return (
                <RowLine
                  label={t('employees.profile.details.work.employmentTimeMode')}
                  value={
                    partTimeMode === 'hours'
                      ? t('common.hours')
                      : t('common.days')
                  }
                />
              );
            }

            return (
              <div className="space-y-2 py-0.5 text-sm">
                <div className="font-medium">
                  {t('employees.profile.details.work.partTimeMode')}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pt_mode"
                      checked={partTimeMode === 'hours'}
                      onChange={() => {
                        onFieldChange('part_time_type', 'hours');
                        onFieldChange('weekly_work_days', []);
                      }}
                    />
                    <span>{t('common.hours')}</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pt_mode"
                      checked={partTimeMode === 'days'}
                      onChange={() => {
                        onFieldChange('part_time_type', 'days');
                      }}
                    />
                    <span>{t('common.days')}</span>
                  </label>
                </div>

                {partTimeMode === 'hours' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="monthlyHours">
                      {t('employees.profile.details.work.monthlyRequiredHours')}
                    </Label>
                    <Input
                      id="monthlyHours"
                      type="number"
                      value={monthlyHours || ''}
                      onChange={(e) =>
                        onFieldChange('monthly_hours_required', e.target.value)
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          },
        },

        !isFreelancer &&
          partTimeMode === 'days' && {
          label: t('employees.profile.details.work.weeklySchedule'),
            field: 'weekly_work_days',
            customRender: () => {
              if (!isEditing) {
                if (weekly.length === 0) {
                  return (
                    <div className="mt-2 rounded-lg border border-gray-200 bg-slate-50 p-3">
                      <p className="text-sm text-gray-500">
                        {t(
                          'employees.profile.details.work.noWorkingDaysScheduled'
                        )}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-slate-50 p-3">
                    {weekly.map((d) => (
                      <div key={normalizeDayKey(d.day)} className="text-gray-600">
                        <RowLine
                          label={
                            t(`common.daysOfWeek.${normalizeDayKey(d.day).toLowerCase()}`) ||
                            normalizeDayKey(d.day)
                          }
                          value={formatRequestTimeRange(d.start_time, d.end_time, i18n.language)}
                        />
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-slate-50 p-3">
                  {weekly.map((d) => (
                    <div
                      key={normalizeDayKey(d.day)}
                      className="flex items-center gap-3 text-xs text-gray-600"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={true}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          let next = [...weekly];

                          if (!checked) {
                            next = next.filter(
                              (day) => normalizeDayKey(day.day) !== normalizeDayKey(d.day)
                            );
                          }

                          onFieldChange('weekly_work_days', sortWeeklyDays(next));
                        }}
                      />

                      <span className="w-20">
                        {t(`common.daysOfWeek.${normalizeDayKey(d.day).toLowerCase()}`) ||
                          normalizeDayKey(d.day)}
                      </span>

                      <input
                        type="time"
                        className="h-8 w-24 rounded border px-2"
                        value={d.start_time || ''}
                        onChange={(e) => {
                          const next = weekly.map((day) =>
                            normalizeDayKey(day.day) === normalizeDayKey(d.day)
                              ? { ...day, start_time: e.target.value }
                              : day
                          );

                          onFieldChange('weekly_work_days', sortWeeklyDays(next));
                        }}
                      />

                      <span>{t('filters.to')}</span>

                      <input
                        type="time"
                        className="h-8 w-24 rounded border px-2"
                        value={d.end_time || ''}
                        onChange={(e) => {
                          const next = weekly.map((day) =>
                            normalizeDayKey(day.day) === normalizeDayKey(d.day)
                              ? { ...day, end_time: e.target.value }
                              : day
                          );

                          onFieldChange('weekly_work_days', sortWeeklyDays(next));
                        }}
                      />
                    </div>
                  ))}

                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <select
                      className="h-8 rounded border px-2 text-sm"
                      onChange={(e) => {
                        const selectedDay = e.target.value;

                        if (selectedDay) {
                          if (
                            !weekly.find(
                              (w) => normalizeDayKey(w.day) === normalizeDayKey(selectedDay)
                            )
                          ) {
                            const newDay = {
                              day: selectedDay,
                              start_time: '09:00',
                              end_time: '17:00',
                            };

                            onFieldChange(
                              'weekly_work_days',
                              sortWeeklyDays([...weekly, newDay])
                            );
                          }

                          e.target.value = '';
                        }
                      }}
                      value=""
                    >
                      <option value="">{t('employees.profile.details.work.addWorkingDay')}</option>

                      {DAYS.filter(
                        (day) =>
                          !weekly.find(
                            (w) => normalizeDayKey(w.day) === normalizeDayKey(day.key)
                          )
                      ).map((day) => (
                        <option key={day.key} value={day.key}>
                          {t(`common.daysOfWeek.${day.key.toLowerCase()}`) ||
                            day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            },
          },

        !isFreelancer &&
          !isEditing &&
          partTimeMode === 'hours' && {
            label: t('employees.profile.details.work.monthlyRequiredHours'),
            field: 'monthly_hours_required',
            customRender: () => (
              <RowLine
                label={t('employees.profile.details.work.monthlyRequiredHours')}
                value={monthlyHours}
              />
            ),
          },
      ].filter(Boolean)}
    />
  );
}
