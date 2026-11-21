import axiosClient from '@/services/http/axiosClient';
import { employeesApi } from './employees.api';
import { useAuthStore } from '@/services/auth/auth.store';

export const employeeProfileApi = {
  // GET /personal-data/:id
  getEmployeeProfile: async (id) => {
    const response = await axiosClient.get(`/personal-data/${id}`);
    console.log('API RESPONSE:', response.data);
    
    // Fetch the dedicated employee profile image and make that response
    // authoritative for both the visible profile header and PDF export.
    try {
      const imageResponse = await employeesApi.getEmployeeImage(id);

      // /personal-data can return either the employee directly or wrap it as
      // data.employee. Always write the resolved image onto the actual employee
      // object, otherwise the store unwraps data.employee and silently drops the
      // image fields we just added.
      const responsePayload = response.data?.data || response.data;
      const employeeData = responsePayload?.employee || responsePayload;

      const imagePayload =
        imageResponse?.data?.employee ??
        imageResponse?.data ??
        imageResponse?.employee ??
        imageResponse ??
        {};

      const nestedImage =
        imagePayload?.image && typeof imagePayload.image === 'object'
          ? imagePayload.image
          : null;

      const profileImage =
        imagePayload?.profile_image && typeof imagePayload.profile_image === 'object'
          ? imagePayload.profile_image
          : null;

      const imageSource =
        imagePayload?.image_url ||
        imagePayload?.profile_image_url ||
        nestedImage?.image_url ||
        profileImage?.image_url ||
        nestedImage?.url ||
        profileImage?.url ||
        imagePayload?.url ||
        (typeof imagePayload?.image === 'string' ? imagePayload.image : '') ||
        (typeof imagePayload?.profile_image === 'string' ? imagePayload.profile_image : '') ||
        imagePayload?.image_path ||
        imagePayload?.profile_image_path ||
        nestedImage?.image_path ||
        profileImage?.image_path ||
        nestedImage?.path ||
        profileImage?.path ||
        imagePayload?.path ||
        '';

      employeeData.profile_image_resolved = true;
      employeeData.profile_image_source = String(imageSource || '').trim();

      if (employeeData.profile_image_source) {
        employeeData.image_url = employeeData.profile_image_source;
      }

      // Preserve the original data wrapper when one exists; the store will
      // unwrap .employee, now with the authoritative image fields attached.
      return { data: responsePayload };
    } catch (imageError) {
      // If image fetch fails, return profile data without image
      console.warn('Failed to fetch employee image:', imageError);
      return response.data;
    }
  },

  // PATCH /personal-data/:id
  updateEmployeeProfile: async (id, payload) => {
    if (!id) throw new Error('Employee id is required');
    if (!payload) throw new Error('Update payload is required');

    const response = await axiosClient.patch(`/personal-data/${id}`, payload);
    return response.data;
  },

  // GET /activity/:id
  getEmployeeActivity: async (employeeId) => {
    if (!employeeId) throw new Error('Employee id is required');
    const response = await axiosClient.get(`/activity/${employeeId}`);
    return response.data;
  },

  // GET rewards + penalties (by employee_id)
  getRewardsAndPenalties: async (id) => {
    if (!id) throw new Error('Employee id is required');

    if (useAuthStore.getState()?.authSource === 'employee-login') {
      const [{ rewardsApi }, { penaltiesApi }] = await Promise.all([
        import('@/features/rewards/api/rewards.api'),
        import('@/features/penalties/api/penalties.api'),
      ]);

      const [rewardsResponse, penaltiesResponse] = await Promise.all([
        rewardsApi.getRewards({ employee_id: id, limit: 10000 }),
        penaltiesApi.getPenalties({ employee_id: id, limit: 10000 }),
      ]);

      const unwrap = (value, keys = []) => {
        if (Array.isArray(value)) return value;
        for (const key of keys) {
          if (Array.isArray(value?.[key])) return value[key];
        }
        if (Array.isArray(value?.data)) return value.data;
        if (Array.isArray(value?.data?.data)) return value.data.data;
        return [];
      };

      return {
        rewards: unwrap(rewardsResponse, ['rewards', 'data']),
        penalties: unwrap(penaltiesResponse, ['penalties', 'data']),
      };
    }

    const res = await axiosClient.get(`/RewardsAndPenalties/${id}`);

    return {
      rewards: Array.isArray(res.data?.rewards) ? res.data.rewards : [],
      penalties: Array.isArray(res.data?.penalties) ? res.data.penalties : [],
    };
  },
};
