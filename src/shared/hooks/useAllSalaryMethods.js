// src/shared/hooks/useAllSalaryMethods.js
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';

export function useAllSalaryMethods() {
  return useQuery({
    queryKey: ['salary-methods'],
    queryFn: async () => {
      const res = await axiosClient.get('/salary-methods');
      const raw = res?.data ?? [];

      // handle both:
      // 1) plain array   -> [ { id, name, ... }, ... ]
      // 2) wrapped       -> { data: [ ... ] }
      if (Array.isArray(raw)) return raw;

      return raw?.data ?? [];
    },
  });
}