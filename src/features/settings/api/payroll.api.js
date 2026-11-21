import axiosClient from "@/services/http/axiosClient";

export const payrollApi = {
  savePayrollPolicy: async (payload) => {
    const response = await axiosClient.post("/PayrollPolicy/save", payload);
    return response.data;
  },

  getPayrollPolicy: async () => {
    const response = await axiosClient.get("/show");
    return response.data;
  },

  getPayrollPolicies: async () => {
    const response = await axiosClient.get("/show");
    const policy = response.data?.data ?? response.data;

    if (!policy) {
      return { data: [] };
    }

    return {
      data: Array.isArray(policy) ? policy : [policy],
    };
  },

  getPayrollPolicyById: async (id) => {
    const response = await axiosClient.get(`/payroll-policies/${id}`);
    return response.data;
  },

  updatePayrollPolicy: async (id, payload) => {
    const response = await axiosClient.put(`/payroll-policies/${id}`, payload);
    return response.data;
  },

  deletePayrollPolicy: async (id) => {
    const response = await axiosClient.delete(`/payroll-policies/${id}`);
    return response.data;
  },
};
