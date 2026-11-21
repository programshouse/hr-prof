// src/features/employees/components/EmployeeTable.jsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash, Eye, Edit, UserMinus, UserCheck, ChartNoAxesColumnIncreasing, Plus } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import DeleteEmployeeModal from './DeleteEmployeeModal';
import { toast } from 'sonner';
import { employeesApi } from '../api/employees.api';

export default function EmployeeTable({
  data = [],
  loading,
  rowSelection,
  onRowSelectionChange,
  onTableReady,
  showSelection,
  onShowSelectionChange,

  onEdit,
  onRefresh,
  onDeactivateRequest,
  onActivateRequest,
  _onScheduleInterview,

  // ✅ NEW
  hideDepartment = false,
  portalManagerMode = false,
  onManageKpi,
  onAddKpi,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  const containerRef = useRef(null);

  const handleToggleStatus = useCallback(
    async (employee) => {
      const isActive = !!employee.is_active;

      // If parent wants to handle confirm modals, delegate to it
      if (isActive && onDeactivateRequest) {
        onDeactivateRequest(employee);
        return;
      }
      if (!isActive && onActivateRequest) {
        onActivateRequest(employee);
        return;
      }

      const employeeId = employee.id;
      if (processingIds.has(employeeId)) return;

      setProcessingIds((prev) => new Set(prev).add(employeeId));
      try {
        if (isActive) {
          await employeesApi.makeEmployeeInactive(employeeId);
        } else {
          await employeesApi.makeEmployeeActive(employeeId);
        }
        const action = isActive ? 'deactivated' : 'activated';
        toast.success(`Employee ${action} successfully`);
        onRefresh?.();
      } catch (error) {
        console.error('Failed to toggle employee status:', error);
        toast.error('Failed to update employee status');
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(employeeId);
          return newSet;
        });
      }
    },
    [processingIds, onRefresh, onDeactivateRequest, onActivateRequest]
  );

  const baseColumns = useMemo(() => {
    const cols = [
      {
        accessorKey: 'code',
        header: t('tables.headers.id'),
        cell: ({ row }) => {
          const employeeId = row.original.code || `PR-${row.original.id ?? '001'}`;
          return <span>{employeeId}</span>;
        },
      },
      {
        accessorKey: 'full_name',
        header: t('tables.headers.name'),
        cell: ({ row }) => {
          const fullName = row.original.full_name || '';
          const initials = fullName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
          const employeeImage = row.original.image;

          return (
            <div className="flex items-center gap-3">
              {employeeImage ? (
                <img 
                  src={employeeImage} 
                  alt={fullName || 'Employee'}
                  className="size-9 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="size-9 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm"
                style={{ display: employeeImage ? 'none' : 'flex' }}
              >
                {initials || 'NA'}
              </div>
              <span className="font-medium text-gray-900">{fullName || '—'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: t('tables.headers.phone'),
        cell: ({ row }) => <span>{row.original.phone}</span>,
      },
      {
        accessorKey: 'position',
        header: t('tables.headers.job'),
        cell: ({ row }) => {
          const job = row.original.position || '—';

          return (
            <span className="bg-tertiary text-primary inline-flex min-w-28 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm">
              {job}
            </span>
          );
        },
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
        cell: ({ row }) => {
          if (portalManagerMode) {
            return (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary transition hover:bg-primary/10"
                  onClick={() => onManageKpi?.(row.original)}
                  title={t('employees.profile.tabs.kpiPerformance', 'KPI Performance')}
                >
                  <ChartNoAxesColumnIncreasing className="size-4" />
                  <span>{t('employees.profile.tabs.kpiPerformance', 'KPI')}</span>
                </button>

                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-white transition hover:bg-primary/90"
                  onClick={() => onAddKpi?.(row.original)}
                  title="Add KPI"
                >
                  <Plus className="size-4" />
                  <span>Add KPI</span>
                </button>
              </div>
            );
          }

          return (
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
                const isActive = !!row.original.is_active;

                return (
                  <button
                    className={`flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200
                      ${isActive ? 'bg-light-success text-success' : 'bg-gray-100 text-gray-500'}`}
                    onClick={() => {
                      if (onEdit) onEdit(row.original);
                    }}
                  >
                    <Edit className="size-4" />
                  </button>
                );
              })()}

              {/* Status Toggle: UserCheck when is_active=0 (inactive), UserMinus when active */}
              {(() => {
                const isActive = !!row.original.is_active;
                const StatusIcon = isActive ? UserMinus : UserCheck;

                const toggleBtnClass = isActive
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-light-success text-success';

                const statusTitle = isActive ? 'Deactivate Employee' : 'Activate Employee';

                return (
                  <button
                    className={`flex size-8 items-center justify-center rounded-full border border-gray-200 disabled:opacity-50 cursor-pointer ${toggleBtnClass}`}
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
                  setEmployeeToDelete(row.original);
                  setDeleteModalOpen(true);
                }}
              >
                <Trash className="size-4" />
              </button>
            </div>
          );
        },
      },
    ];

    // ✅ remove department if requested
    if (hideDepartment) {
      return cols.filter((c) => c.accessorKey !== 'department');
    }

    return cols;
  }, [navigate, onEdit, handleToggleStatus, processingIds, hideDepartment, t, portalManagerMode, onManageKpi, onAddKpi]);

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
    state: {
      rowSelection: rowSelection ?? {},
    },
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    onTableReady?.(table);
  }, [table, onTableReady]);

  // click-outside: clear selection + hide checkbox column
  useEffect(() => {
    if (!showSelection) return;

    function handleClickOutside(event) {
      if (!containerRef.current) return;

      const keepSelectionTarget = event.target.closest('[data-keep-selection="true"]');
      if (keepSelectionTarget) return;

      if (!containerRef.current.contains(event.target)) {
        if (onRowSelectionChange) {
          onRowSelectionChange({});
        } else {
          table.resetRowSelection();
        }
        onShowSelectionChange?.(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelection, onRowSelectionChange, onShowSelectionChange, table]);

  return (
    <>
      <div ref={containerRef} className="relative">
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
                <TableRow key={idx} className="border-b last:border-0">
                  {showSelection && (
                    <TableCell>
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <Skeleton />
                    </div>
                  </TableCell>
                  {Array.from({ length: hideDepartment ? 4 : 5 }).map((_, idx2) => (
                    <TableCell key={idx2}>
                      <Skeleton />
                    </TableCell>
                  ))}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('emptyStates.noEmployees')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteEmployeeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        employee={employeeToDelete}
      />
    </>
  );
}

/* ---------- checkbox helper ---------- */
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
