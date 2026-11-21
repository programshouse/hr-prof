import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DatePickerInput from '@/components/ui/date-picker-input';
import { Form, FormField } from '@/components/forms/Form';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';
import { format, isValid, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { useRemoveEmployeeFromGeneralHoliday } from '../hooks/useRemoveEmployeeFromGeneralHoliday';

/* ---------------- helpers ---------------- */

function toApiDate(value) {
  // supports: Date object OR "dd/MM/yyyy" OR "yyyy-MM-dd"
  if (!value) return '';

  if (value instanceof Date) {
    return isValid(value) ? format(value, 'yyyy-MM-dd') : '';
  }

  // already yyyy-MM-dd
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed1 = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsed1)) return format(parsed1, 'yyyy-MM-dd');

    const parsed2 = parse(value, 'dd/MM/yy', new Date());
    if (isValid(parsed2)) return format(parsed2, 'yyyy-MM-dd');
  }

  return '';
}

/* ---------------- component ---------------- */

export default function AddHolidayModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  holiday = null,
  defaultCountryCode = 'EG',
  year,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
  const [_defaultCountryCode] = useState(defaultCountryCode);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false);
  const [removingEmployeeId, setRemovingEmployeeId] = useState(null);
  const isEdit = Boolean(holiday);
  const removeEmployeeMut = useRemoveEmployeeFromGeneralHoliday(year);

  const form = useForm({
    defaultValues: {
      holidayName: '',
      description: '',
      from: '',
      to: '',
      employee_ids: [],
    },
    shouldUnregister: false,
  });

  // IMPORTANT: init form ONCE per open (prevents infinite loop)
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!open) {
      didInitRef.current = false;
      setEmployeeSearch('');
      setEmployeeSelectOpen(false);
      return;
    }

    // wait until employees are loaded
    if (loadingEmployees) return;

    if (didInitRef.current) return;
    didInitRef.current = true;

    form.reset({
      holidayName:
        holiday?.title_en ||
        holiday?.name ||
        holiday?.localName ||
        '',
      description:
        holiday?.description_en ||
        holiday?.description ||
        '',
      from: holiday?.date_from || holiday?.date || '',
      to: holiday?.date_to || holiday?.date || '',
      employee_ids:
        holiday?.employee_ids?.map((id) => String(id)).filter(Boolean) ||
        holiday?.employees
          ?.map((employee) =>
            String(employee?.employee_id ?? employee?.id ?? employee?.pivot?.employee_id ?? '')
          )
          .filter(Boolean) ||
        [],
    });
  }, [open, loadingEmployees, form, holiday]);

  
  
  const handleSave = form.handleSubmit((values) => {
    const date_from = toApiDate(values.from);
    const date_to = toApiDate(values.to);
    const employeeIds = (values.employee_ids || [])
      .map((id) => String(id))
      .filter(Boolean);

    if (employeeIds.length === 0) {
      toast.error(t('holidays.generalHolidays.modal.selectAtLeastOneEmployee'));
      return;
    }

    if (isEdit) {
      onSubmit?.(
        {
          title_en: values.holidayName?.trim() || '',
          description_en: values.description?.trim() || '',
          date_from,
          date_to: date_to || date_from,
          employee_ids: employeeIds
            .map((id) => Number(id))
            .filter((n) => !Number.isNaN(n)),
        },
        values
      );
      return;
    }

    const fd = new FormData();
    fd.append('title_en', values.holidayName?.trim() || '');
    fd.append('description_en', values.description?.trim() || '');
    fd.append('date_from', date_from);
    fd.append('date_to', date_to || date_from);

    employeeIds.forEach((id) => {
      fd.append('employee_ids[]', id);
    });

    onSubmit?.(fd, values);
  });

  const holidayName = form.watch('holidayName');
  const from = form.watch('from');
  const to = form.watch('to');
  const selectedEmployeeIds = form.watch('employee_ids') || [];

  const selectedEmployees = useMemo(() => {
    const selectedSet = new Set((selectedEmployeeIds || []).map(String));
    return employees.filter((employee) =>
      selectedSet.has(
        String(
          employee?.employee_id ?? employee?.id ?? employee?.user_id ?? employee?.employee?.employee_id ?? employee?.employee?.id ?? ''
        )
      )
    );
  }, [employees, selectedEmployeeIds]);

  const handleRemoveEmployee = (employeeId) => {
    form.setValue(
      'employee_ids',
      (form.getValues('employee_ids') || []).filter((id) => String(id) !== String(employeeId)),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const handleRemoveEmployeeFromHoliday = (employeeId) => {
    if (!holiday?.id || !employeeId) return;

    const normalizedId = String(employeeId);
    setRemovingEmployeeId(normalizedId);

    removeEmployeeMut.mutate(
      { holiday_id: holiday.id, employee_id: Number(employeeId) },
      {
        onSuccess: () => {
          handleRemoveEmployee(employeeId);
          setRemovingEmployeeId(null);
        },
        onError: () => setRemovingEmployeeId(null),
      }
    );
  };

  const openEmployeeSelector = () => setEmployeeSelectOpen(true);

  const getEmployeeCardLabel = (employee) => {
    const code = employee?.employee_code ?? employee?.code ?? employee?.employee?.employee_code ?? employee?.employee?.code ?? '';
    const name = resolveEmployeeDisplayName(employee?.employee ?? employee) || '';
    return code && name ? `${code} - ${name}` : name || code || String(employee?.employee_id ?? employee?.id ?? employee?.user_id ?? employee?.employee?.employee_id ?? employee?.employee?.id ?? '');
  };

  const getEmployeeSubLabel = (employee) => {
    return (
      employee?.position?.name ||
      employee?.position_name ||
      employee?.job_title ||
      employee?.department?.name ||
      employee?.department_name ||
      t('holidays.attendanceEmployees')
    );
  };

  const canSubmit = Boolean(
    holidayName?.trim() &&
      toApiDate(from) &&
      toApiDate(to || from) &&
      selectedEmployeeIds.length > 0
  );

  if (!isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
          <div className="border-b px-4 py-3">
            <DialogHeader className="p-0">
              <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                {t('holidays.generalHolidays.modal.title')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4">
            <div className="space-y-4 rounded-md border p-4 shadow-sm">
              <Form form={form} onSubmit={handleSave}>
                <div className="space-y-4">
                  <FormField
                    name="holidayName"
                    label={t('holidays.generalHolidays.modal.holidayName')}
                    required
                  >
                    {({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('holidays.generalHolidays.modal.holidayNamePlaceholder')}
                        className="h-9"
                      />
                    )}
                  </FormField>

                  <FormField
                    name="description"
                    label={t('holidays.generalHolidays.modal.description')}
                  >
                    {({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('holidays.generalHolidays.modal.descriptionPlaceholder')}
                        className="h-9"
                      />
                    )}
                  </FormField>

                  <FormField name="from" label={t('holidays.generalHolidays.modal.from')} required>
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('holidays.generalHolidays.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-9"
                        buttonClassName="h-9"
                      />
                    )}
                  </FormField>

                  <FormField name="to" label={t('holidays.generalHolidays.modal.to')}>
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('holidays.generalHolidays.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-9"
                        buttonClassName="h-9"
                      />
                    )}
                  </FormField>

                  <FormField
                    name="employee_ids"
                    label={t('holidays.generalHolidays.modal.selectEmployees')}
                    required
                  >
                    {() => (
                      <EmployeeMultiSelectCombobox
                        value={form.watch('employee_ids') || []}
                        onChange={(value) =>
                          form.setValue('employee_ids', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        employees={employees}
                        loading={loadingEmployees}
                        placeholder={t('holidays.generalHolidays.modal.selectEmployeesPlaceholder')}
                        searchPlaceholder={t('holidays.generalHolidays.modal.searchEmployeesPlaceholder')}
                        formatSelectedLabel={(count) =>
                          t('holidays.generalHolidays.modal.selectedEmployeesCount', { count })
                        }
                      />
                    )}
                  </FormField>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    {t('holidays.generalHolidays.modal.cancel')}
                  </Button>
                  <Button type="submit" disabled={!canSubmit || loading}>
                    {loading
                      ? t('holidays.generalHolidays.modal.saving')
                      : t('holidays.generalHolidays.modal.save')}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[760px]">
        <div className="border-b px-4 py-4">
          <DialogHeader className="p-0">
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isEdit
                ? t('holidays.generalHolidays.modal.editTitle')
                : t('holidays.generalHolidays.modal.title')}
            </DialogTitle>
            <p className={isRTL ? 'text-right text-sm text-muted-foreground' : 'text-left text-sm text-muted-foreground'}>
              {t('holidays.generalHolidays.modal.description')}
            </p>
          </DialogHeader>
        </div>

        <div className="p-5">
          <Form form={form} onSubmit={handleSave}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField name="holidayName" label={t('holidays.generalHolidays.modal.holidayName')} required>
                      {({ field }) => (
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('holidays.generalHolidays.modal.holidayNamePlaceholder')}
                          className="h-11"
                        />
                      )}
                    </FormField>
                  </div>

                  <FormField name="from" label={t('holidays.generalHolidays.modal.from')} required>
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('holidays.generalHolidays.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-11"
                        buttonClassName="h-11"
                      />
                    )}
                  </FormField>

                  <FormField name="to" label={t('holidays.generalHolidays.modal.to')}>
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('holidays.generalHolidays.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-11"
                        buttonClassName="h-11"
                      />
                    )}
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField name="description" label={t('holidays.generalHolidays.modal.description')}>
                      {({ field }) => (
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('holidays.generalHolidays.modal.descriptionPlaceholder')}
                          className="h-11"
                        />
                      )}
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {t('holidays.generalHolidays.modal.manageEmployeesTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('holidays.generalHolidays.modal.manageEmployeesDescription')}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={openEmployeeSelector}>
                    {t('holidays.generalHolidays.modal.addEmployeeButton')}
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    onFocus={openEmployeeSelector}
                    placeholder={t('holidays.generalHolidays.modal.searchEmployeesInputPlaceholder')}
                    className="h-11"
                  />
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {selectedEmployees.length > 0
                      ? t('holidays.generalHolidays.modal.selectedEmployeesCount', { count: selectedEmployees.length })
                      : t('holidays.generalHolidays.modal.noEmployeesSelected')}
                  </div>
                </div>

                <div className="mt-4">
                  <FormField
                    name="employee_ids"
                    label={t('holidays.generalHolidays.modal.selectEmployees')}
                    required
                  >
                    {() => (
                      <EmployeeMultiSelectCombobox
                        value={form.watch('employee_ids') || []}
                        onChange={(value) =>
                          form.setValue('employee_ids', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        employees={employees}
                        loading={loadingEmployees}
                        placeholder={t('holidays.generalHolidays.modal.selectEmployeesPlaceholder')}
                        searchPlaceholder={t('holidays.generalHolidays.modal.searchEmployeesPlaceholder')}
                        formatSelectedLabel={(count) =>
                          t('holidays.generalHolidays.modal.selectedEmployeesCount', { count })
                        }
                        searchQuery={employeeSearch}
                        onSearchQueryChange={setEmployeeSearch}
                        open={employeeSelectOpen}
                        onOpenChange={setEmployeeSelectOpen}
                        excludeIds={selectedEmployeeIds}
                        selectedEmployeesClassName="h-24 content-start overflow-y-auto pr-1"
                        hideRemoveButtons
                        hideClearAll
                      />
                    )}
                  </FormField>
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="mt-4 h-80 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    {selectedEmployees.map((employee) => (
                      <div
                        key={String(employee?.employee_id ?? employee?.id ?? employee?.user_id ?? '')}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {String(employee?.employee_code ?? employee?.code ?? '') || 'E'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">
                              {getEmployeeCardLabel(employee)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getEmployeeSubLabel(employee)}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={
                            removeEmployeeMut.isPending &&
                            removingEmployeeId ===
                              String(employee?.employee_id ?? employee?.id ?? employee?.user_id ?? '')
                          }
                          onClick={() =>
                            handleRemoveEmployeeFromHoliday(
                              employee?.employee_id ?? employee?.id ?? employee?.user_id
                            )
                          }
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title={t('holidays.generalHolidays.modal.removeEmployee')}
                        >
                          <UserMinus className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('holidays.generalHolidays.modal.cancel')}
                </Button>
                <Button type="submit" disabled={!canSubmit || loading}>
                  {loading
                    ? t('holidays.generalHolidays.modal.saving')
                    : isEdit
                      ? t('holidays.generalHolidays.modal.update')
                      : t('holidays.generalHolidays.modal.save')}
                </Button>
              </div>
            </div>
          </Form>
          </div>
        </DialogContent>
    </Dialog>
  );
}
