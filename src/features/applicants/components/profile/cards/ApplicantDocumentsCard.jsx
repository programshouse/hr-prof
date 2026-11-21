// src/features/applicants/components/profile/cards/ApplicantDocumentsCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ApplicantDocumentsCard({ documents = [] }) {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          {t('applicants.profile.documents')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {documents.length > 0 ? (
          documents.map((doc, index) => (
            <a
              key={`${doc.label}-${index}`}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <FileText className="size-4 text-slate-500" />
              <span>{doc.label}</span>
            </a>
          ))
        ) : (
          <p className="text-sm text-slate-500">{t('applicants.profile.fields.noDocumentsUploaded')}</p>
        )}
      </CardContent>
    </Card>
  );
}