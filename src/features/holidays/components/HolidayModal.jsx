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
import { useUpsertHoliday } from '../hooks/useUpsertHoliday';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAuthStore } from '@/services/auth/auth.store';

const normalizeHolidayType = (type = '') => {
  const value = String(type)
    .replace('messages.holiday_types.', '')
    .trim();

  switch (value.toLowerCase()) {
    case 'annual leave':
    case 'annual':
      return 'Annual Leave';
    case 'sick leave':
    case 'sick':
      return 'Sick Leave';
    case 'casual leave':
    case 'casual':
      return 'Casual Leave';
    case 'weekend':
      return 'Weekend';
    case 'official ':
    case 'official holiday':
      return 'Official Holiday';
    default:
      return value;
  }
};

const allowedHolidayTypes = [
  'Annual Leave',
  'Sick Leave',
  'Casual Leave',
  'Weekend',
  'Official',
  'Official Holiday',
];

const holidaySchema = z
  .object({
    employee_id: z.string().min(1, 'Employee is required'),
    date: z.string().min(1, 'Date is required'),
    from: z.string().min(1, 'Start date is required'),
    to: z.string().min(1, 'End date is required'),
    type: z.string().min(1, 'Type is required'),
    has_replacement: z.enum(['0', '1']),
    replaced_employee_id: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    manager_status: z.enum(['pending', 'approved', 'rejected']).optional(),
    reason: z.string().optional(),
    images: z.any().optional(),
    pdf: z.any().optional(),
  })
  .refine((data) => data.has_replacement === '0' || !!data.replaced_employee_id, {
    message: 'Replacement employee is required',
    path: ['replaced_employee_id'],
  });

