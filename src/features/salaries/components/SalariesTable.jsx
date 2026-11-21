import { MoreHorizontal } from 'lucide-react';
import { useMemo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/error/EmptyState';
import RewardsDeductionsDialogTrigger from './RewardsDeductionsDialogTrigger';
import { salariesApi } from '../api/salariesApi';
import { Eye } from 'lucide-react';

// Helper function to extract department amounts from salary_details
const getDepartmentAmount = (salaryDetails, departmentName) => {
  if (!salaryDetails || !Array.isArray(salaryDetails)) return 0;

  const dept = salaryDetails.find((detail) =>
    String(detail.department_name || '')
      .toLowerCase()
      .includes(String(departmentName).toLowerCase())
  );

  return Number(dept?.amount ?? 0) || 0;
};

// Component to fetch and display total_penalties from penalties sheet
function PenaltiesCell({ employeeId, year, month }) {
  const [totalPenalties, setTotalPenalties] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPenalties = async () => {
      try {
        const response = await salariesApi.getEmployeePenalties(employeeId, year, month);
        setTotalPenalties(response?.data?.total_penalties || 0);
      } catch (error) {
        console.error('Error fetching total_penalties:', error);
        setTotalPenalties(0);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId && year && month) {
      setLoading(true);
      fetchPenalties();
    }
  }, [employeeId, year, month]);

  if (loading) {
    return <MoneyPill value="--" />;
  }

  return (
    <RewardsDeductionsDialogTrigger
      value={totalPenalties}
      type="penalties"
      employeeId={employeeId}
      year={year}
      month={month}
    />
  );
}

function MoneyPill({ value, tone = 'neutral' }) {
  const toneClasses =
    tone === 'green' ? 'text-green-600' : tone === 'red' ? 'text-red-600' : 'text-slate-700';

  return <span className={`text-xs font-medium ${toneClasses}`}>{value ?? '--'}</span>;
}

/** initials like Employees page (AK) */
function getInitials(name = '') {
  const cleaned = String(name).trim().replace(/\s+/g, ' ');
  if (!cleaned) return '--';

  const parts = cleaned.split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = (parts[1]?.[0] ?? parts[0]?.[1] ?? '') || '';
  return (first + second).toUpperCase();
}

function NameCell({ name, job, avatar }) {
  const hasImage = !!avatar && String(avatar).trim() !== '';
  const initials = getInitials(name);

  return (
    <div className="flex items-center gap-3">
      {hasImage ? (
        <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-200 text-xs font-semibold text-slate-600">
          {initials}
        </div>
      )}

      <div className="leading-tight">
        <div className="text-xs font-semibold text-slate-900">{name}</div>
        <div className="text-[11px] font-medium text-indigo-500">{job}</div>
      </div>
    </div>
  );
}

