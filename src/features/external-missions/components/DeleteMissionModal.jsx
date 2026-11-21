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
import { getMissionStatusLabel } from '../utils/missionStatus';

export default function DeleteMissionModal({ open, onOpenChange, mission, onSuccess }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const handleDelete = () => {
    if (!mission) return;

    // TODO: Add actual delete logic here
    console.log('Deleting mission:', mission.id);
    
    // Simulate API call
    setTimeout(() => {
      onOpenChange(false);
      onSuccess?.();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={isArabic ? 'rtl' : 'ltr'} className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>{t('externalMissions.deleteModal.title')}</DialogTitle>
              <DialogDescription>{t('externalMissions.deleteModal.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">
            {t('externalMissions.deleteModal.confirmation')}
          </p>

          {mission && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('externalMissions.deleteModal.missionId')}</span>
                <span className="text-gray-900">{mission.id || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('externalMissions.deleteModal.employee')}</span>
                <span className="text-gray-900">{mission.employeeName || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('externalMissions.deleteModal.destination')}</span>
                <span className="text-gray-900">{mission.destination || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('externalMissions.deleteModal.status')}</span>
                <span className="text-gray-900">
                  {mission.status
                    ? getMissionStatusLabel(mission.status, t)
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('externalMissions.deleteModal.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            {t('externalMissions.deleteModal.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