export default function HolidayModal({ open, onOpenChange, holiday = null }) {
  const isEdit = !!holiday;
  const { role, authSource } = useAuthStore();
  const isEmployee = role === 'employee' || authSource === 'employee-login';

  const { create, update } = useUpsertHoliday();
  const { data: employees = [], isLoading: loadingEmployees } =
    useAllEmployees(open);

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
    if (holiday) {
      const holidayType = normalizeHolidayType(holiday.type || '');

      return {
        employee_id: String(holiday.employee_id || ''),
        date: holiday.date || '',
        from: holiday.from || '',
        to: holiday.to || '',
        type: allowedHolidayTypes.includes(holidayType) ? holidayType : '',
        has_replacement: holiday.has_replacement ? '1' : '0',
        replaced_employee_id: holiday.replaced_employee_id
          ? String(holiday.replaced_employee_id)
          : '',
        status: holiday.status || 'pending',
        manager_status: holiday.manager_status || 'pending',
        reason: holiday.reason || '',
        images: [],
        pdf: [],
      };
    }

    return {
      employee_id: '',
      date: '',
      from: '',
      to: '',
      type: '',
      has_replacement: '0',
      replaced_employee_id: '',
      status: 'pending',
      manager_status: 'pending',
      reason: '',
      images: [],
      pdf: [],
    };
  }, [holiday]);

  const form = useForm({
    resolver: zodResolver(holidaySchema),
    defaultValues: initialFormData,
  });

  useEffect(() => {
    form.reset(initialFormData);
  }, [initialFormData, open, form]);

  const hasReplacement = form.watch('has_replacement');
  const selectedEmployeeId = form.watch('employee_id');
  const watchedImages = form.watch('images') || [];
  const watchedPdf = form.watch('pdf') || [];

  const hasExistingFiles =
    isEdit &&
    ((Array.isArray(holiday?.pdf) && holiday.pdf.filter(Boolean).length > 0) ||
      (Array.isArray(holiday?.images) &&
        holiday.images.filter(Boolean).length > 0));

  const applyServerErrorsToForm = (error) => {
    const data = error?.response?.data;
    const fieldErrors = data?.errors;

    if (fieldErrors && typeof fieldErrors === 'object') {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        form.setError(field, {
          type: 'server',
          message: Array.isArray(messages) ? messages[0] : String(messages),
        });
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    const images = files.filter((f) => f.type.startsWith('image/'));

    const pdf = files.filter(
      (f) =>
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf')
    );

    form.setValue('images', images, {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.setValue('pdf', pdf, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = (data) => {
    const formData = new FormData();

    formData.append('employee_id', data.employee_id);
    formData.append('date', data.date);
    formData.append('from', data.from);
    formData.append('to', data.to);
    formData.append('type', normalizeHolidayType(data.type));
    formData.append('has_replacement', data.has_replacement);
    formData.append('status', isEmployee ? 'pending' : (data.status || 'pending'));
    formData.append('manager_status', isEmployee ? 'pending' : (data.manager_status || 'pending'));
    formData.append('reason', data.reason || '');

    if (data.has_replacement === '1' && data.replaced_employee_id) {
      formData.append('replaced_employee_id', data.replaced_employee_id);
    }

    if (Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((file) => formData.append('images[]', file));
    }

    if (Array.isArray(data.pdf) && data.pdf.length > 0) {
      data.pdf.forEach((file) => formData.append('pdf[]', file));
    }

    if (isEdit) {
      update.mutate(
        {
          id: holiday.id,
          values: formData,
        },
        {
          onSuccess: () => onOpenChange(false),
          onError: applyServerErrorsToForm,
        }
      );
    } else {
      create.mutate(formData, {
        onSuccess: () => onOpenChange(false),
        onError: applyServerErrorsToForm,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-h-[90vh] max-w-4xl overflow-y-auto
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
              ? t('holidays.modal.editHolidayRequest')
              : t('holidays.modal.addHolidayRequest')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="employee_id"
              label={t('holidays.modal.employee')}
              required
            >
              {({ field }) => (
                <EmployeeCombobox
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  employees={employees}
                  loading={loadingEmployees}
                  placeholder={t('holidays.modal.selectEmployee')}
                  searchPlaceholder={t('holidays.modal.searchEmployee')}
                />
              )}
            </FormField>

            <FormField name="date" label={t('holidays.modal.date')} required>
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('holidays.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            <FormField name="from" label={t('holidays.modal.from')} required>
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('holidays.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            <FormField name="to" label={t('holidays.modal.to')} required>
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('holidays.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <FormField name="type" label={t('holidays.modal.type')} required>
              {({ field }) => (
                <Select
                  dir={dir}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t('holidays.modal.selectType')} />
                  </SelectTrigger>

                  <SelectContent
                    dir={dir}
                    align={isArabic ? 'end' : 'start'}
                    className={isArabic ? 'text-right' : 'text-left'}
                  >
                    <SelectItem value="Annual Leave" className={selectItemClass}>
                      {t('holidays.modal.annualLeave')}
                    </SelectItem>

                    <SelectItem value="Sick Leave" className={selectItemClass}>
                      {t('holidays.modal.sickLeave')}
                    </SelectItem>

                    <SelectItem value="Casual Leave" className={selectItemClass}>
                      {t('holidays.modal.casualLeave')}
                    </SelectItem>

                    <SelectItem value="Weekend" className={selectItemClass}>
                      {t('holidays.modal.weekend')}
                    </SelectItem>

                    <SelectItem value="Official Holiday" className={selectItemClass}>
                      {t('holidays.modal.officialHoliday')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>

            {!isEmployee && (
              <>
                <FormField name="status" label={t('holidays.modal.status')}>
                  {({ field }) => (
                    <Select
                      dir={dir}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue
                          placeholder={t('holidays.modal.statusPlaceholder')}
                        />
                      </SelectTrigger>

                      <SelectContent
                        dir={dir}
                        align={isArabic ? 'end' : 'start'}
                        className={isArabic ? 'text-right' : 'text-left'}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t('holidays.stats.pendingHolidays')}
                        </SelectItem>

                        <SelectItem value="approved" className={selectItemClass}>
                          {t('holidays.stats.approvedHolidays')}
                        </SelectItem>

                        <SelectItem value="rejected" className={selectItemClass}>
                          {t('holidays.stats.rejectedHolidays')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>

                <FormField name="manager_status" label={t('holidays.modal.managerStatus', 'Manager Status')}>
                  {({ field }) => (
                    <Select
                      dir={dir}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue
                          placeholder={t(
                            'holidays.modal.managerStatusPlaceholder',
                            t('holidays.modal.statusPlaceholder', 'Status')
                          )}
                        />
                      </SelectTrigger>

                      <SelectContent
                        dir={dir}
                        align={isArabic ? 'end' : 'start'}
                        className={isArabic ? 'text-right' : 'text-left'}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t('holidays.stats.pendingHolidays')}
                        </SelectItem>

                        <SelectItem value="approved" className={selectItemClass}>
                          {t('holidays.stats.approvedHolidays')}
                        </SelectItem>

                        <SelectItem value="rejected" className={selectItemClass}>
                          {t('holidays.stats.rejectedHolidays')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </>
            )}

            <FormField
              name="has_replacement"
              label={t('holidays.modal.replacementEmployee')}
            >
              {({ field }) => (
                <Select
                  dir={dir}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue
                      placeholder={t('holidays.modal.selectReplacement')}
                    />
                  </SelectTrigger>

                  <SelectContent
                    dir={dir}
                    align={isArabic ? 'end' : 'start'}
                    className={isArabic ? 'text-right' : 'text-left'}
                  >
                    <SelectItem value="1" className={selectItemClass}>
                      {t('holidays.modal.yes')}
                    </SelectItem>

                    <SelectItem value="0" className={selectItemClass}>
                      {t('holidays.modal.no')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>

            {hasReplacement === '1' && (
              <FormField
                name="replaced_employee_id"
                label={t('holidays.modal.employeeReplacement')}
                required
              >
                {({ field }) => (
                  <Select
                    dir={dir}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue
                        placeholder={t(
                          'holidays.modal.selectEmployeeReplacement'
                        )}
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
                            String(e.employee_id) !== String(selectedEmployeeId)
                        )
                        .map((emp) => (
                          <SelectItem
                            key={emp.employee_id}
                            value={String(emp.employee_id)}
                            className={selectItemClass}
                          >
                            {emp.employee_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            )}
          </div>

          <div className={isArabic ? 'text-right' : 'text-left'}>
            <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('holidays.modal.attachment')}
            </Label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              className={`mt-1.5 flex items-center gap-3 ${
                isArabic ? 'flex-row-reverse justify-end' : ''
              }`}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                {t('holidays.modal.chooseFile')}
              </Button>

              <span className="text-xs text-gray-500">
                {t('holidays.modal.imagesOrPdf')}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              {(watchedPdf.length > 0 || watchedImages.length > 0) && (
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
                        {t('holidays.modal.fileAttached')}
                      </span>

                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}

                  {watchedImages.map((f) => (
                    <div
                      key={f.name}
                      className={`flex items-center gap-2 text-sm text-green-600 ${
                        isArabic ? 'flex-row-reverse justify-end' : ''
                      }`}
                    >
                      <span className="text-base">✓</span>

                      <span className="font-medium">
                        {t('holidays.modal.fileAttached')}
                      </span>

                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}

                  <p className="text-xs italic text-gray-500">
                    {t('holidays.modal.noteFileAttached')}
                  </p>
                </>
              )}

              {isEdit &&
                Array.isArray(holiday?.pdf) &&
                holiday.pdf.filter(Boolean).length > 0 && (
                  <div className="text-sm text-gray-700">
                    {t('holidays.modal.currentPdf')}{' '}
                    <a
                      href={holiday.pdf.find(Boolean)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {t('holidays.modal.open')}
                    </a>
                  </div>
                )}

              {isEdit &&
                Array.isArray(holiday?.images) &&
                holiday.images.filter(Boolean).length > 0 && (
                  <div className="mt-2">
                    <p className="mb-2 text-sm text-gray-700">
                      {t('holidays.modal.currentImages')}
                    </p>

                    <div
                      className={`flex flex-wrap gap-2 ${
                        isArabic ? 'justify-end' : ''
                      }`}
                    >
                      {holiday.images.filter(Boolean).map((url, idx) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                          title={t('holidays.modal.openImage')}
                        >
                          <img
                            src={url}
                            alt={`Holiday image ${idx + 1}`}
                            className="h-16 w-16 rounded border object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {isEdit &&
                hasExistingFiles &&
                watchedPdf.length === 0 &&
                watchedImages.length === 0 && (
                  <p className="text-xs italic text-gray-500">
                    {t('holidays.modal.noteReplaceFile')}
                  </p>
                )}

              {!isEdit &&
                watchedPdf.length === 0 &&
                watchedImages.length === 0 && (
                  <p className="text-xs text-gray-500">
                    {t('holidays.modal.noFileAttached')}
                  </p>
                )}
            </div>
          </div>

          <FormField name="reason" label={t('holidays.modal.reason')}>
            {({ field }) => (
              <Textarea
                {...field}
                dir={dir}
                placeholder={t('holidays.modal.reasonPlaceholder')}
                className={inputClass}
              />
            )}
          </FormField>

          <DialogFooter
            className={
              isArabic ? 'flex-row-reverse justify-start' : 'justify-end'
            }
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('holidays.modal.cancel')}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? t('holidays.modal.saving')
                : isEdit
                  ? t('holidays.modal.updateRequest')
                  : t('holidays.modal.save')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}