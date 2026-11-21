import { create } from 'zustand';
import { queryClient } from '@/lib/react-query';
import { toast } from 'sonner';
import { shiftApi } from '@/features/settings/api/shift.api';

// Translation function - will be initialized when needed
let t = null;
export const setShiftTranslationFunction = (translationFn) => {
  t = translationFn;
};

export const useShiftStore = create((_set, _get) => ({
  // Create new shift via API
  createShift: async (data) => {
    if (!data || !data.name_en) return;
    try {
      await shiftApi.createShift(data);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(t ? t('messages.success.shiftCreated') : 'Shift created successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || (t ? t('messages.error.createShiftFailed') : 'Failed to create shift');
      toast.error(msg);
      throw err;
    }
  },

  updateShift: async (id, newData) => {
    if (id == null || !newData?.name_en) {
      throw new Error('Shift id and English name are required');
    }

    try {
      await shiftApi.updateShift(id, newData);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(t ? t('messages.success.shiftUpdated') : 'Shift updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || (t ? t('messages.error.updateShiftFailed') : 'Failed to update shift');
      toast.error(msg);
      throw err;
    }
  },

  // Delete shift identified by its name
  deleteShiftByName: async (name) => {
    if (!name) return;

    const shifts = queryClient.getQueryData(['shifts']) || [];
    const target = shifts.find((item) => {
      if (!item) return false;
      if (typeof item === 'string') return item === name;
      const itemName = item.name_en;
      return itemName === name;
    });

    if (!target || !target.id) {
      return;
    }
    try {
      await shiftApi.deleteShift(target.id);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(t ? t('messages.success.shiftDeleted') : 'Shift deleted successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || (t ? t('messages.error.deleteShiftFailed') : 'Failed to delete shift');
      toast.error(msg);
      throw err;
    }
  },
}));
