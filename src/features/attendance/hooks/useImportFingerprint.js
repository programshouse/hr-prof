import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceApi } from '../api/attendance.api';

export const useImportFingerprint = () => {
  return useMutation({
    mutationFn: attendanceApi.importFingerprint,
    onSuccess: (data) => {
      const savedCount = data.saved_count || 0;
      const skippedCount = data.skipped_count || 0;
      
      if (savedCount > 0) {
        toast.success(`Successfully imported ${savedCount} attendance records`);
      }
      
      // if (skippedCount > 0) {
      //   toast.warning(`${skippedCount} records were skipped`);
      // }
      
      if (savedCount === 0 && skippedCount === 0) {
        toast.info('No records were processed');
      }
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast.error('Failed to import fingerprint data');
    },
  });
};
