import { Eye } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';

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

export default function FreelanceTasksPayrollTable({
  data = [],
  isLoading = false,
  year,
  month,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('salaries.freelanceTasksPayroll.columns.id', 'ID'),
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#111827]">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: t('salaries.freelanceTasksPayroll.columns.name', 'Name'),
        cell: ({ row }) => {
          const employee = row.original;

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-bold text-[#4F46E5]">
                {getInitials(employee.name)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">
                  {employee.name || '—'}
                </p>
                <p className="truncate text-xs font-medium text-[#4F46E5]">
                  {employee.position || '—'}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'department',
        header: t('salaries.freelanceTasksPayroll.columns.department', 'Department'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-[#111827]">
            {row.original.department || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'tasks_count',
        header: t('salaries.freelanceTasksPayroll.columns.tasksCount', 'Tasks Count'),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-[#111827]">
            {row.original.tasks_count ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'completed_tasks',
        header: t('salaries.freelanceTasksPayroll.columns.completedTasks', 'Completed Tasks'),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-[#111827]">
            {row.original.completed_tasks ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'total_cost',
        header: t('salaries.freelanceTasksPayroll.columns.totalCost', 'Total Cost'),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-[#111827]">
            {formatMoney(row.original.total_cost)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('salaries.freelanceTasksPayroll.columns.action', 'Action'),
        cell: ({ row }) => {
          const employee = row.original;

          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg border border-[#E6E8F0] text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
              onClick={() => {
                navigate(`/freelance-tasks-payroll/${employee.id}?year=${year}&month=${month}`);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [month, navigate, t, year]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E6E8F0] bg-white">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-[#F1F2F6] p-4 last:border-b-0"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title={t('salaries.freelanceTasksPayroll.noDataFound', 'No data found')} />;
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="overflow-hidden rounded-2xl border border-[#E6E8F0] bg-white"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-[#F9FAFB]">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`h-14 px-5 text-xs font-bold text-[#111827] ${
                    isArabic ? 'text-right' : 'text-left'
                  }`}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-[#F1F2F6] hover:bg-[#FAFAFF]">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={`px-5 py-4 ${isArabic ? 'text-right' : 'text-left'}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}