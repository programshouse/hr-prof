// src/shared/hooks/useAllShifts.js
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import i18n from '@/i18n';

export function useAllShifts({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['shifts', i18n.language],
    queryFn: async () => {
      const res = await axiosClient.get('/shifts'); // GET {{base_url}}shifts
      const raw = res?.data ?? [];

      // handle both:
      // 1) plain array   -> [ { id, name_en, ... }, ... ]
      // 2) wrapped       -> { data: [ ... ] }
      if (Array.isArray(raw)) return raw;
      return raw?.data ?? [];
    },
    enabled,
  });
}
