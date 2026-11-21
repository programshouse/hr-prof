export const weekendsKeys = {
  all: ['weekends'],
  lists: () => [...weekendsKeys.all, 'list'],
  list: (filters) => [...weekendsKeys.lists(), { filters }],
  details: () => [...weekendsKeys.all, 'detail'],
  detail: (id) => [...weekendsKeys.details(), id],
};

