// src/features/employees/hooks/useEmployeesHeaderQuery.js
import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';

const fetchEmployeesHeader = async () => {
  // If backend later wraps in { status, data }, this still works
  const res = await axiosClient.get('/header'); //  GET {{base_url}}header
  const payload = res.data || {};

  return payload;
};

export default function useEmployeesHeaderQuery() {
  return useQuery({
    queryKey: ['employees', 'header'],
    queryFn: fetchEmployeesHeader,
  });
}
