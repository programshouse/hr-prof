import axiosClient from '@/services/http/axiosClient';

export const interviewsApi = {
  // Get all interviews with pagination and filters
  getInterviews: async (params = {}) => {
    const queryParams = {
      // ✅ pagination (adjust if backend uses pageSize)
      page: params.page ?? 1,
      pageSize: params.pageSize ?? params.per_page ?? 10,
    };

    // ✅ keyword (search)
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.search) queryParams.keyword = params.search; // backward compatibility

    // ✅ department_id (company)
    if (params.department_id && params.department_id !== 'all') {
      queryParams.department_id = params.department_id;
    }
    if (params.company && params.company !== 'all') {
      queryParams.department_id = params.company; // backward compatibility
    }

    // ✅ Ensure department_id is a number if it's a string
    if (queryParams.department_id && typeof queryParams.department_id === 'string') {
      queryParams.department_id = parseInt(queryParams.department_id, 10);
    }

    // ✅ position_id
    if (params.position_id && params.position_id !== 'all') {
      queryParams.position_id = params.position_id;
    }
    if (params.position && params.position !== 'all') {
      queryParams.position_id = params.position; // backward compatibility
    }

    // ✅ Ensure position_id is a number if it's a string
    if (queryParams.position_id && typeof queryParams.position_id === 'string') {
      queryParams.position_id = parseInt(queryParams.position_id, 10);
    }

    // ✅ level
    if (params.level && params.level !== 'all') queryParams.level = params.level;

    // ✅ type
    if (params.type && params.type !== 'all') queryParams.type = params.type;

    // ✅ status
    if (params.status && params.status !== 'all') queryParams.status = params.status;

    // ✅ applicant_id
    if (params.applicant_id && params.applicant_id !== 'all') queryParams.applicant_id = params.applicant_id;
    if (params.applicant && params.applicant !== 'all') queryParams.applicant_id = params.applicant;

    // ✅ dates (backend keys unknown from screenshot, so use from/to as common)
    // If backend needs from_date/to_date, change here only.
    if (params.from) queryParams.from = params.from instanceof Date ? params.from.toISOString().slice(0, 10) : params.from;
    if (params.to) queryParams.to = params.to instanceof Date ? params.to.toISOString().slice(0, 10) : params.to;

    // Remove empty
    Object.keys(queryParams).forEach((k) => {
      if (queryParams[k] === undefined || queryParams[k] === null || queryParams[k] === '') {
        delete queryParams[k];
      }
    });

    const response = await axiosClient.get('/interviews', { params: queryParams });
    return response.data;
  },

  getInterview: async (id) => {
    const response = await axiosClient.get(`/interviews/${id}`);
    return response.data;
  },

  createInterview: async (data) => {
    const response = await axiosClient.post('/interviews', data);
    return response.data;
  },

  updateInterview: async ({ id, values }) => {
    const response = await axiosClient.put(`/interviews/${id}`, values);
    return response.data;
  },

  deleteInterview: async (id) => {
    const response = await axiosClient.delete(`/interviews/${id}`);
    return response.data;
  },
};