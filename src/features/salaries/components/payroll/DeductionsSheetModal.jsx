// src/features/salaries/components/payroll/DeductionsSheetModal.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Clock } from 'lucide-react';
import { toast } from 'sonner';

import ExportDialog from '@/components/ui/exportDialog.jsx';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';

import { salariesApi } from '../../api/salariesApi';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatMinutesDurationLong } from '@/utils/durationLabels';
import i18n from '@/i18n';

function formatTimeTo12h(timeStr) {
  if (!timeStr) return '--';
  const [hours, minutes] = String(timeStr).split(':');
  const h = parseInt(hours, 10);
  if (Number.isNaN(h)) return timeStr;
  const isAr = i18n.language.startsWith('ar');
  const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
  const h12 = h % 12 || 12;
  return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
}

const formatApiDate = (val) => {
  if (!val) return '--/--/----';
  // API sometimes: "2026-02-17T22:00:00..." or "18-2-2026"
  const d = new Date(val);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  return String(val);
};

export default function DeductionsSheetModal({
  open,
  onOpenChange,
  employeeId,
  year,
  month,
}) {
  const { t } = useTranslation();
  const formatDuration = (minutes) => formatMinutesDurationLong(t, minutes);
  const [sheetData, setSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const DEDUCTION_SHEET_EXPORT_COLUMNS = [
    { key: 'date', label: t('deductions.modal.columns.date') },
    { key: 'type', label: t('deductions.modal.columns.type') },
    { key: 'time', label: t('deductions.modal.columns.time') },
    { key: 'duration', label: t('deductions.modal.columns.duration') },
    { key: 'deduction_amount', label: t('deductions.modal.columns.deduction') },
  ];

  const loadSheetData = useCallback(async () => {
    if (!employeeId || !year || !month) return;

    setIsLoading(true);
    try {
      const data = await salariesApi.getEmployeeDeductions(employeeId, year, month);
      setSheetData(data);
    } catch (error) {
      console.error('Error fetching deductions sheet:', error);
      toast.error(t('deductions.modal.noData'));
      setSheetData(null);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, year, month, t]);

  useEffect(() => {
    if (open) loadSheetData();
  }, [open, loadSheetData]);

  // support BOTH shapes:
  // 1) { sheet: [{date,type,time,duration_minutes,deduction_amount}] }
  // 2) { late: [{date, check_in, difference, start_shift_time}], permission_limit_minutes, total_late_deduction }
  const rows = useMemo(() => {
    if (!sheetData) return [];

    // shape (1)
    if (Array.isArray(sheetData.sheet)) {
      return sheetData.sheet.map((r, idx) => ({
        id: r?.id ?? `sheet-${idx}`,
        date: r?.date,
        type: r?.type,
        time: r?.time,
        duration_minutes: r?.duration_minutes,
        deduction_amount: r?.deduction_amount,
      }));
    }

    // shape (2)
    const late = sheetData.late ?? sheetData.data?.late;
    if (Array.isArray(late)) {
      return late.map((r, idx) => ({
        id: r?.id ?? `late-${idx}`,
        date: r?.date,
        // we don't have "type" from late api always, but your sheet UI expects Type/Time
        type: 'Check In',
        time: r?.check_in ?? '--:--',
        duration_minutes: r?.late_minutes ?? r?.difference ?? 0,
        deduction_amount: r?.deduction_amount, // may be undefined
        _raw: r,
      }));
    }

    return [];
  }, [sheetData]);

  const permissionLimit =
    sheetData?.permission_limit_minutes ?? sheetData?.data?.permission_limit_minutes ?? 0;

  const baseFileName = useMemo(() => {
    const m = `${year}-${String(month).padStart(2, '0')}`;
    return `deductions-sheet-${employeeId}-${m}`;
  }, [employeeId, year, month]);

  const title = useMemo(() => {
    const m = `${year}-${String(month).padStart(2, '0')}`;
    return `${t('deductions.modal.title')} (${employeeId}) - ${m}`;
  }, [employeeId, year, month, t]);

  const getRowsToExport = () => {
    if (!employeeId || !year || !month) {
      toast.error(t('deductions.modal.noData'));
      return [];
    }

    if (!rows || rows.length === 0) {
      toast.error(t('deductions.modal.noData'));
      return [];
    }

    return rows.map((r) => ({
      date: formatApiDate(r.date),
      type: r.type ?? '--',
      time: formatTimeTo12h(r.time),
      duration: Number(r.duration_minutes ?? 0),
      deduction_amount:
        r.deduction_amount !== null && r.deduction_amount !== undefined
          ? Number(r.deduction_amount)
          : '',
    }));
  };

  const handlePdf = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    exportToPdf({
      rows: exportRows,
      columns: DEDUCTION_SHEET_EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    exportToExcel({
      rows: exportRows,
      columns: DEDUCTION_SHEET_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    printTable({
      rows: exportRows,
      columns: DEDUCTION_SHEET_EXPORT_COLUMNS,
      title,
    });
  };

  const renderRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-28 text-center">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-400" />
              <span className="text-sm text-slate-500">{t('common.loading')}...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!rows || rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-28 text-center text-slate-500">
            {t('deductions.modal.noData')}
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((r, index) => {
      const isCheckIn = String(r?.type || '').toLowerCase().includes('in');
      const durationLabel = formatDuration(r?.duration_minutes);

      return (
        <TableRow
          key={`${r.id}-${index}`}
          className={cn('hover:bg-slate-50', index === rows.length - 1 && 'border-b-0')}
        >
          <TableCell className="px-4 text-sm text-slate-600">
            {formatApiDate(r?.date)}
          </TableCell>

          <TableCell className="px-4">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                isCheckIn ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
              )}
            >
              {r?.type ?? '--'}
            </span>
          </TableCell>

          <TableCell className="px-4 text-sm font-semibold text-error">
            {formatTimeTo12h(r?.time)}
          </TableCell>

          <TableCell className="px-4 text-sm font-semibold text-warning">
            {durationLabel}
          </TableCell>

          <TableCell className="px-4 text-sm font-semibold text-rose-600">
            {r?.deduction_amount !== null && r?.deduction_amount !== undefined
              ? `Egp ${Number(r.deduction_amount).toFixed(2)}`
              : '--'}
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl bg-white">
        {/* same header structure as IncompleteDialogTrigger */}
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="h-4 w-4" />
            </span>

            <span className="truncate">{t('deductions.modal.title')}</span>

            <span className="ml-2 shrink-0 text-sm font-medium text-slate-500">
              {year && month ? `${year}-${String(month).padStart(2, '0')}` : ''}
            </span>
          </DialogTitle>

          <div className="shrink-0 pr-8">
            <ExportDialog
              trigger={
                <Button variant="outline" size="sm" disabled={isLoading || !rows?.length}>
                  <UploadCloud className="mr-1 h-4 w-4" />
                  {t('deductions.modal.export')}
                </Button>
              }
              onPdf={handlePdf}
              onExcel={handleExcel}
              onPrintTable={handlePrint}
            />
          </div>
        </DialogHeader>

        <div className="mt-4 flex justify-end">
          <div className="rounded-xl bg-indigo-100 px-5 py-3 text-sm font-medium text-primary">
            {t('deductions.modal.permissionLimit')} : {permissionLimit} Min
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%] px-4 py-4">{t('deductions.modal.columns.date')}</TableHead>
                <TableHead className="w-[22%] px-4 py-4">{t('deductions.modal.columns.type')}</TableHead>
                <TableHead className="w-[18%] px-4 py-4">{t('deductions.modal.columns.time')}</TableHead>
                <TableHead className="w-[20%] px-4 py-4">{t('deductions.modal.columns.duration')}</TableHead>
                <TableHead className="w-[20%] px-4 py-4">{t('deductions.modal.columns.deduction')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>{renderRows()}</TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}