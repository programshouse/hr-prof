import i18n from '@/i18n';
import { formatMonthsDuration } from '@/utils/durationLabels';
import {
  resolveDepartmentDisplayName,
  resolveEmployeeDisplayName,
  resolveEntityDisplayName,
  resolvePositionDisplayName,
  resolveShiftDisplayName,
} from '@/lib/utils/employeeDisplayName';

const isArabicLocale = () => i18n.language?.startsWith('ar');

const normalizeIdArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (item == null || item === '') return null;
      if (typeof item === 'object') {
        return item.id ?? item.employee_id ?? item.manager_id ?? item.value ?? null;
      }
      return item;
    })
    .map((item) => (item == null || item === '' ? null : Number(item)))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const normalizeImageSourceValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return '';
  return value.trim();
};

/**
 * Resolve ONLY the employee's real profile image.
 *
 * Important: applicant.image is intentionally NOT used here. In the personal
 * data payload that field can point to an uploaded document/attachment, which
 * caused the PDF export to show a different image from the profile header.
 *
 * employeeProfileApi marks the dedicated /employees/:id/image response with
 * profile_image_resolved/profile_image_source. When that endpoint is available
 * it is authoritative, including the "no image" case.
 */
export const getEmployeeProfileImageSource = (profile) => {
  if (!profile) return '';

  const employee =
    profile?.data?.employee ??
    profile?.employee ??
    profile?.data ??
    profile;

  if (!employee || typeof employee !== 'object') return '';

  if (employee.profile_image_resolved === true) {
    return normalizeImageSourceValue(employee.profile_image_source);
  }

  const imageObject =
    employee.image && typeof employee.image === 'object'
      ? employee.image
      : null;

  const profileImageObject =
    employee.profile_image && typeof employee.profile_image === 'object'
      ? employee.profile_image
      : null;

  const applicant = employee.applicant || {};

  const candidates = [
    employee.image_url,
    employee.profile_image_url,
    imageObject?.image_url,
    profileImageObject?.image_url,
    imageObject?.url,
    profileImageObject?.url,
    typeof employee.image === 'string' ? employee.image : '',
    typeof employee.profile_image === 'string' ? employee.profile_image : '',
    employee.image_path,
    employee.profile_image_path,
    imageObject?.image_path,
    profileImageObject?.image_path,
    imageObject?.path,
    profileImageObject?.path,
    // Explicit profile-image fields are safe fallbacks. Generic
    // applicant.image is deliberately excluded.
    applicant.profile_image_url,
    applicant.profile_image_path,
    typeof applicant.profile_image === 'string' ? applicant.profile_image : '',
  ];

  for (const candidate of candidates) {
    const normalized = normalizeImageSourceValue(candidate);
    if (normalized) return normalized;
  }

  return '';
};

/* =========================================================
   EMPLOYEE HEADER INFO
========================================================= */
export const getHeaderEmployeeData = (profile, shifts = [], positions = []) => {
  if (!profile) {
    return {
      name: '',
      role: '',
      avatarUrl: '',
      employeeId: '',
      join_date: '',
      employmentType: '',
    };
  }

  // Extract data from nested structure
  const applicant = profile.applicant || {};
  const position = profile.position || {};
  const preferArabic = isArabicLocale();

  // Get employment type from shift_id
  const shiftId = profile.shift_id || profile.employee?.shift_id;
  const shift = shifts.find((s) => s.id === Number(shiftId));
  const employmentType =
    resolveShiftDisplayName(shift, { preferArabic }) ||
    (typeof profile.shift === 'string' ? profile.shift : '') ||
    '';

  return {
    name:
      resolveEmployeeDisplayName({ ...profile, applicant }, { preferArabic }) ||
      profile.full_name ||
      profile.name ||
      '',
    role:
      resolvePositionDisplayName({ ...profile, position }, { preferArabic, positions }) ||
      position.title_en ||
      position.title ||
      profile.title ||
      '',
    avatarUrl: getEmployeeProfileImageSource(profile),
    employeeId: profile.code || profile.employee_id || '',
    join_date: profile.join_date || '',
    employmentType,
  };
};

/* =========================================================
   CONTRACT DURATION HELPERS
========================================================= */
const calculateContractDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  return Math.max(0, months);
};

const formatDuration = (months) => formatMonthsDuration(i18n.t.bind(i18n), months);

