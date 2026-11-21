// src/features/fingerprint-issues/hooks/useFingerprintIssuesQuery.js
import { useQuery } from '@tanstack/react-query';
import { fingerprintIssuesApi } from '../api/fingerprintIssues.api';

export const useFingerprintIssuesQuery = (month, year, page = 1, perPage = 20, filters = {}) => {
  return useQuery({
    queryKey: ['fingerprint-issues', month, year, page, perPage, filters],
    queryFn: () => fingerprintIssuesApi.getFingerprintIssues(month, year, page, perPage, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!month && !!year,
    keepPreviousData: true,
  });
};
