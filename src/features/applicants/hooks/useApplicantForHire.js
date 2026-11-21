// src/features/employees/hooks/useApplicantForHire.js
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApplicantById } from '@/features/applicants/api/applicants.hire.api';
import mapApplicantToEmployeeForm from '../../employees/utils/mapApplicantToEmployeeForm';

export default function useApplicantForHire(applicantId, options = {}) {
  const query = useQuery({
    queryKey: ['applicant-for-hire', applicantId],
    queryFn: async () => getApplicantById(applicantId),
    enabled: Boolean(applicantId),
    ...options,
  });

  const mappedValues = useMemo(() => {
    if (!query.data) return null;
    return mapApplicantToEmployeeForm(query.data);
  }, [query.data]);

  return {
    ...query,
    applicant: query.data ?? null,
    mappedValues,
    isHireMode: Boolean(applicantId),
  };
}