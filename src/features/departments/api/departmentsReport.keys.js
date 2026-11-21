// src/features/departments/api/departmentsReport.keys.js
export const departmentsReportKeys = {
  all: ['departments-report'],

  // NEW: departments index list
  list: (page) => [...departmentsReportKeys.all, 'departments-list', String(page || 1)],

  header: (departmentId) => [...departmentsReportKeys.all, 'header', String(departmentId)],

  //include params so query refetches when filters change
  employees: (departmentId, params = {}) => [
    ...departmentsReportKeys.all,
    'employees',
    String(departmentId),
    JSON.stringify(params ?? {}),
  ],

  turnover: (departmentId, from, to) => [
    ...departmentsReportKeys.all,
    'turnover',
    String(departmentId),
    String(from || ''),
    String(to || ''),
  ],

  allDetails: (departmentId) => [...departmentsReportKeys.all, 'all-details', String(departmentId)],
};


