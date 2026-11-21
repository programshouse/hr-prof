import { useQuery } from '@tanstack/react-query';
import { departmentsReportApi } from '../api/departmentsReport.api';
import { departmentsReportKeys } from '../api/departmentsReport.keys';

export default function useDepartmentReportAllDetailsQuery(departmentId) {
  return useQuery({
    queryKey: departmentsReportKeys.allDetails(departmentId),
    queryFn: () => departmentsReportApi.getAllDetails(departmentId),
    enabled: !!departmentId,
  });
}