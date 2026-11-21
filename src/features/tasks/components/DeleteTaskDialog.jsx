import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function DeleteTaskDialog({ open, onOpenChange, task, onConfirm, isDeleting }) {
  const { t } = useTranslation();
  const handleConfirm = () => {
    onConfirm(task);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('tasks.deleteTask')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            {t('tasks.deleteTaskConfirmation', { taskName: task?.task_name })}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('common.loading') : t('tasks.deleteTaskButton')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
