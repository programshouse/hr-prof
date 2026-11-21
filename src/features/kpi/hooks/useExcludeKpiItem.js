import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeKpiApi } from '../api/employeeKpi.api';

export function useExcludeKpiItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, kpiItemId }) => employeeKpiApi.excludeKpiItem(employeeId, kpiItemId),

    onSuccess: (res) => {
      toast.success(res?.message || 'KPI item excluded');
      qc.invalidateQueries({ queryKey: ['employeePayrollSheet'] });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to exclude KPI item');
    },
  });
}
