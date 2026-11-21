export const accountantSheetKeys = {
  all: ['accountant-sheet'],
  lists: () => [...accountantSheetKeys.all, 'list'],
  list: (params = {}) => [...accountantSheetKeys.lists(), params],
};