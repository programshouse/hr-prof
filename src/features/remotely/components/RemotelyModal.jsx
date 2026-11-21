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
import { useUpsertRemotely } from '../hooks/useUpsertRemotely';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

const remotelySchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  from: z.string().min(1, 'Start time is required'),
  to: z.string().min(1, 'End time is required'),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export default function RemotelyModal({ open, onOpenChange, remotely = null }) {
  const isEdit = !!remotely;

  const { create, update } = useUpsertRemotely();
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

  const initialFormData = useMemo(() => {
    if (remotely) {
      return {
        employee_id: String(remotely.employee_id || ''),
        date: remotely.date ? remotely.date.split('T')[0] : '',
        from: remotely.from ? remotely.from.split('T')[0] : '',
        to: remotely.to ? remotely.to.split('T')[0] : '',
        reason: remotely.reason || '',
        status: remotely.status || 'pending',
      };
    }

    return {
      employee_id: '',
      date: '',
      from: '',
      to: '',
      reason: '',
      status: 'pending',
    };
  }, [remotely]);

  const form = useForm({
    resolver: zodResolver(remotelySchema),
    defaultValues: initialFormData,
  });

  useEffect(() => {
    form.reset(initialFormData);
  }, [initialFormData, open, form]);

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
          id: remotely.id,
          values: payload,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
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
              ? t('remotely.modal.editRemoteRequest')
              : t('remotely.modal.addNewRemoteRequest')}
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
              label={t('remotely.modal.employee')}
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
                  placeholder={t('remotely.modal.selectEmployee')}
                  searchPlaceholder={t('remotely.modal.searchEmployee')}
                />
              )}
            </FormField>

            {/* Status shown for HR on both add and edit; hidden for employees */}
            {!isEmployee && (
              <FormField
                name="status"
                label={t('remotely.modal.status')}
                className="md:col-span-2"
              >
                {({ field }) => (
                  <Select
                    dir={dir}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue
                        placeholder={t('remotely.modal.selectStatus')}
                      />
                    </SelectTrigger>

                    <SelectContent
                      dir={dir}
                      align={isArabic ? 'end' : 'start'}
                      className={isArabic ? 'text-right' : 'text-left'}
                    >
                      <SelectItem
                        value="pending"
                        className={selectItemClass}
                      >
                        {t('remotely.stats.pending')}
                      </SelectItem>

                      {!isEmployee && (
                        <SelectItem
                          value="approved"
                          className={selectItemClass}
                        >
                          {t('remotely.stats.approved')}
                        </SelectItem>
                      )}

                      {!isEmployee && (
                        <SelectItem
                          value="rejected"
                          className={selectItemClass}
                        >
                          {t('remotely.stats.rejected')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}

            {/* Date */}
            <FormField
              name="date"
              label={t('remotely.modal.date')}
              required
            >
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={(iso) => field.onChange(iso)}
                  placeholder={t('remotely.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            {/* From */}
            <FormField
              name="from"
              label={t('remotely.modal.from')}
              required
            >
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={(iso) => field.onChange(iso)}
                  placeholder={t('remotely.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            {/* To */}
            <FormField
              name="to"
              label={t('remotely.modal.to')}
              required
            >
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={(iso) => field.onChange(iso)}
                  placeholder={t('remotely.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>
          </div>

          {/* Reason */}
          <FormField
            name="reason"
            label={t('remotely.modal.reason')}
          >
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                placeholder={t('remotely.modal.reasonPlaceholder')}
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
              {t('remotely.modal.cancel')}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('remotely.modal.saving')
                : isEdit
                  ? t('remotely.modal.updateRequest')
                  : t('remotely.modal.createRequest')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
