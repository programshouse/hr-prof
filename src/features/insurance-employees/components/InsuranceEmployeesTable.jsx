import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  formatInsuranceMoney,
  formatInsurancePercent,
  getEmployeeInitials,
} from '../utils/insuranceEmployeesUtils';

function EmployeeCell({
  row,
  onNavigate,
}) {
  const name =
    row.original?.name || '—';

  const code =
    row.original?.code || '—';

  return (
    <button
      type="button"
      onClick={() => {
        if (row.original?.id) {
          onNavigate(row.original.id);
        }
      }}
      className="flex w-full items-center gap-3 text-start"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
        {getEmployeeInitials(name)}
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">
          {name}
        </div>

        <div className="truncate text-xs text-indigo-600">
          {code}
        </div>
      </div>
    </button>
  );
}

export default function InsuranceEmployeesTable({
  data = [],
  loading = false,
  totalInsuranceAmount = 0,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t(
          'insuranceEmployees.table.employee'
        ),

        cell: ({ row }) => (
          <EmployeeCell
            row={row}
            onNavigate={(id) =>
              navigate(`/employees/${id}`)
            }
          />
        ),
      },
      {
        accessorKey:
          'insurance_percentage',

        header: t(
          'insuranceEmployees.table.insuranceRate'
        ),

        cell: ({ row }) =>
          formatInsurancePercent(
            row.original
              .insurance_percentage
          ),
      },
      {
        accessorKey: 'insurance_amount',

        header: t(
          'insuranceEmployees.table.insuranceAmount'
        ),

        cell: ({ row }) =>
          formatInsuranceMoney(
            row.original.insurance_amount
          ),
      },
      {
        accessorKey:
          'company_insurance_percent',

        header: t(
          'insuranceEmployees.table.companyInsuranceRate'
        ),

        cell: ({ row }) =>
          formatInsurancePercent(
            row.original
              .company_insurance_percent
          ),
      },
      {
        accessorKey:
          'company_insurance_amount',

        header: t(
          'insuranceEmployees.table.amount'
        ),

        cell: ({ row }) =>
          formatInsuranceMoney(
            row.original
              .company_insurance_amount
          ),
      },
    ],
    [navigate, t]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel:
      getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-12 w-full"
          />
        ))}
      </div>
    );
  }

  const tableRows =
    table.getRowModel().rows;

  const hasRows =
    tableRows.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          {table
            .getHeaderGroups()
            .map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50/80 hover:bg-slate-50/80"
              >
                {headerGroup.headers.map(
                  (header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold text-slate-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header
                              .column
                              .columnDef
                              .header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                )}
              </TableRow>
            ))}
        </TableHeader>

        <TableBody>
          {hasRows ? (
            <>
              {tableRows.map((row) => (
                <TableRow key={row.id}>
                  {row
                    .getVisibleCells()
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4 align-middle"
                      >
                        {flexRender(
                          cell.column
                            .columnDef
                            .cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))}

              <TableRow className="border-t-2 border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50/60">
                <TableCell
                  colSpan={2}
                  className="py-4 text-sm font-bold text-slate-900"
                >
                  {t(
                    'insuranceEmployees.totalInsurance',
                    {
                      defaultValue:
                        'Total Insurance Amount',
                    }
                  )}
                </TableCell>

                <TableCell className="py-4 text-sm font-bold text-primary">
                  {formatInsuranceMoney(
                    totalInsuranceAmount
                  )}
                </TableCell>

                <TableCell
                  colSpan={2}
                  className="py-4"
                />
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm text-slate-500"
              >
                {t(
                  'insuranceEmployees.empty'
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}