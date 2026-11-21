const normalizeWeeklyWorkDaysUIToArray = (weeklyWorkDaysObj) => {
  const out = [];
  if (!weeklyWorkDaysObj || typeof weeklyWorkDaysObj !== 'object') return out;

  Object.entries(weeklyWorkDaysObj).forEach(([key, val]) => {
    const enabled = val?.enabled === true || val?.enabled === 1;
    const from = val?.from ? String(val.from).trim() : '';
    const to = val?.to ? String(val.to).trim() : '';

    if (enabled && from && to) {
      out.push({
        day: String(key).toLowerCase(),
        start_time: from.slice(0, 5),
        end_time: to.slice(0, 5),
      });
    }
  });

  return out;
};

const isFile = (v) => typeof File !== 'undefined' && v instanceof File;
const isBlob = (v) => typeof Blob !== 'undefined' && v instanceof Blob;
const isFileList = (v) => typeof FileList !== 'undefined' && v instanceof FileList;

const isFileFieldKey = (key = '') => {
  if (key === 'cv') return true;
  if (key === 'certification_attatchment') return true;
  if (key.includes('[education_attatchment]')) return true;
  if (key.includes('employee[contracts]')) return true;
  return false;
};

export function buildEmployeeFormData(values) {
  const formData = new FormData();

  let processedValues = values;

  const employmentType = String(processedValues?.employee?.employment_type || '').toLowerCase();
  const employmentTypeId = Number(processedValues?.employee?.employment_type_id);

  const isPartTime = employmentType === 'part_time' || employmentTypeId === 2;
  const isFreelancer = employmentType === 'freelancer' || employmentTypeId === 3;

  const partTimeType = String(
    processedValues?.employee?.part_time_type ||
      processedValues?.employee?.part_time_mode ||
      ''
  ).toLowerCase();

  const wwd = processedValues?.employee?.weekly_work_days;

  if (typeof wwd === 'string') {
    try {
      const parsed = JSON.parse(wwd);
      processedValues = {
        ...processedValues,
        employee: {
          ...processedValues.employee,
          weekly_work_days: Array.isArray(parsed) ? parsed : [],
        },
      };
    } catch {
      processedValues = {
        ...processedValues,
        employee: {
          ...processedValues.employee,
          weekly_work_days: [],
        },
      };
    }
  }

  const wwd2 = processedValues?.employee?.weekly_work_days;

  if (wwd2 && typeof wwd2 === 'object' && !Array.isArray(wwd2)) {
    processedValues = {
      ...processedValues,
      employee: {
        ...processedValues.employee,
        weekly_work_days: normalizeWeeklyWorkDaysUIToArray(wwd2),
      },
    };
  }

  if (processedValues?.employee) {
    if (isFreelancer) {
      const isFreelancerHours = partTimeType === 'hours';

      processedValues.employee.part_time_type = isFreelancerHours ? 'hours' : '';
      processedValues.employee.part_time_mode = undefined;
      processedValues.employee.weekly_work_days = [];
      processedValues.employee.fixed_shift = undefined;
      delete processedValues.employee.fixed_from;
      delete processedValues.employee.fixed_to;
      processedValues.employee._manually_set_working_mode = undefined;

      if (!isFreelancerHours) {
        processedValues.employee.monthly_hours_required = '';
      }
    } else if (isPartTime) {
      if (partTimeType === 'hours') {
        processedValues.employee.part_time_type = 'hours';
        processedValues.employee.weekly_work_days = [];
      } else if (partTimeType === 'days') {
        processedValues.employee.part_time_type = 'days';
        processedValues.employee.monthly_hours_required = '';
      }
    } else {
      processedValues.employee.part_time_type = '';
      processedValues.employee.part_time_mode = undefined;
      processedValues.employee.monthly_hours_required = '';
      processedValues.employee._manually_set_working_mode = undefined;
    }
  }

  const shouldForceClearWeeklyWorkDays =
    Array.isArray(processedValues?.employee?.weekly_work_days) &&
    processedValues.employee.weekly_work_days.length === 0;

  const shouldForceClearMonthlyHours =
    processedValues?.employee?.monthly_hours_required === '';

  const shouldForceClearPartTimeType =
    processedValues?.employee?.part_time_type === '';

  const buildFormData = (data, parentKey) => {
    if (isFileList(data)) {
      if (parentKey && parentKey.includes('contract_file')) return;
      if (data.length === 0) return;

      if (isFileFieldKey(parentKey)) {
        formData.append(parentKey, data[0]);
        return;
      }

      Array.from(data).forEach((file) => formData.append(parentKey, file));
      return;
    }

    if (isFile(data) || isBlob(data)) {
      if (!parentKey) return;
      formData.append(parentKey, data);
      return;
    }

    if (data && typeof data === 'object' && !(data instanceof Date)) {
      if (Array.isArray(data)) {
        if (data.length === 0) {
          if (parentKey === 'employee[weekly_work_days]' && shouldForceClearWeeklyWorkDays) {
            formData.append(parentKey, '[]');
          }
          return;
        }

        data.forEach((item, index) => {
          buildFormData(item, parentKey ? `${parentKey}[${index}]` : `${index}`);
        });
        return;
      }

      Object.keys(data).forEach((key) => {
        buildFormData(data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
      return;
    }

    if (data === undefined || data === null) return;

    let value = data;

    if (data instanceof Date) value = data.toISOString().slice(0, 10);

    if (parentKey && isFileFieldKey(parentKey) && typeof value === 'string') {
      return;
    }

    if (parentKey && isFileFieldKey(parentKey) && (value === '' || value === null)) {
      return;
    }

    const finalValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;

    if (parentKey) formData.append(parentKey, finalValue);
  };

  if (processedValues?.employee?.contract_file && isFileList(processedValues.employee.contract_file)) {
    const list = processedValues.employee.contract_file;

    if (list.length > 0) {
      Array.from(list).forEach((file) => {
        formData.append('employee[contracts][]', file);
      });
    }

    processedValues = {
      ...processedValues,
      employee: {
        ...processedValues.employee,
        contract_file: undefined,
      },
    };
  }

  buildFormData(processedValues, '');

  if (shouldForceClearMonthlyHours) {
    formData.append('employee[monthly_hours_required]', '');
  }

  if (shouldForceClearPartTimeType) {
    formData.append('employee[part_time_type]', '');
  }

  return formData;
}