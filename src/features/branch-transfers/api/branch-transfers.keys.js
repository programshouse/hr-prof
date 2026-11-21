export const branchTransfersKeys = {
  all: ['branch-transfers'],
  lists: () => [...branchTransfersKeys.all, 'list'],
  list: (filters) => [...branchTransfersKeys.lists(), { filters }],
  details: () => [...branchTransfersKeys.all, 'detail'],
  detail: (id) => [...branchTransfersKeys.details(), id],
  summary: () => [...branchTransfersKeys.all, 'summary'],
};
