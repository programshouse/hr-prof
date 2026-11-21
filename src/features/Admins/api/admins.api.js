import axiosClient from '@/services/http/axiosClient';
export const adminsKeys = {
  all: ['admins'],
  lists: () => [...adminsKeys.all, 'list'],
  list: (params = {}) => [...adminsKeys.lists(), params],
  detail: (id) => [...adminsKeys.all, 'detail', id],
};

const toFormData = (payload = {}, isUpdate = false) => {
  const formData = new FormData();

  if (payload.name !== undefined) formData.append('name', payload.name ?? '');
  if (payload.email !== undefined) formData.append('email', payload.email ?? '');
  if (payload.password !== undefined && payload.password !== '') {
    formData.append('password', payload.password);
  }

  if (payload.is_super_admin !== undefined) {
    formData.append('is_super_admin', payload.is_super_admin ? 1 : 0);
  }

  if (isUpdate) {
    formData.append('_method', 'PUT');
  }

  return formData;
};

const getAdmins = async () => {
  const response = await axiosClient.get('/admins');
  return response.data;
};

const createAdmin = async (payload) => {
  const formData = toFormData(payload, false);

  const response = await axiosClient.post('/admins', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const updateAdmin = async (id, payload) => {
  const formData = toFormData(payload, true);

  const response = await axiosClient.post(`/admins/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const deleteAdmin = async (id) => {
  const response = await axiosClient.delete(`/admins/${id}`);
  return response.data;
};

export const adminsApi = {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};