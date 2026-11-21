// src/features/departments/hooks/useDepartmentReportEmployeesQuery.js
import { useQuery } from '@tanstack/react-query';
import { departmentsReportApi } from '../api/departmentsReport.api';
import { departmentsReportKeys } from '../api/departmentsReport.keys';

export default function useDepartmentReportEmployeesQuery(departmentId, params = {}) {
  return useQuery({
    queryKey: departmentsReportKeys.employees(departmentId, params),
    queryFn: () => departmentsReportApi.getEmployees(departmentId, params),
    enabled: !!departmentId,
    keepPreviousData: true,
  });
}