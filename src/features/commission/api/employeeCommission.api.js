import axiosClient from '@/services/http/axiosClient';

export const employeeCommissionApi = {
  // GET commissions?month=YYYY-MM-DD&employee_id=ID
  getEmployeeCommissionForm: async ({ employeeId, month }) => {
    const res = await axiosClient.get('/commissions', {
      params: { month, employee_id: employeeId },
    });
    return res.data; // { status, data }
  },

  // GET commissions?month=YYYY-MM-DD&employee_id=ID  
  getEmployeeCommissionScores: async ({ employeeId, month }) => {
    const res = await axiosClient.get('/commissions', {
      params: { month, employee_id: employeeId },
    });
    return res.data; // { status, message, data: { total_commission } }
  },

  // POST commissions/:id/save
  saveEmployeeCommission: async ({ employeeId, month, base_amount, status, reason }) => {
    const res = await axiosClient.post(`/commissions/${employeeId}/save`, {
      month,
      base_amount,
      status,
      reason,
    });

    return res.data; // { status, message, data: { employee_id, month, commission_percent, base_amount, amount, has_commission } }
  },

  resetEmployeeCommission: async ({ employeeId, month }) => {
    const formData = new FormData();
    formData.append('month', month);

    const res = await axiosClient.post(`/reset-commission/${employeeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },

  updateCommissionItem: async (employeeId, commissionItemId, data) => {
    const res = await axiosClient.patch(`/${employeeId}/commission-items/${commissionItemId}`, data);
    return res.data;
  },

  excludeCommissionItem: async (employeeId, commissionItemId) => {
    const res = await axiosClient.delete(`/${employeeId}/commission-items/${commissionItemId}`);
    return res.data;
  },
};
