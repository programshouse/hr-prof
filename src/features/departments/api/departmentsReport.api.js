// src/features/departments/api/departmentsReport.api.js
import axiosClient from '@/services/http/axiosClient';

export const departmentsReportApi = {
  getHeader: async (departmentId) => {
    const res = await axiosClient.get(`/departments-report/${departmentId}/header`);
    return res.data; // header object
  },

  getEmployees: async (departmentId, params) => {
    // supports query params like: contract_type, position_id, shift_id, search, ...
    const res = await axiosClient.get(`/departments-report/${departmentId}/employees`, { params });
    return res.data; // { department_id, count, employees: [...] }
  },

  getTurnover: async ({ departmentId, from, to }) => {
    const res = await axiosClient.get(`/departments-report/${departmentId}/turnover`, {
      params: { from, to },
    });
    return res.data; // { status, data: { rows: [...] } }
  },

  // NEW: departments index list
  getDepartmentsList: async ({ page = 1 } = {}) => {
    const res = await axiosClient.get('/departments-list', { params: { page } });
    return res.data?.data; // pagination object (current_page, data, last_page, ...)
  },
  
  getAllDetails: async (departmentId) => {
    const res = await axiosClient.get(`/departments-report/${departmentId}/all-details`);
    return res.data;
  },
};
