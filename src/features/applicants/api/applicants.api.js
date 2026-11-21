import axiosClient from '@/services/http/axiosClient';

export const applicantsApi = {
  getHeader: async () => {
    const res = await axiosClient.get('/applicants-header');
    return res.data;
  },

  generateApplyLink: async (companyId, code) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const res = await axiosClient.get(`/companies/${companyId}/apply-link`, {
      params: code ? { code, apply_code: code } : undefined,
    });
    return res.data;
  },

  getAll: async (params = {}) => {
    const queryParams = {};

    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.keyword) queryParams.keyword = params.keyword;

    if (params.position_id && params.position_id !== 'all') {
      queryParams.position_id = params.position_id;
    }

    if (params.status && params.status !== 'all') {
      queryParams.status = params.status;
    }

    const res = await axiosClient.get('/applicants', {
      params: queryParams,
    });

    return res.data;
  },

  getTable: async (params = {}) => {
    const queryParams = {};

    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.keyword) queryParams.keyword = params.keyword;

    if (params.position_id && params.position_id !== 'all') {
      queryParams.position_id = params.position_id;
    }

    if (params.status && params.status !== 'all') {
      queryParams.status = params.status;
    }

    const res = await axiosClient.get('/table', {
      params: queryParams,
    });

    return res.data;
  },

  getOne: async (id) => {
    const res = await axiosClient.get(`/applicants/${id}`);
    return res.data?.data ?? res.data;
  },

  create: async (payload) => {
    const res = await axiosClient.post('/applicants', payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await axiosClient.delete(`/applicants/${id}`);
    return res.data;
  },

  assignHiring: async (id, payload) => {
    const res = await axiosClient.patch(`/applicants/${id}/assign-hiring`, payload);
    return res.data;
  },
};