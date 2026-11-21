// src/features/dashboard/components/EmployeeStatCard.jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Function to get current month name
const getCurrentMonth = () => {
  return new Date().toLocaleString('default', { month: 'long' });
};

export default function EmployeeStatCard({ icon: Icon, title, items = [], className, showMonth = false }) {
  return (
    <Card
      className={cn(
        'w-full  rounded-2xl border border-slate-200 bg-white p-2 shadow-sm',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="inline-flex items-center justify-center">
              <Icon className="text-secondary h-5 w-5" />
            </span>
          )}
          <CardTitle className="text-sm font-semibold text-slate-900">
            {title}
            {showMonth && (
              <span className="ml-1 font-normal text-slate-500">({getCurrentMonth()})</span>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-1">
        <div className="grid grid-cols-3 text-center text-xs">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={cn('flex flex-col items-center gap-1', idx > 0 && 'border-gray border-l')}
            >
              {item.label && (
                <span className="text-gray text-[11px] font-medium">{item.label}</span>
              )}
              <span className={cn('text-sm font-semibold', item.color ?? 'text-slate-900')}>
                {item.value}{' '}
                {item.suffix && (
                  <span 
                    className={cn(
                      'text-[11px] font-normal',
                      item.suffix.toLowerCase().includes('days') 
                        ? 'text-gray-500 border border-gray-300 rounded px-1 py-0.5'
                        : ''
                    )}
                  >
                    {item.suffix}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
