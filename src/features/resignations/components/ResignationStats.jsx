import { Handshake, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function ResignationStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('resignations.stats.totalResignationRequests'),
      value: data?.totalResignations ?? 0,
      icon: Handshake,
    },
    {
      title: t('resignations.stats.approvedResignations'),
      value: data?.approvedResignations ?? 0,
      icon: CheckCircle,
    },
    {
      title: t('resignations.stats.pendingResignations'),
      value: data?.pendingResignations ?? 0,
      icon: Clock,
    },
    {
      title: t('resignations.stats.rejectedResignations'),
      value: data?.rejectedResignations ?? 0,
      icon: XCircle,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
