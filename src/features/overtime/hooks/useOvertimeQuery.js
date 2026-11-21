import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import { overtimeKeys } from '../api/overtime.keys';

export function useOvertimeQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: overtimeKeys.list({ ...filters, page, limit }),
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

      const res = await axiosClient.get('/overtime', { params });

      // Response: { status: true, data: [...], meta: {...} }
      const { data: rows = [], meta = null } = res.data || {};

      // Build full employee names and avatar URLs
      const rowsWithEmployeeData = rows.map((ot) => {
        const applicant = ot.employee?.applicant;
        const fullName = applicant
          ? [applicant.first_name, applicant.last_name].filter(Boolean).join(' ')
          : 'Unknown Employee';

        return {
          ...ot,
          employeeName: fullName,
          avatarUrl: buildAvatarUrl(fullName, ot.employee?.image),
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

export function useOvertimeRequestQuery(id) {
  return useQuery({
    queryKey: overtimeKeys.detail(id),
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const res = await axiosClient.get(`/overtime/${id}`);
      const ot = res.data?.data || res.data;

      const applicant = ot.employee?.applicant;
      const fullName = applicant
        ? [applicant.first_name, applicant.last_name].filter(Boolean).join(' ')
        : 'Unknown Employee';

      return {
        ...ot,
        employeeName: fullName,
        avatarUrl: buildAvatarUrl(fullName, ot.employee?.image),
      };
    },
  });
}
