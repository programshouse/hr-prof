import axiosClient from "@/services/http/axiosClient";

export const sheetsApi = {
  // ================= ATTENDANCE =================

  getAttendanceSheet: (data) =>
    axiosClient.post("/attendances-sheet", data).then((res) => res.data),

  exportAttendanceSheetPdf: ({ employee_id, month }) =>
    axiosClient
      .get("/attendance-export-pdf", {
        params: { employee_id, month },
        responseType: "blob",
      })
      .then((res) => res.data),

  updateAttendance: (id, data) =>
    axiosClient.patch(`/attendances-sheet/${id}`, data).then((res) => res.data),

  deleteAttendance: (id) =>
    axiosClient.delete(`/attendances-sheet/${id}`).then((res) => res.data),

  // ================= LATE TIME =================

  getLateTime: (data) =>
    axiosClient.post("/late-time", data).then((res) => res.data),

  exportLateTimePdf: ({ employee_id, month }) =>
    axiosClient
      .get("/late-time-export-pdf", {
        params: { employee_id, month },
        responseType: "blob",
      })
      .then((res) => res.data),

  updateLateTime: (id, data) =>
    axiosClient.patch(`/late-time/${id}`, data).then((res) => res.data),

  deleteLateTime: (id) =>
    axiosClient.delete(`/late-time/${id}`).then((res) => res.data),

  // ================= OVERTIME =================

  getOvertime: (data) =>
    axiosClient.post("/over-time", data).then((res) => res.data),

  exportOvertimePdf: ({ employee_id, month }) =>
    axiosClient
      .get("/over-time-export-pdf", {
        params: { employee_id, month },
        responseType: "blob",
      })
      .then((res) => res.data),

  updateOvertime: (id, data) =>
    axiosClient.patch(`/over-time/${id}`, data).then((res) => res.data),

  deleteOvertime: (id) =>
    axiosClient.delete(`/over-time/${id}`).then((res) => res.data),



// ========== ABSENCE ==========
getAbsentSheet: (data) =>
  axiosClient.get(`/absence-sheet/${data.employee_id}`, {
    params: {
      from: data.from,
      to: data.to
    }
  }).then((res) => res.data),

exportAbsentSheetPdf: ({ employee_id, from, to }) =>
  axiosClient
    .get("/absence-sheet/export-pdf", {
      params: { employee_id, from, to },
      responseType: "blob",
    })
    .then((res) => res.data),
};
