import { create } from 'zustand';

export const usePayrollStore = create((set) => ({
  payrollData: null,
  setPayrollData: (data) => set({ payrollData: data }),
  clearPayrollData: () => set({ payrollData: null }),
}));
