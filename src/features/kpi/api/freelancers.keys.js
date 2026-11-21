export const freelancersKeys = {
  all: ['freelancers'],
  list: () => [...freelancersKeys.all, 'list'],
  listWithParams: (params) => [...freelancersKeys.list(), params],
};
