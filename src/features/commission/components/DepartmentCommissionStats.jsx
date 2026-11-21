// src/features/commission/components/DepartmentCommissionStats.jsx
import { Users, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SimpleStatCard = ({ title, value, icon: Icon, bgColor, isLoading, tooltip }) => {
  const card = (
    <div
      className={`flex min-w-[200px] flex-1 items-center gap-4 rounded-xl p-4 ${bgColor}`}
    >
      <div className="rounded-xl bg-white/80 p-3">
        <Icon className="size-5 text-black" />
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-black">{title}</span>

        {isLoading ? (
          <div className="mt-2 h-5 w-12 animate-pulse rounded bg-black/10" />
        ) : (
          <span className="text-lg font-semibold text-black/70">{value}</span>
        )}
      </div>
    </div>
  );

  if (!tooltip) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * data expected:
 * {
 *   totalEmployees: number,
 *   eligibleEmployees: number,
 *   totalCommission: number,
 *   averageCommission: number
 * }
 */
export default function DepartmentCommissionStats({ data, isLoading }) {
  const stats = [
    {
      title: 'Total Employees',
      value: data?.totalEmployees ?? 0,
      icon: Users,
      bgColor: 'bg-[#DFF5EE]',
    },
    {
      title: 'Eligible Employees',
      value: data?.eligibleEmployees ?? 0,
      icon: DollarSign,
      bgColor: 'bg-[#EBF0FE]',
    },
    {
      title: 'Total Commission',
      value: `$${(data?.totalCommission ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      bgColor: 'bg-[#FEF4EC]',
    },
    {
      title: 'Average Commission',
      value: `$${(data?.averageCommission ?? 0).toFixed(2)}`,
      icon: Calculator,
      bgColor: 'bg-[#EEE4FF]',
    },
  ];

  return (
    <TooltipProvider>
      {/* same "row of cards" feel as screenshot */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat) => (
          <SimpleStatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </div>
    </TooltipProvider>
  );
}
