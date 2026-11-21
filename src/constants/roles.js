export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_MANAGER: 'hr_manager',
};

export const PERMISSIONS = {
  // Employees
  VIEW_EMPLOYEES: 'view_employees',
  CREATE_EMPLOYEE: 'create_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',

  // Attendance
  VIEW_ATTENDANCE: 'view_attendance',
  MANAGE_ATTENDANCE: 'manage_attendance',

  // Payroll
  VIEW_PAYROLL: 'view_payroll',
  MANAGE_PAYROLL: 'manage_payroll',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',
};
