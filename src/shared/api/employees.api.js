import axiosClient from '@/services/http/axiosClient';

export const mapEmployeeListRow = (emp) => {
  if (!emp || typeof emp !== 'object') return null;

  const id = emp.employee_id ?? emp.id ?? emp.employeeId;
  if (id == null) return null;

  const code = emp.employee_code ?? emp.code ?? '';

  return {
    ...emp,
    employee_id: id,
    id,
    employee_code: code,
    code,
  };
};

export const sharedEmployeesApi = {
  getAllEmployees: async () => {
    const response = await axiosClient.get('/list');

    const rows = response.data?.employees ?? response.data?.data?.employees ?? response.data?.data ?? [];
    if (!Array.isArray(rows)) return [];

    return rows.map(mapEmployeeListRow).filter(Boolean);
  },
};
