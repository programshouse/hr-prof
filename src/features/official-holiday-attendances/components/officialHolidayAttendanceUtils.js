export function unwrapOfficialHolidayAttendances(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.rows)) return response.rows;
  return [];
}

export function getOfficialHolidayEmployeeId(employee) {
  if (!employee || typeof employee !== 'object') return null;

  return (
    employee?.employee_id ??
    employee?.id ??
    employee?.user_id ??
    employee?.pivot?.employee_id ??
    employee?.employee?.employee_id ??
    employee?.employee?.id ??
    employee?.employee?.user_id ??
    null
  );
}

export function getOfficialHolidayEmployeeIds(record) {
  const direct =
    record?.employee_ids ??
    record?.employee_id ??
    record?.employees_ids ??
    record?.employeeIds ??
    null;

  if (Array.isArray(direct)) {
    return direct.map((id) => String(id)).filter(Boolean);
  }

  if (direct != null && direct !== '') {
    return [String(direct)];
  }

  if (!Array.isArray(record?.employees)) return [];

  return record.employees
    .map((employee) => getOfficialHolidayEmployeeId(employee))
    .filter((id) => id != null)
    .map(String);
}

export function toDateOnly(value) {
  if (!value) return '';

  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return raw;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatOfficialHolidayDate(value, language = 'en') {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return '—';

  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) return dateOnly;

  return new Intl.DateTimeFormat(language?.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(year, month - 1, day));
}

export function getEmployeeSearchText(employee = {}) {
  const source = employee?.employee ?? employee;
  const applicant = source?.applicant || {};

  return [
    source?.id,
    source?.employee_id,
    source?.code,
    source?.employee_code,
    source?.name,
    source?.name_ar,
    source?.name_en,
    source?.full_name,
    source?.employee_name,
    source?.login_id,
    applicant?.full_name,
    applicant?.preferred_name,
    applicant?.first_name,
    applicant?.middle_name,
    applicant?.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getEmployeeDepartmentId(employee = {}) {
  const source = employee?.employee ?? employee;

  return (
    source?.department_id ??
    source?.department?.id ??
    employee?.department_id ??
    employee?.department?.id ??
    null
  );
}
