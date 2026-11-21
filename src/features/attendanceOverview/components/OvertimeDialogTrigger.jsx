// src/features/attendanceOverview/components/OvertimeDialogTrigger.jsx
import React, { useState, useEffect } from "react";
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
import { Eye, Pen, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSheetsStore } from "@/stores/useSheetsStore";
import { format } from "date-fns";
import { toast } from "sonner";

import ExportDialog from "@/components/ui/exportDialog.jsx";
import { exportToExcel, exportToPdf, printTable } from "@/lib/export/tableExport.js";
import { formatMinutesDurationLong } from "@/utils/durationLabels";

export default function OvertimeDialogTrigger({ value, duration, employeeId, month }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [overtimeMinutes, setOvertimeMinutes] = useState("");
  
  const OVERTIME_EXPORT_COLUMNS = [
    { key: "date", label: t('overtimeDialog.columns.date') },
    { key: "check_in", label: t('overtimeDialog.columns.departureTime') },
    { key: "check_out", label: t('overtimeDialog.columns.checkOutTime') },
    { key: "overtime_minutes", label: t('overtimeDialog.columns.overtime') },
  ];

  const {
    overtimeData,
    isLoadingOvertime,
    fetchOvertime,
    updateOvertime,
    deleteOvertime,
    isExportingOvertimePdf, // keep using it for UI loading if you want (or remove if not needed)
  } = useSheetsStore();

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = String(timeString).split(":");
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return "--:--";
    const isAr = i18n.language.startsWith("ar");
    const suffix = h >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
    const h12 = h % 12 || 12;
    return `${h12}:${minutes ?? "00"} ${suffix}`;
  };

  const formatOvertimeMinutes = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return "--";
    return formatMinutesDurationLong(t, minutes);
  };

  useEffect(() => {
    if (open && employeeId && month) {
      fetchOvertime({ employee_id: employeeId, month });
    }
  }, [open, employeeId, month, fetchOvertime]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingId(null);
      setOvertimeMinutes("");
    }
  };

  const getRowsToExport = () => {
    if (!employeeId || !month) {
      toast.error("Employee ID and month are required");
      return [];
    }
    if (!overtimeData || overtimeData.length === 0) {
      toast.error("No overtime records found to export");
      return [];
    }

    // normalize for exporting
    return overtimeData.map((r) => ({
      date: r.date ? format(new Date(r.date), "dd-MM-yyyy") : "--/--/----",
      check_in: formatTime(r.check_in),
      check_out: formatTime(r.check_out),
      overtime_minutes:
        r.overtime_minutes !== null && r.overtime_minutes !== undefined
          ? Number(r.overtime_minutes)
          : "",
    }));
  };

  const baseFileName = `overtime-${employeeId}-${month}`;
  const title = `${t('overtimeDialog.title')} (${employeeId}) - ${month}`;

  const handlePdf = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: OVERTIME_EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: OVERTIME_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({
      rows,
      columns: OVERTIME_EXPORT_COLUMNS,
      title,
    });
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setOvertimeMinutes(
      record.overtime_minutes !== null && record.overtime_minutes !== undefined
        ? String(record.overtime_minutes)
        : ""
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setOvertimeMinutes("");
  };

  const saveEdit = async (record) => {
    if (overtimeMinutes === "") {
      toast.error("Please enter overtime minutes");
      return;
    }

    try {
      await updateOvertime(record.id, {
        overtime_minutes: parseInt(overtimeMinutes, 10),
      });
      toast.success("Overtime updated");
      setEditingId(null);
      setOvertimeMinutes("");
      await fetchOvertime({ employee_id: employeeId, month });
    } catch {
      /* toasted in store */
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteOvertime(record.id);
      toast.success("Overtime deleted");
      await fetchOvertime({ employee_id: employeeId, month });
    } catch {
      /* toasted in store */
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 min-w-[11rem] items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-[11px] font-medium text-gray transition-colors hover:bg-slate-50 cursor-pointer"
        >
          <span className="min-w-[2rem] text-center text-xs font-semibold text-slate-700 shrink-0">
            {value}
          </span>

          <span className="mx-2 h-4 w-px bg-slate-300 shrink-0" />

          <span className="flex-1 whitespace-nowrap text-center text-[11px] text-slate-500 tabular-nums">
            {duration}
          </span>

          <span className="mx-2 h-4 w-px bg-slate-300 shrink-0" />

          <Eye className="h-4 w-4 shrink-0 cursor-pointer text-slate-400" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white overflow-x-hidden">
        <DialogHeader className="mt-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold">
            {t('overtimeDialog.title')}
          </DialogTitle>

          {/* ✅ same export way */}
          <ExportDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  isExportingOvertimePdf || !employeeId || !month || !(overtimeData?.length)
                }
                className="h-9 rounded-xl px-4 text-xs font-semibold"
              >
                {isExportingOvertimePdf ? (
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
                    {t('overtimeDialog.columns.date')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('overtimeDialog.columns.departureTime')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('overtimeDialog.columns.checkOutTime')}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium text-slate-500">
                    {t('overtimeDialog.columns.overtime')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {overtimeData?.length > 0 ? (
                  overtimeData.map((record) => {
                    const isEditing = editingId === record.id;

                    return (
                      <TableRow
                        key={record.id}
                        className="hover:bg-slate-50/70 [&>td]:py-3"
                      >
                        <TableCell className="px-6 text-xs font-medium text-slate-700">
                          {record.date
                            ? format(new Date(record.date), "dd-MM-yyyy")
                            : "--/--/----"}
                        </TableCell>

                        <TableCell className="px-6 text-xs font-medium text-slate-500">
                          {formatTime(record.check_in)}
                        </TableCell>

                        <TableCell className="px-6 text-xs font-semibold text-success">
                          {formatTime(record.check_out)}
                        </TableCell>

                        <TableCell className="px-6 text-xs font-semibold text-warning">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={overtimeMinutes}
                              onChange={(e) => setOvertimeMinutes(e.target.value)}
                              className="h-8 w-24 text-xs"
                              min="0"
                            />
                          ) : record.overtime_minutes !== null &&
                            record.overtime_minutes !== undefined ? (
                            formatOvertimeMinutes(record.overtime_minutes)
                          ) : (
                            "--"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-sm text-slate-500"
                    >
                      {t('overtimeDialog.noRecords')}
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
