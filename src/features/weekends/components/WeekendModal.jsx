import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { UserMinus } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DatePickerInput from '@/components/ui/date-picker-input';
import { Form, FormField } from '@/components/forms/Form';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';
import { useCreateWeekend, useUpdateWeekend, useRemoveWeekendEmployees } from '../hooks/useWeekendMutations';

const schema = z.object({
  date_from: z.string().min(1),
  date_to: z.string().optional(),
  employee_ids: z.array(z.string()).min(1),
});

const getNestedEmployee = (value) =>
  value?.employee ?? value?.employee_data ?? value?.user ?? value?.applicant ?? value ?? null;

const getEmployeeId = (value) => {
  if (!value || typeof value !== 'object') return null;

  const nested = getNestedEmployee(value);

  return (
    value?.employee_id ??
    value?.id ??
    value?.user_id ??
    value?.pivot?.employee_id ??
    nested?.employee_id ??
    nested?.id ??
    nested?.user_id ??
    null
  );
};

const toEmployeeIds = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];

    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [raw];
      } catch {
        return [raw];
      }
    }

    return [raw];
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  return [];
};

const getWeekendEmployeeIds = (weekend) => {
  const direct =
    weekend?.employee_id ??
    weekend?.employee_ids ??
    weekend?.employees_ids ??
    weekend?.employees_id ??
    weekend?.employeeIds ??
    weekend?.employeesIds ??
    null;

  const ids = toEmployeeIds(direct);

  if (ids.length) {
    return ids;
  }

  if (Array.isArray(weekend?.employees) && weekend.employees.length) {
    return weekend.employees
      .map((employee) => String(getEmployeeId(employee) ?? ''))
      .filter(Boolean);
  }

  return [];
};

