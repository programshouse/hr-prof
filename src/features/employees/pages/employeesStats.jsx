import { formatCountWithUnit } from '@/utils/durationLabels';

export const getAttendanceStats = (profile, t) => {
  console.log('getAttendanceStats - profile:', profile);
  
  if (!profile) {
    return [
      { label: t('employees.profile.details.summaryCards.attendance.present'), value: '--', color: 'text-muted-foreground' },
      { label: t('employees.profile.details.summaryCards.attendance.absent'), value: '--', color: 'text-muted-foreground' },
      { label: t('employees.profile.details.summaryCards.attendance.late'), value: '--', color: 'text-muted-foreground' },
    ];
  }

  const attendanceData =
    profile.attendance || profile.attendance_card || profile.attendace_card || {};
    
  console.log('getAttendanceStats - attendanceData:', attendanceData);

  return [
    { label: t('employees.profile.details.summaryCards.attendance.present'), value: formatCountWithUnit(t, attendanceData.present_days ?? 0, 'day'), color: 'text-success' },
    { label: t('employees.profile.details.summaryCards.attendance.absent'), value: formatCountWithUnit(t, attendanceData.absent_days ?? 0, 'day'), color: 'text-error' },
    { label: t('employees.profile.details.summaryCards.attendance.late'), value: formatCountWithUnit(t, attendanceData.late_days ?? 0, 'day'), color: 'text-warning' },
  ];
};

export const getMeetingStats = (profile, t) => {
  // If you add meetings later in profile-cards response -> support it here
  const card = profile?.meetings || profile?.meetings_card || {};
  return [
    { label: t('employees.profile.details.summaryCards.meeting.upcoming'), value: String(card.upcoming ?? 0), color: 'text-black' },
    { label: t('employees.profile.details.summaryCards.meeting.attended'), value: String(card.attended ?? 0), color: 'text-success' },
    { label: t('employees.profile.details.summaryCards.meeting.missed'), value: String(card.missed ?? 0), color: 'text-error' },
  ];
};

export const getPerformanceStats = (profile, t) => {
  console.log('getPerformanceStats - profile:', profile);
  
  // Use the kpi object from the API response
  const kpiData = profile?.kpi || {};
  console.log('getPerformanceStats - kpiData:', kpiData);
  
  return [
    {
      label: t('employees.profile.details.summaryCards.performance.kpi'),
      value:
        kpiData.percent != null
          ? String(kpiData.percent)
          : '--',
      color: 'text-success',
    },
    {
      label: t('employees.profile.details.summaryCards.performance.feedback'),
      value:
        kpiData.percent_human != null
          ? String(kpiData.percent_human)
          : t('common.na'),
      color: 'text-muted-foreground',
    },
  ];
};

export const getHolidayStats = (profile, t) => {
  console.log('getHolidayStats - profile:', profile);
  
  const holidayData = profile?.holidays || profile?.holiday_card || {};
  console.log('getHolidayStats - holidayData:', holidayData);
  
  return [
    {
      label: t('employees.profile.details.summaryCards.holidays.remaining'),
      value: formatCountWithUnit(t, holidayData.remaining_days ?? holidayData.remaining ?? 0, 'day'),
      color: 'text-success',
    },
    {
      label: t('employees.profile.details.summaryCards.holidays.used'),
      value: formatCountWithUnit(t, holidayData.used_days ?? holidayData.used ?? 0, 'day'),
      color: 'text-error',
    },
  ];
};
