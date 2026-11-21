// src/features/departments/pages/DepartmentReportPage.jsx
'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  resolveDepartmentDisplayName,
  resolveEmployeeDisplayName,
  resolvePositionDisplayName,
  resolvePositionLabelById,
} from '@/lib/utils/employeeDisplayName';

import DepartmentReportStats from '../components/DepartmentReportStats';
import EmployeesTypeBarChart from '../components/EmployeesTypeBarChart';
import JobsPieChart from '../components/JobsPieChart';
import DepartmentsPositionsTable from '../components/DepartmentsPositionsTable';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';

import EmployeeFilters from '@/features/employees/components/EmployeeFilters';
import EmployeeTable from '@/features/employees/components/EmployeeTable';

import DatePickerInput from '@/components/ui/date-picker-input';

import useDepartmentReportHeaderQuery from '../hooks/useDepartmentReportHeaderQuery';
import useDepartmentReportEmployeesQuery from '../hooks/useDepartmentReportEmployeesQuery';
import useDepartmentReportTurnoverQuery from '../hooks/useDepartmentReportTurnoverQuery';

import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { Button } from '@/components/ui/button';

import TurnoverDetailsModal from '../components/TurnoverDetailsModal';
import DepartmentEmployeesDetailsModal from '../components/DepartmentEmployeesDetailsModal';

import ActivateEmployeeModal from '@/features/employees/components/ActivateEmployeeModal';
import DeactivateEmployeeModal from '@/features/employees/components/DeactivateEmployeeModal';

// IMPORTANT: use the same import style you use in InactiveEmployeesPage
import { EmployeeFormDialog } from '@/features/employees/components/EmployeeFormDialog';

// to fetch full edit payload
import { employeesApi } from '@/features/employees/api/employees.api';

