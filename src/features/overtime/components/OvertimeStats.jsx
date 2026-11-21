import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function OvertimeStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('overtime.stats.totalRequests'),
      value: data?.totalRequests ?? 0,
      icon: Users,
    },
    {
      title: t('overtime.stats.approvedOvertime'),
      value: data?.approvedOvertime ?? 0,
      icon: CheckCircle,
    },
    {
      title: t('overtime.stats.pendingOvertime'),
      value: data?.pendingOvertime ?? 0,
      icon: Clock,
    },
    {
      title: t('overtime.stats.rejectedOvertime'),
      value: data?.rejectedOvertime ?? 0,
      icon: XCircle,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
