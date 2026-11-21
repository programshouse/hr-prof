import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function HolidayStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('holidays.stats.employeesOnHoliday'),
      value: data?.employeesOnHoliday ?? 0,
      icon: Users,
    },
    {
      title: t('holidays.stats.approvedHolidays'),
      value: data?.approvedHolidays ?? 0,
      icon: CheckCircle,
    },
    {
      title: t('holidays.stats.pendingHolidays'),
      value: data?.pendingHolidays ?? 0,
      icon: Clock,
    },
    {
      title: t('holidays.stats.rejectedHolidays'),
      value: data?.rejectedHolidays ?? 0,
      icon: XCircle,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
