import { CircleAlert, Users, DollarSign } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';

export default function PenaltyStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
    {
      title: t('penalties.stats.totalPenalties'),
      value: data?.totalPenalties ?? 0,
      icon: CircleAlert,
    },
    {
      title: t('penalties.stats.affectedEmployees'),
      value: data?.affectedEmployees ?? 0,
      icon: Users,
    },
    {
      title: t('penalties.stats.totalAmount'),
      value: data?.totalAmount ? `${data.totalAmount} EGP` : '0 EGP',
      icon: DollarSign,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={3} />;
}
