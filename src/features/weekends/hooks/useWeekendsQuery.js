import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/services/http/axiosClient';
import { weekendsKeys } from '../api/weekends.keys';

const toIsoDate = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return raw;
};

const toEmployeeIds = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((x) => String(x)).filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];

    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map((x) => String(x)).filter(Boolean) : [raw];
      } catch {
        return [raw];
      }
    }

    return [raw];
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  return [];
};

const getNestedEmployee = (value) =>
  value?.employee ?? value?.employee_data ?? value?.user ?? value?.applicant ?? value ?? null;

const getEmployeeId = (value) => {
  if (!value || typeof value !== 'object') return null;

  const nested = getNestedEmployee(value);

  return (
    value?.employee_id ??
    value?.id ??
    value?.user_id ??
    value?.pivot?.employee_id ??
    nested?.employee_id ??
    nested?.id ??
    nested?.user_id ??
    null
  );
};

const normalizeEmployeeNames = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const id = item?.id ?? item?.employee_id ?? item?.user_id ?? null;
      const name = typeof item?.name === 'string' ? item.name.trim() : '';
      const name_ar =
        typeof item?.name_ar === 'string'
          ? item.name_ar.trim()
          : typeof item?.employee_name_ar === 'string'
            ? item.employee_name_ar.trim()
            : '';
      const name_en =
        typeof item?.name_en === 'string'
          ? item.name_en.trim()
          : typeof item?.employee_name_en === 'string'
            ? item.employee_name_en.trim()
            : '';

      if (id == null && !name && !name_ar && !name_en) return null;

      return {
        id: id != null ? String(id) : null,
        name,
        name_ar,
        name_en,
      };
    })
    .filter(Boolean);
};

const normalizeWeekendRow = (row) => {
  const date_from =
    row?.date_from ??
    row?.weekend_from ??
    row?.from ??
    row?.dateFrom ??
    row?.weekendFrom ??
    '';

  const date_to =
    row?.date_to ??
    row?.weekend_to ??
    row?.to ??
    row?.dateTo ??
    row?.weekendTo ??
    '';

  const employeesFromIds =
    row?.employee_ids ??
    row?.employee_id ??
    row?.employees_ids ??
    row?.employees_id ??
    row?.employeeIds ??
    row?.employeesIds ??
    null;

  const normalizedEmployees = Array.isArray(row?.employees)
    ? row.employees
        .map((employee) => getNestedEmployee(employee))
        .filter((employee) => employee && typeof employee === 'object')
    : [];

  const employee_name = normalizeEmployeeNames(
    row?.employee_name ??
    row?.employee_names ??
    row?.employeeName ??
    row?.employeeNames
  );

  const employeesFromObjects = normalizedEmployees.map((employee) => getEmployeeId(employee)).filter(Boolean);

  const employee_ids = [
    ...new Set([
      ...toEmployeeIds(employeesFromIds),
      ...toEmployeeIds(employeesFromObjects),
      ...employee_name.map((employee) => employee.id).filter(Boolean),
    ]),
  ];

  const employees_count =
    row?.employees_count ??
    row?.employeesCount ??
    (employee_ids.length > 0 ? employee_ids.length : null);

  const duration = row?.duration ?? row?.days ?? row?.total_days ?? null;

  return {
    ...row,
    date_from: toIsoDate(date_from),
    date_to: toIsoDate(date_to),
    employees: normalizedEmployees,
    employee_name,
    employee_ids,
    employees_count,
    duration,
  };
};

const getWeekendKey = (row) => {
  const id = row?.id ?? row?.weekend_id ?? row?.weekendId ?? null;
  if (id != null && id !== '') return `id:${id}`;
  return `range:${row?.date_from || ''}:${row?.date_to || ''}`;
};

const mergeWeekendRows = (rows = []) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const key = getWeekendKey(row);
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        ...row,
        employee_ids: [...new Set((row.employee_ids || []).map(String).filter(Boolean))],
        employees: Array.isArray(row.employees) ? [...row.employees] : [],
        employee_name: Array.isArray(row.employee_name) ? [...row.employee_name] : [],
      });
      return;
    }

    const mergedEmployeeIds = [
      ...new Set([
        ...(current.employee_ids || []).map(String).filter(Boolean),
        ...(row.employee_ids || []).map(String).filter(Boolean),
      ]),
    ];

    const mergedEmployeesMap = new Map();
    const mergedEmployeeNamesMap = new Map();

    [...(current.employees || []), ...(row.employees || [])].forEach((employee) => {
      const employeeId = getEmployeeId(employee);
      if (employeeId != null) {
        mergedEmployeesMap.set(String(employeeId), employee);
      }
    });

    [...(current.employee_name || []), ...(row.employee_name || [])].forEach((employee) => {
      const employeeId = employee?.id != null ? String(employee.id) : null;
      const employeeName = typeof employee?.name === 'string' ? employee.name.trim() : '';

      if (employeeId) {
        mergedEmployeeNamesMap.set(employeeId, {
          id: employeeId,
          name: employeeName,
        });
        return;
      }

      if (employeeName) {
        mergedEmployeeNamesMap.set(`name:${employeeName}`, {
          id: null,
          name: employeeName,
        });
      }
    });

    grouped.set(key, {
      ...current,
      ...row,
      employee_ids: mergedEmployeeIds,
      employees: Array.from(mergedEmployeesMap.values()),
      employee_name: Array.from(mergedEmployeeNamesMap.values()),
      employees_count:
        row?.employees_count ??
        current?.employees_count ??
        mergedEmployeeIds.length,
    });
  });

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    employees_count:
      row?.employees_count != null ? Math.max(Number(row.employees_count) || 0, row.employee_ids.length) : row.employee_ids.length,
  }));
};

export function useWeekendsQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: weekendsKeys.list({ ...filters, page, limit }),
    queryFn: async () => {
      const params = {
        ...(page ? { page } : {}),
        ...(limit ? { limit } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
      };

      const res = await axiosClient.get('/weekends', { params });
      const raw = res.data || {};

      const fromRaw =
        raw.rows ??
        raw.data ??
        raw.weekends ??
        raw.results ??
        [];

      const rows = Array.isArray(fromRaw)
        ? fromRaw
        : Array.isArray(fromRaw?.rows)
          ? fromRaw.rows
          : Array.isArray(fromRaw?.data)
            ? fromRaw.data
            : [];

      const meta =
        raw.meta ??
        fromRaw?.meta ??
        {
          current_page: page,
          per_page: limit,
          total: rows.length,
          last_page: 1,
        };

      const normalizedRows = rows.map(normalizeWeekendRow);
      const groupedRows = mergeWeekendRows(normalizedRows);

      return {
        rows: groupedRows,
        meta: {
          ...meta,
          total: groupedRows.length,
        },
      };
    },
  });
}

