import axiosClient from '@/services/http/axiosClient';

export const employeeKpiApi = {
  // GET employees/:id/kpi-form?year=YYYY&month=M
  getEmployeeKpiForm: async ({ employeeId, year, month }) => {
    const res = await axiosClient.get(`/employees/${employeeId}/kpi-form`, {
      params: { year, month },
    });
    return res.data; // { status, data }
  },

  // NEW: GET employees/:id/kpi-scores?year=YYYY&month=M
  getEmployeeKpiScores: async ({ employeeId, year, month }) => {
    const res = await axiosClient.get(`/employees/${employeeId}/kpi-scores`, {
      params: { year, month },
    });
    return res.data; // { status, message, data: { total_score, max_total_score, percentage } }
  },

  // POST employees/:id/kpi-scores
  saveEmployeeKpiScores: async ({ employeeId, year, month, items }) => {
    const formData = new FormData();
    formData.append('year', String(year));
    formData.append('month', String(month));

    (items || []).forEach((item, idx) => {
      const isCustom = item.employee_kpi_item_id != null && item.employee_kpi_item_id !== undefined;
      const keyName = isCustom ? 'employee_kpi_item_id' : 'kpi_item_id';
      const keyValue = isCustom ? item.employee_kpi_item_id : item.kpi_item_id;
      formData.append(`scores[${idx}][${keyName}]`, String(keyValue));
      formData.append(`scores[${idx}][score]`, String(item.score ?? 0));
    });

    const res = await axiosClient.post(`/employees/${employeeId}/kpi-scores`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // IMPORTANT: your backend returns totals here
    return res.data; // { status, message, data: { total_score, max_total_score, percentage } }
  },

  resetEmployeeKpi: async ({ employeeId, year, month }) => {
    const formData = new FormData();
    formData.append('year', String(year));
    formData.append('month', String(month));

    const res = await axiosClient.post(`/reset-Kpi/${employeeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  updateKpiItem: async (employeeId, kpiItemId, data) => {
    const res = await axiosClient.patch(`/${employeeId}/kpi-items/${kpiItemId}`, data);
    return res.data;
  },

  excludeKpiItem: async (employeeId, kpiItemId) => {
    const res = await axiosClient.delete(`/${employeeId}/kpi-items/${kpiItemId}`);
    return res.data;
  },
};
