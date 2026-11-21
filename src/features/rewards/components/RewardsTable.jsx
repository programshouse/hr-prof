import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

import { Skeleton } from '@/components/ui/skeleton';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useTranslation } from 'react-i18next';
import DeleteRewardModal from './DeleteRewardModal';

export default function RewardsTable({
  data = [],
  loading,
  onEdit,
}) {
  const { t, i18n } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);

  const { data: departments = [] } = useAllDepartments();

  const rewardTypeMap = {
    additional_effort: t('rewards.modal.additionalEffort'),
    ideal_employee: t('rewards.modal.idealEmployee'),
    high_performance: t('rewards.modal.highPerformance'),
  };

  const getDepartmentName = (emp) => {
    const department = departments.find(
      (d) => String(d.id) === String(emp?.department_id)
    );

    if (!department) return '—';

    return i18n.language === 'ar'
      ? department.name_ar
      : department.name_en;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('rewards.table.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'employeeName',
        header: t('rewards.table.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const fullName =
            emp?.full_name ||
            [emp?.first_name, emp?.middle_name, emp?.last_name]
              .filter(Boolean)
              .join(' ')
              .trim() ||
            '—';

          const deptName = getDepartmentName(emp);

          const employeeImage = emp?.image;

          const initials = fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join('');

          return (
            <div className="flex items-center gap-3">
              {employeeImage ? (
                <img
                  src={employeeImage}
                  alt={fullName}
                  className="size-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}

              {!employeeImage && (
                <div className="size-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                  {initials || '—'}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="font-medium text-gray-900 truncate">
                  {fullName}
                </span>

                <span className="text-primary text-xs font-medium truncate">
                  {deptName}
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: 'amount',
        header: t('rewards.table.headers.amount'),
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900">
            {row.original.amount
              ? `${row.original.amount} EGP`
              : '—'}
          </span>
        ),
      },

      {
        accessorKey: 'type',
        header: t('rewards.table.headers.type'),
        cell: ({ row }) => {
          const rawType = row.original.type || '';
          const translatedType = rewardTypeMap[rawType] || rawType || t('common.na');

          return (
            <span className="inline-flex min-w-24 justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 md:rounded-lg md:px-3 md:py-1.5 md:text-sm">
              {translatedType}
            </span>
          );
        },
      },

      {
        accessorKey: 'date',
        header: t('rewards.table.headers.date'),
        cell: ({ row }) => <span>{row.original.date || '—'}</span>,
      },

      {
        id: 'actions',
        header: t('rewards.table.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="bg-tertiary text-primary flex size-8 items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              className="bg-light-error text-pink flex size-8 items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setRewardToDelete(row.original);
                setDeleteModalOpen(true);
              }}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, departments, t, i18n.language]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                </TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50/60">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('rewards.table.noData')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteRewardModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        reward={rewardToDelete}
      />
    </div>
  );
}