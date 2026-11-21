function isFileLike(v) {
  return v instanceof File || v instanceof Blob;
}

function fileFromValue(v) {
  if (!v) return null;
  if (v instanceof File) return v;
  if (v instanceof FileList && v.length) return v[0];
  return null;
}

function toDateOnly(v) {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string') return v.slice(0, 10);
  return '';
}

// Do NOT append null/undefined/empty-string for optional fields (unless required)
function appendFormData(fd, key, value) {
  if (value === undefined || value === null) return;

  if (typeof value === 'string' && value.trim() === '') return;

  const f = fileFromValue(value);
  if (f) {
    fd.append(key, f);
    return;
  }

  if (Array.isArray(value)) {
    if (!value.length) return;
    value.forEach((item, index) => {
      appendFormData(fd, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === 'object' && !isFileLike(value)) {
    const entries = Object.entries(value);
    if (!entries.length) return;

    entries.forEach(([k, v]) => {
      appendFormData(fd, `${key}[${k}]`, v);
    });
    return;
  }

  if (typeof value === 'boolean') {
    fd.append(key, value ? '1' : '0');
    return;
  }

  fd.append(key, String(value));
}

export function buildApplicantFormData(values) {
  const country_id = values.country_id ? Number(values.country_id) : undefined;
  const governorate_id = values.governorate_id ? Number(values.governorate_id) : undefined;
  const position_applied_for_id = values.position_applied_for_id
    ? Number(values.position_applied_for_id)
    : undefined;

  const is_smoker =
    values.is_smoker === true || values.is_smoker === 1 || values.is_smoker === '1';

  const has_chronic_disease =
    values.has_chronic_disease === true ||
    values.has_chronic_disease === 1 ||
    values.has_chronic_disease === '1';

  const payload = {
    full_name_ar: values.full_name_ar,
    first_name: values.first_name,
    middle_name: values.middle_name,
    last_name: values.last_name,
    preferred_name: values.preferred_name,
    national_id: values.national_id,
    email: values.email,
    phone: values.phone,
    whatsapp_number: values.whatsapp_number,
    birth_date: toDateOnly(values.birth_date),

    is_smoker,
    has_chronic_disease,
    chronic_diseases: has_chronic_disease ? values.chronic_diseases : undefined,

    country_id,
    governorate_id,
    city: values.city,
    marital_status: values.marital_status,
    gender: values.gender,
    military_service: values.military_service,

    // send both to support backend variations
    position_applied_for_id,
    position_id: position_applied_for_id,
    company_id: values.company_id ? Number(values.company_id) : undefined,
    apply_code: values.apply_code || values.code || undefined,
    code: values.apply_code || values.code || undefined,

    work_setup: values.work_setup,
    available_start_date: toDateOnly(values.available_start_date),
    expected_salary: values.expected_salary,
    how_did_you_hear_about_this_role: values.how_did_you_hear_about_this_role,

    facebook_link: values.facebook_link,
    linkedin_link: values.linkedin_link,
    github_link: values.github_link,
    additional_link: values.additional_link,

    cover_letter: values.cover_letter,

    consent_data_processing: values.consent_data_processing,
    consent_information_accurate: values.consent_information_accurate,
    consent_reference_checks: values.consent_reference_checks,

    experiences: values.experiences || [],
    educations: values.educations || [],
    skills: values.skills || [],
    languages: values.languages || [],

    cv: values.cv,
    certification_attatchment: values.certification_attatchment,
  };

  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => appendFormData(fd, k, v));
  return fd;
}