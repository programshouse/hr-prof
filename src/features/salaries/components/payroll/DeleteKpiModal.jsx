import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useExcludeKpiItem } from '@/features/kpi/hooks/useExcludeKpiItem';
import { useTranslation } from 'react-i18next';

export default function DeleteKpiModal({ open, onOpenChange, kpiItem, employeeId, onSuccess }) {
  const { t } = useTranslation();
  const { mutate: excludeKpi, isPending } = useExcludeKpiItem();

  const handleDelete = () => {
    if (!kpiItem || !employeeId) return;

    excludeKpi(
      { employeeId, kpiItemId: kpiItem.kpi_item_id || kpiItem.id },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>{t('kpi.exclude.title')}</DialogTitle>
              <DialogDescription>{t('kpi.exclude.warning')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">
            {t('kpi.exclude.message')}
          </p>

          {kpiItem && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('kpi.exclude.kpiName')}:</span>
                <span className="text-gray-900">{kpiItem.name || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('kpi.exclude.maxScore')}:</span>
                <span className="font-semibold text-gray-900">{kpiItem.max_score || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('kpi.exclude.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t('common.excluding') : t('kpi.exclude.excludeItem')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
