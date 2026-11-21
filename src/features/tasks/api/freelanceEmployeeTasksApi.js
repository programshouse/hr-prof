import axiosClient from '@/services/http/axiosClient';

export const freelanceEmployeeTasksApi = {
  getTasks: async (params = {}) => {
    const { data } = await axiosClient.get('/freelance-employee-tasks', { params });
    return data;
  },

  getTask: async (id) => {
    const { data } = await axiosClient.get(`/freelance-employee-tasks/${id}`);
    return data;
  },

  createTask: async (payload) => {
    const { data } = await axiosClient.post('/freelance-employee-tasks', payload);
    return data;
  },

  updateTask: async (id, payload) => {
    const { data } = await axiosClient.put(`/freelance-employee-tasks/${id}`, payload);
    return data;
  },

  deleteTask: async (id) => {
    const { data } = await axiosClient.delete(`/freelance-employee-tasks/${id}`);
    return data;
  },
};
