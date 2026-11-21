// src/features/resignations/components/ResignationModal.jsx
import { useMemo, useEffect, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import DatePickerInput from '@/components/ui/date-picker-input';
import { useUpsertResignation } from '../hooks/useUpsertResignation';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

/* ---------------- Validation schema ---------------- */
const resignationSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  reason: z.string().min(1, 'Reason is required'),
  pdf: z.any().optional(), // Array<File>
});

export default function ResignationModal({ open, onOpenChange, resignation = null }) {
  const isEdit = !!resignation;
  const { create, update } = useUpsertResignation();
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

  const fileRef = useRef(null);

  const initialFormData = useMemo(() => {
    if (isEdit && resignation) {
      return {
        employee_id: String(resignation.employee_id || ''),
        date: resignation.date || '',
        status: resignation.status || 'pending',
        reason: resignation.reason || '',
        pdf: [],
      };
    }

    return {
      employee_id: '',
      date: '',
      status: 'pending',
      reason: '',
      pdf: [],
    };
  }, [isEdit, resignation]);

  const form = useForm({
    resolver: zodResolver(resignationSchema),
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (open) form.reset(initialFormData);
  }, [initialFormData, open, form]);

  const watchedPdf = form.watch('pdf') || [];
  const hasExistingPdf = isEdit && !!resignation?.pdf;

  const handleSubmit = (data) => {
    const formData = new FormData();

    formData.append('employee_id', data.employee_id);
    formData.append('date', data.date);
    // Employees always submit as pending; HR can set any status.
    formData.append('status', isEmployee ? 'pending' : (data.status || 'pending'));
    formData.append('reason', data.reason || '');

    // ✅ backend expects "pdf" (single file)
    if (data.pdf && data.pdf.length > 0) {
      formData.append('pdf', data.pdf[0]);
    }

    if (isEdit) {
      update.mutate(
        { id: resignation.id, values: formData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      create.mutate(formData, { onSuccess: () => onOpenChange(false) });
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
            {isEdit ? t('resignations.modal.editResignationRequest') : t('resignations.modal.addResignationRequest')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <FormField name="employee_id" label={t('resignations.modal.employee')} required className="md:col-span-2">
                {({ field }) => (
                  <EmployeeCombobox
                    dir={dir}
                    value={field.value}
                    onChange={field.onChange}
                    employees={employees}
                    loading={loadingEmployees}
                    placeholder={t('resignations.modal.selectEmployee')}
                    searchPlaceholder={t('resignations.modal.searchEmployee')}
                  />
                )}
              </FormField>
            </div>

            <div className="md:col-span-1">
              <FormField name="date" label={t('resignations.modal.date')} required>
                {({ field }) => (
                  <DatePickerInput
                    dir={dir}
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder={t('resignations.modal.datePlaceholder')}
                    inputClassName={inputClass}
                  />
                )}
              </FormField>
            </div>

            {/* Status shown for HR on both add and edit; hidden for employees */}
            {!isEmployee && (
              <div className="md:col-span-1">
                <FormField name="status" label={t('resignations.modal.status')}>
                  {({ field }) => (
                    <Select dir={dir} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('resignations.modal.statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent
                        dir={dir}
                        align={isArabic ? 'end' : 'start'}
                        className={isArabic ? 'text-right' : 'text-left'}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t('resignations.stats.pendingResignations')}
                        </SelectItem>
                        {!isEmployee && (
                          <SelectItem value="approved" className={selectItemClass}>
                            {t('resignations.stats.approvedResignations')}
                          </SelectItem>
                        )}
                        {!isEmployee && (
                          <SelectItem value="rejected" className={selectItemClass}>
                            {t('resignations.stats.rejectedResignations')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </div>
            )}
          </div>

          {/* Attachment (custom UI like holiday) */}
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('resignations.modal.attachment')}
            </Label>

            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                form.setValue('pdf', files, { shouldDirty: true, shouldValidate: true });
              }}
            />

            <div
              className={`mt-1.5 flex items-center gap-3 ${
                isArabic ? 'flex-row-reverse justify-end' : ''
              }`}
            >
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                {t('resignations.modal.chooseFile')}
              </Button>
              <span className="text-xs text-gray-500">{t('resignations.modal.pdfOnly')}</span>
            </div>

            <div className="mt-2 space-y-1">
              {watchedPdf.length > 0 && (
                <>
                  {watchedPdf.map((f) => (
                    <div
                      key={f.name}
                      className={`flex items-center gap-2 text-sm text-green-600 ${
                        isArabic ? 'flex-row-reverse justify-end' : ''
                      }`}
                    >
                      <span className="text-base">✓</span>
                      <span className="font-medium">
                        {t('resignations.modal.fileAttached')}
                      </span>
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                  <p className="text-xs italic text-gray-500">
                    {t('resignations.modal.noteFileAttached')}
                  </p>
                </>
              )}

              {isEdit && hasExistingPdf && (
                <div className="text-sm text-gray-700">
                  {t('resignations.modal.currentPdf')}{' '}
                  <a
                    href={resignation.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {t('resignations.modal.open')}
                  </a>
                </div>
              )}

              {isEdit && hasExistingPdf && watchedPdf.length === 0 && (
                <p className="text-xs italic text-gray-500">
                  {t('resignations.modal.noteReplaceFile')}
                </p>
              )}

              {!isEdit && watchedPdf.length === 0 && (
                <p className="text-xs text-gray-500">{t('resignations.modal.noFileAttached')}</p>
              )}
            </div>
          </div>

          <FormField name="reason" label={t('resignations.modal.reason')} required>
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                placeholder={t('resignations.modal.reasonPlaceholder')}
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
              {t('resignations.modal.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('resignations.modal.saving')
                : isEdit
                  ? t('resignations.modal.updateRequest')
                  : t('resignations.modal.save')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
