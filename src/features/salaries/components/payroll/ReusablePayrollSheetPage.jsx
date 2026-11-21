import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';

import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { toast } from 'sonner';

import { salariesApi } from '../../api/salariesApi';
import FreelancePayrollFilters from '../../components/payroll/FreelancePayrollFilters';
import FreelancePayrollTable from '../../components/payroll/FreelancePayrollTable';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatMoney = (value) => `EGP ${toNumber(value).toLocaleString('en-US')}`;

const formatHours = (value) => {
  const num = toNumber(value);
  return `${Number.isInteger(num) ? num : num.toFixed(2)} Hours`;
};

const getMonthData = (searchParams) => {
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');

  if (monthParam && yearParam) {
    const month = Number(monthParam);
    const year = Number(yearParam);

    return {
      month,
      year,
      date: new Date(year, month - 1, 1),
    };
  }

  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    date: now,
  };
};

export default function FreelancePayrollSheetPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();
  const { month, year, date } = getMonthData(searchParams);

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    payment_date: searchParams.get('payment_date') || '',
    department_id: searchParams.get('department_id') || '',
  }));

  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('pageSize')) || 10);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['accountPayrollFreelanceSheet', year, month, page, pageSize, filters],
    queryFn: () =>
      salariesApi.getAccountPayrollFreelanceSheet({
        year,
        month,
        page,
        pageSize,
        ...filters,
      }),
    enabled: !!year && !!month,
  });

  const rows = data?.data ?? [];
  const pagination = data?.meta?.pagination ?? {};
  const totalPages = pagination.last_page || 1;

  const hasNoData = !isLoading && rows.length === 0;

  const updateUrlParams = (newDate) => {
    const params = new URLSearchParams();

    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('pageSize', String(pageSize));

    if (filters.search) params.set('search', filters.search);
    if (filters.payment_date && filters.payment_date !== 'all') {
      params.set('payment_date', filters.payment_date);
    }
    if (filters.department_id && filters.department_id !== 'all') {
      params.set('department_id', filters.department_id);
    }

    setSearchParams(params, { replace: true });
  };

  const handleDateChange = (newDate) => {
    if (!newDate) return;

    setPage(1);

    const params = new URLSearchParams(searchParams);
    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('page');

    setSearchParams(params);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    handleDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    handleDateChange(newDate);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const formatMonthDisplay = (value) => {
    const locale = isRTL ? 'ar-EG' : 'en-US';

    return value.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 10;
    setPageSize(num);
    setPage(1);
  };

  const exportColumns = useMemo(
    () => [
      { key: 'code', label: t('salaries.freelancePayroll.columns.id', 'ID') },
      { key: 'name', label: t('salaries.freelancePayroll.columns.name', 'Name') },
      { key: 'department', label: t('salaries.freelancePayroll.columns.department', 'Department') },
      {
        key: 'required_hours',
        label: t('salaries.freelancePayroll.columns.requiredHours', 'Required Hours'),
      },
      {
        key: 'worked_hours',
        label: t('salaries.freelancePayroll.columns.workedHours', 'Worked Hours'),
      },
      { key: 'hour_cost', label: t('salaries.freelancePayroll.columns.hourCost', 'Hour Cost') },
      { key: 'difference', label: t('salaries.freelancePayroll.columns.difference', 'Difference') },
      {
        key: 'overtime_hours',
        label: t('salaries.freelancePayroll.columns.overtimeHours', 'Overtime Hours'),
      },
      { key: 'kpi', label: t('salaries.freelancePayroll.columns.kpi', 'Kpi') },
      {
        key: 'total_amount',
        label: t('salaries.freelancePayroll.columns.totalAmount', 'Total Amount'),
      },
    ],
    [t]
  );

  const getExportRows = () => {
    return rows.map((row) => {
      const requiredHours = toNumber(row.required_monthly_hours);
      const workedHours = toNumber(row.worked_hours);
      const hourlyRate = toNumber(row.hourly_rate);
      const differenceHours = workedHours - requiredHours;
      const differenceAmount = Math.abs(differenceHours * hourlyRate);

      return {
        code: row.code || row.id || '--',
        name: row.name || '--',
        department: row.department || '--',
        required_hours: formatHours(requiredHours),
        worked_hours: formatHours(workedHours),
        hour_cost: formatMoney(hourlyRate),
        difference: differenceHours === 0 ? '--' : formatMoney(differenceAmount),
        overtime_hours: row.approved_overtime_minutes || 0,
        kpi: formatMoney(row.kpi_amount),
        total_amount: formatMoney(row.net_salary),
      };
    });
  };

  const handleExport = (type) => {
    if (!rows.length) {
      toast.error(t('common.noData', 'No data found'));
      return;
    }

    const exportRows = getExportRows();
    const fileName = `freelance-payroll-sheet-${year}-${String(month).padStart(2, '0')}`;
    const title = t('salaries.freelancePayroll.exportTitle', 'Freelance Payroll Sheet');

    if (type === 'pdf') {
      exportToPdf({
        rows: exportRows,
        columns: exportColumns,
        fileName,
        title,
      });
    }

    if (type === 'excel') {
      exportToExcel({
        rows: exportRows,
        columns: exportColumns,
        fileName,
      });
    }

    if (type === 'print') {
      printTable({
        rows: exportRows,
        columns: exportColumns,
        title,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="size-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="size-4" />
                <span>{formatMonthDisplay(date)}</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                toDate={new Date()}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={isCurrentMonth()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="w-full">
        <FreelancePayrollFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPdf={() => handleExport('pdf')}
          onExcel={() => handleExport('excel')}
          onPrintTable={() => handleExport('print')}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect
          value={pageSize}
          onChange={handlePageSizeChange}
          options={[10, 20, 50, 100, 200]}
        />
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('salaries.freelancePayroll.empty.title', 'No freelance salaries found')}
          description={t(
            'salaries.freelancePayroll.empty.description',
            'There are no freelance payroll records for this month.'
          )}
        />
      ) : (
        <FreelancePayrollTable data={rows} loading={isLoading} />
      )}

      {!hasNoData && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
