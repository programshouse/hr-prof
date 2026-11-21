import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Home, CalendarOff, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatValueWithUnitSuffix } from '@/utils/durationLabels';

const AttendanceMiniCard = ({ icon: Icon, label, value }) => (
  <div className="flex flex-1 items-start gap-4 rounded-xl border bg-white p-4">
    <div className={`h-fit rounded-lg bg-white p-2 shadow-sm`}>
      <Icon className={`text-light-purple h-4 w-4`} />
    </div>
    <div className="mb-2 flex flex-col gap-3">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="text-sm font-medium text-slate-500">{value}</span>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className="h-5 w-5 text-slate-600" />
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
  </div>
);

export function PayrollAbsenceAttendance({ absence_attendance, attendance_details }) {
  const { t } = useTranslation();
  
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="pb-2">
        <SectionHeader icon={Clock} title={t('salaries.absenceAndAttendance.title')} />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 py-4">
        <AttendanceMiniCard
          icon={Clock}
          label={t('salaries.absenceAndAttendance.attendance')}
          value={formatValueWithUnitSuffix(t, absence_attendance.attendance.days, 'day')}
        />
        <AttendanceMiniCard
          icon={Home}
          label={t('salaries.absenceAndAttendance.remotely')}
          value={formatValueWithUnitSuffix(t, absence_attendance.remotely.days, 'day')}
        />
        <div className="flex min-w-[300px] flex-2 flex-col rounded-xl border bg-white p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <CalendarOff className="text-light-purple h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">{t('salaries.absenceAndAttendance.absence')}</span>
          </div>
          <div className="flex items-center justify-between divide-x divide-slate-200 rounded-lg bg-slate-50/50 p-2">
            <div className="flex flex-1 flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('salaries.absenceAndAttendance.total')}</span>
              <span className="text-sm font-bold text-slate-900">
                {absence_attendance.absence.total}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('salaries.absenceAndAttendance.paid')}</span>
              <span className="text-sm font-bold text-slate-900">
                {absence_attendance.absence.paid}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{t('salaries.absenceAndAttendance.unpaid')}</span>
              <span className="text-sm font-bold text-slate-900">
                {absence_attendance.absence.unpaid}
              </span>
            </div>
          </div>
        </div>
        <AttendanceMiniCard
          icon={ShieldCheck}
          label={t('salaries.absenceAndAttendance.insurance')}
          value={absence_attendance.insurance}
        />
        <AttendanceMiniCard
          icon={CalendarOff}
          label={t('salaries.absenceAndAttendance.absentWithoutRequest')}
          value={formatValueWithUnitSuffix(
            t,
            absence_attendance?.absent_without_request_days ??
              absence_attendance?.absent_without_request ??
              0,
            'day'
          )}
        />
      </CardContent>
    </Card>
  );
}
