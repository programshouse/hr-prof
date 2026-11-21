// src/features/departments/hooks/useDepartmentReportTurnoverQuery.js
import { useQuery } from '@tanstack/react-query';
import { departmentsReportApi } from '../api/departmentsReport.api';
import { departmentsReportKeys } from '../api/departmentsReport.keys';

export default function useDepartmentReportTurnoverQuery({ departmentId, from, to }) {
  return useQuery({
    queryKey: departmentsReportKeys.turnover(departmentId, from, to),
    queryFn: () => departmentsReportApi.getTurnover({ departmentId, from, to }),
    enabled: !!departmentId && !!from && !!to,
  });
}
