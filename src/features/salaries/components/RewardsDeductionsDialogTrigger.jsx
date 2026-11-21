import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, UploadCloud } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { salariesApi } from '../api/salariesApi';

export default function RewardsDeductionsDialogTrigger({
  value,
  type, // 'rewards' | 'deductions' | 'penalties'
  employeeId,
  year,
  month,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const EXPORT_COLUMNS = [
    { key: 'date', label: t('tables.headers.date') },
    { key: 'amount', label: t('tables.headers.amount') },
    { key: 'type', label: t('tables.headers.type') },
  ];

  const isRewards = type === 'rewards';
  const isPenalties = type === 'penalties';
  const isDeductions = type === 'deductions';

  const getTitle = () => {
    if (isRewards) return t('rewards.title');
    if (isPenalties) return t('penalties.title');
    return t('salaries.deductions');
  };

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['sheet', type, employeeId, year, month],
    queryFn: () => {
      console.log('🔍 Fetching sheet data:', { type, employeeId, year, month });

      if (isRewards) {
        return salariesApi.getEmployeeRewards(employeeId, year, month);
      }

      if (isPenalties) {
        return salariesApi.getEmployeePenalties(employeeId, year, month);
      }

      return salariesApi.getEmployeeDeductions(employeeId, year, month);
    },
    enabled: open && !!employeeId && !!year && !!month,
    onSuccess: (data) => {
      console.log('✅ API Response:', data);
      console.log('📊 Rows count:', data?.data?.rows?.length || 0);
    },
    onError: (error) => {
      console.error('❌ API Error:', error);
    },
  });

  const rows = apiData?.data?.rows ?? [];
  const totalLateDeduction = Number(apiData?.data?.total_late_deduction ?? 0);
  const apiYear = apiData?.data?.year;
  const apiMonth = apiData?.data?.month;

  console.log('📋 Current rows:', rows);
  console.log('💰 Total late deduction:', totalLateDeduction);

  const getRowsToExport = () => {
    const exportData = [...rows];

    if (isDeductions && totalLateDeduction > 0) {
      const monthYear =
        apiMonth && apiYear ? `${String(apiMonth).padStart(2, '0')}-${apiYear}` : '--';

      exportData.push({
        date: monthYear,
        amount: totalLateDeduction,
        type: 'Late Arrival',
      });
    }

    if (!exportData.length) {
      toast.error(t('common.noData', 'No {{type}} records found to export.', { type: getTitle().toLowerCase() }));
      return [];
    }

    return exportData;
  };

  const baseFileName = `${type}-sheet-${employeeId}`;
  const title = `${getTitle()} Sheet (${employeeId})`;

  const handlePdf = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    exportToPdf({
      rows: exportRows,
      columns: EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    exportToExcel({
      rows: exportRows,
      columns: EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    printTable({
      rows: exportRows,
      columns: EXPORT_COLUMNS,
      title,
    });
  };

  const showNoData = !rows.length && (!isDeductions || totalLateDeduction === 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50"
        >
          <span className={isRewards ? 'text-green-600' : 'text-red-600'}>{value ?? '--'}</span>
          <Eye className="h-4 w-4 cursor-pointer text-slate-400 opacity-70" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-2xl border-slate-200 bg-white">
        <DialogHeader className="mt-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold capitalize">
            {getTitle()} Sheet
          </DialogTitle>

          <ExportDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-4 text-xs font-semibold shadow-xs"
                disabled={showNoData}
              >
                <UploadCloud className="mr-1.5 h-4 w-4" />
                {t('common.export')}
              </Button>
            }
            onPdf={handlePdf}
            onExcel={handleExcel}
            onPrintTable={handlePrint}
          />
        </DialogHeader>

        <div className="max-h-80 overflow-x-hidden overflow-y-auto rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500">{t('tables.headers.date')}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">{t('tables.headers.amount')}</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">{t('tables.headers.type')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-xs text-slate-500">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : showNoData ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-xs text-slate-500">
                    {t('common.noData', 'No records found.')}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((row, index) => (
                    <TableRow
                      key={row?.id ?? `${row?.date}-${index}`}
                      className="hover:bg-slate-50/70 [&>td]:py-3"
                    >
                      <TableCell className="text-xs text-slate-900">{row?.date ?? t('common.noData', '--')}</TableCell>
                      <TableCell
                        className={`text-xs font-medium ${isRewards ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {row?.amount ?? t('common.noData', '--')}
                      </TableCell>
                      <TableCell className="text-xs text-slate-900">{row?.type ?? t('common.noData', '--')}</TableCell>
                    </TableRow>
                  ))}

                  {isDeductions && totalLateDeduction > 0 && (
                    <TableRow className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                      <TableCell className="text-xs text-slate-900">
                        {apiMonth && apiYear
                          ? `${String(apiMonth).padStart(2, '0')}-${apiYear}`
                          : t('common.noData', '--')}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-red-600">
                        {totalLateDeduction}
                      </TableCell>
                      <TableCell className="text-xs text-slate-900">{t('attendance.lateArrival', 'Late Arrival')}</TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}