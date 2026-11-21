import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function KpiEmployeeCard({ employee, loading = false, onOpen, onReset }) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        <div className="bg-muted mx-auto size-20 animate-pulse rounded-full" />
        <div className="bg-muted mx-auto mt-4 h-4 w-2/3 animate-pulse rounded" />
        <div className="bg-muted mx-auto mt-2 h-3 w-1/2 animate-pulse rounded" />
        <div className="bg-muted mx-auto mt-6 h-10 w-full animate-pulse rounded-xl" />
      </div>
    );
  }

  const isDone = !!employee?.has_kpi;
  const isDoneUI = isDone;
  const name = employee?.employee_name || employee?.full_name || '—';
  const code = employee?.employee_code || employee?.code || '—';
  const position =
    employee?.position || employee?.employee_position || employee?.position_name || '';

  const avatarUrl = employee?.avatarUrl || employee?.avatar || '';

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-6 text-center shadow-sm transition hover:shadow-md',
        isDoneUI ? 'border-green-400' : 'border-red-500'
      )}
    >  
      {/* Avatar */}
      <div className="relative mx-auto size-20">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="size-20 rounded-full object-cover" />
        ) : (
          <div className="bg-muted flex size-20 items-center justify-center rounded-full text-lg font-semibold">
            {String(name)
              .split(' ')
              .slice(0, 2)
              .map((w) => w?.[0])
              .join('')
              .toUpperCase()}
          </div>
        )}

        {/* green check badge when done */}
        {isDoneUI && (
          <span className="absolute right-0 bottom-0 rounded-full bg-white p-0.5">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </span>
        )}
      </div>

      {/* Name */}
      <div className="mt-4 text-base font-semibold">{name}</div>

      {/* Code + Position */}
      <div className="text-muted-foreground mt-1 text-sm">
        {code}
        {position ? `-${position}` : ''}
      </div>

      {/* Buttons */}
      <div className="mt-6">
        {isDoneUI ? (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onReset?.()}
              className={cn(
                'w-1/2 rounded-xl border border-gray-500 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-600'
              )}
              variant="outline"
            >
              {t('overtime.kpiPage.buttons.reset')}
            </Button>
            <Button
              onClick={onOpen}
              className={cn(
                'w-1/2 rounded-xl border border-green-400 bg-white text-green-600 hover:bg-green-50 hover:text-green-700'
              )}
              variant="outline"
            >
              {t('overtime.kpiPage.buttons.preview')}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onOpen}
            className={cn(
              'w-full rounded-xl border border-red-300 bg-white text-red-500 hover:bg-red-50 hover:text-red-600'
            )}
            variant="outline"
          >
            {t('overtime.kpiPage.buttons.enterKpi')}
          </Button>
        )}
      </div>
    </div>
  );
}
