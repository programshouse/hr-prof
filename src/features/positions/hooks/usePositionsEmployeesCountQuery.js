import { useQuery } from '@tanstack/react-query';
import { positionsReportApi } from '../api/positionsReport.api';
import { positionsReportKeys } from '../api/positionsReport.keys';

export default function usePositionsEmployeesCountQuery() {
  return useQuery({
    queryKey: positionsReportKeys.list(),
    queryFn: positionsReportApi.getPositionsEmployeesCount,
  });
}
