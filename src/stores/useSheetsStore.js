// src/stores/useSheetsStore.jsx
import { create } from "zustand";
import { toast } from "sonner";
import { sheetsApi } from "@/features/attendanceOverview/api/sheets.api";

// Translation function - will be initialized when needed
let t = null;
export const setTranslationFunction = (translationFn) => {
  t = translationFn;
};

export const useSheetsStore = create((set, _get) => ({
  /* ========== Attendance Sheet ========== */
  sheet: null,
  isLoadingSheet: false,
  isExportingPdf: false,

  /* ========== Absence Sheet ========== */
  absentSheet: null,
  isLoadingAbsentSheet: false,
  isExportingAbsentPdf: false,

  /* ========== Late Time ========== */
  lateTimeData: [],
  isLoadingLateTime: false,
  isExportingLateTimePdf: false,

  /* ========== Overtime ========== */
  overtimeData: [],
  isLoadingOvertime: false,
  isExportingOvertimePdf: false,
  isUpdatingOvertime: false,

  // ================= ATTENDANCE =================
  fetchAttendanceSheet: async (employee_id, month) => {
    if (!employee_id || !month) return;

    set({ isLoadingSheet: true });

    try {
      const data = await sheetsApi.getAttendanceSheet({
        employee_id: Number(employee_id),
        month: String(month),
      });

      set({ sheet: data });
      return data;
    } catch (err) {
      console.error("fetchAttendanceSheet error:", err);
      toast.error(t ? t('messages.error.loadAttendanceSheetFailed') : "Failed to load attendance sheet");
    } finally {
      set({ isLoadingSheet: false });
    }
  },
  exportAttendanceSheetPdf: async (employee_id, month, fileName) => {
    if (!employee_id || !month) return;

    set({ isExportingPdf: true });

    try {
      const blob = await sheetsApi.exportAttendanceSheetPdf({
        employee_id,
        month,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        fileName || `attendance-sheet-${employee_id}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t ? t('messages.success.exported') : "Exported successfully");
    } catch (err) {
      console.error("exportAttendanceSheetPdf error:", err);
      toast.error(t ? t('messages.error.exportAttendanceSheetFailed') : "Failed to export attendance sheet");
    } finally {
      set({ isExportingPdf: false });
    }
  },
  updateAttendance: async (id, payload) => {
    try {
      const data = await sheetsApi.updateAttendance(id, payload);
      toast.success(t ? t('messages.success.attendanceUpdated') : "Attendance updated");
      return data;
    } catch (err) {
      console.error("updateAttendance error:", err);
      toast.error(t ? t('messages.error.updateAttendanceFailed') : "Failed to update attendance");
      throw err;
    }
  },
  deleteAttendance: async (id) => {
    try {
      const data = await sheetsApi.deleteAttendance(id);
      toast.success(t ? t('messages.success.attendanceDeleted') : "Attendance deleted");
      return data;
    } catch (err) {
      console.error("deleteAttendance error:", err);
      toast.error(t ? t('messages.error.deleteAttendanceFailed') : "Failed to delete attendance");
      throw err;
    }
  },

  /* ========== ABSENTS ========== */
  fetchAbsentSheet: async (employee_id, from, to) => {
    if (!employee_id || !from || !to) return;

    set({ isLoadingAbsentSheet: true });

    try {
      const data = await sheetsApi.getAbsentSheet({
        employee_id: Number(employee_id),
        from: String(from),
        to: String(to),
      });
      set({ absentSheet: data });
      return data;
    } catch (err) {
      console.error("fetchAbsentSheet error:", err);
      toast.error(t ? t('messages.error.loadAbsentSheetFailed') : "Failed to load absence sheet");
    } finally {
      set({ isLoadingAbsentSheet: false });
    }
  },

  exportAbsentSheetPdf: async (employee_id, from, to, fileName) => {
    if (!employee_id || !from || !to) return;

    set({ isExportingAbsentPdf: true });

    try {
      const blob = await sheetsApi.exportAbsentSheetPdf({
        employee_id,
        from,
        to,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        fileName || `absence-sheet-${employee_id}-${from}-to-${to}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t ? t('messages.success.exported') : "Exported successfully");
    } catch (err) {
      console.error("exportAbsentSheetPdf error:", err);
      toast.error(t ? t('messages.error.exportAbsentSheetFailed') : "Failed to export absence sheet");
    } finally {
      set({ isExportingAbsentPdf: false });
    }
  },

  // ================= LATE TIME =================
fetchLateTime: async (employee_id, month) => {
  if (!employee_id || !month) return;
  set({ isLoadingLateTime: true });

  try {
    console.log('API call to /late-time with:', { employee_id, month });
    const data = await sheetsApi.getLateTime({ employee_id, month });
    console.log('API response:', data);

    const normalized = (data.late || []).map((item) => ({
      ...item,
      shift_time:
        item.shift_time !== undefined && item.shift_time !== null
          ? item.shift_time
          : item.start_shift_time ?? null,
      late_minutes:
        item.late_minutes !== undefined && item.late_minutes !== null
          ? item.late_minutes
          : item.difference ?? null,
    }));

    console.log('Normalized data:', normalized);
    set({ lateTimeData: normalized });
    return data;
  } catch (err) {
    console.error("fetchLateTime error:", err);
    toast.error(t ? t('messages.error.loadLateTimeFailed') : "Failed to fetch late time");
  } finally {
    set({ isLoadingLateTime: false });
  }
},


  exportLateTimePdf: async (employee_id, month) => {
    if (!employee_id || !month) return;

    set({ isExportingLateTimePdf: true });

    try {
      const blob = await sheetsApi.exportLateTimePdf({ employee_id, month });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `late-time-${employee_id}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t ? t('messages.success.exported') : "Exported successfully");
    } catch (err) {
      console.error("exportLateTimePdf error:", err);
      toast.error(t ? t('messages.error.exportLateTimeFailed') : "Failed to export late time report");
    } finally {
      set({ isExportingLateTimePdf: false });
    }
  },

  updateLateTime: async (id, payload) => {
    try {
      const data = await sheetsApi.updateLateTime(id, payload);
      toast.success(t ? t('messages.success.lateTimeUpdated') : "Late time updated");
      return data;
    } catch (err) {
      console.error("updateLateTime error:", err);
      toast.error(t ? t('messages.error.updateLateTimeFailed') : "Failed to update late time");
      throw err;
    }
  },

  deleteLateTime: async (id) => {
    try {
      const data = await sheetsApi.deleteLateTime(id);
      toast.success(t ? t('messages.success.lateTimeDeleted') : "Late time deleted");
      return data;
    } catch (err) {
      console.error("deleteLateTime error:", err);
      toast.error(t ? t('messages.error.deleteLateTimeFailed') : "Failed to delete late time");
      throw err;
    }
  },

  // ================= OVERTIME =================
fetchOvertime: async (params = {}) => {
  set({ isLoadingOvertime: true });

  try {
    const data = await sheetsApi.getOvertime(params);

    const normalized = (data.overtime || []).map((item) => ({
      ...item,
      overtime_minutes:
        item.overtime_minutes !== undefined && item.overtime_minutes !== null
          ? item.overtime_minutes
          : item.overtime !== undefined && item.overtime !== null
          ? item.overtime
          : null,
    }));

    set({ overtimeData: normalized });
    return data;
  } catch (err) {
    console.error("fetchOvertime error:", err);
    toast.error(t ? t('messages.error.loadOvertimeFailed') : "Failed to load overtime data");
  } finally {
    set({ isLoadingOvertime: false });
  }
},


  exportOvertimePdf: async (params, fileName = "overtime-report.pdf") => {
    set({ isExportingOvertimePdf: true });

    try {
      const blob = await sheetsApi.exportOvertimePdf(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t ? t('messages.success.exported') : "Exported successfully");
    } catch (err) {
      console.error("exportOvertimePdf error:", err);
      toast.error(t ? t('messages.error.exportOvertimeFailed') : "Failed to export overtime PDF");
    } finally {
      set({ isExportingOvertimePdf: false });
    }
  },

  updateOvertime: async (id, payload) => {
    set({ isUpdatingOvertime: true });
    try {
      const data = await sheetsApi.updateOvertime(id, payload);
      toast.success(t ? t('messages.success.overtimeUpdated') : "Overtime updated");
      return data;
    } catch (err) {
      console.error("updateOvertime error:", err);
      toast.error(t ? t('messages.error.updateOvertimeFailed') : "Failed to update overtime");
      throw err;
    } finally {
      set({ isUpdatingOvertime: false });
    }
  },

  deleteOvertime: async (id) => {
    try {
      const data = await sheetsApi.deleteOvertime(id);
      toast.success(t ? t('messages.success.overtimeDeleted') : "Overtime deleted");
      return data;
    } catch (err) {
      console.error("deleteOvertime error:", err);
      toast.error(t ? t('messages.error.deleteOvertimeFailed') : "Failed to delete overtime");
      throw err;
    }
  },
}));
