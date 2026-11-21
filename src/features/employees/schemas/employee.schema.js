import { z } from 'zod';
import { requiredString, email, phone, optionalString } from '@/lib/zodUtils';

/* ---------------------------------------------
   DATE HELPERS
--------------------------------------------- */

const dateString = z.preprocess((val) => {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return val;
}, requiredString);

const optionalDateString = z.preprocess((val) => {
  if (val == null || val === '') return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return val;
}, optionalString);

/* ---------------------------------------------
   NUMBER HELPERS
--------------------------------------------- */

const optionalNumber = z.preprocess((v) => {
  if (v === '' || v == null) return undefined;
  return v;
}, z.coerce.number().optional());

const requiredBoolLike = (message = 'This field is required') =>
  z.preprocess(
    (v) => {
      if (v === true || v === false) return v;
      if (v === 1 || v === '1') return true;
      if (v === 0 || v === '0') return false;
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (v === 'yes') return true;
      if (v === 'no') return false;
      if (v === '' || v == null) return undefined;
      return v;
    },
    z.boolean({ required_error: message, invalid_type_error: message })
  );

const requiredIdMin1 = (label) =>
  z.preprocess(
    (v) => {
      if (v == null || v === '') return 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    },
    z
      .number({
        invalid_type_error: `${label} is required`,
        required_error: `${label} is required`,
      })
      .int()
      .min(1, `${label} is required`)
  );

const requiredStringSelect = (label) =>
  z.preprocess(
    (v) => {
      if (v == null) return '';
      return String(v);
    },
    z.string().min(1, `${label} is required`)
  );

/* ---------------------------------------------
   EXPERIENCE
--------------------------------------------- */

const experienceSchema = z.object({
  job_title: optionalString,
  company_name: optionalString,
  work_setup: optionalString.nullable().optional(),

  start_date: z.preprocess((val) => {
    if (val == null || val === '') return '';
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val;
  }, optionalString),

  end_date: z.preprocess((val) => {
    if (val == null || val === '') return '';
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val;
  }, optionalString),

  salary: z.preprocess((v) => (v == null ? '' : v), optionalString),
  manager_name: z.preprocess((v) => (v == null ? '' : v), optionalString),
  manager_phone: z.preprocess((v) => (v == null ? '' : v), optionalString),
  okay_to_contact: z.boolean().optional(),
  key_responsibilities: z.preprocess((v) => (v == null ? '' : v), optionalString),
  is_current: z.coerce.number().optional(),

  manager_email: z.preprocess((val) => {
    if (val == null) return undefined;
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return val;
  }, email.optional()),
});

/* ---------------------------------------------
   EDUCATION
--------------------------------------------- */

const educationSchema = z.object({
  degree_level: optionalString,
  field_of_study: optionalString,
  institution: optionalString,

  institution_country: z.preprocess((val) => {
    if (val === '' || val == null) return undefined;
    return val;
  }, z.coerce.number().int().optional()),

  start_date: z.preprocess((val) => {
    if (val == null || val === '') return '';
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val;
  }, optionalString),

  end_date: z.preprocess((val) => {
    if (val == null || val === '') return '';
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val;
  }, optionalString),

  education_attatchment: z.any().optional(),
});

/* ---------------------------------------------
   LANGUAGE / SKILL
--------------------------------------------- */

const languageSchema = z.object({
  language: optionalString,
  level: optionalString,
});

const skillSchema = z.object({
  name: optionalString,
  level: z.any().optional(),
});

/* ---------------------------------------------
   MULTI-SALARY
--------------------------------------------- */

const salaryDetailSchema = z.object({
  department_name: requiredString,
  amount: z.coerce.number({
    invalid_type_error: 'Amount must be a number',
  }),
});

/* ---------------------------------------------
   CUSTOM KPI
--------------------------------------------- */

const customKpiSchema = z.object({
  item: z.string().min(1, 'Item name is required'),
  max_score: z.coerce.number().min(0, 'Max score must be at least 0'),
});

/* ---------------------------------------------
   DAY SCHEMAS
--------------------------------------------- */

const daySchema = z.object({
  day: requiredString,
  start_time: optionalString,
  end_time: optionalString,
});

const weeklyDaySchema = z.object({
  enabled: z.boolean().optional(),
  from: optionalString,
  to: optionalString,
});

/* ---------------------------------------------
   FLEXIBLE WEEKLY WORK DAYS
--------------------------------------------- */

