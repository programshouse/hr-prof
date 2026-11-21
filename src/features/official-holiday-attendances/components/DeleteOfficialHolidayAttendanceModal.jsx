import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useDeleteOfficialHolidayAttendance } from '../hooks/useOfficialHolidayAttendances';
import {
  formatOfficialHolidayDate,
  getOfficialHolidayEmployeeIds,
} from './officialHolidayAttendanceUtils';

const DetailRow = ({ label, value, isArabic }) => (
  <div
    className={`flex items-center justify-between gap-4 text-sm ${
      isArabic ? 'flex-row-reverse text-right' : ''
    }`}
  >
    <span className="shrink-0 font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900">{value || '—'}</span>
  </div>
);

export default function DeleteOfficialHolidayAttendanceModal({
  open,
  onOpenChange,
  attendance,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';
  const deleteMutation = useDeleteOfficialHolidayAttendance();

  const handleDelete = () => {
    if (!attendance?.id) return;

    deleteMutation.mutate(attendance.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`max-w-md ${
          isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'
        }`}
      >
        <DialogHeader className={isArabic ? 'items-end text-right' : 'items-start text-left'}>
          <div className={`flex w-full items-start gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>

            <div className={isArabic ? 'text-right' : 'text-left'}>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('officialHolidayAttendance.deleteModal.title')}
              </DialogTitle>
              <DialogDescription className={isArabic ? 'text-right' : 'text-left'}>
                {t('officialHolidayAttendance.deleteModal.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('officialHolidayAttendance.deleteModal.confirmation')}
          </p>

          {attendance && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <DetailRow
                label={t('officialHolidayAttendance.deleteModal.from')}
                value={formatOfficialHolidayDate(attendance.start_date, i18n.language)}
                isArabic={isArabic}
              />
              <DetailRow
                label={t('officialHolidayAttendance.deleteModal.to')}
                value={formatOfficialHolidayDate(attendance.end_date, i18n.language)}
                isArabic={isArabic}
              />
              <DetailRow
                label={t('officialHolidayAttendance.deleteModal.employees')}
                value={String(getOfficialHolidayEmployeeIds(attendance).length || '—')}
                isArabic={isArabic}
              />
            </div>
          )}
        </div>

        <DialogFooter className={isArabic ? 'justify-start' : 'justify-end'}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t('officialHolidayAttendance.deleteModal.cancel')}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? t('officialHolidayAttendance.deleteModal.deleting')
              : t('officialHolidayAttendance.deleteModal.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
