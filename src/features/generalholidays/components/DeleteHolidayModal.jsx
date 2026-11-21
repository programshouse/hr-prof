// src/features/generalholidays/components/DeleteHolidayModal.jsx
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
import { useDeleteGeneralHoliday } from '../hooks/useDeleteGeneralHoliday';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function DeleteHolidayModal({
  open,
  onOpenChange,
  holiday,
  year,
}) {
  const { mutate: deleteHoliday, isPending } =
    useDeleteGeneralHoliday(year);

  const { i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const handleDelete = () => {
    if (!holiday?.id) return;

    deleteHoliday(holiday.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const title =
    holiday?.localName ||
    holiday?.name ||
    holiday?.title_en ||
    '—';

  const from = holiday?.date_from || holiday?.date || '—';
  const to = holiday?.date_to || holiday?.date || '—';
  const type = holiday?.type || '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={cn(
          'max-w-md',
          isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'
        )}
      >
        <DialogHeader
          className={cn(
            'space-y-0',
            isArabic
              ? 'items-end text-right'
              : 'items-start text-left'
          )}
        >
          <div
            className={cn(
              'flex w-full items-start gap-3',
              isArabic && 'flex-row-reverse'
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div
              className={cn(
                'flex-1',
                isArabic ? 'text-right' : 'text-left'
              )}
            >
              <DialogTitle
                className={cn(
                  isArabic ? 'text-right' : 'text-left'
                )}
              >
                {isArabic ? 'حذف العطلة' : 'Delete Holiday'}
              </DialogTitle>

              <DialogDescription
                className={cn(
                  'mt-1',
                  isArabic ? 'text-right' : 'text-left'
                )}
              >
                {isArabic
                  ? 'لا يمكن التراجع عن هذا الإجراء'
                  : 'This action cannot be undone'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          className={cn(
            'space-y-3 py-4',
            isArabic ? 'text-right' : 'text-left'
          )}
        >
          <p className="text-sm text-gray-600">
            {isArabic
              ? 'هل أنت متأكد من أنك تريد حذف هذه العطلة؟ سيؤدي هذا إلى إزالة سجل العطلة بشكل دائم.'
              : 'Are you sure you want to delete this holiday? This will permanently remove the holiday record.'}
          </p>

          {holiday && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {isArabic ? 'العنوان:' : 'Title:'}
                </span>

                <span className="text-gray-900">{title}</span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {isArabic ? 'النوع:' : 'Type:'}
                </span>

                <span className="text-gray-900">{type}</span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {isArabic ? 'من:' : 'From:'}
                </span>

                <span className="text-gray-900">{from}</span>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between gap-4 text-sm',
                  isArabic && 'flex-row-reverse text-right'
                )}
              >
                <span className="font-medium text-gray-700">
                  {isArabic ? 'إلى:' : 'To:'}
                </span>

                <span className="text-gray-900">{to}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            'gap-2',
            isArabic
              ? 'flex-row-reverse justify-start'
              : 'justify-end'
          )}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !holiday?.deletable}
            title={
              !holiday?.deletable
                ? isArabic
                  ? 'لا يمكن حذف هذه العطلة'
                  : 'This holiday cannot be deleted'
                : undefined
            }
          >
            {isPending
              ? isArabic
                ? 'جارٍ الحذف...'
                : 'Deleting...'
              : isArabic
                ? 'حذف العطلة'
                : 'Delete Holiday'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}