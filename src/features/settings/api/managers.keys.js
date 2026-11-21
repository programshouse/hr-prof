export const managersKeys = {
  all: ['managers'],
  lists: () => [...managersKeys.all, 'list'],
  list: (filters) => [...managersKeys.lists(), { filters }],
  details: () => [...managersKeys.all, 'detail'],
  detail: (id) => [...managersKeys.details(), id],
};
