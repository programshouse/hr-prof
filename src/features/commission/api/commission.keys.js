export const commissionKeys = {
  all: ['commission'],
  preview: (employeeId, month, baseAmount) => [
    ...commissionKeys.all,
    'preview',
    String(employeeId),
    month,
    String(baseAmount),
  ],
};
