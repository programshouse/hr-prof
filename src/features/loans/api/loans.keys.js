export const loansKeys = {
  all: ['loans'],
  lists: () => [...loansKeys.all, 'list'],
  list: (filters) => [...loansKeys.lists(), { filters }],
  details: () => [...loansKeys.all, 'detail'],
  detail: (id) => [...loansKeys.details(), id],
  summary: () => [...loansKeys.all, 'summary'],
};
