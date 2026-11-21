import axiosClient from '@/services/http/axiosClient';

export async function getGeneralHolidays(year) {
  const { data } = await axiosClient.get(`/all-Holidays/${year}`);
  console.log('General holidays API response:', data);
  return data;
}

export async function createGeneralHoliday(formData) {
  const { data } = await axiosClient.post('/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateGeneralHoliday(id, payload) {
  const { data } = await axiosClient.put(`/general-holidays/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

export async function deleteGeneralHoliday(id) {
  const { data } = await axiosClient.delete(`/delete/${id}`);
  return data;
}

export async function removeEmployeeFromGeneralHoliday(holidayId, employeeId) {
  const { data } = await axiosClient.delete(`/official-holidays/${holidayId}/employee`, {
    data: {
      employee_id: employeeId,
    },
  });
  return data;
}
