// src/features/employees/components/EmployeeStats.jsx
import { Users, UserPlus, User, UserCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

const Divider = () => <div className="bg-default mx-4 h-6 w-[1.5px]" />;

const SimpleStatCard = ({
  title,
  value,
  icon: Icon,
  bgColor,
  isLoading,
  tooltip,
  t,

  // variants
  all,
  active,
  inactive,
}) => {
  const isThreeVariant = all !== undefined && active !== undefined && inactive !== undefined;
  const isSplitVariant = !isThreeVariant && active !== undefined && inactive !== undefined;

  const cardContent = (
    <div
      className={`flex min-w-[180px] flex-1 items-center gap-4 rounded-md p-2 shadow-sm sm:rounded-xl sm:p-4 ${bgColor}`}
    >
      <div className="rounded-lg bg-white p-2 sm:p-3">
        <Icon className="size-4 text-black sm:size-6" />
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium text-black">{title}</div>

        {isLoading ? (
          <div className="mt-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
        ) : isThreeVariant ? (
          <div className="mt-2 flex items-center">
            <div className="flex flex-col items-start">
              <span className="text-gray text-xs font-semibold">{t('employees.stats.all')}</span>
              <span className="text-foreground text-sm font-bold sm:text-lg">{all}</span>
            </div>

            <Divider />

            <div className="flex flex-col items-start">
              <span className="text-gray text-xs font-semibold">{t('employees.stats.active')}</span>
              <span className="text-success text-sm font-bold sm:text-lg">{active}</span>
            </div>

            <Divider />

            <div className="flex flex-col items-start">
              <span className="text-gray text-xs font-semibold">{t('employees.stats.inactive')}</span>
              <span className="text-error text-sm font-bold sm:text-lg">{inactive}</span>
            </div>
          </div>
        ) : isSplitVariant ? (
          <div className="mt-2 flex items-center">
            <div className="flex flex-col items-start">
              <span className="text-gray text-xs font-semibold">{t('employees.stats.active')}</span>
              <span className="text-success text-sm font-bold sm:text-lg">{active}</span>
            </div>

            <Divider />

            <div className="flex flex-col items-start">
              <span className="text-gray text-xs font-semibold">{t('employees.stats.inactive')}</span>
              <span className="text-error text-sm font-bold sm:text-lg">{inactive}</span>
            </div>
          </div>
        ) : (
          <span className="mt-2 block text-sm font-medium text-gray-600 sm:text-lg">{value}</span>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
};

export default function EmployeeStats({ data, isLoading }) {
  const { t } = useTranslation();
  // date range for tooltip
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ✅ supports snake_case + camelCase

  const stats = [
    {
      title: t('employees.stats.totalEmployees'),
      active: data?.total_active_employees || 0,
      inactive: data?.inactive_employees || 0,
      icon: Users,
      bgColor: 'bg-[#DFF5EE]',
    },
    {
      title: t('employees.stats.newEmployees'),
      value: data?.new_employees ?? 0,
      icon: UserPlus,
      bgColor: 'bg-[#FEF4EC]',
      tooltip: `Employees who joined in the last month (${formatDate(lastMonth)} - ${formatDate(today)})`,
    },
    {
      title: t('employees.stats.male'),
      value: data?.male_count ?? 0,
      icon: User,
      bgColor: 'bg-[#EBF0FE]',
    },
    {
      title: t('employees.stats.female'),
      value: data?.female_count ?? 0,
      icon: UserCheck,
      bgColor: 'bg-[#EEE4FF]',
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SimpleStatCard key={stat.title} {...stat} isLoading={isLoading} t={t} />
        ))}
      </div>
    </TooltipProvider>
  );
}
