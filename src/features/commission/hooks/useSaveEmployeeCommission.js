import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeCommissionApi } from '../api/employeeCommission.api';
import { employeeCommissionKeys } from '../api/employeeCommission.keys';
import { commissionEmployeesListKeys } from '../api/commissionEmployeesList.keys';

export function useSaveEmployeeCommission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, month, base_amount, status, reason }) =>
      employeeCommissionApi.saveEmployeeCommission({ employeeId, month, base_amount, status, reason }),

    onSuccess: (res, vars) => {
      toast.success(res?.message || 'Commission saved successfully');

      // Refresh the employee list to update has_commission status
      qc.invalidateQueries({
        queryKey: commissionEmployeesListKeys.all,
      });

      // Refresh employee commission scores
      qc.invalidateQueries({
        queryKey: employeeCommissionKeys.scores(vars.employeeId, vars.year, vars.month),
      });

      // Refresh form data to show updated values
      qc.invalidateQueries({
        queryKey: employeeCommissionKeys.form(vars.employeeId, vars.month),
      });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save commission');
    },
  });
}
