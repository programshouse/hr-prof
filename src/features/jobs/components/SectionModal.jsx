import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { useAllPositions } from '@/shared/hooks/useAllPositions';

const sectionSchema = z.object({
  name_en: z.string().min(1, 'English section title is required'),
  name_ar: z.string().min(1, 'Arabic section title is required'),
  position_ids: z.array(z.number()).min(1, 'Select at least one position'),
  display_order: z.coerce.number().min(1).default(1),
});

export default function SectionModal({
  open,
  onOpenChange,
  section = null,
  defaultPositionId = null,
  onSubmitSection,
  isLoading = false,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [positionSearch, setPositionSearch] = useState('');

  const { data: positions = [], isLoading: isPositionsLoading } = useAllPositions();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name_en: '',
      name_ar: '',
      position_ids: [],
      display_order: 1,
    },
  });

  const selectedPositionIds = watch('position_ids') || [];

  const defaultPositionNumberId = useMemo(() => {
    if (!defaultPositionId) return null;

    const numberId = Number(defaultPositionId);

    return Number.isNaN(numberId) ? null : numberId;
  }, [defaultPositionId]);

  useEffect(() => {
    if (!open) return;

    setPositionSearch('');

    if (section) {
      const sectionPositionIds = Array.isArray(section.positions)
        ? section.positions.map((p) => Number(p.id)).filter((id) => !Number.isNaN(id))
        : Array.isArray(section.position_ids)
          ? section.position_ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
          : [];

      reset({
        name_en: section.name_en || '',
        name_ar: section.name_ar || '',
        position_ids: sectionPositionIds,
        display_order: section.display_order || 1,
      });

      return;
    }

    reset({
      name_en: '',
      name_ar: '',
      position_ids: defaultPositionNumberId ? [defaultPositionNumberId] : [],
      display_order: 1,
    });
  }, [open, section, reset, defaultPositionNumberId]);

  const filteredPositions = useMemo(() => {
    const q = positionSearch.trim().toLowerCase();

    if (!q) return positions;

    return positions.filter((pos) => {
      const titleEn = String(
        pos.title_en || pos.title || pos.name_en || pos.name || ''
      ).toLowerCase();
      const titleAr = String(pos.title_ar || pos.name_ar || '').toLowerCase();

      return titleEn.includes(q) || titleAr.includes(q);
    });
  }, [positions, positionSearch]);

  const getPositionTitle = (pos) => {
    if (!pos) return '';

    return isRTL
      ? pos.title_ar ||
          pos.title_en ||
          pos.title ||
          pos.name_ar ||
          pos.name_en ||
          pos.name ||
          `Position #${pos.id}`
      : pos.title_en ||
          pos.title_ar ||
          pos.title ||
          pos.name_en ||
          pos.name_ar ||
          pos.name ||
          `Position #${pos.id}`;
  };

  const onFormSubmit = (values) => {
    const payload = {
      name_en: values.name_en,
      name_ar: values.name_ar,
      position_ids: values.position_ids,
    };

    onSubmitSection(payload);
  };

  const handlePositionToggle = (posId) => {
    const id = Number(posId);
    if (Number.isNaN(id)) return;

    const current = [...selectedPositionIds];

    if (current.includes(id)) {
      setValue(
        'position_ids',
        current.filter((item) => item !== id),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue('position_ids', [...current, id], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleSelectAllPositions = (checked) => {
    if (checked) {
      const allIds = positions.map((p) => Number(p.id)).filter((id) => !Number.isNaN(id));
      setValue('position_ids', allIds, { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('position_ids', [], { shouldValidate: true, shouldDirty: true });
    }
  };

  const isAllSelected =
    positions.length > 0 &&
    selectedPositionIds.length === positions.length &&
    positions.every((pos) => selectedPositionIds.includes(Number(pos.id)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {section
              ? t('jobs.editSection', 'Edit Section')
              : t('jobs.addNewSection', 'Add New Section')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="mt-4 space-y-5">
          {/* Section Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {t('jobs.sectionTitleEn', 'Section Title (English)')}
              </Label>

              <Input
                {...register('name_en')}
                placeholder="e.g. Technical Skills"
                className="h-11 rounded-lg border-slate-200"
              />

              {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
            </div>

            <div className="space-y-2" dir="rtl">
              <Label className="block w-full text-right text-sm font-semibold text-slate-700">
                {t('jobs.sectionTitleAr', 'الاسم بالعربية (Arabic Title)')}
              </Label>

              <Input
                {...register('name_ar')}
                placeholder="مثال: المهارات التقنية"
                className="h-11 rounded-lg border-slate-200 text-right"
                dir="rtl"
              />

              {errors.name_ar && (
                <p className="text-right text-xs text-red-500">{errors.name_ar.message}</p>
              )}
            </div>
          </div>

          {/* Section Scope */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {t('jobs.sectionScope', 'Section Scope')}
            </Label>

            {/* Selected positions tags */}
            <div className="flex min-h-[46px] flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
              {selectedPositionIds.length === 0 ? (
                <span className="self-center px-1 text-sm text-slate-400">
                  {t('jobs.noPositionsSelected', 'Select positions...')}
                </span>
              ) : (
                selectedPositionIds.map((id) => {
                  const pos = positions.find((p) => Number(p.id) === Number(id));
                  const title = pos ? getPositionTitle(pos) : `Position #${id}`;

                  return (
                    <div
                      key={id}
                      className="bg-primary/10 border-primary/20 text-primary flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold"
                    >
                      <span>{title}</span>

                      <button
                        type="button"
                        onClick={() => handlePositionToggle(id)}
                        className="text-primary/60 hover:text-primary cursor-pointer transition"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 rtl:right-3 rtl:left-auto" />

              <Input
                value={positionSearch}
                onChange={(e) => setPositionSearch(e.target.value)}
                placeholder={t('jobs.searchPositions', 'Search positions...')}
                className="h-10 rounded-lg border-slate-200 pl-9 rtl:pr-9 rtl:pl-3"
              />
            </div>

            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
              {isPositionsLoading ? (
                <div className="py-4 text-center text-sm text-slate-500">
                  {t('common.loading', 'Loading positions...')}
                </div>
              ) : positions.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-500">
                  {t('jobs.noPositionsFound', 'No positions found')}
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 rtl:space-x-reverse">
                    <Checkbox
                      id="all-positions"
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAllPositions}
                    />

                    <label
                      htmlFor="all-positions"
                      className="cursor-pointer text-sm font-medium text-slate-600 select-none"
                    >
                      {t('jobs.allPositions', 'All Positions')}
                    </label>
                  </div>

                  {filteredPositions.length === 0 ? (
                    <div className="py-4 text-center text-sm text-slate-500">
                      {t('jobs.noPositionsMatchSearch', 'No positions match your search')}
                    </div>
                  ) : (
                    filteredPositions.map((pos) => {
                      const posId = Number(pos.id);
                      const isSelected = selectedPositionIds.includes(posId);
                      const title = getPositionTitle(pos);

                      return (
                        <div
                          key={pos.id}
                          className="flex items-center space-x-2 rounded px-1.5 py-1 transition hover:bg-slate-50/50 rtl:space-x-reverse"
                        >
                          <Checkbox
                            id={`pos-${pos.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handlePositionToggle(posId)}
                          />

                          <label
                            htmlFor={`pos-${pos.id}`}
                            className="flex-1 cursor-pointer text-sm font-medium text-slate-600 select-none"
                          >
                            {title}
                          </label>
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {errors.position_ids && (
              <p className="text-xs text-red-500">{errors.position_ids.message}</p>
            )}
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {t('jobs.displayOrder', 'Display Order')}
            </Label>

            <Input
              type="number"
              {...register('display_order')}
              className="h-11 rounded-lg border-slate-200"
            />

            {errors.display_order && (
              <p className="text-xs text-red-500">{errors.display_order.message}</p>
            )}
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg border-slate-200 px-6 text-slate-600 hover:text-slate-900"
            >
              {t('common.cancel', 'Cancel')}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg px-8 font-semibold transition"
            >
              {isLoading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
