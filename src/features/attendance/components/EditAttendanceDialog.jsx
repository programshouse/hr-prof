import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

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

import { attendanceSchema } from '../schemas/attendance.schema';

function getTimeValue(attendance, type) {
  if (!attendance) return '';

  if (type === 'in') {
    return (
      attendance.check_in ||
      attendance.clockIn ||
      attendance.clock_in ||
      attendance.check_in_at ||
      attendance.first_in_at ||
      attendance.firstInAt ||
      attendance.attendance?.check_in ||
      attendance.attendance?.check_in_at ||
      attendance.attendance?.first_in_at ||
      ''
    );
  }

  return (
    attendance.check_out ||
    attendance.clockOut ||
    attendance.clock_out ||
    attendance.check_out_at ||
    attendance.last_out_at ||
    attendance.lastOutAt ||
    attendance.attendance?.check_out ||
    attendance.attendance?.check_out_at ||
    attendance.attendance?.last_out_at ||
    ''
  );
}

function formatTimeForInput(timeValue) {
  if (!timeValue) return '';

  const raw = String(timeValue).trim();

  const timeMatch = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);

  if (!timeMatch) return '';

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return '';
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function EditAttendanceDialog({
  open,
  onOpenChange,
  attendance,
  onSubmit,
  isSubmitting,
  disableDate = false,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isRTL ? 'rtl' : 'ltr';

  const form = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: '',
      date: new Date(),
      clockIn: '',
      clockOut: '',
      shift: '',
    },
  });

  useEffect(() => {
    if (!attendance || !open) return;

    const oldClockIn = getTimeValue(attendance, 'in');
    const oldClockOut = getTimeValue(attendance, 'out');

    form.reset({
      employeeId: attendance.employee?.code?.toString() || attendance.employee_id?.toString() || '',
      date: attendance.date ? new Date(attendance.date) : new Date(),
      clockIn: formatTimeForInput(oldClockIn),
      clockOut: formatTimeForInput(oldClockOut),
      shift: attendance.employee?.shift || attendance.shift || '',
    });
  }, [attendance, open, form]);

  const handleSubmit = (data) => {
    const formattedData = {
      employee_id:
        attendance?.employee_id ??
        attendance?.employee?.id ??
        parseInt(String(data.employeeId), 10),

      date: format(data.date, 'yyyy-MM-dd'),
      check_in: data.clockIn,
      check_out: data.clockOut,
      shift: data.shift,
    };

    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`sm:max-w-[600px] ${
          isRTL ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'
        }`}
      >
        <DialogHeader className={isRTL ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle
            className={`w-full text-xl font-semibold ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {t('attendance.editAttendance.title', 'Edit Attendance')}
          </DialogTitle>

          <DialogDescription
            className={`w-full text-sm text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {t('attendance.editAttendance.description', 'Update employee attendance information')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg border p-6">
          <div
            className={`mb-6 flex items-center gap-2 ${
              isRTL ? 'flex-row-reverse justify-end text-right' : 'justify-start'
            }`}
          >
            <User className={`size-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />

            <h3 className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('attendance.editAttendance.editEmployeeAttendance', "Edit employee's attendance")}
            </h3>
          </div>

          <Form form={form} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                name="employeeId"
                label={t('attendance.editAttendance.employeeName', 'Employee Name')}
                required
              >
                {({ field }) => (
                  <Input
                    {...field}
                    dir={dir}
                    className={`bg-slate-50 ${isRTL ? 'text-right' : 'text-left'}`}
                    value={
                      attendance?.employee?.name
                        ? `${attendance.employee.code || attendance.employee_id} - ${
                            attendance.employee.name
                          }`
                        : field.value || t('common.loading', 'Loading...')
                    }
                    disabled
                  />
                )}
              </FormField>

              <FormField name="date" label={t('attendance.editAttendance.date', 'Date')} required>
                {({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        dir={dir}
                        variant="input"
                        disabled={disableDate}
                        className={`w-full font-normal ${
                          isRTL ? 'flex-row-reverse justify-between text-right' : 'justify-start'
                        }`}
                      >
                        <CalendarIcon className={`${isRTL ? 'ml-2' : 'mr-2'} size-4`} />

                        {field.value ? (
                          format(field.value, 'PP')
                        ) : (
                          <span>
                            {t('attendance.editAttendance.datePlaceholder', 'DD/MM/YYYY')}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    {!disableDate && (
                      <PopoverContent dir={dir} className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => field.onChange(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    )}
                  </Popover>
                )}
              </FormField>

              <FormField
                name="clockIn"
                label={t('attendance.editAttendance.clockIn', 'Clock In')}
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
                label={t('attendance.editAttendance.clockOut', 'Clock Out')}
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

            <div className={`flex gap-4 pt-4 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('attendance.editAttendance.updating', 'Updating...')
                  : t('common.update', 'Update')}
              </Button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}