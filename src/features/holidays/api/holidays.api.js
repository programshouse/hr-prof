import axiosClient from '@/services/http/axiosClient';

export const holidaysApi = {
  getHolidays: async (params) => {
    const response = await axiosClient.get('/holidays', { params });
    return response.data;
  },

  getHoliday: async (id) => {
    const response = await axiosClient.get(`/holidays/${id}`);
    return response.data;
  },

  getHolidaySummary: async () => {
    const response = await axiosClient.get('/holidays-summary');
    return response.data;
  },

  createHoliday: async (formData) => {
    const response = await axiosClient.post('/holidays', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  updateHoliday: async ({ id, values }) => {
    const response = await axiosClient.post(`/holidays/${id}`, values, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  deleteHoliday: async (id) => {
    const response = await axiosClient.delete(`/holidays/${id}`);
    return response.data;
  },

  deleteEmployeeOfficialHoliday: async ({ formal_occasion_id, employee_id }) => {
    const response = await axiosClient.delete(
      `/official-holidays/${formal_occasion_id}/employee`,
      {
        data: {
          employee_id,
        },
      }
    );

    return response.data;
  },
};