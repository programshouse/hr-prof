import { useMemo, useEffect, useState } from 'react';
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

import { useUpsertPenalty } from '../hooks/useUpsertPenalty';
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

const createPenaltySchema = (t) =>
  z
    .object({
      employee_ids: z
        .array(z.string())
        .min(1, t('penalties.modal.employeeRequired', 'At least one employee is required')),
      date: z.string().min(1, t('penalties.modal.dateRequired', 'Date is required')),
      type: z.string().min(1, t('penalties.modal.typeRequired', 'Type is required')),
      calculation_type: z.enum(['fixed', 'days'], {
        required_error: t(
          'penalties.modal.calculationTypeRequired',
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
            message: t('penalties.modal.amountRequired', 'Amount is required'),
          });
        } else if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: t('penalties.modal.amountMin', 'Amount must be greater than 0'),
          });
        }
      }

      if (data.calculation_type === 'days') {
        if (!data.days_count || data.days_count.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['days_count'],
            message: t('penalties.modal.daysCountRequired'),
          });
        } else {
          const daysValue = parseFloat(data.days_count);

          if (isNaN(daysValue) || daysValue < 0.25) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['days_count'],
              message: t('penalties.modal.daysCountMin'),
            });
          }
        }
      }
    });

function getPenaltyEmployeeIds(penaltyData) {
  if (!penaltyData) return [];

  if (Array.isArray(penaltyData.employee_ids) && penaltyData.employee_ids.length > 0) {
    return [String(penaltyData.employee_ids[0])];
  }

  if (penaltyData.employee_id) {
    return [String(penaltyData.employee_id)];
  }

  if (penaltyData.employee?.id) {
    return [String(penaltyData.employee.id)];
  }

  if (penaltyData.employee?.employee_id) {
    return [String(penaltyData.employee.employee_id)];
  }

  return [];
}

function getPenaltyFormValues(penalty, employeeIds) {
  if (!penalty) {
    return {
      ...DEFAULT_VALUES,
      employee_ids: employeeIds || [],
    };
  }

  const calculationType = penalty?.calculation_type || (penalty?.days_count ? 'days' : 'fixed');

  return {
    employee_ids: employeeIds || [],
    date: penalty?.date || '',
    type: penalty?.type || '',
    calculation_type: calculationType,
    amount: calculationType === 'fixed' ? String(penalty?.amount ?? '') : '',
    days_count: calculationType === 'days' ? String(penalty?.days_count ?? '0.25') : '0.25',
    other: penalty?.other || '',
  };
}

function getEmployeeDisplayName(employeeId, employees = [], penalty = null, fallback = '—', preferArabic = false) {
  const id = String(employeeId || '');

  const employee = employees.find((emp) => {
    const empId = emp?.employee_id ?? emp?.id;
    return String(empId) === id;
  });

  if (employee) {
    return formatEmployeeSelectLabel(employee, { preferArabic }) || fallback;
  }

  const penaltyEmployee = penalty?.employee;

  if (penaltyEmployee) {
    return formatEmployeeSelectLabel(penaltyEmployee, { preferArabic }) || fallback;
  }

  return fallback;
}

