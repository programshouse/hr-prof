import axiosClient from '@/services/http/axiosClient';

export const dashboardApi = {
  getHomeHeader: async () => {
    const response = await axiosClient.get('/home-header');
    return response.data;
  },

  getGraph: async () => {
    const response = await axiosClient.get('/graph');
    return response.data;
  },

  getDeptCounts: async () => {
    const response = await axiosClient.get('/home/count-department');
    return response.data;
  },

  getExpiringContracts: async (params = {}) => {
    const response = await axiosClient.get('/employees/expiring-contracts', { params });
    return response.data;
  },

  getExpiringNationalIds: async (params = {}) => {
    const response = await axiosClient.get('/employees/expiring-national-ids', { params });
    return response.data;
  },

  getEmployeeTrend: async (year) => {
    const response = await axiosClient.get(`/active-employees/count/${year}`);
    return response.data;
  },
};
