export const positionsReportKeys = {
  all: ['positions-report'],

  list: () => [...positionsReportKeys.all, 'list'],

  header: (positionId) => [...positionsReportKeys.all, 'header', String(positionId)],

  turnover: (positionId, from, to) => [
    ...positionsReportKeys.all,
    'turnover',
    String(positionId),
    String(from || ''),
    String(to || ''),
  ],

  employees: (positionId) => [...positionsReportKeys.all, 'employees', String(positionId)],
};
