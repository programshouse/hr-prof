import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { attendanceKeys } from '../api/attendance.keys';
import { toast } from 'sonner';

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });

      toast.success('Attendance deleted successfully');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to delete attendance';

      toast.error(message);
    },
  });
}
