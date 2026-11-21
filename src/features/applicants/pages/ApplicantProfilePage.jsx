import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, UserPlus } from 'lucide-react';

import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';
import { useApplicantDetailsQuery } from '../hooks/useApplicantDetailsQuery';
import { mapApplicantProfile } from '../utils/applicantProfile.mapper';
import { exportApplicantProfile } from '../utils/applicantExport';

import ApplicantProfileHeader from '../components/profile/ApplicantProfileHeader';
import ApplicantProfileCards from '../components/profile/ApplicantProfileCards';
import ApplicantProfileSkeleton from '../components/profile/ApplicantProfileSkeleton';
import ApplicantQualifications from '../components/profile/ApplicantQualifications';
import AssignHiringModal from '../components/AssignHiringModal';
import { useAllEmployees } from '@/shared/hooks';

export default function ApplicantProfilePage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const setName = useBreadcrumbStore((state) => state.setName);
  const [isExporting, setIsExporting] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useApplicantDetailsQuery(id);
  const { data: employees = [] } = useAllEmployees();
  const applicant = useMemo(() => mapApplicantProfile(data), [data]);

  useEffect(() => {
    if (!applicant || !id) return;

    const fullName =
      applicant.full_name ||
      applicant.name ||
      [applicant.first_name, applicant.middle_name, applicant.last_name]
        .filter((value) => value && String(value).trim() !== '')
        .join(' ')
        .trim();

    if (fullName) {
      setName(`applicant-${id}`, fullName);
    }
  }, [applicant, id, setName]);

  const handlePerformExport = async () => {
    if (!applicant || isExporting) return;
    try {
      setIsExporting(true);
      await exportApplicantProfile({
        applicant,
        rawData: data,
        t,
        i18n,
        // No signature prompt: signature spaces remain blank in the PDF.
        downloadCv: false,
        employees,
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <ApplicantProfileSkeleton />;
  }

  if (isError || !applicant) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load applicant profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 cursor-pointer text-sm font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
          >
            <UserPlus className="h-4 w-4" />
            {t('applicants.assignHiring', 'Assign Hiring Responsibles')}
          </button>

          <button
            type="button"
            onClick={handlePerformExport}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {t('applicants.profile.exportPersonalInfo', 'Export Personal Info')}
          </button>
        </div>
      </div>

      <AssignHiringModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        applicant={data || applicant}
        onSuccess={refetch}
      />

      <ApplicantProfileHeader applicant={applicant} />
      <ApplicantProfileCards applicant={applicant} />
      <ApplicantQualifications applicant={applicant} isLoading={isLoading} />
    </div>
  );
}