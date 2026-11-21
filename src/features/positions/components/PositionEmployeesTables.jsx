'use client';

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, UserMinus, UserCheck } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import ActivateEmployeeModal from '@/features/employees/components/ActivateEmployeeModal';
import DeactivateEmployeeModal from '@/features/employees/components/DeactivateEmployeeModal';

/* =======================
   Helpers
======================= */

function getFullName(r) {
  return r?.full_name || r?.applicant?.full_name_ar || '—';
}

function getInitials(name) {
  const n = String(name || '').trim();
  if (!n || n === '—') return '—';

  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || parts[0]?.[1] || '';

  return (first + second).toUpperCase() || '—';
}

/* =======================
   Avatar
======================= */

function Avatar({ imageUrl, fullName }) {
  const [imgOk, setImgOk] = useState(true);
  const initials = getInitials(fullName);

  if (imageUrl && imgOk) {
    return (
      <img
        src={imageUrl}
        alt={fullName || 'Employee'}
        className="size-9 rounded-full object-cover"
        onError={() => setImgOk(false)}
      />
    );
  }

  return (
    <div className="grid size-9 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
      {initials}
    </div>
  );
}

/* =======================
   Mini Table
======================= */

function MiniTable({
  title,
  rows,
  dateLabel,
  dateKey,
  loading,
  tableStatus,
  onActivate,
  onDeactivate,
  processingIds,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card className="border-border rounded-2xl border bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  <th className="px-4 py-3">{t('positions.tables.headers.id')}</th>
                  <th className="px-4 py-3">{t('positions.tables.headers.name')}</th>
                  <th className="px-4 py-3">{t('positions.tables.headers.department')}</th>
                  <th className="px-4 py-3">{dateLabel}</th>
                  <th className="px-4 py-3 text-right">{t('positions.tables.headers.action')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4">
                        <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 animate-pulse rounded-full bg-slate-100" />
                          <div>
                            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="ml-auto h-9 w-20 animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      {t('positions.actions.noData')}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const isRowProcessing = processingIds.has(r.id);

                    const showActivate = tableStatus === 'inactive';
                    const StatusIcon = showActivate ? UserCheck : UserMinus;

                    const statusBtnClass = showActivate
                      ? 'bg-light-success text-success'
                      : 'bg-slate-200 text-slate-600';

                    const statusTitle = showActivate
                      ? t('positions.actions.activateEmployee')
                      : t('positions.actions.deactivateEmployee');

                    const displayName = getFullName(r);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-4 text-slate-700">{r.id}</td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar imageUrl={r.imageUrl} fullName={displayName} />

                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-semibold text-slate-900">
                                {displayName}
                              </div>

                              <div className="truncate text-[12px] text-slate-500">
                                {r.code || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-slate-700">{r.department || '—'}</td>

                        <td className="px-4 py-4 text-slate-700">{r[dateKey] || '—'}</td>

                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
                              onClick={() => navigate(`/employees/${r.id}`)}
                              title={t('positions.actions.viewEmployee')}
                            >
                              <Eye className="size-4" />
                            </button>

                            <button
                              type="button"
                              className={`flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 disabled:opacity-50 ${statusBtnClass}`}
                              title={statusTitle}
                              disabled={isRowProcessing}
                              onClick={() => {
                                if (showActivate) onActivate(r);
                                else onDeactivate(r);
                              }}
                            >
                              {isRowProcessing ? (
                                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <StatusIcon className="size-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =======================
   Main Component
======================= */

export default function PositionEmployeesTables({ employeesRes, loading, onRefresh }) {
  const [activateOpen, setActivateOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  const { t } = useTranslation();

  const normalized = useMemo(() => {
    const active = employeesRes?.active_employees || [];
    const inactive = employeesRes?.inactive_employees || [];

    const normalizeOne = (e, isActive) => ({
      id: e.id,
      code: e.code || `PR-${e.id}`,

      full_name: e?.full_name || e?.applicant?.full_name_ar || '—',

      imageUrl: e?.applicant?.profile_image || null,
      department: e?.department?.name_ar || e?.department?.name_en || '—',

      position: e?.position?.name_en || '—',
      phone: e?.applicant?.phone || '—',

      hire_date: e.join_date || '—',
      separation_date: e.separation_date || '—',

      is_active: isActive,
    });

    return {
      active: active.map((e) => normalizeOne(e, true)),
      inactive: inactive.map((e) => normalizeOne(e, false)),
    };
  }, [employeesRes]);

  const handleActivateRequest = (employee) => {
    setSelectedEmployee(employee);
    setActivateOpen(true);
  };

  const handleDeactivateRequest = (employee) => {
    setSelectedEmployee(employee);
    setDeactivateOpen(true);
  };

  const wrapOnSuccess = () => {
    onRefresh?.();
    setSelectedEmployee(null);
  };

  const markProcessing = (employee, isProcessing) => {
    if (!employee?.id) return;

    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (isProcessing) next.add(employee.id);
      else next.delete(employee.id);
      return next;
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MiniTable
          title={t('positions.inactiveEmployees')}
          rows={normalized.inactive}
          dateLabel={t('positions.tables.headers.separationDate')}
          dateKey="separation_date"
          loading={loading}
          tableStatus="inactive"
          onActivate={(emp) => {
            markProcessing(emp, true);
            handleActivateRequest(emp);
          }}
          onDeactivate={handleDeactivateRequest}
          processingIds={processingIds}
        />

        <MiniTable
          title={t('positions.activeEmployees')}
          rows={normalized.active}
          dateLabel={t('positions.tables.headers.hireDate')}
          dateKey="hire_date"
          loading={loading}
          tableStatus="active"
          onActivate={handleActivateRequest}
          onDeactivate={(emp) => {
            markProcessing(emp, true);
            handleDeactivateRequest(emp);
          }}
          processingIds={processingIds}
        />
      </div>

      <ActivateEmployeeModal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        employee={selectedEmployee}
        onSuccess={() => {
          markProcessing(selectedEmployee, false);
          wrapOnSuccess();
        }}
      />

      <DeactivateEmployeeModal
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        employee={selectedEmployee}
        onSuccess={() => {
          markProcessing(selectedEmployee, false);
          wrapOnSuccess();
        }}
      />
    </>
  );
}