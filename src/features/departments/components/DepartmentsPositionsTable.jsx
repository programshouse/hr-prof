'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function PositionPill({ text }) {
  return (
    <span className="bg-tertiary text-primary inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium">
      {text}
    </span>
  );
}

export default function DepartmentsPositionsTable({ rows }) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    if (rows?.length) return rows;

    return [
      { position: 'Web Design', replacement: 100, growth: 3, open: 0 },
      { position: 'Front End', replacement: 78, growth: 0, open: 12 },
      { position: 'Back End', replacement: 65, growth: 2, open: 8 },
      { position: 'UI UX', replacement: 55, growth: 1, open: 4 },
      { position: 'Tester', replacement: 40, growth: 0, open: 6 },
    ];
  }, [rows]);

  const shouldScrollY = data.length > 6; // scroll only if many rows

  return (
    <Card className="border-border rounded-2xl border shadow-sm">
      <CardContent className="p-4">
        <div className="rounded-xl border border-slate-100">
          <div
            className={[
              'w-full overflow-x-auto',
              shouldScrollY ? 'max-h-72 overflow-y-auto' : '',
            ].join(' ')}
          >
            <Table className="min-w-[560px]">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow>
                  <TableHead className="w-[220px]">{t('tables.headers.position')}</TableHead>
                  <TableHead className="text-center">{t('departments.replacement')}</TableHead>
                  <TableHead className="text-center">{t('departments.growth')}</TableHead>
                  <TableHead className="text-center">{t('departments.open')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((r, idx) => (
                  <TableRow key={idx} className="border-b border-slate-50">
                    <TableCell className="py-4">
                      <PositionPill text={r.position} />
                    </TableCell>

                    <TableCell className="py-4 text-center text-sm text-slate-700">
                      {r.replacement}%
                    </TableCell>

                    <TableCell className="py-4 text-center text-sm text-slate-700">
                      {r.growth > 0 ? `+${r.growth}` : r.growth}
                    </TableCell>

                    <TableCell className="py-4 text-center text-sm text-slate-700">
                      {r.open}%
                    </TableCell>
                  </TableRow>
                ))}

                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
