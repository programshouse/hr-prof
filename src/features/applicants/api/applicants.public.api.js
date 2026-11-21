import publicAxiosClient from '@/services/http/publicAxiosClient';

export const applicantsPublicApi = {
  create: async (payload) => {
    const res = await publicAxiosClient.post('/applicants', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};