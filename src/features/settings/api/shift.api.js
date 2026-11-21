import axiosClient from '../../../services/http/axiosClient';

export const shiftApi = {
  getShifts: async () => {
    const response = await axiosClient.get('/shifts');
    return response.data;
  },

  getShift: async (id) => {
    const response = await axiosClient.get(`/shifts/${id}`);
    return response.data;
  },

  createShift: async (payload) => {
    // expected payload: { name_en, start_time, end_time, break_minutes, duration }
    const response = await axiosClient.post('/shifts', payload);
    return response.data;
  },

  updateShift: async (id, payload) => {
    // expected payload: { name_en, start_time, end_time, break_minutes, duration }
    const response = await axiosClient.patch(`/shifts/${id}`, payload);
    return response.data;
  },

  deleteShift: async (id) => {
    const response = await axiosClient.delete(`/shifts/${id}`);
    return response.data;
  },
};
