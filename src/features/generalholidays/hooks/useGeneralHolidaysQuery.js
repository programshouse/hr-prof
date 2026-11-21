import { useQuery } from '@tanstack/react-query';
import { getGeneralHolidays } from '../api/generalHolidays.api';

export function useGeneralHolidaysQuery(year) {
  return useQuery({
    queryKey: ['general-holidays', year],
    queryFn: () => getGeneralHolidays(year),
    enabled: Boolean(year),
  });
}
