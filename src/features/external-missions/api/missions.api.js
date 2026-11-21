import axiosClient from '@/services/http/axiosClient';

// Get all missions (matches Hoppscotch GET /missions)
export const getMissions = async (params = {}) => {
  const response = await axiosClient.get('/missions', { params });
  return response.data;
};

// Get mission by ID (matches Hoppscotch GET /missions/{id})
export const getMissionById = async (id) => {
  const response = await axiosClient.get(`/missions/${id}`);
  return response.data;
};

// Create new mission (matches Hoppscotch POST /missions)
export const createMission = async (missionData) => {
  const response = await axiosClient.post('/missions', missionData);
  return response.data;
};

// Update mission (matches Hoppscotch PUT /missions/{id})
export const updateMission = async (id, missionData) => {
  const response = await axiosClient.put(`/missions/${id}`, missionData);
  return response.data;
};

// Delete mission (matches Hoppscotch DELETE /missions/{id})
export const deleteMission = async (id) => {
  const response = await axiosClient.delete(`/missions/${id}`);
  return response.data;
};

// Get mission statistics (matches Hoppscotch GET /cards)
export const getMissionStatistics = async () => {
  const response = await axiosClient.get('/cards');
  return response.data;
};
