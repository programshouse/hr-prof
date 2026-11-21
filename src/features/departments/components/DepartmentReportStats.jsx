// src/features/departments/components/DepartmentReportStats.jsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Clock, Timer, UserRound } from 'lucide-react';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function StatShell({ bg, children }) {
  return (
    <div
      className={['w-full rounded-2xl p-3 shadow-sm sm:p-4', 'flex items-start gap-3', bg].join(
        ' '
      )}
    >
      {children}
    </div>
  );
}

function IconPill({ icon: Icon }) {
  return (
    <div className="shrink-0 rounded-xl bg-white p-2 sm:p-2.5">
      <Icon className="size-5 text-black" />
    </div>
  );
}

function StatBlock({ label, value, valueClass }) {
  return (
    <div className="min-w-0 text-center xl:text-left">
      <div className="text-[11px] font-semibold text-black/60">{label}</div>
      <div className={['truncate text-sm font-bold sm:text-base', valueClass].join(' ')}>
        {value}
      </div>
    </div>
  );
}

/* ✅ FIX: receive t as prop */
function TripleRow({ all, active, inactive, isLoading, t }) {
  if (isLoading) {
    return <div className="mt-3 h-6 w-40 animate-pulse rounded bg-black/10" />;
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-3 xl:hidden">
        <StatBlock label={t('common.all')} value={all} valueClass="text-[#2E5BFF]" />
        <StatBlock label={t('navigation.active')} value={active} valueClass="text-[#16A34A]" />
        <StatBlock label={t('navigation.inactive')} value={inactive} valueClass="text-[#EF4444]" />
      </div>

      <div className="hidden items-center xl:flex">
        <StatBlock label={t('common.all')} value={all} valueClass="text-[#2E5BFF]" />

        <div className="mx-3 h-10 w-px bg-black/10" />

        <StatBlock label={t('navigation.active')} value={active} valueClass="text-[#16A34A]" />

        <div className="mx-3 h-10 w-px bg-black/10" />

        <StatBlock label={t('navigation.inactive')} value={inactive} valueClass="text-[#EF4444]" />
      </div>
    </div>
  );
}

/* ✅ FIX: pass t */
function TripleStatCard({ title, icon, bg, all, active, inactive, isLoading, t }) {
  return (
    <StatShell bg={bg}>
      <IconPill icon={icon} />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-black">{title}</div>

        <TripleRow all={all} active={active} inactive={inactive} isLoading={isLoading} t={t} />
      </div>
    </StatShell>
  );
}

export default function DepartmentReportStats({ data, isLoading }) {
  const { t } = useTranslation();

  const employeesAll = toNumber(data?.total_employees ?? data?.totalEmployees);
  const employeesActive = toNumber(data?.total_active_employees ?? data?.totalActiveEmployees);
  const employeesInactive = toNumber(data?.inactive_employees ?? data?.inactiveEmployees);

  // ===== Full Time =====
  const fullAll = toNumber(data?.full_time_count ?? data?.full_time ?? data?.fullTime);
  const fullActive = toNumber(data?.active_full_time_count ?? data?.activeFullTimeCount);
  const fullInactive = toNumber(
    data?.inactive_full_time ?? data?.inactive_full_time_count ?? data?.inactiveFullTimeCount
  );

  // ===== Part Time =====
  const partAll = toNumber(data?.part_time_count ?? data?.part_time ?? data?.partTime);
  const partActive = toNumber(data?.active_part_time_count ?? data?.activePartTimeCount);
  const partInactive = toNumber(data?.inactive_part_time_count ?? data?.inactivePartTimeCount);

  // ===== Freelance =====
  const freeAll = toNumber(data?.freelance_count ?? data?.freelance ?? data?.freelancerCount);
  const freeActive = toNumber(data?.active_freelance_count ?? data?.activeFreelanceCount);
  const freeInactive = toNumber(data?.inactive_freelance_count ?? data?.inactiveFreelanceCount);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
      <TripleStatCard
        title={t('departments.employees')}
        icon={Users}
        bg="bg-[#DFF5EE]"
        all={employeesAll}
        active={employeesActive}
        inactive={employeesInactive}
        isLoading={isLoading}
        t={t}
      />

      <TripleStatCard
        title={t('departments.fullTimeEmployees')}
        icon={Clock}
        bg="bg-[#FEF4EC]"
        all={fullAll}
        active={fullActive}
        inactive={fullInactive}
        isLoading={isLoading}
        t={t}
      />

      <TripleStatCard
        title={t('departments.partTimeEmployees')}
        icon={Timer}
        bg="bg-[#EBF0FE]"
        all={partAll}
        active={partActive}
        inactive={partInactive}
        isLoading={isLoading}
        t={t}
      />

      <TripleStatCard
        title={t('departments.freelanceEmployees')}
        icon={UserRound}
        bg="bg-[#EEE4FF]"
        all={freeAll}
        active={freeActive}
        inactive={freeInactive}
        isLoading={isLoading}
        t={t}
      />
    </div>
  );
}
