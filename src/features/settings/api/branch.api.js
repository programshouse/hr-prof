import axiosClient from '@/services/http/axiosClient';

export const branchApi = {
  getBranches: async () => {
    const response = await axiosClient.get('/branches');
    return response.data;
  },

  // Used when opening the edit modal, so altitudes (floors) are loaded too.
  getBranch: async (id) => {
    const response = await axiosClient.get(`/branches/${id}`);
    return response.data;
  },

  createBranch: async (payload) => {
    // expected payload: { name_en: string, lat, lng, ... }
    const response = await axiosClient.post('/branches', payload);
    return response.data;
  },

  updateBranch: async (id, payload) => {
    // FIX: the backend update route is PATCH (see Hoppscotch collection), not PUT.
    // The backend also requires `lat` and `lng` on update.
    const response = await axiosClient.patch(`/branches/${id}`, payload);
    return response.data;
  },

  deleteBranch: async (id) => {
    const response = await axiosClient.delete(`/branches/${id}`);
    return response.data;
  },
};