function toApiDate(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/* =======================
   Initials Avatar helpers
======================= */
function getInitials(name) {
  const n = String(name || '').trim();
  if (!n) return '—';
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || parts[0]?.[1] || '';
  return (first + second).toUpperCase() || '—';
}

function initialsAvatarDataUri(name) {
  const initials = getInitials(name);

  const bg = '#E5E7EB'; // slate-200
  const fg = '#94A3B8'; // slate-400

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <circle cx="20" cy="20" r="20" fill="${bg}" />
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        font-size="14" font-weight="700" fill="${fg}">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolveShiftDisplayName(shift, { preferArabic = false } = {}) {
  if (!shift) return '';
  if (typeof shift === 'string') return shift;

  if (preferArabic) {
    return shift.name_ar || shift.name_en || shift.name || '';
  }

  return shift.name_en || shift.name_ar || shift.name || '';
}

export default function DepartmentReportPage() {
  const { departmentId } = useParams();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  /* =======================
     ONE "Show Details" flow
  ======================= */
  const [detailsChooserOpen, setDetailsChooserOpen] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState('active'); // 'active' | 'inactive'
  const [employeesDetailsOpen, setEmployeesDetailsOpen] = useState(false);

  /* =======================
     Activate / Deactivate modals
  ======================= */
  const [activateOpen, setActivateOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  /* =======================
     Edit modal like InactiveEmployeesPage
  ======================= */
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // employees filters
const [filters, setFilters] = useState({
  is_active: 1, //  default active
});
  const [employeesPageSize, setEmployeesPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // turnover date range
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2026-01-31');

  const fromApi = toApiDate(from);
  const toApi = toApiDate(to);

  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useDepartmentReportHeaderQuery(departmentId);

// ADD THIS: build params from filters (same style as Hopscotch)
const employeesParams = useMemo(() => {
  const params = {
    keyword: filters.search || '',
    shift_id: filters.shift_id || '',
    position_id: filters.position_id || '',
    branch_id: filters.branch_id || '',
    is_active: filters.is_active ?? '',

    // backend expects contract_type
    contract_type: filters.employment_type || '',
  };

  // remove empty keys so request matches Hopscotch behavior
  Object.keys(params).forEach((k) => {
    if (params[k] === '' || params[k] === null || params[k] === undefined) {
      delete params[k];
    }
  });

  return params;
}, [filters]);

  const {
    data: employeesRes,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    refetch: refetchEmployees,
  } = useDepartmentReportEmployeesQuery(departmentId, employeesParams);

  const {
    data: turnoverRes,
    isLoading: isTurnoverLoading,
    isError: isTurnoverError,
  } = useDepartmentReportTurnoverQuery({
    departmentId,
    from: fromApi,
    to: toApi,
  });

  // shifts lookup
  const { data: shifts = [] } = useAllShifts();
  const { data: allPositionsData = [] } = useAllPositions();

  const positionsList = useMemo(() => {
    if (Array.isArray(allPositionsData)) return allPositionsData;
    if (allPositionsData?.positions) return allPositionsData.positions;
    if (allPositionsData?.data) return allPositionsData.data;
    return [];
  }, [allPositionsData]);

  const shiftNameById = useMemo(() => {
    const map = new Map();
    shifts.forEach((s) => {
      map.set(Number(s.id), resolveShiftDisplayName(s, { preferArabic: isArabic }) || '—');
    });
    return map;
  }, [shifts, isArabic]);

  const positionLabelById = useMemo(() => {
    const map = new Map();
    positionsList.forEach((pos) => {
      const id = Number(pos.id ?? pos.position_id);
      if (Number.isNaN(id)) return;
      map.set(
        id,
        resolvePositionLabelById(id, positionsList, { preferArabic: isArabic }) ||
          resolvePositionDisplayName(pos, { preferArabic: isArabic, positions: positionsList }) ||
          '—'
      );
    });
    return map;
  }, [positionsList, isArabic]);

  const handleFiltersChange = (next) => {
    setFilters(next || {});
    setPage(1);
  };

  const handlePageSizeChange = (val) => {
    const num = Number(val) || 10;
    setEmployeesPageSize(num);
    setPage(1);
  };

  // position_id -> localized position name
  const positionNameById = useMemo(() => {
    const map = new Map();
    (headerData?.positions_count || []).forEach((p) => {
      const id = Number(p.position_id ?? p.position?.id ?? p.id);
      if (Number.isNaN(id)) return;
      map.set(
        id,
        positionLabelById.get(id) ||
          resolvePositionDisplayName(
            { ...p, position_id: id, position: p.position || p },
            { preferArabic: isArabic, positions: positionsList }
          ) ||
          '—'
      );
    });
    return map;
  }, [headerData?.positions_count, isArabic, positionLabelById, positionsList]);

  // normalize employees for EmployeeTable (API is filtered now)
  const normalizedEmployees = useMemo(() => {
    const list = employeesRes?.employees || [];

    return list.map((e) => {
      const fullName =
        e?.full_name?.trim() ||
        resolveEmployeeDisplayName(e, { preferArabic: isArabic }) ||
        '—';

      const shiftLabel =
        resolveShiftDisplayName(e?.shift, { preferArabic: isArabic }) ||
        shiftNameById.get(Number(e.shift_id)) ||
        '—';

      const departmentLabel =
        resolveDepartmentDisplayName(e?.department, { preferArabic: isArabic }) || '—';

const positionLabel =
        positionNameById.get(Number(e.position_id)) ||
        positionLabelById.get(Number(e.position_id)) ||
        resolvePositionDisplayName(e, { preferArabic: isArabic, positions: positionsList }) ||
        '—';

      return {
        id: e.id,
        code: e.code || `PR-${e.id}`,
        full_name: fullName,
        phone: e?.applicant?.phone || '—',
        position: positionLabel,
        department: departmentLabel,
        shift: shiftLabel,
        join_date: e.join_date || '—',

        // must be boolean for EmployeeTable icon logic
        is_active: Number(e?.is_active) === 1 ? true : false,

        avatarUrl: initialsAvatarDataUri(fullName),
        position_id: e.position_id,
        shift_id: e.shift_id,
      };
    });
  }, [employeesRes?.employees, positionNameById, positionLabelById, positionsList, shiftNameById, isArabic]);

  // since backend now filters, we only paginate client-side
  const totalPages = useMemo(() => {
    const total = normalizedEmployees.length;
    return Math.max(1, Math.ceil(total / employeesPageSize));
  }, [normalizedEmployees.length, employeesPageSize]);

  const safePage = Math.min(page, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (safePage - 1) * employeesPageSize;
    return normalizedEmployees.slice(start, start + employeesPageSize);
  }, [normalizedEmployees, safePage, employeesPageSize]);

  const turnoverRows = useMemo(() => {
    const rows = turnoverRes?.data?.rows || [];
    return rows.map((r) => {
      const id = Number(r?.position_id ?? r?.position?.id);
      const posLabel =
        positionLabelById.get(id) ||
        resolvePositionDisplayName(
          { ...r, position_id: id, position: r?.position || r },
          { preferArabic: isArabic, positions: positionsList }
        ) ||
        '—';

      return {
        position: posLabel,
        replacement: Number(r?.replacement?.value ?? 0),
        growth: Number(r?.growth?.value ?? 0),
        open: Number(r?.open?.value ?? 0),
      };
    });
  }, [turnoverRes, isArabic, positionLabelById, positionsList]);

  const jobsPieData = useMemo(() => {
    const positions = headerData?.positions_count || [];
    return positions.map((p) => {
      const id = Number(p.position_id ?? p.position?.id ?? p.id);
      const sliceName =
        positionLabelById.get(id) ||
        positionNameById.get(id) ||
        resolvePositionDisplayName(
          { ...p, position_id: id, position: p.position || p },
          { preferArabic: isArabic, positions: positionsList }
        ) ||
        '—';

      return {
        name: sliceName,
        value: Number(p.count || 0),
      };
    });
  }, [headerData?.positions_count, isArabic, positionLabelById, positionNameById, positionsList]);

  // Edit like InactiveEmployeesPage (fetch full payload before opening dialog)
  const handleEdit = async (emp) => {
    const fullData = await employeesApi.getPersonalData(emp.id);
    setEditEmployee(fullData);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ===== Stats ===== */}
      {isHeaderError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load department header.
        </div>
      ) : (
        <DepartmentReportStats data={headerData} isLoading={isHeaderLoading} />
      )}

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EmployeesTypeBarChart data={headerData} />
        <JobsPieChart data={jobsPieData} />
      </div>

      {/* ===== Turnover ===== */}
      <div className="border-border rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Turn Over</h3>

          <Button variant="save" size="sm" onClick={() => setDetailsChooserOpen(true)}>
            Show Details
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[170px]">
            <DatePickerInput value={from} onChange={setFrom} placeholder="From" />
          </div>

          <div className="w-full sm:w-[170px]">
            <DatePickerInput value={to} onChange={setTo} placeholder="To" />
          </div>
        </div>

        <div className="border-border mt-4 overflow-hidden rounded-xl border">
          {isTurnoverError ? (
            <div className="px-4 py-3 text-sm text-red-700">Failed to load turnover.</div>
          ) : (
            <DepartmentsPositionsTable rows={turnoverRows} loading={isTurnoverLoading} />
          )}
        </div>
      </div>

      {/* Chooser modal */}
      <TurnoverDetailsModal
        open={detailsChooserOpen}
        onOpenChange={setDetailsChooserOpen}
        value={detailsStatus}
        onChange={(val) => {
          setDetailsStatus(val);
          setDetailsChooserOpen(false);
          setEmployeesDetailsOpen(true);
        }}
      />

      {/* Employees details modal */}
      <DepartmentEmployeesDetailsModal
        open={employeesDetailsOpen}
        onOpenChange={setEmployeesDetailsOpen}
        departmentId={departmentId}
        status={detailsStatus}
      />

      {/* ===== Employees ===== */}
      <div className="border-border rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4">
          <EmployeeFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            showStatus
            hideDepartment
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <PageSizeSelect
            value={employeesPageSize}
            onChange={handlePageSizeChange}
            options={[10, 20, 50, 100, 500]}
          />
        </div>

        {isEmployeesError ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load employees list.
          </div>
        ) : (
          <EmployeeTable
            data={paginatedEmployees}
            loading={isEmployeesLoading}
            hideDepartment
            onRefresh={refetchEmployees}
            onEdit={handleEdit}
            onActivateRequest={(emp) => {
              setSelectedEmployee(emp);
              setActivateOpen(true);
            }}
            onDeactivateRequest={(emp) => {
              setSelectedEmployee(emp);
              setDeactivateOpen(true);
            }}
          />
        )}

        <div className="pt-4">
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Edit dialog */}
      <EmployeeFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditEmployee(null);
        }}
        employee={editEmployee}
      />

      {/* Activate modal */}
      <ActivateEmployeeModal
        open={activateOpen}
        onOpenChange={(v) => {
          setActivateOpen(v);
          if (!v) setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSuccess={() => {
          setActivateOpen(false);
          setSelectedEmployee(null);
          refetchEmployees();
        }}
      />

      {/* Deactivate modal */}
      <DeactivateEmployeeModal
        open={deactivateOpen}
        onOpenChange={(v) => {
          setDeactivateOpen(v);
          if (!v) setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSuccess={() => {
          setDeactivateOpen(false);
          setSelectedEmployee(null);
          refetchEmployees();
        }}
      />
    </div>
  );
}
