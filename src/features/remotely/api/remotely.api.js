// src/features/remotely/api/remotely.api.js
import axiosClient from '@/services/http/axiosClient';

export const remotelyApi = {
  getRemotelyList: async (params) => {
    const response = await axiosClient.get('/remotely', { params });
    return response.data;
  },

  getRemotely: async (id) => {
    const response = await axiosClient.get(`/remotely/${id}`);
    return response.data;
  },

  getRemotelySummary: async () => {
    const response = await axiosClient.get('/remotely-summary');
    return response.data;
  },

  createRemotely: async (values) => {
    const response = await axiosClient.post('/remotely', values);
    return response.data;
  },

  updateRemotely: async ({ id, values }) => {
    const response = await axiosClient.patch(`/remotely/${id}`, values);
    return response.data;
  },

  deleteRemotely: async (id) => {
    const response = await axiosClient.delete(`/remotely/${id}`);
    return response.data;
  },
};
