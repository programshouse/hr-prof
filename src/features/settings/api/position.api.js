import axiosClient from "@/services/http/axiosClient";

export const positionApi = {
  getPositions: async () => {
    const response = await axiosClient.get('/positions');
    return response.data;
  },

  createPosition: async (payload) => {
    // expected payload: { name_en: string, ... }
    const response = await axiosClient.post('/positions', payload);
    return response.data;
  },

  updatePosition: async (id, payload) => {
    // expected payload: { name_en: string, ... }
    const response = await axiosClient.put(`/positions/${id}`, payload);
    return response.data;
  },

  deletePosition: async (id) => {
    const response = await axiosClient.delete(`/positions/${id}`);
    return response.data;
  },
};
