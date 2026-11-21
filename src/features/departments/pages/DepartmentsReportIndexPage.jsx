'use client';

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { Pagination } from '@/components/ui/Pagination';
import useDepartmentsListQuery from '../hooks/useDepartmentsListQuery';

const tileThemes = [
  {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    title: 'text-primary',
    meta: 'text-indigo-500',
    hover: 'hover:border-indigo-200 hover:bg-indigo-50/80',
    ring: 'focus-visible:ring-indigo-500',
  },
  {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    title: 'text-sky-700',
    meta: 'text-sky-500',
    hover: 'hover:border-sky-200 hover:bg-sky-50/80',
    ring: 'focus-visible:ring-sky-500',
  },
  {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'text-emerald-700',
    meta: 'text-emerald-500',
    hover: 'hover:border-emerald-200 hover:bg-emerald-50/80',
    ring: 'focus-visible:ring-emerald-500',
  },
  {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    title: 'text-orange-700',
    meta: 'text-orange-500',
    hover: 'hover:border-orange-200 hover:bg-orange-50/80',
    ring: 'focus-visible:ring-orange-500',
  },
  {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    title: 'text-rose-700',
    meta: 'text-rose-500',
    hover: 'hover:border-rose-200 hover:bg-rose-50/80',
    ring: 'focus-visible:ring-rose-500',
  },
  {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    title: 'text-violet-700',
    meta: 'text-violet-500',
    hover: 'hover:border-violet-200 hover:bg-violet-50/80',
    ring: 'focus-visible:ring-violet-500',
  },
  {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    title: 'text-amber-700',
    meta: 'text-amber-500',
    hover: 'hover:border-amber-200 hover:bg-amber-50/80',
    ring: 'focus-visible:ring-amber-500',
  },
  {
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    title: 'text-teal-700',
    meta: 'text-teal-500',
    hover: 'hover:border-teal-200 hover:bg-teal-50/80',
    ring: 'focus-visible:ring-teal-500',
  },
];

function getTheme(i) {
  return tileThemes[i % tileThemes.length];
}

export default function DepartmentsReportIndexPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: listRes, isLoading, isError, refetch } = useDepartmentsListQuery({ page });

  const departments = useMemo(() => {
    const rows = listRes?.data || [];
    return rows.map((d) => ({
      id: d.id,
      name: d.name_en || d.name_ar || d.name || `Department #${d.id}`,
      employees: Number(d.employees_count || 0),
    }));
  }, [listRes?.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => String(d.name).toLowerCase().includes(q));
  }, [departments, search]);

  const totalPages = listRes?.last_page || 1;
  const currentPage = listRes?.current_page || page;

  return (
    <div className="space-y-5">
      <Card className="border-border rounded-2xl border bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-primary text-base font-semibold">
                {t('departments.selectDepartment')}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t('departments.chooseDescription')}</p>
            </div>

            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t('departments.searchDepartment')}
                className="h-10 pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border rounded-2xl border bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          {isError ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('departments.failedToLoad')}{' '}
              <button className="underline" onClick={() => refetch()}>
                {t('common.retry')}
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* ✅ EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <Search className="size-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {t('departments.noDepartmentsFound')}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search ? t('departments.noMatch') : t('departments.noAvailable')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((dept, idx) => {
                  const theme = getTheme(idx); // ✅ FIX

                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => navigate(`/departments/report/${dept.id}`)}
                      className={[
                        'group w-full text-left',
                        'rounded-xl border p-4 transition',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        'cursor-pointer',
                        theme.bg,
                        theme.border,
                        theme.hover,
                        theme.ring,
                      ].join(' ')}
                    >
                      <div className={['text-sm font-semibold', theme.title].join(' ')}>
                        {dept.name}
                      </div>

                      <div className={['mt-1 text-xs font-medium', theme.meta].join(' ')}>
                        {dept.employees} {t('dashboard.charts.employees')}
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pt-5">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
