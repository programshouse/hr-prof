import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UserMinus } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DatePickerInput from '@/components/ui/date-picker-input';
import { Form, FormField } from '@/components/forms/Form';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

import {
  getOfficialHolidayEmployeeId,
  getOfficialHolidayEmployeeIds,
  toDateOnly,
} from './officialHolidayAttendanceUtils';
import {
  useCreateOfficialHolidayAttendance,
  useUpdateOfficialHolidayAttendance,
} from '../hooks/useOfficialHolidayAttendances';

export default function OfficialHolidayAttendanceModal({
  open,
  onOpenChange,
  attendance = null,
  companyId = 1,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const isEdit = Boolean(attendance?.id);

  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
  const createMutation = useCreateOfficialHolidayAttendance();
  const updateMutation = useUpdateOfficialHolidayAttendance();

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      start_date: '',
      end_date: '',
      employee_ids: [],
      notes: '',
    },
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

    if (loadingEmployees || didInitRef.current) return;
    didInitRef.current = true;

    form.reset({
      start_date: toDateOnly(attendance?.start_date),
      end_date: toDateOnly(attendance?.end_date),
      employee_ids: isEdit ? getOfficialHolidayEmployeeIds(attendance) : [],
      notes: attendance?.notes || '',
    });
  }, [attendance, form, isEdit, loadingEmployees, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');
  const selectedEmployeeIds = form.watch('employee_ids');

  const selectedEmployees = useMemo(() => {
    const selectedSet = new Set((selectedEmployeeIds || []).map(String));

    return employees.filter((employee) => {
      const employeeId = getOfficialHolidayEmployeeId(employee);
      return employeeId != null && selectedSet.has(String(employeeId));
    });
  }, [employees, selectedEmployeeIds]);

  const canSubmit = Boolean(
    startDate && endDate && (selectedEmployeeIds?.length || 0) > 0 && !isPending
  );

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.start_date || !values.end_date) {
      toast.error(t('officialHolidayAttendance.validation.datesRequired'));
      return;
    }

    if (values.end_date < values.start_date) {
      toast.error(t('officialHolidayAttendance.validation.endBeforeStart'));
      return;
    }

    const employee_ids = (values.employee_ids || [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!employee_ids.length) {
      toast.error(t('officialHolidayAttendance.validation.employeeRequired'));
      return;
    }

    const payload = {
      employee_ids,
      start_date: values.start_date,
      end_date: values.end_date,
      notes: String(values.notes || '').trim(),
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: attendance.id, ...payload },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
      return;
    }

    createMutation.mutate(
      {
        ...payload,
        company_id: Number(companyId) || 1,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  });

  const removeSelectedEmployee = (employeeId) => {
    form.setValue(
      'employee_ids',
      (form.getValues('employee_ids') || []).filter(
        (id) => String(id) !== String(employeeId)
      ),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const getEmployeeLabel = (employee) => {
    const source = employee?.employee ?? employee;
    const code = source?.employee_code ?? source?.code ?? '';
    const name = resolveEmployeeDisplayName(source, { preferArabic: isArabic });

    if (code && name) return `${code} - ${name}`;
    return name || String(code || getOfficialHolidayEmployeeId(employee) || '—');
  };

  const getEmployeeSubLabel = (employee) => {
    const source = employee?.employee ?? employee;

    return (
      source?.position?.name_ar ||
      source?.position?.name_en ||
      source?.position?.name ||
      source?.position_name ||
      source?.job_title ||
      source?.department?.name_ar ||
      source?.department?.name_en ||
      source?.department?.name ||
      source?.department_name ||
      t('officialHolidayAttendance.modal.employeeFallbackRole')
    );
  };

  if (!isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir={dir}
          className={`overflow-hidden p-0 sm:max-w-[560px] ${
            isArabic
              ? 'text-right [&>button]:left-4 [&>button]:right-auto'
              : 'text-left'
          }`}
        >
          <div className="border-b px-4 py-3">
            <DialogHeader
              className={`p-0 ${isArabic ? 'items-end text-right' : 'items-start text-left'}`}
            >
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('officialHolidayAttendance.modal.createTitle')}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4">
            <div className="space-y-4 rounded-md border p-4 shadow-sm">
              <Form form={form} onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      name="start_date"
                      label={t('officialHolidayAttendance.modal.from')}
                      required
                    >
                      {({ field }) => (
                        <DatePickerInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('officialHolidayAttendance.modal.datePlaceholder')}
                          className="w-full"
                          inputClassName="h-9"
                          buttonClassName="h-9"
                        />
                      )}
                    </FormField>

                    <FormField
                      name="end_date"
                      label={t('officialHolidayAttendance.modal.to')}
                      required
                    >
                      {({ field }) => (
                        <DatePickerInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('officialHolidayAttendance.modal.datePlaceholder')}
                          className="w-full"
                          inputClassName="h-9"
                          buttonClassName="h-9"
                        />
                      )}
                    </FormField>
                  </div>

                  <FormField
                    name="employee_ids"
                    label={t('officialHolidayAttendance.modal.employees')}
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
                        placeholder={t('officialHolidayAttendance.modal.selectEmployees')}
                        searchPlaceholder={t('officialHolidayAttendance.modal.searchEmployees')}
                        formatSelectedLabel={(count) =>
                          t('officialHolidayAttendance.modal.selectedCount', { count })
                        }
                      />
                    )}
                  </FormField>

                  <FormField
                    name="notes"
                    label={t('officialHolidayAttendance.modal.notes')}
                  >
                    {({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('officialHolidayAttendance.modal.notesPlaceholder')}
                        className="h-9"
                      />
                    )}
                  </FormField>
                </div>

                <div
                  className={
                    isArabic
                      ? 'flex justify-start gap-2 pt-4'
                      : 'flex justify-end gap-2 pt-4'
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    {t('officialHolidayAttendance.modal.cancel')}
                  </Button>

                  <Button type="submit" disabled={!canSubmit}>
                    {isPending
                      ? t('officialHolidayAttendance.modal.saving')
                      : t('officialHolidayAttendance.modal.save')}
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
        className={`overflow-hidden p-0 sm:max-w-[760px] ${
          isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'
        }`}
      >
        <div className="border-b px-4 py-4">
          <DialogHeader
            className={`p-0 ${isArabic ? 'items-end text-right' : 'items-start text-left'}`}
          >
            <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
              {t('officialHolidayAttendance.modal.editTitle')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t('officialHolidayAttendance.modal.editDescription')}
            </p>
          </DialogHeader>
        </div>

        <div className="p-5">
          <Form form={form} onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    name="start_date"
                    label={t('officialHolidayAttendance.modal.from')}
                    required
                  >
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('officialHolidayAttendance.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-11"
                        buttonClassName="h-11"
                      />
                    )}
                  </FormField>

                  <FormField
                    name="end_date"
                    label={t('officialHolidayAttendance.modal.to')}
                    required
                  >
                    {({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('officialHolidayAttendance.modal.datePlaceholder')}
                        className="w-full"
                        inputClassName="h-11"
                        buttonClassName="h-11"
                      />
                    )}
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField
                    name="notes"
                    label={t('officialHolidayAttendance.modal.notes')}
                  >
                    {({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('officialHolidayAttendance.modal.notesPlaceholder')}
                        className="h-11"
                      />
                    )}
                  </FormField>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {t('officialHolidayAttendance.modal.manageEmployeesTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('officialHolidayAttendance.modal.manageEmployeesDescription')}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmployeeSelectOpen(true)}
                  >
                    {t('officialHolidayAttendance.modal.addEmployeeButton')}
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    onFocus={() => setEmployeeSelectOpen(true)}
                    placeholder={t(
                      'officialHolidayAttendance.modal.searchEmployeesInputPlaceholder'
                    )}
                    className="h-11"
                  />

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {selectedEmployees.length > 0
                      ? t('officialHolidayAttendance.modal.selectedCount', {
                          count: selectedEmployees.length,
                        })
                      : t('officialHolidayAttendance.modal.noEmployeesSelected')}
                  </div>
                </div>

                <div className="mt-4">
                  <FormField
                    name="employee_ids"
                    label={t('officialHolidayAttendance.modal.employees')}
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
                        placeholder={t('officialHolidayAttendance.modal.selectEmployees')}
                        searchPlaceholder={t('officialHolidayAttendance.modal.searchEmployees')}
                        formatSelectedLabel={(count) =>
                          t('officialHolidayAttendance.modal.selectedCount', { count })
                        }
                        searchQuery={employeeSearch}
                        onSearchQueryChange={setEmployeeSearch}
                        open={employeeSelectOpen}
                        onOpenChange={setEmployeeSelectOpen}
                        excludeIds={selectedEmployeeIds || []}
                        selectedEmployeesClassName="h-24 content-start overflow-y-auto pr-1"
                        hideRemoveButtons
                        hideClearAll
                      />
                    )}
                  </FormField>
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="mt-4 h-80 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    {selectedEmployees.map((employee) => {
                      const employeeId = getOfficialHolidayEmployeeId(employee);

                      return (
                        <div
                          key={String(employeeId)}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
  {String(
    employee?.name ??
      employee?.employee_name ??
      employee?.full_name ??
      ''
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('') || '—'}
</div>
                            <div>
                              <div className="text-sm font-semibold">
                                {getEmployeeLabel(employee)}
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
                            onClick={() => removeSelectedEmployee(employeeId)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            title={t('officialHolidayAttendance.modal.removeEmployee')}
                          >
                            <UserMinus className="size-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className={
                  isArabic
                    ? 'flex justify-start gap-2 pt-4'
                    : 'flex justify-end gap-2 pt-4'
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  {t('officialHolidayAttendance.modal.cancel')}
                </Button>

                <Button type="submit" disabled={!canSubmit}>
                  {isPending
                    ? t('officialHolidayAttendance.modal.saving')
                    : t('officialHolidayAttendance.modal.update')}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
