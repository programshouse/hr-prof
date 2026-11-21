import { useQuery } from '@tanstack/react-query';
import { departmentsReportApi } from '../api/departmentsReport.api';
import { departmentsReportKeys } from '../api/departmentsReport.keys';

export default function useDepartmentsListQuery({ page = 1 } = {}) {
  return useQuery({
    queryKey: departmentsReportKeys.list(page),
    queryFn: () => departmentsReportApi.getDepartmentsList({ page }),
    keepPreviousData: true,
  });
}
