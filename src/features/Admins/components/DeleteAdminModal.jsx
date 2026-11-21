import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function DeleteAdminModal({
  open,
  onOpenChange,
  admin,
  onConfirm,
  loading = false,
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">

        <DialogHeader>
          <DialogTitle>
            {t('deleteAdminModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm text-slate-600">

          <p>
            {t('deleteAdminModal.confirmation', {
              name:
                admin?.name ||
                t('deleteAdminModal.adminName'),
            })}
          </p>

        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('deleteAdminModal.cancel')}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading
              ? t('deleteAdminModal.deleting')
              : t('deleteAdminModal.delete')}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}