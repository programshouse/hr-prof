// src/features/exceptions/components/EditExceptionDialog.jsx
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { updateExceptionSchema } from '../schemas/exceptions.schema';
import { useAllEmployees } from '@/shared/hooks';
import { normalizeEmployeesForSelect } from '@/lib/utils/employeeDisplayName';
import { useAuthStore } from '@/services/auth/auth.store';

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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';

function toDateObj(value) {
  if (!value) return null;

  try {
    const d = typeof value === 'string' ? parseISO(value) : value;
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

function toEnglishPeriod(value) {
  return String(value || '')
    .replace(/ص/g, 'AM')
    .replace(/م/g, 'PM')
    .replace(/\bA\.M\.\b/gi, 'AM')
    .replace(/\bP\.M\.\b/gi, 'PM');
}

function toArabicPeriod(value) {
  return String(value || '')
    .replace(/\bAM\b/gi, 'ص')
    .replace(/\bPM\b/gi, 'م')
    .replace(/\bA\.M\.\b/gi, 'ص')
    .replace(/\bP\.M\.\b/gi, 'م');
}

function toTimeHHmm(value) {
  if (!value) return '';

  const raw = toEnglishPeriod(value).trim();

  const twelveHourMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (Number.isNaN(hour) || Number.isNaN(minute)) return '';
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return '';

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const timeMatch = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!timeMatch) return '';

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return '';
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatTimeForDisplay(value, isArabic) {
  const time = toTimeHHmm(value);
  if (!time) return '';

  const [hh, mm] = time.split(':');
  let hour = Number(hh);

  if (Number.isNaN(hour)) return '';

  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return isArabic
    ? `${String(hour).padStart(2, '0')}:${mm} ${toArabicPeriod(period)}`
    : `${String(hour).padStart(2, '0')}:${mm} ${period}`;
}

function normalizeEmployees(raw = [], isArabic = false) {
  return normalizeEmployeesForSelect(raw, { preferArabic: isArabic });
}

export function EditExceptionDialog({
  open,
  onOpenChange,
  exception,
  onSubmit,
  submitting = false,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const inputClass = isArabic ? 'text-right' : 'text-left';
  const { role } = useAuthStore();
  const isEmployee = role === 'employee';

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [startTimeDisplay, setStartTimeDisplay] = useState('');
  const [endTimeDisplay, setEndTimeDisplay] = useState('');

  const { data: employeesRaw = [] } = useAllEmployees();
  const employees = useMemo(
    () => normalizeEmployees(employeesRaw, isArabic),
    [employeesRaw, isArabic]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateExceptionSchema),
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
  const watchedStatus = watch('status');

  useEffect(() => {
    if (!open) return;

    if (exception) {
      const empIds = exception.employee_id ? [String(exception.employee_id)] : [];
      setValue('employee_ids', empIds);

      const fromD = toDateObj(exception.from_date || exception.date);
      setSelectedFromDate(fromD);

      const rawFromDate = exception.from_date || exception.date || '';
      const fromDateValue = fromD ? format(fromD, 'yyyy-MM-dd') : rawFromDate;

      setValue('from_date', fromDateValue, {
        shouldValidate: true,
        shouldDirty: false,
      });

      const toD = toDateObj(exception.to_date || exception.date);
      setSelectedToDate(toD);

      const rawToDate = exception.to_date || exception.date || '';
      const toDateValue = toD ? format(toD, 'yyyy-MM-dd') : rawToDate;

      setValue('to_date', toDateValue, {
        shouldValidate: true,
        shouldDirty: false,
      });

      const startTime = toTimeHHmm(exception.start_time);
      const endTime = toTimeHHmm(exception.end_time);

      setValue('start_time', startTime);
      setValue('end_time', endTime);

      setStartTimeDisplay(formatTimeForDisplay(startTime, isArabic));
      setEndTimeDisplay(formatTimeForDisplay(endTime, isArabic));

      setValue('reason', exception.reason ?? '');
      setValue('status', exception.status || 'pending');
    }
  }, [open, exception, setValue, isArabic]);

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

  const handleTimeChange = (fieldName, value) => {
    const apiTime = toTimeHHmm(value);

    if (fieldName === 'start_time') {
      setStartTimeDisplay(value);
    } else {
      setEndTimeDisplay(value);
    }

    if (apiTime) {
      setValue(fieldName, apiTime, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleTimeBlur = (fieldName) => {
    if (fieldName === 'start_time') {
      setStartTimeDisplay(formatTimeForDisplay(watch('start_time'), isArabic));
    } else {
      setEndTimeDisplay(formatTimeForDisplay(watch('end_time'), isArabic));
    }
  };

  const closeAndReset = () => {
    reset();
    setSelectedFromDate(null);
    setSelectedToDate(null);
    setStartTimeDisplay('');
    setEndTimeDisplay('');
    onOpenChange?.(false);
  };

  const submit = (values) => {
    const payload = {
      employee_ids: values.employee_ids,
      from_date: values.from_date,
      to_date: values.to_date,
      data: {
        start_time: toTimeHHmm(values.start_time),
        end_time: toTimeHHmm(values.end_time),
        reason: values.reason || '',
        status: values.status || 'pending',
      },
    };

    onSubmit?.(payload);
    closeAndReset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeAndReset();
        else onOpenChange?.(true);
      }}
    >
      <DialogContent
        dir={dir}
        className={`sm:max-w-[480px] ${
          isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'
        }`}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('exceptions.editException.title')}
          </DialogTitle>

          <DialogDescription className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('exceptions.editException.description')}
          </DialogDescription>
        </DialogHeader>

        <form
          dir={dir}
          onSubmit={handleSubmit(submit)}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div className="space-y-2">
            <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('exceptions.editException.employees')}
            </Label>

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
              placeholder={t('exceptions.editException.selectEmployees')}
              searchPlaceholder={t('exceptions.editException.searchEmployees')}
            />

            {errors.employee_ids && (
              <p className={`text-sm text-red-500 ${isArabic ? 'text-right' : 'text-left'}`}>
                {errors.employee_ids.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('exceptions.editException.fromDate')}
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
                      : t('exceptions.editException.datePlaceholder')}
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

              <input type="hidden" {...register('from_date')} />

              {errors.from_date && (
                <p className={`text-sm text-red-500 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {errors.from_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={`block ${isArabic ? 'text-right' : 'text-left'}`}>
                {t('exceptions.editException.toDate')}
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
                      : t('exceptions.editException.datePlaceholder')}
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

              <input type="hidden" {...register('to_date')} />

              {errors.to_date && (
                <p className={`text-sm text-red-500 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {errors.to_date.message}
                </p>
              )}
            </div>
          </div>

          <input type="hidden" {...register('start_time')} />
          <input type="hidden" {...register('end_time')} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="start_time_display"
                className={`block ${isArabic ? 'text-right' : 'text-left'}`}
              >
                {t('exceptions.editException.from')}
              </Label>

              <Input
                id="start_time_display"
                dir={dir}
                type="text"
                inputMode="text"
                placeholder={isArabic ? 'مثال: 09:00 ص' : 'Example: 09:00 AM'}
                className={inputClass}
                value={startTimeDisplay}
                onChange={(e) => handleTimeChange('start_time', e.target.value)}
                onBlur={() => handleTimeBlur('start_time')}
              />

              {errors.start_time && (
                <p className={`text-sm text-red-500 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {errors.start_time.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="end_time_display"
                className={`block ${isArabic ? 'text-right' : 'text-left'}`}
              >
                {t('exceptions.editException.to')}
              </Label>

              <Input
                id="end_time_display"
                dir={dir}
                type="text"
                inputMode="text"
                placeholder={isArabic ? 'مثال: 05:00 م' : 'Example: 05:00 PM'}
                className={inputClass}
                value={endTimeDisplay}
                onChange={(e) => handleTimeChange('end_time', e.target.value)}
                onBlur={() => handleTimeBlur('end_time')}
              />

              {errors.end_time && (
                <p className={`text-sm text-red-500 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {errors.end_time.message}
                </p>
              )}
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
              {t('exceptions.editException.reason')}
            </Label>

            <Textarea
              id="reason"
              dir={dir}
              placeholder={t('exceptions.editException.enterReason')}
              className={inputClass}
              {...register('reason')}
            />
          </div>

          <div className={`flex gap-2 ${isArabic ? 'justify-start' : 'justify-end'}`}>
            <Button type="button" variant="outline" onClick={closeAndReset}>
              {t('common.cancel')}
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.saving') : t('exceptions.editException.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}