export const employeeCommissionKeys = {
  all: ['employee-commission'],
  form: (employeeId, monthString) => [
    ...employeeCommissionKeys.all,
    'form',
    String(employeeId),
    monthString,
  ],
  scores: (employeeId, monthString) => [
    ...employeeCommissionKeys.all,
    'scores',
    String(employeeId),
    monthString,
  ],
};
