import axiosClient from '@/services/http/axiosClient';

export const insuranceEmployeesApi = {
  getList: async (params = {}) => {
    const response = await axiosClient.get('/insured-employees', {
      params,
    });

    const result = response.data ?? {};

    return {
      status: result.status ?? false,
      rows: Array.isArray(result.data) ? result.data : [],
      totalInsuranceAmount:
        Number(result.total_insurance_amount) || 0,
      meta: result.meta ?? {},
    };
  },
};