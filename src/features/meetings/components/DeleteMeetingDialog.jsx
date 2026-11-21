import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DeleteMeetingDialog({ open, onOpenChange, _meeting, onConfirm, isDeleting }) {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Icon */}
          <div className="bg-red-100 text-red-600 border-red-200 flex size-12 items-center justify-center rounded-full border-2">
            <Trash2 className="size-6" />
          </div>

          {/* Title */}
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">
              {t('meetings.deleteMeeting.title')}
            </DialogTitle>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="flex w-full gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
