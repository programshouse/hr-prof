import { useMutation } from '@tanstack/react-query';
import { applicantsPublicApi } from '../api/applicants.public.api';

export function useCreateApplicantPublic() {
  return useMutation({
    mutationFn: (payload) => applicantsPublicApi.create(payload),
  });
}