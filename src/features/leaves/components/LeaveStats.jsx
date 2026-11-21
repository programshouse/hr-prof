import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function LeaveStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('leaves.stats.totalLeaves'),
      value: data?.totalLeaves ?? 0,
      icon: FileText,
    },
    {
      title: t('leaves.stats.approved'),
      value: data?.approvedLeaves ?? 0,
      icon: CheckCircle,
    },
    {
      title: t('leaves.stats.pending'),
      value: data?.pendingLeaves ?? 0,
      icon: Clock,
    },
    {
      title: t('leaves.stats.rejected'),
      value: data?.rejectedLeaves ?? 0,
      icon: XCircle,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
