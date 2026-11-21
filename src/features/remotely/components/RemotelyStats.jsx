import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function RemotelyStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('remotely.stats.totalRemoteRequests'),
      value: data?.totalRemotely ?? 0,
      icon: FileText,
    },
    {
      title: t('remotely.stats.approved'),
      value: data?.approvedRemotely ?? 0,
      icon: CheckCircle,
    },
    {
      title: t('remotely.stats.pending'),
      value: data?.pendingRemotely ?? 0,
      icon: Clock,
    },
    {
      title: t('remotely.stats.rejected'),
      value: data?.rejectedRemotely ?? 0,
      icon: XCircle,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
