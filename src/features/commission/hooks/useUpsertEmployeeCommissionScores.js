import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeeCommissionApi } from '../api/employeeCommission.api';
import { employeeCommissionKeys } from '../api/employeeCommission.keys';

export function useUpsertEmployeeCommissionScores() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, year, month, items }) =>
      employeeCommissionApi.saveEmployeeCommissionScores({ employeeId, year, month, items }),

    onSuccess: (res, vars) => {
      toast.success(res?.message || 'Saved successfully');

      // refresh the form after save
      qc.invalidateQueries({
        queryKey: employeeCommissionKeys.form(vars.employeeId, vars.year, vars.month),
      });

      // update scores query immediately (so UI updates on click Save)
      qc.setQueryData(employeeCommissionKeys.scores(vars.employeeId, vars.year, vars.month), (old) => {
        // keep same response shape: { status, message, data: {...} }
        return {
          ...(old || {}),
          ...(res || {}),
          data: res?.data ?? old?.data,
        };
      });

      // also refetch scores so when you leave/enter it's correct
      qc.invalidateQueries({
        queryKey: employeeCommissionKeys.scores(vars.employeeId, vars.year, vars.month),
      });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save commission scores');
    },
  });
}
