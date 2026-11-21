import { useQuery } from '@tanstack/react-query';
import { positionsReportApi } from '../api/positionsReport.api';
import { positionsReportKeys } from '../api/positionsReport.keys';

export default function usePositionEmployeesQuery(positionId) {
  return useQuery({
    queryKey: positionsReportKeys.employees(positionId),
    queryFn: () => positionsReportApi.getEmployees(positionId),
    enabled: !!positionId,
  });
}
