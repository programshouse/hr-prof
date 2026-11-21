// src/features/penalties/hooks/usePenaltySummaryQuery.js
import { useQuery } from '@tanstack/react-query';
import { penaltiesApi } from '../api/penalties.api';
import { penaltyKeys } from '../api/penalties.keys';

export function usePenaltySummaryQuery() {
  return useQuery({
    queryKey: [...penaltyKeys.all, 'summary'],
    queryFn: async () => {
      const response = await penaltiesApi.getPenaltySummary();

      // Response: { status: true, data: { total_penalties, penalties_employees, total_amount } }
      const data = response?.data || {};

      return {
        totalPenalties: data.total_penalties || 0,
        affectedEmployees: data.penalties_employees || 0,
        totalAmount: data.total_amount || '0.00',
      };
    },
  });
}
