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
   FULL APPLICANT SCHEMA
--------------------------------------------- */

export const applicantSchema = z
  .object({
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
    cover_letter: optionalString,

    consent_data_processing: z.boolean().optional(),
    consent_information_accurate: z.boolean().optional(),
    consent_reference_checks: z.boolean().optional(),
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
  });

export const applicantFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
});