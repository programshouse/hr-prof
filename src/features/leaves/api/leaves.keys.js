export const leaveKeys = {
  all: ['leaves'],
  lists: () => [...leaveKeys.all, 'list'],
  list: (filters) => [...leaveKeys.lists(), filters],
  details: () => [...leaveKeys.all, 'detail'],
  detail: (id) => [...leaveKeys.details(), id],
};
