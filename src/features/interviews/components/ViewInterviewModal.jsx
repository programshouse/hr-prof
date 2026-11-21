import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Briefcase,
  BarChart3,
  CircleDashed,
  Calendar,
  Clock,
  UserCheck,
  Settings,
} from 'lucide-react';

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function translatedInterviewValue(t, group, value) {
  const key = normalizeKey(value);
  if (!key) return '--';

  return t(`interviews.${group}.${key}`, value || '--');
}

function formatInterviewTimeByLang(time, isArabic) {
  if (!time) return '--';

  const value = String(time);

  if (!isArabic) return value;

  return value
    .replace(/\bAM\b/gi, 'ص')
    .replace(/\bPM\b/gi, 'م')
    .replace(/\bA\.M\.\b/gi, 'ص')
    .replace(/\bP\.M\.\b/gi, 'م');
}

const Row = ({ icon: Icon, label, value, valueNode, isArabic }) => (
  <div
    className={`grid items-center ${
      isArabic ? 'grid-cols-[1fr_160px]' : 'grid-cols-[160px_1fr]'
    }`}
  >
    {isArabic ? (
      <>
        <div className="border-r border-slate-200 py-2 pr-4 text-sm text-slate-700">
          {valueNode ?? <span className="text-slate-700">{value || '--'}</span>}
        </div>

        <div className="flex items-center justify-end gap-2 py-2 text-xs font-medium text-slate-700">
          <span>{label}</span>
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center gap-2 py-2 text-xs font-medium text-slate-700">
          <Icon className="h-4 w-4 text-slate-500" />
          <span>{label}</span>
        </div>

        <div className="border-l border-slate-200 py-2 pl-4 text-sm text-slate-700">
          {valueNode ?? <span className="text-slate-700">{value || '--'}</span>}
        </div>
      </>
    )}
  </div>
);

export default function ViewInterviewModal({ open, onOpenChange, interviewData }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  if (!interviewData) return null;

  const getStatusColor = (status) => {
    switch (normalizeKey(status)) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'passed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const translatedLevel = translatedInterviewValue(t, 'levels', interviewData.level);
  const translatedStatus = translatedInterviewValue(t, 'status', interviewData.status);
  const translatedType = translatedInterviewValue(t, 'types', interviewData.type);

  const formattedInterviewTime = formatInterviewTimeByLang(
    interviewData.interviewTime,
    isArabic
  );

  const resolvedPosition = (() => {
    if (!interviewData) return '--';
    const raw = interviewData.originalData || {};
    const pos = interviewData.position;
    if (typeof pos === 'string' && pos.trim() && pos !== '--') {
      return pos.trim();
    }
    const posObj =
      (pos && typeof pos === 'object' ? pos : null) ||
      (raw.position && typeof raw.position === 'object' ? raw.position : null) ||
      (interviewData.applicant?.position_applied_for &&
      typeof interviewData.applicant.position_applied_for === 'object'
        ? interviewData.applicant.position_applied_for
        : null) ||
      (raw.applicant?.position_applied_for &&
      typeof raw.applicant.position_applied_for === 'object'
        ? raw.applicant.position_applied_for
        : null);

    if (isArabic) {
      return (
        interviewData.position_title_ar ||
        raw.position_title_ar ||
        posObj?.title_ar ||
        posObj?.name_ar ||
        interviewData.position_title_en ||
        raw.position_title_en ||
        posObj?.title_en ||
        posObj?.name_en ||
        posObj?.title ||
        posObj?.name ||
        '--'
      );
    }

    return (
      interviewData.position_title_en ||
      raw.position_title_en ||
      posObj?.title_en ||
      posObj?.name_en ||
      posObj?.title ||
      posObj?.name ||
      interviewData.position_title_ar ||
      raw.position_title_ar ||
      posObj?.title_ar ||
      posObj?.name_ar ||
      '--'
    );
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`overflow-hidden p-0 sm:max-w-[760px] ${
          isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'
        }`}
      >
        <DialogHeader className="border-b border-slate-200 px-6 py-4">
          <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
            {t('interviews.viewModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              {/* Applicant Details */}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  {t('interviews.viewModal.applicantDetails')}
                </h3>

                <div className="space-y-1">
                  <Row
                    icon={User}
                    label={t('interviews.viewModal.name')}
                    value={interviewData.applicant_name || '--'}
                    isArabic={isArabic}
                  />

                  <Row
                    icon={Briefcase}
                    label={t('interviews.viewModal.position')}
                    value={resolvedPosition}
                    isArabic={isArabic}
                  />

                  <Row
                    icon={BarChart3}
                    label={t('interviews.viewModal.level')}
                    value={translatedLevel}
                    isArabic={isArabic}
                  />

                  <Row
                    icon={CircleDashed}
                    label={t('interviews.viewModal.status')}
                    isArabic={isArabic}
                    valueNode={
                      <Badge
                        variant="outline"
                        className={[
                          'h-7 rounded-md px-3 text-xs font-medium',
                          getStatusColor(interviewData.status || 'pending'),
                        ].join(' ')}
                      >
                        {translatedStatus}
                      </Badge>
                    }
                  />
                </div>
              </div>

              {/* Interview Details */}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  {t('interviews.viewModal.interviewDetails')}
                </h3>

                <div className="space-y-1">
                  <Row
                    icon={Calendar}
                    label={t('interviews.viewModal.date')}
                    value={interviewData.interviewDate || '--'}
                    isArabic={isArabic}
                  />

                  <Row
                    icon={Clock}
                    label={t('interviews.viewModal.time')}
                    value={formattedInterviewTime}
                    isArabic={isArabic}
                  />

                  <Row
                    icon={UserCheck}
                    label={t('interviews.viewModal.interviewer')}
                    value={interviewData.interviewer || '--'}
                    isArabic={isArabic}
                  />

                  <Row
                    icon={Settings}
                    label={t('interviews.viewModal.type')}
                    value={translatedType}
                    isArabic={isArabic}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                {t('interviews.viewModal.comments')}
              </h3>

              <p className="text-sm leading-relaxed text-slate-600">
                {interviewData.comment || t('interviews.viewModal.noComments')}
              </p>

              <div
                className={`mt-4 flex items-center gap-3 border-t border-slate-200 pt-4 ${
                  isArabic ? 'justify-end' : 'justify-start'
                }`}
              >
                {isArabic ? (
                  <>
                    <div className="text-sm font-medium text-slate-700">
                      {interviewData.interviewer || '--'}
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                      <span className="text-xs font-semibold text-slate-700">HR</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                      <span className="text-xs font-semibold text-slate-700">HR</span>
                    </div>

                    <div className="text-sm font-medium text-slate-700">
                      {interviewData.interviewer || '--'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}