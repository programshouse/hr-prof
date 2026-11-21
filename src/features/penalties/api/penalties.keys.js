export const penaltyKeys = {
  all: ['penalties'],
  lists: () => [...penaltyKeys.all, 'list'],
  list: (filters) => [...penaltyKeys.lists(), filters],
  details: () => [...penaltyKeys.all, 'detail'],
  detail: (id) => [...penaltyKeys.details(), id],
};
