// src/features/applicants/hooks/useApplicantsHeaderQuery.js
import { useQuery } from '@tanstack/react-query';
import { applicantsApi } from '../api/applicants.api';
import { applicantsKeys } from '../api/applicants.keys';

export default function useApplicantsHeaderQuery() {
  return useQuery({
    queryKey: applicantsKeys.header(),
    queryFn: applicantsApi.getHeader,
  });
}