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

export default function OvertimeSheetDialogTrigger({
  value,
  employeeId,
  year,
  month,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['accepted-overtime-sheet', year, month, employeeId],
    queryFn: () => salariesApi.getAcceptedOvertime(year, month, employeeId),
    enabled: open && !!employeeId && !!year && !!month,
  });

  const employee = data?.data?.find(
    (e) => String(e.id) === String(employeeId)
  );

  const rows = employee?.overtime_requests || [];

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
          <DialogTitle>Overtime Sheet</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.from}</TableCell>
                    <TableCell>{item.to}</TableCell>
                    <TableCell>{item.reason || '--'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-slate-500">
                    {t('salaries.emptyStates.noOvertimeRequestsFound')}
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