/* =========================================================
   MAIN FORMATTER — prepareDetailsData
   Syncs backend → UI full structure
========================================================= */
export const prepareDetailsData = (
  profile,
  shifts = [],
  positions = [],
  departments = [],
  branches = []
) => {
  if (!profile) return null;

  // ✅ unwrap API response (status/message/data/employee)
  const emp = profile?.data?.employee ?? profile?.employee ?? profile;

  // Extract nested data
  const applicant = emp.applicant || {};
  const position = emp.position || {};
  const department = emp.department || {};
  const preferArabic = isArabicLocale();

  const departmentFromCatalog = departments.find(
    (item) => String(item.id) === String(emp.department_id)
  );
  const companyFromCatalog = departments.find(
    (item) => String(item.id) === String(emp.company_id)
  );
  const branchFromCatalog = branches.find(
    (item) => String(item.id) === String(emp.branch_id)
  );
  const shiftFromCatalog = shifts.find((item) => Number(item.id) === Number(emp.shift_id));

  const localizedFullName =
    resolveEmployeeDisplayName({ ...emp, applicant }, { preferArabic }) ||
    `${applicant.first_name || ''} ${applicant.middle_name || ''} ${applicant.last_name || ''}`
      .trim() ||
    profile.full_name ||
    profile.name ||
    '';

  const rawEmploymentType =
    applicant.employment_type || emp.employment_type || emp.employee?.employment_type || '';

  const normalizedEmploymentType = rawEmploymentType.toString().toLowerCase().trim();

  const isFreelancer =
    normalizedEmploymentType === 'freelancer' || normalizedEmploymentType === 'free lancer';

  /* ==============================================
     BASIC SECTION
  ============================================== */
  const basic = {
    firstName: applicant.first_name || '',
    middleName: applicant.middle_name || '',
    lastName: applicant.last_name || '',
    preferredName: applicant.preferred_name || '',
    full_name: localizedFullName,
    employeeId: profile.code || profile.employee_id || profile.employeeCode || '',
    birth_date: applicant.birth_date || profile.birth_date || '',
    maritalStatus: applicant.marital_status || profile.marital_status || '',
    nationalId: applicant.national_id || profile.national_id || '',
    nationalIdExpiryDate: String(
      emp.national_id_expiry_date || profile.national_id_expiry_date || ''
    ).slice(0, 10),
    gender: applicant.gender || profile.gender || '',
    militaryService: applicant.military_service || profile.military_service || '',
  };

  /* ==============================================
     CONTACT SECTION
  ============================================== */
  const contact = {
    phone: applicant.phone || profile.phone || '',
    whatsapp: applicant.whatsapp_number || profile.whatsapp_number || '',
    email: applicant.email || profile.email || '',
    address: `${profile.governorate || ''} / ${profile.country || ''}`,
    countryId: applicant.country_id || profile.country_id || '',
    governorateId: applicant.governorate_id || profile.governorate_id || '',
    city: applicant.city || profile.city || '',
    // Store string names if IDs are not available
    countryName: profile.country || '',
    governorateName: profile.governorate || '',
    // Social links
    facebookLink: applicant.facebook_link || '',
    linkedinLink: applicant.linkedin_link || '',
    githubLink: applicant.github_link || '',
    additionalLinks: Array.isArray(applicant.additional_link) ? applicant.additional_link : [],
  };

  /* ==============================================
     DOCUMENTS
  ============================================== */
  const documents = [
    ...(profile.contracts || []),
    ...(profile.documents || []),
    ...(applicant.cv ? [{ name: 'CV', url: applicant.cv }] : []),
    ...(applicant.certification_attatchment
      ? [{ name: 'Certification', url: applicant.certification_attatchment }]
      : []),
  ];

  /* ==============================================
     WORK SECTION
  ============================================== */
  const weeklyWorkDaysRaw = (() => {
    try {
      const arr = JSON.parse(emp.weekly_work_days || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  })();

  const partTimeMode = weeklyWorkDaysRaw.length > 0 ? 'days' : 'hours';

  const work = {
    manager_id: emp.manager_id || '',
    managerName: emp.manager || '',
    task_manager: normalizeIdArray(emp.task_manager),

    position_id: emp.position_id || '',
    positionName:
      resolvePositionDisplayName({ ...emp, position }, { preferArabic, positions }) ||
      position.title_en ||
      position.title ||
      emp.position ||
      '',

    department_id: emp.department_id || '',
    departmentName:
      resolveDepartmentDisplayName(departmentFromCatalog, { preferArabic }) ||
      resolveDepartmentDisplayName(department, { preferArabic }) ||
      resolveEntityDisplayName(departmentFromCatalog, { preferArabic }) ||
      resolveEntityDisplayName(department, { preferArabic }) ||
      department.name_en ||
      department.name ||
      emp.department ||
      '',

    company_id: emp.company_id || '',
    companyName:
      resolveEntityDisplayName(companyFromCatalog, { preferArabic }) ||
      resolveEntityDisplayName(emp.company, { preferArabic }) ||
      emp.company?.name_en ||
      emp.company?.name ||
      emp.company ||
      '',

    branch_id: emp.branch_id || '',
    branchName:
      resolveEntityDisplayName(branchFromCatalog, { preferArabic }) ||
      resolveEntityDisplayName(emp.branches?.[0], { preferArabic }) ||
      resolveEntityDisplayName(emp.branch, { preferArabic }) ||
      emp.branches?.[0]?.name_en ||
      emp.branches?.[0]?.name ||
      emp.branch ||
      '',
    branch: branchFromCatalog || emp.branches?.[0] || emp.branch || null,
    company: companyFromCatalog || emp.company || null,
    department: departmentFromCatalog || department || null,

    part_time_type: emp.part_time_type || emp.partTimeType || '',
    shift_id: emp.shift_id || emp.shift || '',

    partTimeMode,

    workDays: isFreelancer
      ? '--'
      : (() => {
          try {
            const arr = JSON.parse(emp.weekly_work_days || '[]');
            if (!Array.isArray(arr) || arr.length === 0) return '--';

            return arr
              .map((d) => `${d.day} (${d.start_time || '--'} - ${d.end_time || '--'})`)
              .join(', ');
          } catch {
            return '--';
          }
        })(),

    weekly_work_days: weeklyWorkDaysRaw,

    shiftHours: isFreelancer ? '' : emp.shift_hours || '',
    monthly_hours_required: isFreelancer ? '' : emp.monthly_hours_required || '',

    shiftType: Number(emp.shift_id || emp.shift || ''),
    shiftName:
      resolveShiftDisplayName(shiftFromCatalog, { preferArabic }) ||
      resolveShiftDisplayName(emp.shift, { preferArabic }) ||
      '',
  };

  /* ==============================================
     CONTRACT SECTION
  ============================================== */
  const contractStartDate = emp.join_date || '';
  const contractEndDate = emp.end_date || '';

  const contractDuration =
    contractStartDate && contractEndDate
      ? calculateContractDuration(contractStartDate, contractEndDate)
      : null;

  const contract = {
    type: emp.contract_type || emp.contractType || emp.employment_contract_type || '',
    contract_type:
      emp.contract_type || emp.contractType || emp.employment_contract_type || '',
    duration: contractDuration !== null ? formatDuration(contractDuration) : '--',
    startDate: contractStartDate,
    endDate: contractEndDate,
    _durationMonths: contractDuration,
  };

  /* ==============================================
     SALARY SECTION
  ============================================== */
  const rawSalaryType = emp.salary_type || 'fixed';

  const salary = {
    type: String(rawSalaryType),

    // ✅ like base salary: keep as string formatted to 2 decimals
    net: (Number(emp.base_salary ?? 0)).toFixed(2),

    // ✅ SAME WAY: KPI formatted to 2 decimals (will show 7.00)
    kpi: (Number(emp.kpi ?? 0)).toFixed(2),
    
    commission: emp.commission || emp.commission_percentage || '0.00',

    salary_method: emp.salary_method || '',
    salary_payment_day: emp.salary_payment_day == null ? '' : String(emp.salary_payment_day),
    salary_payment_day_second:
      emp.salary_payment_day_second == null ? '' : String(emp.salary_payment_day_second),
    card_number: emp.card_number || '',
    wallet_number: emp.wallet_number || '',

    averageDetails: Array.isArray(emp.salary_details)
      ? emp.salary_details.map((item) => {
          const deptFromCatalog = departments.find(
            (dept) =>
              String(dept.id) === String(item.department_id) ||
              dept.name_en === item.department_name ||
              dept.name_ar === item.department_name
          );

          return {
            department:
              resolveDepartmentDisplayName(deptFromCatalog, { preferArabic }) ||
              resolveEntityDisplayName(deptFromCatalog, { preferArabic }) ||
              item.department_name,
            amount: item.amount,
            salary: (Number(emp.base_salary ?? 0)).toFixed(2),
            kpi: (Number(emp.kpi ?? 0)).toFixed(2),
            commission: emp.commission || emp.commission_percentage || '0.00',
          };
        })
      : [],
  };

  /* ==============================================
     QUALIFICATIONS SECTION (new)
  ============================================== */
  const qualifications = {
    languages: Array.isArray(applicant.languages) ? applicant.languages : [],
    skills: Array.isArray(applicant.skills) ? applicant.skills : [],
    educations: Array.isArray(applicant.educations) ? applicant.educations : [],
    experiences: Array.isArray(applicant.experiences) ? applicant.experiences : [],
  };

  /* ==============================================
     KPI ITEMS SECTION
  ============================================== */
  const kpi_items = emp.kpi_items || [];

  /* ==============================================
     FINAL RETURN STRUCTURE
  ============================================== */
  return {
    employmentType: rawEmploymentType,
    isFreelancer,
    // Keep the profile image mapping consistent with the header/PDF.
    // Never fall back to applicant.image because it can be a document.
    image_url: getEmployeeProfileImageSource(emp),
    image_path:
      emp.image_path ||
      emp.image?.image_path ||
      emp.profile_image_path ||
      emp.profile_image?.image_path ||
      '',
    basic,
    contact,
    documents,
    work,
    contract,
    salary,
    qualifications,
    kpi_items,
  };
};

/* =========================================================
   HANDLE FIELD CHANGE
========================================================= */
export const handleFieldChange = (setEditableDetails) => (section, field, value) => {
  setEditableDetails((prev) => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value,
    },
  }));
};

