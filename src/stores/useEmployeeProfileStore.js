// src/stores/useEmployeeProfileStore.js
import { create } from 'zustand';
import { toast } from 'sonner';
import { employeeProfileApi } from '@/features/employees/api/employeeProfile.api';
import { queryClient } from '@/lib/react-query';

export const useEmployeeProfileStore = create((set) => ({
  profile: null,
  activity: null,
  rewardsAndPenalties: { rewards: [], penalties: [] },
  profileStatus: 'idle',
  profileRequestId: null,

  isLoading: false,
  isActivityLoading: false,
  isRewardsAndPenaltiesLoading: false,

  // ------- GET PROFILE -------
  getEmployeeProfile: async (id) => {
    if (!id) return;
    set({
      profile: null,
      activity: null,
      profileStatus: 'loading',
      profileRequestId: String(id),
      isLoading: true,
    });
    try {
      await queryClient.invalidateQueries({ queryKey: ['employeeProfile', id] });

      const res = await employeeProfileApi.getEmployeeProfile(id);
      const employeeData = res?.data?.employee || res?.data || res;

      set({
        profile: employeeData,
        profileStatus: 'success',
        profileRequestId: String(id),
        isLoading: false,
      });
      queryClient.setQueryData(['employeeProfile', id], employeeData);
      return employeeData;
    } catch (err) {
      set({
        profile: null,
        activity: null,
        profileStatus: err?.response?.status === 404 ? 'not_found' : 'error',
        profileRequestId: String(id),
        isLoading: false,
      });
      // Don't show error toast for missing employees
      console.error('Failed to load employee profile:', err);
      throw err;
    }
  },

  // ------- UPDATE PROFILE -------
  updateEmployeeProfile: async (id, payload) => {
    if (!id) return;
    set({ isLoading: true });
    try {
      const res = await employeeProfileApi.updateEmployeeProfile(id, payload);
      const employeeData = res?.data?.employee || res?.data || res;

      set({ profile: employeeData, profileStatus: 'success', isLoading: false });
      queryClient.setQueryData(['employeeProfile', id], employeeData);
      toast.success('Profile updated successfully');
      return employeeData;
    } catch (err) {
      set({ isLoading: false });
      toast.error(err?.response?.data?.message || 'Failed to update employee profile');
      throw err;
    }
  },

  // ------- GET ACTIVITY -------
  getEmployeeActivity: async (id) => {
    if (!id) return;
    set({ isActivityLoading: true });
    try {
      const data = await employeeProfileApi.getEmployeeActivity(id);
      set({ activity: data, isActivityLoading: false });
      queryClient.setQueryData(['employeeActivity', id], data);
      return data;
    } catch (err) {
      set({ isActivityLoading: false });
      console.error('Failed to load employee activity:', err);
      throw err;
    }
  },

  // ------- GET REWARDS AND PENALTIES -------
  getRewardsAndPenalties: async (id) => {
    if (!id) return;

    set({ isRewardsAndPenaltiesLoading: true });

    try {
      const data = await employeeProfileApi.getRewardsAndPenalties(id);

      set({
        rewardsAndPenalties: {
          rewards: data.rewards || [],
          penalties: data.penalties || [],
        },
        isRewardsAndPenaltiesLoading: false,
      });

      return data;
    } catch (err) {
      set({ isRewardsAndPenaltiesLoading: false });
      
      // Don't throw error for 404 (employee not found), just log it
      if (err.response?.status === 404) {
        console.warn(`Employee ${id} not found or has no rewards/penalties data`);
        return { rewards: [], penalties: [] };
      }
      
      throw err;
    }
  },

}));
