import { CircleAlert, Users, DollarSign } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function RewardStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('rewards.stats.totalRewards'),
      value: data?.totalRewards ?? 0,
      icon: CircleAlert,
    },
    {
      title: t('rewards.stats.affectedEmployees'),
      value: data?.affectedEmployees ?? 0,
      icon: Users,
    },
    {
      title: t('rewards.stats.totalAmount'),
      value: data?.totalAmount ? `${data.totalAmount} EGP` : '0 EGP',
      icon: DollarSign,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={3} />;
}
