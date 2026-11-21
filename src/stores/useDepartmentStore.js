import { create } from 'zustand';
import { toast } from 'sonner';
import { departmentApi } from '@/features/settings/api/department.api';
import { queryClient } from '@/lib/react-query';

export const useDepartmentStore = create((_set, _get) => ({
  createDepartment: async (payload) => {
    if (!payload?.name_en || !payload?.name_ar) return;

    try {
      await departmentApi.createDepartment({
        name_en: payload.name_en,
        name_ar: payload.name_ar,
      });

      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create department';
      toast.error(msg);
      throw err;
    }
  },

  updateDepartment: async (id, payload) => {
    if (id == null || !payload?.name_en || !payload?.name_ar) {
      throw new Error('Department id and names are required');
    }

    try {
      await departmentApi.updateDepartment(id, {
        name_en: payload.name_en,
        name_ar: payload.name_ar,
      });

      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update department';
      toast.error(msg);
      throw err;
    }
  },

  deleteDepartmentByName: async (name) => {
    if (!name) return;

    const departments = queryClient.getQueryData(['departments']) || [];

    const target = departments.find((item) => {
      if (!item) return false;
      if (typeof item === 'string') return item === name;

      const itemName = item.name_en ?? item.name ?? item.title ?? item.department_name;
      return itemName === name;
    });

    if (!target?.id) return;

    try {
      await departmentApi.deleteDepartment(target.id);
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete department';
      toast.error(msg);
      throw err;
    }
  },
}));