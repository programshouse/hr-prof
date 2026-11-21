function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function cleanString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toDateOnly(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function normalizeWeeklyWorkDays(value, fixedShift = false, fixedFrom = '', fixedTo = '') {
  if (!value) return [];

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  const normalizeTime = (v) => cleanString(v).slice(0, 5);

  const useFixed = !!fixedShift && fixedFrom && fixedTo;
  const fixedStart = normalizeTime(fixedFrom);
  const fixedEnd = normalizeTime(fixedTo);

  const buildRow = (day, raw) => {
    const enabled =
      raw?.enabled === true ||
      raw?.enabled === 1 ||
      raw?.enabled === '1';

    const start_time = useFixed
      ? fixedStart
      : normalizeTime(raw?.from || raw?.start_time);

    const end_time = useFixed
      ? fixedEnd
      : normalizeTime(raw?.to || raw?.end_time);

    return {
      day: cleanString(day).toLowerCase(),
      start_time,
      end_time,
      enabled,
    };
  };

  if (Array.isArray(value)) {
    const result = [];

    value.forEach((item) => {
      const day = cleanString(item?.day).toLowerCase();
      const start_time = useFixed
        ? fixedStart
        : normalizeTime(item?.start_time || item?.from);
      const end_time = useFixed
        ? fixedEnd
        : normalizeTime(item?.end_time || item?.to);

      if (day && start_time && end_time) {
        result.push({ day, start_time, end_time });
      }
    });

    Object.entries(value).forEach(([key, raw]) => {
      if (/^\d+$/.test(key)) return;

      const row = buildRow(key, raw);

      if (row.enabled && row.day && row.start_time && row.end_time) {
        result.push({
          day: row.day,
          start_time: row.start_time,
          end_time: row.end_time,
        });
      }
    });

    const unique = [];
    const seen = new Set();

    result.forEach((item) => {
      const key = `${item.day}-${item.start_time}-${item.end_time}`;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(item);
    });

    return unique;
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([day, raw]) => buildRow(day, raw))
      .filter((item) => item.enabled && item.day && item.start_time && item.end_time)
      .map(({ day, start_time, end_time }) => ({
        day,
        start_time,
        end_time,
      }));
  }

  return [];
}

function normalizeCustomKpis(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => ({
      item: cleanString(item?.item),
      max_score: toNumberOrNull(item?.max_score) ?? 0,
    }))
    .filter((item) => item.item);
}

function normalizeKpiIds(list) {
  if (!Array.isArray(list)) return [];
  return list.map((id) => toNumberOrNull(id)).filter((id) => id !== null);
}

function normalizeBranchId(branchValue) {
  if (branchValue === '' || branchValue == null) return undefined;

  const raw = Array.isArray(branchValue) ? branchValue[0] : branchValue;
  const id = toNumberOrNull(raw);

  return id === null ? undefined : id;
}

function normalizeIdArray(value) {
  if (value == null || value === '') return [];

  const list = Array.isArray(value) ? value : [value];

  return list
    .map((item) => {
      if (item == null || item === '') return null;
      if (typeof item === 'object') {
        return item.id ?? item.employee_id ?? item.manager_id ?? item.value ?? null;
      }
      return item;
    })
    .map((item) => toNumberOrNull(item))
    .filter((item) => item !== null && item > 0);
}

