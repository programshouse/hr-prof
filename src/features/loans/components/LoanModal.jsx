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
import { useUpsertLoan } from '../hooks/useUpsertLoan';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

const loanSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  months: z.string().min(1, 'Payment period is required'),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  reason: z.string().optional(),
});

export default function LoanModal({ open, onOpenChange, loan = null }) {
  const isEdit = !!loan;
  const { create, update } = useUpsertLoan();
  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
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
    if (isEdit && loan) {
      return {
        employee_id: String(loan.employee_id || ''),
        date: loan.date || '',
        amount: String(loan.amount || ''),
        months: String(loan.months || ''),
        status: loan.status || 'pending',
        reason: loan.reason || '',
      };
    }

    // ✅ CREATE MODE → EMPTY DATE so placeholder appears
    return {
      employee_id: '',
      date: '',
      amount: '',
      months: '',
      status: 'pending',
      reason: '',
    };
  }, [isEdit, loan]);

  const form = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialFormData);
    }
  }, [initialFormData, open, form]);

  const handleSubmit = (data) => {
    // Employees always submit as pending; HR can set any status.
    data = { ...data, status: isEmployee ? 'pending' : (data.status || 'pending') };

    if (isEdit) {
      update.mutate(
        {
          id: loan.id,
          values: data,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      create.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-h-[90vh] max-w-2xl overflow-y-auto
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
            {isEdit ? t('loans.modal.editLoanRequest') : t('loans.modal.addLoanRequest')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField name="employee_id" label={t('loans.modal.employee')} required className="md:col-span-2">
                {({ field }) => (
                  <EmployeeCombobox
                    dir={dir}
                    value={field.value}
                    onChange={field.onChange}
                    employees={employees}
                    loading={loadingEmployees}
                    placeholder={t('loans.modal.selectEmployee')}
                    searchPlaceholder={t('loans.modal.searchEmployee')}
                  />
                )}
              </FormField>
            </div>

            <div className="md:col-span-1">
              <FormField name="date" label={t('loans.modal.date')} required>
                {({ field }) => (
                  <DatePickerInput
                    dir={dir}
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder={t('loans.modal.datePlaceholder')}
                    inputClassName={inputClass}
                  />
                )}
              </FormField>
            </div>

            <div className="md:col-span-1">
              <FormField name="amount" label={t('loans.modal.amount')} required>
                {({ field }) => (
                  <Input
                    {...field}
                    dir={dir}
                    type="number"
                    min={0}
                    placeholder={t('loans.modal.amountPlaceholder')}
                    className={inputClass}
                  />
                )}
              </FormField>
            </div>

            <div className="md:col-span-1">
              <FormField name="months" label={t('loans.modal.paymentPeriod')} required>
                {({ field }) => (
                  <Input
                    {...field}
                    dir={dir}
                    type="number"
                    min={1}
                    placeholder={t('loans.modal.paymentPeriodPlaceholder')}
                    className={inputClass}
                  />
                )}
              </FormField>
            </div>

            {/* Status shown for HR on both add and edit; hidden for employees */}
            {!isEmployee && (
              <div className="md:col-span-1">
                <FormField name="status" label={t('loans.modal.status')}>
                  {({ field }) => (
                    <Select dir={dir} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('loans.modal.statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent
                        dir={dir}
                        align={isArabic ? 'end' : 'start'}
                        className={isArabic ? 'text-right' : 'text-left'}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t('loans.stats.pendingLoans')}
                        </SelectItem>
                        {!isEmployee && (
                          <SelectItem value="approved" className={selectItemClass}>
                            {t('loans.stats.approvedLoans')}
                          </SelectItem>
                        )}
                        {!isEmployee && (
                          <SelectItem value="rejected" className={selectItemClass}>
                            {t('loans.stats.rejectedLoans')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </div>
            )}
          </div>

          <FormField name="reason" label={t('loans.modal.reason')}>
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                placeholder={t('loans.modal.reasonPlaceholder')}
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
              {t('loans.modal.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('loans.modal.saving')
                : isEdit
                  ? t('loans.modal.updateRequest')
                  : t('loans.modal.save')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
