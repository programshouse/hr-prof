import axiosClient from '@/services/http/axiosClient';

export const interviewStatsApi = {
  // Get interview statistics
  getInterviewStats: async () => {
    const response = await axiosClient.get('/stats');
    return response.data;
  },
};
