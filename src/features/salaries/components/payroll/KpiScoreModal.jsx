import React, { useEffect } from 'react';
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
import { useUpdateKpiItem } from '@/features/kpi/hooks/useUpdateKpiItem';
import { useTranslation } from 'react-i18next';

const getKpiSchema = (t) => z.object({
  max_score: z
    .string()
    .min(1, t('employees.profile.details.kpi.editModal.maxScoreRequired'))
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: t('employees.profile.details.kpi.editModal.maxScoreInvalid'),
    }),
});

export default function KpiScoreModal({ open, onOpenChange, kpiItem, employeeId, onSuccess }) {
  const { t } = useTranslation();
  const updateKpi = useUpdateKpiItem();
  const kpiSchema = getKpiSchema(t);

  const form = useForm({
    resolver: zodResolver(kpiSchema),
    defaultValues: {
      max_score: String(kpiItem?.max_score || '0'),
    },
  });

  useEffect(() => {
    if (kpiItem) {
      form.reset({
        max_score: String(kpiItem.max_score || '0'),
      });
    }
  }, [kpiItem, open, form]);

  const handleSubmit = async (data) => {
    if (!kpiItem || !employeeId) return;

    try {
      // Only update max_score
      await updateKpi.mutateAsync({
        employeeId,
        kpiItemId: kpiItem.kpi_item_id || kpiItem.id,
        data: { max_score: Number(data.max_score) },
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update KPI:', error);
    }
  };

  const isPending = updateKpi.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('employees.profile.details.kpi.editModal.title', { name: kpiItem?.name })}</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={handleSubmit} className="space-y-4">
          <FormField name="max_score" label={t('employees.profile.details.kpi.editModal.maxScore')} required>
            {({ field }) => <Input {...field} type="number" min={0} placeholder="0" />}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('employees.profile.details.kpi.editModal.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('employees.profile.details.kpi.editModal.saving') : t('employees.profile.details.kpi.editModal.saveChanges')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