/* =========================================================
   CANCEL EDIT MODE
========================================================= */
export const handleCancelEdit = (detailsData, setEditableDetails, setIsEditing) => () => {
  setEditableDetails(detailsData);
  setIsEditing(false);
};

/* =========================================================
   SAVE CHANGES — API PAYLOAD BUILDER
========================================================= */
export const handleSaveChanges = async ({
  id,
  editableDetails,
  detailsData,
  updateEmployeeProfile,
  setIsEditing,
  toast,
}) => {
  if (!id || !editableDetails || !detailsData) return;

  const payload = {};
  const employeePayload = {};

  const {
    basic: origBasic,
    contact: origContact,
    work: origWork,
    contract: origContract,
    salary: origSalary,
  } = detailsData;

  const { basic, contact, work, contract, salary } = editableDetails;

  /* ---------------- Utils ---------------- */
  const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const toCommissionNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace('%', '').trim();
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  };

  /* =========================================================
     BASIC
  ========================================================= */
  if (basic.full_name !== origBasic.full_name) payload.full_name = basic.full_name;
  if (basic.birth_date !== origBasic.birth_date) payload.birth_date = basic.birth_date;
  if (basic.maritalStatus !== origBasic.maritalStatus) payload.marital_status = basic.maritalStatus;
  if (basic.nationalId !== origBasic.nationalId) payload.national_id = basic.nationalId;
  if (basic.nationalIdExpiryDate !== origBasic.nationalIdExpiryDate)
    employeePayload.national_id_expiry_date = basic.nationalIdExpiryDate || null;
  if (basic.gender !== origBasic.gender) payload.gender = basic.gender;
  if (basic.militaryService !== origBasic.militaryService)
    payload.military_service = basic.militaryService;

  /* =========================================================
     CONTACT
  ========================================================= */
  if (contact.phone !== origContact.phone) payload.phone = contact.phone;
  if (contact.whatsapp !== origContact.whatsapp) payload.whatsapp_number = contact.whatsapp;
  if (contact.email !== origContact.email) payload.email = contact.email;
  if (contact.address !== origContact.address) payload.address = contact.address;

  if (contact.countryId !== origContact.countryId) payload.country_id = contact.countryId || null;
  if (contact.governorateId !== origContact.governorateId)
    payload.governorate_id = contact.governorateId || null;

  if (contact.city !== origContact.city) payload.city = contact.city || '';

  if (contact.facebookLink !== origContact.facebookLink)
    payload.facebook_link = contact.facebookLink || '';
  if (contact.linkedinLink !== origContact.linkedinLink)
    payload.linkedin_link = contact.linkedinLink || '';
  if (contact.githubLink !== origContact.githubLink) payload.github_link = contact.githubLink || '';

  const currentAdditionalLinks = Array.isArray(contact.additionalLinks) ? contact.additionalLinks : [];
  const origAdditionalLinks = Array.isArray(origContact.additionalLinks) ? origContact.additionalLinks : [];
  if (JSON.stringify(currentAdditionalLinks) !== JSON.stringify(origAdditionalLinks)) {
    payload.additional_link = currentAdditionalLinks;
  }

  /* =========================================================
     WORK
  ========================================================= */
  if (work.manager_id !== origWork.manager_id)
    employeePayload.manager_id = toNumberOrNull(work.manager_id);

  if (JSON.stringify(normalizeIdArray(work.task_manager)) !== JSON.stringify(normalizeIdArray(origWork.task_manager))) {
    employeePayload.task_manager = normalizeIdArray(work.task_manager);
  }

  if (work.position_id !== origWork.position_id)
    employeePayload.position_id = toNumberOrNull(work.position_id);

  if (work.company_id !== origWork.company_id)
    employeePayload.company_id = toNumberOrNull(work.company_id);

  if (work.branch_id !== origWork.branch_id)
    employeePayload.branch_id = toNumberOrNull(work.branch_id);

  if (work.shiftType !== origWork.shiftType)
    employeePayload.shift_id = toNumberOrNull(work.shiftType);

  if (work.monthly_hours_required !== origWork.monthly_hours_required)
    employeePayload.monthly_hours_required = toNumberOrNull(work.monthly_hours_required);

  if (JSON.stringify(work.weekly_work_days || []) !== JSON.stringify(origWork.weekly_work_days || [])) {
    employeePayload.weekly_work_days = JSON.stringify(work.weekly_work_days || []);
  }

  /* =========================================================
     CONTRACT
  ========================================================= */
  if (contract.type !== origContract.type) employeePayload.contract_type = contract.type;

  if (contract.startDate !== origContract.startDate) employeePayload.join_date = contract.startDate;

  if (contract.endDate !== origContract.endDate) employeePayload.end_date = contract.endDate;

  if (contract.startDate && contract.endDate) {
    const s = new Date(contract.startDate);
    const e = new Date(contract.endDate);

    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      employeePayload.contract_duration = Math.max(
        0,
        (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
      );
    }
  }

  /* =========================================================
     SALARY
  ========================================================= */
  if (salary.type !== origSalary.type) employeePayload.salary_type = salary.type;

  if (toNumberOrNull(salary.net) !== toNumberOrNull(origSalary.net))
    employeePayload.base_salary = toNumberOrNull(salary.net);

  if (toNumberOrNull(salary.kpi) !== toNumberOrNull(origSalary.kpi))
    employeePayload.kpi = toNumberOrNull(salary.kpi);

  const commissionNow = toCommissionNumber(salary.commission);
  const commissionOrig = toCommissionNumber(origSalary.commission);

  if (commissionNow !== commissionOrig) employeePayload.commission_percentage = commissionNow;

  if (salary.salary_method !== origSalary.salary_method)
    employeePayload.salary_method = salary.salary_method || '';

  if (salary.salary_payment_day !== origSalary.salary_payment_day)
    employeePayload.salary_payment_day = toNumberOrNull(salary.salary_payment_day);

  if (salary.salary_payment_day_second !== origSalary.salary_payment_day_second)
    employeePayload.salary_payment_day_second = toNumberOrNull(salary.salary_payment_day_second);

  if (salary.card_number !== origSalary.card_number)
    employeePayload.card_number = salary.card_number || '';

  if (salary.wallet_number !== origSalary.wallet_number)
    employeePayload.wallet_number = salary.wallet_number || '';

  if (basic.employeeId !== origBasic.employeeId) employeePayload.code = basic.employeeId;

  /* =========================================================
     MERGE PAYLOAD
  ========================================================= */
  if (Object.keys(employeePayload).length > 0) payload.employee = employeePayload;

  if (Object.keys(payload).length === 0) {
    toast.info('No changes to save');
    setIsEditing(false);
    return;
  }

  /* =========================================================
     API CALL
  ========================================================= */
  try {
    await updateEmployeeProfile(id, payload);
    toast.success('Profile updated successfully');
    setIsEditing(false);
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to update profile');
    console.error(err);
  }
};
