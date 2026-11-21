import { useQuery } from '@tanstack/react-query';
import { positionsReportApi } from '../api/positionsReport.api';
import { positionsReportKeys } from '../api/positionsReport.keys';

export default function usePositionTurnoverQuery({
  positionId,
  from,
  to,
}) {
  return useQuery({
    queryKey: positionsReportKeys.turnover(positionId, from, to),
    queryFn: () =>
      positionsReportApi.getTurnover({ positionId, from, to }),
    enabled: !!positionId,
  });
}
