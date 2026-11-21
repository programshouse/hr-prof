import axiosClient from '../../../services/http/axiosClient';

export const departmentApi = {
  getDepartments: async () => {
    const response = await axiosClient.get('/departments');
    return response.data;
  },

  createDepartment: async (payload) => {
    // expected payload: { name_en: string, ... }
    const response = await axiosClient.post('/departments', payload);
    return response.data;
  },

  updateDepartment: async (id, payload) => {
    // expected payload: { name_en: string, ... }
    const response = await axiosClient.put(`/departments/${id}`, payload);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await axiosClient.delete(`/departments/${id}`);
    return response.data;
  },
};
