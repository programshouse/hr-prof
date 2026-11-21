import React, { useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { formatEmployeeSelectLabel } from '@/lib/utils/employeeDisplayName';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { salariesApi } from '../api/salariesApi';
import { useAllEmployees, useAllDepartments } from '@/shared/hooks';
import DatePickerInput from '@/components/ui/date-picker-input';

const createFormSchema = (t) => {
  const SalaryDetailSchema = z.object({
    department_id: z.string().min(1, t('salaries.validation.departmentRequired')),
    department_name: z.string().optional(),
    amount: z
      .string()
      .min(1, t('salaries.validation.amountRequired'))
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
        message: t('salaries.validation.amountPositive'),
      }),
  });

  return z
    .object({
      employee_id: z.string().min(1, t('salaries.validation.employeeRequired')),
      effective_from: z.string().min(1, t('salaries.validation.effectiveDateRequired')),
      salary_type: z.enum(['single', 'multi'], {
        required_error: t('salaries.validation.salaryTypeRequired'),
      }),
      base_salary: z
        .string()
        .min(1, t('salaries.validation.baseSalaryRequired'))
        .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
          message: t('salaries.validation.baseSalaryPositive'),
        }),
      kpi: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === '' || (!isNaN(Number(v)) && Number(v) >= 0), {
          message: t('salaries.validation.kpiPositive'),
        }),
      commission_percentage: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === '' || (!isNaN(Number(v)) && Number(v) >= 0), {
          message: t('salaries.validation.commissionPositive'),
        }),
      change_type: z.string().optional(),
      notes: z.string().optional(),
      salary_details: z.array(SalaryDetailSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.salary_type === 'multi') {
        if (!data.salary_details || data.salary_details.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['salary_details'],
            message: t('salaries.validation.addDepartmentAmount'),
          });
        }
      }
    });
};

