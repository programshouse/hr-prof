import { Eye, UserCheck, Trash, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ApplicantRowActions({
  row,
  onConvert,
  onDelete,
  onAssignHiring,
  processingIds = new Set(),
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // supports: row.original (tanstack) OR direct object
  const applicant = row?.original ?? row;

  // guard
  if (!applicant) return null;

  const id = applicant.id ?? applicant.applicant_id ?? applicant.personal_data_id;
  if (!id) return null;

  const isProcessing = processingIds.has(id);
  const isRejected = applicant.status === 'rejected';

  return (
    <div className="flex items-center gap-2">
      {/* View */}
      <button
        type="button"
        className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
        onClick={() => navigate(`/applicants/${id}`)}
        title={t('applicants.viewApplicant')}
      >
        <Eye className="size-4" />
      </button>

      {/* Assign Line Manager & HR Manager */}
      <button
        type="button"
        className="bg-blue-50 text-blue-600 hover:bg-blue-100 flex size-8 cursor-pointer items-center justify-center rounded-full border border-blue-200 transition-colors"
        onClick={() => onAssignHiring?.(applicant)}
        title={t('applicants.assignHiring', 'Assign Hiring Responsibles')}
      >
        <UserPlus className="size-4" />
      </button>

      {/* Convert To Employee */}
      <button
        type="button"
        className={`flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 disabled:opacity-50 ${
          isRejected ? 'bg-gray-100 text-gray-500' : 'bg-light-success text-success'
        }`}
        onClick={() => {
          if (onConvert) {
            onConvert(applicant);
          } else {
            navigate(`/employees?fromApplicant=${id}&mode=hire&step=8`);
          }
        }}
        disabled={isProcessing || isRejected}
        title={
          isRejected ? t('applicants.cannotConvertRejected') : t('applicants.convertToEmployee')
        }
      >
        {isProcessing ? (
          <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <UserCheck className="size-4" />
        )}
      </button>

      {/* Delete */}
      <button
        type="button"
        className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
        onClick={() => onDelete?.(applicant)}
        title={t('applicants.deleteApplicant')}
      >
        <Trash className="size-4" />
      </button>
    </div>
  );
}
