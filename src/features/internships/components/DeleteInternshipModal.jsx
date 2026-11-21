// src/features/internships/components/DeleteInternshipModal.jsx
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
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'sonner';
import { internshipsApi } from '../api/internships.api';

export default function DeleteInternshipModal({ open, onOpenChange, internship, onRefresh }) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!internship?.id) return;

    setIsDeleting(true);
    try {
      await internshipsApi.deleteInternship(internship.id);
      toast.success(t('internships.deletedSuccessfully'));
      onRefresh?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete internship:', error);
      toast.error(t('internships.failedToDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = internship?.full_name || internship?.name || '—';
  const avatarSrc =
    internship?.avatarUrl ||
    internship?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Intern')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div>
              <DialogTitle>{t('internships.deleteInternship')}</DialogTitle>
              <DialogDescription>{t('common.actionCannotBeUndone')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">{t('internships.deleteInternshipDescription')}</p>

          {internship && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{displayName}</p>
                  <p className="text-sm text-gray-600">
                    {internship?.code || internship?.id || '—'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2 text-sm">
                <span className="font-medium text-gray-700">{t('tables.headers.job')}:</span>
                <span className="text-gray-900">
                  {internship?.position || internship?.role || '—'}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('tables.headers.department')}:</span>
                <span className="text-gray-900">{internship?.department || '—'}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('tables.headers.phone')}:</span>
                <span className="text-gray-900">{internship?.phone || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? t('common.deleting') : t('internships.actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
