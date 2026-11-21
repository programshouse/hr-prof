// src/features/applicants/components/profile/cards/ApplicantContactInformationCard.jsx
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

export default function ApplicantContactInformationCard({ contact, links = [] }) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          {t('applicants.profile.contactInformation')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Row label={t('applicants.profile.fields.phoneNumber')} value={contact.phone} />
        <Row label={t('applicants.profile.fields.whatsappNumber')} value={contact.whatsapp} />
        <Row label={t('applicants.profile.fields.email')} value={contact.email} />
        <Row label={t('applicants.profile.fields.city')} value={contact.city} />
        <Row label={t('applicants.profile.fields.governorate')} value={contact.governorate} />
        <Row label={t('applicants.profile.fields.country')} value={contact.country} />

        {links.length > 0 && (
          <div className="border-t border-slate-200 pt-3">
            <div className="mb-2 text-sm font-medium text-slate-900">{t('applicants.profile.fields.links')}</div>

            <div className="space-y-2">
              {links.map((link, index) => (
                <a
                  key={`${link.label}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-primary hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}