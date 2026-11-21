import axiosClient from '@/services/http/axiosClient';

export const accountantSheetApi = {
  getAccountantSheet: async (params = {}) => {
    console.log('API REQUEST PARAMS', params);

    const { data } = await axiosClient.get('/accountant-sheet', {
      params,
    });

    console.log('API RESPONSE', data);

    return data;
  },
};