export default function buildHireApplicantPayload(values = {}) {
  const employeeValues = values.employee ?? values;

  const hasChronicDisease = toBoolean(values.has_chronic_disease ?? values.hasChronicDisease);
  const isInsured = toBoolean(values.is_insured ?? employeeValues.is_insured);

  const employmentTypeId = toNumberOrNull(employeeValues.employment_type_id);
  const employmentType = cleanString(employeeValues.employment_type).toLowerCase();
  const partTimeMode = cleanString(employeeValues.part_time_mode ?? employeeValues.part_time_type);

  const isFreelancer = employmentType === 'freelancer' || employmentTypeId === 3;
  const isPartTime = employmentType === 'part_time' || employmentTypeId === 2;
  const isFullTime = employmentType === 'full_time' || employmentTypeId === 1;

  const branchId = normalizeBranchId(employeeValues.branch_id);

  const normalizedWeeklyWorkDays = normalizeWeeklyWorkDays(
    employeeValues.weekly_work_days,
    employeeValues.fixed_shift,
    employeeValues.fixed_from,
    employeeValues.fixed_to
  );

  let finalWeeklyWorkDays = [];
  let finalMonthlyHoursRequired = null;
  let finalPartTimeType = null;

  if (isFreelancer) {
    finalWeeklyWorkDays = [];
    finalMonthlyHoursRequired = null;
    finalPartTimeType = null;
  } else if (isPartTime) {
    finalPartTimeType = partTimeMode || null;

    if (partTimeMode === 'hours') {
      finalWeeklyWorkDays = [];
      finalMonthlyHoursRequired = toNumberOrNull(employeeValues.monthly_hours_required);
    } else {
      finalWeeklyWorkDays = normalizedWeeklyWorkDays;
      finalMonthlyHoursRequired = null;
    }
  } else if (isFullTime) {
    finalWeeklyWorkDays = normalizedWeeklyWorkDays;
    finalMonthlyHoursRequired = null;
    finalPartTimeType = null;
  } else {
    finalWeeklyWorkDays = normalizedWeeklyWorkDays;
    finalMonthlyHoursRequired = null;
    finalPartTimeType = null;
  }

  const payload = {
    employee: {
      code:
        cleanString(employeeValues.code) === ''
          ? null
          : Number.isFinite(Number(employeeValues.code))
            ? Number(employeeValues.code)
            : cleanString(employeeValues.code),

      department_id: toNumberOrNull(employeeValues.department_id),
      manager_id: toNumberOrNull(employeeValues.manager_id),
      task_manager: normalizeIdArray(employeeValues.task_manager),

      ...(branchId !== undefined ? { branch_id: branchId } : {}),

      position_id: toNumberOrNull(
        employeeValues.position_id ??
          values.position_applied_for_id ??
          employeeValues.position_applied_for_id
      ),

      shift_id: toNumberOrNull(employeeValues.shift_id),
      employment_type_id: employmentTypeId,
      contract_type: cleanString(employeeValues.contract_type) || null,

      join_date: toDateOnly(employeeValues.join_date),
      end_date: toDateOnly(employeeValues.end_date),

      has_fingerprint: toBoolean(employeeValues.has_fingerprint) ? 1 : 0,

      salary_type: cleanString(employeeValues.salary_type) || 'single',
      base_salary: toNumberOrNull(employeeValues.base_salary),
      kpi: toNumberOrNull(employeeValues.kpi),
      salary_method: cleanString(employeeValues.salary_method) || null,
      salary_payment_day: toNumberOrNull(employeeValues.salary_payment_day),
      salary_payment_day_second: toNumberOrNull(employeeValues.salary_payment_day_second),
      commission_percentage: toNumberOrNull(employeeValues.commission_percentage) ?? 0,

      card_number: cleanString(employeeValues.card_number) || null,
      wallet_number: cleanString(employeeValues.wallet_number) || null,

      part_time_type: finalPartTimeType,
      monthly_hours_required: finalMonthlyHoursRequired,
      weekly_work_days: finalWeeklyWorkDays,

      position_kpi_item_ids: normalizeKpiIds(employeeValues.position_kpi_item_ids),
      custom_kpis: normalizeCustomKpis(employeeValues.custom_kpis),

      salary_details: Array.isArray(employeeValues.salary_details)
        ? employeeValues.salary_details
        : [],

      is_insured: isInsured ? 1 : 0,
      insurance_percentage: isInsured
        ? toNumberOrNull(values.insurance_percentage ?? employeeValues.insurance_percentage)
        : null,
      insurance_salary: isInsured
        ? toNumberOrNull(values.insurance_salary ?? employeeValues.insurance_salary)
        : null,
    },

    is_smoker: toBoolean(values.is_smoker ?? values.isSmoker) ? 1 : 0,
    has_chronic_disease: hasChronicDisease ? 1 : 0,
    chronic_diseases: hasChronicDisease
      ? cleanString(values.chronic_diseases ?? values.chronicDiseases)
      : '',
  };

  return payload;
}
