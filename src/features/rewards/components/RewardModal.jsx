import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/services/auth/auth.store';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField } from '@/components/forms/Form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import DatePickerInput from '@/components/ui/date-picker-input';

import { useUpsertReward } from '../hooks/useUpsertReward';
import { useAllEmployees } from '@/shared/hooks';
import { formatEmployeeSelectLabel } from '@/lib/utils/employeeDisplayName';

import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';

const DEFAULT_VALUES = {
  employee_ids: [],
  date: '',
  type: '',
  calculation_type: 'fixed',
  amount: '',
  days_count: '0.25',
  other: '',
};

const createRewardSchema = (t) =>
  z
    .object({
      employee_ids: z
        .array(z.string())
        .min(1, t('rewards.modal.employeeRequired', 'At least one employee is required')),
      date: z.string().min(1, t('rewards.modal.dateRequired', 'Date is required')),
      type: z.string().min(1, t('rewards.modal.typeRequired', 'Type is required')),

      calculation_type: z.enum(['fixed', 'days'], {
        required_error: t(
          'rewards.modal.calculationTypeRequired',
          'Calculation type is required'
        ),
      }),

      amount: z.string().optional(),
      days_count: z.string().optional(),
      other: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.calculation_type === 'fixed') {
        if (!data.amount || data.amount.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: t('rewards.modal.amountRequired', 'Amount is required'),
          });
        } else if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: t('rewards.modal.amountMin', 'Amount must be greater than 0'),
          });
        }
      }

      if (data.calculation_type === 'days') {
        if (!data.days_count || data.days_count.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['days_count'],
            message: t('rewards.modal.daysCountRequired'),
          });
        } else {
          const daysValue = parseFloat(data.days_count);

          if (isNaN(daysValue) || daysValue < 0.25) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['days_count'],
              message: t('rewards.modal.daysCountMin'),
            });
          }
        }
      }
    });

function getRewardEmployeeIds(rewardData) {
  if (!rewardData) return [];

  if (Array.isArray(rewardData.employee_ids) && rewardData.employee_ids.length > 0) {
    return [String(rewardData.employee_ids[0])];
  }

  if (rewardData.employee_id) {
    return [String(rewardData.employee_id)];
  }

  if (rewardData.employee?.id) {
    return [String(rewardData.employee.id)];
  }

  if (rewardData.employee?.employee_id) {
    return [String(rewardData.employee.employee_id)];
  }

  return [];
}

function getRewardFormValues(reward, employeeIds) {
  if (!reward) {
    return {
      ...DEFAULT_VALUES,
      employee_ids: employeeIds || [],
    };
  }

  const calculationType = reward?.calculation_type || (reward?.days_count ? 'days' : 'fixed');

  return {
    employee_ids: employeeIds || [],
    date: reward?.date || '',
    type: reward?.type || '',
    calculation_type: calculationType,
    amount: calculationType === 'fixed' ? String(reward?.amount ?? '') : '',
    days_count: calculationType === 'days' ? String(reward?.days_count ?? '0.25') : '0.25',
    other: reward?.other || '',
  };
}

function getEmployeeDisplayName(employeeId, employees = [], reward = null, fallback = '—', preferArabic = false) {
  const id = String(employeeId || '');

  const employee = employees.find((emp) => {
    const empId = emp?.employee_id ?? emp?.id;
    return String(empId) === id;
  });

  if (employee) {
    return formatEmployeeSelectLabel(employee, { preferArabic }) || fallback;
  }

  const rewardEmployee = reward?.employee;

  if (rewardEmployee) {
    return formatEmployeeSelectLabel(rewardEmployee, { preferArabic }) || fallback;
  }

  return fallback;
}

