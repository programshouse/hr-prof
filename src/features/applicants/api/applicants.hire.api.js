// src/features/applicants/api/applicants.hire.api.js
import axiosClient from '@/services/http/axiosClient';

/**
 * Get applicant details by id
 * Reuse this for hire flow prefill
 */
export async function getApplicantById(applicantId) {
  if (!applicantId) {
    throw new Error('applicantId is required');
  }

  const res = await axiosClient.get(`/applicants/${applicantId}`);
  return res.data?.data ?? res.data;
}

/**
 * Hire applicant and create employee
 * POST /applicants/:id/hire
 */
export async function hireApplicant(applicantId, payload) {
  if (!applicantId) {
    throw new Error('applicantId is required');
  }

  const res = await axiosClient.post(`/applicants/${applicantId}/hire`, payload);
  return res.data?.data ?? res.data;
}