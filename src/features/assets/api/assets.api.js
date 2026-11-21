import axiosClient from "@/services/http/axiosClient";

/* =========================
   Helpers
========================= */

const normalizeStatus = (status) => {
  const s = String(status || "").toLowerCase().trim();

  const map = {
    lost: "lost",
    "in use": "in_use",
    inuse: "in_use",
    returned: "returned",
    completed: "completed",
    active: "active",
  };

  return map[s] || s;
};

const normalizeAssetItem = (item) => {
  return {
    ...item,

    // flatten safe access
    assetName: item?.asset?.name || item?.asset_name || item?.name || "—",
    assetValue: item?.asset?.value ?? item?.value ?? null,

    employeeName: item?.employee?.name || "—",
    employeeCode: item?.employee?.code || null,

    status: normalizeStatus(item?.status),
  };
};

/* =========================
   Form Data (CREATE)
========================= */

const toCreateFormData = (payload = {}) => {
  const fd = new FormData();

  if (payload.name != null) fd.append("name", payload.name);
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.value != null) fd.append("value", payload.value);

  return fd;
};

/* =========================
   JSON (UPDATE)
========================= */

const toUpdateJson = (payload = {}) => ({
  name: payload.name ?? "",
  description: payload.description ?? "",
  value: payload.value ?? "",
});

/* =========================
   API
========================= */

export const assetsApi = {
  getAll: async (params = {}) => {
    const mappedParams = {};

    if (params.from) mappedParams.from = params.from;
    if (params.to) mappedParams.to = params.to;
    if (params.limit) mappedParams.limit = params.limit;
    if (params.page) mappedParams.page = params.page;
    if (params.search) mappedParams.keyword = params.search;

    const res = await axiosClient.get(`/assets`, { params: mappedParams });

    const rawData = res.data?.data || [];

    return {
      ...res.data,
      data: rawData.map(normalizeAssetItem),
    };
  },

  getAsset: async (id) => {
    const res = await axiosClient.get(`/assets/${id}`);

    return {
      ...res.data,
      data: normalizeAssetItem(res.data?.data),
    };
  },

  create: async (payload) => {
    const fd = toCreateFormData(payload);

    const res = await axiosClient.post(`/assets`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  update: async (id, payload) => {
    const body = toUpdateJson(payload);

    const res = await axiosClient.patch(`/assets/${id}`, body, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/assets/${id}`);
    return res.data;
  },

  getStats: async (params = {}) => {
    const mappedParams = {};

    if (params.keyword) mappedParams.keyword = params.keyword;
    if (params.limit) mappedParams.limit = params.limit;
    if (params.branch_id) mappedParams.branch_id = params.branch_id;
    if (params.position_id) mappedParams.position_id = params.position_id;
    if (params.shift_id) mappedParams.shift_id = params.shift_id;
    if (params.department_id) mappedParams.department_id = params.department_id;
    if (params.from) mappedParams.from = params.from;
    if (params.to) mappedParams.to = params.to;
    if (params.Key) mappedParams.Key = params.Key;

    const res = await axiosClient.get(`/assetsStats`, { params: mappedParams });
    return res.data;
  },
};

/* =========================
   Query Keys
========================= */

export const assetsKeys = {
  all: ["assets"],
  lists: () => ["assets", "list"],
  list: (filters) => ["assets", "list", filters],
  detail: (id) => ["assets", id],
  stats: ["assets", "stats"],
  statsWithFilters: (filters) => ["assets", "stats", filters],
};