// src/features/employees/components/form/StepExperience.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// ✅ use the reusable date picker input (text editable + calendar)
import DatePickerInput from '@/components/ui/date-picker-input';
import { Plus, Trash2 } from 'lucide-react';

// Reusable date picker field (now uses DatePickerInput)
function DatePickerField({ label, required, fieldName, register, watch, setValue, error }) {
  const value = watch(fieldName) || '';

  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>

      {/* keep field registered in RHF */}
      <input type="hidden" {...register(fieldName)} />

      <DatePickerInput
        value={value}
        onChange={(iso) => setValue(fieldName, iso, { shouldDirty: true, shouldValidate: true })}
      />

      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  );
}

export default function StepExperience({
  experienceFields,
  addExperience,
  removeExperience,
  register,
  setValue,
  watch,
  errors,
}) {
  const { t } = useTranslation();

  const handleAdd = () => {
    addExperience({
      job_title: '',
      company_name: '',
      work_setup: null,
      start_date: '',
      end_date: '',
      salary: '',
      manager_name: '',
      manager_phone: '',
      manager_email: '',
      okay_to_contact: false,
      key_responsibilities: '',
    });
  };

  return (
    <StepSection title={t('employees.form.experience')}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">{t('employees.form.addPreviousExperience')}</span>

        <Button type="button" variant="outline" size="icon" onClick={handleAdd}>
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* No forms at all until user clicks + (experiences array not empty) */}
        {experienceFields.map((field, index) => {
          const expErrors =
            errors.experiences && errors.experiences[index] ? errors.experiences[index] : {};

          return (
            <div key={field.id} className="space-y-4 rounded-md border border-slate-200 p-4">
              {/* Card header with title + trash icon */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t('employees.form.experienceNumber', { number: index + 1 })}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeExperience(index);
                  }}
                >
                  <Trash2 className="size-4 text-slate-500 hover:text-red-500" />
                </Button>
              </div>

              {/* Grid of fields – same style as your original code */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label required>{t('employees.form.jobTitle')}</Label>
                  <Input className="h-9 text-sm" {...register(`experiences.${index}.job_title`)} />
                  {expErrors.job_title && (
                    <p className="text-destructive text-xs">{expErrors.job_title.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label required>{t('employees.form.companyName')}</Label>
                  <Input
                    className="h-9 text-sm"
                    {...register(`experiences.${index}.company_name`)}
                  />
                  {expErrors.company_name && (
                    <p className="text-destructive text-xs">{expErrors.company_name.message}</p>
                  )}
                </div>

                <DatePickerField
                  label={t('employees.form.startDate')}
                  required
                  fieldName={`experiences.${index}.start_date`}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={expErrors.start_date}
                />

                <DatePickerField
                  label={t('employees.form.endDate')}
                  required
                  fieldName={`experiences.${index}.end_date`}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={expErrors.end_date}
                />

                <div className="space-y-1.5">
                  <Label>{t('employees.form.salary')}</Label>
                  <Input
                    type="number"
                    className="h-9 text-sm"
                    {...register(`experiences.${index}.salary`)}
                  />
                  {expErrors.salary && (
                    <p className="text-destructive text-xs">{expErrors.salary.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>{t('employees.form.managerName')}</Label>
                  <Input
                    className="h-9 text-sm"
                    {...register(`experiences.${index}.manager_name`)}
                  />
                  {expErrors.manager_name && (
                    <p className="text-destructive text-xs">{expErrors.manager_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>{t('employees.form.managerPhone')}</Label>
                  <Input
                    className="h-9 text-sm"
                    {...register(`experiences.${index}.manager_phone`)}
                  />
                  {expErrors.manager_phone && (
                    <p className="text-destructive text-xs">{expErrors.manager_phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>{t('employees.form.managerEmail')}</Label>
                  <Input
                    type="email"
                    className="h-9 text-sm"
                    {...register(`experiences.${index}.manager_email`)}
                  />
                  {expErrors.manager_email && (
                    <p className="text-destructive text-xs">{expErrors.manager_email.message}</p>
                  )}
                </div>
              </div>

              {/* Okay to contact */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch(`experiences.${index}.okay_to_contact`)}
                  onCheckedChange={(checked) =>
                    setValue(`experiences.${index}.okay_to_contact`, checked, {
                      shouldDirty: true,
                    })
                  }
                />
                <span className="text-sm">{t('employees.form.okayToContact')}</span>
              </div>

              {/* Responsibilities */}
              <div className="space-y-1.5">
                <Label>{t('employees.form.keyResponsibilities')}</Label>
                <Textarea
                  rows={3}
                  className="text-sm"
                  {...register(`experiences.${index}.key_responsibilities`)}
                />
                {expErrors.key_responsibilities && (
                  <p className="text-destructive text-xs">
                    {expErrors.key_responsibilities.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {errors.experiences && (
          <p className="text-destructive text-sm">
            {errors.experiences.message || t('employees.form.checkExperienceFields')}
          </p>
        )}
      </div>
    </StepSection>
  );
}
