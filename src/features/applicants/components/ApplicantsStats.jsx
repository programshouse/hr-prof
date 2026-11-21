// src/features/applicants/components/ApplicantsStats.jsx
import { Users, UserPlus, Clock, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const SimpleStatCard = ({ title, value, icon: Icon, isLoading }) => {
  return (
    <div className="flex min-w-[180px] flex-1 items-center gap-4 rounded-md bg-white p-2 shadow-sm sm:rounded-xl sm:p-4">
      {/* Icon */}
      <div className="rounded-lg bg-white p-2 sm:p-3">
        <Icon className="text-primary size-4 sm:size-6" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="text-sm font-medium text-black">{title}</div>

        {isLoading ? (
          <div className="mt-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
        ) : (
          <span className="mt-2 block text-sm font-medium text-gray-600 sm:text-lg">{value}</span>
        )}
      </div>
    </div>
  );
};

export default function ApplicantsStats({ data, isLoading }) {
  const { t } = useTranslation();
  const total = toNumber(data?.total_applicants);
  const newApplicants = toNumber(data?.new_applicants);
  const pending = toNumber(data?.pending_applicants);
  const rejected = toNumber(data?.rejected_applicants);

  const stats = [
    {
      title: t('applicants.stats.total'),
      value: total,
      icon: Users,
    },
    {
      title: t('applicants.stats.new'),
      value: newApplicants,
      icon: UserPlus,
    },
    {
      title: t('applicants.stats.pending'),
      value: pending,
      icon: Clock,
    },
    {
      title: t('applicants.stats.rejected'),
      value: rejected,
      icon: UserX,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <SimpleStatCard key={stat.title} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}