export default function WeekendModal({ open, onOpenChange, weekend = null }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const isRTL = isArabic;
  const dir = isArabic ? 'rtl' : 'ltr';
  const isEdit = Boolean(weekend);

  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
  const createMut = useCreateWeekend();
  const updateMut = useUpdateWeekend();
  const removeEmployeeMut = useRemoveWeekendEmployees();

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false);
  const [removingEmployeeId, setRemovingEmployeeId] = useState(null);

  const defaultValues = useMemo(
    () => ({
      date_from: '',
      date_to: '',
      employee_ids: [],
    }),
    []
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    shouldUnregister: false,
  });

  const didInitRef = useRef(false);

  useEffect(() => {
    if (!open) {
      didInitRef.current = false;
      setEmployeeSearch('');
      setEmployeeSelectOpen(false);
      return;
    }

    if (loadingEmployees) return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    form.reset({
      date_from: weekend?.date_from || '',
      date_to: weekend?.date_to || '',
      employee_ids: isEdit ? getWeekendEmployeeIds(weekend) : [],
    });
  }, [open, loadingEmployees, form, weekend, isEdit, defaultValues]);

  const isPending = createMut.isPending || updateMut.isPending;

  const handleSubmit = form.handleSubmit((values) => {
    const date_from = values.date_from;
    const date_to = values.date_to || values.date_from;
    const employee_ids = (values.employee_ids || [])
      .map((id) => Number(id))
      .filter((n) => !Number.isNaN(n));

    if (employee_ids.length === 0) {
      toast.error(t('weekends.modal.selectAtLeastOneEmployee'));
      return;
    }

    const payload = { date_from, date_to, employee_ids };

    if (isEdit) {
      updateMut.mutate(
        { id: weekend.id, ...payload },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }

    createMut.mutate(payload, { onSuccess: () => onOpenChange(false) });
  });

  const dateFrom = form.watch('date_from');
  const dateTo = form.watch('date_to');
  const selectedEmployeeIds = form.watch('employee_ids') || [];

  const selectedEmployees = useMemo(() => {
    const selectedSet = new Set((selectedEmployeeIds || []).map(String));
    return employees.filter((employee) =>
      selectedSet.has(
        String(
          employee?.employee_id ??
            employee?.id ??
            employee?.user_id ??
            employee?.employee?.employee_id ??
            employee?.employee?.id ??
            ''
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

  const handleRemoveEmployeeFromWeekend = (employeeId) => {
    if (!weekend?.id || !employeeId) return;

    const normalizedId = String(employeeId);
    setRemovingEmployeeId(normalizedId);

    removeEmployeeMut.mutate(
      { weekend_id: weekend.id, employee_ids: [employeeId] },
      {
        onSuccess: (result) => {
          if (result?.removedCount) {
            handleRemoveEmployee(employeeId);
          }
          setRemovingEmployeeId(null);
        },
        onError: () => setRemovingEmployeeId(null),
      }
    );
  };

  const openEmployeeSelector = () => setEmployeeSelectOpen(true);

  const getEmployeeCardLabel = (employee) => {
    const code =
      employee?.employee_code ??
      employee?.code ??
      employee?.employee?.employee_code ??
      employee?.employee?.code ??
      '';
    const name = resolveEmployeeDisplayName(employee?.employee ?? employee) || '';
    return (
      code && name
        ? `${code} - ${name}`
        : name ||
            code ||
            String(
              employee?.employee_id ??
                employee?.id ??
                employee?.user_id ??
                employee?.employee?.employee_id ??
                employee?.employee?.id ??
                ''
            )
    );
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
    dateFrom && (dateTo || dateFrom) && selectedEmployeeIds.length > 0 && !isPending
  );

  if (!isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir={dir}
          className={`overflow-hidden p-0 sm:max-w-[520px] ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}`}
        >
          <div className="border-b px-4 py-3">
            <DialogHeader className={`p-0 ${isArabic ? 'items-end text-right' : 'items-start text-left'}`}>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('weekends.modal.title')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4">
            <div className="space-y-4 rounded-md border p-4 shadow-sm">
              <Form form={form} onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField name="date_from" label={t('weekends.modal.from')} required>
                      {({ field }) => (
                        <DatePickerInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('weekends.modal.datePlaceholder')}
                          className="w-full"
                          inputClassName="h-9"
                          buttonClassName="h-9"
                        />
                      )}
                    </FormField>

                    <FormField name="date_to" label={t('weekends.modal.to')}>
                      {({ field }) => (
                        <DatePickerInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('weekends.modal.datePlaceholder')}
                          className="w-full"
                          inputClassName="h-9"
                          buttonClassName="h-9"
                        />
                      )}
                    </FormField>
                  </div>

                  <FormField name="employee_ids" label={t('weekends.modal.employees')} required>
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
                        placeholder={t('weekends.modal.selectEmployees')}
                        searchPlaceholder={t('weekends.modal.searchEmployees')}
                        formatSelectedLabel={(count) => t('weekends.modal.selectedCount', { count })}
                      />
                    )}
                  </FormField>
                </div>

                <div className={isArabic ? 'flex justify-start gap-2 pt-4' : 'flex justify-end gap-2 pt-4'}>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    {t('weekends.modal.cancel')}
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    {isPending ? t('weekends.modal.saving') : t('weekends.modal.save')}
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
      <DialogContent
        dir={dir}
        className={`overflow-hidden p-0 sm:max-w-[760px] ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}`}
      >
        <div className="border-b px-4 py-4">
          <DialogHeader className={`p-0 ${isArabic ? 'items-end text-right' : 'items-start text-left'}`}>
            <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
              {t('weekends.modal.editTitle')}
            </DialogTitle>
            <p
              className={
                isRTL
                  ? 'text-right text-sm text-muted-foreground'
                  : 'text-left text-sm text-muted-foreground'
              }
            >
              {t('weekends.modal.editDescription')}
            </p>
          </DialogHeader>
        </div>

        <div className="p-5">
          <Form form={form} onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField name="date_from" label={t('weekends.modal.from')} required>
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('weekends.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-11"
                        buttonClassName="h-11"
                      />
                    )}
                  </FormField>

                  <FormField name="date_to" label={t('weekends.modal.to')}>
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('weekends.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-11"
                        buttonClassName="h-11"
                      />
                    )}
                  </FormField>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {t('weekends.modal.manageEmployeesTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('weekends.modal.manageEmployeesDescription')}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={openEmployeeSelector}>
                    {t('weekends.modal.addEmployeeButton')}
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    onFocus={openEmployeeSelector}
                    placeholder={t('weekends.modal.searchEmployeesInputPlaceholder')}
                    className="h-11"
                  />
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {selectedEmployees.length > 0
                      ? t('weekends.modal.selectedCount', { count: selectedEmployees.length })
                      : t('weekends.modal.noEmployeesSelected')}
                  </div>
                </div>

                <div className="mt-4">
                  <FormField name="employee_ids" label={t('weekends.modal.employees')} required>
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
                        placeholder={t('weekends.modal.selectEmployees')}
                        searchPlaceholder={t('weekends.modal.searchEmployees')}
                        formatSelectedLabel={(count) => t('weekends.modal.selectedCount', { count })}
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
                        key={String(
                          employee?.employee_id ?? employee?.id ?? employee?.user_id ?? ''
                        )}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
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
                            handleRemoveEmployeeFromWeekend(
                              employee?.employee_id ?? employee?.id ?? employee?.user_id
                            )
                          }
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title={t('weekends.modal.removeEmployee')}
                        >
                          <UserMinus className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={isArabic ? 'flex justify-start gap-2 pt-4' : 'flex justify-end gap-2 pt-4'}>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('weekends.modal.cancel')}
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {isPending ? t('weekends.modal.saving') : t('weekends.modal.update')}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
