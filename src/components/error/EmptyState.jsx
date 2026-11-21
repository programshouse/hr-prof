import { CalendarX2 } from 'lucide-react';

export function EmptyState({
  icon = <CalendarX2 className="mb-3 text-slate-300" size={48} />,
  title,
  description,
  className = '',
  t,
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 text-slate-500 ${className}`}>
      {icon}

      <div className="mb-1 text-lg font-semibold">
        {title || (t ? t('emptyStates.noData') : 'No records')}
      </div>

      <div className="whitespace-pre-line text-sm text-slate-400">
      
      </div>
    </div>
  );
}