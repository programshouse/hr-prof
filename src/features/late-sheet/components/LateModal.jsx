// src/features/late-sheet/components/LateModal.jsx
import React from "react";
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

import ExportDialog from "@/components/ui/exportDialog.jsx";
import { exportToExcel, exportToPdf, printTable } from "@/lib/export/tableExport.js";
import { lateSheetApi } from '../api/lateSheet.api';
import { formatMinutesDurationLong } from '@/utils/durationLabels';

export default function LateModal({ open, onOpenChange, employeeId, month }) {
  const { t } = useTranslation();

  const formatDuration = (durationStr) => {
    if (!durationStr) return '--';

    const minutesMatch = String(durationStr).match(/(\d+)/);
    if (!minutesMatch) return durationStr;

    return formatMinutesDurationLong(t, parseInt(minutesMatch[1], 10));
  };
  
  const LATE_EXPORT_COLUMNS = [
    { key: "date", label: t('lateSheet.modal.columns.date') },
    { key: "type", label: t('lateSheet.modal.columns.type') },
    { key: "time", label: t('lateSheet.modal.columns.time') },
    { key: "duration", label: t('lateSheet.modal.columns.duration') },
    { key: "deduction", label: t('lateSheet.modal.columns.deduction') },
  ];
  
  const { data: deductionsData, isLoading: isLoadingLate } = useQuery({
    queryKey: ['employee-deductions', employeeId, month],
    queryFn: () => lateSheetApi.getEmployeeDeductions(employeeId, month),
    enabled: !!(open && employeeId && month),
  });

  const getRowsToExport = () => {
    if (!employeeId || !month) {
      toast.error("Employee ID and month are required");
      return [];
    }
    if (!deductionsData?.sheet || deductionsData.sheet.length === 0) {
      toast.error("No deduction records found to export");
      return [];
    }

    // Helper function to format date from DD-MM-YYYY to dd-MM-yyyy
const formatDateForExport = (dateStr) => {
  if (!dateStr) return "--/--/----";
  // API returns "18-2-2026", we want "dd-MM-yyyy" format
  return dateStr; // Use as-is since it's already in the desired format
};

// normalize for exporting
    return deductionsData.sheet.map((r) => ({
      date: formatDateForExport(r.date),
      type: r.type || "--",
      time: r.time || "--",
      duration: formatDuration(r.duration),
      deduction: r.deduction_amount || "--",
    }));
  };

  const baseFileName = `late-${employeeId}-${month}`;
  const title = `${t('lateSheet.modal.title')} (${employeeId}) - ${month}`;

  const handlePdf = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: LATE_EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: LATE_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({
      rows,
      columns: LATE_EXPORT_COLUMNS,
      title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white">
        <DialogHeader className="mt-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold">
            {t('lateSheet.modal.title')} {month}
          </DialogTitle>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">
              {t('lateSheet.modal.permissionLimit')}: {deductionsData?.permission_limit_minutes || 0} Min
            </div>
            
            <ExportDialog
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    !employeeId || !month || !(deductionsData?.sheet?.length)
                  }
                  className="h-9 rounded-xl px-4 text-xs font-semibold"
                >
                  <UploadCloud className="mr-1.5 h-4 w-4" />
                  {t('lateSheet.modal.export')}
                </Button>
              }
              onPdf={handlePdf}
              onExcel={handleExcel}
              onPrintTable={handlePrint}
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-100">
          {isLoadingLate ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('lateSheet.modal.columns.date')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('lateSheet.modal.columns.type')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('lateSheet.modal.columns.time')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('lateSheet.modal.columns.duration')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('lateSheet.modal.columns.deduction')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {deductionsData?.sheet?.length > 0 ? (
                  deductionsData.sheet.map((record) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-slate-50/70 [&>td]:py-3"
                    >
                      <TableCell className="px-6 text-xs font-medium text-slate-700">
                        {record.date || "--/--/----"}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-medium">
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs">
                          {record.type || "--"}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 text-xs font-medium text-red-600">
                        {record.time || "--"}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-medium text-orange-600">
                        {formatDuration(record.duration)}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-medium text-slate-900">
                        {record.deduction_amount || "--"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-sm text-slate-500"
                    >
                      {t('lateSheet.modal.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
