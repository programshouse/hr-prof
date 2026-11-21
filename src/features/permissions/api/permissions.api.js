import axiosClient from '@/services/http/axiosClient';

export async function getAdmins() {
  const res = await axiosClient.get('/admins');
  return res.data?.data ?? [];
}

export async function getPermissions() {
  const res = await axiosClient.get('/permissions');
  return res.data?.data ?? [];
}

export async function getAdminPermissions(adminId) {
  if (!adminId) return null;

  const res = await axiosClient.get(`/admins/${adminId}/permissions`);
  return res.data?.data ?? null;
}

export async function updateAdminPermissions({ adminId, permissions }) {
  const res = await axiosClient.put(`/admins/${adminId}/permissions`, {
    permissions,
  });

  return res.data;
}