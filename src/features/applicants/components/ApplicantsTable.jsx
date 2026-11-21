// src/features/applicants/components/ApplicantsTable.jsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import StageCell from './StageCell';
import RatingCell from './RatingCell';
import ApplicantRowActions from './ApplicantRowActions';

/* ---------------- Helpers ---------------- */

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(firstName = '', lastName = '', fallback = '') {
  const f = String(firstName || '').trim();
  const l = String(lastName || '').trim();

  const a = f ? f[0] : '';
  const b = l ? l[0] : '';
  const res = (a + b).toUpperCase();

  if (res) return res;

  const fb = String(fallback || '').trim();
  if (!fb) return '--';

  const parts = fb.split(/\s+/).filter(Boolean);
  const x = parts[0]?.[0] || '';
  const y = parts[1]?.[0] || '';

  return (x + y || x || '--').toUpperCase();
}

/* ---------------- Avatar + Name ---------------- */

function AvatarName({ firstName, lastName, fullName, imageUrl }) {
  const initials = useMemo(
    () => getInitials(firstName, lastName, fullName),
    [firstName, lastName, fullName]
  );

  const [imgOk, setImgOk] = useState(Boolean(imageUrl));

  return (
    <div className="flex items-center gap-3">
      {imageUrl && imgOk ? (
        <img
          src={imageUrl}
          alt={fullName || 'Applicant'}
          className="size-9 rounded-full object-cover"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="grid size-9 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {initials}
        </div>
      )}

      <span className="text-sm font-medium text-slate-900">{fullName || '—'}</span>
    </div>
  );
}

/* ---------------- Table ---------------- */

export default function ApplicantsTable({
  rows = [],
  isLoading = false,
  error = null,
  onView,
  onEdit,
  onConvert,
  onDelete,
  onAssignHiring,
  processingIds,
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>{t('tables.headers.id')}</TableHead>
            <TableHead>{t('applicants.headers.name')}</TableHead>
            <TableHead>{t('tables.headers.phone')}</TableHead>
            <TableHead>{t('tables.headers.email')}</TableHead>
            <TableHead>{t('tables.headers.position')}</TableHead>
            <TableHead>{t('applicants.headers.rating')}</TableHead>
            <TableHead>{t('applicants.headers.stages')}</TableHead>
            <TableHead>{t('applicants.headers.expectedSalary')}</TableHead>
            <TableHead>{t('applicants.headers.appliedDate')}</TableHead>
            <TableHead>{t('applicants.headers.availableTime')}</TableHead>
            <TableHead className="text-right">{t('tables.headers.action')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={11} className="py-10 text-center text-sm text-slate-500">
                {t('common.loading')}
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={11} className="py-10 text-center text-sm text-red-500">
                {t('applicants.errorLoading')}: {error.message || t('applicants.unknownError')}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="py-10 text-center text-sm text-slate-500">
                {t('applicants.noApplicantsFound')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const firstName = r.first_name ?? '';
              const lastName = r.last_name ?? '';
              const middleName = r.middle_name ?? '';
              const preferredName = r.preferred_name ?? '';

              const fullName =
                r.full_name ||
                [firstName, middleName, lastName].filter(Boolean).join(' ') ||
                r.name ||
                '—';
              const position =
                r.position_applied_for?.name_en ||
                r.position_applied_for?.name_ar ||
                r.position_applied_for ||
                r.position ||
                '—';

              const expectedSalary = r.expected_salary ?? r.expectedSalary ?? '—';
              const appliedDate = formatDate(r.applied_date);
              const availableTime = formatDate(r.available_start_date ?? r.availableTime);

              const stagesValue = r.interviews_count ?? 0;
              const imageUrl = r.image ?? r.avatar ?? '';

              return (
                <TableRow key={r.id}>
                  {/* ✅ ID Column */}
                  <TableCell className="text-xs font-medium text-slate-600">
                    {r.applicant_code ? r.applicant_code : `ID: ${r.id}`}
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <AvatarName
                      firstName={firstName}
                      lastName={lastName}
                      fullName={fullName}
                      imageUrl={imageUrl}
                    />
                  </TableCell>

                  <TableCell className="text-xs text-slate-700">{r.phone || '—'}</TableCell>

                  <TableCell className="text-xs text-slate-700">{r.email || '—'}</TableCell>

                  <TableCell className="text-xs text-slate-700">{position}</TableCell>

                  <TableCell>
                    <RatingCell value={r.rate ?? r.rating} />
                  </TableCell>

                  <TableCell>
                    <StageCell value={stagesValue} />
                  </TableCell>

                  <TableCell className="text-xs text-slate-700">{expectedSalary}</TableCell>

                  <TableCell className="text-xs text-slate-700">{appliedDate}</TableCell>

                  <TableCell className="text-xs text-slate-700">{availableTime}</TableCell>

                  <TableCell className="text-right">
                    <ApplicantRowActions
                      row={r}
                      onView={onView}
                      onEdit={onEdit}
                      onConvert={onConvert}
                      onDelete={onDelete}
                      onAssignHiring={onAssignHiring}
                      processingIds={processingIds}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
