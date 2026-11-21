// src/features/setting/api/salary-method.api.js
import axiosClient from '@/services/http/axiosClient';

export const salaryMethodApi = {
  getSalaryMethods: async () => {
    const response = await axiosClient.get('/salary-methods');
    return response.data;
  },

  getSalaryMethod: async (id) => {
    const response = await axiosClient.get(`/salary-methods/${id}`);
    return response.data;
  },

  createSalaryMethod: async (payload) => {
    // expected payload: { name: string }
    const response = await axiosClient.post('/salary-methods', payload);
    return response.data;
  },

  updateSalaryMethod: async (id, payload) => {
    // expected payload: { name: string }
    const response = await axiosClient.patch(`/salary-methods/${id}`, payload);
    return response.data;
  },

  deleteSalaryMethod: async (id) => {
    const response = await axiosClient.delete(`/salary-methods/${id}`);
    return response.data;
  },
};