export default function EditSalaryUpdateModal({
  open,
  onOpenChange,
  onSuccess,
  salaryUpdateId,
  initialData,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const formSchema = useMemo(() => createFormSchema(t), [t]);

  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useAllEmployees();
  const { data: departmentsData = [] } = useAllDepartments();

  const {
    data: salaryUpdate,
    isLoading: salaryUpdateLoading,
    error: salaryUpdateError,
  } = useQuery({
    queryKey: ['salaryUpdate', salaryUpdateId],
    queryFn: () => salariesApi.getSalaryChange(salaryUpdateId),
    enabled: !!salaryUpdateId && open && !initialData,
    retry: 2,
  });

  const currentData = initialData || salaryUpdate?.data || salaryUpdate;

  const availableDepartments = useMemo(() => {
    return departmentsData.map((dept) => ({
      id: String(dept.id),
      name: isArabic ? dept.name_ar || dept.name_en || dept.name : dept.name_en || dept.name || dept.name_ar,
    }));
  }, [departmentsData, isArabic]);

  const updateMutation = useMutation({
    mutationFn: ({ data: mutationData, id }) => salariesApi.updateSalaryChange(id, mutationData),
    onSuccess: () => {
      toast.success(t('salaries.messages.updateSuccess', 'Salary update updated successfully'));
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(t('salaries.messages.updateError', 'Failed to update salary update'));
      console.error('Update error:', error);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      effective_from: '',
      salary_type: 'single',
      base_salary: '',
      kpi: '',
      commission_percentage: '',
      change_type: '',
      notes: '',
      salary_details: [],
    },
  });

  const salaryType = watch('salary_type');
  const selectedEmployee = watch('employee_id');
  const selectedChangeType = watch('change_type');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'salary_details',
  });

  useEffect(() => {
    if (!currentData) return;

    const toDate = (v) => {
      if (!v) return '';
      try {
        return new Date(v).toISOString().split('T')[0];
      } catch {
        return String(v).split('T')[0];
      }
    };

    const nameToId = new Map(
      availableDepartments.map((d) => [String(d.name).trim().toLowerCase(), d.id])
    );

    const details = Array.isArray(currentData.salary_details)
      ? currentData.salary_details.map((row) => ({
          department_id: row.department_id
            ? String(row.department_id)
            : nameToId.get(String(row.department_name || '').trim().toLowerCase()) || '',
          department_name: row.department_name || '',
          amount: String(row.amount ?? 0),
        }))
      : [];

    reset({
      employee_id: String(currentData.employee_id || currentData.employee?.id || ''),
      effective_from: toDate(currentData.effective_from),
      salary_type: currentData.salary_type || 'single',
      base_salary: String(currentData.base_salary ?? ''),
      kpi: String(currentData.kpi ?? ''),
      commission_percentage:
        currentData.commission_percentage !== null && currentData.commission_percentage !== undefined
          ? String(currentData.commission_percentage)
          : '',
      change_type: currentData.change_type || '',
      notes: currentData.notes || '',
      salary_details: details,
    });
  }, [currentData, reset, availableDepartments]);

  const onSubmit = (data) => {
    const payload = {
      effective_from: data.effective_from,
      salary_type: data.salary_type,
      base_salary: Number(data.base_salary),
      kpi: data.kpi ? Number(data.kpi) : 0,
      commission_percentage: data.commission_percentage ? Number(data.commission_percentage) : null,
      change_type: data.change_type || null,
      notes: data.notes || null,
    };

    if (data.salary_type === 'multi') {
      payload.salary_details = (data.salary_details || []).map((row) => {
        const department = availableDepartments.find((d) => d.id === row.department_id);

        return {
          department_id: row.department_id,
          department_name: department ? department.name : row.department_name || '',
          amount: Number(row.amount),
        };
      });
    } else {
      payload.salary_details = [];
    }

    updateMutation.mutate({
      data: payload,
      id: salaryUpdateId || currentData?.id,
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir={dir} className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
            {t('salaries.editSalaryUpdateModal.title', 'Edit Salary Update')}
          </DialogTitle>
        </DialogHeader>

        {salaryUpdateLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-600">
              {t('salaries.editSalaryUpdateModal.loading', 'Loading salary update...')}
            </div>
          </div>
        ) : salaryUpdateError ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="text-sm text-red-600">
              {t('salaries.editSalaryUpdateModal.loadError', 'Failed to load salary update data. Please try again.')}
            </div>

            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              {t('common.retry', 'Retry')}
            </Button>
          </div>
        ) : currentData ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('salaries.addSalaryUpdateModal.selectEmployee')} *</Label>
                <Select
                  value={selectedEmployee}
                  onValueChange={(value) => setValue('employee_id', value, { shouldValidate: true })}
                  disabled={employeesLoading}
                >
                  <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                    <SelectValue
                      placeholder={
                        employeesLoading
                          ? t('common.loading')
                          : t('salaries.addSalaryUpdateModal.selectEmployee')
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {employeesLoading ? (
                      <div className="p-2 text-sm text-slate-500">{t('common.loading')}</div>
                    ) : employeesError ? (
                      <div className="p-2 text-sm text-red-500">
                        {t('salaries.editSalaryUpdateModal.employeesLoadError', 'Failed to load employees')}
                      </div>
                    ) : employees.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">
                        {t('emptyStates.noEmployeesFound', 'No employees found')}
                      </div>
                    ) : (
                      employees.map((employee) => (
                        <SelectItem key={employee.employee_id} value={String(employee.employee_id)}>
                          {formatEmployeeSelectLabel(employee, { preferArabic: isArabic })}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {errors.employee_id && (
                  <p className="text-sm text-red-500">{errors.employee_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_from">
                  {t('salaries.addSalaryUpdateModal.effectiveDate')} *
                </Label>
                <DatePickerInput
                  value={watch('effective_from') || ''}
                  onChange={(v) => setValue('effective_from', v, { shouldValidate: true })}
                  className={errors.effective_from ? '[&_input]:border-red-500' : ''}
                />
                {errors.effective_from && (
                  <p className="text-sm text-red-500">{errors.effective_from.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('salaries.addSalaryUpdateModal.salaryType')} *</Label>
                <Select
                  value={salaryType}
                  onValueChange={(value) => setValue('salary_type', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={errors.salary_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">{t('common.single')}</SelectItem>
                    <SelectItem value="multi">{t('common.multi')}</SelectItem>
                  </SelectContent>
                </Select>

                {errors.salary_type && (
                  <p className="text-sm text-red-500">{errors.salary_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_salary">
                  {t('salaries.addSalaryUpdateModal.baseSalary')} *
                </Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('base_salary')}
                  className={errors.base_salary ? 'border-red-500' : ''}
                />
                {errors.base_salary && (
                  <p className="text-sm text-red-500">{errors.base_salary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpi">{t('salaries.addSalaryUpdateModal.kpi')}</Label>
                <Input
                  id="kpi"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('kpi')}
                  className={errors.kpi ? 'border-red-500' : ''}
                />
                {errors.kpi && <p className="text-sm text-red-500">{errors.kpi.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission_percentage">
                  {t('salaries.addSalaryUpdateModal.commissionPercentage')}
                </Label>
                <Input
                  id="commission_percentage"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...register('commission_percentage')}
                  className={errors.commission_percentage ? 'border-red-500' : ''}
                />
                {errors.commission_percentage && (
                  <p className="text-sm text-red-500">{errors.commission_percentage.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{t('salaries.addSalaryUpdateModal.changeType')}</Label>
                <Select
                  value={selectedChangeType}
                  onValueChange={(value) => setValue('change_type', value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('salaries.addSalaryUpdateModal.selectChangeType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual_increase">
                      {t('salaries.changeTypes.annualIncrease')}
                    </SelectItem>
                    <SelectItem value="decrease">
                      {t('salaries.changeTypes.decrease')}
                    </SelectItem>
                    <SelectItem value="promotion">
                      {t('salaries.changeTypes.promotion')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary Details - Only show when salary_type is multi */}
            {salaryType === 'multi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Label>
                    {t('salaries.addSalaryUpdateModal.salaryDetails')} (
                    {t('salaries.addSalaryUpdateModal.departments')})
                  </Label>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ department_id: '', department_name: '', amount: '0' })}
                  >
                    <Plus className={isArabic ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                    {t('common.add')}
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-12"
                    >
                      <div className="space-y-2 md:col-span-7">
                        <Label className="text-xs text-slate-600">
                          {t('salaries.addSalaryUpdateModal.department')}
                        </Label>

                        <Select
                          value={watch(`salary_details.${index}.department_id`) || ''}
                          onValueChange={(v) =>
                            setValue(`salary_details.${index}.department_id`, v, {
                              shouldValidate: true,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('departments.selectDepartment')} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDepartments.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {errors.salary_details?.[index]?.department_id && (
                          <p className="text-sm text-red-500">
                            {errors.salary_details[index].department_id.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-4">
                        <Label className="text-xs text-slate-600">
                          {t('salaries.addSalaryUpdateModal.amount')}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`salary_details.${index}.amount`)}
                        />
                        {errors.salary_details?.[index]?.amount && (
                          <p className="text-sm text-red-500">
                            {errors.salary_details[index].amount.message}
                          </p>
                        )}
                      </div>

                      <div className="flex md:col-span-1 md:items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-600"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.salary_details && typeof errors.salary_details.message === 'string' && (
                  <p className="text-sm text-red-500">{errors.salary_details.message}</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('salaries.addSalaryUpdateModal.notes')}</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder={t('salaries.addSalaryUpdateModal.notesPlaceholder')}
                {...register('notes')}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateMutation.isPending || updateMutation.isLoading}
              >
                {t('common.cancel')}
              </Button>

              <Button type="submit" disabled={updateMutation.isPending || updateMutation.isLoading}>
                {updateMutation.isPending || updateMutation.isLoading
                  ? t('salaries.editSalaryUpdateModal.updating', 'Updating...')
                  : t('salaries.editSalaryUpdateModal.updateButton', 'Update Salary Update')}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-600">
              {t('salaries.editSalaryUpdateModal.noData', 'No salary update data available')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}