// src/features/penalties/api/penalties.api.js
import axiosClient from '@/services/http/axiosClient';

function buildPenaltyFormData(values) {
  const formData = new FormData();

  values.employee_ids.forEach((id) => {
    formData.append('employee_ids[]', id);
  });

  formData.append('date', values.date);
  formData.append('type', values.type);
  formData.append('calculation_type', values.calculation_type);

  if (values.calculation_type === 'fixed' && values.amount !== undefined && values.amount !== '') {
    formData.append('amount', values.amount);
  }

  if (values.calculation_type === 'days' && values.days_count !== undefined && values.days_count !== '') {
    formData.append('days_count', values.days_count);
  }

  if (values.other) {
    formData.append('other', values.other);
  }

  return formData;
}

export const penaltiesApi = {
  getPenalties: async (params) => {
    const response = await axiosClient.get('/penalties', { params });
    return response.data;
  },

  getPenalty: async (id) => {
    const response = await axiosClient.get(`/penalties/${id}`);
    return response.data;
  },

  getPenaltySummary: async () => {
    const response = await axiosClient.get('/penalty-summary');
    return response.data;
  },

  createPenalty: async (values) => {
    const formData = buildPenaltyFormData(values);

    const response = await axiosClient.post('/penalties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  updatePenalty: async ({ id, values }) => {
    // Use the same update contract that works directly against the backend:
    // PATCH /penalties/:id with a JSON body and one employee_id.
    //
    // The edit form only edits one existing penalty, so sending employee_ids[]
    // as multipart data is unnecessary and can produce a different request
    // shape from the one the update endpoint expects.
    const employeeId =
      values.employee_id ??
      (Array.isArray(values.employee_ids) ? values.employee_ids[0] : undefined);

    const payload = {
      employee_id: employeeId,
      date: values.date,
      type: values.type,
      calculation_type: values.calculation_type,
    };

    if (values.other) {
      payload.other = values.other;
    }

    if (values.calculation_type === 'fixed') {
      payload.amount = values.amount;
      // Explicitly clear a previous days-based value when switching days -> fixed.
      payload.days_count = null;
    } else {
      payload.days_count = values.days_count;
      // Explicitly clear a previous fixed value when switching fixed -> days.
      payload.amount = null;
    }

    const response = await axiosClient.patch(`/penalties/${id}`, payload);
    return response.data;
  },

  deletePenalty: async (id) => {
    const response = await axiosClient.delete(`/penalties/${id}`);
    return response.data;
  },
};