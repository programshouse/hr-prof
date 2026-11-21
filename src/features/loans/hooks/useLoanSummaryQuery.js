import { useQuery } from '@tanstack/react-query';
import { loansApi } from '../api/loans.api';
import { loansKeys } from '../api/loans.keys';

export function useLoanSummaryQuery() {
  return useQuery({
    queryKey: loansKeys.summary(),
    queryFn: async () => {
      const response = await loansApi.getLoanSummary();

      // Response: { total_loans, totalEmployees, total_amount, pending_loans }
      const data = response?.data || response || {};

      return {
        totalLoans: data.total_loans || 0,
        totalEmployees: data.employees_have_loans || 0,
        totalAmount: data.total_amount || '0.00',
        pendingLoans: data.pending_loans || 0,
      };
    },
  });
}
