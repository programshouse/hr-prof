// useEmployeeRequestMutations.js
//
// Create / update / delete for whichever request type is currently selected
// on the employee profile.
//
// This replaces the twelve near-identical useMutation blocks that used to sit
// in EmployeeAllRequests.jsx. Because the endpoints and payload builders live
// in requestTypes.config.js, one set of three mutations now covers all six
// types — switching tab just switches which config is in play.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { getRequestTypeConfig } from '../components/EmplyeeProfile.jsx/requestTypes.config';

/**
 * Pull something human-readable out of a Laravel error response.
 * Validation errors arrive as { errors: { from: ["The from field is required."] } }
 * and the field-level message is far more useful than the generic one.
 */
export const extractApiError = (error, fallback) => {
  const data = error?.response?.data;
  const errors = data?.errors;

  if (errors && typeof errors === 'object') {
    const first = Object.values(errors)[0];
    const message = Array.isArray(first) ? first[0] : first;

    if (message) return message;
  }

  return data?.message || error?.message || fallback;
};

export function useEmployeeRequestMutations(requestType, employeeId) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const config = getRequestTypeConfig(requestType);
  const typeLabel = config
    ? t(config.singularKey, { defaultValue: config.singularFallback })
    : 'request';

  const invalidate = () => {
    if (!config) return;

    // The profile tab's own list...
    queryClient.invalidateQueries({ queryKey: config.queryKey(employeeId) });

    // ...plus the standalone module list, so /leaves, /loans etc. stay in
    // sync when someone creates a request from inside a profile. Some modules
    // (Days Off) use a different top-level query key.
    const standaloneKeys = config.invalidateQueryKeys || [[config.id]];

    standaloneKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  const createMutation = useMutation({
    mutationFn: (values) => config.api.create(values),
    onSuccess: () => {
      invalidate();
      toast.success(
        t('requests.toast.created', {
          type: typeLabel,
          defaultValue: '{{type}} created successfully',
        })
      );
    },
    onError: (error) => {
      toast.error(extractApiError(error, `Failed to create ${typeLabel}`));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => config.api.update({ id, values }),
    onSuccess: () => {
      invalidate();
      toast.success(
        t('requests.toast.updated', {
          type: typeLabel,
          defaultValue: '{{type}} updated successfully',
        })
      );
    },
    onError: (error) => {
      toast.error(extractApiError(error, `Failed to update ${typeLabel}`));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => config.api.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(
        t('requests.toast.deleted', {
          type: typeLabel,
          defaultValue: '{{type}} deleted successfully',
        })
      );
    },
    onError: (error) => {
      toast.error(extractApiError(error, `Failed to delete ${typeLabel}`));
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    isMutating:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
