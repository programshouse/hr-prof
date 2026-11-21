import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function DeleteTaskDialog({ open, onOpenChange, task, onConfirm, isDeleting }) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('employeeTasks.deleteTask')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {t('employeeTasks.deleteTaskConfirmation', {
              taskNumber: task?.task_number || task?.id,
              taskTitle: task?.title
            })}
          </p>

          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-800 font-medium">
              {t('employeeTasks.deleteWarning')}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
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
