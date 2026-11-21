export const meetingsKeys = {
  all: ['meetings'],
  lists: () => ['meetings', 'list'],
  list: (filters) => ['meetings', 'list', filters],
  stats: ['meetings', 'stats'],
  statsWithFilters: (filters) => ['meetings', 'stats', filters],
  detail: (id) => ['meetings', id],
};
