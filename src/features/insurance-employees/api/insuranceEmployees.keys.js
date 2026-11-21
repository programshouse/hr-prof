export const insuranceEmployeesKeys = {
  all: ['insurance-employees'],
  list: (params) => [...insuranceEmployeesKeys.all, 'list', params],
};
