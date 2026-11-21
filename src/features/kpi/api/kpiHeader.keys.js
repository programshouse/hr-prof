export const kpiHeaderKeys = {
  all: ['kpi-header'],
  stats: (departmentId, year, month) => [
    ...kpiHeaderKeys.all,
    'stats',
    departmentId ? String(departmentId) : 'all',
    Number(year),
    Number(month),
  ],
};
