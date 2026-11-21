import { apiClient } from '@/services/apiClient';

// Get all external missions
export const getExternalMissions = async (params = {}) => {
  const response = await apiClient.get('/external-missions', { params });
  return response.data;
};

// Get external mission by ID
export const getExternalMissionById = async (id) => {
  const response = await apiClient.get(`/external-missions/${id}`);
  return response.data;
};

// Create new external mission
export const createExternalMission = async (missionData) => {
  const response = await apiClient.post('/external-missions', missionData);
  return response.data;
};

// Update external mission
export const updateExternalMission = async (id, missionData) => {
  const response = await apiClient.put(`/external-missions/${id}`, missionData);
  return response.data;
};

// Delete external mission
export const deleteExternalMission = async (id) => {
  const response = await apiClient.delete(`/external-missions/${id}`);
  return response.data;
};

// Get mission participants
export const getMissionParticipants = async (missionId) => {
  const response = await apiClient.get(`/external-missions/${missionId}/participants`);
  return response.data;
};

// Add participant to mission
export const addMissionParticipant = async (missionId, participantData) => {
  const response = await apiClient.post(`/external-missions/${missionId}/participants`, participantData);
  return response.data;
};

// Remove participant from mission
export const removeMissionParticipant = async (missionId, participantId) => {
  const response = await apiClient.delete(`/external-missions/${missionId}/participants/${participantId}`);
  return response.data;
};

// Get mission documents
export const getMissionDocuments = async (missionId) => {
  const response = await apiClient.get(`/external-missions/${missionId}/documents`);
  return response.data;
};

// Upload mission document
export const uploadMissionDocument = async (missionId, formData) => {
  const response = await apiClient.post(`/external-missions/${missionId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete mission document
export const deleteMissionDocument = async (missionId, documentId) => {
  const response = await apiClient.delete(`/external-missions/${missionId}/documents/${documentId}`);
  return response.data;
};

// Get mission comments
export const getMissionComments = async (missionId) => {
  const response = await apiClient.get(`/external-missions/${missionId}/comments`);
  return response.data;
};

// Add mission comment
export const addMissionComment = async (missionId, commentData) => {
  const response = await apiClient.post(`/external-missions/${missionId}/comments`, commentData);
  return response.data;
};

// Update mission comment
export const updateMissionComment = async (missionId, commentId, commentData) => {
  const response = await apiClient.put(`/external-missions/${missionId}/comments/${commentId}`, commentData);
  return response.data;
};

// Delete mission comment
export const deleteMissionComment = async (missionId, commentId) => {
  const response = await apiClient.delete(`/external-missions/${missionId}/comments/${commentId}`);
  return response.data;
};

// Get mission timeline/events
export const getMissionTimeline = async (missionId) => {
  const response = await apiClient.get(`/external-missions/${missionId}/timeline`);
  return response.data;
};

// Add mission event
export const addMissionEvent = async (missionId, eventData) => {
  const response = await apiClient.post(`/external-missions/${missionId}/timeline`, eventData);
  return response.data;
};

// Update mission status
export const updateMissionStatus = async (id, status) => {
  const response = await apiClient.patch(`/external-missions/${id}/status`, { status });
  return response.data;
};

// Get mission statistics
export const getMissionStatistics = async (params = {}) => {
  const response = await apiClient.get('/external-missions/statistics', { params });
  return response.data;
};
