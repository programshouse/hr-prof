export const commissionHeaderKeys = {
  all: ['commission-header'],
  stats: (departmentId, monthString) => [
    ...commissionHeaderKeys.all,
    'stats',
    departmentId ? String(departmentId) : 'all',
    monthString,
  ],
};
