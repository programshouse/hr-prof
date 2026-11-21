export const kpiEmployeesListKeys = {
  all: ['kpi-employees-list'],
  list: (params) => [...kpiEmployeesListKeys.all, 'list', params],
};
