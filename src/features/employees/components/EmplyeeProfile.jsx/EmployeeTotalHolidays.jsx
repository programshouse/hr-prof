// EmployeeTotalHolidays.jsx
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatCountWithUnit } from '@/utils/durationLabels';
import { translateHolidayType } from '@/utils/requestLabels';
import { employeesApi } from '@/features/employees/api/employees.api';

function HolidayTypeBadge({ type }) {
  const { t } = useTranslation();

  const getStyles = (type) => {
    const normalized = String(type ?? '').toLowerCase();

    if (normalized.includes('official')) {
      return 'bg-blue-100 text-blue-700';
    }
    if (normalized.includes('sick')) {
      return 'bg-rose-100 text-rose-700';
    }
    if (normalized.includes('annual')) {
      return 'bg-orange-100 text-orange-700';
    }
    if (normalized.includes('casual')) {
      return 'bg-green-100 text-green-700';
    }
    if (normalized.includes('weekend')) {
      return 'bg-slate-100 text-slate-700';
    }

    return 'bg-slate-100 text-slate-700';
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ${getStyles(type)}`}>
      {translateHolidayType(t, type)}
    </span>
  );
}

export default function EmployeeTotalHolidays({ employeeId, isLoading = false }) {
  const { t } = useTranslation();
  const { data: totalHolidaysData, isLoading: isTotalHolidaysLoading } = useQuery({
    queryKey: ['employee-total-holidays', employeeId],
    queryFn: () => employeesApi.getEmployeeTotalHolidays(employeeId),
    enabled: !!employeeId,
    retry: false,
  });

  const isComponentLoading = isLoading || isTotalHolidaysLoading;

  const holidays = useMemo(() => {
    return totalHolidaysData?.data || [];
  }, [totalHolidaysData]);

  const calculateDuration = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isComponentLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">{t('employees.profile.details.holidays.total.title')}</p>
          </div>

          <div className="border-t border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-slate-200">
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">{t('employees.profile.details.holidays.total.table.date')}</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">{t('employees.profile.details.holidays.total.table.from')}</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">{t('employees.profile.details.holidays.total.table.to')}</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">{t('employees.profile.details.holidays.total.table.duration')}</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">{t('employees.profile.details.holidays.total.table.type')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id} className="border-slate-100">
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {format(new Date(holiday.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {format(new Date(holiday.from), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {format(new Date(holiday.to), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {formatCountWithUnit(
                        t,
                        calculateDuration(holiday.from, holiday.to),
                        'day'
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <HolidayTypeBadge type={holiday.type} />
                    </TableCell>
                  </TableRow>
                ))}

                {holidays.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      {t('employees.profile.details.holidays.total.noRecords')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
