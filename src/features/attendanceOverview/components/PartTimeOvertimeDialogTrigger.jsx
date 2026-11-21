// src/features/attendanceOverview/components/PartTimeOvertimeDialogTrigger.jsx
import React, { useEffect, useMemo, useState } from "react";
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
import { exportToExcel, printTable } from "@/lib/export/tableExport.js";
import { useSheetsStore } from "@/stores/useSheetsStore";
import { formatMinutesDurationLong } from "@/utils/durationLabels";

export default function PartTimeOvertimeDialogTrigger({
  value,
  duration: _duration,
  employeeId,
  month,
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const formatTimeTo12h = (timeStr) => {
    if (!timeStr || timeStr === '--:--' || timeStr === '--') return timeStr ?? '--:--';
    const [hours, minutes] = String(timeStr).split(':');
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return timeStr;
    const isAr = i18n.language.startsWith('ar');
    const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
    const h12 = h % 12 || 12;
    return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
  };

  const PART_TIME_OVERTIME_EXPORT_COLUMNS = [
    { key: "date", label: t('attendance.dialogs.date') },
    { key: "check_in", label: t('attendance.dialogs.checkIn') },
    { key: "check_out", label: t('attendance.dialogs.checkOut') },
    { key: "overtime", label: t('attendance.dialogs.overtime') }, // API field
  ];

  const formatMinutes = (m) => {
    if (m === "" || m === null || m === undefined || isNaN(m)) return "--";
    return formatMinutesDurationLong(t, m);
  };

  const formatOvertimeTriggerValue = (v) => {
    const n = Number(v) || 0;
    const rounded = Math.round(n * 100) / 100;
    return `${rounded}${t("common.hourShort")}`;
  };
  const {
    overtimeData,
    isLoadingOvertime,
    fetchOvertime,
    exportOvertimePdf,
    isExportingOvertimePdf,
  } = useSheetsStore();

  // ✅ fetch when dialog opens
  useEffect(() => {
    if (open && employeeId && month) {
      fetchOvertime({ employee_id: employeeId, month });
    }
  }, [open, employeeId, month, fetchOvertime]);

  // ✅ normalize for UI + export (keys match API)
  const normalizedRows = useMemo(() => {
    return (overtimeData || []).map((r) => ({
      id: r.id,
      date: r.date ? format(new Date(r.date), "dd-MM-yyyy") : "--/--/----",
      check_in: formatTimeTo12h(r.check_in ?? "--:--"),
      check_out: formatTimeTo12h(r.check_out ?? "--:--"),
      overtime:
        r.overtime !== null && r.overtime !== undefined ? Number(r.overtime) : "",
    }));
  }, [overtimeData, i18n.language]);

  const getRowsToExport = () => {
    if (!employeeId || !month) {
      toast.error("Employee ID and month are required");
      return [];
    }
    if (!normalizedRows.length) {
      toast.error("No part-time overtime data found to export");
      return [];
    }
    return normalizedRows;
  };

  const baseFileName = `part-time-overtime-${employeeId}-${month}`;
  const title = `${t('attendance.overviewTable.partTimeOvertimeSheet')} (${employeeId}) - ${month}`;

  // ✅ PDF from store (same as your other dialogs)
  const handlePdf = async () => {
    if (!employeeId || !month) {
      toast.error("Employee ID and month are required");
      return;
    }

    try {
      await exportOvertimePdf(
        { employee_id: employeeId, month },
        `${baseFileName}.pdf`
      );
    } catch {
      // toasted in store
    }
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: PART_TIME_OVERTIME_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({
      rows,
      columns: PART_TIME_OVERTIME_EXPORT_COLUMNS,
      title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-medium text-gray transition-colors hover:bg-slate-50 cursor-pointer"
        >
          {/* ✅ add "h" next to number (and avoid long decimals) */}
          <span className="px-1 text-sm font-semibold text-success">
            {formatOvertimeTriggerValue(value)}
          </span>

          <span className="mx-2 h-4 w-px bg-white" />
          <Eye className="h-4 w-4 cursor-pointer text-slate-400" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white overflow-x-hidden">
        <DialogHeader className="mt-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold">
            {t('attendance.overviewTable.partTimeOvertimeSheet')}
          </DialogTitle>

          <ExportDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl px-4 text-xs font-semibold"
                disabled={
                  isLoadingOvertime ||
                  isExportingOvertimePdf ||
                  !employeeId ||
                  !month ||
                  !normalizedRows.length
                }
              >
                {isLoadingOvertime || isExportingOvertimePdf ? (
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
          {isLoadingOvertime ? (
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
                    {t('attendance.dialogs.overtime')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {normalizedRows.length ? (
                  normalizedRows.map((row) => (
                    <TableRow
                      key={row.id ?? `${row.date}-${row.check_in}-${row.check_out}`}
                      className="hover:bg-slate-50/70 [&>td]:py-3"
                    >
                      <TableCell className="px-6 text-xs font-medium text-slate-700">
                        {row.date}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-medium text-slate-500">
                        {row.check_in}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-semibold">
                        {row.check_out}
                      </TableCell>

                      <TableCell className="px-6 text-xs font-semibold text-success">
                        {formatMinutes(row.overtime)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-sm text-slate-500"
                    >
                      {t('attendance.overviewTable.noPartTimeOvertimeData')}
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
