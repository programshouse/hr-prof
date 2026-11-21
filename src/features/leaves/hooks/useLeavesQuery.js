// src/features/leaves/hooks/useLeavesQuery.js
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';

export function useLeavesQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: ['leaves', { ...filters, page, limit }],
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

      const res = await axiosClient.get('/leaves', { params });

      // Response: { status: true, data: [...], meta: {...} }
      const { data: rows = [], meta = null } = res.data || {};

      // Build full employee names and avatar URLs
      const rowsWithEmployeeData = rows.map((leave) => {
        const applicant = leave.employee?.applicant;
        const fullName = applicant
          ? [applicant.first_name, applicant.last_name].filter(Boolean).join(' ')
          : 'Unknown Employee';

        const replacedApplicant = leave.replaced_employee?.applicant;
        const replacedFullName = replacedApplicant
          ? [replacedApplicant.first_name, replacedApplicant.last_name].filter(Boolean).join(' ')
          : null;

        return {
          ...leave,
          employeeName: fullName,
          avatarUrl: buildAvatarUrl(fullName, leave.employee?.image),
          replacedEmployeeName: replacedFullName,
          replacedAvatarUrl: replacedFullName
            ? buildAvatarUrl(replacedFullName, leave.replaced_employee?.image)
            : null,
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

export function useLeaveQuery(id) {
  return useQuery({
    queryKey: ['leave', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const res = await axiosClient.get(`/leaves/${id}`);
      const leave = res.data?.data || res.data;

      const applicant = leave.employee?.applicant;
      const fullName = applicant
        ? [applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Employee';

      return {
        ...leave,
        employeeName: fullName,
        avatarUrl: buildAvatarUrl(fullName, leave.employee?.image),
      };
    },
  });
}
