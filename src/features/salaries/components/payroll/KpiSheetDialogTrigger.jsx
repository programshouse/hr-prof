import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';

import { salariesApi } from '../../api/salariesApi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export default function KpiSheetDialogTrigger({
  value,
  employeeId,
  year,
  month,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['kpi-sheet', year, month, employeeId],
    queryFn: () => salariesApi.getKpiSheet(year, month, employeeId),
    enabled: open && !!employeeId && !!year && !!month,
  });

  const employee = data?.data?.find(
    (e) => String(e.id) === String(employeeId)
  );

  const items = employee?.kpi_items || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
          <span>{value ?? '--'}</span>
          <Eye className="h-4 w-4 text-slate-400" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>KPI Sheet</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Max Score</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.score}</TableCell>
                    <TableCell>{item.max_score}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-slate-500">
                    {t('salaries.emptyStates.noKpiData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}