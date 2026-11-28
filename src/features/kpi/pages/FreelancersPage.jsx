import ProfSyncButton from '../components/ProfSyncButton';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { MonthNavigation } from '../../fingerprintIssues/components/MonthNavigation';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/error/EmptyState';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useFreelancersQuery } from '../hooks/useFreelancersQuery';
import { useAddFreelancerWorkedHours } from '../hooks/useAddFreelancerWorkedHours';

export default function FreelancersPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const addWorkedHoursMutation = useAddFreelancerWorkedHours();

  const getCurrentMonthYear = () => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    if (monthParam && yearParam) {
      const m = Number(monthParam);
      const y = Number(yearParam);

      return {
        month: m,
        year: y,
        date: new Date(y, m - 1, 1),
      };
    }

    const d = new Date();

    return {
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      date: d,
    };
  };

  const { month, year, date } = getCurrentMonthYear();

  const [page, setPage] = useState(
    () => Number(searchParams.get('page')) || 1
  );

  const [pageSize, setPageSize] = useState(
    () => Number(searchParams.get('limit')) || 10
  );

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('keyword') || ''
  );

  const [workedHoursMap, setWorkedHoursMap] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  const queryParams = useMemo(
    () => ({
      year,
      month,
      page,
      limit: pageSize,
      ...(searchTerm ? { keyword: searchTerm } : {}),
    }),
    [year, month, page, pageSize, searchTerm]
  );

  const { data, isLoading, isFetching } = useFreelancersQuery(
    queryParams,
    true
  );

  const rows = useMemo(() => data?.data || [], [data?.data]);

  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: pageSize,
  };

  const totalPages = meta?.limit
    ? Math.ceil((meta?.total || 0) / meta.limit)
    : 1;

  const isBusy = isLoading || isFetching;

  const hasNoData = !isBusy && rows.length === 0;

  const decimalToTime = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numeric = Number(value);

    if (Number.isNaN(numeric)) {
      return '';
    }

    const hours = Math.floor(numeric);
    const minutes = Math.round((numeric - hours) * 60);

    return `${hours}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  const convertTimeToDecimal = (time) => {
    if (!time) {
      return 0;
    }

    const [hours, minutes = '0'] = time.split(':');

    return (
      Number(hours || 0) +
      Number(minutes || 0) / 60
    );
  };

  const workedHoursMapValue = useMemo(() => {
    const next = {};

    rows.forEach((employee) => {
      const value =
        employee.worked_hours ??
        employee.monthly_worked_hours ??
        employee.saved_worked_hours ??
        '';

      next[employee.id] =
        value !== '' ? decimalToTime(value) : '';
    });

    return next;
  }, [rows]);

  useEffect(() => {
    setWorkedHoursMap(workedHoursMapValue);
  }, [workedHoursMapValue]);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set('month', String(month));
    params.set('year', String(year));

    if (page > 1) {
      params.set('page', String(page));
    }

    if (pageSize !== 10) {
      params.set('limit', String(pageSize));
    }

    if (searchTerm) {
      params.set('keyword', searchTerm);
    }

    setSearchParams(params);
  }, [
    month,
    year,
    page,
    pageSize,
    searchTerm,
    setSearchParams,
  ]);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);

    params.set(
      'month',
      String(newDate.getMonth() + 1)
    );

    params.set(
      'year',
      String(newDate.getFullYear())
    );

    params.delete('page');

    setSearchParams(params);
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value) || 10);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
  };

  const handleWorkedHoursChange = (
    employeeId,
    value
  ) => {
    let formatted = value.replace(/[^\d:]/g, '');

    // allow only one :
    const colonCount = (
      formatted.match(/:/g) || []
    ).length;

    if (colonCount > 1) {
      return;
    }

    // auto add :
    if (
      formatted.length === 2 &&
      !formatted.includes(':')
    ) {
      formatted = `${formatted}:`;
    }

    const [hours, minutes] =
      formatted.split(':');

    // prevent more than 2 minute digits
    if (minutes && minutes.length > 2) {
      return;
    }

    // prevent minutes > 59
    if (
      minutes &&
      Number(minutes) > 59
    ) {
      return;
    }

    setWorkedHoursMap((prev) => ({
      ...prev,
      [employeeId]: formatted,
    }));
  };

  const handleSave = async () => {
    const payloads = rows
      .map((employee) => ({
        employee_id: employee.id,
        year,
        month,
        worked_hours:
          convertTimeToDecimal(
            workedHoursMap[employee.id]
          ),
      }))
      .filter(
        (item) =>
          item.employee_id &&
          item.worked_hours >= 0
      );

    try {
      for (const payload of payloads) {
        await addWorkedHoursMutation.mutateAsync(
          payload
        );
      }

      toast.success(
        t('freelancers.hoursUpdated', {
          count: payloads.length,
        })
      );
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <MonthNavigation
          date={date}
          onDateChange={handleDateChange}
        />

        <ProfSyncButton
          type="hours"
          year={year}
          month={month}
          disabled={addWorkedHoursMutation.isPending}
          onBusyChange={setIsSyncing}
        />
      </div>

      <div className="w-full max-w-xs">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t('freelancers.search')}
            className="h-11 rounded-xl border-slate-200 pl-10 pr-10 text-sm shadow-none"
          />

          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">
          {t('freelancers.showEntries')}
        </span>

        <PageSizeSelect
          value={pageSize}
          onChange={handlePageSizeChange}
          options={[10, 25, 50, 100]}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {isBusy ? (
          <div className="space-y-4">
            {Array.from({
              length: pageSize,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[70px] animate-pulse rounded-xl border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        ) : hasNoData ? (
          <EmptyState
            title="لا يوجد موظفون"
            description="جرب تغيير معايير البحث."
          />
        ) : (
          <div className="space-y-4">
            {rows.map((employee) => {
              const requiredHours =
                employee.monthly_hours_required ??
                employee.target_hours ??
                employee.required_hours ??
                0;

              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-100">
                      {employee.image ? (
                        <img
                          src={employee.image}
                          alt={
                            employee.full_name ||
                            employee.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                          {(
                            employee.full_name ||
                            employee.name ||
                            'E'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {employee.code ||
                          employee.id}
                        -
                        {employee.full_name ||
                          employee.name}
                      </p>

                      <p className="truncate text-xs font-medium text-primary">
                        {employee.position_name ||
                          '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0:00"
                      value={
                        workedHoursMap[
                          employee.id
                        ] ?? ''
                      }
                      onChange={(e) =>
                        handleWorkedHoursChange(
                          employee.id,
                          e.target.value
                        )
                      }
                      className="h-10 w-24 rounded-lg border-slate-200 text-center text-sm shadow-none"
                    />

                    <span className="w-14 text-right text-sm font-semibold text-primary">
                      {decimalToTime(
                        requiredHours
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!hasNoData &&
        totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {t(
                'freelancers.showing'
              )}{' '}
              {(page - 1) * pageSize +
                1}{' '}
              to{' '}
              {Math.min(
                page * pageSize,
                meta.total
              )}{' '}
              of {meta.total} entries
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

      {!hasNoData && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={
              addWorkedHoursMutation.isPending ||
              isSyncing ||
              isBusy
            }
            className="h-12 w-full max-w-xs rounded-lg"
          >
            {addWorkedHoursMutation.isPending
              ? t(
                  'freelancers.saving'
                )
              : t(
                  'freelancers.save'
                )}
          </Button>
        </div>
      )}
    </div>
  );
}