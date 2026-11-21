import axiosClient from '@/services/http/axiosClient';
import publicAxiosClient from '@/services/http/publicAxiosClient';

export const jobsApi = {
  // GET /interview-sections?position_id={positionId}
  getSections: async (positionId) => {
    const res = await axiosClient.get('/interview-sections', {
      params: { position_id: positionId },
    });
    return res.data; // { status, data: [...] }
  },

  // POST /interview-sections
  // req: position_ids[], name_ar, name_en
  createSection: async (data) => {
    const res = await axiosClient.post('/interview-sections', data);
    return res.data;
  },

  // PUT /interview-sections/{id}
  // req: position_ids[], name_ar, name_en
  updateSection: async (id, data) => {
    const res = await axiosClient.put(`/interview-sections/${id}`, data);
    return res.data;
  },

  // DELETE /interview-sections/{id}
  deleteSection: async (id) => {
    const res = await axiosClient.delete(`/interview-sections/${id}`);
    return res.data;
  },

  // GET /interview-questions?section_id={sectionId}
  getQuestions: async (sectionId) => {
    const res = await axiosClient.get('/interview-questions', {
      params: { section_id: sectionId },
    });
    return res.data; // { status, data: [...] }
  },

  // POST /interview-questions
  createQuestion: async (data) => {
    const res = await axiosClient.post('/interview-questions', data);
    return res.data;
  },

  // PUT /interview-questions/{id}
  updateQuestion: async (id, data) => {
    const res = await axiosClient.put(`/interview-questions/${id}`, data);
    return res.data;
  },

  // DELETE /interview-questions/{id}
  deleteQuestion: async (id) => {
    const res = await axiosClient.delete(`/interview-questions/${id}`);
    return res.data;
  },

  getPublicForm: async (positionId, companyId) => {
    const res = await publicAxiosClient.get('/public-form', {
      params: { position_id: positionId, ...(companyId ? { company_id: companyId } : {}) },
    });
    return res.data;
  },

  submitCandidateAnswers: async (payload) => {
    const res = await publicAxiosClient.post('/candidates/answers', payload);
    return res.data;
  },
};
