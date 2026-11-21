// src/features/kpi/components/DepartmentKpiStats.jsx
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

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
 *   targetedEmployees: number,
 *   highPerformers: number,
 *   lowPerformers: number
 * }
 */
export default function DepartmentKpiStats({ data, isLoading }) {
  const { t } = useTranslation();
  const stats = [
    {
      title: t('kpi.stats.totalEmployees'),
      value: data?.totalEmployees ?? 0,
      icon: Users,
      bgColor: 'bg-[#DFF5EE]',
    },
    {
      title: t('kpi.stats.averageKpiScore'),
      value: data?.averageKpiScore ?? 0,
      icon: UserPlus,
      bgColor: 'bg-[#EBF0FE]',
    },
    {
      title: t('kpi.stats.belowTarget'),
      value: data?.belowTarget ?? 0,
      icon: UserCheck,
      bgColor: 'bg-[#FEF4EC]',
    },
    {
      title: t('kpi.stats.onTarget'),
      value: data?.onTarget ?? 0,
      icon: UserX,
      bgColor: 'bg-[#EEE4FF]',
    },
  ];

  return (
    <TooltipProvider>
      {/* same “row of cards” feel as screenshot */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat) => (
          <SimpleStatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </div>
    </TooltipProvider>
  );
}
