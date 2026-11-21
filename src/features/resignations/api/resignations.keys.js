export const resignationKeys = {
  all: ['resignations'],
  lists: () => [...resignationKeys.all, 'list'],
  list: (filters) => [...resignationKeys.lists(), { filters }],
  details: () => [...resignationKeys.all, 'detail'],
  detail: (id) => [...resignationKeys.details(), id],
  summary: () => [...resignationKeys.all, 'summary'],
};
