import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DeleteExceptionDialog({ open, onOpenChange, onConfirm, isDeleting }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[76vw] max-w-[620px] rounded-2xl border-slate-200 p-0">

        <div className="px-8 pb-8 pt-10">
          {/* Icon */}
          <div className="mx-auto mb-6 flex size-10 items-center justify-center rounded-full border-2 border-red-500/80">
            <Trash2 className="size-6 text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            {t('deleteModals.exception', 'Are you sure you want to delete this exception? This will permanently remove the exception record.')}
          </h2>

          {/* Actions */}
          <div className="mt-10 grid grid-cols-2 gap-6">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-2 border-primary bg-white font-semibold text-primary hover:bg-primary/5"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              {t('deleteModals.cancel', 'Cancel')}
            </Button>

            <Button
              type="button"
              className="h-10 rounded-xl bg-red-500 font-semibold text-white hover:bg-red-600"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('deleteModals.deleting', 'Deleting...') : t('deleteModals.title', 'Delete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
