import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, TrendingUp, Gift } from 'lucide-react';
import { getAttendanceStats, getMeetingStats, getPerformanceStats, getHolidayStats } from '../../pages/employeesStats';

const SummaryCard = ({ title, stats, icon: Icon, bgColor }) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white p-2">
            <Icon className="size-4 text-gray-600" />
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{stat.label}</span>
            <span className={`text-sm font-medium ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function EmployeeSummaryCards({ employee, isLoading = false }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-gray-200 p-2">
                  <div className="size-4 bg-gray-300 rounded" />
                </div>
                <div className="h-4 w-20 bg-gray-300 rounded" />
              </div>
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-3 w-12 bg-gray-300 rounded" />
                    <div className="h-3 w-8 bg-gray-300 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const attendanceStats = getAttendanceStats(employee, t);
  const meetingStats = getMeetingStats(employee, t);
  const performanceStats = getPerformanceStats(employee, t);
  const holidayStats = getHolidayStats(employee, t);

  console.log('Employee data for stats:', employee);
  console.log('Attendance stats:', attendanceStats);
  console.log('Holiday stats:', holidayStats);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title={t('employees.profile.details.summaryCards.attendance.title')}
        stats={attendanceStats}
        icon={Calendar}
        bgColor="bg-[#FEF4EC]"
      />
      
      <SummaryCard
        title={t('employees.profile.details.summaryCards.meeting.title')}
        stats={meetingStats}
        icon={Users}
        bgColor="bg-[#EBF0FE]"
      />
      
      <SummaryCard
        title={t('employees.profile.details.summaryCards.performance.title')}
        stats={performanceStats}
        icon={TrendingUp}
        bgColor="bg-[#DFF5EE]"
      />
      
      <SummaryCard
        title={t('employees.profile.details.summaryCards.holidays.title')}
        stats={holidayStats}
        icon={Gift}
        bgColor="bg-[#F6F1FF]"
      />
    </div>
  );
}

export default EmployeeSummaryCards;
