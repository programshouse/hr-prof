import { useQuery } from '@tanstack/react-query';
import { positionsReportApi } from '../api/positionsReport.api';
import { positionsReportKeys } from '../api/positionsReport.keys';

export default function usePositionHeaderQuery(positionId) {
  return useQuery({
    queryKey: positionsReportKeys.header(positionId),
    queryFn: () => positionsReportApi.getHeader(positionId),
    enabled: !!positionId,
  });
}
