import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salariesApi } from '../api/salariesApi';

// Hook for fetching salaries summary
export const useSalariesSummary = () => {
  return useQuery({
    queryKey: ['salaries-summary'],
    queryFn: salariesApi.getSalariesSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for fetching salaries list with filters
export const useSalaries = (filters = {}) => {
  return useQuery({
    queryKey: ['salaries', filters],
    queryFn: () => salariesApi.getSalaries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Hook for fetching single salary
export const useSalary = (id) => {
  return useQuery({
    queryKey: ['salary', id],
    queryFn: () => salariesApi.getSalaryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook for creating salary
export const useCreateSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salariesApi.createSalaryChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['salaries-summary'] });
    },
  });
};



// Hook for exporting salaries
export const useExportSalaries = () => {
  return useMutation({
    mutationFn: salariesApi.exportSalaries,
  });
};

// Hook for fetching salary overtime summary
export const useSalaryOvertimeSummary = ({
  year,
  month,
  companyId = 1,
} = {}) => {
  return useQuery({
    queryKey: [
      'salary-overtime-summary',
      Number(year),
      Number(month),
      Number(companyId),
    ],
    queryFn: () =>
      salariesApi.getOvertimeSummary({
        year,
        month,
        companyId,
      }),
    enabled: !!year && !!month && !!companyId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};
