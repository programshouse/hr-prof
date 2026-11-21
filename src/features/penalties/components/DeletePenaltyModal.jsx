// src/features/penalties/components/DeletePenaltyModal.jsx
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
import { useDeletePenalty } from '../hooks/useUpsertPenalty';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function DeletePenaltyModal({
  open,
  onOpenChange,
  penalty,
  onSuccess,
}) {
  const { mutate: deletePenalty, isPending } = useDeletePenalty();
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const penaltyId = penalty?.id || penalty?.penalty_id;

  const handleDelete = () => {
    if (!penaltyId) {
      console.error('No penalty ID found in:', penalty);
      return;
    }

    deletePenalty(penaltyId, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={cn(
          'max-w-md',
          isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'
        )}
      >
        <DialogHeader
          className={cn(
            'space-y-0',
            isArabic ? 'items-end text-right' : 'items-start text-left'
          )}
        >
          <div
            className={cn(
              'flex w-full items-start gap-3',
              isArabic && 'flex-row-reverse'
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div className={cn('flex-1', isArabic ? 'text-right' : 'text-left')}>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.penalty.title')}
              </DialogTitle>

              <DialogDescription
                className={cn('mt-1', isArabic ? 'text-right' : 'text-left')}
              >
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className={cn(
            'space-y-3 py-4',
            isArabic ? 'text-right' : 'text-left'
          )}
        >
          <p className="text-sm text-gray-600">
            {t('deleteModals.penalty.confirmation')}
          </p>

          {penalty && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {t('deleteModals.penalty.id')}:
                </span>
                <span className="text-gray-900">{penaltyId || '—'}</span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {t('deleteModals.penalty.employee')}:
                </span>
                <span className="text-gray-900">
                  {penalty.employeeName || penalty.employee_name || '—'}
                </span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {t('deleteModals.penalty.type')}:
                </span>
                <span className="text-gray-900">{penalty.type || '—'}</span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {t('deleteModals.penalty.amount')}:
                </span>
                <span className="font-semibold text-gray-900">
                  {penalty.amount ? `${penalty.amount} EGP` : '—'}
                </span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {t('deleteModals.penalty.date')}:
                </span>
                <span className="text-gray-900">{penalty.date || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            'gap-2',
            isArabic ? 'flex-row-reverse justify-start' : 'justify-end'
          )}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('deleteModals.cancel')}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !penaltyId}
          >
            {isPending
              ? t('deleteModals.deleting')
              : t('deleteModals.penalty.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}