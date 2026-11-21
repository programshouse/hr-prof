import axiosClient from '@/services/http/axiosClient';

export const kpiHeaderApi = {
  /**
   * GET:
   * - /header-kpi-stats?year=YYYY&month=MM          (ALL)
   * - /header-kpi-stats/:departmentId?year&month    (BY DEPARTMENT)
   */
  getKpiStats: async ({ departmentId, year, month }) => {
    const dep =
      departmentId !== undefined &&
      departmentId !== null &&
      String(departmentId) !== '' &&
      String(departmentId) !== 'all'
        ? String(departmentId)
        : null;

    const url = dep ? `/header-kpi-stats/${dep}` : `/header-kpi-stats`;

    const res = await axiosClient.get(url, {
      params: { year, month },
    });

    // response is: { total_employees, targeted_employees, high_performers, low_performers }
    return res.data;
  },
};
