// src/features/candidates/api/candidates.api.js
import axiosClient from '@/services/http/axiosClient';

export const candidatesApi = {
  /**
   * Get candidates list
   * GET /candidates?page=&limit=&keyword=&position_id=&status=
   */
  getCandidates: async (params = {}) => {
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

    const res = await axiosClient.get('/candidates', {
      params: queryParams,
    });
    return res.data; // { status, data, meta }
  },

  /**
   * Get candidate answers
   * GET /candidates-answers/{id}
   */
  getCandidateAnswers: async (id) => {
    const res = await axiosClient.get(`/candidates-answers/${id}`);
    return res.data; // { status, applicant, data: [...] }
  },

  /**
   * Evaluate answers (HR Scoring)
   * POST /{id}/evaluate-answers
   */
  evaluateAnswers: async (id, payload) => {
    const res = await axiosClient.post(`/${id}/evaluate-answers`, payload);
    return res.data; // { status, data }
  },

  /**
   * Get evaluated answers (Comparison)
   * GET /{id}/evaluate-answers
   */
  getEvaluationAnswers: async (id) => {
    const res = await axiosClient.get(`/${id}/evaluate-answers`);
    return res.data; // { status, data }
  },
};
