import axiosClient from "@/services/http/axiosClient";

export const employeeAssetsApi = {
  getAll: async (params = {}) => {
    const mappedParams = {};
    if (params.page) mappedParams.page = params.page;
    if (params.limit) mappedParams.per_page = params.limit;
    if (params.keyword) mappedParams.keyword = params.keyword;
    if (params.status) mappedParams.status = params.status;
    if (params.asset_type) mappedParams.asset_type = params.asset_type;
    if (params.from) mappedParams.from = params.from;
    if (params.to) mappedParams.to = params.to;
    if (params.department_id) mappedParams.department_id = params.department_id;
    if (params.branch_id) mappedParams.branch_id = params.branch_id;

    const res = await axiosClient.get(`/employee-assets`, { params: mappedParams });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/employee-assets/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosClient.post(`/employee-assets`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosClient.patch(`/employee-assets/${id}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/employee-assets/${id}`);
    return res.data;
  },
};

export const employeeAssetsKeys = {
  all: ["employeeAssets"],
  lists: () => ["employeeAssets", "list"],
  list: (filters) => ["employeeAssets", "list", filters],
  detail: (id) => ["employeeAssets", id],
};
