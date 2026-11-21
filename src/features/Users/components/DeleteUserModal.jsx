import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function DeleteUserModal({
  open,
  onOpenChange,
  user,
  onConfirm,
  loading = false,
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.deleteUser')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm text-slate-600">
          <p>
            {t('users.deleteConfirmation')}{' '}
            <span className="font-semibold text-slate-900">{user?.username || t('users.thisUser')}</span>?
          </p>
          <p>{t('users.deleteWarning')}</p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? t('common.loading') : t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
