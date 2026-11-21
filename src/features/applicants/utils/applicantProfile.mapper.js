// src/features/applicants/utils/applicantProfile.mapper.js
const FALLBACK = '—';

const safe = (value, fallback = FALLBACK) => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

const formatDate = (value) => {
  if (!value) return FALLBACK;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return FALLBACK;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const fullNameOf = (applicant) =>
  [applicant?.first_name, applicant?.middle_name, applicant?.last_name]
    .filter(Boolean)
    .join(' ') || applicant?.preferred_name || FALLBACK;

const buildFileUrl = (file) => {
  if (!file) return null;
  if (String(file).startsWith('http')) return file;
  return file;
};

const getGovernorate = (applicant) => {
  if (!applicant) return FALLBACK;

  // supports both:
  // governorate: "Alexandria"
  // governorate: { name: "Alexandria" }
  if (typeof applicant.governorate === 'string') {
    return safe(applicant.governorate);
  }

  if (typeof applicant.governorate === 'object' && applicant.governorate !== null) {
    return safe(applicant.governorate.name);
  }

  return FALLBACK;
};

export function mapApplicantProfile(applicant) {
  if (!applicant) return null;

  const fullName = fullNameOf(applicant);

  return {
    id: applicant.id,
    applicantCode: safe(applicant.applicant_code),
    name: fullName,
    preferredName: safe(applicant.preferred_name),
    avatar: applicant.image || null,
    status: safe(applicant.status),
    title: safe(applicant.position_title_en || applicant.position_title_ar || 'Applicant'),
    hiring_manager_id: applicant.hiring_manager_id ?? null,
    hiring_manager_name: applicant.hiring_manager_name ?? applicant.hiring_manager?.name ?? null,
    hiring_manager_note: applicant.hiring_manager_note ?? '',
    hiring_hr_id: applicant.hiring_hr_id ?? null,
    hiring_hr_name: applicant.hiring_hr_name ?? applicant.hiring_hr?.name ?? null,
    hiring_hr_note: applicant.hiring_hr_note ?? '',
    hiring: {
      lineManagerId: applicant.hiring_manager_id ?? null,
      lineManagerName: applicant.hiring_manager_name ?? applicant.hiring_manager?.name ?? null,
      lineManagerNote: applicant.hiring_manager_note ?? '',
      hrManagerId: applicant.hiring_hr_id ?? null,
      hrManagerName: applicant.hiring_hr_name ?? applicant.hiring_hr?.name ?? null,
      hrManagerNote: applicant.hiring_hr_note ?? '',
    },

    basic: {
      fullName,
      gender: safe(applicant.gender),
      birthDate: formatDate(applicant.birth_date),
      maritalStatus: safe(applicant.marital_status),
      nationalId: safe(applicant.national_id),
      militaryService: safe(applicant.military_service),
      isSmoker: Number(applicant.is_smoker) === 1 ? 'Yes' : 'No',
      hasChronicDisease:
        Number(applicant.has_chronic_disease) === 1 ? 'Yes' : 'No',
      chronicDiseases: safe(applicant.chronic_diseases),
      address: safe(applicant.address),
    },

    contact: {
      phone: safe(applicant.phone),
      whatsapp: safe(applicant.whatsapp_number),
      email: safe(applicant.email),
      city: safe(applicant.city),
      country: safe(applicant.country),
      governorate: getGovernorate(applicant),
      address: safe(applicant.address),
    },

    role: {
      position: safe(applicant.position_title_en || applicant.position_title_ar),
      employmentType: safe(applicant.employment_type),
      workSetup: safe(applicant.work_setup),
      availableStartDate: formatDate(applicant.available_start_date),
      expectedSalary: safe(applicant.expected_salary),
      status: safe(applicant.status),
      createdAt: formatDate(applicant.created_at),
      updatedAt: formatDate(applicant.updated_at),
      rate: safe(applicant.rate, 0),
      interviewsCount: safe(applicant.interviews_count, 0),
    },

    qualifications: {
      experiences: Array.isArray(applicant.experiences)
        ? applicant.experiences
        : [],
      skills: Array.isArray(applicant.skills)
        ? applicant.skills
        : [],
      soft_skills: [],
      languages: Array.isArray(applicant.languages)
        ? applicant.languages
        : [],
      educations: Array.isArray(applicant.educations)
        ? applicant.educations
        : [],
    },

    documents: [
      applicant.cv
        ? {
            label: 'CV',
            url: buildFileUrl(applicant.cv),
          }
        : null,
      applicant.certification_attatchment
        ? {
            label: 'Certification',
            url: buildFileUrl(applicant.certification_attatchment),
          }
        : null,
    ].filter(Boolean),

    links: [
      applicant.linkedin_link
        ? { label: 'LinkedIn', url: applicant.linkedin_link }
        : null,
      applicant.github_link
        ? { label: 'GitHub', url: applicant.github_link }
        : null,
      applicant.facebook_link
        ? { label: 'Facebook', url: applicant.facebook_link }
        : null,
      applicant.additional_link
        ? { label: 'Additional Link', url: applicant.additional_link }
        : null,
    ].filter(Boolean),

    coverLetter: applicant.cover_letter || '',
  };
}