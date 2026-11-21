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
import DeleteBranchTransferModal from './DeleteBranchTransferModal';
import { useTranslation } from 'react-i18next';

import {
  getRequestStatusColorClass,
  translateRequestStatus,
} from '@/utils/requestLabels';

export default function BranchTransfersTable({
  data = [],
  loading,
  onEdit,
}) {
  const { t, i18n } = useTranslation();
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('branchTransfers.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'employeeName',
        header: t('branchTransfers.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const department = departments.find(
            (d) => String(d.id) === String(emp?.department_id)
          );

          const deptName = department
            ? i18n.language === 'ar'
              ? department.name_ar || department.name_en
              : department.name_en
            : '—';

          return (
            <div className="flex items-center gap-3">
              <img
                src={
                  row.original.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${emp?.full_name || 'Employee'}`
                }
                alt={emp?.full_name || 'Employee'}
                className="size-9 rounded-full object-cover"
              />

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {emp?.full_name || 'Unknown Employee'}
                </span>

                <span className="text-primary text-xs font-medium">
                  {deptName}
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: 'date',
        header: t('branchTransfers.headers.date'),
        cell: ({ row }) => <span>{row.original.date || '—'}</span>,
      },

      {
        accessorKey: 'current_branch',
        header: t('branchTransfers.headers.currentBranch'),
        cell: ({ row }) => (
          <span>{row.original.current_branch?.name || '—'}</span>
        ),
      },

      {
        accessorKey: 'requested_branch',
        header: t('branchTransfers.headers.requestedBranch'),
        cell: ({ row }) => (
          <span>{row.original.requested_branch?.name || '—'}</span>
        ),
      },

      {
        accessorKey: 'status',
        header: t('branchTransfers.headers.status'),
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          const colorClass = getRequestStatusColorClass(status);

          return (
            <span
              className={`inline-flex min-w-24 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm ${colorClass}`}
            >
              {translateRequestStatus(t, status)}
            </span>
          );
        },
      },

      {
        id: 'actions',
        header: t('branchTransfers.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setTransferToDelete(row.original);
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
              <TableRow key={idx} className="border-b last:border-0">
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>

                {Array.from({ length: 4 }).map((_, idx) => (
                  <TableCell key={idx}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}

                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b last:border-0 hover:bg-gray-50/60"
              >
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
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {t('branchTransfers.noBranchTransfersFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteBranchTransferModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        transfer={transferToDelete}
      />
    </div>
  );
}