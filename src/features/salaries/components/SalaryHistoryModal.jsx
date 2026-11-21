import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { salariesApi } from '../api/salariesApi';

function formatMoney(value, locale = 'en-US') {
  if (value === null || value === undefined || value === '') return '--';

  return Number(value).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value, locale = 'en-US') {
  if (!value) return '--';

  try {
    return new Date(value).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function formatShortDate(value, locale = 'en-US') {
  if (!value) return '--';

  try {
    return new Date(value).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase() || '--';
}

function getChangeTypeLabel(value, t) {
  if (value === 'annual_increase' || value === 'annualIncrease') {
    return t('salaries.changeTypes.annualIncrease');
  }

  if (value === 'decrease') return t('salaries.changeTypes.decrease');
  if (value === 'promotion') return t('salaries.changeTypes.promotion');

  return value || '--';
}

function getChangeTypeStyle(value) {
  if (value === 'decrease') return 'bg-pink-100 text-pink-600';
  if (value === 'promotion') return 'bg-green-100 text-green-700';
  return 'bg-fuchsia-100 text-fuchsia-600';
}

export default function SalaryHistoryModal({ open, onOpenChange, employeeId }) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const { data, isLoading } = useQuery({
    queryKey: ['employeeSalaryHistory', employeeId],
    queryFn: () => salariesApi.getEmployeeSalaryHistory(employeeId),
    enabled: open && !!employeeId,
  });

  const employee = data?.employee;
  const history = Array.isArray(data?.data) ? data.data : [];

  const employeeName = employee?.name || '--';
  const currentSalary = employee?.current_salary;
  const currentKpi = employee?.current_kpi;
  const lastUpdate = employee?.last_update;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="max-h-[92vh] max-w-[390px] overflow-y-auto rounded-none border-0 bg-white p-0 shadow-2xl sm:rounded-3xl [&>button]:hidden"
      >
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : (
          <div className="min-h-[640px] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                  {getInitials(employeeName)}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{employeeName}</h3>
                  <p className="text-xs font-medium text-slate-500">
                    {employee?.code || '--'}
                    {employee?.position ? ` · ${employee.position}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">
                  {t('salaries.history.currentSalary')}
                </p>
                <p className="text-lg font-extrabold text-slate-900">
                  {formatMoney(currentSalary, locale)}
                </p>
              </div>

              <div className="border-slate-300 px-4 ltr:border-l rtl:border-r">
                <p className="mb-2 text-xs font-medium text-slate-500">
                  {t('salaries.history.lastUpdate')}
                </p>
                <p className="text-sm font-extrabold text-slate-900">
                  {formatShortDate(lastUpdate, locale)}
                </p>
              </div>
            </div>

            <h4 className="mb-4 text-sm font-extrabold text-slate-900">
              {t('salaries.history.timeline', 'Salary History Timeline')}
            </h4>

            {history.length ? (
              <div className="relative space-y-4 pb-4">
                <div className="absolute top-2 bottom-6 w-px bg-slate-300 ltr:left-[7px] rtl:right-[7px]" />

                {history.map((item, index) => {
                  const dotColor =
                    item.change_type === 'promotion'
                      ? 'bg-green-500'
                      : index === history.length - 1
                        ? 'bg-slate-600'
                        : 'bg-fuchsia-500';

                  return (
                    <div key={item.id} className="relative flex gap-4">
                      <div className="relative z-10 mt-2">
                        <span className={`block h-4 w-4 rounded-full ${dotColor}`} />
                      </div>

                      <div className="flex-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-900" />
                            <p className="text-xs font-extrabold text-slate-900">
                              {formatDate(item.effective_from, locale)}
                            </p>
                          </div>

                          <span
                            className={`rounded-lg px-3 py-1 text-[10px] font-semibold ${getChangeTypeStyle(
                              item.change_type
                            )}`}
                          >
                            {getChangeTypeLabel(item.change_type, t)}
                          </span>
                        </div>

                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-900">
                          <span>{formatMoney(item.old_base_salary, locale)}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-extrabold">
                            {formatMoney(item.new_base_salary, locale)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-900">
                            <span>
                              {t('salaries.history.oldKpi', 'Old KPI')}:{' '}
                              {formatMoney(item.old_kpi, locale)}
                            </span>

                            <span className="text-slate-500">→</span>

                            <span>
                              {t('salaries.history.newKpi', 'New KPI')}:{' '}
                              {formatMoney(item.new_kpi, locale)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-900">
                            <span>
                              {t('salaries.history.oldCommission', 'Old Commission')}:{' '}
                              {item.old_commission_percentage !== null &&
                              item.old_commission_percentage !== undefined
                                ? `${Number(item.old_commission_percentage).toLocaleString(locale)}%`
                                : '--'}
                            </span>

                            <span className="text-slate-500">→</span>

                            <span>
                              {t('salaries.history.newCommission', 'New Commission')}:{' '}
                              {item.new_commission_percentage !== null &&
                              item.new_commission_percentage !== undefined
                                ? `${Number(item.new_commission_percentage).toLocaleString(locale)}%`
                                : '--'}
                            </span>
                          </div>
                        </div>
                        {item.notes ? (
                          <p className="mt-2 text-[11px] font-medium text-slate-500">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  {t('salaries.history.noHistory')}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
