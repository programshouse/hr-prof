// src/features/attendanceOverview/components/IncompleteDialogTrigger.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, UploadCloud, Loader2 } from 'lucide-react';
import { useSheetsStore } from '@/stores/useSheetsStore';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';

import ExportDialog from '@/components/ui/exportDialog.jsx';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { formatMinutesDurationLong } from '@/utils/durationLabels';

const LATE_TIME_EXPORT_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'check_in', label: 'Check In' },
  { key: 'late_minutes', label: 'Duration (min)' },
];

// ✅ formatter: 1:222222 → 1:22 ، 1:00 → 1
const formatHourMinuteClean = (val) => {
  if (!val) return '--';

  if (typeof val === 'string' && val.includes(':')) {
    const [hRaw, mRaw = ''] = val.split(':');
    const h = Number.parseInt(hRaw, 10);
    if (!Number.isFinite(h)) return val;

    const mm = mRaw.replace(/\D/g, '').slice(0, 2).padEnd(2, '0');
    if (mm === '00') return `${h}`;

    return `${h}:${mm}`;
  }

  const num = Number(val);
  if (!Number.isFinite(num)) return val;

  return num.toString();
};

function formatTimeTo12h(timeStr, language = 'en') {
  if (!timeStr) return '--:--';
  const [hours, minutes] = String(timeStr).split(':');
  const h = parseInt(hours, 10);
  if (Number.isNaN(h)) return timeStr;
  const isAr = String(language).startsWith('ar');
  const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
  const h12 = h % 12 || 12;
  return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
}

export default function IncompleteDialogTrigger({ value, duration, employeeId, month, hideText = false }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lateMinutes, setLateMinutes] = useState('');
  
  const LATE_TIME_EXPORT_COLUMNS = [
    { key: 'date', label: t('incompleteDialog.columns.date') },
    { key: 'check_in', label: t('incompleteDialog.columns.checkIn') },
    { key: 'late_minutes', label: t('incompleteDialog.columns.duration') },
  ];

  const {
    lateTimeData,
    isLoadingLateTime,
    isExportingLateTimePdf,
    fetchLateTime,
    updateLateTime,
    deleteLateTime,
  } = useSheetsStore();

  const handleOpenChange = async (open) => {
    setIsOpen(open);

    if (open && employeeId && month) {
      console.log('Fetching late time data:', { employeeId, month });
      try {
        await fetchLateTime(employeeId, month);
      } catch (e) {
        console.error('Error fetching late time data:', e);
      }
    } else {
      setEditingId(null);
      setLateMinutes('');
    }
  };

  const formatLateMinutes = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '--';
    return formatMinutesDurationLong(t, minutes);
  };

  const getRowsToExport = () => {
    if (!employeeId || !month) {
      toast.error('Employee ID and month are required');
      return [];
    }
    if (!lateTimeData || lateTimeData.length === 0) {
      toast.error('No late time records found to export');
      return [];
    }

    return lateTimeData.map((r) => ({
      date: r.date ? new Date(r.date).toLocaleDateString() : '--/--/----',
      check_in: formatTimeTo12h(r.check_in, i18n.language),
      late_minutes:
        r.late_minutes !== null && r.late_minutes !== undefined
          ? Number(r.late_minutes)
          : '',
    }));
  };

  const baseFileName = `late-time-${employeeId}-${month}`;
  const title = `${t('incompleteDialog.title')} (${employeeId}) - ${month}`;

  const handlePdf = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToPdf({ rows, columns: LATE_TIME_EXPORT_COLUMNS, fileName: baseFileName, title });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({ rows, columns: LATE_TIME_EXPORT_COLUMNS, fileName: baseFileName });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({ rows, columns: LATE_TIME_EXPORT_COLUMNS, title });
  };

  const renderRows = () => {
    if (isLoadingLateTime) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-400" />
              <span className="text-sm text-slate-500">{t('incompleteDialog.loading')}</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!lateTimeData || lateTimeData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center text-slate-500">
            {t('incompleteDialog.noRecords')}
          </TableCell>
        </TableRow>
      );
    }

    return lateTimeData.map((row) => (
      <TableRow key={`late-${row.id}`}>
        <TableCell className="px-4 text-sm text-slate-600">
          {row.date ? new Date(row.date).toLocaleDateString() : '--/--/----'}
        </TableCell>

        <TableCell className="px-4 text-sm font-semibold text-error">
          {formatTimeTo12h(row.check_in, i18n.language)}
        </TableCell>

        <TableCell className="px-4 text-sm font-semibold text-warning">
          {formatLateMinutes(row.late_minutes)}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={hideText 
            ? "inline-flex h-9 w-12 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
            : "inline-flex h-9 min-w-[11rem] items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
          }
        >
          {hideText ? (
            <Eye className="h-4 w-4 text-slate-400" />
          ) : (
            <>
              <span className="min-w-[2rem] text-center text-xs font-semibold text-slate-700 shrink-0">
                {typeof value === 'string' || typeof value === 'number' ? value : value}
              </span>

              <span className="mx-2 h-4 w-px bg-slate-300 shrink-0" />

              <span className="flex-1 whitespace-nowrap text-center text-[11px] text-slate-500">
                {formatHourMinuteClean(duration)}
              </span>

              <span className="mx-2 h-4 w-px bg-slate-300 shrink-0" />

              <Eye className="h-4 w-4 text-slate-400 shrink-0" />
            </>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl rounded-2xl bg-white overflow-x-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{t('incompleteDialog.title')}</DialogTitle>

          <ExportDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                disabled={isExportingLateTimePdf || !lateTimeData?.length}
              >
                <UploadCloud className="h-4 w-4 mr-1" />
                {t('common.export')}
              </Button>
            }
            onPdf={handlePdf}
            onExcel={handleExcel}
            onPrintTable={handlePrint}
          />
        </DialogHeader>

        <div className="mt-4 max-h-[500px] overflow-y-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('incompleteDialog.columns.date')}</TableHead>
                <TableHead>{t('incompleteDialog.columns.checkIn')}</TableHead>
                <TableHead>{t('incompleteDialog.columns.duration')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderRows()}</TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
