// src/features/remotely/components/DeleteRemotelyModal.jsx
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
import { useDeleteRemotely } from '../hooks/useUpsertRemotely';
import { useTranslation } from 'react-i18next';

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="shrink-0 font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900">{value || '—'}</span>
  </div>
);

export default function DeleteRemotelyModal({ open, onOpenChange, remote }) {
  const { mutate: deleteRemotely, isPending } = useDeleteRemotely();
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const handleDelete = () => {
    if (!remote?.id) return;

    deleteRemotely(remote.id, {
      onSuccess: () => onOpenChange(false),
    });
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
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <div className="flex w-full items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div className={isArabic ? 'text-right' : 'text-left'}>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.remote.title')}
              </DialogTitle>

              <DialogDescription className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('deleteModals.remote.confirmation')}
          </p>

          {remote && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <DetailRow label={t('deleteModals.remote.employee')} value={remote.employeeName} />
              <DetailRow label={t('deleteModals.remote.from')} value={remote.from} />
              <DetailRow label={t('deleteModals.remote.to')} value={remote.to} />
              <DetailRow
                label={t('deleteModals.remote.status')}
                value={remote.status || 'pending'}
              />
            </div>
          )}
        </div>

        <DialogFooter className={isArabic ? 'justify-start' : 'justify-end'}>
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
            {isPending ? t('deleteModals.deleting') : t('deleteModals.remote.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}