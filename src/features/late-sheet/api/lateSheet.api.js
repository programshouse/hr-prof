import axiosClient from '@/services/http/axiosClient';

function formatDate(date) {
  if (!date) return undefined;

  if (typeof date === 'string') {
    return date.includes('T') ? date.slice(0, 10) : date;
  }

  return date.toISOString().slice(0, 10);
}

export const lateSheetApi = {
  getDeductionMinutesSummary: async ({
    month = null,
    keyword = '',
    from = null,
    to = null,
    department = '',
    branch = '',
    position = '',
    key = '',
    page = 1,
    perPage = 10,
  }) => {
    const params = {
      month: month || undefined,
      keyword: keyword || undefined,
      from: formatDate(from),
      to: formatDate(to),
      department: department && department !== 'all' ? department : undefined,
      branch: branch && branch !== 'all' ? branch : undefined,
      position: position && position !== 'all' ? position : undefined,
      Key: key || undefined,
      page: page || 1,
      limit: perPage || 10,
    };

    const response = await axiosClient.get('/deduction-minutes-summary', {
      params,
    });

    return response.data;
  },

  getLateTimeDetails: async (employee_id, month) => {
    const response = await axiosClient.post('/late-time', {
      employee_id,
      month,
    });

    return response.data;
  },

  getEmployeeDeductions: async (employeeId, month) => {
    const response = await axiosClient.get('/deductions', {
      params: {
        employee_id: employeeId,
        month,
      },
    });

    return response.data;
  },
};