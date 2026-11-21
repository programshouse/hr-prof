import axiosClient from '@/services/http/axiosClient';

export const structureApi = {
  getOrganizationStructure: async () => {
    const res = await axiosClient.get('/tree-of-employees');
    return res.data;
  },
};
