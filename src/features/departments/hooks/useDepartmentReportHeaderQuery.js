// src/features/departments/hooks/useDepartmentReportHeaderQuery.js
import { useQuery } from '@tanstack/react-query';
import { departmentsReportApi } from '../api/departmentsReport.api';
import { departmentsReportKeys } from '../api/departmentsReport.keys';

export default function useDepartmentReportHeaderQuery(departmentId) {
  return useQuery({
    queryKey: departmentsReportKeys.header(departmentId),
    queryFn: () => departmentsReportApi.getHeader(departmentId),
    enabled: !!departmentId,
  });
}
