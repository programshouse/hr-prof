import axiosClient from '@/services/http/axiosClient';

export const usersKeys = {
  all: ['users'],

  lists: () => [...usersKeys.all, 'list'],

  list: (params = {}) => [...usersKeys.lists(), params],

  detail: (id) => [...usersKeys.all, 'detail', id],
};

const getUsers = async (params = {}) => {
  const response = await axiosClient.get('/employee-credentials', {
    params,
  });

  return response.data;
};

const createUser = async (payload) => {
  const response = await axiosClient.post(
    '/employee-credentials',
    payload,
  );

  return response.data;
};

const updateUser = async (id, payload) => {
  const response = await axiosClient.put(
    `/employee-credentials/${id}`,
    payload,
  );

  return response.data;
};

const resetPassword = async (id, payload) => {
  const response = await axiosClient.post(
    `/employee-credentials/${id}/reset-password`,
    payload,
  );

  return response.data;
};

// Reset fingerprint / biometric
const resetFingerprint = async (id) => {
  const response = await axiosClient.post(`/reset-biometric/${id}`);

  return response.data;
};

// Reset device
const resetDevice = async (id) => {
  const response = await axiosClient.post(`/reset-device/${id}`);

  return response.data;
};

// Employee MAC devices
const getDevices = async (employeeId) => {
  const response = await axiosClient.get(`/devices/${employeeId}`);

  return response.data;
};

const createDevice = async (employeeId, payload) => {
  const response = await axiosClient.post(
    `/devices/${employeeId}`,
    payload,
  );

  return response.data;
};

const deleteDevice = async (deviceId) => {
  const response = await axiosClient.delete(`/devices/${deviceId}`);

  return response.data;
};

const deleteUser = async (id) => {
  const response = await axiosClient.delete(
    `/employee-credentials/${id}`,
  );

  return response.data;
};

export const usersApi = {
  getUsers,
  createUser,
  updateUser,
  resetPassword,
  resetDevice,
  resetFingerprint,
  getDevices,
  createDevice,
  deleteDevice,
  deleteUser,
};