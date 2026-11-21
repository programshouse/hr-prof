// src/features/resignations/api/resignations.api.js
import axiosClient from '@/services/http/axiosClient';

export const resignationsApi = {
  getResignations: async (params) => {
    const response = await axiosClient.get('/resignations', { params });
    return response.data;
  },

  getResignation: async (id) => {
    const response = await axiosClient.get(`/resignations/${id}`);
    return response.data;
  },

  getResignationSummary: async () => {
    const response = await axiosClient.get('/resignations-summary');
    return response.data;
  },

  //multipart
  createResignation: async (formData) => {
    const response = await axiosClient.post('/resignations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  //multipart + method override (so files work on update)
  updateResignation: async ({ id, values }) => {
    const response = await axiosClient.patch(`/resignations/${id}`, values, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteResignation: async (id) => {
    const response = await axiosClient.delete(`/resignations/${id}`);
    return response.data;
  },
};
