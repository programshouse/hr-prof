import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeleteWeekend } from '../hooks/useWeekendMutations';

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="shrink-0 font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900">{value || '—'}</span>
  </div>
);

export default function DeleteWeekendModal({ open, onOpenChange, weekend }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const { mutate: deleteWeekend, isPending } = useDeleteWeekend();

  const handleDelete = () => {
    if (!weekend?.id) return;
    deleteWeekend(weekend.id, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-md
          ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
        `}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <div className="flex w-full items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <div className={isArabic ? 'text-right' : 'text-left'}>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.weekend.title')}
              </DialogTitle>
              <DialogDescription className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">{t('deleteModals.weekend.confirmation')}</p>

          {weekend && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <DetailRow label={t('deleteModals.weekend.from')} value={weekend.date_from} />
              <DetailRow label={t('deleteModals.weekend.to')} value={weekend.date_to} />
  
              <DetailRow
                label={t('deleteModals.weekend.employees')}
                value={
                  weekend.employees_count != null
                    ? String(weekend.employees_count)
                    : weekend.employeesCount != null
                      ? String(weekend.employeesCount)
                      : '—'
                }
              />
            </div>
          )}
        </div>

        <DialogFooter className={isArabic ? 'justify-start' : 'justify-end'}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t('deleteModals.cancel')}
          </Button>

          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t('deleteModals.deleting') : t('deleteModals.weekend.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