const weeklyWorkDaysFlexible = z.preprocess((val) => {
  if (val == null || val === '') return {};

  if (typeof val === 'string') {
    try {
      val = JSON.parse(val);
    } catch {
      return {};
    }
  }

  if (Array.isArray(val)) {
    const obj = {};

    val.forEach((row) => {
      const key = String(row?.day || '').toLowerCase();
      if (!key) return;

      obj[key] = {
        enabled: true,
        from: String(row?.start_time || row?.from || '').slice(0, 5),
        to: String(row?.end_time || row?.to || '').slice(0, 5),
      };
    });

    Object.entries(val).forEach(([key, row]) => {
      if (/^\d+$/.test(key)) return;

      const dayKey = String(key || '').toLowerCase();
      if (!dayKey) return;

      obj[dayKey] = {
        enabled:
          row?.enabled === true ||
          row?.enabled === 1 ||
          row?.enabled === '1',
        from: String(row?.start_time || row?.from || '').slice(0, 5),
        to: String(row?.end_time || row?.to || '').slice(0, 5),
      };
    });

    return obj;
  }

  if (typeof val === 'object') return val;

  return {};
}, z.record(z.string(), weeklyDaySchema).optional().default({}));

/* ---------------------------------------------
   HOURS FIELD
--------------------------------------------- */

const hoursNumber = z.preprocess((v) => {
  if (v === '' || v == null) return undefined;
  return v;
}, z.coerce.number().optional());

/* ---------------------------------------------
   EMPLOYEE INNER SCHEMA
--------------------------------------------- */

const employeeInnerSchema = z
  .object({
    id: z.coerce.number().optional(),
    applicant_id: z.coerce.number().optional(),

    code: z.coerce.string().min(1, 'Code is required'),

    department_id: requiredIdMin1('Department'),

    branch_id: z.array(z.coerce.number()).optional().default([]),
    task_manager: z.array(z.coerce.number().int().positive()).optional().default([]),

    manager_id: optionalNumber,

    has_fingerprint: z.preprocess((v) => {
      if (v === 1 || v === '1') return true;
      if (v === 0 || v === '0') return false;
      if (v === 'yes') return true;
      if (v === 'no') return false;
      return v;
    }, z.boolean()),

    shift_id: requiredIdMin1('Shift'),

    employment_type_id: z.preprocess((v) => {
      if (v == null || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }, z.number().int().optional()),

    employment_type: z.enum(['full_time', 'part_time', 'freelancer']).optional(),

    join_date: dateString,
    end_date: optionalDateString,
    national_id_expiry_date: optionalDateString,

    part_time_mode: z.enum(['hours', 'days']).optional(),
    monthly_hours_required: hoursNumber,

    weekly_work_days: weeklyWorkDaysFlexible,
    days: z.array(daySchema).optional(),

    fixed_shift: z.preprocess((v) => {
      if (v === true || v === false) return v;
      if (v === 1 || v === '1') return true;
      if (v === 0 || v === '0') return false;
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (v === 'yes') return true;
      if (v === 'no') return false;
      if (v == null || v === '') return undefined;
      return v;
    }, z.boolean().optional()),

    fixed_from: optionalString,
    fixed_to: optionalString,

    contract_file: z.any().optional(),

    salary_type: z.enum(['single', 'multi']),
    base_salary: requiredString,
    kpi: requiredString,
    salary_method: requiredString,

    salary_payment_day: z
      .string()
      .min(1, 'Salary payment day is required')
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 31;
      }, 'Salary payment day must be between 1 and 31'),

    salary_payment_day_second: z
      .string()
      .optional()
      .refine((v) => {
        if (v == null || v === '') return true;
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 31;
      }, 'Second salary payment day must be between 1 and 31'),

    commission_percentage: z.coerce.number().optional(),
    card_number: optionalString,
    wallet_number: optionalString,

    allowance: optionalString,

    salary_details: z.array(salaryDetailSchema).optional().default([]),
    custom_kpis: z.array(customKpiSchema).optional().default([]),
    position_kpi_item_ids: z.array(z.coerce.number()).optional().default([]),
  })
  .passthrough()
  .superRefine((val, ctx) => {
    if (val.salary_type === 'multi') {
      if (!val.salary_details?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salary_details'],
          message: 'Please select at least one department for multi-source salary.',
        });
        return;
      }

      const total = val.salary_details.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      if (total !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salary_details'],
          message: `Total percentage must be exactly 100%. Current total: ${total}%`,
        });
      }
    }
  });

