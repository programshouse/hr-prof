import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { commissionApi } from '../api/commission.api';
import { commissionEmployeesListKeys } from '../api/commissionEmployeesList.keys';
import { employeeCommissionKeys } from '../api/employeeCommission.keys';

export function useResetEmployeeCommission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, month }) =>
      commissionApi.resetEmployeeCommission({ employeeId, month }),

    onSuccess: (res, vars) => {
      toast.success(res?.message || 'Commission reset successfully');

      // Refresh the employee list to update has_commission status
      qc.invalidateQueries({
        queryKey: commissionEmployeesListKeys.all,
      });

      // Refresh employee commission scores
      qc.invalidateQueries({
        queryKey: employeeCommissionKeys.scores(vars.employeeId, vars.year, vars.month),
      });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to reset commission');
    },
  });
}
