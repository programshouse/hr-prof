import axiosClient from '@/services/http/axiosClient';

export const fingerprintIssuesApi = {
  getFingerprintIssues: async (month, year, page = 1, perPage = 20, filters = {}) => {
    const params = { page, limit: perPage };

    // month/year are optional. The employee profile/overtime modal intentionally
    // omits them so it can show all fingerprint issues for one employee. NOTE:
    // as of now the backend still requires month/year on this endpoint (main
    // FingerprintIssuesPage always sends both), so callers that need this to
    // succeed today should keep passing month/year until that changes.
    if (month) params.month = month;
    if (year) params.year = year;

    // Add filters to params if they exist and are not 'all'
    if (filters.search && filters.search.trim()) {
      params.keyword = filters.search.trim(); // Backend expects 'keyword' not 'search'
    }
    if (filters.company && filters.company !== 'all') {
      params.department_id = filters.company;
    }
    if (filters.branch && filters.branch !== 'all') {
      params.branch_id = filters.branch;
    }
    if (filters.shift && filters.shift !== 'all') {
      params.shift_id = filters.shift; // Backend expects 'shift_id' not 'shift'
    }
    if (filters.from) {
      params.from = filters.from; // yyyy-mm-dd
    }
    if (filters.to) {
      params.to = filters.to; // yyyy-mm-dd
    }
    if (filters.employee_id) {
      params.employee_id = filters.employee_id;
    }
    if (filters.employee_code) {
      params.employee_code = filters.employee_code;
    }

    const response = await axiosClient.get('/attendance/finger-print-issues', {
      params,
    });
    return response.data;
  },

  createAttendance: async (data) => {
    const response = await axiosClient.post('/attendances', data);
    return response.data;
  },

  updateAttendance: async ({ id, data }) => {
    // Make sure we have a valid ID
    if (!id) {
      throw new Error('Attendance ID is required for update');
    }

    // Use the attendance ID in the URL
    const response = await axiosClient.patch(`/attendances/${id}`, {
      ...data,
      _method: 'PATCH' // Some Laravel backends require this for PATCH requests
    });

    return response.data;
  },

  deleteAttendance: async ({ employee_id, date, delete_logs = false }) => {
    const response = await axiosClient.delete(`/attendances`, {
      data: { employee_id, date, delete_logs },
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
};
