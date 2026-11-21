import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAllEmployees } from '@/shared/hooks';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(1, 'Year is required'),
  task_name: z.string().min(1, 'Task name is required'),
  cost: z.string().min(1, 'Cost is required'),
});

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const { data: employeesData = [], isLoading: employeesLoadingData } =
    useAllEmployees(open);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      employee_id: '',
      month: '',
      year: new Date().getFullYear().toString(),
      task_name: '',
      cost: '',
    },
  });

  const watchedEmployeeId = watch('employee_id');
  const watchedMonth = watch('month');
  const watchedYear = watch('year');

  useEffect(() => {
    if (!open) return;

    if (task) {
      reset({
        employee_id: String(
          task?.employee_id ??
            task?.employee?.employee_id ??
            task?.employee?.id ??
            ''
        ),
        month: task?.month?.toString() || '',
        year: task?.year?.toString() || new Date().getFullYear().toString(),
        task_name: task?.task_name || '',
        cost: task?.cost?.toString() || '',
      });
    } else {
      reset({
        employee_id: '',
        month: '',
        year: new Date().getFullYear().toString(),
        task_name: '',
        cost: '',
      });
    }
  }, [open, task, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      employee_id: Number(data.employee_id),
      month: Number(data.month),
      year: Number(data.year),
      task_name: data.task_name.trim(),
      cost: Number(data.cost),
    });
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      reset({
        employee_id: '',
        month: '',
        year: new Date().getFullYear().toString(),
        task_name: '',
        cost: '',
      });
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{task ? t('tasks.editTask') : t('tasks.createNewTask')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('tables.headers.employee')} *</label>

            <EmployeeCombobox
              value={watchedEmployeeId || ''}
              onChange={(value) =>
                setValue('employee_id', String(value || ''), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              employees={employeesData}
              loading={employeesLoadingData}
              placeholder={t('tasks.selectEmployee')}
              searchPlaceholder={t('tasks.searchEmployee')}
              disabled={employeesLoadingData}
              className={errors.employee_id ? 'border-red-500' : ''}
            />

            {errors.employee_id && (
              <p className="text-xs text-red-500">
                {errors.employee_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('tables.headers.month')} *</label>

              <Select
                value={watchedMonth || ''}
                onValueChange={(value) =>
                  setValue('month', value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className={cn(errors.month && 'border-red-500')}>
                  <SelectValue placeholder={t('tasks.selectMonth')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">{t('months.january')}</SelectItem>
                  <SelectItem value="2">{t('months.february')}</SelectItem>
                  <SelectItem value="3">{t('months.march')}</SelectItem>
                  <SelectItem value="4">{t('months.april')}</SelectItem>
                  <SelectItem value="5">{t('months.may')}</SelectItem>
                  <SelectItem value="6">{t('months.june')}</SelectItem>
                  <SelectItem value="7">{t('months.july')}</SelectItem>
                  <SelectItem value="8">{t('months.august')}</SelectItem>
                  <SelectItem value="9">{t('months.september')}</SelectItem>
                  <SelectItem value="10">{t('months.october')}</SelectItem>
                  <SelectItem value="11">{t('months.november')}</SelectItem>
                  <SelectItem value="12">{t('months.december')}</SelectItem>
                </SelectContent>
              </Select>

              {errors.month && (
                <p className="text-xs text-red-500">{errors.month.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('tables.headers.year')} *</label>

              <Select
                value={watchedYear || ''}
                onValueChange={(value) =>
                  setValue('year', value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className={cn(errors.year && 'border-red-500')}>
                  <SelectValue placeholder={t('tasks.selectYear')} />
                </SelectTrigger>

                <SelectContent>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.year && (
                <p className="text-xs text-red-500">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('tables.headers.taskName')} *</label>

            <Input
              {...register('task_name')}
              placeholder={t('tasks.enterTaskName')}
              className={cn(errors.task_name && 'border-red-500')}
            />

            {errors.task_name && (
              <p className="text-xs text-red-500">
                {errors.task_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('tables.headers.cost')} *</label>

            <Input
              {...register('cost')}
              type="number"
              min="0"
              step="0.01"
              placeholder={t('tasks.enterCost')}
              className={cn(errors.cost && 'border-red-500')}
            />

            {errors.cost && (
              <p className="text-xs text-red-500">{errors.cost.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.loading')
                : task
                  ? t('tasks.updateTask')
                  : t('tasks.createTask')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}