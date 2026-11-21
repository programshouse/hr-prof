import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { weekendsApi } from '../api/weekends.api';
import { weekendsKeys } from '../api/weekends.keys';

export function useCreateWeekend() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => weekendsApi.create(payload),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: weekendsKeys.all });
      toast.success(res?.message || 'Weekend created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create weekend');
    },
  });
}

export function useUpdateWeekend() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => weekendsApi.update(id, payload),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: weekendsKeys.all });
      toast.success(res?.message || 'Weekend updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update weekend');
    },
  });
}

export function useDeleteWeekend() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => weekendsApi.delete(id),
    onSuccess: async (res, id) => {
      await qc.invalidateQueries({ queryKey: weekendsKeys.all });
      if (id) await qc.removeQueries({ queryKey: weekendsKeys.detail(id) });
      toast.success(res?.message || 'Weekend deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete weekend');
    },
  });
}

export function useRemoveWeekendEmployees() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ weekend_id, employee_ids }) => {
      const ids = Array.isArray(employee_ids)
        ? employee_ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n))
        : [];

      const results = await Promise.allSettled(
        ids.map((employee_id) =>
          weekendsApi.removeEmployee({ weekend_id, employee_id })
        )
      );

      const removedCount = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected');
      const failedCount = failed.length;
      const firstErrorMessage =
        failed[0]?.reason?.response?.data?.message ||
        failed[0]?.reason?.message ||
        null;

      return { removedCount, failedCount, firstErrorMessage };
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: weekendsKeys.all });
      await qc.invalidateQueries({ queryKey: ['total-holidays'] });

      if (res?.removedCount) {
        toast.success(`Removed ${res.removedCount} employee(s) from weekend`);
      }

      if (res?.failedCount) {
        toast.error(res.firstErrorMessage || 'Failed to remove some employees');
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to remove employees');
    },
  });
}
