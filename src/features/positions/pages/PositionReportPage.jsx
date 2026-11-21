// src/features/positions/pages/PositionReportPage.jsx
'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

import DepartmentReportStats from '@/features/departments/components/DepartmentReportStats';
import EmployeesTypeBarChart from '@/features/departments/components/EmployeesTypeBarChart';

import PositionTurnoverDonutChart from '../components/PositionTurnoverDonutChart';
import PositionEmployeesTables from '../components/PositionEmployeesTables';

import { useAllShifts } from '@/shared/hooks/useAllShifts';

import usePositionHeaderQuery from '../hooks/usePositionHeaderQuery';
import usePositionTurnoverQuery from '../hooks/usePositionTurnoverQuery';
import usePositionEmployeesQuery from '../hooks/usePositionEmployeesQuery';

function toApiDate(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function getFullName(applicant) {
  const first = applicant?.first_name || '';
  const middle = applicant?.middle_name || '';
  const last = applicant?.last_name || '';
  return [first, middle, last].filter(Boolean).join(' ').trim() || '—';
}

/* =======================
   Avatar helpers (same style)
======================= */
function getInitials(name) {
  const n = String(name || '').trim();
  if (!n || n === '—') return '—';
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || parts[0]?.[1] || '';
  return (first + second).toUpperCase() || '—';
}

function Avatar({ imageUrl, fullName }) {
  const [imgOk, setImgOk] = useState(true);
  const initials = getInitials(fullName);

  return imageUrl && imgOk ? (
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
  );
}

export default function PositionReportPage() {
  const { positionId } = useParams();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [filters, setFilters] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // turnover date range
  const [from, setFrom] = useState('2026-02-01');
  const [to, setTo] = useState('2027-02-01');

  const fromApi = toApiDate(from);
  const toApi = toApiDate(to);

  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = usePositionHeaderQuery(positionId);

  const {
    data: turnoverRes,
    isLoading: isTurnoverLoading,
    isError: isTurnoverError,
  } = usePositionTurnoverQuery({ positionId, from: fromApi, to: toApi });

  const {
    data: employeesRes,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
  } = usePositionEmployeesQuery(positionId);

  // shifts lookup
  const { data: shifts = [] } = useAllShifts();
  const shiftNameById = useMemo(() => {
    const map = new Map();
    (shifts || []).forEach((s) => {
      map.set(
        Number(s.id),
        isArabic ? s.name_ar || s.name_en || s.name || '—' : s.name_en || s.name_ar || s.name || '—'
      );
    });
    return map;
  }, [shifts, isArabic]);

  const positionTitle = useMemo(() => {
    if (!headerData) return '—';
    return isArabic
      ? headerData.title_ar ||
          headerData.position_name_ar ||
          headerData.title_en ||
          headerData.position_name ||
          '—'
      : headerData.title_en ||
          headerData.position_name ||
          headerData.title_ar ||
          headerData.position_name_ar ||
          '—';
  }, [headerData, isArabic]);

  const handleFiltersChange = (next) => {
    setFilters(next || {});
    setPage(1);
  };

  const handlePageSizeChange = (val) => {
    setPageSize(Number(val) || 10);
    setPage(1);
  };

  // normalize employees (active + inactive)
  const normalizedEmployees = useMemo(() => {
    const active = employeesRes?.active_employees || [];
    const inactive = employeesRes?.inactive_employees || [];

    const all = [
      ...active.map((e) => ({ ...e, __isActive: true })),
      ...inactive.map((e) => ({ ...e, __isActive: false })),
    ];

    return all.map((e) => {
      const fullName = getFullName(e?.applicant);

      return {
        id: e.id,
        code: e.code || `PR-${e.id}`,
        full_name: fullName,
        phone: e?.applicant?.phone || '—',
        position: positionTitle,
        shift: shiftNameById.get(Number(e.shift_id)) || '—',
        join_date: e.join_date || '—',
        is_active: e.__isActive,
        contract_type: e.contract_type || null,

        // NEW: imageUrl for avatar pattern (fallback handled in table/avatar component)
        imageUrl: e?.applicant?.profile_image || null,

        shift_id: e.shift_id,
      };
    });
  }, [employeesRes, shiftNameById, positionTitle]);

  // filtering (kept as-is)
  const filteredEmployees = useMemo(() => {
    const search = String(filters?.search || '')
      .toLowerCase()
      .trim();

    const shiftId =
      filters?.shift_id && filters?.shift_id !== 'all' ? Number(filters.shift_id) : null;

    // your filters component uses employment_type, not contract_type
    const type =
      filters?.employment_type && filters?.employment_type !== 'all'
        ? String(filters.employment_type).toLowerCase()
        : null;

    return normalizedEmployees.filter((e) => {
      const matchesSearch =
        !search ||
        String(e.full_name || '')
          .toLowerCase()
          .includes(search) ||
        String(e.phone || '')
          .toLowerCase()
          .includes(search) ||
        String(e.code || '')
          .toLowerCase()
          .includes(search);

      const matchesShift = !shiftId || Number(e.shift_id) === shiftId;
      const matchesType = !type || String(e.contract_type || '').toLowerCase() === type;

      return matchesSearch && matchesShift && matchesType;
    });
  }, [normalizedEmployees, filters]);

  const totalPages = useMemo(() => {
    const total = filteredEmployees.length;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [filteredEmployees.length, pageSize]);

  const safePage = Math.min(page, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, safePage, pageSize]);

  const navigate = useNavigate();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      {!isHeaderLoading && !isHeaderError && headerData && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {positionTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('positions.reportDescription', 'Detailed statistics and employee list for this position.')}
            </p>
          </div>
          <Button
            onClick={() => navigate(`/jobs/${positionId}`)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm h-11 px-5 font-semibold"
          >
            <Briefcase className="mr-2 size-4" />
            {t('positions.viewInterviewSections', 'Interview Sections')}
          </Button>
        </div>
      )}

      {/* Stats like department page */}
      {isHeaderError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('positions.errors.failedToLoadHeader')}
        </div>
      ) : (
        <DepartmentReportStats data={headerData} isLoading={isHeaderLoading} />
      )}

      {/* Charts row (bar + donut) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EmployeesTypeBarChart data={headerData} />
        {isTurnoverError ? (
          <div className="border-border rounded-2xl border bg-white p-4 shadow-sm">
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('positions.errors.failedToLoadTurnover')}
            </div>
          </div>
        ) : (
          <PositionTurnoverDonutChart data={turnoverRes} loading={isTurnoverLoading} />
        )}
      </div>

      {/* Employees tables (Active / Inactive) */}
      {isEmployeesError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('positions.errors.failedToLoadEmployees')}
        </div>
      ) : (
        <PositionEmployeesTables employeesRes={employeesRes} loading={isEmployeesLoading} />
      )}
    </div>
  );
}
