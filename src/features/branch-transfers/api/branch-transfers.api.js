import axiosClient from '@/services/http/axiosClient';

export const branchTransfersApi = {
  getBranchTransfers: async (params) => {
    const response = await axiosClient.get('/branch-transfers', { params });
    return response.data;
  },

  getBranchTransfer: async (id) => {
    const response = await axiosClient.get(`/branch-transfers/${id}`);
    return response.data;
  },

  getBranchTransferSummary: async () => {
    const response = await axiosClient.get('/branch-transfers-summary');
    return response.data;
  },

  createBranchTransfer: async (values) => {
    const response = await axiosClient.post('/branch-transfers', values);
    return response.data;
  },

  updateBranchTransfer: async ({ id, values }) => {
    const response = await axiosClient.patch(`/branch-transfers/${id}`, values);
    return response.data;
  },

  deleteBranchTransfer: async (id) => {
    const response = await axiosClient.delete(`/branch-transfers/${id}`);
    return response.data;
  },
};
