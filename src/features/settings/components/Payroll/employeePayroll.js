
import axiosClient from '@/services/http/axiosClient';
export const getEmployeePayrollPolicy = async (employeeId) => {
  const res = await axiosClient.get(`/employees/${employeeId}/payroll-policy`);
  return res.data; // { status: true, data: {...policy...} }
};

export const saveEmployeePayrollPolicy = async (employeeId, payrollData) => {
  const res = await axiosClient.post(`/employees/${employeeId}/payroll-policy`, {
    policy: payrollData
  });
  return res.data; // created / updated response
};

export const resetEmployeePayrollPolicy = async (employeeId) => {
  const res = await axiosClient.delete(`/employees/${employeeId}/payroll-policy`);
  return res.data; // { status: true, message: "Employee payroll policy reset to default" }
};

// Reuse existing functions from payroll.js
export {
  createPayrollPolicyData,
  normalizeCurrency,
  transformAPIDataToUI,
  transformLateRules,
  transformHolidayRules,
  transformLateRulesFromAPI,
  transformHolidayRulesFromAPI,
} from './payroll.js';