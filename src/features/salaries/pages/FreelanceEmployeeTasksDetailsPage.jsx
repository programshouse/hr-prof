import { ArrowLeft, CalendarDays, ClipboardList } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { salariesApi } from '../api/salariesApi';

function formatMoney(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(number);
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return String(name).slice(0, 2).toUpperCase() || 'FR';
}

export default function FreelanceEmployeeTasksDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const employeeId = params.employeeId;
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  const { data, isLoading } = useQuery({
    queryKey: ['freelanceEmployeeMonthlyTasks', employeeId, year, month],
    queryFn: () =>
      salariesApi.getFreelanceEmployeeMonthlyTasks({
        employeeId,
        year,
        month,
      }),
    enabled: !!employeeId && !!year && !!month,
  });

  const employee = useMemo(() => data?.data?.[0] ?? null, [data]);
  const tasks = employee?.tasks ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <EmptyState title={t('salaries.freelanceTasksPayroll.noDataFound', 'No data found')} />
      </div>
    );
  }

  return (
    <div className="space-y-7 p-6">
      <div className="rounded-2xl border border-[#E6E8F0] bg-white p-5">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-bold text-[#4F46E5]">
            {getInitials(employee.name)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#4F46E5]">
              {employee.code ? `${employee.code} - ` : ''}
              {employee.name}
            </h2>

            <p className="text-sm font-medium text-[#6B7280]">{employee.position || '—'}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#111827]">
          {t('salaries.freelanceTasksPayroll.taskOverviewTitle', 'Tasks Overview')}
        </h3>

        <p className="mt-1 text-sm text-[#6B7280]">
          {t(
            'salaries.freelanceTasksPayroll.taskOverviewDescription',
            'All tasks within month and year'
          )}
        </p>
      </div>

      {!tasks.length ? (
        <EmptyState title={t('salaries.freelanceTasksPayroll.noTasksFound', 'No tasks found')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border border-[#E6E8F0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]">
                  <ClipboardList className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h4 className="line-clamp-2 text-sm font-bold text-[#111827]">
                    {task.task_name || '—'}
                  </h4>

                  <div className="mt-1 flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {task.month}/{task.year}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[#F1F2F6] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111827]">
                    {t('salaries.freelanceTasksPayroll.cost', 'Cost')}
                  </span>

                  <span className="text-sm font-bold text-[#4F46E5]">{formatMoney(task.cost)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[#E6E8F0] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#6B7280]">
              {t('salaries.freelanceTasksPayroll.totalTasks', 'Total Tasks')}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#111827]">
              {employee.tasks_count ?? tasks.length}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#6B7280]">
              {t('salaries.freelanceTasksPayroll.totalCost', 'Total Cost')}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#4F46E5]">
              {formatMoney(employee.total_cost)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
