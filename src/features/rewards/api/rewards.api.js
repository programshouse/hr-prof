// src/features/rewards/api/rewards.api.js
import axiosClient from '@/services/http/axiosClient';

function buildRewardFormData(values) {
  const formData = new FormData();

  // employees
  values.employee_ids.forEach((id) => {
    formData.append('employee_ids[]', id);
  });

  formData.append('date', values.date);
  formData.append('type', values.type);

  // new field
  formData.append('calculation_type', values.calculation_type);

  if (values.calculation_type === 'fixed') {
    formData.append('amount', values.amount);
  }

  if (values.calculation_type === 'days') {
    formData.append('days_count', values.days_count);
  }

  if (values.other) {
    formData.append('other', values.other);
  }

  return formData;
}

export const rewardsApi = {
  getRewards: async (params) => {
    const response = await axiosClient.get('/rewards', { params });
    return response.data;
  },

  getReward: async (id) => {
    const response = await axiosClient.get(`/rewards/${id}`);
    return response.data;
  },

  getRewardSummary: async () => {
    const response = await axiosClient.get('/reward-summary');
    return response.data;
  },

  // CREATE
  createReward: async (values) => {
    const formData = buildRewardFormData(values);

    const response = await axiosClient.post('/rewards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // UPDATE
  updateReward: async ({ id, values }) => {
    const formData = buildRewardFormData(values);

    const response = await axiosClient.post(`/rewards/${id}?_method=PATCH`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  deleteReward: async (id) => {
    const response = await axiosClient.delete(`/rewards/${id}`);
    return response.data;
  },
};