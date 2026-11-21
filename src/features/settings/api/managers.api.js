import axiosClient from '@/services/http/axiosClient';

export const managersApi = {
  getManagers: async () => {
    const response = await axiosClient.get('/head-managers');

    return response.data.data;
  },

  addManager: async (employeeId, data) => {
 const response = await axiosClient.post( `/${employeeId}/head-managers`,   data
    ); return response.data;
  },

  removeManager: async (employeeId) => {
    const response = await axiosClient.post(
      `/${employeeId}/remove-managers`
    );

    return response.data;
  },

  updateManager: async (managerId, data) => {
    const response = await axiosClient.patch(
      `/head-managers/${managerId}`,
      data
    );

    return response.data;
  },

  replaceManager: async ({
    oldManagerId,
    newManagerId,
  }) => {const formData = new FormData();
    formData.append('old_manager_id',String(oldManagerId) );

    formData.append( 'new_manager_id',
      String(newManagerId)
    );

    const response = await axiosClient.post(
      '/managers/replace',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};