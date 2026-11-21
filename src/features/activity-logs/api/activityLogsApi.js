import axiosClient from '@/services/http/axiosClient';

export const activityLogsApi = {
  async getActivityLogs(params = {}) {
    const res = await axiosClient.get('/activity-logs', { params });

    const payload = res.data || {};

    return {
      rows: payload.data || [],
      meta: payload.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: (payload.data || []).length,
      },
    };
  },
};