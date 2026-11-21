import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function DeleteAllowanceDialog({
  open,
  onOpenChange,
  allowance,
  onConfirm,
  isDeleting = false,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-md rounded-2xl
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <DialogTitle className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('allowances.deleteModal.title')}
          </DialogTitle>

          <DialogDescription className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
            {t('allowances.deleteModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className={`flex gap-3 pt-2 ${isArabic ? 'justify-start' : 'justify-end'}`}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('allowances.deleteModal.cancel')}
          </Button>

          <Button
            variant="destructive"
            onClick={() => onConfirm(allowance)}
            disabled={isDeleting}
          >
            {isDeleting
              ? t('allowances.deleteModal.deleting')
              : t('allowances.deleteModal.delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}