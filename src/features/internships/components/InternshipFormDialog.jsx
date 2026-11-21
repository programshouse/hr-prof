// src/features/internships/components/InternshipFormDialog.jsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import DatePickerInput from '@/components/ui/date-picker-input';

import { internshipSchema, internshipDefaultValues } from '../schemas/internship.schema';
import { useUpsertInternship } from '../hooks/useUpsertInternship';

export default function InternshipFormDialog({ open, onOpenChange, internship }) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const isEdit = !!internship;

  const { create, update, isCreating, isUpdating } = useUpsertInternship();

  const inputClass = isArabic ? 'text-right' : 'text-left';
  const errorClass = `mt-1 text-sm text-red-600 ${isArabic ? 'text-right' : 'text-left'}`;
  const labelClass = `mb-1.5 block ${isArabic ? 'text-right' : 'text-left'}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(internshipSchema),
    defaultValues: internshipDefaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (internship) {
      const editValues = {
        ...internshipDefaultValues,
        ...internship,
      };

      reset(editValues);
    } else {
      reset(internshipDefaultValues);
    }
  }, [open, internship, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: internship.id, values });
      } else {
        await create.mutateAsync(values);
      }

      reset(internshipDefaultValues);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save internship:', error);
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`max-h-[90vh] w-[95vw] max-w-[600px] overflow-y-auto ${
          isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'
        }`}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle
            className={`w-full text-xl font-semibold ${
              isArabic ? 'text-right' : 'text-center'
            }`}
          >
            {isEdit ? t('internships.form.titleEdit') : t('internships.form.titleAdd')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('internships.form.personalInformation')}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="first_name" className={labelClass}>
                  {t('internships.form.firstName')} *
                </Label>

                <Input
                  id="first_name"
                  dir={dir}
                  {...register('first_name')}
                  placeholder={t('internships.form.enterFirstName')}
                  className={inputClass}
                />

                {errors.first_name && (
                  <p className={errorClass}>{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name" className={labelClass}>
                  {t('internships.form.lastName')} *
                </Label>

                <Input
                  id="last_name"
                  dir={dir}
                  {...register('last_name')}
                  placeholder={t('internships.form.enterLastName')}
                  className={inputClass}
                />

                {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email" className={labelClass}>
                  {t('internships.form.email')} *
                </Label>

                <Input
                  id="email"
                  dir={dir}
                  type="email"
                  {...register('email')}
                  placeholder={t('internships.form.enterEmail')}
                  className={inputClass}
                />

                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className={labelClass}>
                  {t('internships.form.phone')} *
                </Label>

                <Input
                  id="phone"
                  dir={dir}
                  {...register('phone')}
                  placeholder={t('internships.form.enterPhone')}
                  className={inputClass}
                />

                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="position" className={labelClass}>
                  {t('internships.form.position')} *
                </Label>

                <Input
                  id="position"
                  dir={dir}
                  {...register('position')}
                  placeholder={t('internships.form.enterPosition')}
                  className={inputClass}
                />

                {errors.position && <p className={errorClass}>{errors.position.message}</p>}
              </div>

              <div>
                <Label htmlFor="department" className={labelClass}>
                  {t('internships.form.department')} *
                </Label>

                <Input
                  id="department"
                  dir={dir}
                  {...register('department')}
                  placeholder={t('internships.form.enterDepartment')}
                  className={inputClass}
                />

                {errors.department && <p className={errorClass}>{errors.department.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="join_date" className={labelClass}>
                  {t('internships.form.joinDate')} *
                </Label>

                <DatePickerInput
                  value={watch('join_date') || ''}
                  onChange={(v) => setValue('join_date', v, { shouldValidate: true })}
                />

                {errors.join_date && <p className={errorClass}>{errors.join_date.message}</p>}
              </div>

              <div>
                <Label htmlFor="shift" className={labelClass}>
                  {t('internships.form.shift')}
                </Label>

                <Input
                  id="shift"
                  dir={dir}
                  {...register('shift')}
                  placeholder={t('internships.form.enterShift')}
                  className={inputClass}
                />

                {errors.shift && <p className={errorClass}>{errors.shift.message}</p>}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${isArabic ? 'text-right' : 'text-left'}`}>
              {t('internships.form.additionalInformation')}
            </h3>

            <div>
              <Label htmlFor="notes" className={labelClass}>
                {t('internships.form.notes')}
              </Label>

              <Textarea
                id="notes"
                dir={dir}
                {...register('notes')}
                placeholder={t('internships.form.enterNotes')}
                rows={3}
                className={inputClass}
              />

              {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
            </div>

            <div
              className={`flex items-center gap-2 ${
                isArabic ? 'flex-row-reverse justify-end' : 'justify-start'
              }`}
            >
              <Checkbox
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', Boolean(checked))}
              />

              <Label htmlFor="is_active" className="cursor-pointer">
                {t('internships.form.activeInternship')}
              </Label>
            </div>
          </div>

          <DialogFooter
            className={`gap-2 ${
              isArabic ? 'flex-row-reverse justify-start sm:justify-start' : 'justify-end'
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? t('internships.form.saving')
                : isEdit
                  ? t('internships.form.update')
                  : t('internships.form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}