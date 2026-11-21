import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Button } from '@/components/ui/button';
import FreelanceTasksPayrollFilters from '../components/payroll/FreelanceTasksPayrollFilters';
import FreelanceTasksPayrollTable from '../components/payroll/FreelanceTasksPayrollTable';
import { salariesApi } from '../api/salariesApi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Pagination } from '@/components/ui/Pagination';

function PayrollMonthHeader({ year, month, onChange }) {
  const { t } = useTranslation();

  const today = dayjs().startOf('month');
  const currentMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month');
  const currentDate = currentMonth.toDate();

  const isCurrentOrFutureMonth = currentMonth.isSame(today) || currentMonth.isAfter(today);

  const monthKeys = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const handleDateChange = (date) => {
    if (!date) return;

    const selectedMonth = dayjs(date).startOf('month');

    if (selectedMonth.isAfter(today)) return;

    onChange({
      year: selectedMonth.year(),
      month: selectedMonth.month() + 1,
    });
  };

  const goPrevMonth = () => {
    const d = currentMonth.subtract(1, 'month');

    onChange({
      year: d.year(),
      month: d.month() + 1,
    });
  };

  const goNextMonth = () => {
    if (isCurrentOrFutureMonth) return;

    const d = currentMonth.add(1, 'month');

    onChange({
      year: d.year(),
      month: d.month() + 1,
    });
  };

  const monthName = t(`months.${monthKeys[month - 1]}`);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-[#E6E8F0]"
        onClick={goPrevMonth}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 rounded-lg border-[#E6E8F0] px-3 py-2 text-sm font-semibold"
          >
            <CalendarDays className="h-4 w-4" />
            <span>{`${monthName}, ${year}`}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={currentDate}
            onSelect={handleDateChange}
            initialFocus
            disabled={(date) => dayjs(date).startOf('month').isAfter(today)}
            toDate={today.toDate()}
          />
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-[#E6E8F0]"
        onClick={goNextMonth}
        disabled={isCurrentOrFutureMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
export default function FreelanceTasksPayrollPage() {
  const { t } = useTranslation();
  const now = dayjs();

  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    search: '',
    payment_date: '',
    department_id: '',
  });

  const queryFilters = useMemo(
    () => ({
      year,
      month,
      page,
      pageSize,
      ...filters,
    }),
    [filters, year, month, page, pageSize]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['freelanceTasksPayrollSheet', queryFilters],
    queryFn: () => salariesApi.getFreelanceTasksSheet(queryFilters),
    enabled: !!year && !!month,
  });

  const rows = data?.data ?? [];
  const pagination = data?.meta?.pagination ?? {};

  const currentPage = pagination.current_page || page;
  const totalPages = pagination.last_page || 1;

  const handleMonthChange = ({ year: nextYear, month: nextMonth }) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setPage(1);
  };

  const handleExport = (type) => {
    console.log('Export freelance tasks payroll:', type);
  };

  return (
    <div className="space-y-6 p-6">
      <PayrollMonthHeader year={year} month={month} onChange={handleMonthChange} />

      <FreelanceTasksPayrollFilters
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onPdf={() => handleExport('pdf')}
        onExcel={() => handleExport('excel')}
        onPrintTable={() => handleExport('print')}
      />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[#6B7280]">
          {t('salaries.freelanceTasksPayroll.showEntries', 'Show Entries')}
        </span>

        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
      </div>

      <FreelanceTasksPayrollTable data={rows} isLoading={isLoading} year={year} month={month} />

      {/* ✅ NEW PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
