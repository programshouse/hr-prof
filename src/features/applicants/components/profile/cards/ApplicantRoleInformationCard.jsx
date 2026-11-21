// src/features/applicants/components/profile/cards/ApplicantRoleInformationCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-primary">
        {value || '—'}
      </span>
    </div>
  );
}

export default function ApplicantRoleInformationCard({ role = {} }) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          {t('applicants.profile.roleInformation')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Row label={t('applicants.profile.fields.position')} value={role.position} />
        <Row label={t('applicants.profile.fields.employmentType')} value={role.employmentType} />
        <Row label={t('applicants.profile.fields.workSetup')} value={role.workSetup} />
        <Row label={t('applicants.profile.fields.availableStartDate')} value={role.availableStartDate} />
        <Row label={t('applicants.profile.fields.expectedSalary')} value={role.expectedSalary} />
        {/* <Row label="Source" value={role.source} /> */}
        <Row label={t('applicants.profile.status')} value={role.status} />
        {/* <Row label="Created At" value={role.createdAt} />
        <Row label="Updated At" value={role.updatedAt} /> */}
      </CardContent>
    </Card>
  );
}