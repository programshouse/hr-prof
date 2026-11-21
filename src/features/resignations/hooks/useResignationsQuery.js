import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import { resignationKeys } from '../api/resignations.keys';

export function useResignationsQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: resignationKeys.list({ ...filters, page, limit }),
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

      const res = await axiosClient.get('/resignations', { params });

      const { data: rows = [], meta = null } = res.data || {};

      const rowsWithEmployeeData = rows.map((resignation) => {
        const applicant = resignation.employee?.applicant;
        const fullName = applicant
          ? [applicant.first_name, applicant.middle_name, applicant.last_name]
              .filter(Boolean)
              .join(' ')
          : 'Unknown Employee';

        return {
          ...resignation,
          employeeName: fullName,
          avatarUrl: buildAvatarUrl(fullName, resignation.employee?.image),
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

export function useResignationQuery(id) {
  return useQuery({
    queryKey: resignationKeys.detail(id),
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const res = await axiosClient.get(`/resignations/${id}`);
      const resignation = res.data?.data || res.data;

      const applicant = resignation.employee?.applicant;
      const fullName = applicant
        ? [applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Employee';

      return {
        ...resignation,
        employeeName: fullName,
        avatarUrl: buildAvatarUrl(fullName, resignation.employee?.image),
      };
    },
  });
}
