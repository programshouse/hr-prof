export const attendanceKeys = {
  all: ['attendances'],
  lists: () => [...attendanceKeys.all, 'list'],
  list: (date, page, department, keyword, branch, perPage) => [
    ...attendanceKeys.lists(),
    { date, page, department, keyword, branch, perPage },
  ],
  monthly: (month, page, perPage) => [...attendanceKeys.all, 'monthly', { month, page, perPage }],
  details: () => [...attendanceKeys.all, 'detail'],
  detail: (id) => [...attendanceKeys.details(), id],
  monthlySummary: (employeeId, month) => [...attendanceKeys.all, 'monthlySummary', { employeeId, month }],
};
