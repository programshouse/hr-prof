export const allowancesKeys = {
  all: ['allowances'],
  lists: () => [...allowancesKeys.all, 'list'],
  list: (params = {}) => [...allowancesKeys.lists(), params],
};
