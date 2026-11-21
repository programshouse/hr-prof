// SheetDialogTrigger.jsx

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

import { Eye, UploadCloud, Plus, Pencil } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { useSheetsStore } from '@/stores/useSheetsStore';

import { toast } from 'sonner';

import ExportDialog from '@/components/ui/exportDialog.jsx';

import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';

import OvertimeModal from '@/features/overtime/components/OvertimeModal';

/* ================= EXPORT COLUMNS ================= */

/* ================= COMPONENT ================= */

export default function SheetDialogTrigger({ value, employeeId, month }) {
  const { t, i18n } = useTranslation();

  const formatTimeTo12h = (timeStr) => {
    if (!timeStr) return '--:--';
    const [hours, minutes] = String(timeStr).split(':');
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return timeStr;
    const isAr = i18n.language.startsWith('ar');
    const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
    const h12 = h % 12 || 12;
    return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
  };
  const [open, setOpen] = useState(false);
  
  const SHEET_EXPORT_COLUMNS = [
    { key: 'date', label: t('attendance.dialogs.date') },
    { key: 'check_in', label: t('attendance.dialogs.checkIn') },
    { key: 'check_out', label: t('attendance.dialogs.checkOut') },
  ];

  const [editingId, setEditingId] = useState(null);

  const [editValues, setEditValues] = useState({
    check_out: '',
  });

  /* ===== overtime ===== */

  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);

  const [selectedOvertime, setSelectedOvertime] = useState(null);

  const [localOvertimes, setLocalOvertimes] = useState({});

  const { sheet, isLoadingSheet, fetchAttendanceSheet, updateAttendance, deleteAttendance } =
    useSheetsStore();

  const sheetRows = sheet?.sheet || [];

  /* ================= HELPERS ================= */

  const getHoursState = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'equal';

    const [inH, inM] = checkIn.split(':').map(Number);

    const [outH, outM] = checkOut.split(':').map(Number);

    const diffMinutes = outH * 60 + outM - (inH * 60 + inM);

    if (diffMinutes <= 0) return 'equal';

    const nineHoursMinutes = 9 * 60;

    if (diffMinutes < nineHoursMinutes) return 'less';

    if (diffMinutes > nineHoursMinutes) return 'more';

    return 'equal';
  };

  const getOvertimeForDate = (date) => {
    return localOvertimes[date] || null;
  };

  /* ================= OPEN ================= */

  const handleOpenChange = async (nextOpen) => {
    setOpen(nextOpen);

    if (nextOpen && employeeId && month) {
      try {
        await fetchAttendanceSheet(employeeId, month);
      } catch {
        //
      }
    } else {
      setEditingId(null);

      setEditValues({
        check_out: '',
      });
    }
  };

  /* ================= EXPORT ================= */

  const getRowsToExport = () => {
    if (!employeeId || !month) {
      toast.error('Missing employee or month.');

      return [];
    }

    if (!sheetRows.length) {
      toast.error('No records found to export.');

      return [];
    }

    return sheetRows.map((r) => ({
      ...r,
      check_in: formatTimeTo12h(r.check_in),
      check_out: formatTimeTo12h(r.check_out),
    }));
  };

  const baseFileName = `attendance-sheet-${employeeId}-${month}`;

  const title = `Attendance Sheet (${employeeId}) - ${month}`;

  const handlePdf = () => {
    const rows = getRowsToExport();

    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: SHEET_EXPORT_COLUMNS,
      fileName: baseFileName,
      title,
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();

    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: SHEET_EXPORT_COLUMNS,
      fileName: baseFileName,
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();

    if (!rows.length) return;

    printTable({
      rows,
      columns: SHEET_EXPORT_COLUMNS,
      title,
    });
  };

  /* ================= EDIT ATTENDANCE ================= */

  const startEdit = (row) => {
    setEditingId(row.id);

    setEditValues({
      check_out: row.check_out || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setEditValues({
      check_out: '',
    });
  };

  const saveEdit = async (row) => {
    try {
      await updateAttendance(row.id, {
        check_out: editValues.check_out || row.check_out,
      });

      toast.success('Attendance updated');

      setEditingId(null);

      setEditValues({
        check_out: '',
      });

      await fetchAttendanceSheet(employeeId, month);
    } catch {
      //
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteAttendance(row.id);

      toast.success('Attendance deleted');

      await fetchAttendanceSheet(employeeId, month);
    } catch {
      //
    }
  };

  /* ================= OVERTIME ================= */

  const handleOpenOvertime = (row) => {
    const existingOvertime = getOvertimeForDate(row.date);

    if (existingOvertime?.id) {
      setSelectedOvertime(existingOvertime);
    } else {
      setSelectedOvertime({
        employee_id: employeeId,
        date: row.date,
        from: '',
        to: '',
        reason: '',
        status: 'pending',
      });
    }

    setOvertimeModalOpen(true);
  };
  const handleOvertimeSaved = (savedOvertime) => {
    if (!savedOvertime?.date) return;

    setLocalOvertimes((prev) => ({
      ...prev,
      [savedOvertime.date]: savedOvertime,
    }));

    setSelectedOvertime(savedOvertime);
  };

  /* ================= UI ================= */

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50"
          >
            <span className="text-success">{value}</span>

            <Eye className="h-4 w-4 cursor-pointer text-slate-400 opacity-70" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white overflow-x-hidden">
          <DialogHeader className="mt-3 flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {t('attendance.dialogs.title')}
            </DialogTitle>

            <ExportDialog
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!employeeId || !month || !sheetRows.length}
                  className="flex items-center gap-1.5"
                >
                  <UploadCloud className="h-4 w-4" />

                  <span>{t('attendance.dialogs.export')}</span>
                </Button>
              }
              onPdf={handlePdf}
              onExcel={handleExcel}
              onPrintTable={handlePrint}
            />
          </DialogHeader>

          <div className="mt-3 max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-100">
            {isLoadingSheet ? (
              <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                {t('attendance.dialogs.loadingSheet')}
              </div>
            ) : sheetRows.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                {t('attendance.dialogs.noRecordsFound')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('attendance.dialogs.date')}</TableHead>

                    <TableHead>{t('attendance.dialogs.checkIn')}</TableHead>

                    <TableHead>{t('attendance.dialogs.checkOut')}</TableHead>

                    <TableHead>{t('attendance.dialogs.overtime')}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sheetRows.map((row) => {
                    const isEditing = editingId === row.id;

                    const overtimeRequest = getOvertimeForDate(row.date);

                    const hasOvertime = !!overtimeRequest?.id;

                    const state = getHoursState(row.check_in, row.check_out);

                    const timeColorClass =
                      state === 'less'
                        ? 'text-error'
                        : state === 'more'
                          ? 'text-success'
                          : 'text-slate-900';

                    return (
                      <TableRow key={row.id} className="hover:bg-slate-50/70 [&>td]:py-2">
                        <TableCell className="text-xs text-slate-600">{row.date}</TableCell>

                        <TableCell className={`text-xs font-semibold ${timeColorClass}`}>
                          {formatTimeTo12h(row.check_in)}
                        </TableCell>

                        <TableCell className={`text-xs font-semibold ${timeColorClass}`}>
                          {isEditing ? (
                            <Input
                              type="time"
                              value={editValues.check_out}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  check_out: e.target.value,
                                }))
                              }
                              className="h-8"
                            />
                          ) : (
                            formatTimeTo12h(row.check_out)
                          )}
                        </TableCell>

                        {/* OVERTIME BUTTON */}

                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => handleOpenOvertime(row)}
                          >
                            {hasOvertime ? (
                              <>
                                <Pencil className="size-3.5" />
                                {t('attendance.dialogs.edit')}
                              </>
                            ) : (
                              <>
                                <Plus className="size-3.5" />
                                {t('attendance.dialogs.add')}
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* OVERTIME MODAL */}

      <OvertimeModal
        open={overtimeModalOpen}
        onOpenChange={setOvertimeModalOpen}
        overtime={selectedOvertime?.id ? selectedOvertime : null}
        defaultOvertime={selectedOvertime}
        onSaved={handleOvertimeSaved}
      />
    </>
  );
}
