import { useQuery } from '@tanstack/react-query';

import { insuranceEmployeesApi } from '../api/insuranceEmployees.api';
import { insuranceEmployeesKeys } from '../api/insuranceEmployees.keys';

export function useInsuranceEmployeesQuery(params) {
  return useQuery({
    queryKey: insuranceEmployeesKeys.list(params),

    queryFn: () => insuranceEmployeesApi.getList(params),

    select: (response) => ({
      rows: response?.rows ?? [],
      meta: response?.meta ?? {},
      totalInsuranceAmount:
        Number(response?.totalInsuranceAmount) || 0,
    }),
  });
}

export function usePayrollPoliciesQuery() {
  return useQuery({
    queryKey: ['payroll-policies'],

    queryFn: async () => {
      const { payrollApi } = await import(
        '@/features/settings/api/payroll.api'
      );

      const response =
        await payrollApi.getPayrollPolicies();

      return response?.data ?? [];
    },

    retry: false,
  });
}