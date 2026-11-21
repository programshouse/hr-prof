import { useQuery } from '@tanstack/react-query';
import { sharedEmployeesApi } from '../api/employees.api';
import { sharedEmployeeKeys } from '../api/employees.keys';
import i18n from '@/i18n';

/**
 * useAllEmployees - Fetches all employees for dropdowns/comboboxes.
 *
 * @param {boolean} [enabled=true] - Whether the query should run (useful for dialogs).
 * @returns {object} React Query result with employees list.
 *
 * - Intended for use in dropdowns, comboboxes, and selection UIs.
 */
export function useAllEmployees(enabled = true) {
  return useQuery({
    queryKey: [...sharedEmployeeKeys.list(), i18n.language],
    queryFn: () => sharedEmployeesApi.getAllEmployees(),
    enabled,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}
