import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useAllEmployees } from '@/shared/hooks';
import EmployeeMultiSelectCombobox from '@/components/ui/EmployeeMultiSelectCombobox';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useTranslation } from 'react-i18next';

const allowanceSchema = z
  .object({
    employee_ids: z.array(z.string()).min(1, 'At least one employee is required'),
    from_date: z.string().min(1, 'From date is required'),
    to_date: z.string().min(1, 'To date is required'),
    type: z.string().min(1, 'Type is required'),
    amount: z.string().min(1, 'Amount is required'),
  })
  .superRefine((data, ctx) => {
    const amount = parseFloat(data.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amount'],
        message: 'Amount must be greater than 0',
      });
    }

    if (data.from_date && data.to_date) {
      const from = new Date(data.from_date);
      const to = new Date(data.to_date);

      if (to < from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to_date'],
          message: 'To date must be after or equal to from date',
        });
      }
    }
  });

const baseAllowanceTypes = [
  'Transportation',
  'Housing',
  'Mission',
  'Meal',
  'Medical',
  'Internet',
  'Mobile',
  'Other',
];

export default function AllowanceFormDialog({
  open,
  onOpenChange,
  allowance,
  onSubmit,
  isSubmitting = false,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const inputClass = isArabic ? 'text-right' : 'text-left';

  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  const isEditMode = !!allowance;

  const { data: employees = [] } = useAllEmployees();

  const getAllowanceEmployeeIds = (allowanceData) => {
    if (!allowanceData) return [];

    if (Array.isArray(allowanceData.employee_ids)) {
      return allowanceData.employee_ids.map((id) => String(id));
    }

    if (allowanceData.employee_id) {
      return [String(allowanceData.employee_id)];
    }

    return [];
  };

  const [typeSearch, setTypeSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(() =>
    isEditMode ? getAllowanceEmployeeIds(allowance) : []
  );

  const form = useForm({
    resolver: zodResolver(allowanceSchema),
    defaultValues: {
      employee_ids: selectedEmployeeIds,
      from_date: '',
      to_date: '',
      type: '',
      amount: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      setSelectedEmployeeIds(isEditMode ? getAllowanceEmployeeIds(allowance) : []);
    }, 0);

    return () => clearTimeout(timer);
  }, [open, allowance, isEditMode]);

  useEffect(() => {
    form.reset({
      employee_ids: selectedEmployeeIds,
      from_date: isEditMode ? allowance?.from_date || '' : '',
      to_date: isEditMode ? allowance?.to_date || '' : '',
      type: isEditMode ? allowance?.type || '' : '',
      amount: isEditMode ? String(allowance?.amount ?? '') : '',
    });
  }, [selectedEmployeeIds, allowance, isEditMode, open, form]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setTypeSearch('');
        setSelectedEmployeeIds([]);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = (data) => {
    if (!selectedEmployeeIds || selectedEmployeeIds.length === 0) {
      return;
    }

    const payload = {
      employee_ids: selectedEmployeeIds,
      employee_id: Number(selectedEmployeeIds[0]),
      from_date: data.from_date,
      to_date: data.to_date,
      type: data.type,
      amount: Number(data.amount),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-2xl
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
            {isEditMode
              ? t('allowances.modal.editTitle')
              : t('allowances.modal.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <FormField
            name="employee_ids"
            label={t('allowances.modal.employees')}
            required
          >
            {() =>
              isEditMode ? (
                <EmployeeCombobox
                  dir={dir}
                  value={selectedEmployeeIds[0]}
                  onChange={(value) => setSelectedEmployeeIds([value])}
                  employees={employees}
                  placeholder={t('allowances.modal.selectEmployee')}
                  searchPlaceholder={t('allowances.modal.searchEmployee')}
                  disabled
                />
              ) : (
                <EmployeeMultiSelectCombobox
                  dir={dir}
                  value={selectedEmployeeIds}
                  onChange={(value) => setSelectedEmployeeIds(value)}
                  employees={employees}
                  placeholder={t('allowances.modal.selectEmployees')}
                  searchPlaceholder={t('allowances.modal.searchEmployees')}
                />
              )
            }
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="from_date"
              label={t('allowances.modal.from')}
              required
            >
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={(iso) => field.onChange(iso)}
                  placeholder={t('allowances.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>

            <FormField
              name="to_date"
              label={t('allowances.modal.to')}
              required
            >
              {({ field }) => (
                <DatePickerInput
                  dir={dir}
                  value={field.value}
                  onChange={(iso) => field.onChange(iso)}
                  placeholder={t('allowances.modal.datePlaceholder')}
                  inputClassName={inputClass}
                />
              )}
            </FormField>
          </div>

          <FormField
            name="type"
            label={t('allowances.modal.type')}
            required
          >
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
                  <SelectValue
                    placeholder={t('allowances.modal.chooseType')}
                  />
                </SelectTrigger>

                <SelectContent
                  dir={dir}
                  align={isArabic ? 'end' : 'start'}
                  className={isArabic ? 'text-right' : 'text-left'}
                >
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <Input
                      dir={dir}
                      placeholder={t('allowances.modal.typeCustomOrSearch')}
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      className={`h-9 ${inputClass}`}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {baseAllowanceTypes
                    .filter((t) =>
                      t.toLowerCase().includes(typeSearch.toLowerCase())
                    )
                    .map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        className={selectItemClass}
                      >
                        {t}
                      </SelectItem>
                    ))}

                  {typeSearch &&
                    !baseAllowanceTypes.some(
                      (t) => t.toLowerCase() === typeSearch.toLowerCase()
                    ) && (
                      <SelectItem
                        value={typeSearch}
                        className={selectItemClass}
                      >
                        {t('allowances.modal.addCustom', {
                          type: typeSearch,
                        })}
                      </SelectItem>
                    )}

                  {field.value &&
                    !baseAllowanceTypes.includes(field.value) &&
                    field.value !== typeSearch && (
                      <SelectItem
                        value={field.value}
                        className={selectItemClass}
                      >
                        {field.value}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField
            name="amount"
            label={t('allowances.modal.amount')}
            required
          >
            {({ field }) => (
              <Input
                {...field}
                dir={dir}
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                className={inputClass}
              />
            )}
          </FormField>

          <DialogFooter
            className={isArabic ? 'justify-start' : 'justify-end'}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('allowances.modal.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedEmployeeIds ||
                selectedEmployeeIds.length === 0
              }
            >
              {isSubmitting
                ? t('allowances.modal.saving')
                : isEditMode
                  ? t('allowances.modal.updateAllowance')
                  : t('allowances.modal.addAllowance')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}