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
import {
  resolveHolidayTypeLabel,
  resolveHolidayTypeValue,
} from '@/lib/utils/employeeDisplayName';

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="shrink-0 font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900">{value || '—'}</span>
  </div>
);

export default function DeleteEmployeeOfficialHolidayModal({
  open,
  onOpenChange,
  holiday,
  onConfirm,
  isPending,
}) {
  const { t, i18n } = useTranslation();
  const holidayTypeLabel = resolveHolidayTypeLabel(resolveHolidayTypeValue(holiday), t);

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const handleDelete = () => {
    if (isPending) return;
    onConfirm?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;
        onOpenChange?.(nextOpen);
      }}
    >
      <DialogContent
        dir={dir}
        className={`
          max-w-md
          ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
        `}
      >
        <DialogHeader
          className={isArabic ? 'items-end text-right' : 'items-start text-left'}
        >
          <div className="flex w-full items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div className={isArabic ? 'text-right' : 'text-left'}>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.employeeOfficialHoliday.title')}
              </DialogTitle>

              <DialogDescription
                className={isArabic ? 'text-right' : 'text-left'}
              >
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('deleteModals.employeeOfficialHoliday.confirmation')}
          </p>

          {holiday && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <DetailRow
                label={t('deleteModals.employeeOfficialHoliday.employee')}
                value={holiday.employeeName}
              />

              <DetailRow
                label={t('deleteModals.employeeOfficialHoliday.type')}
                value={holidayTypeLabel}
              />

              <DetailRow
                label={t('deleteModals.employeeOfficialHoliday.date')}
                value={holiday.date}
              />

              <DetailRow
                label={t('deleteModals.employeeOfficialHoliday.from')}
                value={holiday.from}
              />

              <DetailRow
                label={t('deleteModals.employeeOfficialHoliday.to')}
                value={holiday.to}
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
            {isPending
              ? t('deleteModals.deleting')
              : t('deleteModals.employeeOfficialHoliday.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
