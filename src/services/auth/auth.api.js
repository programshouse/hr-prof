import axiosClient from '@/services/http/axiosClient';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post('/login', credentials);
    return response.data;
  },

  employeeLogin: async (credentials) => {
    const response = await axiosClient.post('/portal/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosClient.post('/logout');
    return response.data;
  },

  // refreshToken: async () => {
  //   const response = await axiosClient.post('/refresh');
  //   return response.data;
  // },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/me');
    return response.data;
  },
};
