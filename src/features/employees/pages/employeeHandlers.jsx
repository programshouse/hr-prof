import i18n from '@/i18n';
import { formatMonthsDuration } from '@/utils/durationLabels';

/* =========================================================
   EMPLOYEE PROFILE — HELPERS (COMPLETE FILE)
   Fix: Do NOT send employee.monthly_hours_required unless Part-time (hours mode).
   Also: Avoid sending null/"" for full-time updates (contract dates, etc.)
   FIX KPI: Prevent NaN in salary.kpi
========================================================= */

/* =========================================================
   EMPLOYEE HEADER INFO
========================================================= */
export const getHeaderEmployeeData = (profile, shifts = []) => {
  if (!profile) {
    return {
      name: "",
      role: "",
      avatarUrl: "",
      employeeId: "",
      join_date: "",
      employmentType: "",
    };
  }

  // Get employment type from shift_id
  const shiftId = profile.shift_id || profile.employee?.shift_id;
  const shift = shifts.find((s) => s.id === Number(shiftId));
  const employmentType = shift?.name_en || profile.shift || "";

  return {
    name: profile.full_name || profile.name || "",
    role: profile.title || "",
    avatarUrl: profile.image || "",
    employeeId: profile.employee_id || "",
    join_date: profile.join_date || "",
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
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  return Math.max(0, months);
};

const formatDuration = (months) => formatMonthsDuration(i18n.t.bind(i18n), months);

const normalizeIdArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (item == null || item === "") return null;
      if (typeof item === "object") {
        return item.id ?? item.employee_id ?? item.manager_id ?? item.value ?? null;
      }
      return item;
    })
    .map((item) => (item == null || item === "" ? null : Number(item)))
    .filter((item) => Number.isFinite(item) && item > 0);
};

