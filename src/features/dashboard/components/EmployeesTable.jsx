import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { Skeleton } from '@/components/ui/skeleton';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';

export default function EmployeesTable() {
  const { t } = useTranslation();
  const { employees, isLoading, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    // Fetch first 5 employees for the dashboard
    fetchEmployees({ limit: 5 });
  }, [fetchEmployees]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('dashboard.table.name'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={
                row.original.avatarUrl ||
                buildAvatarUrl(row.original.full_name, row.original.image) ||
                'https://i.pravatar.cc/150?img=12'
              }
              alt={row.original.full_name}
              className="size-8 shrink-0 rounded-full object-cover md:size-10"
            />
            <div>
              <div className="text-sm font-medium text-slate-900 md:text-base">
                {row.original.full_name}
              </div>
              <div className="text-primary text-xs md:text-sm">{row.original.code}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: t('dashboard.table.department'),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-900 md:text-sm">
            {row.original.department || t('common.na')}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: t('dashboard.table.position'),
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-primary md:rounded-lg md:px-3 md:py-1.5 md:text-sm`}
          >
            {row.original.position || t('common.na')}
          </span>
        ),
      },
      {
        accessorKey: 'joiningDate',
        header: t('dashboard.table.joinDate'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs text-slate-600 md:text-sm">
            <Calendar className="text-default size-3 md:size-4" />
            <span>{row.original.join_date || t('common.na')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'shift',
        header: t('dashboard.table.shift'),
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium md:px-3 md:py-1.5 md:text-sm`}
          >
            <span className="size-1 rounded-full bg-current md:size-1.5"></span>
            {row.original.shift || t('common.na')}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: employees || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="col-span-2">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{t('dashboard.table.title')}</CardTitle>

        <Button variant="outline" asChild>
          <Link to="/employees">{t('common.seeDetails', 'See details')}</Link>
        </Button>
      </CardHeader>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-3 py-2 md:px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx} className="px-4 py-2">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
