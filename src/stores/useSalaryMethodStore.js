import { create } from 'zustand';
import { toast } from 'sonner';
import { salaryMethodApi } from '@/features/settings/api/salary-method.api';
import { queryClient } from '@/lib/react-query';

export const useSalaryMethodStore = create((_set, _get) => ({
  createSalaryMethod: async (payload) => {
    if (!payload?.name_en || !payload?.name_ar) return;

    try {
      await salaryMethodApi.createSalaryMethod({
        name_en: payload.name_en,
        name_ar: payload.name_ar,
      });

      await queryClient.invalidateQueries({ queryKey: ['salary-methods'] });
      toast.success('Salary method created successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create salary method';
      toast.error(msg);
      throw err;
    }
  },

  updateSalaryMethodByName: async (oldName, payload) => {
    if (!oldName || !payload?.name_en || !payload?.name_ar) return;

    const salaryMethods = queryClient.getQueryData(['salary-methods']) || [];

    const target = salaryMethods.find((item) => {
      if (!item) return false;

      return (
        item.name_en === oldName ||
        item.name_ar === oldName ||
        item.name === oldName
      );
    });

    if (!target?.id) {
      toast.error('Salary method not found');
      return;
    }

    try {
      await salaryMethodApi.updateSalaryMethod(target.id, {
        name_en: payload.name_en,
        name_ar: payload.name_ar,
      });

      await queryClient.invalidateQueries({ queryKey: ['salary-methods'] });
      toast.success('Salary method updated successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update salary method';
      toast.error(msg);
      throw err;
    }
  },

  // Delete salary method identified by its name
  deleteSalaryMethodByName: async (name) => {
    if (!name) return;

    const salaryMethods = queryClient.getQueryData(['salary-methods']) || [];

    const target = salaryMethods.find((item) => {
      if (!item) return false;

      return (
        item.name_en === name ||
        item.name_ar === name ||
        item.name === name
      );
    });

    if (!target?.id) {
      toast.error('Salary method not found');
      return;
    }

    try {
      await salaryMethodApi.deleteSalaryMethod(target.id);

      await queryClient.invalidateQueries({ queryKey: ['salary-methods'] });
      toast.success('Salary method deleted successfully');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete salary method';
      toast.error(msg);
      throw err;
    }
  },
}));