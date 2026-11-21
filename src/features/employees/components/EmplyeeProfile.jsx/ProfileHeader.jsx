import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/services/auth/auth.store';

const profileTabs = [
  'personalInformation',
  'qualifications',
  'activity',
  'holidays',
  'totalHoliday',
  'rewardsAndPenalties',
  'kpiPerformance',
  'requests',
  'salary',
  'payrollSetting',
  'meetings',
  'assets',
  'exceptions',
];

const managerTabs = [...profileTabs, 'teams'];

export default function ProfileHeader({ activeTab, onTabChange, employee }) {
  const { t } = useTranslation();
  const { role, authSource } = useAuthStore();

  // Employee portal navigation lives entirely in the sidebar.
  // This applies to BOTH normal employees and managers logged in through
  // /portal/login. HR/Admin keeps the horizontal profile tabs.
  const isEmployeePortal = role === 'employee' || authSource === 'employee-login';
  if (isEmployeePortal) return null;

  const viewedEmployeeIsManager =
    employee?.is_manager === true ||
    employee?.is_manager === 1 ||
    employee?.is_manager === '1' ||
    employee?.is_manager === 'true';

  const tabs = viewedEmployeeIsManager ? managerTabs : profileTabs;

  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={[
            'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
            activeTab === tab
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:bg-slate-200',
          ].join(' ')}
        >
          {t(`employees.profile.tabs.${tab}`)}
        </button>
      ))}
    </div>
  );
}
