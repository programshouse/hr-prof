// src/features/applicants/components/DeleteApplicantModal.jsx
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
import { toast } from "sonner";
import { useDeleteApplicant } from '../hooks/useDeleteApplicant';

function getInitials(firstName = '', lastName = '') {
  const f = String(firstName || '').trim();
  const l = String(lastName || '').trim();
  const fi = f ? f[0].toUpperCase() : '';
  const li = l ? l[0].toUpperCase() : '';
  return `${fi}${li}` || '--';
}

function getFullName(applicant) {
  if (!applicant) return '—';
  const parts = [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter(Boolean)
    .map((x) => String(x).trim())
    .filter(Boolean);

  return parts.join(' ') || applicant.preferred_name || '—';
}

export default function DeleteApplicantModal({ open, onOpenChange, applicant, onSuccess }) {
  const { t } = useTranslation();
  const deleteApplicantMutation = useDeleteApplicant();
  const isPending = deleteApplicantMutation.isPending;

  const id = applicant?.id ?? applicant?.applicant_id;
  const code = applicant?.applicant_code || (id ? `ID: ${id}` : '—');

  const fullName = getFullName(applicant);
  const initials = getInitials(applicant?.first_name, applicant?.last_name);

  const image = applicant?.image || null;

  const handleDelete = () => {
    if (!id) return;

    deleteApplicantMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('applicants.deleteApplicant'));
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>{t('applicants.deleteApplicant')}</DialogTitle>
              <DialogDescription>{t('common.actionCannotBeUndone')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600">{t('applicants.deleteApplicantConfirmation')}</p>

          {applicant && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                {image ? (
                  <img src={image} alt={fullName} className="size-12 rounded-full object-cover" />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {initials}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-900">{fullName}</p>
                  <p className="text-sm text-gray-600">{code}</p>
                </div>
              </div>

              <div className="flex justify-between pt-2 text-sm">
                <span className="font-medium text-gray-700">{t('common.phone')}:</span>
                <span className="text-gray-900">{applicant.phone || '—'}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{t('common.email')}:</span>
                <span className="text-gray-900">{applicant.email || '—'}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {t('applicants.headers.expectedSalary')}:
                </span>
                <span className="text-gray-900">{applicant.expected_salary ?? '—'}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !id}
          >
            {isPending ? t('common.loading') : t('applicants.deleteApplicant')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
