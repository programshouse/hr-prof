// src/features/attendanceOverview/hooks/usePartTimeMonthlyReportQuery.js
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isValid } from 'date-fns';
import { attendanceApi } from "../../attendance/api/attendance.api";

function toDateSafe(value) {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }

  return undefined;
}

export function usePartTimeMonthlyReportQuery({
  fromDate,
  toDate,
  company,
  branch,
  keyword,
  name_code_phone,
  page,
  perPage,
}) {
  const fromD = toDateSafe(fromDate);
  const toD = toDateSafe(toDate);

  const monthBase = fromD || toD || new Date();
  const month = format(monthBase, 'yyyy-MM');

  const from = fromD ? format(fromD, 'yyyy-MM-dd') : undefined;
  const to = toD ? format(toD, 'yyyy-MM-dd') : undefined;

  const normalizedBranch = branch && branch !== 'all' ? branch : undefined;
  const normalizedCompany = company && company !== 'all' ? company : undefined;
  const normalizedKeyword = keyword || undefined;

  return useQuery({
    queryKey: [
      "attendancePartTimeMonthlyReport",
      {
        month,
        from,
        to,
        company: normalizedCompany,
        branch: normalizedBranch,
        keyword: normalizedKeyword,
        name_code_phone: name_code_phone || undefined,
        page,
        perPage,
      },
    ],
    queryFn: async () => {
      const response = await attendanceApi.getPartTimeMonthlyReport(
        month,
        from,
        to,
        normalizedCompany,
        normalizedBranch,
        normalizedKeyword,
        name_code_phone,
        page,
        perPage
      );

      const mapped = response.data?.map((row) => ({
        id: row.employee_code,
        employeeId: row.employee_id,
        name: row.employee_name,
        role: row.employee_position ?? "—",

        requiredHours: row.monthly_required_hours,
        workedHours: row.monthly_worked_hours,
        missingHours: row.monthly_deficit_hours,

        overtimeWorked: {
          value: row.monthly_overtime_hours,
        },
      }));

      return {
        data: mapped,
        meta: response.meta || {
          total: response.total || response.data?.length || 0,
          per_page: response.per_page || perPage,
          current_page: response.current_page || page,
          last_page: response.last_page || Math.max(1, Math.ceil((response.total || response.data?.length || 0) / (response.per_page || perPage))),
        },
      };
    },
    placeholderData: (prev) => prev,
  });
}
