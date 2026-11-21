import { Users, CheckCircle,  Clock, Banknote } from 'lucide-react';
import StatsSummary from '@/components/feedback/StatsSummary';
import { useTranslation } from 'react-i18next';
import { use } from 'react';

export default function LoanStats({ data, isLoading }) {
  const { t } = useTranslation();
  
  const stats = [
     {
      title: t('loans.stats.totalAmount'),
      value: `${data?.totalAmount ?? 0} EGP`,
      icon: Banknote,
    },
    {
      title: t('loans.stats.totalEmployees'),
      value: data?.totalEmployees ?? 0,
      icon: Users,
    },
      {
      title: t('loans.stats.approvedLoans'),
      value: data?.approvedLoans ?? 0,
      icon: CheckCircle,
    },
    {
      title: t('loans.stats.pendingLoans'),
      value: data?.pendingLoans ?? 0,
      icon: Clock,
    },
  ];

  return <StatsSummary stats={stats} isLoading={isLoading} columns={4} />;
}
