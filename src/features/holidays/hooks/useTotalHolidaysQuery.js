import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

export function useTotalHolidaysQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: ['total-holidays', { ...filters, page, limit }],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
        ...(filters.department ? { department: filters.department } : {}),
      };

      const res = await axiosClient.get('/total-holidays', { params });

      const { data: rows = [], meta = null } = res.data || {};

      const rowsWithEmployeeData = rows.map((holiday) => {
        const fullName =
          resolveEmployeeDisplayName(holiday.employee?.applicant) ||
          resolveEmployeeDisplayName(holiday.employee) ||
          '';

        return {
          ...holiday,
          employeeName: fullName,
          avatarUrl: buildAvatarUrl(fullName || 'Employee', holiday.employee?.image),
        };
      });

      return {
        rows: rowsWithEmployeeData,
        meta: meta || {
          current_page: page,
          per_page: limit,
          total: rows.length,
          last_page: 1,
        },
      };
    },
  });
}