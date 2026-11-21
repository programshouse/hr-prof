import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exceptionsApi } from '../api/exceptions.api';
import { exceptionsKeys } from '../api/exceptions.keys';
import { toast } from 'sonner';

const normalizeUpdatePayload = (payload = {}) => {
  return {
    employee_id: payload.employee_id ?? null,
    employee_ids: Array.isArray(payload.employee_ids)
      ? payload.employee_ids
      : payload.employee_id
        ? [payload.employee_id]
        : [],
    from_date: payload.from_date ?? payload.data?.from_date ?? '',
    to_date: payload.to_date ?? payload.data?.to_date ?? '',
    data: {
      start_time: payload.data?.start_time ?? payload.start_time ?? '',
      end_time: payload.data?.end_time ?? payload.end_time ?? '',
      reason: payload.data?.reason ?? payload.reason ?? '',
      status: payload.data?.status ?? payload.status ?? 'pending',
    },
  };
};

export const useUpsertException = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: exceptionsApi.createException,
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: exceptionsKeys.lists() });

      const employeeCount = variables.employee_ids?.length || 1;
      toast.success(
        `Exception created successfully for ${employeeCount} employee${employeeCount > 1 ? 's' : ''}`
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create exception');
    },
  });

  const update = useMutation({
    mutationFn: (variables) => {
      const normalized = normalizeUpdatePayload(variables);
      return exceptionsApi.updateException(normalized);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: exceptionsKeys.lists() });

      if (typeof exceptionsKeys.details === 'function') {
        queryClient.invalidateQueries({ queryKey: exceptionsKeys.details() });
      }

      const employeeCount =
        variables?.employee_ids?.length ||
        (variables?.employee_id ? 1 : 1);

      toast.success(
        `Exception updated successfully for ${employeeCount} employee${employeeCount > 1 ? 's' : ''}`
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update exception');
    },
  });

  return { create, update };
};