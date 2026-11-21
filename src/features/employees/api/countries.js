// src/features/employees/api/countries.js
import axiosClient from '@/services/http/axiosClient';

export function getCountries() {
  return axiosClient.get('/countries').then((res) => res.data);
}

export function getGovernoratesByCountry(countryId) {
  return axiosClient.get(`/countries/${countryId}/governorates`).then((res) => res.data);
}
