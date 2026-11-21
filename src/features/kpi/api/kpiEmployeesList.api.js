import axiosClient from '@/services/http/axiosClient';

export const kpiEmployeesListApi = {
  /**
   * GET employees-list?year&month&department&limit&keyword&page
   */
  getEmployeesList: async (params) => {
    const res = await axiosClient.get('/employees-list', { params });
    return res.data; // { status, data, meta }
  },
};
