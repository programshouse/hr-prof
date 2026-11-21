import axiosClient from '@/services/http/axiosClient';

export const commissionEmployeesListApi = {
  /**
   * GET commissions?month=YYYY-MM-DD&department&limit&keyword&page
   */
  getEmployeesList: async (params) => {
    const res = await axiosClient.get('/commissions', { params });
    return res.data; // { status, data, meta }
  },
};
