export const dashboardKeys = {
  all: ['dashboard'],
  homeHeader: () => [...dashboardKeys.all, 'home-header'],
  graph: () => [...dashboardKeys.all, 'graph'],
  deptCounts: () => [...dashboardKeys.all, 'dept-counts'],
  employeeTrend: (year) => [...dashboardKeys.all, 'employee-trend', year],
};
