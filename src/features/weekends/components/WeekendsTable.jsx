import { useMemo, useState } from 'react';
import { Pencil, Trash, UserMinus } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';
import DeleteWeekendModal from './DeleteWeekendModal';
import ManageWeekendEmployeesModal from './ManageWeekendEmployeesModal';

const formatDateOnly = (value) => {
  if (!value) return '—';

  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return raw;

  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
};

const getEmployeeId = (employee) => {
  if (!employee || typeof employee !== 'object') return null;

  return (
    employee?.employee_id ??
    employee?.id ??
    employee?.user_id ??
    employee?.pivot?.employee_id ??
    employee?.employee?.employee_id ??
    employee?.employee?.id ??
    employee?.employee?.user_id ??
    null
  );
};

const getDisplayEmployee = (employee) => employee?.employee ?? employee ?? null;

const resolveWeekendEmployeeName = (entry, preferArabic) => {
  if (!entry || typeof entry !== 'object') return '';

  if (preferArabic) {
    return (
      String(entry?.name_ar || '').trim() ||
      String(entry?.name || '').trim() ||
      String(entry?.name_en || '').trim()
    );
  }

  return (
    String(entry?.name_en || '').trim() ||
    String(entry?.name || '').trim() ||
    String(entry?.name_ar || '').trim()
  );
};

export default function WeekendsTable({ data = [], loading, onEdit }) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');
  const { data: employees = [] } = useAllEmployees(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [weekendToDelete, setWeekendToDelete] = useState(null);

  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [weekendToManage, setWeekendToManage] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('weekends.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'date_from',
        header: t('weekends.headers.from'),
        cell: ({ row }) => <span>{formatDateOnly(row.original.date_from)}</span>,
      },
      {
        accessorKey: 'date_to',
        header: t('weekends.headers.to'),
        cell: ({ row }) => <span>{formatDateOnly(row.original.date_to)}</span>,
      },
      {
        accessorKey: 'employees_count',
        header: t('weekends.headers.employees'),
        cell: ({ row }) => {
          const ids = Array.isArray(row.original.employee_ids)
            ? row.original.employee_ids.map(String).filter(Boolean)
            : [];
          const employeeNameEntries = Array.isArray(row.original.employee_name)
            ? row.original.employee_name
                .map((entry) => {
                  if (!entry || typeof entry !== 'object') return null;

                  const id = entry?.id != null ? String(entry.id) : null;
                  const name = resolveWeekendEmployeeName(entry, preferArabic);
                  const name_ar = typeof entry?.name_ar === 'string' ? entry.name_ar.trim() : '';
                  const name_en = typeof entry?.name_en === 'string' ? entry.name_en.trim() : '';

                  if (!id && !name) return null;

                  return { id, name, name_ar, name_en };
                })
                .filter(Boolean)
            : [];

          const weekendEmployees = Array.isArray(row.original.employees)
            ? row.original.employees.map(getDisplayEmployee).filter(Boolean)
            : [];

          const lookup = new Map(
            employees
              .map((employee) => [getEmployeeId(employee), employee])
              .filter(([id]) => id != null)
              .map(([id, employee]) => [String(id), employee])
          );

          let labels = [];

          if (ids.length > 0) {
            labels = ids
              .map((id) => {
                const fromEmployeeName = employeeNameEntries.find(
                  (employee) => employee.id === String(id)
                );
                const fromWeekend = weekendEmployees.find(
                  (employee) => String(getEmployeeId(employee)) === String(id)
                );

                return (
                  fromEmployeeName?.name ??
                  fromWeekend ??
                  lookup.get(String(id)) ??
                  ''
                );
              })
              .filter(Boolean)
              .map((emp) => {
                if (typeof emp === 'string') return emp;

                const displayEmployee = getDisplayEmployee(emp);

                return (
                  resolveEmployeeDisplayName(displayEmployee, {
                    preferArabic,
                  }) || ''
                );
              })
              .filter(Boolean);

            if (labels.length === 0 && employeeNameEntries.length > 0) {
              labels = employeeNameEntries.map((employee) => employee.name).filter(Boolean);
            }
          } else if (weekendEmployees.length > 0) {
            labels = weekendEmployees
              .map((emp) =>
                resolveEmployeeDisplayName(getDisplayEmployee(emp), {
                  preferArabic,
                })
              )
              .filter(Boolean);
          } else if (employeeNameEntries.length > 0) {
            labels = employeeNameEntries.map((employee) => employee.name).filter(Boolean);
          }

          if (labels.length === 0) {
            const count =
              row.original.employees_count ??
              row.original.employeesCount ??
              ids.length;

            return <span>{count ? String(count) : '—'}</span>;
          }

          const shown = labels.slice(0, 2);
          const remaining = labels.length - shown.length;
          const display =
            shown.join(', ') + (remaining > 0 ? `, ... +${remaining}` : '');

          return (
            <span
              className="block max-w-[280px] truncate"
              title={labels.join(', ')}
            >
              {display || '—'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: t('weekends.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit?.(row.original)}
              title={t('weekends.modal.editTitle')}
            >
              <Pencil className="size-4" />
            </button>

            <button
              type="button"
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setWeekendToManage(row.original);
                setManageModalOpen(true);
              }}
              title={t('weekends.manageModal.title')}
            >
              <UserMinus className="size-4" />
            </button>

            <button
              type="button"
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setWeekendToDelete(row.original);
                setDeleteModalOpen(true);
              }}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, employees, preferArabic, onEdit]
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
                {Array.from({ length: columns.length }).map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('weekends.empty')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteWeekendModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        weekend={weekendToDelete}
      />

      <ManageWeekendEmployeesModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        weekend={weekendToManage}
      />
    </div>
  );
}
