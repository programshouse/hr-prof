import { create } from 'zustand';
import { toast } from 'sonner';
import { queryClient } from '@/lib/react-query';
import { positionApi } from '@/features/settings/api/position.api';

export const usePositionStore = create((_set, _get) => ({
  // data: { title_en, description_en, branch_id? }
  createPosition: async (data) => {
    if (!data || !data.title_en) return;
    
    try {
      await positionApi.createPosition(data);
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position created successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create position';
      toast.error(msg);
      throw err;
    }
  },

  // data: { title_en, description_en, department_id? }
  updatePosition: async (id, data) => {
    if (id == null || !data?.title_en) {
      throw new Error('Position id and English title are required');
    }

    const payload = {
      ...(data.department_id !== undefined && { department_id: data.department_id }),
      title_en: data.title_en,
      ...(data.title_ar !== undefined && { title_ar: data.title_ar }),
      ...(data.description_en !== undefined && { description_en: data.description_en }),
      ...(data.description_ar !== undefined && { description_ar: data.description_ar }),
    };

    try {
      await positionApi.updatePosition(id, payload);
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update position';
      toast.error(msg);
      throw err;
    }
  },

  deletePositionByName: async (name) => {
    if (!name) return;

    const positions = queryClient.getQueryData(['positions']) || [];
    const target = positions.find((item) => {
      if (!item) return false;
      if (typeof item === 'string') return item === name;
      const itemName = item.title_en ?? item.title ?? item.name_en ?? item.position_name;
      return itemName === name;
    });

    if (!target || !target.id) {
      return;
    }

    const payload = {
      department_id: target.department_id,
    };

    try {
      await positionApi.deletePosition(target.id, payload);
      await queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position deleted successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete position';
      toast.error(msg);
      throw err;
    }
  },
}));
