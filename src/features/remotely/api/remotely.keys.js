export const remotelyKeys = {
  all: ['remotely'],
  lists: () => [...remotelyKeys.all, 'list'],
  list: (filters) => [...remotelyKeys.lists(), filters],
  details: () => [...remotelyKeys.all, 'detail'],
  detail: (id) => [...remotelyKeys.details(), id],
};
