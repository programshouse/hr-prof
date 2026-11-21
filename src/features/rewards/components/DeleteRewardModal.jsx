// src/features/rewards/components/DeleteRewardModal.jsx
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
import { useDeleteReward } from '../hooks/useUpsertReward';
import { useTranslation } from 'react-i18next';

export default function DeleteRewardModal({ open, onOpenChange, reward, onSuccess }) {
  const { mutate: deleteReward, isPending } = useDeleteReward();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  // Get the reward ID - API may return it as 'id' or 'reward_id'
  const rewardId = reward?.id || reward?.reward_id;

  const handleDelete = () => {
    if (!rewardId) {
      console.error('No reward ID found in:', reward);
      return;
    }

    deleteReward(rewardId, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-w-md
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader
          className={isArabic ? 'items-end text-right' : 'items-start text-left'}
        >
          <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                {t('deleteModals.reward.title')}
              </DialogTitle>
              <DialogDescription>
                {t('deleteModals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('deleteModals.reward.confirmation')}
          </p>

          {reward && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.reward.id')}:
                </span>
                <span className="text-gray-900">{rewardId || '—'}</span>
              </div>
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.reward.employee')}:
                </span>
                <span className="text-gray-900">{reward.employeeName || reward.employee_name || '—'}</span>
              </div>
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.reward.type')}:
                </span>
                <span className="text-gray-900">{reward.type || '—'}</span>
              </div>
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.reward.amount')}:
                </span>
                <span className="font-semibold text-gray-900">
                  {reward.amount ? `${reward.amount} EGP` : '—'}
                </span>
              </div>
              <div className={`flex justify-between text-sm ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">
                  {t('deleteModals.reward.date')}:
                </span>
                <span className="text-gray-900">{reward.date || '—'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={isArabic ? 'flex-row-reverse justify-start' : 'justify-end'}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('deleteModals.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending || !rewardId}>
            {isPending ? t('deleteModals.deleting') : t('deleteModals.reward.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
