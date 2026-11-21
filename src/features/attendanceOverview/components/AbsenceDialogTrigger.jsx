// AbsenceDialogTrigger.jsx
import React, { useState } from "react";
import { useSheetsStore } from "@/stores/useSheetsStore";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, UploadCloud } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

import ExportDialog from "@/components/ui/exportDialog.jsx";
import { exportToExcel, exportToPdf, printTable } from "@/lib/export/tableExport.js";

export default function AbsenceDialogTrigger({ value, employeeId, from, to }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  
  const ABSENCE_EXPORT_COLUMNS = [
    { key: "date", label: t('absenceSheet.modal.columns.date') },
    { key: "reason", label: t('absenceSheet.modal.columns.reason') },
  ];

  const { absentSheet, isLoadingAbsentSheet, fetchAbsentSheet } = useSheetsStore();

  const rows = absentSheet?.data?.rows || [];

  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);

    if (isOpen && employeeId && from && to) {
      try {
        await fetchAbsentSheet(employeeId, from, to);
      } catch {
        /* toasted in store */
      }
    }
  };

  const getRowsToExport = () => {
    if (!employeeId || !from || !to) {
      toast.error("Missing employee or date range.");
      return [];
    }
    if (!rows.length) {
      toast.error("No absence records found to export.");
      return [];
    }
    return rows;
  };

  const baseFileName = `absence-sheet-${employeeId}-${from}-to-${to}`;
  const title = `${t('absenceSheet.modal.title')} (${employeeId}) - ${from} to ${to}`;

  const handlePdf = () => {
    const data = getRowsToExport();
    if (!data.length) return;

    exportToPdf({
      rows: data,
      columns: ABSENCE_EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const data = getRowsToExport();
    if (!data.length) return;

    exportToExcel({
      rows: data,
      columns: ABSENCE_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const data = getRowsToExport();
    if (!data.length) return;

    printTable({
      rows: data,
      columns: ABSENCE_EXPORT_COLUMNS,
      title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-3 rounded-md border px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 cursor-pointer"
        >
          <span className="text-error">{value}</span>
          <Eye className="h-4 w-4 cursor-pointer text-slate-400 opacity-70" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-2xl border-slate-200 bg-white overflow-x-hidden">
        <DialogHeader className="mt-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold">
            {t('absenceSheet.modal.title')}
          </DialogTitle>

          {/* ✅ Same export flow (ExportDialog) with your same button UI */}
          <ExportDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-4 text-xs font-semibold shadow-xs"
                disabled={!employeeId || !from || !to || !rows.length}
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

        <div className="max-h-80 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('absenceSheet.modal.columns.date')}</TableHead>
                <TableHead>{t('absenceSheet.modal.columns.reason')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingAbsentSheet ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="py-4 text-center text-xs text-slate-500"
                  >
                    {t('absenceSheet.modal.loading')}
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="py-4 text-center text-xs text-slate-500"
                  >
                    {t('absenceSheet.modal.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow
                    key={row?.id ?? `${row.date}-${index}`}
                    className="[&>td]:py-2 hover:bg-slate-50/70"
                  >
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
