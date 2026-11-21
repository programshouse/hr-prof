// src/features/overtime/api/overtime.api.js
import axiosClient from '@/services/http/axiosClient';

export const overtimeApi = {
  getOvertimeRequests: async (params) => {
    const response = await axiosClient.get('/overtime', { params });
    return response.data;
  },

  getOvertimeRequest: async (id) => {
    const response = await axiosClient.get(`/overtime/${id}`);
    return response.data;
  },

  getOvertimeSummary: async () => {
    const response = await axiosClient.get('/overtime-summary');
    return response.data;
  },

  getOvertimeMinutesSummary: async (params) => {
    const response = await axiosClient.get('/overtime-minutes-summary', { params });
    return response.data;
  },

  createOvertimeRequest: async (values) => {
    const response = await axiosClient.post('/overtime', values);
    return response.data;
  },

  updateOvertimeRequest: async ({ id, values }) => {
    const response = await axiosClient.patch(`/overtime/${id}`, values);
    return response.data;
  },

  deleteOvertimeRequest: async (id) => {
    const response = await axiosClient.delete(`/overtime/${id}`);
    return response.data;
  },

  getMonthAttendanceDetails: async (employeeId, month) => {
    const params = { employee_id: employeeId, month };
    const response = await axiosClient.get('/month-attendance-details', { params });
    const body = response.data;

    if (body?.data != null && typeof body.data === 'object' && !Array.isArray(body.data)) {
      return body.data;
    }

    return body;
  },
};