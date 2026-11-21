// src/features/leaves/api/leaves.api.js
import axiosClient from '@/services/http/axiosClient';

export const leavesApi = {
  getLeaves: async (params) => {
    const response = await axiosClient.get('/leaves', { params });
    return response.data;
  },

  getLeave: async (id) => {
    const response = await axiosClient.get(`/leaves/${id}`);
    return response.data;
  },

  getLeaveSummary: async () => {
    const response = await axiosClient.get('/leaves-summary');
    return response.data;
  },

  createLeave: async (values) => {
    const response = await axiosClient.post('/leaves', values);
    return response.data;
  },

  updateLeave: async ({ id, values }) => {
    const response = await axiosClient.patch(`/leaves/${id}`, values);
    return response.data;
  },

  
  deleteLeave: async (id) => {
    const response = await axiosClient.delete(`/leaves/${id}`);
    return response.data;
  },
};
