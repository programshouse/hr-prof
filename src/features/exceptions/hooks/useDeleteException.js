// src/features/attendance/exceptions/hooks/useDeleteException.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exceptionsApi } from '../api/exceptions.api';
import { toast } from 'sonner';

function dateKey(value) {
  if (value == null || value === '') return '';
  return String(value).slice(0, 10);
}

function isExceptionsListQuery(queryKey) {
  return Array.isArray(queryKey) && queryKey[0] === 'exceptions' && queryKey[1] === 'list';
}

function rowMatchesDeleted(row, variables) {
  const { employee_id, from_date, to_date } = variables || {};

  if (employee_id == null || employee_id === '' || !from_date || !to_date) {
    return false;
  }

  const sameEmployee = String(row?.employee_id) === String(employee_id);
  if (!sameEmployee) return false;

  const rowFrom = dateKey(row?.from_date || row?.date);
  const rowTo = dateKey(row?.to_date || row?.date || row?.from_date);

  return rowFrom === dateKey(from_date) && rowTo === dateKey(to_date);
}

function pruneDeletedRow(oldData, variables) {
  if (!oldData || !Array.isArray(oldData.data)) return oldData;

  const filtered = oldData.data.filter((row) => !rowMatchesDeleted(row, variables));

  if (filtered.length === oldData.data.length) {
    return oldData;
  }

  return {
    ...oldData,
    data: filtered,
    meta: oldData.meta
      ? {
          ...oldData.meta,
          total: Math.max(0, Number(oldData.meta.total || 0) - (oldData.data.length - filtered.length)),
        }
      : oldData.meta,
  };
}

export const useDeleteException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => exceptionsApi.deleteException(variables),

    onMutate: async (variables) => {
      const queries = queryClient.getQueryCache().findAll({
        predicate: (query) => isExceptionsListQuery(query.queryKey),
      });

      await Promise.all(
        queries.map((query) =>
          queryClient.cancelQueries({
            queryKey: query.queryKey,
            exact: true,
          })
        )
      );

      const previousQueriesData = queries.map((query) => ({
        queryKey: query.queryKey,
        data: queryClient.getQueryData(query.queryKey),
      }));

      queries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old) => pruneDeletedRow(old, variables));
      });

      return { previousQueriesData };
    },

    onError: (error, _variables, context) => {
      if (context?.previousQueriesData?.length) {
        context.previousQueriesData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast.error(error?.response?.data?.message || 'Failed to delete exception');
    },

    onSuccess: () => {
      toast.success('Exception deleted successfully');
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isExceptionsListQuery(query.queryKey),
      });

      await queryClient.refetchQueries({
        predicate: (query) => isExceptionsListQuery(query.queryKey),
        type: 'active',
      });
    },
  });
};