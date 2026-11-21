// src/features/attendanceOverview/components/WorkedHoursDialogTrigger.jsx
import React, { useMemo, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, UploadCloud, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import ExportDialog from "@/components/ui/exportDialog.jsx";
import { exportToExcel, exportToPdf, printTable } from "@/lib/export/tableExport.js";
import { useSheetsStore } from "@/stores/useSheetsStore";
import { formatMinutesDurationShort } from "@/utils/durationLabels";

export default function WorkedHoursDialogTrigger({ value, employeeId, month, children }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const WORKED_HOURS_EXPORT_COLUMNS = [
    { key: "date", label: t('attendance.dialogs.date') },
    { key: "check_in", label: t('attendance.dialogs.checkIn') },
    { key: "check_out", label: t('attendance.dialogs.checkOut') },
    { key: "duration", label: t('attendance.overviewTable.duration') },
    { key: "status", label: t('attendance.overviewTable.status') },
  ];

  const toMinutes = (hhmmss) => {
    if (!hhmmss) return null;
    const parts = String(hhmmss).split(":");
    const h = Number(parts?.[0] ?? 0);
    const m = Number(parts?.[1] ?? 0);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const formatDurationFromMinutes = (totalMinutes) => {
    if (totalMinutes === null || totalMinutes === undefined || Number.isNaN(totalMinutes)) return "--";
    if (totalMinutes <= 0) return "--";
    return formatMinutesDurationShort(t, totalMinutes);
  };

  const {
    sheet,
    isLoadingSheet,
    fetchAttendanceSheet,
  } = useSheetsStore();

  const sheetRows = useMemo(() => sheet?.sheet || [], [sheet]);

  // ✅ fetch same as SheetDialogTrigger
  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);

    if (isOpen && employeeId && month) {
      try {
        await fetchAttendanceSheet(employeeId, month);
      } catch {
        /* toasted in store */
      }
    }
  };

  // ✅ build worked hours rows from attendance rows
  const workedRows = useMemo(() => {
    return sheetRows.map((r) => {
      const inMin = toMinutes(r.check_in);
      const outMin = toMinutes(r.check_out);

      let diff = null;
      if (inMin !== null && outMin !== null) diff = outMin - inMin;

      const status =
        !r.check_in || !r.check_out
          ? t('attendance.overviewTable.incomplete')
          : diff !== null && diff > 0
          ? t('attendance.overviewTable.completed')
          : t('attendance.overviewTable.invalid');

      return {
        id: r.id,
        date: r.date,
        check_in: r.check_in ?? "--:--",
        check_out: r.check_out ?? "--:--",
        duration: diff !== null && diff > 0 ? formatDurationFromMinutes(diff) : "--",
        status,
      };
    });
  }, [sheetRows, t]);

  const getRowsToExport = () => {
    if (!employeeId || !month) {
      toast.error("Employee ID and month are required");
      return [];
    }
    if (!workedRows.length) {
      toast.error("No worked hours data available to export");
      return [];
    }

    return workedRows.map((r) => ({
      date: r.date ? format(new Date(r.date), "dd-MM-yyyy") : "--/--/----",
      check_in: r.check_in ?? "--:--",
      check_out: r.check_out ?? "--:--",
      duration: r.duration ?? "--",
      status: r.status ?? "--",
    }));
  };

  const baseFileName = `worked-hours-${employeeId}-${month}`;
  const title = `${t('attendance.overviewTable.workedHoursSheet')} (${employeeId}) - ${month}`;

  const handlePdf = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: WORKED_HOURS_EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: WORKED_HOURS_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({
      rows,
      columns: WORKED_HOURS_EXPORT_COLUMNS,
      title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-[11px] font-medium text-gray transition-colors hover:bg-slate-50"
          >
            <span className="px-1 text-xs font-semibold text-slate-700">
              {value ?? "0"}
            </span>
            <span className="mx-2 h-4 w-px bg-slate-200" />
            <span className="px-1 text-[11px] text-slate-500 tabular-nums">
              {t('common.hours')}
            </span>
            <span className="mx-2 h-4 w-px bg-slate-200" />
            <Eye className="h-4 w-4 cursor-pointer text-slate-400" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white overflow-x-hidden">
        <DialogHeader className="mt-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold">
            {t('attendance.overviewTable.workedHoursSheet')}
          </DialogTitle>

          <ExportDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingSheet || !employeeId || !month || workedRows.length === 0}
                className="h-9 rounded-xl px-4 text-xs font-semibold"
              >
                {isLoadingSheet ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-1.5 h-4 w-4" />
                )}
                {t('common.export')}
              </Button>
            }
            onPdf={handlePdf}
            onExcel={handleExcel}
            onPrintTable={handlePrint}
          />
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-100">
          {isLoadingSheet ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('attendance.dialogs.date')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('attendance.dialogs.checkIn')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('attendance.dialogs.checkOut')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('attendance.overviewTable.duration')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('attendance.overviewTable.status')}
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>
                {workedRows.length ? (
                  workedRows.map((record) => (
                    <TableRow
                      key={record.id ?? `${record.date}-${record.check_in}-${record.check_out}`}
                      className="hover:bg-slate-50/70 [&>td]:py-3"
                    >
                      <TableCell className="px-6 text-xs font-medium text-slate-700">
                        {record.date
                          ? format(new Date(record.date), "dd-MM-yyyy")
                          : "--/--/----"}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-medium text-slate-500">
                        {record.check_in}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-semibold text-slate-700">
                        {record.check_out}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-semibold text-primary">
                        {record.duration}
                      </TableCell>


                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-sm text-slate-500">
                      {t('attendance.overviewTable.noWorkedHoursData')}
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
