// src/features/internships/components/InternshipTable.jsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash, UserMinus, UserCheck } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import DeleteInternshipModal from './DeleteInternshipModal';
import { internshipsApi } from '../api/internships.api';
import DeactivateEmployeeModal from '../../employees/components/DeactivateEmployeeModal';

export function InternshipTable({
  data = [],
  loading = false,
  rowSelection = {},
  onRowSelectionChange,
  onTableReady,
  showSelection = false,
  onShowSelectionChange,

  onEdit,
  onRefresh,
  onActivateRequest,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [internshipToDeactivate, setInternshipToDeactivate] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  const containerRef = useRef(null);

  const handleToggleStatus = useCallback(
    async (internship) => {
      const isActive = internship.is_active !== false;

      // For active internships, open deactivation modal
      if (isActive) {
        setInternshipToDeactivate(internship);
        setDeactivateModalOpen(true);
        return;
      }

      // For inactive internships, activate directly (no confirmation needed)
      if (!isActive && onActivateRequest) {
        onActivateRequest(internship);
        return;
      }

      const internshipId = internship.id;
      if (processingIds.has(internshipId)) return;

      setProcessingIds((prev) => new Set(prev).add(internshipId));
      try {
        await internshipsApi.makeInternshipActive(internshipId);
        toast.success(t('internships.activatedSuccessfully'));
        onRefresh?.();
      } catch (error) {
        console.error('Failed to toggle internship status:', error);
        toast.error(t('internships.failedToUpdate'));
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(internshipId);
          return next;
        });
      }
    },
    [processingIds, onRefresh, onActivateRequest]
  );

  const baseColumns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: t('tables.headers.id'),
        cell: ({ row }) => <span>{row.original.code || `IN-${row.original.id ?? '001'}`}</span>,
      },
      {
        accessorKey: 'full_name',
        header: t('tables.headers.name'),
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">{row.original.full_name || '—'}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: t('tables.headers.phone'),
        cell: ({ row }) => <span>{row.original.phone || '—'}</span>,
      },
      {
        accessorKey: 'position',
        header: t('tables.headers.job'),
        cell: ({ row }) => <span>{row.original.position || '—'}</span>,
      },
      {
        accessorKey: 'department',
        header: t('tables.headers.department'),
        cell: ({ row }) => <span>{row.original.department || '—'}</span>,
      },
      {
        accessorKey: 'shift',
        header: t('tables.headers.shift'),
        cell: ({ row }) => <span>{row.original.shift || '—'}</span>,
      },
      {
        accessorKey: 'join_date',
        header: t('tables.headers.joinDate'),
        cell: ({ row }) => <span>{row.original.join_date || '—'}</span>,
      },
      {
        id: 'actions',
        header: t('tables.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {/* View */}
            <button
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => navigate(`/employees/${row.original.id}`)}
            >
              <Eye className="size-4" />
            </button>

            {/* Edit (gray when inactive) */}
            {(() => {
              const isActive = row.original.is_active !== false;

              return (
                <button
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 ${isActive ? 'bg-light-success text-success' : 'bg-gray-100 text-gray-500'}`}
                  onClick={() => {
                    if (onEdit) onEdit(row.original);
                  }}
                >
                  <Edit className="size-4" />
                </button>
              );
            })()}

            {/* Status Toggle */}
            {(() => {
              const isActive = row.original.is_active !== false;
              const StatusIcon = isActive ? UserMinus : UserCheck;

              const toggleBtnClass = isActive
                ? 'bg-slate-200 text-slate-600' // deactivate
                : 'bg-light-success text-success'; // activate

              const statusTitle = isActive
                ? t('internships.actions.deactivate')
                : t('internships.actions.activate');

              return (
                <button
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 disabled:opacity-50 ${toggleBtnClass}`}
                  onClick={() => handleToggleStatus(row.original)}
                  title={statusTitle}
                  disabled={processingIds.has(row.original.id)}
                >
                  {processingIds.has(row.original.id) ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <StatusIcon className="size-4" />
                  )}
                </button>
              );
            })()}

            {/* Delete */}
            <button
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setInternshipToDelete(row.original);
                setDeleteModalOpen(true);
              }}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [navigate, onEdit, handleToggleStatus, processingIds, t]
  );

  const columns = useMemo(() => {
    if (!showSelection) return baseColumns;

    const selectColumn = {
      id: 'select',
      header: ({ table }) => (
        <IndeterminateCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    };

    return [selectColumn, ...baseColumns];
  }, [baseColumns, showSelection]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection: rowSelection ?? {} },
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
  });

  // ✅ same as EmployeeTable: expose table instance in effect (NOT inside render)
  useEffect(() => {
    onTableReady?.(table);
  }, [table, onTableReady]);

  // ✅ same as EmployeeTable: click-outside clears selection + hides checkbox column
  useEffect(() => {
    if (!showSelection) return;

    function handleClickOutside(event) {
      if (!containerRef.current) return;

      // ignore clicks on things that should keep selection (export trigger etc)
      const keepSelectionTarget = event.target.closest('[data-keep-selection="true"]');
      if (keepSelectionTarget) return;

      if (!containerRef.current.contains(event.target)) {
        if (onRowSelectionChange) onRowSelectionChange({});
        else table.resetRowSelection();
        onShowSelectionChange?.(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelection, onRowSelectionChange, onShowSelectionChange, table]);

  return (
    <>
      <div ref={containerRef} className="relative rounded-md border">
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
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx} className="border-b last:border-0">
                  {showSelection && (
                    <TableCell>
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className="size-8 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b last:border-0 hover:bg-gray-50/60">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState 
                    title="لا يوجد تدريب" 
                    description="لا توجد تدريبات متاحة في الوقت الحالي." 
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteInternshipModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        internship={internshipToDelete}
        onRefresh={onRefresh}
      />

      {/* Deactivate Confirmation Modal */}
      <DeactivateEmployeeModal
        open={deactivateModalOpen}
        onOpenChange={setDeactivateModalOpen}
        employee={internshipToDeactivate}
        onSuccess={onRefresh}
      />
    </>
  );
}

/* ---------- checkbox helper (same as EmployeeTable) ---------- */
function IndeterminateCheckbox({ indeterminate, className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' text-primary focus:ring-primary accent-primary cursor-pointer'}
      {...rest}
    />
  );
}
