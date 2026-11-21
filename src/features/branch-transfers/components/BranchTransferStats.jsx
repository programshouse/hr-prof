import { Users, XCircle, Clock, ArrowRightLeft } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function BranchTransferStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('branchTransfers.stats.totalRequests'),
      value: data?.totalRequests ?? 0,
      icon: Users,
    },
    {
      title: t('branchTransfers.stats.approvedTransfers'),
      value: data?.approvedTransfers ?? 0,
      icon: ArrowRightLeft,
    },
    {
      title: t('branchTransfers.stats.pendingTransferRequests'),
      value: data?.pendingTransfers ?? 0,
      icon: Clock,
    },
    {
      title: t('branchTransfers.stats.rejectedTransfers'),
      value: data?.rejectedTransfers ?? 0,
      icon: XCircle,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