/* =========================================================
   MAIN FORMATTER — prepareDetailsData
   Syncs backend → UI full structure
========================================================= */
export const prepareDetailsData = (profile, _shifts = []) => {
  if (!profile) return null;

  // ✅ unwrap API response (status/message/data/employee)
  const emp = profile?.data?.employee ?? profile?.employee ?? profile;

  // ✅ Safe number conversion (never returns NaN)
  const toNumberSafe = (v, fallback = 0) => {
    if (v === null || v === undefined || v === "") return fallback;

    // handle strings with commas and extra spaces
    const cleaned =
      typeof v === "string"
        ? v.trim().replace(/,/g, ".") 
        : v;

    const n = typeof cleaned === "number" ? cleaned : parseFloat(String(cleaned));

    return Number.isFinite(n) ? n : fallback;
  };

  // ✅ helper for UI dash (treat NaN as empty)
  const toStr = (v) => {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "number" && Number.isNaN(v)) return "";
    if (String(v).toLowerCase() === "nan") return "";
    return String(v);
  };

  const dashIfEmpty = (v) => {
    const s = toStr(v).trim();
    return s ? s : "--";
  };

  const rawEmploymentType =
    profile.employment_type || profile.employee?.employment_type || "";
  const normalizedEmploymentType = rawEmploymentType
    .toString()
    .toLowerCase()
    .trim();

  const isFreelancer =
    normalizedEmploymentType === "freelancer" ||
    normalizedEmploymentType === "free lancer";

  /* ==============================================
     BASIC SECTION
  ============================================== */
  const basic = {
    firstName: profile.first_name || "",
    full_name: profile.full_name || profile.name || "",
    employeeId: profile.employee_id || profile.employeeCode || "",
    birth_date: profile.birth_date || "",
    maritalStatus: profile.marital_status || "",
    nationalId: profile.national_id || "",
  };

  /* ==============================================
     CONTACT SECTION
  ============================================== */
  const contact = {
    phone: profile.phone || "",
    whatsapp: profile.whatsapp_number || "",
    email: profile.email || "",
    address: profile.address || "",
    countryId: profile.country_id ?? "",
    governorateId: profile.governorate_id ?? "",
    city: profile.city || "",
    // Store string names if IDs are not available
    countryName: profile.country || "",
    governorateName: profile.governorate || "",
  };

  /* ==============================================
     DOCUMENTS
  ============================================== */
  const documents = [...(profile.contracts || []), ...(profile.documents || [])];

  /* ==============================================
     WORK SECTION
  ============================================== */
  const weeklyWorkDaysRaw = (() => {
    try {
      const arr = JSON.parse(profile.weekly_work_days || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  })();

  // PART-TIME MODE:
  // Rule: if weekly_work_days array has values → Days Mode
  //       if empty → Hours Mode
  const partTimeMode = weeklyWorkDaysRaw.length > 0 ? "days" : "hours";

  const work = {
    manager_id: profile.manager_id ?? "",
    managerName: profile.manager || "",
    task_manager: normalizeIdArray(profile.task_manager),

    position_id: profile.position_id ?? "",
    positionName: profile.position || "",

    partTimeMode, // "hours" | "days"

    workDays: isFreelancer
      ? "--"
      : (() => {
          try {
            const arr = JSON.parse(profile.weekly_work_days || "[]");
            if (!Array.isArray(arr) || arr.length === 0) return "--";

            return arr
              .map(
                (d) => `${d.day} (${d.start_time || "--"} - ${d.end_time || "--"})`
              )
              .join(", ");
          } catch {
            return "--";
          }
        })(),

    weekly_work_days: weeklyWorkDaysRaw,

    shiftHours: isFreelancer ? "" : profile.shift_hours ?? "",
    // ✅ IMPORTANT: keep it null not '' to avoid false "changed" + validation issues
    monthly_hours_required: isFreelancer
      ? null
      : profile.monthly_hours_required ?? null,

    shiftType: Number(profile.shift_id || profile.shift || ""),
  };

  /* ==============================================
     CONTRACT SECTION
  ============================================== */
  const contractStartDate = profile.join_date || "";
  const contractEndDate = profile.end_date || "";

  const contractDuration =
    contractStartDate && contractEndDate
      ? calculateContractDuration(contractStartDate, contractEndDate)
      : null;

  const contract = {
    type:
      profile.contract_type ||
      profile.contractType ||
      profile.employment_contract_type ||
      "",
    contract_type:
      profile.contract_type ||
      profile.contractType ||
      profile.employment_contract_type ||
      "",
    duration: contractDuration !== null ? formatDuration(contractDuration) : "--",
    startDate: contractStartDate,
    endDate: contractEndDate,
    _durationMonths: contractDuration,
  };

  /* ==============================================
     SALARY SECTION
     ✅ FIX KPI NaN here
  ============================================== */
  const rawSalaryType = emp.salary_type || "fixed";

  const salary = {
    type: String(rawSalaryType),

    // ✅ like base salary: keep as string formatted to 2 decimals
    net: (Number(emp.base_salary ?? 0)).toFixed(2),

    // ✅ SAME WAY: KPI formatted to 2 decimals (will show 100.00)
    kpi: (Number(emp.kpi ?? 0)).toFixed(2),

    commission: emp.commission || emp.commission_percentage || "0.00",

    averageDetails: Array.isArray(emp.salary_details)
      ? emp.salary_details.map((item) => ({
          department: item.department_name,
          amount: item.amount,
          salary: (Number(emp.base_salary ?? 0)).toFixed(2),
          kpi: (Number(emp.kpi ?? 0)).toFixed(2),
          commission: emp.commission || emp.commission_percentage || "0.00",
        }))
      : [],
  };

  return {
    employmentType: rawEmploymentType,
    isFreelancer,
    basic,
    contact,
    documents,
    work,
    contract,
    salary,
  };
};

/* =========================================================
   HANDLE FIELD CHANGE
========================================================= */
export const handleFieldChange =
  (setEditableDetails) => (section, field, value) => {
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
export const handleCancelEdit =
  (detailsData, setEditableDetails, setIsEditing) => () => {
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
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const toCommissionNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace("%", "").trim();
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  };

  const safeJsonStringifyArray = (arr) => {
    try {
      return JSON.stringify(Array.isArray(arr) ? arr : []);
    } catch {
      return "[]";
    }
  };

  /* =========================================================
     BASIC
  ========================================================= */
  if (basic.full_name !== origBasic.full_name) payload.full_name = basic.full_name;
  if (basic.birth_date !== origBasic.birth_date)
    payload.birth_date = basic.birth_date;

  // handle both maritalStatus and marital_status
  const msNow = basic.marital_status ?? basic.maritalStatus ?? "";
  const msOrig = origBasic.marital_status ?? origBasic.maritalStatus ?? "";
  if (msNow !== msOrig) payload.marital_status = msNow;

  if (basic.nationalId !== origBasic.nationalId)
    payload.national_id = basic.nationalId;

  /* =========================================================
     CONTACT
  ========================================================= */
  if (contact.phone !== origContact.phone) payload.phone = contact.phone;
  if (contact.whatsapp !== origContact.whatsapp)
    payload.whatsapp_number = contact.whatsapp;
  if (contact.email !== origContact.email) payload.email = contact.email;
  if (contact.address !== origContact.address) payload.address = contact.address;

  if (contact.countryId !== origContact.countryId)
    payload.country_id = contact.countryId || null;

  if (contact.governorateId !== origContact.governorateId)
    payload.governorate_id = contact.governorateId || null;

  if (contact.city !== origContact.city) payload.city = contact.city || "";

  /* =========================================================
     WORK
  ========================================================= */

  // Manager
  if (work.manager_id !== origWork.manager_id)
    employeePayload.manager_id = toNumberOrNull(work.manager_id);

  if (JSON.stringify(normalizeIdArray(work.task_manager)) !== JSON.stringify(normalizeIdArray(origWork.task_manager))) {
    employeePayload.task_manager = normalizeIdArray(work.task_manager);
  }

  // Position
  if (work.position_id !== origWork.position_id)
    employeePayload.position_id = toNumberOrNull(work.position_id);

  // Shift
  if (work.shiftType !== origWork.shiftType)
    employeePayload.shift_id = toNumberOrNull(work.shiftType);

  // Weekly Work Days (Part-Time Days Mode)
  const weeklyNowStr = safeJsonStringifyArray(work.weekly_work_days);
  const weeklyOrigStr = safeJsonStringifyArray(origWork.weekly_work_days);

  if (weeklyNowStr !== weeklyOrigStr) {
    employeePayload.weekly_work_days = weeklyNowStr;
  }

  // ✅ Monthly Required Hours (ONLY for Part-time Hours Mode)
  const modeNow =
    work.partTimeMode || work.part_time_mode || origWork.partTimeMode || origWork.part_time_mode;

  const isHoursMode =
    modeNow === "hours" ||
    (Array.isArray(work.weekly_work_days) && work.weekly_work_days.length === 0);

  const hoursNow = toNumberOrNull(work.monthly_hours_required);
  const hoursOrig = toNumberOrNull(origWork.monthly_hours_required);

  if (isHoursMode) {
    // Send only if changed
    if (hoursNow !== hoursOrig) {
      employeePayload.monthly_hours_required = hoursNow;
    }
  } else {
    // Full-time / days mode => never send it
    delete employeePayload.monthly_hours_required;
  }

  /* =========================================================
     CONTRACT
  ========================================================= */
  if (contract.type !== origContract.type)
    employeePayload.contract_type = contract.type;

  if (contract.startDate !== origContract.startDate)
    employeePayload.join_date = contract.startDate;

  if (contract.endDate !== origContract.endDate)
    employeePayload.end_date = contract.endDate;

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

  if (commissionNow !== commissionOrig)
    employeePayload.commission_percentage = commissionNow;

  // CODE
  if (basic.employeeId !== origBasic.employeeId)
    employeePayload.code = basic.employeeId;

  /* =========================================================
     MERGE PAYLOAD
  ========================================================= */
  if (Object.keys(employeePayload).length > 0) payload.employee = employeePayload;

  if (Object.keys(payload).length === 0) {
    toast.info("No changes to save");
    setIsEditing(false);
    return;
  }

  /* =========================================================
     API CALL
  ========================================================= */
  try {
    await updateEmployeeProfile(id, payload);
    toast.success("Profile updated successfully");
    setIsEditing(false);
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to update profile");
    console.error(err);
  }
};
