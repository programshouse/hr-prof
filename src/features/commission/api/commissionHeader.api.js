import axiosClient from '@/services/http/axiosClient';

export const commissionHeaderApi = {

  getCommissionStats: async ({ departmentId, month }) => {
    const dep =
      departmentId !== undefined &&
      departmentId !== null &&
      String(departmentId) !== '' &&
      String(departmentId) !== 'all'
        ? String(departmentId)
        : null;

    const url = dep ? `/header-commission-stats/${dep}` : `/header-commission-stats`;

    const res = await axiosClient.get(url, {
      params: { month },
    });

    // response is: { total_employees, eligible_employees, total_commission, average_commission }
    return res.data;
  },
};
