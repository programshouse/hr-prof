// src/features/leaves/components/DeleteLeaveModal.jsx

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
import { useDeleteLeave } from '../hooks/useUpsertLeave';
import { useTranslation } from 'react-i18next';
import { translateLeaveType } from '@/utils/requestLabels';

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="shrink-0 font-medium text-gray-700">
      {label}:
    </span>

    <span className="text-gray-900">
      {value || '—'}
    </span>
  </div>
);

export default function DeleteLeaveModal({
  open,
  onOpenChange,
  leave,
  onSuccess,
}) {
  const { mutate: deleteLeave, isPending } = useDeleteLeave();

  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const handleDelete = () => {
    if (!leave?.id) return;

    deleteLeave(leave.id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return '—';
    const [hours, minutes] = String(timeStr).split(':');
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return timeStr;
    const isAr = i18n.language.startsWith('ar');
    const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
    const h12 = h % 12 || 12;
    return `${h12}:${minutes || '00'} ${suffix}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-md
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader
          className={
            isArabic
              ? 'items-end text-right'
              : 'items-start text-left'
          }
        >
          <div className="flex w-full items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div className={isArabic ? 'text-right' : 'text-left'}>
              <DialogTitle
                className={
                  isArabic ? 'text-right' : 'text-left'
                }
              >
                {t('deleteModals.leave.title')}
              </DialogTitle>

              <DialogDescription
                className={
                  isArabic ? 'text-right' : 'text-left'
                }
              >
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className={`
            space-y-3 py-4
            ${isArabic ? 'text-right' : 'text-left'}
          `}
        >
          <p className="text-sm text-gray-600">
            {t('deleteModals.leave.confirmation')}
          </p>

          {leave && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <DetailRow
                label={t('deleteModals.leave.employee')}
                value={leave.employeeName}
              />

              <DetailRow
                label={t('deleteModals.leave.type')}
                value={translateLeaveType(t, leave.type)}
              />

              <DetailRow
                label={t('deleteModals.leave.replacement')}
                value={leave.replacedEmployeeName}
              />

              <DetailRow
                label={t('deleteModals.leave.date')}
                value={leave.date}
              />

              <DetailRow
                label={t('deleteModals.leave.time')}
                value={`${formatTime12Hour(
                  leave.from
                )} - ${formatTime12Hour(leave.to)}`}
              />

              <DetailRow
                label={t('deleteModals.leave.status')}
                value={leave.status || 'pending'}
              />
            </div>
          )}
        </div>

        <DialogFooter
          className={
            isArabic
              ? 'justify-start'
              : 'justify-end'
          }
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
            disabled={isPending}
          >
            {isPending
              ? t('deleteModals.deleting')
              : t('deleteModals.leave.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}