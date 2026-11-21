import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DeleteInterviewModal({ open, onOpenChange, onDelete, interviewData }) {
  const { t } = useTranslation();

  if (!interviewData) return null;

  const handleDelete = () => {
    onDelete?.(interviewData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[400px]">
        <div className="p-6">
          {/* Warning Icon and Message */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              {t('interviews.deleteInterviewConfirmation')}
            </h3>
          </div>

          {/* Interview Details */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t('interviews.headers.applicant')}:</span>
                <span className="font-medium text-slate-900">
                  {interviewData.applicant || t('common.na')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t('tables.headers.position')}:</span>
                <span className="font-medium text-slate-900">
                  {interviewData.position || t('common.na')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t('tables.headers.date')}:</span>
                <span className="font-medium text-slate-900">
                  {interviewData.interviewDate || t('common.na')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t('tables.headers.time')}:</span>
                <span className="font-medium text-slate-900">
                  {interviewData.interviewTime || t('common.na')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} className="h-11 rounded-lg px-6">
              {t('common.cancel')}
            </Button>

            <Button
              onClick={handleDelete}
              className="h-11 rounded-lg bg-red-600 px-6 text-white hover:bg-red-700"
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
