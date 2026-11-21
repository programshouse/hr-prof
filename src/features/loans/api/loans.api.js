import axiosClient from '@/services/http/axiosClient';

export const loansApi = {
  getLoans: async (params) => {
    const response = await axiosClient.get('/loans', { params });
    return response.data;
  },

  getLoan: async (id) => {
    const response = await axiosClient.get(`/loans/${id}`);
    return response.data;
  },

  getLoanSummary: async () => {
    const response = await axiosClient.get('/loans-summary');
    return response.data;
  },

  createLoan: async (values) => {
    const response = await axiosClient.post('/loans', values);
    return response.data;
  },

  updateLoan: async ({ id, values }) => {
    const response = await axiosClient.patch(`/loans/${id}`, values);
    return response.data;
  },

  deleteLoan: async (id) => {
    const response = await axiosClient.delete(`/loans/${id}`);
    return response.data;
  },
};
