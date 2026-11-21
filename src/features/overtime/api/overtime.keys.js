export const overtimeKeys = {
  all: ['overtime'],
  lists: () => [...overtimeKeys.all, 'list'],
  list: (filters) => [...overtimeKeys.lists(), { filters }],
  details: () => [...overtimeKeys.all, 'detail'],
  detail: (id) => [...overtimeKeys.details(), id],
  summary: () => [...overtimeKeys.all, 'summary'],
};
