import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { officialHolidayAttendancesApi } from '../api/officialHolidayAttendances.api';
import { officialHolidayAttendancesKeys } from '../api/officialHolidayAttendances.keys';

const invalidateRelatedQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: officialHolidayAttendancesKeys.all }),
    queryClient.invalidateQueries({ queryKey: ['total-holidays'] }),
  ]);
};

export function useOfficialHolidayAttendancesQuery() {
  return useQuery({
    queryKey: officialHolidayAttendancesKeys.list(),
    queryFn: officialHolidayAttendancesApi.getAll,
  });
}

export function useCreateOfficialHolidayAttendance() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload) => officialHolidayAttendancesApi.create(payload),
    onSuccess: async () => {
      await invalidateRelatedQueries(queryClient);
      toast.success(t('officialHolidayAttendance.messages.created'));
    },
    onError: (error) => {
      console.error('Create official holiday attendance failed:', error);
      toast.error(t('officialHolidayAttendance.messages.createFailed'));
    },
  });
}

export function useUpdateOfficialHolidayAttendance() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, ...payload }) => officialHolidayAttendancesApi.update(id, payload),
    onSuccess: async () => {
      await invalidateRelatedQueries(queryClient);
      toast.success(t('officialHolidayAttendance.messages.updated'));
    },
    onError: (error) => {
      console.error('Update official holiday attendance failed:', error);
      toast.error(t('officialHolidayAttendance.messages.updateFailed'));
    },
  });
}

export function useDeleteOfficialHolidayAttendance() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id) => officialHolidayAttendancesApi.delete(id),
    onSuccess: async () => {
      await invalidateRelatedQueries(queryClient);
      toast.success(t('officialHolidayAttendance.messages.deleted'));
    },
    onError: (error) => {
      console.error('Delete official holiday attendance failed:', error);
      toast.error(t('officialHolidayAttendance.messages.deleteFailed'));
    },
  });
}
