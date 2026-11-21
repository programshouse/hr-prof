export const employeeKpiKeys = {
  all: ['employee-kpi'],

  form: (employeeId, year, month) => ['employee-kpi', 'form', String(employeeId), year, month],

  // NEW
  scores: (employeeId, year, month) => ['employee-kpi', 'scores', String(employeeId), year, month],
};
