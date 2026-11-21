// src/features/applicants/components/profile/cards/ApplicantBasicInformationCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-primary">{value || '—'}</span>
    </div>
  );
}

export default function ApplicantBasicInformationCard({ basic }) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          {t('applicants.profile.basicInformation')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Row label={t('applicants.profile.fields.fullName')} value={basic.fullName} />
        <Row label={t('applicants.profile.fields.gender')} value={basic.gender} />
        <Row label={t('applicants.profile.fields.dateOfBirth')} value={basic.birthDate} />
        <Row label={t('applicants.profile.fields.maritalStatus')} value={basic.maritalStatus} />
        <Row label={t('applicants.profile.fields.nationalId')} value={basic.nationalId} />
        <Row label={t('applicants.profile.fields.militaryService')} value={basic.militaryService} />
        <Row label={t('applicants.profile.fields.smoker')} value={basic.isSmoker} />
        <Row label={t('applicants.profile.fields.chronicDisease')} value={basic.hasChronicDisease} />
        {basic.hasChronicDisease === 'Yes' && (
          <Row label={t('applicants.profile.fields.diseases')} value={basic.chronicDiseases} />
        )}
      </CardContent>
    </Card>
  );
}