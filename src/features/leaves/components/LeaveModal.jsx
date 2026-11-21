// src/features/leaves/components/LeaveModal.jsx
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField } from '@/components/forms/Form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import DatePickerInput from '@/components/ui/date-picker-input';
import { useUpsertLeave } from '../hooks/useUpsertLeave';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

const leaveSchema = z
  .object({
    employee_id: z.string().min(1, 'Employee is required'),
    date: z.string().min(1, 'Date is required'),
    from: z.string().min(1, 'Start time is required'),
    to: z.string().min(1, 'End time is required'),
    type: z.string().min(1, 'Type is required'),
    reason: z.string().optional(),
    has_replacement: z.enum(['0', '1']).default('0'),
    replaced_employee_id: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    manager_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  })
  .refine(
    (data) => {
      if (data.has_replacement === '1' && !data.replaced_employee_id) {
        return false;
      }

      return true;
    },
    {
      message: 'Replacement employee is required',
      path: ['replaced_employee_id'],
    }
  );

function getLeaveEmployeeId(leave) {
  return (
    leave?.employee_id ??
    leave?.employee?.employee_id ??
    leave?.employee?.id ??
    ''
  );
}

function getReplacementEmployeeId(leave) {
  return (
    leave?.replaced_employee_id ??
    leave?.replacement_employee_id ??
    leave?.replacedEmployeeId ??
    leave?.replaced_employee?.employee_id ??
    leave?.replaced_employee?.id ??
    leave?.replacement_employee?.employee_id ??
    leave?.replacement_employee?.id ??
    ''
  );
}

function hasReplacementValue(leave) {
  const replacementId = getReplacementEmployeeId(leave);

  return Boolean(
    leave?.has_replacement ||
      replacementId ||
      leave?.replaced_employee ||
      leave?.replacement_employee
  );
}

function toTimeHHmm(value) {
  if (!value) return '';

  const raw = String(value).trim();

  const match = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return '';

  return `${String(match[1]).padStart(2, '0')}:${match[2]}`;
}

