import axiosClient from '@/services/http/axiosClient';

export const applicantsApi = {
  // Get all applicants
  getApplicants: async () => {
    const response = await axiosClient.get('/applicants');
    return response.data;
  },
};
