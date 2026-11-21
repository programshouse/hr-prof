// src/features/penalties/hooks/usePenaltiesQuery.js
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';

export function usePenaltiesQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: ['penalties', { ...filters, page, limit }],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
        ...(filters.department ? { department: filters.department } : {}),
        ...(filters.employee_id ? { employee_id: filters.employee_id } : {}),
      };

      const res = await axiosClient.get('/penalties', { params });

      // Response: { status: true, data: [...], meta: {...} }
      const { data: rows = [], meta = null } = res.data || {};

      // Build full employee names and avatar URLs
      const rowsWithEmployeeData = rows.map((penalty) => {
        const applicant = penalty.employee?.applicant;
        const fullName = applicant
          ? [applicant.first_name, applicant.middle_name, applicant.last_name]
              .filter(Boolean)
              .join(' ')
          : 'Unknown Employee';

        return {
          ...penalty,
          employeeName: fullName,
          avatarUrl: buildAvatarUrl(fullName, penalty.employee?.image),
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

export function usePenaltyQuery(id) {
  return useQuery({
    queryKey: ['penalty', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const res = await axiosClient.get(`/penalties/${id}`);
      const penalty = res.data?.data || res.data;

      const applicant = penalty.employee?.applicant;
      const fullName = applicant
        ? [applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Employee';

      return {
        ...penalty,
        employeeName: fullName,
        avatarUrl: buildAvatarUrl(fullName, penalty.employee?.image),
      };
    },
  });
}
