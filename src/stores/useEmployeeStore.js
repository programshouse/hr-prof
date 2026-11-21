import { create } from 'zustand';
import { employeesApi } from '@/features/employees/api/employees.api';
import { sharedEmployeesApi } from '@/shared/api/employees.api';
import { toast } from 'sonner';

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  simpleList: [],
  currentEmployee: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchEmployees: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeesApi.getEmployees(params);
      // Assuming response might contain data and pagination info
      // Adjusting based on common patterns, but storing full response or data property
      set({
        employees: response.data || response,
        pagination: response.meta || response.pagination || null,
        isLoading: false,
      });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to fetch employees';
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  fetchEmployee: async (id, showErrorToast = true) => {
    set({ isLoading: true, error: null });
    try {
      const data = await employeesApi.getEmployee(id);
      set({ currentEmployee: data, isLoading: false });
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to fetch employee details';
      set({ error: msg, isLoading: false });
      if (showErrorToast) {
        toast.error(msg);
      }
      throw error;
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await employeesApi.createEmployee(data);
      toast.success('Employee created successfully');
      // Refresh list after creation
      await get().fetchEmployees();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to create employee';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      throw error;
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await employeesApi.updateEmployee({ id, data });
      toast.success('Employee updated successfully');
      // Refresh details if current employee is updated
      if (get().currentEmployee?.id === id) {
        await get().fetchEmployee(id);
      }
      // Refresh list
      await get().fetchEmployees();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update employee';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      throw error;
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await employeesApi.deleteEmployee(id);
      toast.success('Employee deleted successfully');
      // Refresh list
      await get().fetchEmployees();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to delete employee';
      set({ error: msg, isLoading: false });
      toast.error(msg);
      throw error;
    }
  },

  fetchSimpleList: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await sharedEmployeesApi.getAllEmployees();
      set({ simpleList: data, isLoading: false });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to fetch employee list';
      set({ error: msg, isLoading: false });
      toast.error(msg);
    }
  },

  resetCurrentEmployee: () => {
    set({ currentEmployee: null });
  },
}));
