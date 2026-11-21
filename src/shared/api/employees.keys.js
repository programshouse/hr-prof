export const sharedEmployeeKeys = {
  all: ['shared-employees'],
  list: () => [...sharedEmployeeKeys.all, 'employees-dropdown'],
};
