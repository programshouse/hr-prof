import axiosClient from "@/services/http/axiosClient";

const normalizeStatus = (s) => {
  const v = String(s || "scheduled").toLowerCase().trim();
  if (v === "canceled") return "cancelled";
  return v;
};

// for CREATE (multipart/form-data)
const toCreateFormData = (payload = {}) => {
  const fd = new FormData();

  if (payload.name != null) fd.append("name", payload.name);
  if (payload.date != null) fd.append("date", payload.date);
  if (payload.from != null) fd.append("from", payload.from);
  if (payload.to != null) fd.append("to", payload.to);

  if (payload.status != null) fd.append("status", normalizeStatus(payload.status));
  if (payload.notes != null) fd.append("notes", payload.notes);

  const emps = Array.isArray(payload.employees) ? payload.employees : [];
  emps.forEach((id) => fd.append("employees[]", String(id)));

  return fd;
};

// for UPDATE (application/json) مثل hoppscotch
const toUpdateJson = (payload = {}) => ({
  name: payload.name ?? "",
  date: payload.date ?? "",
  from: payload.from ?? "",
  to: payload.to ?? "",
  status: normalizeStatus(payload.status),
  notes: payload.notes ?? "",
  employees: Array.isArray(payload.employees) ? payload.employees : [],
});

export const meetingsApi = {
  getAll: async (params = {}) => {
    const mappedParams = {};
    if (params.from_date) mappedParams.from = params.from_date;
    if (params.to_date) mappedParams.to = params.to_date;
    if (params.keyword !== undefined) mappedParams.keyword = params.keyword;
    if (params.branch_id) mappedParams.branch_id = params.branch_id;
    if (params.position_id) mappedParams.position_id = params.position_id;
    if (params.department_id) mappedParams.department_id = params.department_id;
    if (params.page) mappedParams.page = params.page;
    if (params.limit) mappedParams.limit = params.limit;

    const res = await axiosClient.get(`/meetings`, { params: mappedParams });
    return res.data;
  },

  getMeeting: async (id) => {
    const res = await axiosClient.get(`/meetings/${id}`);
    return res.data;
  },

  // ✅ CREATE: multipart/form-data (employees[])
  create: async (payload) => {
    const fd = toCreateFormData(payload);
    const res = await axiosClient.post(`/meetings`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ✅ UPDATE: JSON (مثل hoppscotch)
  update: async (id, payload) => {
    const body = toUpdateJson(payload);
    const res = await axiosClient.patch(`/meetings/${id}`, body, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/meetings/${id}`);
    return res.data;
  },

  getStats: async (params = {}) => {
    const mappedParams = {};
    if (params.from_date) mappedParams.from = params.from_date;
    if (params.to_date) mappedParams.to = params.to_date;
    if (params.keyword !== undefined) mappedParams.keyword = params.keyword;
    if (params.branch_id) mappedParams.branch_id = params.branch_id;
    if (params.position_id) mappedParams.position_id = params.position_id;
    if (params.department_id) mappedParams.department_id = params.department_id;

    const res = await axiosClient.get(`/meetings/stats`, { params: mappedParams });
    return res.data;
  },
};

export const meetingsKeys = {
  all: ["meetings"],
  lists: () => ["meetings", "list"],
  list: (filters) => ["meetings", "list", filters],
  stats: ["meetings", "stats"],
  statsWithFilters: (filters) => ["meetings", "stats", filters],
  detail: (id) => ["meetings", id],
};
