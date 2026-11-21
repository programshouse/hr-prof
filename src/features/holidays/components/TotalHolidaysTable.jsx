import { useMemo, useState, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useTranslation } from 'react-i18next';
import {
  resolveDepartmentDisplayName,
  resolveHolidayTypeValue,
  resolveHolidayTypeLabel,
} from '@/lib/utils/employeeDisplayName';
import DeleteHolidayModal from './DeleteHolidayModal';
import DeleteEmployeeOfficialHolidayModal from './DeleteEmployeeOfficialHolidayModal';
import { useDeleteEmployeeOfficialHoliday } from '../hooks/useDeleteEmployeeOfficialHoliday';
import { useRemoveWeekendEmployees } from '../../weekends/hooks/useWeekendMutations';

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function resolveHolidayId(holiday) {
  const raw =
    holiday?.id ??
    holiday?.holiday_id ??
    holiday?.holidayId ??
    holiday?.holiday?.id ??
    holiday?.holiday?.holiday_id ??
    holiday?.holiday?.holidayId ??
    holiday?.holiday_request_id ??
    holiday?.holidayRequestId ??
    null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function resolveWeekendId(holiday) {
  const type = normalizeType(resolveHolidayTypeValue(holiday));
  const raw =
    holiday?.weekend_id ??
    holiday?.weekendId ??
    holiday?.weekend ??
    holiday?.weekend?.id ??
    holiday?.weekend?.weekend_id ??
    holiday?.weekend?.weekendId ??
    holiday?.holiday?.weekend_id ??
    holiday?.holiday?.weekendId ??
    holiday?.holiday?.weekend ??
    holiday?.holiday?.weekend?.id ??
    holiday?.holiday?.weekend?.weekend_id ??
    holiday?.holiday?.weekend?.weekendId ??
    holiday?.weekend_details?.id ??
    holiday?.weekend_details?.weekend_id ??
    (type.includes('weekend') ? holiday?.id : null) ??
    null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function resolveTypeFallback(deleteType) {
  if (deleteType === 'weekend') return 'weekend';
  if (deleteType === 'official') return 'official holiday';
  return '';
}

export default function TotalHolidaysTable({ data = [], loading }) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language === 'ar';
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const { data: departments = [] } = useAllDepartments();

  const [requestDeleteOpen, setRequestDeleteOpen] = useState(false);
  const [officialDeleteOpen, setOfficialDeleteOpen] = useState(false);
  const [weekendDeleteOpen, setWeekendDeleteOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);

  const {
    mutate: deleteEmployeeHoliday,
    isPending: isDeletingOfficialHoliday,
  } = useDeleteEmployeeOfficialHoliday();

  const { mutate: removeWeekendEmployees, isPending: isRemovingWeekend } =
    useRemoveWeekendEmployees();

  const getHolidayDeleteType = (holiday) => {
    const type = normalizeType(resolveHolidayTypeValue(holiday));
    if (type.includes('weekend')) return 'weekend';
    if (type.includes('official')) return 'official';

    const hasWeekendId = Boolean(
      resolveWeekendId(holiday) ||
      resolveWeekendId(holiday?.holiday) ||
      resolveWeekendId(holiday?.weekend)
    );

    if (hasWeekendId) return 'weekend';
    return 'request';
  };

  const resolveEmployeeId = (holiday) => {
    return (
      holiday?.employee_id ??
      holiday?.employee?.id ??
      holiday?.employee?.employee_id ??
      holiday?.employee?.employeeId ??
      null
    );
  };

  const handleDeleteClick = useCallback(
    (holiday) => {
      const deleteType = getHolidayDeleteType(holiday);
      setHolidayToDelete(holiday);

      if (deleteType === 'official') {
        setOfficialDeleteOpen(true);
        return;
      }

      if (deleteType === 'request') {
        setRequestDeleteOpen(true);
        return;
      }

      setWeekendDeleteOpen(true);
    },
    []
  );

  const handleConfirmDelete = () => {
    const formal_occasion_id = resolveHolidayId(holidayToDelete);
    const employee_id = resolveEmployeeId(holidayToDelete);

    if (!formal_occasion_id || !employee_id) {
      return;
    }

    deleteEmployeeHoliday(
      { formal_occasion_id, employee_id },
      {
        onSuccess: () => {
          setOfficialDeleteOpen(false);
          setHolidayToDelete(null);
        },
      }
    );
  };

  const handleConfirmWeekendDelete = () => {
    const weekendId = resolveWeekendId(holidayToDelete);
    const employeeId = resolveEmployeeId(holidayToDelete);

    if (!weekendId || !employeeId) {
      setWeekendDeleteOpen(false);
      setHolidayToDelete(null);
      return;
    }

    removeWeekendEmployees(
      { weekend_id: weekendId, employee_ids: [employeeId] },
      {
        onSuccess: () => {
          setWeekendDeleteOpen(false);
          setHolidayToDelete(null);
        },
      }
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('holidays.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'employeeName',
        header: t('holidays.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const department = departments.find(
            (d) => String(d.id) === String(emp?.department_id)
          );

          const deptName =
            resolveDepartmentDisplayName(department, { preferArabic }) ||
            emp?.department?.name_ar ||
            emp?.department?.name_en ||
            emp?.department?.name ||
            '—';

          return (
            <div className="flex items-center gap-3">
              <img
                src={
                  row.original.avatarUrl ||
                  'https://ui-avatars.com/api/?name=Employee'
                }
                alt={row.original.employeeName || 'Employee'}
                className="size-9 rounded-full object-cover"
              />

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {row.original.employeeName || '—'}
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
        header: t('holidays.headers.date'),
        cell: ({ row }) => <span>{row.original.date || '—'}</span>,
      },
      {
        accessorKey: 'from',
        header: t('holidays.headers.from'),
        cell: ({ row }) => <span>{row.original.from || '—'}</span>,
      },
      {
        accessorKey: 'to',
        header: t('holidays.headers.to'),
        cell: ({ row }) => <span>{row.original.to || '—'}</span>,
      },
      {
        accessorKey: 'type',
        header: t('holidays.headers.type'),
        cell: ({ row }) => {
          const holiday = row.original;
          const rawType = resolveHolidayTypeValue(holiday);
          const deleteType = getHolidayDeleteType(holiday);
          const label = resolveHolidayTypeLabel(
            rawType || resolveTypeFallback(deleteType),
            t
          );

          return <span className="font-medium">{label}</span>;
        },
      },
      {
        id: 'actions',
        header: t('holidays.headers.action'),
        cell: ({ row }) => {
          const holiday = row.original;

          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={
                ((getHolidayDeleteType(holiday) === 'weekend'
                  ? resolveWeekendId(holiday)
                  : resolveHolidayId(holiday)) == null) ||
                isDeletingOfficialHoliday ||
                isRemovingWeekend
              }
              onClick={() => handleDeleteClick(holiday)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              title={t('common.delete', 'Delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [departments, t, preferArabic, handleDeleteClick, isDeletingOfficialHoliday, isRemovingWeekend]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative">
      <DeleteHolidayModal
        open={requestDeleteOpen}
        onOpenChange={(open) => {
          setRequestDeleteOpen(open);
          if (!open) setHolidayToDelete(null);
        }}
        holiday={holidayToDelete}
      />

      <DeleteEmployeeOfficialHolidayModal
        open={officialDeleteOpen}
        onOpenChange={(open) => {
          setOfficialDeleteOpen(open);
          if (!open) setHolidayToDelete(null);
        }}
        holiday={holidayToDelete}
        onConfirm={handleConfirmDelete}
        isPending={isDeletingOfficialHoliday}
      />

      <Dialog
        open={weekendDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (isRemovingWeekend) return;
          setWeekendDeleteOpen(nextOpen);
          if (!nextOpen) setHolidayToDelete(null);
        }}
      >
        <DialogContent
          dir={dir}
          className={`
            max-w-md
            ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
          `}
        >
          <DialogHeader
            className={isArabic ? 'items-end text-right' : 'items-start text-left'}
          >
            <div className="flex w-full items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-6 text-red-600" />
              </div>

              <div className={isArabic ? 'text-right' : 'text-left'}>
                <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
                  {t('navigation.weekends', 'Weekends')}
                </DialogTitle>

                <DialogDescription className={isArabic ? 'text-right' : 'text-left'}>
                  {t('deleteModals.description')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className={`space-y-3 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
            <p className="text-sm text-gray-600">
              Remove employee {holidayToDelete?.employeeName || 'Employee'} from weekend?
            </p>

            {holidayToDelete && (
              <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="shrink-0 font-medium text-gray-700">
                    {t('holidays.headers.employee')}:
                  </span>
                  <span className="text-gray-900">
                    {holidayToDelete.employeeName || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="shrink-0 font-medium text-gray-700">
                    {t('holidays.headers.from')}:
                  </span>
                  <span className="text-gray-900">{holidayToDelete.from || '—'}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="shrink-0 font-medium text-gray-700">
                    {t('holidays.headers.to')}:
                  </span>
                  <span className="text-gray-900">{holidayToDelete.to || '—'}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className={isArabic ? 'justify-start' : 'justify-end'}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setWeekendDeleteOpen(false)}
              disabled={isRemovingWeekend}
            >
              {t('deleteModals.cancel')}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmWeekendDelete}
              disabled={isRemovingWeekend}
            >
              {isRemovingWeekend ? t('deleteModals.deleting') : t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>

                {Array.from({ length: 5 }).map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton className="h-4 w-20" />
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
                {t('holidays.noHolidaysFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
