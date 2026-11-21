import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

function getInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '—';

  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : parts[0]?.charAt(1) || '';

  return `${first}${last}`.toUpperCase();
}

function formatMoney(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatSalaryMethod(value) {
  if (!value) return '—';

  return String(value)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function EmployeeMiniCard({ name, position }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
        {getInitials(name)}
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">{name || '—'}</div>
        <div className="truncate text-xs text-indigo-600">{position || '—'}</div>
      </div>
    </div>
  );
}

export default function AccountantSheetTable({
  data = [],
  loading = false,
  totalSalaries = 0,
}) {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: t('salaries.accountantSheet.id'),
        cell: ({ row }) => row.original.code || '—',
      },
      {
        accessorKey: 'name',
        header: t('salaries.accountantSheet.name'),
        cell: ({ row }) => (
          <EmployeeMiniCard
            name={row.original.name}
            position={row.original.position_name}
          />
        ),
      },
      {
        accessorKey: 'salary_payment_day',
        header: t('salaries.accountantSheet.paymentDate'),
        cell: ({ row }) => row.original.salary_payment_day || '—',
      },
      {
        accessorKey: 'department_name',
        header: t('salaries.accountantSheet.department'),
        cell: ({ row }) => row.original.department_name || '—',
      },
      {
        accessorKey: 'transaction_number',
        header: t('salaries.accountantSheet.transactionNumber'),
        cell: ({ row }) => row.original.transaction_number || '---',
      },
      {
        accessorKey: 'card_number',
        header: t('salaries.accountantSheet.cardNumber'),
        cell: ({ row }) => row.original.card_number || '---',
      },
      {
        accessorKey: 'salary_method',
        header: t('salaries.accountantSheet.salaryMethod'),
        cell: ({ row }) => formatSalaryMethod(row.original.salary_method),
      },
      {
        accessorKey: 'total_salary',
        header: t('salaries.accountantSheet.totalSalary'),
        cell: ({ row }) => formatMoney(row.original.total_salary),
      },
    ],
    [t]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading && data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 whitespace-nowrap text-xs font-semibold text-slate-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-slate-50/40"
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cellIndex === row.getVisibleCells().length - 1
                            ? 'whitespace-nowrap text-right text-sm font-medium text-slate-900'
                            : 'whitespace-nowrap text-sm text-slate-700'
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                <TableRow className="bg-slate-50/40 hover:bg-slate-50/40">
                  <TableCell
                    colSpan={7}
                    className="py-5 text-sm font-semibold text-slate-800"
                  >
                    {t('salaries.accountantSheet.totalSalaries')}
                  </TableCell>
                  <TableCell className="py-5 text-right text-sm font-semibold text-slate-900">
                    {formatMoney(totalSalaries)}
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-sm text-slate-500"
                >
                  {t('salaries.accountantSheet.noDataFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}