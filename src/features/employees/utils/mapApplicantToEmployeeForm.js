// src/features/employees/utils/mapApplicantToEmployeeForm.js

function normalizeBool(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function safeString(value) {
  return value ?? '';
}

function toDateOnly(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function toNumberOrEmpty(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
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
    .filter((item) => item !== null && item !== undefined && item !== '')
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function mapEducations(list) {
  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    id: item?.id ?? undefined,
    degree_level: safeString(item?.degree_level),
    field_of_study: safeString(item?.field_of_study),
    institution: safeString(item?.institution),
    institution_country: safeString(item?.institution_country),
    start_date: toDateOnly(item?.start_date),
    end_date: toDateOnly(item?.end_date),
    education_attatchment: item?.education_attatchment ?? null,
  }));
}

function mapExperiences(list) {
  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    id: item?.id ?? undefined,
    job_title: safeString(item?.job_title),
    company_name: safeString(item?.company_name),
    employment_type: safeString(item?.employment_type),
    work_setup: safeString(item?.work_setup),
    start_date: toDateOnly(item?.start_date),
    end_date: toDateOnly(item?.end_date),
    is_current: normalizeBool(item?.is_current),
    salary: safeString(item?.salary),
    manager_name: safeString(item?.manager_name),
    manager_phone: safeString(item?.manager_phone),
    manager_email: safeString(item?.manager_email),
    okay_to_contact: normalizeBool(item?.okay_to_contact),
    key_responsibilities: safeString(item?.key_responsibilities),
  }));
}

function mapSkills(list) {
  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    id: item?.id ?? undefined,
    name: safeString(item?.name),
    level: item?.level ?? '',
  }));
}

function mapLanguages(list) {
  if (!Array.isArray(list)) return [];

  return list.map((item) => ({
    id: item?.id ?? undefined,
    language: safeString(item?.language),
    level: safeString(item?.level),
  }));
}

/**
 * Maps applicant details response into employee form values.
 * Steps 1-7 are prefilled from applicant.
 * Step 8-9 are employee hiring details.
 */
export default function mapApplicantToEmployeeForm(applicant = {}) {
  const fallbackPositionId = applicant?.position_id ?? applicant?.position_applied_for_id ?? '';

  return {
    id: applicant?.id ?? undefined,

    first_name: safeString(applicant.first_name),
    middle_name: safeString(applicant.middle_name),
    last_name: safeString(applicant.last_name),
    preferred_name: safeString(applicant.preferred_name),
    full_name_ar: safeString(applicant.full_name_ar),

    national_id: safeString(applicant.national_id),
    email: safeString(applicant.email),
    phone: safeString(applicant.phone),
    whatsapp_number: safeString(applicant.whatsapp_number),
    birth_date: toDateOnly(applicant.birth_date),

    country_id: toNumberOrEmpty(applicant.country_id),
    governorate_id: toNumberOrEmpty(applicant.governorate_id),
    city: safeString(applicant.city),
    marital_status: safeString(applicant.marital_status),
    gender: safeString(applicant.gender),
    military_service: safeString(applicant.military_service),

    position_applied_for_id: toNumberOrEmpty(fallbackPositionId),
    work_setup: safeString(applicant.work_setup) || 'onsite',
    available_start_date: toDateOnly(applicant.available_start_date),
    expected_salary: safeString(applicant.expected_salary),
    how_did_you_hear_about_this_role: safeString(applicant.how_did_you_hear_about_this_role),

    facebook_link: safeString(applicant.facebook_link),
    linkedin_link: safeString(applicant.linkedin_link),
    github_link: safeString(applicant.github_link),
    additional_link: safeString(applicant.additional_link),

    cv: applicant.cv ?? null,
    cover_letter: applicant.cover_letter ?? null,
    image: applicant.image ?? null,
    certification_attatchment: applicant.certification_attatchment ?? null,

    consent_data_processing: normalizeBool(applicant.consent_data_processing),
    consent_information_accurate: normalizeBool(applicant.consent_information_accurate),
    consent_reference_checks: normalizeBool(applicant.consent_reference_checks),

    is_smoker: normalizeBool(applicant.is_smoker),
    has_chronic_disease: normalizeBool(applicant.has_chronic_disease),
    chronic_diseases: safeString(applicant.chronic_diseases),

    educations: mapEducations(applicant.educations),
    experiences: mapExperiences(applicant.experiences),
    skills: mapSkills(applicant.skills),
    languages: mapLanguages(applicant.languages),

    employee: {
      applicant_id: applicant.id ?? null,

      code: safeString(applicant?.employee?.code),
      department_id: toNumberOrEmpty(applicant?.employee?.department_id),
      task_manager: normalizeIdArray(applicant?.employee?.task_manager),
      manager_id: toNumberOrEmpty(applicant?.employee?.manager_id),
      branch_id: toNumberOrEmpty(applicant?.employee?.branch_id),
      position_id: toNumberOrEmpty(
        applicant?.position_applied_for_id ??
          applicant?.position_id ??
          applicant?.employee?.position_id
      ),

      salary_type: safeString(applicant?.employee?.salary_type) || 'single',
      contract_type: safeString(applicant?.employee?.contract_type) || 'full_time',

      employment_type_id:
        toNumberOrEmpty(applicant?.employee?.employment_type_id) ||
        (safeString(applicant?.employee?.part_time_type) ? 2 : 1),
      part_time_mode: safeString(applicant?.employee?.part_time_type),
      part_time_type: safeString(applicant?.employee?.part_time_type),
      monthly_hours_required: applicant?.employee?.monthly_hours_required ?? '',

      weekly_work_days:
        typeof applicant?.employee?.weekly_work_days === 'string'
          ? (() => {
              try {
                const parsed = JSON.parse(applicant.employee.weekly_work_days);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            })()
          : Array.isArray(applicant?.employee?.weekly_work_days)
            ? applicant.employee.weekly_work_days
            : [],
      base_salary: safeString(applicant?.employee?.base_salary),
      hourly_rate: safeString(applicant?.employee?.hourly_rate),

      position_kpi_item_ids: Array.isArray(applicant?.position_kpi_item_ids)
        ? applicant.position_kpi_item_ids
        : [],

      custom_kpis: Array.isArray(applicant?.custom_kpis)
        ? applicant.custom_kpis.map((item) => ({
            item: safeString(item?.item),
            max_score: item?.max_score ?? '',
          }))
        : [],

      salary_payment_day: applicant?.employee?.salary_payment_day ?? '',
      salary_payment_day_second: applicant?.employee?.salary_payment_day_second ?? '',
    },
  };
}