export default function SalariesTable({
  data = [],
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
  hide,
  onHideChange,
  onTableReady,
  rowSelection,
  onRowSelectionChange,
  showSelection,
  onShowSelectionChange,
  year,
  month,
}) {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const baseColumns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: t('salaries.exportColumns.id'),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">{row.original.code ?? '--'}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: t('salaries.exportColumns.name'),
        cell: ({ row }) => (
          <NameCell
            name={row.original.name}
            job={row.original.position}
            avatar={row.original.avatar}
          />
        ),
      },
      {
        accessorKey: 'type',
        header: t('salaries.exportColumns.type'),
        cell: ({ row }) => <span className="text-xs">{row.original.type}</span>,
      },
      {
        accessorKey: 'net_salary',
        header: t('salaries.exportColumns.netSalary'),
        cell: ({ row }) => {
          const netSalary = row.original.net_salary || 0;
          const commission = row.original.commission || 0;

          if (commission > 0) {
            return <MoneyPill value={`${netSalary}+${commission} (commission)`} />;
          }
          return <MoneyPill value={netSalary} />;
        },
      },
      {
        accessorKey: 'programs',
        cell: ({ row }) => {
          const amount = getDepartmentAmount(row.original.salary_details, 'Programs');
          return <MoneyPill value={amount} tone="green" />;
        },
      },
      {
        accessorKey: 'marketing',
        cell: ({ row }) => {
          const amount =
            getDepartmentAmount(row.original.salary_details, 'M&S') ||
            getDepartmentAmount(row.original.salary_details, 'Marketing');
          return <MoneyPill value={amount} tone="green" />;
        },
      },
      {
        accessorKey: 'research',
        cell: ({ row }) => {
          const amount =
            getDepartmentAmount(row.original.salary_details, 'Prof') ||
            getDepartmentAmount(row.original.salary_details, 'Research');
          return <MoneyPill value={amount} tone="green" />;
        },
      },
      {
        accessorKey: 'print',
        cell: ({ row }) => {
          const amount =
            getDepartmentAmount(row.original.salary_details, 'Print') ||
            getDepartmentAmount(row.original.salary_details, 'Dolphin');
          return <MoneyPill value={amount} tone="green" />;
        },
      },
      {
        accessorKey: 'kpi',
        header: t('salaries.exportColumns.kpi'),
        cell: ({ row }) => <MoneyPill value={row.original.kpi} tone="green" />,
      },
      {
        accessorKey: 'rewards',
        header: t('salaries.exportColumns.rewards'),
        cell: ({ row }) => (
          <RewardsDeductionsDialogTrigger
            value={row.original.rewards}
            type="rewards"
            employeeId={row.original.id}
            year={year}
            month={month}
          />
        ),
      },
      {
        accessorKey: 'penalties',
        header: t('salaries.exportColumns.penalties'),
        cell: ({ row }) => <PenaltiesCell employeeId={row.original.id} year={year} month={month} />,
      },
      {
        accessorKey: 'total_salary',
        header: t('salaries.exportColumns.totalSalary'),
        cell: ({ row }) => (
          <span className="text-xs font-semibold">{row.original.total_salary ?? '--'}</span>
        ),
      },
      {
        id: 'action',
        header: t('tables.headers.action'),
        cell: ({ row }) => (
          <Button
            variant="reset1"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200"
            onClick={() => onViewDetails?.(row.original)}
          >
            <Eye className="h-4 w-4 text-slate-600" />
          </Button>
        ),
      },
    ],
    [year, month, onViewDetails, t]
  );

  const hiddenBaseColumns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: t('salaries.exportColumns.id'),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">{row.original.code ?? '--'}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: t('salaries.exportColumns.name'),
        cell: ({ row }) => (
          <NameCell
            name={row.original.name}
            job={row.original.position}
            avatar={row.original.avatar}
          />
        ),
      },
      {
        accessorKey: 'net_salary',
        header: t('salaries.exportColumns.netSalary'),
        cell: ({ row }) => {
          const netSalary = row.original.net_salary || 0;
          const commission = row.original.commission || 0;

          if (commission > 0) {
            return <MoneyPill value={`${netSalary}+${commission} (commission)`} />;
          }
          return <MoneyPill value={netSalary} />;
        },
      },
      {
        accessorKey: 'kpi',
        header: t('salaries.exportColumns.kpi'),
        cell: ({ row }) => <MoneyPill value={row.original.kpi} tone="green" />,
      },
      {
        accessorKey: 'rewards',
        header: t('salaries.exportColumns.rewards'),
        cell: ({ row }) => (
          <RewardsDeductionsDialogTrigger
            value={row.original.rewards}
            type="rewards"
            employeeId={row.original.id}
            year={year}
            month={month}
          />
        ),
      },
      {
        accessorKey: 'penalties',
        header: t('salaries.exportColumns.penalties'),
        cell: ({ row }) => <PenaltiesCell employeeId={row.original.id} year={year} month={month} />,
      },
      {
        accessorKey: 'total_salary',
        header: t('salaries.exportColumns.totalSalary'),
        cell: ({ row }) => (
          <span className="text-xs font-semibold">{row.original.total_salary ?? '--'}</span>
        ),
      },
      {
        id: 'action',
        header: t('tables.headers.action'),
        cell: ({ row }) => (
          <Button
            variant="reset1"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200"
            onClick={() => onViewDetails?.(row.original)}
          >
            <Eye className="h-4 w-4 text-slate-600" />
          </Button>
        ),
      },
    ],
    [year, month, onViewDetails, t]
  );

  const columns = useMemo(() => {
    const baseCols = hide ? hiddenBaseColumns : baseColumns;
    if (!showSelection) return baseCols;

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
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...baseCols];
  }, [baseColumns, hiddenBaseColumns, showSelection, hide]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection: rowSelection ?? {} },
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    onTableReady?.(table);
  }, [table, onTableReady]);

  useEffect(() => {
    if (!showSelection) return;

    function handleClickOutside(event) {
      if (!containerRef.current) return;

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
    <div ref={containerRef} className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">{t('salaries.allSalaries')}</h2>

        <div className="flex items-center gap-2">
          <Switch checked={!!hide} onCheckedChange={(v) => onHideChange?.(v)} />
          <span className="text-xs font-medium text-slate-600">{t('salaries.hide')}</span>
        </div>
      </div>

      <div>
        <Table className="[&_td]:whitespace-normal [&_th]:whitespace-normal [&>div]:overflow-x-visible!">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50">
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
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {showSelection && (
                    <TableCell>
                      <Skeleton className="size-4 rounded" />
                    </TableCell>
                  )}
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx} className="py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 align-middle whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState title={t('salaries.noSalaryDataFound')} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-slate-200 px-5 py-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

/* ---------- checkbox helper ---------- */
function IndeterminateCheckbox({ indeterminate, className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' text-primary focus:ring-primary accent-primary cursor-pointer'}
      {...rest}
    />
  );
}
