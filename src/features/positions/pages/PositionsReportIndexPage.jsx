'use client';

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import usePositionsEmployeesCountQuery from '../hooks/usePositionsEmployeesCountQuery';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { resolveDepartmentDisplayName } from '@/lib/utils/employeeDisplayName';

/* =======================
   Same themes as departments page
======================= */
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

export default function PositionsReportIndexPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('all');

  // client-side pagination (because endpoint returns array)
  const [page, setPage] = useState(1);
  const pageSize = 32;

  const { data: listRes, isLoading, isError, refetch } = usePositionsEmployeesCountQuery();

  // departments dropdown
  const { data: departments = [] } = useAllDepartments();

  const departmentNameById = useMemo(() => {
    const map = new Map();
    (departments || []).forEach((d) => {
      map.set(
        Number(d.id),
        resolveDepartmentDisplayName(d, { preferArabic: isArabic }) || `Department #${d.id}`
      );
    });
    return map;
  }, [departments, isArabic]);

  // normalize API -> tiles model
  const positions = useMemo(() => {
    const rows = listRes?.data || [];
    return rows.map((p) => ({
      id: p.id,
      title: isArabic
        ? p.title_ar || p.name_ar || p.title_en || p.name_en || p.title || p.name || `Position #${p.id}`
        : p.title_en || p.name_en || p.title_ar || p.name_ar || p.title || p.name || `Position #${p.id}`,
      employees: Number(p.employees_count || 0),
      department_id: p.department_id,
      department_name: p.department_id
        ? departmentNameById.get(Number(p.department_id)) || `Department #${p.department_id}`
        : '—',
    }));
  }, [listRes?.data, departmentNameById, isArabic]);

  // filter: search + department
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dep = departmentId && departmentId !== 'all' ? Number(departmentId) : null;

    return positions.filter((p) => {
      const matchesSearch =
        !q ||
        String(p.title).toLowerCase().includes(q) ||
        String(p.department_name || '')
          .toLowerCase()
          .includes(q);

      const matchesDepartment = !dep || Number(p.department_id) === dep;

      return matchesSearch && matchesDepartment;
    });
  }, [positions, search, departmentId]);

  // pagination
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length]);

  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  return (
    <div className="space-y-5">
      {/* Header (title + search + department filter in same card) */}
      <Card className="border-border rounded-2xl border bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-primary text-base font-semibold">
                {t('positions.selectPosition')}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t('positions.chooseDescription')}</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative w-full sm:w-[240px]">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('common.search')}
                  className="h-10 pl-9"
                />
              </div>

              {/* Department Filter */}
              <div className="w-full sm:w-[200px]">
                <Select
                  value={departmentId}
                  onValueChange={(val) => {
                    setDepartmentId(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 border-gray-200 bg-white text-sm text-gray-600 shadow-sm">
                    <SelectValue placeholder={t('filters.selectDepartment')} />
                  </SelectTrigger>

                  <SelectContent className="max-h-60">
                    <SelectItem value="all">{t('filters.selectDepartment')}</SelectItem>
                    {(departments || []).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {resolveDepartmentDisplayName(d, { preferArabic: isArabic }) ||
                          `Department #${d.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid wrapper card */}
      <Card className="border-border rounded-2xl border bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          {isError ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('positions.failedToLoad')}{' '}
              <button className="underline" onClick={() => refetch()}>
                {t('positions.retry')}
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
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <Search className="size-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {t('positions.noPositionsFound')}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || (departmentId && departmentId !== 'all')
                  ? t('positions.noMatch')
                  : t('positions.noAvailable')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {paginated.map((pos, idx) => {
                  const t_theme = getTheme(idx);
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => navigate(`/positions/report/${pos.id}`)}
                      className={[
                        'group w-full text-left',
                        'rounded-xl border p-4 transition',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        t_theme.bg,
                        t_theme.border,
                        t_theme.hover,
                        t_theme.ring,
                      ].join(' ')}
                    >
                      <div className={['text-sm font-semibold', t_theme.title].join(' ')}>
                        {pos.title}
                      </div>

                      <div
                        className={['mt-1 cursor-pointer text-xs font-medium', t_theme.meta].join(
                          ' '
                        )}
                      >
                        {pos.employees} {t('positions.employees')}
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pt-5">
                  <Pagination
                    currentPage={safePage}
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
