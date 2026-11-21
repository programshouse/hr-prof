import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/Pagination';
import { Eye, Pencil, Trash2 } from 'lucide-react';

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
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

function StatusPill({ status }) {
  const { t } = useTranslation();
  const s = normalizeKey(status);

  const styles =
    s === 'approved'
      ? 'bg-green-100 text-green-700'
      : s === 'rejected'
      ? 'bg-red-100 text-red-700'
      : s === 'passed'
      ? 'bg-indigo-100 text-primary'
      : 'bg-slate-100 text-slate-600';

  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-3 py-1 text-xs font-medium',
        styles,
      ].join(' ')}
    >
      {translatedInterviewValue(t, 'status', status)}
    </span>
  );
}

function Avatar({ src, name }) {
  const initials = String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-slate-600">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}

function ActionGroup({ onView, onEdit, onDelete }) {
  const { t } = useTranslation();

  const baseBtn =
    'inline-flex h-9 w-11 cursor-pointer items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700';

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        title={t('common.viewProfile')}
        onClick={onView}
        className={baseBtn}
      >
        <Eye className="h-4 w-4" />
      </button>

      <div className="h-9 w-px bg-slate-200" />

      <button
        type="button"
        title={t('common.edit')}
        onClick={onEdit}
        className={baseBtn}
      >
        <Pencil className="h-4 w-4" />
      </button>

      <div className="h-9 w-px bg-slate-200" />

      <button
        type="button"
        title={t('common.delete')}
        onClick={onDelete}
        className={[baseBtn, 'hover:text-red-600'].join(' ')}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------------------------------------------
  Normalizers
--------------------------------------------- */
function safeFullName(obj) {
  if (!obj) return '';

  if (typeof obj === 'string') return obj.trim();

  const a = obj.applicant || obj;

  const arabicParts = [a.first_name_ar, a.middle_name_ar, a.last_name_ar]
    .map((x) => String(x || '').trim())
    .filter(Boolean);

  if (arabicParts.length) return arabicParts.join(' ');

  const parts = [a.first_name, a.middle_name, a.last_name]
    .map((x) => String(x || '').trim())
    .filter(Boolean);

  if (parts.length) return parts.join(' ');

  return String(
    a.name ||
      a.employee_name ||
      a.full_name ||
      a.full_name_ar ||
      a.name_ar ||
      a.name_en ||
      ''
  ).trim();
}

function resolveLocalizedEmployeeName(employee, isArabic) {
  if (!employee || typeof employee !== 'object') return '';

  const applicant = employee?.applicant || {};

  const fallbackName =
    safeFullName(employee) ||
    safeFullName(applicant) ||
    String(
      employee?.name ||
        employee?.employee_name ||
        employee?.full_name ||
        employee?.full_name_ar ||
        applicant?.full_name ||
        applicant?.full_name_ar ||
        ''
    ).trim();

  if (isArabic) {
    return String(
      employee?.full_name_ar ||
        employee?.name_ar ||
        employee?.employee_name_ar ||
        applicant?.full_name_ar ||
        applicant?.name_ar ||
        employee?.full_name ||
        employee?.name ||
        employee?.employee_name ||
        applicant?.full_name ||
        applicant?.name ||
        fallbackName ||
        ''
    ).trim();
  }

  return String(
    employee?.full_name ||
      employee?.name_en ||
      employee?.employee_name_en ||
      employee?.name ||
      employee?.employee_name ||
      applicant?.full_name ||
      applicant?.name ||
      applicant?.first_name ||
      employee?.full_name_ar ||
      employee?.name_ar ||
      employee?.employee_name_ar ||
      applicant?.full_name_ar ||
      fallbackName ||
      ''
  ).trim();
}

function resolveInterviewPosition(interview, isArabic, positionsById) {
  if (!interview) return '--';

  const normalized = (val) => {
    if (val == null) return '';
    const s = String(val).trim();
    return s === '--' || s === '—' || s === 'null' || s === 'undefined' ? '' : s;
  };

  const raw = interview.originalData || {};
  const positionObj =
    (interview.position && typeof interview.position === 'object' ? interview.position : null) ||
    (raw.position && typeof raw.position === 'object' ? raw.position : null) ||
    (interview.applicant?.position_applied_for &&
    typeof interview.applicant.position_applied_for === 'object'
      ? interview.applicant.position_applied_for
      : null) ||
    (raw.applicant?.position_applied_for &&
    typeof raw.applicant.position_applied_for === 'object'
      ? raw.applicant.position_applied_for
      : null) ||
    (interview.applicant?.position && typeof interview.applicant.position === 'object'
      ? interview.applicant.position
      : null) ||
    (raw.applicant?.position && typeof raw.applicant.position === 'object'
      ? raw.applicant.position
      : null);

  const posId =
    interview.position_id ??
    raw.position_id ??
    positionObj?.id ??
    interview.applicant?.position_applied_for_id ??
    raw.applicant?.position_applied_for_id ??
    interview.applicant?.position_id ??
    raw.applicant?.position_id ??
    null;

  const matchedPos =
    posId != null && positionsById ? positionsById.get(String(posId)) : null;

  const arabicCandidates = [
    interview.position_title_ar,
    raw.position_title_ar,
    interview.position_name_ar,
    raw.position_name_ar,
    positionObj?.title_ar,
    positionObj?.name_ar,
    positionObj?.position_title_ar,
    positionObj?.position_name_ar,
    matchedPos?.title_ar,
    matchedPos?.name_ar,
  ]
    .map(normalized)
    .filter(Boolean);

  const englishCandidates = [
    interview.position_title_en,
    raw.position_title_en,
    interview.position_name_en,
    raw.position_name_en,
    interview.position_title,
    raw.position_title,
    interview.position_name,
    raw.position_name,
    positionObj?.title_en,
    positionObj?.name_en,
    positionObj?.title,
    positionObj?.name,
    positionObj?.position_title_en,
    positionObj?.position_name,
    matchedPos?.title_en,
    matchedPos?.title,
    matchedPos?.name_en,
    matchedPos?.name,
    typeof interview.position === 'string' ? interview.position : '',
    typeof raw.position === 'string' ? raw.position : '',
  ]
    .map(normalized)
    .filter(Boolean);

  if (isArabic) {
    if (arabicCandidates.length > 0) return arabicCandidates[0];
    if (englishCandidates.length > 0) return englishCandidates[0];
  } else {
    if (englishCandidates.length > 0) return englishCandidates[0];
    if (arabicCandidates.length > 0) return arabicCandidates[0];
  }

  return '--';
}

function pickInterviewerObject(interview) {
  if (!interview) return null;

  if (interview?.interviewer && typeof interview.interviewer === 'object') {
    return interview.interviewer;
  }

  if (
    interview?.originalData?.interviewer &&
    typeof interview.originalData.interviewer === 'object'
  ) {
    return interview.originalData.interviewer;
  }

  return null;
}

function pickInterviewerEmployeeId(interview) {
  return (
    interview?.interviewer_id ??
    interview?.interviewerId ??
    interview?.originalData?.interviewer_id ??
    interview?.interviewer?.employee_id ??
    interview?.originalData?.interviewer?.employee_id ??
    interview?.interviewer?.id ??
    interview?.originalData?.interviewer?.id ??
    null
  );
}

function pickInterviewerApplicantId(interview) {
  return (
    interview?.interviewer_applicant_id ??
    interview?.interviewerApplicantId ??
    interview?.originalData?.interviewer_applicant_id ??
    interview?.originalData?.interviewerApplicantId ??
    interview?.interviewer?.applicant_id ??
    interview?.originalData?.interviewer?.applicant_id ??
    interview?.interviewer?.applicant?.id ??
    interview?.originalData?.interviewer?.applicant?.id ??
    null
  );
}

/* ---------------------------------------------
  Table
--------------------------------------------- */
export default function InterviewTable({
  interviews = [],
  employees = [],
  positions = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  isLoading = false,
  error = null,
  onView,
  onEdit,
  onDelete,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const dir = isArabic ? 'rtl' : 'ltr';

  const {
    employeesByEmployeeId,
    employeesByApplicantId,
    employeesByName,
  } = useMemo(() => {
    const byEmployeeId = new Map();
    const byApplicantId = new Map();
    const byName = new Map();

    (employees || []).forEach((emp) => {
      const employeeId = emp?.id ?? emp?.employee_id ?? emp?.user_id;

      const applicantId =
        emp?.applicant_id ??
        emp?.applicantId ??
        emp?.applicant?.id ??
        emp?.applicant?.applicant_id;

      if (employeeId != null) byEmployeeId.set(String(employeeId), emp);
      if (applicantId != null) byApplicantId.set(String(applicantId), emp);

      const possibleNames = [
        emp?.name,
        emp?.full_name,
        emp?.employee_name,
        emp?.name_en,
        emp?.full_name_ar,
        emp?.name_ar,
        emp?.employee_name_ar,
        emp?.applicant?.name,
        emp?.applicant?.full_name,
        emp?.applicant?.full_name_ar,
        emp?.applicant?.first_name,
        safeFullName(emp),
        safeFullName(emp?.applicant),
      ];

      possibleNames.forEach((name) => {
        const key = normalizeName(name);
        if (key && !byName.has(key)) {
          byName.set(key, emp);
        }
      });
    });

    return {
      employeesByEmployeeId: byEmployeeId,
      employeesByApplicantId: byApplicantId,
      employeesByName: byName,
    };
  }, [employees]);

  const positionsById = useMemo(() => {
    const map = new Map();
    (positions || []).forEach((pos) => {
      const key = pos?.id ?? pos?.position_id;
      if (key != null) map.set(String(key), pos);
    });
    return map;
  }, [positions]);

  const resolveInterviewerName = (interview) => {
    if (!interview) return '--';

    const rawInterviewer = pickInterviewerObject(interview);
    const directBackendInterviewerName = String(
      rawInterviewer?.name ||
        rawInterviewer?.full_name ||
        rawInterviewer?.employee_name ||
        interview?.originalData?.interviewer?.name ||
        interview?.originalData?.interviewer?.full_name ||
        interview?.originalData?.interviewer?.employee_name ||
        interview?.interviewer_name ||
        interview?.interviewerName ||
        interview?.originalData?.interviewer_name ||
        interview?.originalData?.interviewerName ||
        ''
    ).trim();

    const interviewerEmployeeId = pickInterviewerEmployeeId(interview);
    const interviewerApplicantId = pickInterviewerApplicantId(interview);

    const rawInterviewerNameCandidates = [
      rawInterviewer?.name,
      rawInterviewer?.full_name,
      rawInterviewer?.employee_name,
      rawInterviewer?.name_en,
      rawInterviewer?.employee_name_en,
      rawInterviewer?.full_name_en,
      rawInterviewer?.name_ar,
      rawInterviewer?.employee_name_ar,
      rawInterviewer?.full_name_ar,
      rawInterviewer?.applicant?.name,
      rawInterviewer?.applicant?.full_name,
      rawInterviewer?.applicant?.name_ar,
      rawInterviewer?.applicant?.full_name_ar,
      interview?.interviewer_name,
      interview?.interviewerName,
      interview?.interviewer_name_ar,
      interview?.interviewerNameAr,
      interview?.originalData?.interviewer_name,
      interview?.originalData?.interviewerName,
      interview?.originalData?.interviewer_name_ar,
      interview?.originalData?.interviewerNameAr,
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    const rawInterviewerName = rawInterviewerNameCandidates[0] || '';
    const rawInterviewerArabicName = String(
      rawInterviewer?.full_name_ar ||
        rawInterviewer?.name_ar ||
        rawInterviewer?.employee_name_ar ||
        rawInterviewer?.applicant?.full_name_ar ||
        rawInterviewer?.applicant?.name_ar ||
        interview?.interviewer_name_ar ||
        interview?.interviewerNameAr ||
        interview?.originalData?.interviewer_name_ar ||
        interview?.originalData?.interviewerNameAr ||
        ''
    ).trim();

    /*
      المهم هنا:
      API بيرجع interviewer.id مش نفس employee.id
      لذلك بنربط المقابل بالاسم الموجود في interviewer.name
      وبعدها نجيب الاسم العربي من employees لو موجود.
    */
    let employeeByName = null;
    for (const candidate of rawInterviewerNameCandidates) {
      employeeByName = employeesByName.get(normalizeName(candidate));
      if (employeeByName) break;
    }

    if (directBackendInterviewerName) return directBackendInterviewerName;

    const employeeByApplicantId =
      interviewerApplicantId != null
        ? employeesByApplicantId.get(String(interviewerApplicantId))
        : null;

    const employeeByEmployeeId =
      interviewerEmployeeId != null
        ? employeesByEmployeeId.get(String(interviewerEmployeeId))
        : null;

    if (isArabic) {
      const arabicFromName = resolveLocalizedEmployeeName(employeeByName, true);
      if (arabicFromName) return arabicFromName;

      const arabicFromApplicant = resolveLocalizedEmployeeName(
        employeeByApplicantId,
        true
      );
      if (arabicFromApplicant) return arabicFromApplicant;

      const arabicFromEmployee = resolveLocalizedEmployeeName(
        employeeByEmployeeId,
        true
      );
      if (arabicFromEmployee) return arabicFromEmployee;

      if (rawInterviewerArabicName) return rawInterviewerArabicName;

      if (rawInterviewer) {
        const arabicFromObject = String(
          rawInterviewer?.full_name_ar ||
            rawInterviewer?.name_ar ||
            rawInterviewer?.employee_name_ar ||
            rawInterviewer?.applicant?.full_name_ar ||
            ''
        ).trim();

        if (arabicFromObject) return arabicFromObject;
      }
    }

    const localizedFromName = resolveLocalizedEmployeeName(employeeByName, isArabic);

    if (localizedFromName) return localizedFromName;

    const employeeFallback =
      employeeByName || employeeByApplicantId || employeeByEmployeeId;

    const fallbackEmployeeName = resolveLocalizedEmployeeName(
      employeeFallback,
      isArabic
    );

    if (fallbackEmployeeName) return fallbackEmployeeName;

    if (rawInterviewerName) return rawInterviewerName;

    if (typeof interview?.interviewer === 'string' && interview.interviewer.trim()) {
      return interview.interviewer.trim();
    }

    return '--';
  };

  return (
    <div
      dir={dir}
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
        isArabic ? 'text-right' : 'text-left'
      }`}
    >
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-b border-slate-200">
            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.applicant')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.department')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.interviewDate')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.interviewTime')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.interviewer')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.status')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.position')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.level')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.type')}
            </TableHead>

            <TableHead className="h-12 text-xs font-semibold text-slate-600">
              {t('interviews.headers.action')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="py-10 text-center text-sm text-slate-500"
              >
                {t('common.loading')}
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="py-10 text-center text-sm text-red-500"
              >
                {t('interviews.failedToLoad')}:{' '}
                {error.message || t('messages.error.unknownError')}
              </TableCell>
            </TableRow>
          ) : interviews.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="py-10 text-center text-sm text-slate-500"
              >
                {t('emptyStates.noData')}
              </TableCell>
            </TableRow>
          ) : (
            interviews.map((interview) => (
              <TableRow
                key={interview.id}
                className="border-b border-slate-100 hover:bg-slate-50/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={interview?.applicant_avatar}
                      name={interview?.applicant_name || interview?.applicant}
                    />

                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-900">
                        {interview?.applicant_name || interview?.applicant || '--'}
                      </p>

                      <p className="text-xs text-indigo-600">
                        {interview?.applicant_code || interview?.applicantId || ''}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {interview.department || '--'}
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {interview.interviewDate || '--'}
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {formatInterviewTimeByLang(interview.interviewTime, isArabic)}
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {resolveInterviewerName(interview)}
                </TableCell>

                <TableCell className="py-4">
                  <StatusPill status={interview.status} />
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {resolveInterviewPosition(interview, isArabic, positionsById)}
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {translatedInterviewValue(t, 'levels', interview.level)}
                </TableCell>

                <TableCell className="py-4 text-sm text-slate-700">
                  {translatedInterviewValue(t, 'types', interview.type)}
                </TableCell>

                <TableCell className="py-3">
                  <ActionGroup
                    onView={() => onView?.(interview)}
                    onEdit={() => onEdit?.(interview)}
                    onDelete={() => onDelete?.(interview)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
