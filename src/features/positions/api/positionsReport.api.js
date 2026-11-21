import axiosClient from '@/services/http/axiosClient';

export const positionsReportApi = {
  // GET /positions-employees-count
  getPositionsEmployeesCount: async () => {
    const res = await axiosClient.get('/positions-employees-count');
    return res.data; // { status, data: [...] }
  },

  // GET /position-header/:id
  getHeader: async (positionId) => {
    const res = await axiosClient.get(`/position-header/${positionId}`);
    return res.data;
  },

  // GET /position-trnover/:id?from=&to=
  getTurnover: async ({ positionId, from, to }) => {
    const res = await axiosClient.get(`/position-trnover/${positionId}`, {
      params: { from, to },
    });
    return res.data;
  },

  // GET /position-employees/:id
  getEmployees: async (positionId) => {
    const res = await axiosClient.get(`/position-employees/${positionId}`);
    return res.data;
  },
};
