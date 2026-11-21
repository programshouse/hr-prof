import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField } from '@/components/forms/Form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceSchema } from '../schemas/attendance.schema';
import { useAllEmployees } from '@/shared/hooks';
import { useTranslation } from 'react-i18next';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';

export function AddAttendanceDialog({ open, onOpenChange, date, onSubmit }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const { data: employeesData, isLoading: employeesLoading } = useAllEmployees(open);
  const employees = employeesData || [];

  const inputClass = isArabic ? 'text-right' : 'text-left';

  const now = new Date();

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const clockInTime = new Date(now.getTime() - 8 * 60 * 60 * 1000);

  const clockInValue = `${String(clockInTime.getHours()).padStart(2, '0')}:${String(
    clockInTime.getMinutes()
  ).padStart(2, '0')}`;

  const form = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: '',
      date: date || new Date(),
      clockIn: clockInValue,
      clockOut: currentTime,
    },
  });

  const handleSubmit = (data) => {
    const formattedData = {
      employee_id: parseInt(data.employeeId),
      date: format(data.date, 'yyyy-MM-dd'),
      check_in: data.clockIn,
      check_out: data.clockOut,
    };

    onSubmit(formattedData);
    form.reset({
      employeeId: '',
      date: date || new Date(),
      clockIn: clockInValue,
      clockOut: currentTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          sm:max-w-[600px]
          ${
            isArabic
              ? 'text-right [&>button]:left-4 [&>button]:right-auto'
              : 'text-left'
          }
        `}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle
            className={`w-full text-xl font-semibold ${
              isArabic ? 'text-right' : 'text-left'
            }`}
          >
            {t('attendance.addAttendanceModal.title')}
          </DialogTitle>

          <DialogDescription
            className={`w-full text-sm text-slate-500 ${
              isArabic ? 'text-right' : 'text-left'
            }`}
          >
            {t('attendance.addAttendanceModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg border p-6">
          <div className="mb-6 flex items-center gap-2 text-left ltr:text-left rtl:text-right">
            <User className="size-5" />
            <h3 className="text-lg font-semibold">
              {t('attendance.addAttendanceModal.addEmployeeAttendance')}
            </h3>
          </div>

          <Form form={form} onSubmit={handleSubmit} className="space-y-6">
            <div className={`grid gap-6 sm:grid-cols-2 ${isArabic ? 'text-right' : 'text-left'}`}>
              <FormField
                name="employeeId"
                label={t('attendance.addAttendanceModal.employeeName')}
                required
              >
                {({ field }) => (
                  <EmployeeCombobox
                    value={field.value || ''}
                    onChange={field.onChange}
                    employees={employees}
                    loading={employeesLoading}
                    placeholder={t('attendance.addAttendanceModal.selectEmployee')}
                    searchPlaceholder={t('attendance.addAttendanceModal.selectEmployee')}
                  />
                )}
              </FormField>

              <FormField name="date" label={t('attendance.addAttendanceModal.date')} required>
                {({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        dir={dir}
                        variant="input"
                        className={`w-full font-normal ${
                          isArabic ? 'justify-end text-right' : 'justify-start text-left'
                        }`}
                      >
                        <CalendarIcon className={`${isArabic ? 'ml-2' : 'mr-2'} size-4`} />

                        {field.value ? (
                          format(field.value, 'PP')
                        ) : (
                          <span>{t('common.datePlaceholder')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      dir={dir}
                      className="w-auto p-0"
                      align={isArabic ? 'end' : 'center'}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(selectedDate) => {
                          field.onChange(selectedDate);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormField
                name="clockIn"
                label={t('attendance.addAttendanceModal.clockIn')}
                required
              >
                {({ field }) => (
                  <Input
                    {...field}
                    dir="ltr"
                    type="time"
                    className="text-left"
                  />
                )}
              </FormField>

              <FormField
                name="clockOut"
                label={t('attendance.addAttendanceModal.clockOut')}
                required
              >
                {({ field }) => (
                  <Input
                    {...field}
                    dir="ltr"
                    type="time"
                    className="text-left"
                  />
                )}
              </FormField>
            </div>

            <div className={`flex gap-4 pt-4 ${isArabic ? 'justify-start' : 'justify-end'}`}>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>

              <Button type="submit">{t('attendance.addAttendanceModal.save')}</Button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}