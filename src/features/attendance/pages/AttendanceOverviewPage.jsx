import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateNavigation } from '../components/DateNavigation';
import { SummaryCards } from '../components/SummaryCards';
import { AttendanceTable } from '../components/AttendanceTable';
import { Pagination } from '@/components/ui/Pagination';
import { useMonthlyReportQuery } from '../hooks/useMonthlyReportQuery';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const getAttendanceColumns = (t) => [
  {
    accessorKey: 'employee_name',
    header: t('tables.headers.name'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'employee_code',
    header: t('tables.headers.id'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'employee_position',
    header: t('tables.headers.position'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'present_days',
    header: t('attendance.overviewTable.attendanceDays'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'absent_days',
    header: t('attendance.overviewTable.absenceDays'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'days_with_incomplete_shifts',
    header: t('attendance.overviewTable.incompleteShifts'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'total_incomplete_shifts',
    header: t('attendance.dialogs.duration'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'days_with_overtime',
    header: t('attendance.overviewTable.overtimeWorked'),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'total_overtime_minutes',
    header: t('attendance.dialogs.overtime'),
    cell: (info) => info.getValue(),
  },
];

export default function AttendanceOverviewPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [page, setPage] = useState(1);

  const { data: monthlyData, isLoading } = useMonthlyReportQuery(date, page);

  const table = useReactTable({
    data: monthlyData?.data || [],
    columns: getAttendanceColumns(t),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: monthlyData?.meta?.last_page || 1,
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <DateNavigation date={date} onDateChange={setDate} />
      <SummaryCards />
      
      <div className="space-y-4">
        <AttendanceTable table={table} columns={getAttendanceColumns(t)} isLoading={isLoading} />
        
        {monthlyData?.meta && (
          <Pagination
            currentPage={monthlyData.meta.current_page}
            totalPages={monthlyData.meta.last_page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
