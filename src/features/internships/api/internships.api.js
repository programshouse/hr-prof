import axiosClient from '@/services/http/axiosClient';

export const internshipsApi = {
  // Get all internships with pagination and filters
  getInternships: async (params = {}) => {
    const response = await axiosClient.get('/Internship', { params });
    return response.data;
  },

  // Get single internship by ID
  getInternship: async (id) => {
    const response = await axiosClient.get(`/Internship/${id}`);
    return response.data;
  },

  // Create new internship
  createInternship: async (data) => {
    const response = await axiosClient.post('/Internship', data);
    return response.data;
  },

  // Update internship
  updateInternship: async ({ id, values }) => {
    const response = await axiosClient.put(`/Internship/${id}`, values);
    return response.data;
  },

  // Delete internship
  deleteInternship: async (id) => {
    const response = await axiosClient.delete(`/Internship/${id}`);
    return response.data;
  },

  // Make internship inactive
  makeInternshipInactive: async (id) => {
    const response = await axiosClient.patch(`${id}/inactivate`);
    return response.data;
  },

  // Make internship active
  makeInternshipActive: async (id) => {
    const response = await axiosClient.patch(`${id}/activate`);
    return response.data;
  },
};
