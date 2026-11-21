// src/features/departments/components/DepartmentEmployeesDetailsModal.jsx
'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

import useDepartmentReportAllDetailsQuery from '../hooks/useDepartmentReportAllDetailsQuery';

/* =======================
   Helpers
======================= */
function avatarUrlFor(fullName, profileImage) {
  if (profileImage) return profileImage;
  const name = encodeURIComponent(fullName || 'Employee');
  return `https://ui-avatars.com/api/?name=${name}&background=E5E7EB&color=475569&bold=true`;
}

function toDateOnly(value) {
  if (!value) return '—';
  return String(value).slice(0, 10);
}

/* =======================
   Single Table Card (Read Only)
======================= */
function EmployeesTableCard({ title, rows, dateLabel, dateKey, loading }) {
  const { t } = useTranslation();
  return (
    <Card className="border-border rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-4 py-3">{t('tables.headers.id')}</th>
                <th className="px-4 py-3 text-center">{t('tables.headers.name')}</th>
                <th className="px-4 py-3 text-right">{dateLabel}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-5">
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-5 text-slate-700">{r.code}</td>

                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatarUrl}
                          alt={r.full_name || 'Employee'}
                          className="size-9 rounded-full object-cover"
                        />
                        <div className="text-[13px] font-semibold text-slate-900">
                          {r.full_name}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-5 text-right font-medium whitespace-nowrap text-slate-700 tabular-nums">
                      {r[dateKey]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

/* =======================
   Main Modal (Read Only)
======================= */
export default function DepartmentEmployeesDetailsModal({
  open,
  onOpenChange,
  departmentId,
  status = 'active', // 'active' | 'inactive'
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { data, isLoading, isError } = useDepartmentReportAllDetailsQuery(departmentId);

  const normalized = useMemo(() => {
    const active = Array.isArray(data?.active_employees) ? data.active_employees : [];
    const inactive = Array.isArray(data?.inactive_employees) ? data.inactive_employees : [];

    const mapOne = (e) => {
      const fullName =
        e?.full_name?.trim() ||
        resolveEmployeeDisplayName(e, { preferArabic: isArabic }) ||
        '—';
      return {
        id: e.id,
        code: e.code || `PR-${e.id}`,
        full_name: fullName,
        avatarUrl: avatarUrlFor(fullName, e?.applicant?.profile_image),
        hire_date: toDateOnly(e?.join_date),
        separation_date: toDateOnly(e?.separation_date),
      };
    };

    return {
      active: active.map(mapOne),
      inactive: inactive.map(mapOne),
    };
  }, [data, isArabic]);

  const isActive = status === 'active';

  const tableTitle = isActive ? t('navigation.active') : t('navigation.inactive');
  const dateLabel = isActive ? t('tables.headers.hireDate') : t('departments.separationDate');
  const dateKey = isActive ? 'hire_date' : 'separation_date';
  const rows = isActive ? normalized.active : normalized.inactive;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border max-w-4xl rounded-2xl border bg-[#F5F7FF] p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900">
            {t('departments.employeesDetails')}
          </DialogTitle>
        </DialogHeader>

        {isError ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {t('departments.failedToLoadEmployees')}
          </div>
        ) : (
          <EmployeesTableCard
            title={tableTitle}
            rows={rows}
            dateLabel={dateLabel}
            dateKey={dateKey}
            loading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
