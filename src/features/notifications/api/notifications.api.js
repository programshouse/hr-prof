import axiosClient from '@/services/http/axiosClient';

export const notificationsApi = {
  getNotifications: async (params = {}) => {
    const response = await axiosClient.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosClient.post(`/notifications/${id}/read`);
    return response.data;
  },
};
