import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { attendanceKeys } from '../api/attendance.keys';
import { toast } from 'sonner';

export function useUpsertAttendance() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: attendanceApi.createAttendance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      toast.success(data.message || 'Attendance created successfully');
    },
    onError: (error) => {
      const message = error?.response?.data?.error || 'Failed to create attendance';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: attendanceApi.updateAttendance,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.detail(variables.id),
      });

      toast.success(data.message || 'Attendance updated successfully');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update attendance';

      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}
