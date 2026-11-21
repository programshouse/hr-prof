import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function getApplicantInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(' ')
    .filter(Boolean);
  if (!parts.length) return 'AP';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function getStatusClasses(status) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'accepted') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (normalized === 'rejected') {
    return 'bg-red-50 text-red-700 border-red-200';  }
  if (normalized === 'pending') {
    return 'bg-amber-50 text-amber-700 border-amber-200';}
  return 'bg-slate-50 text-slate-700 border-slate-200';
}
function ProfileField({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
        {value || '—'}
      </div>
    </div>
  );
}

export default function ApplicantProfileHeader({ applicant }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const initials = getApplicantInitials(applicant?.name);

  return (
    <div className="space-y-6">
      <Card className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground inline-flex"
              onClick={() => navigate('/applicants')}
              aria-label={t('applicants.profile.backToApplicants')}
              title={t('applicants.profile.backToApplicants')}
            >
              <ChevronLeft className="size-6" />
            </button>

            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative">
                {applicant?.avatar ? (
                  <img
                    src={applicant.avatar}
                    alt={applicant?.name || t('applicants.applicant')}
                    className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-300 text-3xl font-medium text-white md:h-24 md:w-24 md:text-4xl">
                    {initials}
                  </div>
                )}
              </div>

              <div>
                <div className="text-lg font-semibold md:text-2xl">
                  {applicant?.name || '—'}
                </div>
                <div className="text-muted-foreground text-lg font-medium">
                  {applicant?.title || t('applicants.applicant')}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="grid gap-3 text-sm md:grid-cols-3 md:gap-10">
            <ProfileField label={t('applicants.profile.applicantId')} value={applicant?.applicantCode} />
            <ProfileField
              label={t('applicants.profile.appliedAt')}
              value={applicant?.role?.createdAt}
            />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
                {t('applicants.profile.status')}
              </div>
              <div className="mt-1">
                <span
                  className={[
                    'inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize',
                    getStatusClasses(applicant?.status),
                  ].join(' ')}
                >
                  {applicant?.status || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}