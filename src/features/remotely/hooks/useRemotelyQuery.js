// src/features/remotely/hooks/useRemotelyQuery.js
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import { remotelyKeys } from '../api/remotely.keys';

export function useRemotelyQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: remotelyKeys.list({ ...filters, page, limit }),
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

      const res = await axiosClient.get('/remotely', { params });

      // Response: { status: true, data: [...], meta: {...} }
      const { data: rows = [], meta = null } = res.data || {};

      const rowsWithEmployeeData = rows.map((remotely) => {
        const applicant = remotely.employee?.applicant;
        const fullName = applicant
          ? [applicant.first_name, applicant.last_name].filter(Boolean).join(' ')
          : 'Unknown Employee';

        return {
          ...remotely,
          employeeName: fullName,
          avatarUrl: buildAvatarUrl(fullName, remotely.employee?.image),
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

export function useRemotelyDetailQuery(id) {
  return useQuery({
    queryKey: remotelyKeys.detail(id),
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const res = await axiosClient.get(`/remotely/${id}`);
      const remotely = res.data?.data || res.data;

      const applicant = remotely.employee?.applicant;
      const fullName = applicant
        ? [applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(' ')
        : 'Unknown Employee';

      return {
        ...remotely,
        employeeName: fullName,
        avatarUrl: buildAvatarUrl(fullName, remotely.employee?.image),
      };
    },
  });
}
