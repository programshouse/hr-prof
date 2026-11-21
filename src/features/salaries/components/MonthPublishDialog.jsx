import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Building2,
  Users,
  AlertCircle,
  Send,
  Search,
  ChevronsUpDown,
  X,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import DatePickerInput from '@/components/ui/date-picker-input';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import { useAllDepartments } from '@/shared/hooks';
import axiosClient from '@/services/http/axiosClient';
import { cn } from '@/lib/utils';

// Helper for department label
const getDeptLabel = (dept, isRTL) => {
  if (!dept) return '';
  if (isRTL) {
    return (
      dept.name_ar ||
      dept.title_ar ||
      dept.title ||
      dept.name ||
      dept.name_en ||
      dept.title_en ||
      ''
    );
  }
  return (
    dept.name_en ||
    dept.title_en ||
    dept.title ||
    dept.name ||
    dept.name_ar ||
    dept.title_ar ||
    ''
  );
};

// Department Multi-Select Component
function DepartmentMultiSelect({
  departments = [],
  selectedIds = [],
  onChange,
  disabled = false,
  isRTL = false,
  t,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredDepts = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase().trim();
    return departments.filter((d) =>
      getDeptLabel(d, isRTL).toLowerCase().includes(q)
    );
  }, [departments, search, isRTL]);

  const isAllSelected = selectedIds.length === 0;

  const handleToggle = (idStr) => {
    if (selectedIds.includes(idStr)) {
      const next = selectedIds.filter((id) => id !== idStr);
      onChange(next);
    } else {
      onChange([...selectedIds, idStr]);
    }
  };

  const handleSelectAll = () => {
    onChange([]);
  };

  const handleRemove = (idStr) => {
    onChange(selectedIds.filter((id) => id !== idStr));
  };

  const selectedDepts = useMemo(() => {
    return departments.filter((d) => selectedIds.includes(String(d.id)));
  }, [departments, selectedIds]);

  const triggerLabel = useMemo(() => {
    if (isAllSelected) {
      return t(
        'salaries.allDepartmentsAndCompanies',
        'All Departments / All Companies'
      );
    }
    if (selectedDepts.length === 1) {
      return getDeptLabel(selectedDepts[0], isRTL);
    }
    if (selectedDepts.length === 2) {
      return selectedDepts.map((d) => getDeptLabel(d, isRTL)).join(', ');
    }
    return isRTL
      ? `${selectedDepts.length} أقسام محددة`
      : `${selectedDepts.length} departments selected`;
  }, [isAllSelected, selectedDepts, isRTL, t]);

  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-10 w-full justify-between font-normal text-start px-3 bg-white"
          >
            <span
              className={cn(
                'truncate text-sm',
                isAllSelected
                  ? 'text-muted-foreground'
                  : 'text-foreground font-medium'
              )}
            >
              {triggerLabel}
            </span>
            <div className="flex items-center gap-1 ms-2 shrink-0">
              {!isAllSelected && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  className="rounded-full p-0.5 hover:bg-slate-200 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={isRTL ? 'إلغاء التحديد' : 'Clear selection'}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] min-w-[280px] p-0"
          align="start"
        >
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search', 'Search...')}
                className="h-8 ps-8 text-xs"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1 text-sm">
            {/* All Departments / Companies option */}
            <div
              role="button"
              tabIndex={0}
              onClick={handleSelectAll}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm cursor-pointer select-none text-xs transition-colors',
                isAllSelected
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'hover:bg-slate-100 text-foreground'
              )}
            >
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className="pointer-events-none"
              />
              <span className="truncate">
                {t(
                  'salaries.allDepartmentsAndCompanies',
                  'All Departments / All Companies'
                )}
              </span>
            </div>

            <div className="my-1 border-b" />

            {/* Department rows */}
            {filteredDepts.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                {t('common.noResults', 'No departments found')}
              </div>
            ) : (
              filteredDepts.map((dept) => {
                const idStr = String(dept.id);
                const isSelected = selectedIds.includes(idStr);
                return (
                  <div
                    key={dept.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggle(idStr)}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm cursor-pointer select-none text-xs transition-colors',
                      isSelected
                        ? 'bg-slate-100 font-medium text-foreground'
                        : 'hover:bg-slate-50 text-foreground'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(idStr)}
                      className="pointer-events-none"
                    />
                    <span className="truncate">{getDeptLabel(dept, isRTL)}</span>
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected department badges */}
      {selectedDepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {selectedDepts.map((dept) => (
            <Badge
              key={dept.id}
              variant="secondary"
              className="flex items-center gap-1 pe-1 ps-2 py-0.5 text-xs font-normal bg-slate-100 text-slate-800 border-slate-200"
            >
              <span className="max-w-[150px] truncate">{getDeptLabel(dept, isRTL)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(String(dept.id));
                }}
                className="rounded-full p-0.5 hover:bg-slate-200 focus:outline-none"
                aria-label={`Remove ${getDeptLabel(dept, isRTL)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] text-muted-foreground hover:text-foreground underline ms-1"
          >
            {isRTL ? 'إلغاء التحديد (الكل)' : 'Clear (All)'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MonthPublishDialog({
  open,
  onOpenChange,
  onConfirm,
  onLockAndPublish,
  missingMonthRecord = false,
  publishError = null,
  loading = false,
  year,
  month,
  date,
  companyId = 1,
  currentDepartmentId,
  monthLabel,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const dir = isRTL ? 'rtl' : 'ltr';

  // Calculate number of days in the specified month
  const daysInMonth = useMemo(() => {
    const y = year || (date ? date.getFullYear() : new Date().getFullYear());
    const m = month || (date ? date.getMonth() + 1 : new Date().getMonth() + 1);
    return new Date(y, m, 0).getDate();
  }, [year, month, date]);

  // Options for day of month dropdown (1 to daysInMonth)
  const dayOptions = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Initial default day
  const defaultDay = useMemo(() => {
    const now = new Date();
    const currentYear = date ? date.getFullYear() : year;
    const currentMonth = date ? date.getMonth() + 1 : month;

    if (now.getFullYear() === currentYear && now.getMonth() + 1 === currentMonth) {
      return now.getDate();
    }
    return daysInMonth || 1;
  }, [year, month, date, daysInMonth]);

  // Initial default date in ISO format YYYY-MM-DD
  const defaultIsoDate = useMemo(() => {
    const y = year || (date ? date.getFullYear() : new Date().getFullYear());
    const m = String(month || (date ? date.getMonth() + 1 : new Date().getMonth() + 1)).padStart(2, '0');
    const d = String(defaultDay).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [year, month, date, defaultDay]);

  const [day, setDay] = useState(defaultDay);
  const [isoDate, setIsoDate] = useState(defaultIsoDate);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState(
    currentDepartmentId && currentDepartmentId !== 'all'
        ? [String(currentDepartmentId)]
        : []
  );
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [exceptEmployees, setExceptEmployees] = useState([]);

  // Fetch departments list
  const { data: departments = [] } = useAllDepartments({ enabled: open });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDay(defaultDay);
      setIsoDate(defaultIsoDate);
        setSelectedDepartmentIds(
          currentDepartmentId && currentDepartmentId !== 'all'
              ? [String(currentDepartmentId)]
              : []
        );
      setExceptEmployees([]);
    }
  }, [open, defaultDay, defaultIsoDate, currentDepartmentId]);

  // Fetch department-scoped employees via GET /list?department_id=...
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchEmployeesForDepartments = async () => {
      setIsEmployeesLoading(true);
      try {
        let employees = [];

        if (selectedDepartmentIds.length === 1) {
          // Exactly one department selected: GET /list?department_id=3
          const res = await axiosClient.get('/list', {
            params: { department_id: selectedDepartmentIds[0] },
          });
          const list =
            res?.data?.employees ??
            res?.data?.data?.employees ??
            res?.data?.data ??
            [];
          employees = Array.isArray(list) ? list : [];
        } else if (selectedDepartmentIds.length > 1) {
          // Multiple departments selected: fetch each and combine unique employees
          const responses = await Promise.all(
            selectedDepartmentIds.map((deptId) =>
              axiosClient
                .get('/list', { params: { department_id: deptId } })
                .catch((err) => {
                  console.error(
                    `Failed to load employees for department ${deptId}:`,
                    err
                  );
                  return null;
                })
            )
          );

          const empMap = new Map();
          responses.forEach((res) => {
            const list =
              res?.data?.employees ??
              res?.data?.data?.employees ??
              res?.data?.data ??
              [];
            if (Array.isArray(list)) {
              list.forEach((emp) => {
                const id =
                  emp?.employee_id ??
                  emp?.id ??
                  emp?.user_id ??
                  emp?.employee?.employee_id ??
                  emp?.employee?.id;
                if (id != null && !empMap.has(String(id))) {
                  empMap.set(String(id), emp);
                }
              });
            }
          });
          employees = Array.from(empMap.values());
        } else {
          // All departments: GET /list
          const res = await axiosClient.get('/list');
          const list =
            res?.data?.employees ??
            res?.data?.data?.employees ??
            res?.data?.data ??
            [];
          employees = Array.isArray(list) ? list : [];
        }

        if (!cancelled) {
          setDepartmentEmployees(employees);

          // Clean up exceptEmployees if any are no longer in the fetched list
          if (selectedDepartmentIds.length > 0) {
            const validIds = new Set(
              employees.map((emp) =>
                String(
                  emp?.employee_id ??
                  emp?.id ??
                  emp?.user_id ??
                  emp?.employee?.employee_id ??
                  emp?.employee?.id
                )
              )
            );
            setExceptEmployees((prev) =>
              prev.filter((id) => validIds.has(String(id)))
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch department employees:', err);
        if (!cancelled) {
          setDepartmentEmployees([]);
        }
      } finally {
        if (!cancelled) {
          setIsEmployeesLoading(false);
        }
      }
    };

    fetchEmployeesForDepartments();

    return () => {
      cancelled = true;
    };
  }, [open, JSON.stringify(selectedDepartmentIds)]);

  // Keep day and isoDate synchronized
  const handleDaySelect = (selectedDayValue) => {
    const d = Number(selectedDayValue);
    setDay(d);

    const y = year || (date ? date.getFullYear() : new Date().getFullYear());
    const m = String(month || (date ? date.getMonth() + 1 : new Date().getMonth() + 1)).padStart(2, '0');
    const paddedD = String(d).padStart(2, '0');
    setIsoDate(`${y}-${m}-${paddedD}`);
  };

  const handleDateChange = (newIso) => {
    setIsoDate(newIso);
    if (newIso) {
      const parts = newIso.split('-');
      if (parts[2]) {
        const d = Number(parts[2]);
        if (d >= 1 && d <= daysInMonth) {
          setDay(d);
        }
      }
    }
  };

    const getPublishPayload = () => {
      const payload = {
        day,
        publish_day: day,
        publish_date: isoDate,
        date: isoDate,
        company_id: companyId ? Number(companyId) : 1,
        companyId: companyId ? Number(companyId) : 1,
        except_employee_ids: exceptEmployees.map(Number).filter((id) => !isNaN(id)),
        exceptEmployees,
    };

    if(selectedDepartmentIds.length === 1) {
      payload.department_id = Number(selectedDepartmentIds[0]);
  payload.departmentId = selectedDepartmentIds[0];
  payload.department_ids = [Number(selectedDepartmentIds[0])];
  payload.departmentIds = [selectedDepartmentIds[0]];
} else if (selectedDepartmentIds.length > 1) {
  payload.department_ids = selectedDepartmentIds.map(Number);
  payload.departmentIds = selectedDepartmentIds;
  payload.department_id = Number(selectedDepartmentIds[0]);
  payload.departmentId = selectedDepartmentIds[0];
}

return payload;
  };

const handleConfirm = () => onConfirm?.(getPublishPayload());
const handleLockAndPublish = () => onLockAndPublish?.(getPublishPayload());

return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent dir={dir} className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
          <Send className="h-5 w-5 text-primary" />
          {t('salaries.publishMonthTitle', 'Publish Month Payroll')}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {t(
            'salaries.publishDialogDescription',
            'Publish salaries for {{month}}. Select the day, department/company, and exclude employees if needed.',
            { month: monthLabel }
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Day & Date Selection */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{t('salaries.publishDay', 'Publish Day')}</span>
            <span className="text-destructive">*</span>
          </Label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <Select
                value={String(day)}
                onValueChange={handleDaySelect}
                disabled={loading}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue
                    placeholder={t('salaries.publishChooseDay', 'Choose Day')}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {dayOptions.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {isRTL ? `اليوم ${d}` : `Day ${d}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <DatePickerInput
                value={isoDate}
                onChange={handleDateChange}
                placeholder="YYYY-MM-DD"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Department (Company) Multi-Select */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Building2 className="h-4 w-4 text-slate-500" />
            <span>{t('salaries.publishDepartment', 'Department (Company)')}</span>
          </Label>

            <DepartmentMultiSelect
            departments={departments}
            selectedIds={selectedDepartmentIds}
            onChange={setSelectedDepartmentIds}
            disabled={loading}
          isRTL={isRTL}
          t={t}
            />

          <p className="text-[11px] text-muted-foreground">
            {isRTL
            ? 'يمكنك اختيار قسم أو عدة أقسام، أو تركها لكل الأقسام'
                : 'Choose one or multiple departments, or leave for all departments'}
          </p>
        </div>

        {/* Except Employees Selection (scoped to selected department(s)) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Users className="h-4 w-4 text-slate-500" />
              <span>{t('salaries.exceptEmployees', 'Except Employees')}</span>
            </Label>
            {exceptEmployees.length > 0 && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {isRTL
                  ? `مستثنى: ${exceptEmployees.length}`
                  : `Excluded: ${exceptEmployees.length}`}
              </span>
            )}
          </div>

          <EmployeeMultiSelectCombobox
            dir={dir}
            value={exceptEmployees}
            onChange={setExceptEmployees}
            employees={departmentEmployees}
            loading={isEmployeesLoading}
            placeholder={
              isEmployeesLoading
                ? (isRTL ? 'جاري تحميل موظفي القسم...' : 'Loading department employees...')
                : t(
                  'salaries.exceptEmployeesPlaceholder',
                  'Select employees to exclude...'
                )
            }
            searchPlaceholder={t(
              'salaries.exceptEmployeesSearch',
              'Search employees to exclude...'
            )}
            disabled={loading || isEmployeesLoading}
          />

          <p className="text-[11px] text-muted-foreground">
            {isRTL
                ? selectedDepartmentIds.length > 0
            ? 'يتم عرض موظفي الأقسام المحددة فقط للاستثناء'
            : 'يمكنك استثناء موظفين محددين من النشر لهذا الشهر'
                : selectedDepartmentIds.length > 0
            ? 'Showing only employees of the selected department(s) to exclude'
                  : 'You can exclude specific employees from publishing this month'}
          </p>
        </div>

        {missingMonthRecord && (
          <div role="alert" className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            <p className="font-semibold">
              {isRTL
                ? 'سجل الشهر غير موجود. يجب قفل هذا الشهر قبل نشر المرتبات.'
                : 'The month record is missing. Lock this month before publishing payroll.'}
            </p>
            <p className="text-xs">
              {isRTL
                ? 'تحذير: قفل الشهر يمنع تعديل بياناته بعد ذلك. اضغط على «قفل الشهر ثم النشر» فقط إذا كنت متأكدًا.'
                : 'Warning: locking this month prevents further edits. Only select “Lock Month & Publish” if you are sure.'}
            </p>
          </div>
        )}

        {publishError && !missingMonthRecord && (
          <div role="alert" className="space-y-1.5 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-900">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="size-4 text-red-600 shrink-0" />
              {publishError}
            </p>
            {/no employees match/i.test(publishError) && (
              <div className="space-y-1 text-[11px] text-red-800">
                <p className="font-medium">
                  {isRTL
                    ? 'أسباب محتملة:'
                    : 'Possible reasons:'}
                </p>
                <ul className="list-disc ps-4 space-y-0.5">
                  <li>
                    {isRTL
                      ? 'قد تكون رواتب هذا الشهر منشورة بالفعل لجميع الموظفين.'
                      : 'Salaries for this month may already be published for all employees.'}
                  </li>
                  <li>
                    {isRTL
                    ? 'يوم النشر المحدد لا يطابق يوم رواتب الموظفين (جرب يوم 25).'
                        : 'The selected publish day does not match employee payroll day (try day 25).'}
                  </li>
                  <li>
                    {isRTL
                      ? 'القسم المحدد أو الموظفون المستثنون لم يتركوا أي موظف مؤهل للنشر.'
                      : 'The selected department or excluded employees left no eligible employees to publish.'}
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Warning / Notice */}
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p>
              {t(
                'salaries.publishMonthWarning',
                'After publishing, salaries for this period will become visible to employees.'
              )}
            </p>
            <p className="text-[11px] text-amber-700">
              {t(
                'salaries.publishMonthLockNote',
                'Note: The month must be locked first using the Lock button before it can be published.'
              )}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          {t('common.cancel', 'Cancel')}
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={missingMonthRecord ? handleLockAndPublish : handleConfirm}
          disabled={loading || !day || !isoDate}
        >
          <Send className="me-1.5 h-4 w-4" />
          {loading
            ? t('salaries.publishingMonth', 'Publishing...')
            : missingMonthRecord
              ? (isRTL ? 'قفل الشهر ثم النشر' : 'Lock Month & Publish')
              : t('salaries.confirmPublish', 'Confirm & Publish')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
}
