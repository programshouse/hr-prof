import axiosClient from '@/services/http/axiosClient';

export const commissionApi = {
  resetEmployeeCommission: async ({ employeeId, month }) => {
    const res = await axiosClient.delete(`/commissions/${employeeId}/reset`, {
      data: { month },
    });

    return res.data; // { status, message, data: { employee_id, month, has_commission } }
  },

  previewCommission: async ({ employeeId, month, baseAmount }) => {
    const res = await axiosClient.post(`/commissions/${employeeId}/preview`, {
      month,
      base_amount: baseAmount,
    });

    return res.data; // { status, data: { employee_id, month, commission_percent, base_amount, computed_amount, has_commission } }
  },
};