/* ---------------------------------------------
   FULL EMPLOYEE SCHEMA
--------------------------------------------- */

export const employeeSchema = z
  .object({
    id: z.coerce.number().optional(),

    full_name_ar: requiredString,

    first_name: requiredString,
    middle_name: optionalString,
    last_name: requiredString,
    preferred_name: optionalString,
    national_id: requiredString,
    email: email,
    phone: phone,
    whatsapp_number: optionalString,
    birth_date: dateString,

    is_smoker: z.boolean().optional().default(false),
    has_chronic_disease: z.boolean().optional().default(false),
    chronic_diseases: optionalString.nullable(),

    country_id: requiredIdMin1('Country'),
    governorate_id: requiredIdMin1('Governorate'),

    city: optionalString,
    marital_status: optionalString,
    gender: requiredStringSelect('Gender'),
    military_service: optionalString,

    position_applied_for_id: z.coerce
      .number({ invalid_type_error: 'Position is required' })
      .int()
      .min(1, 'Position is required'),

    work_setup: optionalString,
    available_start_date: optionalDateString,
    expected_salary: optionalString,
    how_did_you_hear_about_this_role: optionalString,

    experiences: z.array(experienceSchema).default([]),
    educations: z.array(educationSchema).default([]),
    skills: z.array(skillSchema).default([]),
    languages: z.array(languageSchema).default([]),

    certification_attatchment: z.any().optional(),
    facebook_link: optionalString,
    linkedin_link: optionalString,
    github_link: optionalString,
    additional_link: optionalString,

    cv: z.any().optional(),

    consent_data_processing: z.boolean().optional(),
    consent_information_accurate: z.boolean().optional(),
    consent_reference_checks: z.boolean().optional(),

    employee: employeeInnerSchema,

    is_insured: requiredBoolLike('Insurance is required.'),
    insurance_percentage: optionalNumber,
    insurance_salary: optionalNumber,
  })
  .passthrough()
  .superRefine((val, ctx) => {
    if (val.has_chronic_disease === true) {
      if (!val.chronic_diseases || val.chronic_diseases.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['chronic_diseases'],
          message: 'Please specify the chronic diseases.',
        });
      }
    }

    const emp = val.employee || {};
    const empTypeId = Number(emp.employment_type_id);
    const employmentType = String(emp.employment_type || '').toLowerCase();

    const isPartTime = employmentType === 'part_time' || empTypeId === 2;
    const isFreelancer = employmentType === 'freelancer';

    if (isPartTime) {
      if (!emp.part_time_mode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employee', 'part_time_mode'],
          message: 'Part-time mode is required.',
        });
        return;
      }

      if (
        emp.part_time_mode === 'hours' &&
        (emp.monthly_hours_required == null || Number(emp.monthly_hours_required) <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employee', 'monthly_hours_required'],
          message: 'Total hours are required for part-time (hours mode).',
        });
      }

      if (emp.part_time_mode === 'days') {
        const days = emp.weekly_work_days || {};
        const fixedShiftEnabled =
          emp.fixed_shift === true ||
          emp.fixed_shift === 1 ||
          emp.fixed_shift === '1' ||
          emp.fixed_shift === 'true' ||
          emp.fixed_shift === 'yes';

        const fixedFrom = String(emp.fixed_from || '').trim();
        const fixedTo = String(emp.fixed_to || '').trim();

        const hasValidDay = Object.values(days).some((d) => {
          const enabled =
            d?.enabled === true ||
            d?.enabled === 1 ||
            d?.enabled === '1';

          if (!enabled) return false;

          if (fixedShiftEnabled) {
            return !!fixedFrom && !!fixedTo;
          }

          const from = String(d?.from || '').trim();
          const to = String(d?.to || '').trim();

          return !!from && !!to;
        });

        if (!hasValidDay) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['employee', 'weekly_work_days'],
            message: 'For part-time by days, select at least one working day with from/to time.',
          });
        }
      }
    }

    if (isFreelancer) {
      return;
    }

    if (val.is_insured === true) {
      if (val.insurance_percentage == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['insurance_percentage'],
          message: 'Insurance percentage is required.',
        });
      } else {
        const p = Number(val.insurance_percentage);
        if (Number.isFinite(p) && (p < 0 || p > 100)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['insurance_percentage'],
            message: 'Insurance percentage must be between 0 and 100.',
          });
        }
      }

      if (val.insurance_salary == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['insurance_salary'],
          message: 'Insurance salary is required.',
        });
      }
    }
  });

export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
});
