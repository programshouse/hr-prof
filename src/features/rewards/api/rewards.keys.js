export const rewardKeys = {
  all: ['rewards'],
  lists: () => [...rewardKeys.all, 'list'],
  list: (filters) => [...rewardKeys.lists(), filters],
  details: () => [...rewardKeys.all, 'detail'],
  detail: (id) => [...rewardKeys.details(), id],
};