export default function RewardModal({
  open,
  onOpenChange,
  reward,
  onSuccess,
  defaultEmployeeIds = [],
  employeeName = null,
}) {
  const isEditMode = !!reward;
  const rewardId = reward?.id || reward?.reward_id;

  const { create, update } = useUpsertReward();
  const { data: employees = [] } = useAllEmployees();

  const { t, i18n } = useTranslation();
  const { authSource } = useAuthStore();

  // In employee-login + create mode: show employee as static read-only text
  const isEmployeeLogin = authSource === 'employee-login';
  const showStaticEmployee = isEmployeeLogin && !isEditMode && defaultEmployeeIds.length > 0;

  const rewardSchema = useMemo(() => createRewardSchema(t), [t]);

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const inputClass = isArabic ? 'text-right' : 'text-left';

  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  const [typeSearch, setTypeSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const form = useForm({
    resolver: zodResolver(rewardSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const calculationType = form.watch('calculation_type');

  const rewardTypes = useMemo(
    () => [
      {
        value: 'additional_effort',
        label: t('rewards.modal.additionalEffort'),
      },
      {
        value: 'ideal_employee',
        label: t('rewards.modal.idealEmployee'),
      },
      {
        value: 'high_performance',
        label: t('rewards.modal.highPerformance'),
      },
    ],
    [t]
  );

  useEffect(() => {
    if (!open) return;

    const ids = isEditMode ? getRewardEmployeeIds(reward) : (defaultEmployeeIds.length ? defaultEmployeeIds : []);
    const values = getRewardFormValues(reward, ids);

    setSelectedEmployeeIds(ids);
    setTypeSearch('');
    form.reset(values);
  }, [open, isEditMode, reward, form]);

  useEffect(() => {
    if (open) return;

    setTypeSearch('');
    setSelectedEmployeeIds([]);
    form.reset(DEFAULT_VALUES);
  }, [open, form]);

  useEffect(() => {
    if (calculationType === 'fixed') {
      form.setValue('days_count', '0.25', {
        shouldValidate: false,
        shouldDirty: false,
      });
    }

    if (calculationType === 'days') {
      form.setValue('amount', '', {
        shouldValidate: false,
        shouldDirty: false,
      });

      if (!form.getValues('days_count')) {
        form.setValue('days_count', '0.25', {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [calculationType, form]);

  const handleEmployeeChange = (value) => {
    if (isEditMode) return;

    setSelectedEmployeeIds(value);

    form.setValue('employee_ids', value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSubmit = (data) => {
    if (!selectedEmployeeIds || selectedEmployeeIds.length === 0) {
      form.setError('employee_ids', {
        type: 'manual',
        message: t('rewards.modal.employeeRequired', 'At least one employee is required'),
      });
      return;
    }

    const employeeIdsForPayload = isEditMode ? [selectedEmployeeIds[0]] : selectedEmployeeIds;

    const commonValues = {
      employee_ids: employeeIdsForPayload,
      type: data.type,
      date: data.date,
      calculation_type: data.calculation_type,
      other: data.other || '',
    };

    const payload =
      data.calculation_type === 'fixed'
        ? {
            ...commonValues,
            amount: String(data.amount),
          }
        : {
            ...commonValues,
            days_count: String(data.days_count),
          };

    if (isEditMode) {
      if (!rewardId) {
        console.error('No reward ID for update');
        return;
      }

      update.mutate(
        {
          id: rewardId,
          values: payload,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      });
    }
  };

  const selectedEmployeeName = getEmployeeDisplayName(
    selectedEmployeeIds[0],
    employees,
    reward,
    t('common.na', '—'),
    isArabic
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-2xl
          ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
        `}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {isEditMode ? t('rewards.modal.editReward') : t('rewards.modal.addReward')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <FormField name="employee_ids" label={t('rewards.modal.employees')} required>
            {() =>
              isEditMode || showStaticEmployee ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {showStaticEmployee
                    ? (employeeName || selectedEmployeeName || '—')
                    : selectedEmployeeName}
                </div>
              ) : (
                <EmployeeMultiSelectCombobox
                  dir={dir}
                  value={selectedEmployeeIds}
                  onChange={handleEmployeeChange}
                  employees={employees}
                  placeholder={t('rewards.modal.selectEmployees')}
                  searchPlaceholder={t('rewards.modal.searchEmployees')}
                />
              )
            }
          </FormField>

          <FormField name="date" label={t('rewards.modal.date')} required>
            {({ field }) => (
              <DatePickerInput
                dir={dir}
                value={field.value}
                onChange={(iso) => field.onChange(iso)}
                placeholder={t('rewards.modal.datePlaceholder')}
                inputClassName={inputClass}
              />
            )}
          </FormField>

          <FormField name="type" label={t('rewards.modal.type')} required>
            {({ field }) => (
              <Select
                dir={dir}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setTypeSearch('');
                }}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder={t('rewards.modal.chooseType')}>
                    {rewardTypes.find((item) => item.value === field.value)?.label || field.value}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent
                  dir={dir}
                  align={isArabic ? 'end' : 'start'}
                  className={isArabic ? 'text-right' : 'text-left'}
                >
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <Input
                      dir={dir}
                      placeholder={t('rewards.modal.typeCustomOrSearch')}
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      className={`h-9 ${inputClass}`}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {rewardTypes
                    .filter((item) => item.label.toLowerCase().includes(typeSearch.toLowerCase()))
                    .map((item) => (
                      <SelectItem key={item.value} value={item.value} className={selectItemClass}>
                        {item.label}
                      </SelectItem>
                    ))}

                  {typeSearch &&
                    !rewardTypes.some(
                      (item) => item.label.toLowerCase() === typeSearch.toLowerCase()
                    ) && (
                      <SelectItem value={typeSearch} className={selectItemClass}>
                        {isArabic ? `إضافة "${typeSearch}"` : `Add "${typeSearch}"`}
                      </SelectItem>
                    )}

                  {field.value &&
                    !rewardTypes.some((item) => item.value === field.value) &&
                    field.value !== typeSearch && (
                      <SelectItem value={field.value} className={selectItemClass}>
                        {field.value}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField
            name="calculation_type"
            label={t('rewards.modal.calculationType')}
            required
          >
            {({ field }) => (
              <Select dir={dir} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder={t('rewards.modal.chooseCalculationType')} />
                </SelectTrigger>

                <SelectContent
                  dir={dir}
                  align={isArabic ? 'end' : 'start'}
                  className={isArabic ? 'text-right' : 'text-left'}
                >
                  <SelectItem value="fixed" className={selectItemClass}>
                    {t('rewards.modal.fixed')}
                  </SelectItem>

                  <SelectItem value="days" className={selectItemClass}>
                    {t('rewards.modal.days')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </FormField>

          {calculationType === 'fixed' && (
            <FormField name="amount" label={t('rewards.modal.amountEGP')} required>
              {({ field }) => (
                <Input
                  {...field}
                  dir={dir}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={t('rewards.modal.amountPlaceholder')}
                  className={inputClass}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            </FormField>
          )}

          {calculationType === 'days' && (
            <FormField name="days_count" label={t('rewards.modal.daysCount')} required>
              {({ field }) => {
                const value = parseFloat(field.value || '0.25');

                const increase = () => {
                  const current = isNaN(value) ? 0.25 : value;
                  const next = current + 0.25;

                  field.onChange(String(Number(next.toFixed(2))));
                };

                const decrease = () => {
                  const current = isNaN(value) ? 0.25 : value;
                  const next = Math.max(0.25, current - 0.25);

                  field.onChange(String(Number(next.toFixed(2))));
                };

                return (
                  <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 p-0"
                      onClick={decrease}
                    >
                      -
                    </Button>

                    <Input
                      {...field}
                      dir={dir}
                      type="number"
                      step="0.25"
                      min="0.25"
                      inputMode="decimal"
                      placeholder={t('rewards.modal.daysPlaceholder')}
                      className={inputClass}
                      onChange={(e) => field.onChange(e.target.value)}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 p-0"
                      onClick={increase}
                    >
                      +
                    </Button>
                  </div>
                );
              }}
            </FormField>
          )}

          <DialogFooter className={isArabic ? 'flex-row-reverse justify-start' : 'justify-end'}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('rewards.modal.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={
                update.isPending ||
                create.isPending ||
                (isEditMode && !rewardId) ||
                !selectedEmployeeIds ||
                selectedEmployeeIds.length === 0
              }
            >
              {update.isPending || create.isPending
                ? t('rewards.modal.saving')
                : isEditMode
                  ? t('rewards.modal.updateReward')
                  : t('rewards.modal.addReward')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}