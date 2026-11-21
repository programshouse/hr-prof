import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
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
import DeleteResignationModal from './DeleteResignationModal';
import { useTranslation } from 'react-i18next';
import {
  getRequestStatusColorClass,
  translateRequestStatus,
} from '@/utils/requestLabels';

export default function ResignationsTable({ data = [], loading, onEdit }) {
  const { t, i18n } = useTranslation();
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resignationToDelete, setResignationToDelete] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('resignations.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'employeeName',
        header: t('resignations.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const department = departments.find(
            (d) => String(d.id) === String(emp?.department_id)
          );

          const deptName = department
            ? (i18n.language === 'ar'
                ? department.name_ar || department.name_en
                : department.name_en)
            : '—';

          const fullName = emp?.full_name || '—';

          return (
            <div className="flex items-center gap-3">
              <img
                src={
                  row.original.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${fullName}`
                }
                alt={fullName}
                className="size-9 rounded-full object-cover"
              />

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {fullName}
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
        header: t('resignations.headers.date'),
        cell: ({ row }) => <span>{row.original.date || '—'}</span>,
      },

      {
        accessorKey: 'reason',
        header: t('resignations.headers.reason'),
        cell: ({ row }) => (
          <span className="block max-w-[200px] truncate" title={row.original.reason}>
            {row.original.reason || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'status',
        header: t('resignations.headers.status'),
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
        header: t('resignations.headers.action'),
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
                setResignationToDelete(row.original);
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
                    : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <TableCell key={idx}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('resignations.noResignationsFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteResignationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        resignation={resignationToDelete}
      />
    </div>
  );
}