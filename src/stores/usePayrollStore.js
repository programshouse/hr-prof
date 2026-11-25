import { create } from 'zustand';

export const usePayrollStore = create((set) => ({
  payrollData: null,
  salaryModalNavigationOpen: false,
  setSalaryModalNavigationOpen: (open) => set({ salaryModalNavigationOpen: open }),
  setPayrollData: (data) => set({ payrollData: data }),
  clearPayrollData: () => set({ payrollData: null }),
}));
