// src/features/exceptions/components/AddExceptionDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAllEmployees } from '@/shared/hooks';
import { useTranslation } from 'react-i18next';
import { normalizeEmployeesForSelect } from '@/lib/utils/employeeDisplayName';
import { useAuthStore } from '@/services/auth/auth.store';

function normalizeEmployees(raw = [], isArabic = false) {
  return normalizeEmployeesForSelect(raw, { preferArabic: isArabic });
}

export function AddExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValues = null,
  lockEmployeeSelection = false,
  submitting = false,
  employeeName = null,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const { role, authSource } = useAuthStore();
  const isEmployee = role === 'employee';
  const isEmployeeLogin = authSource === 'employee-login';

  // When opened from the employee profile in employee-login mode, show the
  // employee's name as static read-only text instead of the combobox.
  const showStaticEmployee = isEmployeeLogin && lockEmployeeSelection;

  const { data: employeesRaw = [] } = useAllEmployees();
  const employees = useMemo(() => normalizeEmployees(employeesRaw, isArabic), [employeesRaw, isArabic]);

  const inputClass = isArabic ? 'text-right' : 'text-left';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employee_ids: [],
      from_date: '',
      to_date: '',
      start_time: '',
      end_time: '',
      reason: '',
      status: 'pending',
    },
  });

  const selectedEmployees = watch('employee_ids');
  const watchedFromDate = watch('from_date');
  const watchedToDate = watch('to_date');
  const watchedStatus = watch('status');

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      const nextValues = {
        employee_ids: initialValues.employee_ids || [],
        from_date: initialValues.from_date || '',
        to_date: initialValues.to_date || '',
        start_time: initialValues.start_time || '',
        end_time: initialValues.end_time || '',
        reason: initialValues.reason || '',
        status: initialValues.status || 'pending',
      };

      reset(nextValues);
      setSelectedFromDate(nextValues.from_date ? parseISO(nextValues.from_date) : null);
      setSelectedToDate(nextValues.to_date ? parseISO(nextValues.to_date) : null);
      return;
    }

    reset({
      employee_ids: [],
      from_date: '',
      to_date: '',
      start_time: '',
      end_time: '',
      reason: '',
      status: 'pending',
    });
    setSelectedFromDate(null);
    setSelectedToDate(null);
  }, [open, initialValues, reset]);

  const handleFromDateSelect = (date) => {
    setSelectedFromDate(date);
    setValue('from_date', date ? format(date, 'yyyy-MM-dd') : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleToDateSelect = (date) => {
    setSelectedToDate(date);
    setValue('to_date', date ? format(date, 'yyyy-MM-dd') : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFormSubmit = (values) => {
    onSubmit?.({
      employee_ids: values.employee_ids,
      from_date: values.from_date,
      to_date: values.to_date,
      start_time: values.start_time,
      end_time: values.end_time,
      reason: values.reason || null,
      status: values.status || 'pending',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          sm:max-w-[425px]
          ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
        `}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('exceptions.addNewException')}
          </DialogTitle>

          <DialogDescription className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('exceptions.createNewScheduleException')}
          </DialogDescription>
        </DialogHeader>

        <form
          dir={dir}
          onSubmit={handleSubmit(handleFormSubmit)}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="space-y-2">
            <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('exceptions.employees')}
            </Label>

            {showStaticEmployee ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                {employeeName || '—'}
              </div>
            ) : (
              <EmployeeMultiSelectCombobox
                dir={dir}
                value={selectedEmployees}
                onChange={(value) =>
                  setValue('employee_ids', value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                employees={employees}
                placeholder={t('exceptions.selectEmployees')}
                searchPlaceholder={t('exceptions.searchEmployees')}
                disabled={lockEmployeeSelection}
                removable={!lockEmployeeSelection}
              />
            )}

            {errors.employee_ids && (
              <p className={`text-sm text-red-500 ${isArabic ? 'text-right' : 'text-left'}`}>
                {errors.employee_ids.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('exceptions.fromDate')}
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    dir={dir}
                    type="button"
                    variant="outline"
                    className={`w-full font-normal ${
                      isArabic ? 'justify-end text-right' : 'justify-start text-left'
                    }`}
                  >
                    <CalendarIcon className={`${isArabic ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {selectedFromDate
                      ? format(selectedFromDate, 'dd/MM/yy')
                      : t('exceptions.editException.datePlaceholder', t('common.datePlaceholder'))}
                  </Button>
                </PopoverTrigger>

                <PopoverContent dir={dir} className="w-auto p-0" align={isArabic ? 'end' : 'start'}>
                  <Calendar
                    mode="single"
                    selected={selectedFromDate}
                    onSelect={handleFromDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <input type="hidden" {...register('from_date')} value={watchedFromDate || ''} />
            </div>

            <div className="space-y-2">
              <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('exceptions.toDate')}
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    dir={dir}
                    type="button"
                    variant="outline"
                    className={`w-full font-normal ${
                      isArabic ? 'justify-end text-right' : 'justify-start text-left'
                    }`}
                  >
                    <CalendarIcon className={`${isArabic ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {selectedToDate
                      ? format(selectedToDate, 'dd/MM/yy')
                      : t('exceptions.editException.datePlaceholder', t('common.datePlaceholder'))}
                  </Button>
                </PopoverTrigger>

                <PopoverContent dir={dir} className="w-auto p-0" align={isArabic ? 'end' : 'start'}>
                  <Calendar
                    mode="single"
                    selected={selectedToDate}
                    onSelect={handleToDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <input type="hidden" {...register('to_date')} value={watchedToDate || ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('exceptions.from')}
              </Label>

              <Input
                id="start_time"
                dir={dir}
                type="time"
                className={inputClass}
                {...register('start_time')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('exceptions.to')}
              </Label>

              <Input
                id="end_time"
                dir={dir}
                type="time"
                className={inputClass}
                {...register('end_time')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('exceptions.status')}
            </Label>

            <Select
              value={watchedStatus}
              onValueChange={(val) => setValue('status', val, { shouldDirty: true })}
            >
              <SelectTrigger dir={dir} className={inputClass}>
                <SelectValue placeholder={t('exceptions.selectStatus')} />
              </SelectTrigger>
              <SelectContent dir={dir}>
                <SelectItem value="pending">{t('exceptions.statuses.pending')}</SelectItem>
                {!isEmployee && <SelectItem value="approved">{t('exceptions.statuses.approved')}</SelectItem>}
                {!isEmployee && <SelectItem value="rejected">{t('exceptions.statuses.rejected')}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('exceptions.reasonOptional')}
            </Label>

            <Textarea
              id="reason"
              dir={dir}
              placeholder={t('exceptions.enterReasonForException')}
              className={inputClass}
              {...register('reason')}
            />
          </div>

          <div className={`flex gap-2 ${isArabic ? 'justify-start' : 'justify-end'}`}>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              {t('common.cancel')}
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? t('exceptions.saving') : t('exceptions.addException')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}