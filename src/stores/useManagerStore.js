import { create } from 'zustand';
import { toast } from 'sonner';
import { managersApi } from '@/features/settings/api/managers.api';
import { queryClient } from '@/lib/react-query';
import { managersKeys } from '@/features/settings/api/managers.keys';

export const useManagerStore = create((_set, _get) => ({
  addManager: async (employeeId, data) => {
    try {
      await managersApi.addManager(employeeId, data);
      await queryClient.invalidateQueries({ queryKey: managersKeys.lists() });
      toast.success('Agent added successfully');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to add agent';
      toast.error(msg);
      throw error;
    }
  },

  removeManager: async (employeeId) => {
    try {
      await managersApi.removeManager(employeeId);
      await queryClient.invalidateQueries({ queryKey: managersKeys.lists() });
      toast.success('Agent removed successfully');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to remove agent';
      toast.error(msg);
      throw error;
    }
  },

  updateManager: async (managerId, data) => {
    try {
      await managersApi.updateManager(managerId, data);
      await queryClient.invalidateQueries({ queryKey: managersKeys.lists() });
      toast.success('Manager updated successfully');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update manager';
      toast.error(msg);
      throw error;
    }
  },
}));
