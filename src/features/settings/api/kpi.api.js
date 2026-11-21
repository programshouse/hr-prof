import axiosClient from '@/services/http/axiosClient';

const kpiApi = {
  // Get all KPI items for a position
  getAll: (positionId) => {
    const url = '/kpi-items';
    return axiosClient.get(url, {
      params: { position_id: positionId }
    });
  },

  // Create a new KPI item
  create: (data) => {
    const url = '/kpi-items';
    return axiosClient.post(url, data);
  },

  // Update a KPI item
  update: (id, data) => {
    const url = `/kpi-items/${id}`;
    return axiosClient.patch(url, data);
  },

  // Delete a KPI item
  delete: (id) => {
    const url = `/kpi-items/${id}`;
    return axiosClient.delete(url);
  }
};

export default kpiApi;
