// src/features/penalties/components/PenaltiesTable.jsx

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
import DeletePenaltyModal from './DeletePenaltyModal';

export default function PenaltiesTable({
  data = [],
  loading,
  onEdit,
}) {
  const { t, i18n } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [penaltyToDelete, setPenaltyToDelete] = useState(null);

  const { data: departments = [] } = useAllDepartments();

  const penaltyTypeMap = {
    disciplinary_action: t('penalties.modal.disciplinaryAction'),
    attendance_violation: t('penalties.modal.attendanceViolation'),
    policy_violation: t('penalties.modal.policyViolation'),
    relations_violation: t('penalties.modal.relationsViolation'),
    conduct_violation: t('penalties.modal.conductViolation'),
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: t('penalties.table.headers.id'),
      cell: ({ row }) => (
        <span className="font-medium">
          #{row.original.employee?.code || '—'}
        </span>
      ),
    },

    {
      accessorKey: 'employee',
      header: t('penalties.table.headers.employee'),
      cell: ({ row }) => {
        const emp = row.original.employee;

        const fullName = emp?.full_name || '—';

        const department = departments.find(
          (d) => String(d.id) === String(emp?.department_id)
        );

        const deptName =
          i18n.language === 'ar'
            ? department?.name_ar || department?.name_en || '—'
            : department?.name_en || '—';

        const initials = fullName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase())
          .join('');

        const employeeImage = emp?.image;

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
            ) : (
              <div className="size-9 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                {initials || 'NA'}
              </div>
            )}

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
      accessorKey: 'amount',
      header: t('penalties.table.headers.amount'),
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
      header: t('penalties.table.headers.type'),
      cell: ({ row }) => {
        const rawType = row.original.type || '';
        const translatedType =
          penaltyTypeMap[rawType] || rawType || t('common.na');

        return (
          <span className="inline-flex min-w-24 justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {translatedType}
          </span>
        );
      },
    },

    {
      accessorKey: 'date',
      header: t('penalties.table.headers.date'),
      cell: ({ row }) => <span>{row.original.date || '—'}</span>,
    },

    {
      id: 'actions',
      header: t('penalties.table.headers.action'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-tertiary text-primary flex size-8 items-center justify-center rounded-full border"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </button>

          <button
            className="bg-light-error text-pink flex size-8 items-center justify-center rounded-full border"
            onClick={() => {
              setPenaltyToDelete(row.original);
              setDeleteModalOpen(true);
            }}
          >
            <Trash className="size-4" />
          </button>
        </div>
      ),
    },
  ], [onEdit, departments, t, i18n.language]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-gray-50">
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
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
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
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
              <TableCell colSpan={5} className="text-center">
                {t('penalties.table.noData')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeletePenaltyModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        penalty={penaltyToDelete}
      />
    </div>
  );
}