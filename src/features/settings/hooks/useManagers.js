import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { managersApi } from '../api/managers.api';
import { managersKeys } from '../api/managers.keys';

export function useManagers() {
  return useQuery({
    queryKey: managersKeys.lists(),

    queryFn: async () => {
      const managers =
        await managersApi.getManagers();

      return managers.map((manager) => {
        const firstName =
          manager.applicant?.first_name || '';

        const middleName =
          manager.applicant?.middle_name || '';

        const lastName =
          manager.applicant?.last_name || '';

        const applicantId =
          manager.applicant?.id ||
          manager.applicant_id ||
          '';

        const fullName = [
          firstName,
          middleName,
          lastName,
        ]
          .filter(Boolean)
          .join(' ');

        const formattedName =
          manager.id
            ? `${manager.id} - ${fullName}`
            : fullName;

        return {
          ...manager,

          employee_name:
            fullName,

          employee_code:
            applicantId,

          formatted_name:
            formattedName,
        };
      });
    },
  });
}


/* =========================================================
   REPLACE MANAGER
========================================================= */

export function useReplaceManager() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      oldManagerId,
      newManagerId,
    }) =>
      managersApi.replaceManager({
        oldManagerId,
        newManagerId,
      }),

    onSuccess: () => {
      /*
       * Reload managers after replacement
       */
      queryClient.invalidateQueries({
        queryKey:
          managersKeys.lists(),
      });
    },
  });
}