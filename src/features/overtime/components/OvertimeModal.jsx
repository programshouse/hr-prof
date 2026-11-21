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
import { useUpsertOvertime } from '../hooks/useUpsertOvertime';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

/* ---------------- Validation Schema ---------------- */
const overtimeSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  from: z.string().min(1, 'Start time is required'),
  to: z.string().min(1, 'End time is required'),
  reason: z.string().min(1, 'Reason is required'),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

/* ================= HELPERS ================= */

function normalizeResponse(response, fallback = {}) {
  const data = response?.data?.data || response?.data || response || {};

  return {
    ...fallback,
    ...data,
    id: data?.id || fallback?.id,
  };
}

/* ================= COMPONENT ================= */

export default function OvertimeModal({
  open,
  onOpenChange,
  overtime = null,
  defaultOvertime = null,
  onSaved,
}) {
  const isEdit = !!overtime?.id;

  const formSource = overtime || defaultOvertime;

  const { create, update } = useUpsertOvertime();

  const { data: employees = [], isLoading: loadingEmployees } =
    useAllEmployees(open);

  const { role, authSource } = useAuthStore();
  const isEmployee = role === 'employee' || authSource === 'employee-login';

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const isSubmitting = create.isPending || update.isPending;
  const inputClass = isArabic ? 'text-right' : 'text-left';
  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  /* ================= INITIAL VALUES ================= */

  const initialFormData = useMemo(() => {
    if (formSource) {
      return {
        employee_id: String(formSource.employee_id || ''),
        date: formSource.date || '',
        from: formSource.from
          ? String(formSource.from).substring(0, 5)
          : '',
        to: formSource.to
          ? String(formSource.to).substring(0, 5)
          : '',
        reason: formSource.reason || '',
        status: formSource.status || 'pending',
      };
    }

    // CREATE MODE → EMPTY DATE (placeholder visible)
    return {
      employee_id: '',
      date: '',
      from: '',
      to: '',
      reason: '',
      status: 'pending',
    };
  }, [formSource]);

  /* ================= FORM ================= */

  const form = useForm({
    resolver: zodResolver(overtimeSchema),
    defaultValues: initialFormData,
  });

  /* ---------------- Reset on Open / Edit ---------------- */
  useEffect(() => {
    if (open) {
      form.reset(initialFormData);
    }
  }, [open, initialFormData, form]);

  /* ================= SUBMIT ================= */

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      employee_id: Number(data.employee_id),
      // Employees always submit as pending; HR can set any status.
      status: isEmployee ? 'pending' : (data.status || 'pending'),
    };

    if (isEdit) {
      update.mutate(
        {
          id: overtime.id,
          values: payload,
        },
        {
          onSuccess: (response) => {
            const saved = normalizeResponse(response, {
              ...payload,
              id: overtime.id,
            });

            onSaved?.(saved);

            onOpenChange(false);
          },
        }
      );

      return;
    }

    create.mutate(payload, {
      onSuccess: (response) => {
        const saved = normalizeResponse(response, payload);

        onSaved?.(saved);

        onOpenChange(false);
      },
    });
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-2xl
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader
          className={isArabic ? 'items-end text-right' : 'items-start text-left'}
        >
          <DialogTitle
            className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}
          >
            {isEdit
              ? t('overtime.modal.editOvertimeRequest')
              : t('overtime.modal.addOvertimeRequest')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Employee */}
            <FormField
              name="employee_id"
              label={t('overtime.modal.employee')}
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
                  placeholder={t('overtime.modal.selectEmployee')}
                  searchPlaceholder={t('overtime.modal.searchEmployee')}
                />
              )}
            </FormField>

            {/* Date */}
            <FormField name="date" label={t('overtime.modal.date')} required>
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value || null}
                  onChange={field.onChange}
                  placeholder={t('overtime.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            {/* Status shown for HR on both add and edit; hidden for employees */}
            {!isEmployee && (
              <FormField name="status" label={t('overtime.modal.status')}>
                {({ field }) => (
                  <Select
                    dir={dir}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={t('overtime.modal.statusPlaceholder')} />
                    </SelectTrigger>

                    <SelectContent
                      dir={dir}
                      align={isArabic ? 'end' : 'start'}
                      className={isArabic ? 'text-right' : 'text-left'}
                    >
                      <SelectItem value="pending" className={selectItemClass}>
                        {t('overtime.stats.pendingOvertime')}
                      </SelectItem>

                      {!isEmployee && (
                        <SelectItem value="approved" className={selectItemClass}>
                          {t('overtime.stats.approvedOvertime')}
                        </SelectItem>
                      )}

                      {!isEmployee && (
                        <SelectItem value="rejected" className={selectItemClass}>
                          {t('overtime.stats.rejectedOvertime')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}

            {/* From */}
            <FormField name="from" label={t('overtime.modal.from')} required>
              {({ field }) => (
                <Input
                  {...field}
                  dir={dir}
                  type="time"
                  className={`[&::-webkit-calendar-picker-indicator]:hidden ${inputClass}`}
                />
              )}
            </FormField>

            {/* To */}
            <FormField name="to" label={t('overtime.modal.to')} required>
              {({ field }) => (
                <Input
                  {...field}
                  dir={dir}
                  type="time"
                  className={`[&::-webkit-calendar-picker-indicator]:hidden ${inputClass}`}
                />
              )}
            </FormField>

          </div>

          {/* Reason */}
          <FormField
            name="reason"
            label={t('overtime.modal.reason')}
            required
          >
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                placeholder={t('overtime.modal.reasonPlaceholder')}
                className={inputClass}
              />
            )}
          </FormField>

          <DialogFooter
            className={isArabic ? 'flex-row-reverse justify-start' : 'justify-end'}
          >

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('overtime.modal.cancel')}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('overtime.modal.saving')
                : isEdit
                  ? t('overtime.modal.updateRequest')
                  : t('overtime.modal.saveRequest')}
            </Button>

          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
