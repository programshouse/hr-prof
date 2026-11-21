import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';
import { holidaysKeys } from '../api/holidays.keys';

export function useHolidaysQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: holidaysKeys.list({ ...filters, page, limit }),
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
        ...(filters.department ? { department: filters.department } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      };

      const res = await axiosClient.get('/holidays', { params });

      // Response: { status: true, data: [...], meta: {...} }
      const { data: rows = [], meta = null } = res.data || {};

      // Build full employee names and avatar URLs
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

export function useHolidayQuery(id) {
  return useQuery({
    queryKey: holidaysKeys.detail(id),
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const res = await axiosClient.get(`/holidays/${id}`);
      const holiday = res.data?.data || res.data;

      const fullName =
        resolveEmployeeDisplayName(holiday.employee?.applicant) ||
        resolveEmployeeDisplayName(holiday.employee) ||
        '';

      return {
        ...holiday,
        employeeName: fullName,
        avatarUrl: buildAvatarUrl(fullName || 'Employee', holiday.employee?.image),
      };
    },
  });
}
