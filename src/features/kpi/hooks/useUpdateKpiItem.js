import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeKpiApi } from '../api/employeeKpi.api';

export function useUpdateKpiItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, kpiItemId, data }) =>
      employeeKpiApi.updateKpiItem(employeeId, kpiItemId, data),

    onSuccess: (res) => {
      toast.success(res?.message || 'KPI item updated');
      // Invalidate relevant queries if needed
      // Since this affects payroll, we might want to invalidate payroll queries too
      qc.invalidateQueries({ queryKey: ['employeePayrollSheet'] });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update KPI item');
    },
  });
}