export default function PenaltyModal({ open, onOpenChange, penalty, onSuccess, defaultEmployeeIds = [], employeeName = null }) {
  const isEditMode = !!penalty;
  const penaltyId = penalty?.id || penalty?.penalty_id;

  const { create, update } = useUpsertPenalty();
  const { data: employees = [] } = useAllEmployees();
  const { t, i18n } = useTranslation();
  const { authSource } = useAuthStore();

  // In employee-login + create mode: show employee as static read-only text
  const isEmployeeLogin = authSource === 'employee-login';
  const showStaticEmployee = isEmployeeLogin && !isEditMode && defaultEmployeeIds.length > 0;

  const penaltySchema = useMemo(() => createPenaltySchema(t), [t]);

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const inputClass = isArabic ? 'text-right' : 'text-left';

  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  const [typeSearch, setTypeSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const form = useForm({
    resolver: zodResolver(penaltySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const calculationType = form.watch('calculation_type');

  const basePenaltyTypes = useMemo(
    () => [
      {
        value: 'disciplinary_action',
        label: t('penalties.modal.disciplinaryAction', 'Disciplinary Action'),
      },
      {
        value: 'attendance_violation',
        label: t('penalties.modal.attendanceViolation', 'Attendance Violation'),
      },
      {
        value: 'policy_violation',
        label: t('penalties.modal.policyViolation', 'Policy Violation'),
      },
      {
        value: 'relations_violation',
        label: t('penalties.modal.relationsViolation', 'Relations Violation'),
      },
      {
        value: 'conduct_violation',
        label: t('penalties.modal.conductViolation', 'Conduct Violation'),
      },
    ],
    [t]
  );

  useEffect(() => {
    if (!open) return;

    const ids = isEditMode ? getPenaltyEmployeeIds(penalty) : (defaultEmployeeIds.length ? defaultEmployeeIds : []);
    const values = getPenaltyFormValues(penalty, ids);

    setSelectedEmployeeIds(ids);
    setTypeSearch('');
    form.reset(values);
  }, [open, isEditMode, penalty, form]);

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
        message: t('penalties.modal.employeeRequired', 'At least one employee is required'),
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
      if (!penaltyId) return;

      update.mutate(
        {
          id: penaltyId,
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
    penalty,
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
            {isEditMode ? t('penalties.modal.editPenalty') : t('penalties.modal.addPenalty')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <FormField name="employee_ids" label={t('penalties.modal.employees')} required>
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
                  placeholder={t('penalties.modal.selectEmployees')}
                  searchPlaceholder={t('penalties.modal.searchEmployees')}
                />
              )
            }
          </FormField>

          <FormField name="date" label={t('penalties.modal.date')} required>
            {({ field }) => (
              <DatePickerInput
                dir={dir}
                value={field.value}
                onChange={(iso) => field.onChange(iso)}
                placeholder={t('penalties.modal.datePlaceholder')}
                inputClassName={inputClass}
              />
            )}
          </FormField>

          <FormField name="type" label={t('penalties.modal.type')} required>
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
                  <SelectValue placeholder={t('penalties.modal.chooseType')}>
                    {basePenaltyTypes.find((item) => item.value === field.value)?.label ||
                      field.value}
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
                      placeholder={t('penalties.modal.typeCustomOrSearch')}
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      className={`h-9 ${inputClass}`}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {basePenaltyTypes
                    .filter((item) => item.label.toLowerCase().includes(typeSearch.toLowerCase()))
                    .map((item) => (
                      <SelectItem key={item.value} value={item.value} className={selectItemClass}>
                        {item.label}
                      </SelectItem>
                    ))}

                  {typeSearch &&
                    !basePenaltyTypes.some(
                      (item) => item.label.toLowerCase() === typeSearch.toLowerCase()
                    ) && (
                      <SelectItem value={typeSearch} className={selectItemClass}>
                        {isArabic ? `إضافة "${typeSearch}"` : `Add "${typeSearch}"`}
                      </SelectItem>
                    )}

                  {field.value &&
                    !basePenaltyTypes.some((item) => item.value === field.value) &&
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
            label={t('penalties.modal.calculationType')}
            required
          >
            {({ field }) => (
              <Select dir={dir} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder={t('penalties.modal.chooseCalculationType')} />
                </SelectTrigger>

                <SelectContent
                  dir={dir}
                  align={isArabic ? 'end' : 'start'}
                  className={isArabic ? 'text-right' : 'text-left'}
                >
                  <SelectItem value="fixed" className={selectItemClass}>
                    {t('penalties.modal.fixed')}
                  </SelectItem>

                  <SelectItem value="days" className={selectItemClass}>
                    {t('penalties.modal.days')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </FormField>

          {calculationType === 'fixed' && (
            <FormField name="amount" label={t('penalties.modal.amountEGP')} required>
              {({ field }) => (
                <Input
                  {...field}
                  dir={dir}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={t('penalties.modal.amountPlaceholder')}
                  className={inputClass}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            </FormField>
          )}

          {calculationType === 'days' && (
            <FormField name="days_count" label={t('penalties.modal.daysCount')} required>
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
                      placeholder={t('penalties.modal.daysPlaceholder')}
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
              {t('penalties.modal.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={
                update.isPending ||
                create.isPending ||
                (isEditMode && !penaltyId) ||
                !selectedEmployeeIds ||
                selectedEmployeeIds.length === 0
              }
            >
              {update.isPending || create.isPending
                ? t('penalties.modal.saving')
                : isEditMode
                  ? t('penalties.modal.updatePenalty')
                  : t('penalties.modal.addPenalty')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}