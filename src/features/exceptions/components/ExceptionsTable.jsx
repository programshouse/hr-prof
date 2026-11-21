// src/features/.../components/ExceptionsTable.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { flexRender } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/error/EmptyState';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'NA';

  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';

  return (first + last).toUpperCase();
}

export function NameWithInitials({ name, position }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
        {getInitials(name)}
      </div>

      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-900">{name || '-'}</div>

        {position ? (
          <div className="text-xs font-medium text-primary">{position}</div>
        ) : null}
      </div>
    </div>
  );
}

export function ExceptionsTable({ table, columns, isLoading }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="min-w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50 hover:bg-slate-50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 text-xs font-semibold text-slate-500"
                  >
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
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="border-slate-100">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className="py-5">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200/70" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-56 text-center">
                  <EmptyState title={t('exceptions.noExceptionRecords')} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}