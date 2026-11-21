// RequestFormDialog.jsx
//
// One dialog for every request type, in both create and edit mode.
//
// The layout is identical across types — employee at the top (read-only),
// then a two-column grid of that type's own fields, then reason full width.
// What changes per type is which fields exist and what payload gets built,
// and that all comes from requestTypes.config.js.
//
// The employee is never selectable here: we are already inside one person's
// profile, so their name is shown as static text and their id is injected
// into the payload by the config's toPayload().

import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePickerInput from '@/components/ui/date-picker-input';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { Form, FormField } from '@/components/forms/Form';

import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useAllBranches } from '@/shared/hooks/useAllBranches';

import { getRequestTypeConfig } from './requestTypes.config';

export default function RequestFormDialog({
  open,
  onOpenChange,
  requestType,
  /** null/undefined => create mode, a record => edit mode */
  request = null,
  employeeId,
  employeeName,
  onSubmit,
  isSubmitting = false,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const inputClass = isArabic ? 'text-right' : 'text-left';
  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  const config = getRequestTypeConfig(requestType);
  const isEdit = Boolean(request);

  const fileRef = useRef(null);

  // Only fetch the supporting lists the visible fields actually need.
  const needsEmployees = Boolean(
    config?.fields.some((field) => field.type === 'employee')
  );
  const needsBranches = Boolean(
    config?.fields.some((field) => field.type === 'branch')
  );

  const { data: employees = [], isLoading: loadingEmployees } = useAllEmployees(
    open && needsEmployees
  );
  const { data: branches = [], isLoading: loadingBranches } = useAllBranches({
    enabled: open && needsBranches,
  });

  const defaultValues = useMemo(() => {
    if (!config) return {};

    return isEdit
      ? { ...config.emptyValues, ...config.toFormValues(request || {}) }
      : { ...config.emptyValues };
  }, [config, isEdit, request]);

  const form = useForm({
    resolver: config ? zodResolver(config.schema) : undefined,
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    form.reset(defaultValues);

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  }, [open, defaultValues, form]);

  const watched = form.watch();

  if (!config) return null;

  const translate = (key, fallback) => t(key, { defaultValue: fallback });

  const typeLabel = translate(config.singularKey, config.singularFallback);

  // Interpolated rather than concatenated — Arabic puts the noun before the
  // qualifier, so the whole phrase has to come from the locale file.
  const title = isEdit
    ? t('requests.form.editTitle', { type: typeLabel, defaultValue: 'Edit {{type}}' })
    : t('requests.form.createTitle', { type: typeLabel, defaultValue: 'New {{type}}' });

  // The parent already holds the selected record, so it resolves the id.
  // All this needs to hand back is the built payload.
  const handleSubmit = (values) => {
    // A brand-new request is always created as pending — approving or
    // rejecting is a separate, deliberate action on an existing record.
    // Edit mode keeps whatever the reviewer picked.
    const submitted = isEdit ? values : { ...values, status: 'pending' };

    onSubmit({ values: submitted, payload: config.toPayload(submitted, employeeId) });
  };

  const visibleFields = config.fields.filter((field) => {
    // Status is not offered on create; it is fixed to pending above and
    // shown as a read-only chip instead.
    if (field.name === 'status' && !isEdit) return false;

    return !field.showWhen || field.showWhen(watched);
  });

  const renderControl = (field, rhfField) => {
    switch (field.type) {
      case 'date':
        return (
          <DatePickerInput
            dir={dir}
            value={rhfField.value}
            onChange={rhfField.onChange}
            placeholder={translate('common.datePlaceholder', 'dd/mm/yyyy')}
            inputClassName={inputClass}
          />
        );

      case 'time':
        return <Input {...rhfField} dir={dir} type="time" className={inputClass} />;

      case 'number':
        return (
          <Input
            {...rhfField}
            dir={dir}
            type="number"
            min={field.min}
            className={inputClass}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...rhfField}
            dir={dir}
            rows={3}
            className={inputClass}
            placeholder={translate('requests.form.reasonPlaceholder', 'Enter a reason...')}
          />
        );

      case 'select':
        return (
          <Select dir={dir} value={rhfField.value || ''} onValueChange={rhfField.onChange}>
            <SelectTrigger className={inputClass}>
              <SelectValue
                placeholder={translate('requests.form.select', 'Select...')}
              />
            </SelectTrigger>

            <SelectContent
              dir={dir}
              align={isArabic ? 'end' : 'start'}
              className={isArabic ? 'text-right' : 'text-left'}
            >
              {field.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={selectItemClass}
                >
                  {translate(option.labelKey, option.labelFallback)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'branch':
        return (
          <Select dir={dir} value={rhfField.value || ''} onValueChange={rhfField.onChange}>
            <SelectTrigger className={inputClass}>
              <SelectValue
                placeholder={translate('requests.form.selectBranch', 'Select branch')}
              />
            </SelectTrigger>

            <SelectContent
              dir={dir}
              align={isArabic ? 'end' : 'start'}
              className={isArabic ? 'text-right' : 'text-left'}
            >
              {loadingBranches ? (
                <SelectItem value="__loading" disabled className={selectItemClass}>
                  {translate('common.loading', 'Loading...')}
                </SelectItem>
              ) : (
                branches.map((branch) => (
                  <SelectItem
                    key={branch.id}
                    value={String(branch.id)}
                    className={selectItemClass}
                  >
                    {(isArabic && branch.name_ar) || branch.name_en || branch.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        );

      case 'employee':
        return (
          <EmployeeCombobox
            dir={dir}
            value={rhfField.value}
            onChange={rhfField.onChange}
            employees={employees}
            loading={loadingEmployees}
            excludeIds={[String(employeeId)]}
            placeholder={translate('requests.form.selectEmployee', 'Select employee')}
            searchPlaceholder={translate(
              'requests.form.searchEmployee',
              'Search employee by name or code...'
            )}
          />
        );

      case 'file':
        return (
          <Input
            ref={fileRef}
            dir={dir}
            type="file"
            accept={field.accept}
            className={inputClass}
            onChange={(event) => rhfField.onChange(event.target.files)}
          />
        );

      default:
        return <Input {...rhfField} dir={dir} className={inputClass} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`max-h-[90vh] max-w-2xl overflow-y-auto ${
          isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'
        }`}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form
          form={form}
          onSubmit={handleSubmit}
          className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          {/* Employee: fixed to this profile, shown as plain text. */}
          <div className="space-y-1">
            <span className="block text-sm font-medium">
              {translate('requests.form.employee', 'Employee')}
            </span>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
              {employeeName || `#${employeeId}`}
            </div>
          </div>

          {/* Create mode: status is fixed, so show it rather than ask for it. */}
          {!isEdit && (
            <div className="space-y-1">
              <span className="block text-sm font-medium">
                {translate('requests.form.status', 'Status')}
              </span>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                  {translate('requests.status.pending', 'Pending')}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleFields.map((field) => (
              <div
                key={field.name}
                className={field.fullWidth ? 'md:col-span-2' : undefined}
              >
                <FormField
                  name={field.name}
                  label={translate(field.labelKey, field.labelFallback)}
                  required={field.required}
                >
                  {({ field: rhfField }) => renderControl(field, rhfField)}
                </FormField>
              </div>
            ))}
          </div>

          <DialogFooter
            className={isArabic ? 'flex-row-reverse justify-start' : 'justify-end'}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {translate('common.cancel', 'Cancel')}
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? translate('common.saving', 'Saving...')
                : isEdit
                  ? translate('requests.form.update', 'Update Request')
                  : translate('requests.form.create', 'Create Request')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
