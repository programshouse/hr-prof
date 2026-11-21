export const commissionEmployeesListKeys = {
  all: ['commission-employees-list'],
  list: (params) => [...commissionEmployeesListKeys.all, 'list', params],
};
