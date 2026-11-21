export const exceptionsKeys = {
  all: ['exceptions'],
  lists: () => [...exceptionsKeys.all, 'list'],

  // ✅ stable, readable key
  list: (filters) => [...exceptionsKeys.lists(), filters ?? {}],

  details: () => [...exceptionsKeys.all, 'detail'],
  detail: (id) => [...exceptionsKeys.details(), String(id)],
};