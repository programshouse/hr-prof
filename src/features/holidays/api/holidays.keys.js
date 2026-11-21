export const holidaysKeys = {
  all: ['holidays'],
  lists: () => [...holidaysKeys.all, 'list'],
  list: (filters) => [...holidaysKeys.lists(), { filters }],
  details: () => [...holidaysKeys.all, 'detail'],
  detail: (id) => [...holidaysKeys.details(), id],
  summary: () => [...holidaysKeys.all, 'summary'],
};
