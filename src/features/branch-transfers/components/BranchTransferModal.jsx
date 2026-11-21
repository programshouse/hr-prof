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
import { useUpsertBranchTransfer } from '../hooks/useUpsertBranchTransfer';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useAllBranches } from '@/shared/hooks/useAllBranches';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

/* ---------------- Validation schema ---------------- */
const branchTransferSchema = z
  .object({
    employee_id: z.string().min(1, 'Employee is required'),
    date: z.string().min(1, 'Date is required'),
    current_branch_id: z.string().min(1, 'Current branch is required'),
    requested_branch_id: z.string().min(1, 'Requested branch is required'),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      // if one is missing, let required validations handle it
      if (!data.current_branch_id || !data.requested_branch_id) return true;
      // must be different
      return String(data.current_branch_id) !== String(data.requested_branch_id);
    },
    {
      message: 'Requested branch cannot be the same as current branch',
      path: ['requested_branch_id'],
    }
  );

export default function BranchTransferModal({ open, onOpenChange, transfer = null }) {
  const isEdit = !!transfer;
  const { create, update } = useUpsertBranchTransfer();
  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(open);
  const { data: branches = [], isLoading: loadingBranches } = useAllBranches();
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
    if (isEdit && transfer) {
      return {
        employee_id: String(transfer.employee_id || ''),
        date: transfer.date || '',
        current_branch_id: String(transfer.current_branch_id || ''),
        requested_branch_id: String(transfer.requested_branch_id || ''),
        status: transfer.status || 'pending',
        reason: transfer.reason || '',
      };
    }

    // ✅ CREATE MODE → EMPTY DATE so placeholder appears
    return {
      employee_id: '',
      date: '',
      current_branch_id: '',
      requested_branch_id: '',
      status: 'pending',
      reason: '',
    };
  }, [isEdit, transfer]);

  const form = useForm({
    resolver: zodResolver(branchTransferSchema),
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialFormData);
    }
  }, [initialFormData, open, form]);

  const currentBranchId = form.watch('current_branch_id');

  // optional safety: if current branch changes and matches requested, clear requested
  useEffect(() => {
    const requested = form.getValues('requested_branch_id');
    if (requested && String(requested) === String(currentBranchId)) {
      form.setValue('requested_branch_id', '');
    }
  }, [currentBranchId, form]);

  const handleSubmit = (data) => {
    // Employees always submit as pending; HR can set any status.
    data = { ...data, status: isEmployee ? 'pending' : (data.status || 'pending') };

    if (isEdit) {
      update.mutate(
        {
          id: transfer.id,
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
          max-h-[90vh] max-w-4xl overflow-y-auto
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
            {isEdit ? t('branchTransfers.modal.editBranchTransfer') : t('branchTransfers.modal.addBranchTransfer')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField name="employee_id" label={t('branchTransfers.modal.employee')} required className="md:col-span-2">
              {({ field }) => (
                <EmployeeCombobox
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  employees={employees}
                  loading={loadingEmployees}
                  placeholder={t('branchTransfers.modal.selectEmployee')}
                  searchPlaceholder={t('branchTransfers.modal.searchEmployee')}
                />
              )}
            </FormField>

            <FormField name="date" label={t('branchTransfers.modal.date')} required>
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value || null}
                  onChange={field.onChange}
                  placeholder={t('branchTransfers.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            <FormField name="current_branch_id" label={t('branchTransfers.modal.currentBranch')} required>
              {({ field }) => (
                <Select dir={dir} onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('branchTransfers.modal.selectCurrentBranch')} />
                  </SelectTrigger>
                  <SelectContent
                    dir={dir}
                    align={isArabic ? 'end' : 'start'}
                    className={isArabic ? 'text-right' : 'text-left'}
                  >
                    {loadingBranches ? (
                      <SelectItem value="loading" disabled className={selectItemClass}>
                        {t('common.loading')}
                      </SelectItem>
                    ) : (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={String(branch.id)} className={selectItemClass}>
                          {branch.name_en || branch.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <FormField name="requested_branch_id" label={t('branchTransfers.modal.requestedBranch')} required>
              {({ field }) => (
                <Select dir={dir} onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('branchTransfers.modal.selectRequestedBranch')} />
                  </SelectTrigger>
                  <SelectContent
                    dir={dir}
                    align={isArabic ? 'end' : 'start'}
                    className={isArabic ? 'text-right' : 'text-left'}
                  >
                    {loadingBranches ? (
                      <SelectItem value="loading" disabled className={selectItemClass}>
                        {t('common.loading')}
                      </SelectItem>
                    ) : (
                      branches
                        //hide current branch from requested branch dropdown
                        .filter((b) => String(b.id) !== String(currentBranchId))
                        .map((branch) => (
                          <SelectItem key={branch.id} value={String(branch.id)} className={selectItemClass}>
                            {branch.name_en || branch.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            {/* Status shown for HR on both add and edit; hidden for employees */}
            {!isEmployee && (
              <FormField name="status" label={t('branchTransfers.modal.status')}>
                {({ field }) => (
                  <Select dir={dir} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={t('branchTransfers.modal.statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent
                      dir={dir}
                      align={isArabic ? 'end' : 'start'}
                      className={isArabic ? 'text-right' : 'text-left'}
                    >
                      <SelectItem value="pending" className={selectItemClass}>
                        {t('branchTransfers.stats.pendingTransferRequests')}
                      </SelectItem>
                      {!isEmployee && (
                        <SelectItem value="approved" className={selectItemClass}>
                          {t('branchTransfers.stats.approvedTransfers')}
                        </SelectItem>
                      )}
                      {!isEmployee && (
                        <SelectItem value="rejected" className={selectItemClass}>
                          {t('branchTransfers.stats.rejectedTransfers')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}
          </div>

          <FormField name="reason" label={t('branchTransfers.modal.reason')}>
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                placeholder={t('branchTransfers.modal.reasonPlaceholder')}
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
              {t('branchTransfers.modal.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('branchTransfers.modal.saving')
                : isEdit
                  ? t('branchTransfers.modal.updateTransfer')
                  : t('branchTransfers.modal.save')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
