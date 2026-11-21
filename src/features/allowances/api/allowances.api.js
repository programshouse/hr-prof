import axiosClient from '@/services/http/axiosClient';

export const allowancesApi = {
  getAllowances: async (params = {}) => {
    const { data } = await axiosClient.get('/allowances', { params });
    return data;
  },

  createAllowance: async (payload) => {
    const { data } = await axiosClient.post('/allowances', payload);
    return data;
  },

  updateAllowance: async (id, payload) => {
    const { data } = await axiosClient.put(`/allowances/${id}`, payload);
    return data;
  },

  deleteAllowance: async (id) => {
    const { data } = await axiosClient.delete(`/allowances/${id}`);
    return data;
  },

  getEmployees: async (params = {}) => {
    const { data } = await axiosClient.get('/employees', {
      params: {
        page: 1,
        limit: 1000,
        ...params,
      },
    });

    return data;
  },
};
