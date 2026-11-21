import { Skeleton } from '@/components/ui/skeleton';

export const StatCard = ({ title, value, icon: Icon, isLoading }) => (
  <div className="items-center gap-4 space-y-2 rounded-md bg-white p-2 shadow-sm sm:rounded-xl sm:p-4">
    <div className="text-primary text-lg font-medium">{title}</div>
    {isLoading ? (
      <Skeleton className="h-8 w-24" />
    ) : (
      <div className="flex items-center gap-2.5">
        <Icon className="text-primary size-4 sm:size-6" />
        <span className="text-sm font-semibold text-gray-600 sm:text-2xl sm:font-bold">
          {value}
        </span>
      </div>
    )}
  </div>
);

export default function StatsSummary({ stats, isLoading, columns = 4 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns] || gridCols[4]}`}>
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} isLoading={isLoading} />
      ))}
    </div>
  );
}
