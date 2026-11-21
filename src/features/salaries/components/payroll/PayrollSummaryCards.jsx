import { CardContent } from '@/components/ui/card';
import { CircleDollarSign, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InfoCard = ({ icon: Icon, label, value, subValue, bgColorClass }) => (
  <CardContent className={`flex items-center gap-4 rounded-2xl p-4 ${bgColorClass}`}>
    <div className={`rounded-xl bg-white p-3`}>
      <Icon className={`h-5 w-5`} />
    </div>
    <div>
      <p className="text-lg font-semibold">{label}</p>
      <span className="text-gray font-bold">
        {subValue} {value}
      </span>
    </div>
  </CardContent>
);

export function PayrollSummaryCards({ header }) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      <InfoCard
        icon={CircleDollarSign}
        label={t('salaries.payrollSummaryCards.totalSalary')}
        subValue="EGP"
        value={header.net_salary.toLocaleString()}
        bgColorClass="bg-[#EBF0FE]"
      />
      <InfoCard
        icon={TrendingUp}
        label={t('salaries.payrollSummaryCards.kpiScore')}
        subValue=""
        value={`${header.kpi_score}%`}
        bgColorClass="bg-purple-50"
      />
      <InfoCard
        icon={Award}
        label={t('salaries.payrollSummaryCards.totalRewards')}
        subValue="EGP"
        value={header.total_rewards.toLocaleString()}
        bgColorClass="bg-emerald-50"
      />
      <InfoCard
        icon={AlertCircle}
        label={t('salaries.payrollSummaryCards.totalDeductions')}
        subValue=""
        value={header.total_deductions.toLocaleString()}
        bgColorClass="bg-orange-50"
      />
    </div>
  );
}