export default function LeaveModal({ open, onOpenChange, leave = null, onSuccess }) {
  const isEdit = !!leave;

  const { create, update } = useUpsertLeave();
  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
  const { role, authSource } = useAuthStore();
  const isEmployee = role === 'employee' || authSource === 'employee-login';

  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const isSubmitting = create.isPending || update.isPending;

  const inputClass = isArabic ? 'text-right' : 'text-left';

  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  const initialFormData = useMemo(() => {
    if (leave) {
      const employeeId = getLeaveEmployeeId(leave);
      const replacementId = getReplacementEmployeeId(leave);
      const hasReplacement = hasReplacementValue(leave);

      return {
        employee_id: employeeId ? String(employeeId) : '',
        date: leave.date ? String(leave.date).split('T')[0] : '',
        from: toTimeHHmm(leave.from),
        to: toTimeHHmm(leave.to),
        type: leave.type || '',
        reason: leave.reason || '',
        has_replacement: hasReplacement ? '1' : '0',
        replaced_employee_id: replacementId ? String(replacementId) : '',
        status: leave.status || 'pending',
        manager_status: leave.manager_status || 'pending',
      };
    }

    return {
      employee_id: '',
      date: '',
      from: '',
      to: '',
      type: '',
      reason: '',
      has_replacement: '0',
      replaced_employee_id: '',
      status: 'pending',
      manager_status: 'pending',
    };
  }, [leave]);

  const form = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(initialFormData);
  }, [initialFormData, open, form]);

  const selectedEmployeeId = form.watch('employee_id');
  const hasReplacement = form.watch('has_replacement');
  useEffect(() => {
    if (hasReplacement === '0') {
      form.setValue('replaced_employee_id', '');
    }
  }, [hasReplacement, form]);

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      employee_id: Number(data.employee_id),
      has_replacement: data.has_replacement === '1' ? 1 : 0,
      replaced_employee_id:
        data.has_replacement === '1'
          ? Number(data.replaced_employee_id)
          : null,
      // Employees always submit as pending; HR can set any status.
      status: isEmployee ? 'pending' : (data.status || 'pending'),
      manager_status: isEmployee ? 'pending' : (data.manager_status || 'pending'),
    };

    if (isEdit) {
      update.mutate(
        { id: leave.id, values: payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-2xl
          ${
            isArabic
              ? 'text-right [&>button]:left-4 [&>button]:right-auto'
              : 'text-left'
          }
        `}
      >
        <DialogHeader
          className={isArabic ? 'items-end text-right' : 'items-start text-left'}
        >
          <DialogTitle
            className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}
          >
            {isEdit
              ? t('leaves.modal.editLeave')
              : t('leaves.modal.addNewLeave')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="employee_id"
              label={t('leaves.modal.employee')}
              required
              className="md:col-span-2"
            >
              {({ field }) => (
                <EmployeeCombobox
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  employees={employees}
                  loading={loadingEmployees}
                  placeholder={t('leaves.modal.selectEmployee')}
                  searchPlaceholder={t('leaves.modal.searchEmployee')}
                />
              )}
            </FormField>

            {/* Status & Manager Status shown for HR on both add and edit; hidden for employees */}
            {!isEmployee && (
              <>
                <FormField
                  name="status"
                  label={t('leaves.modal.status')}
                >
                  {({ field }) => (
                    <Select
                      dir={dir}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('leaves.modal.selectStatus')} />
                      </SelectTrigger>

                      <SelectContent
                        dir={dir}
                        align={isArabic ? 'end' : 'start'}
                        className={isArabic ? 'text-right' : 'text-left'}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t('leaves.stats.pending')}
                        </SelectItem>

                        <SelectItem value="approved" className={selectItemClass}>
                          {t('leaves.stats.approved')}
                        </SelectItem>

                        <SelectItem value="rejected" className={selectItemClass}>
                          {t('leaves.stats.rejected')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>

                <FormField
                  name="manager_status"
                  label={t('leaves.modal.managerStatus', 'Manager Status')}
                >
                  {({ field }) => (
                    <Select
                      dir={dir}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('leaves.modal.selectManagerStatus', t('leaves.modal.selectStatus'))} />
                      </SelectTrigger>

                      <SelectContent
                        dir={dir}
                        align={isArabic ? 'end' : 'start'}
                        className={isArabic ? 'text-right' : 'text-left'}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t('leaves.stats.pending')}
                        </SelectItem>

                        <SelectItem value="approved" className={selectItemClass}>
                          {t('leaves.stats.approved')}
                        </SelectItem>

                        <SelectItem value="rejected" className={selectItemClass}>
                          {t('leaves.stats.rejected')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </>
            )}

            <FormField
              name="date"
              label={t('leaves.modal.date')}
              required
            >
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('leaves.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            <FormField
              name="type"
              label={t('leaves.modal.type')}
              required
            >
              {({ field }) => (
                <Select
                  dir={dir}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('leaves.modal.selectType')} />
                  </SelectTrigger>

                  <SelectContent
                    dir={dir}
                    align={isArabic ? 'end' : 'start'}
                    className={isArabic ? 'text-right' : 'text-left'}
                  >
                    <SelectItem value="Early Leave" className={selectItemClass}>
                      {t('leaves.modal.earlyLeave')}
                    </SelectItem>

                    <SelectItem value="Late Attendance" className={selectItemClass}>
                      {t('leaves.modal.lateAttendance')}
                    </SelectItem>

                    <SelectItem value="Within Day" className={selectItemClass}>
                      {t('leaves.modal.withinDay')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <FormField
              name="from"
              label={t('leaves.modal.from')}
              required
            >
              {({ field }) => (
                <Input
                  {...field}
                  dir={dir}
                  type="time"
                  className={inputClass}
                />
              )}
            </FormField>

            <FormField
              name="to"
              label={t('leaves.modal.to')}
              required
            >
              {({ field }) => (
                <Input
                  {...field}
                  dir={dir}
                  type="time"
                  className={inputClass}
                />
              )}
            </FormField>

            <FormField
              name="has_replacement"
              label={t('leaves.modal.replacementEmployee')}
            >
              {({ field }) => (
                <Select
                  dir={dir}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('leaves.modal.selectReplacement')} />
                  </SelectTrigger>

                  <SelectContent
                    dir={dir}
                    align={isArabic ? 'end' : 'start'}
                    className={isArabic ? 'text-right' : 'text-left'}
                  >
                    <SelectItem value="1" className={selectItemClass}>
                      {t('leaves.modal.yes')}
                    </SelectItem>

                    <SelectItem value="0" className={selectItemClass}>
                      {t('leaves.modal.no')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>

{hasReplacement === '1' && (
  <FormField
    name="replaced_employee_id"
    label={t('leaves.modal.replacementEmployeeRequired')}
    required
  >
    {({ field }) => (
      <Select
        dir={dir}
        onValueChange={field.onChange}
        value={field.value}
        disabled={false} // Editable in update mode
      >
        <SelectTrigger className={inputClass}>
          <SelectValue
            placeholder={t('leaves.modal.selectReplacementEmployee')}
          />
        </SelectTrigger>

        <SelectContent
          dir={dir}
          align={isArabic ? 'end' : 'start'}
          className={isArabic ? 'text-right' : 'text-left'}
        >
          {employees
            .filter(
              (e) =>
                String(e.employee_id ?? e.id) !== String(selectedEmployeeId)
            )
            .map((emp) => {
              const empId = emp.employee_id ?? emp.id;
              const empCode = emp.employee_code ?? emp.code ?? '';
              const empName =
                emp.employee_name ??
                emp.full_name ??
                emp.name ??
                '';

              return (
                <SelectItem
                  key={empId}
                  value={String(empId)}
                  className={selectItemClass}
                >
                  {empCode && empName ? `${empCode} - ${empName}` : empName || empCode}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    )}
  </FormField>
)}
          </div>

          <FormField
            name="reason"
            label={t('leaves.modal.reason')}
          >
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                className={inputClass}
              />
            )}
          </FormField>

          <DialogFooter
            className={isArabic ? 'flex-row-reverse justify-start' : 'justify-end'}
          >
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
              disabled={isSubmitting}
            >
              {t('leaves.modal.cancel')}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('leaves.modal.saving')
                : isEdit
                  ? t('leaves.modal.updateLeave')
                  : t('leaves.modal.createLeave')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
