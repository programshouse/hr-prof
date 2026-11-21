import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { employeeSchema } from '../schemas/employee.schema';
import { useUpsertEmployee } from '../hooks/useUpsertEmployee';
import { useUpdatePersonalData } from '../hooks/useUpdatePersonalData';
import useApplicantForHire from '@/features/applicants/hooks/useApplicantForHire';
import mapApplicantToEmployeeForm from '@/features/employees/utils/mapApplicantToEmployeeForm';
import useHireApplicant from '@/features/applicants/hooks/useHireApplicant';
import buildHireApplicantPayload from '@/features/applicants/utils/buildHireApplicantPayload';

import StepBar from './form/StepBar';
import { FormProvider } from '@/components/forms/Form';

import StepPersonalInfo from './form/StepPersonalInfo';
import StepRoleAvailability from './form/StepRoleAvailability';
import StepExperience from './form/StepExperience';
import StepEducation from './form/StepEducation';
import StepSkillsAndLinks from './form/StepSkillsAndLinks';
import StepAttachments from './form/StepAttachments';
import StepConsents from './form/StepConsents';
import StepEmploymentDetails from './form/StepEmploymentDetails';
import StepSalaryDetails from './form/StepSalaryDetails';

const STEP_FIELD_MAP = {
  1: [
    'full_name_ar',
    'first_name',
    'middle_name',
    'last_name',
    'preferred_name',
    'national_id',
    'employee.national_id_expiry_date',
    'email',
    'phone',
    'whatsapp_number',
    'birth_date',
    'is_smoker',
    'has_chronic_disease',
    'chronic_diseases',
    'country_id',
    'governorate_id',
    'city',
    'marital_status',
    'gender',
    'military_service',
  ],
  2: [
    'position_applied_for_id',
    'work_setup',
    'available_start_date',
    'expected_salary',
    'how_did_you_hear_about_this_role',
  ],
  3: ['experiences'],
  4: ['educations'],
  5: [
    'skills',
    'languages',
    'certification_attatchment',
    'facebook_link',
    'linkedin_link',
    'github_link',
    'additional_link',
  ],
  6: ['cv', 'cover_letter'],
  7: ['consent_data_processing', 'consent_information_accurate', 'consent_reference_checks'],
  8: [
    'employee.code',
    'employee.department_id',
    'employee.branch_id',
    'employee.task_manager',
    // 'employee.manager_id',
    'employee.has_fingerprint',
    'employee.shift_id',
    'employee.join_date',
    'employee.end_date',
    'employee.employment_type_id',
    'employee.part_time_mode',
    'employee.monthly_hours_required',
    'employee.weekly_work_days',
    'employee.fixed_from',
    'employee.fixed_to',
  ],
  9: [
    'employee.salary_type',
    'employee.base_salary',
    'employee.kpi',
    'employee.salary_method',
    'employee.salary_payment_day',
    'employee.salary_payment_day_second',
    'employee.commission_percentage',
    'employee.card_number',
    'employee.wallet_number',
    'employee.salary_details',
    'employee.position_kpi_item_ids',
    'employee.custom_kpis',
    'is_insured',
    'insurance_percentage',
    'insurance_salary',
  ],
};

const DEFAULT_VALUES = {
  id: undefined,
  is_smoker: false,
  has_chronic_disease: false,
  chronic_diseases: null,
  full_name_ar: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  preferred_name: '',
  national_id: '',
  email: '',
  phone: '',
  whatsapp_number: '',
  birth_date: '',
  country_id: '',
  governorate_id: '',
  city: '',
  marital_status: '',
  gender: '',
  military_service: '',
  position_applied_for_id: '',
  work_setup: 'onsite',
  available_start_date: '',
  expected_salary: '',
  how_did_you_hear_about_this_role: '',
  facebook_link: '',
  linkedin_link: '',
  github_link: '',
  additional_link: '',
  cover_letter: '',
  consent_data_processing: false,
  consent_information_accurate: false,
  consent_reference_checks: false,
  cv: null,

  is_insured: false,
  insurance_percentage: '',
  insurance_salary: '',

  employee: {
    id: undefined,
    applicant_id: undefined,
    salary_payment_day: '',
    salary_payment_day_second: '',
    code: '',
    department_id: '',
    branch_id: [],
    task_manager: [],
    manager_id: '',
    position_id: '',
    shift_id: '',
    employment_type_id: '',
    employment_type: '',
    join_date: '',
    end_date: '',
    national_id_expiry_date: '',
    part_time_mode: undefined,
    monthly_hours_required: '',
    weekly_work_days: {},
    fixed_shift: false,
    fixed_from: '',
    fixed_to: '',
    status: 'pending',
    compensation_type: 'fixed',
    salary_type: 'single',
    base_salary: '',
    kpi: '',
    insurance_percentage: '',
    insurance_salary: '',
    is_insured: undefined,
    salary_method: '',
    commission_percentage: 0,
    card_number: '',
    wallet_number: '',
    has_fingerprint: false,
    contract_type: '',
    has_location_tracking: false,
    has_fixed_salary: true,
    is_manager: false,
    is_department_manager: false,
    manager_for_all_branches: false,
    is_sales: false,
    salary_details: [],
    custom_kpis: [],
    position_kpi_item_ids: [],
    _weekly_work_days_raw: null,
    _manually_set_working_mode: false,
  },

  experiences: [],
  educations: [],
  skills: [],
  languages: [],
};

const dayKey = (dayName) => String(dayName || '').toLowerCase();

const toDateOnly = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 10);
  return '';
};

function getBackendMessage(error) {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)?.[0];
    if (Array.isArray(firstError) && firstError[0]) return firstError[0];
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  return 'Something went wrong';
}

function parseWeeklyWorkDaysToUI(weekly_work_days) {
  if (!weekly_work_days) return {};

  let arr = weekly_work_days;
  if (typeof weekly_work_days === 'string') {
    try {
      arr = JSON.parse(weekly_work_days);
    } catch {
      return {};
    }
  }

  if (!Array.isArray(arr)) return {};

  const obj = {};
  arr.forEach((row) => {
    const key = dayKey(row.day);
    if (!key) return;
    obj[key] = {
      enabled: true,
      from: row.start_time || '',
      to: row.end_time || '',
    };
  });

  return obj;
}

function parseDaysArrayToUI(days) {
  if (!Array.isArray(days)) return {};

  const obj = {};
  days.forEach((row) => {
    const key = dayKey(row.day);
    if (!key) return;
    obj[key] = {
      enabled: true,
      from: row.start_time || '',
      to: row.end_time || '',
    };
  });

  return obj;
}

function normalizeTaskManagerIds(value) {
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

function mapPersonalDataApiToForm(apiData) {
  const apiEmployee = apiData?.employee || {};
  const applicant = apiEmployee?.applicant || {};

  const shiftName = String(
    apiEmployee?.shift?.name_en || apiEmployee?.shift?.name_ar || apiEmployee?.shift_id || ''
  ).toLowerCase();

  const isFreelancerHoursShift =
    shiftName.includes('freelancer') && (shiftName.includes('(h)') || shiftName.includes('hour'));

  const isFreelancerTasksShift =
    shiftName.includes('freelancer') &&
    (shiftName.includes('task') || shiftName.includes('(tasks)'));

  const isFreelancerShift = isFreelancerHoursShift || isFreelancerTasksShift;

  const isPartTimeShift = shiftName.includes('part time') || shiftName.includes('part-time');

  const inferredEmploymentTypeId =
    apiEmployee?.employment_type_id ?? (apiEmployee?.part_time_type ? 2 : 1);

  const inferredEmploymentType =
    apiEmployee?.employment_type ||
    (isFreelancerShift
      ? 'freelancer'
      : isPartTimeShift || inferredEmploymentTypeId === 2
        ? 'part_time'
        : 'full_time');

  const additionalLinkText = Array.isArray(applicant.additional_link)
    ? applicant.additional_link.filter(Boolean).join('\n')
    : applicant.additional_link
      ? String(applicant.additional_link)
      : '';

  const weeklyWorkDaysUI =
    parseWeeklyWorkDaysToUI(apiEmployee.weekly_work_days) || parseDaysArrayToUI(apiEmployee.days);

  const branchIds =
    Array.isArray(apiEmployee.branches) && apiEmployee.branches.length
      ? apiEmployee.branches.map((b) => Number(b.id)).filter(Number.isFinite)
      : apiEmployee.branch_id
        ? [Number(apiEmployee.branch_id)].filter(Number.isFinite)
        : [];

  return {
    id: apiEmployee?.id,
    is_smoker: Boolean(applicant.is_smoker ?? false),
    has_chronic_disease: Boolean(applicant.has_chronic_disease ?? false),
    chronic_diseases: applicant.chronic_diseases ?? null,
    full_name_ar: applicant.full_name_ar ?? '',
    first_name: applicant.first_name ?? '',
    middle_name: applicant.middle_name ?? '',
    last_name: applicant.last_name ?? '',
    preferred_name: applicant.preferred_name ?? '',
    national_id: applicant.national_id ?? '',
    email: applicant.email ?? '',
    phone: applicant.phone ?? '',
    whatsapp_number: applicant.whatsapp_number ?? '',
    birth_date: toDateOnly(applicant.birth_date),
    country_id: applicant.country_id ?? '',
    governorate_id: applicant.governorate_id ?? '',
    city: applicant.city ?? '',
    marital_status: applicant.marital_status ?? '',
    gender: applicant.gender ?? '',
    military_service: applicant.military_service ?? '',

    position_applied_for_id:
      applicant.position_applied_for_id ?? applicant.position_id ?? apiEmployee.position_id ?? '',
    work_setup: applicant.work_setup ?? 'onsite',
    available_start_date: toDateOnly(applicant.available_start_date),
    expected_salary: applicant.expected_salary ?? '',
    how_did_you_hear_about_this_role: applicant.how_did_you_hear_about_this_role ?? '',

    facebook_link: applicant.facebook_link ?? '',
    linkedin_link: applicant.linkedin_link ?? '',
    github_link: applicant.github_link ?? '',
    additional_link: additionalLinkText,

    cv: applicant.cv ?? null,
    cover_letter: applicant.cover_letter ?? null,

    consent_data_processing: Boolean(applicant.consent_data_processing ?? false),
    consent_information_accurate: Boolean(applicant.consent_information_accurate ?? false),
    consent_reference_checks: Boolean(applicant.consent_reference_checks ?? false),

    is_insured: Boolean(apiEmployee.is_insured ?? false),
    insurance_percentage: apiEmployee.insurance_percentage ?? '',
    insurance_salary: apiEmployee.insurance_salary ?? '',

    experiences: Array.isArray(applicant.experiences)
      ? applicant.experiences.map((x) => ({
          ...x,
          start_date: toDateOnly(x.start_date),
          end_date: toDateOnly(x.end_date),
          okay_to_contact: Boolean(x.okay_to_contact),
        }))
      : [],

    educations: Array.isArray(applicant.educations)
      ? applicant.educations.map((e) => ({
          ...e,
          degree_level: e.degree_level ?? '',
          field_of_study: e.field_of_study ?? '',
          institution: e.institution ?? '',
          institution_country: e.institution_country ?? '',
          start_date: toDateOnly(e.start_date),
          end_date: toDateOnly(e.end_date),
        }))
      : [],

    skills: Array.isArray(applicant.skills) ? applicant.skills : [],
    languages: Array.isArray(applicant.languages) ? applicant.languages : [],

    employee: {
      id: apiEmployee.id,
      applicant_id: apiEmployee.applicant_id,
      salary_payment_day:
        apiEmployee.salary_payment_day == null ? '' : String(apiEmployee.salary_payment_day),
      salary_payment_day_second:
        apiEmployee.salary_payment_day_second == null
          ? ''
          : String(apiEmployee.salary_payment_day_second),
      code: apiEmployee.code ?? '',
      department_id: apiEmployee.department_id ?? '',
      branch_id: branchIds,
      task_manager: normalizeTaskManagerIds(apiEmployee.task_manager),
      manager_id: apiEmployee.manager_id ?? '',
      position_id:
        apiEmployee.position_id ?? applicant.position_applied_for_id ?? applicant.position_id ?? '',
      shift_id: apiEmployee.shift_id ?? '',
      employment_type_id: inferredEmploymentTypeId,
      employment_type: inferredEmploymentType,
      join_date: toDateOnly(apiEmployee.join_date),
      end_date: toDateOnly(apiEmployee.end_date),
      national_id_expiry_date: toDateOnly(apiEmployee.national_id_expiry_date),
      part_time_mode: isFreelancerHoursShift
        ? 'hours'
        : inferredEmploymentType === 'part_time'
          ? (apiEmployee.part_time_type ?? undefined)
          : undefined,
      monthly_hours_required: apiEmployee.monthly_hours_required ?? '',
      weekly_work_days: weeklyWorkDaysUI,
      _weekly_work_days_raw: apiEmployee.weekly_work_days ?? null,
      salary_type: apiEmployee.salary_type ?? 'single',
      base_salary: apiEmployee.base_salary ?? '',
      kpi: apiEmployee.kpi ?? '',
      salary_method: apiEmployee.salary_method ?? '',
      insurance_percentage: apiEmployee.insurance_percentage ?? '',
      insurance_salary: apiEmployee.insurance_salary ?? '',
      is_insured: apiEmployee.is_insured,
      commission_percentage: apiEmployee.commission_percentage ?? 0,
      card_number: apiEmployee.card_number ?? '',
      wallet_number: apiEmployee.wallet_number ?? '',
      has_fingerprint: apiEmployee.has_fingerprint ?? false,
      contract_type: apiEmployee.contract_type ?? '',
      salary_details: Array.isArray(apiEmployee.salary_details) ? apiEmployee.salary_details : [],
      custom_kpis: Array.isArray(apiData?.kpi_items)
        ? apiData.kpi_items
            .filter((k) => k.is_custom)
            .map((k) => ({ item: k.name || '', max_score: k.max_score || 0 }))
        : [],
      position_kpi_item_ids: Array.isArray(apiData?.kpi_items)
        ? apiData.kpi_items
            .filter((k) => !k.is_custom && k.kpi_item_id)
            .map((k) => Number(k.kpi_item_id))
        : [],
      _manually_set_working_mode: false,
    },
  };
}

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

function buildPayload(values) {
  const payload = {
    ...values,
    employee: { ...(values.employee || {}) },
  };

  const emp = payload.employee || {};

  payload.has_chronic_disease =
    payload.has_chronic_disease === true ||
    payload.has_chronic_disease === 1 ||
    payload.has_chronic_disease === '1';

  payload.is_smoker =
    payload.is_smoker === true || payload.is_smoker === 1 || payload.is_smoker === '1';

  if (!payload.has_chronic_disease) {
    payload.chronic_diseases = null;
  } else if (payload.chronic_diseases == null || String(payload.chronic_diseases).trim() === '') {
    payload.chronic_diseases = null;
  }

  const insuredRaw = payload.is_insured ?? emp.is_insured ?? false;
  const insuredBool = insuredRaw === true || insuredRaw === 1 || insuredRaw === '1';

  payload.is_insured = insuredBool ? 1 : 0;
  emp.is_insured = insuredBool ? 1 : 0;

  const perc = payload.insurance_percentage ?? emp.insurance_percentage ?? null;
  const sal = payload.insurance_salary ?? emp.insurance_salary ?? null;

  if (insuredBool) {
    emp.insurance_percentage = perc === '' || perc == null ? null : Number(perc);
    emp.insurance_salary = sal === '' || sal == null ? null : Number(sal);
  } else {
    emp.insurance_percentage = null;
    emp.insurance_salary = null;
  }

  payload.insurance_percentage = emp.insurance_percentage;
  payload.insurance_salary = emp.insurance_salary;

  emp.salary_payment_day =
    emp.salary_payment_day == null || emp.salary_payment_day === ''
      ? ''
      : String(emp.salary_payment_day);
  emp.salary_payment_day_second =
    emp.salary_payment_day_second == null || emp.salary_payment_day_second === ''
      ? ''
      : String(emp.salary_payment_day_second);

  const posCandidate =
    emp?.position_id ?? payload?.position_applied_for_id ?? emp?.position_applied_for_id;

  if (posCandidate !== undefined && posCandidate !== null && posCandidate !== '') {
    const numPos = Number(posCandidate);
    emp.position_id = Number.isFinite(numPos) ? numPos : posCandidate;
  } else {
    emp.position_id = undefined;
  }

  if (Array.isArray(emp.branch_id)) {
    emp.branch_id = emp.branch_id.map((id) => Number(id)).filter((id) => Number.isFinite(id));
  } else if (emp.branch_id !== undefined && emp.branch_id !== null && emp.branch_id !== '') {
    const n = Number(emp.branch_id);
    emp.branch_id = Number.isFinite(n) ? [n] : [];
  } else {
    emp.branch_id = [];
  }

  emp.task_manager = normalizeTaskManagerIds(emp.task_manager);

  const employmentType = String(emp.employment_type || '').toLowerCase();
  const employmentTypeId = Number(emp.employment_type_id);
  const isPartTime = employmentType === 'part_time' || employmentTypeId === 2;
  const isFreelancer = employmentType === 'freelancer' || employmentTypeId === 3;

  let days = normalizeWeeklyWorkDaysUIToArray(emp.weekly_work_days);

  if (emp.fixed_shift && emp.fixed_from && emp.fixed_to && days.length > 0) {
    const fixedStart = String(emp.fixed_from).slice(0, 5);
    const fixedEnd = String(emp.fixed_to).slice(0, 5);
    days = days.map((d) => ({
      day: String(d.day).toLowerCase(),
      start_time: fixedStart,
      end_time: fixedEnd,
    }));
  }

  if (days.length === 0 && emp._weekly_work_days_raw) {
    try {
      const raw =
        typeof emp._weekly_work_days_raw === 'string'
          ? JSON.parse(emp._weekly_work_days_raw)
          : emp._weekly_work_days_raw;

      if (Array.isArray(raw)) {
        raw.forEach((row) => {
          const day = String(row.day || '').toLowerCase();
          const start = String(row.start_time || '').slice(0, 5);
          const end = String(row.end_time || '').slice(0, 5);
          if (day && start && end) days.push({ day, start_time: start, end_time: end });
        });
      }
    } catch {
      // ignore
    }
  }

  if (isPartTime) {
    if (emp.part_time_mode) {
      emp.part_time_type = emp.part_time_mode;
    }

    emp.weekly_work_days = days;

    if (emp.part_time_type === 'hours') {
      if (emp.monthly_hours_required === '' || emp.monthly_hours_required == null) {
        emp.monthly_hours_required = null;
      } else {
        emp.monthly_hours_required = Number(emp.monthly_hours_required);
      }

      emp.weekly_work_days = [];
    } else {
      emp.monthly_hours_required = null;
    }
  } else if (isFreelancer) {
    const isFreelancerHours = emp.part_time_mode === 'hours' || emp.part_time_type === 'hours';

    if (isFreelancerHours) {
      emp.part_time_type = 'hours';
      emp.monthly_hours_required =
        emp.monthly_hours_required === '' || emp.monthly_hours_required == null
          ? null
          : Number(emp.monthly_hours_required);
    } else {
      emp.part_time_type = null;
      emp.monthly_hours_required = null;
    }

    emp.weekly_work_days = [];
  } else {
    emp.part_time_type = undefined;
    emp.part_time_mode = undefined;
    emp.monthly_hours_required = null;
    emp.weekly_work_days = days;
  }

  if (emp.kpi === '' || emp.kpi == null) {
    emp.kpi = null;
  } else {
    emp.kpi = Number(emp.kpi);
  }

  if (emp.commission_percentage === '' || emp.commission_percentage == null) {
    emp.commission_percentage = 0;
  } else {
    emp.commission_percentage = Number(emp.commission_percentage);
  }

  if (emp.base_salary === '' || emp.base_salary == null) {
    emp.base_salary = null;
  } else {
    emp.base_salary = Number(emp.base_salary);
  }

  delete emp._weekly_work_days_raw;
  delete emp.part_time_mode;
  delete emp.fixed_shift;
  delete emp.fixed_from;
  delete emp.fixed_to;
  delete emp.employment_type;
  delete emp.position_applied_for_id;
  delete emp._manually_set_working_mode;

  payload.employee = emp;

  return payload;
}

const getStepFields = (stepConfig, getValues, setValue) => {
  let fields = [...(stepConfig?.fields || [])];

  if (stepConfig?.id === 'employment') {
    const normalizeDateInput = (value) => {
      if (!value) return '';
      const str = String(value).trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

      const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) return `${m[3]}-${m[2]}-${m[1]}`;

      return str;
    };

    const positionApplied = getValues('position_applied_for_id');

    let positionId = getValues('employee.position_id');
    let employmentTypeId = getValues('employee.employment_type_id');
    let employmentType = String(getValues('employee.employment_type') || '').toLowerCase();
    let partTimeMode =
      getValues('employee.part_time_mode') || getValues('employee.part_time_type') || '';

    const joinDate = normalizeDateInput(getValues('employee.join_date'));
    const endDate = normalizeDateInput(getValues('employee.end_date'));
    const hasFingerprint = getValues('employee.has_fingerprint');

    if (joinDate) {
      setValue('employee.join_date', joinDate, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    if (endDate) {
      setValue('employee.end_date', endDate, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    if (hasFingerprint === 'yes') {
      setValue('employee.has_fingerprint', true, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else if (hasFingerprint === 'no') {
      setValue('employee.has_fingerprint', false, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    if ((!positionId || positionId === '') && positionApplied) {
      positionId = Number(positionApplied);
      setValue('employee.position_id', positionId, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    const base = [
      'employee.code',
      'employee.department_id',
      'employee.branch_id',
      'employee.task_manager',
      // 'employee.manager_id',
      'employee.has_fingerprint',
      'employee.shift_id',
      'employee.join_date',
      'employee.end_date',
    ];

    if (positionId) base.push('employee.position_id');
    if (employmentTypeId) base.push('employee.employment_type_id');

    if (employmentType === 'part_time' || Number(employmentTypeId) === 2) {
      const ptBase = [...base, 'employee.part_time_mode'];

      if (partTimeMode === 'hours') {
        fields = [...ptBase, 'employee.monthly_hours_required'];
      } else if (partTimeMode === 'days') {
        fields = [...ptBase, 'employee.weekly_work_days'];
      } else {
        fields = ptBase;
      }
    } else if (employmentType === 'freelancer') {
      fields = [...base, 'employee.part_time_mode', 'employee.monthly_hours_required'];
    } else {
      fields = [...base, 'employee.weekly_work_days'];
    }
  }

  return fields;
};

export default function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  applicantId: applicantIdProp,
  mode: modeProp,
  startStep: startStepProp,
  onSuccess,
}) {
  const isEdit = !!employee;
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromApplicantId = applicantIdProp ?? searchParams.get('fromApplicant');
  const mode = modeProp ?? searchParams.get('mode');
  const stepFromUrl = startStepProp ?? Number(searchParams.get('step') || 1);

  const isHireMode = !employee && mode === 'hire' && !!fromApplicantId;

  const visibleSteps = useMemo(() => {
    const allSteps = [
      {
        id: 'personal',
        label: t('applicants.steps.personalInfo'),
        component: StepPersonalInfo,
        fields: STEP_FIELD_MAP[1],
      },
      {
        id: 'role',
        label: t('applicants.steps.roleAvailability'),
        component: StepRoleAvailability,
        fields: STEP_FIELD_MAP[2],
      },
      {
        id: 'experience',
        label: t('applicants.steps.experience'),
        component: StepExperience,
        fields: STEP_FIELD_MAP[3],
      },
      {
        id: 'education',
        label: t('applicants.steps.education'),
        component: StepEducation,
        fields: STEP_FIELD_MAP[4],
      },
      {
        id: 'skills',
        label: t('applicants.steps.skillsLinks'),
        component: StepSkillsAndLinks,
        fields: STEP_FIELD_MAP[5],
      },
      {
        id: 'attachments',
        label: t('applicants.steps.attachment'),
        component: StepAttachments,
        fields: STEP_FIELD_MAP[6],
      },
      {
        id: 'consents',
        label: t('applicants.steps.consents'),
        component: StepConsents,
        fields: STEP_FIELD_MAP[7],
      },
      {
        id: 'employment',
        label: t('employees.form.employmentDetails'),
        component: StepEmploymentDetails,
        fields: STEP_FIELD_MAP[8],
      },
      {
        id: 'salary',
        label: t('employees.form.salaryDetails'),
        component: StepSalaryDetails,
        fields: STEP_FIELD_MAP[9],
      },
    ];

    return isHireMode ? allSteps : allSteps.filter((step) => step.id !== 'consents');
  }, [t, isHireMode]);

  const { create } = useUpsertEmployee();
  const updatePersonal = useUpdatePersonalData();
  const hireApplicantMutation = useHireApplicant();

  const [currentStep, setCurrentStep] = useState(1);
  const [step9TriedSubmit, setStep9TriedSubmit] = useState(false);

  const { mappedValues: hireMappedValues } = useApplicantForHire(fromApplicantId, {
    enabled: isHireMode,
  });

  const formValues = useMemo(() => {
    if (isEdit && employee) {
      const alreadyMapped = Object.prototype.hasOwnProperty.call(employee, 'first_name');
      return alreadyMapped ? employee : mapPersonalDataApiToForm(employee);
    }

    if (isHireMode && hireMappedValues) {
      return mapApplicantToEmployeeForm(hireMappedValues);
    }

    return null;
  }, [employee, isEdit, isHireMode, hireMappedValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
    control,
    getValues,
    getFieldState,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false,
  });

  const {
    fields: experienceFields,
    append: addExperience,
    remove: removeExperience,
    replace: replaceExperiences,
  } = useFieldArray({ control, name: 'experiences' });

  const {
    fields: educationFields,
    append: addEducation,
    remove: removeEducation,
    replace: replaceEducations,
  } = useFieldArray({ control, name: 'educations' });

  const {
    fields: languageFields,
    append: addLanguage,
    remove: removeLanguage,
    replace: replaceLanguages,
  } = useFieldArray({ control, name: 'languages' });

  const watchedBranchId = watch('employee.branch_id');

  useEffect(() => {
    if (!open) return;
    if (watchedBranchId == null) return;

    if (!Array.isArray(watchedBranchId)) {
      setValue('employee.branch_id', watchedBranchId === '' ? [] : [watchedBranchId], {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [open, watchedBranchId, setValue]);

  useEffect(() => {
    const currentIds = getValues('employee.position_kpi_item_ids');
    if (Array.isArray(currentIds) && currentIds.length > 0) return;

    const selectedPosition =
      getValues('employee.position_id') || getValues('position_applied_for_id');
    if (!selectedPosition) return;

    const candidateIds = (
      Array.isArray(formValues?.employee?.position_kpi_item_ids)
        ? formValues.employee.position_kpi_item_ids
        : []
    ).filter(Boolean);

    if (candidateIds.length > 0) {
      setValue('employee.position_kpi_item_ids', candidateIds.map(Number), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [formValues, getValues, setValue]);

  useEffect(() => {
    if (!open) return;

    const nextStep = isHireMode
      ? Math.min(Math.max(Number(stepFromUrl) || 1, 1), visibleSteps.length || 1)
      : 1;

    setCurrentStep((prev) => (prev === nextStep ? prev : nextStep));

    if (formValues) {
      const merged = {
        ...DEFAULT_VALUES,
        ...formValues,
        employee: {
          ...DEFAULT_VALUES.employee,
          ...(formValues.employee || {}),
          department_id:
            formValues?.employee?.department_id === '' ||
            formValues?.employee?.department_id == null
              ? ''
              : Number(formValues.employee.department_id),
          branch_id: Array.isArray(formValues?.employee?.branch_id)
            ? formValues.employee.branch_id.map(Number).filter(Number.isFinite)
            : formValues?.employee?.branch_id
              ? [Number(formValues.employee.branch_id)].filter(Number.isFinite)
              : [],
          task_manager: normalizeTaskManagerIds(formValues?.employee?.task_manager),
          manager_id:
            formValues?.employee?.manager_id === '' || formValues?.employee?.manager_id == null
              ? ''
              : Number(formValues.employee.manager_id),
          position_id:
            formValues?.employee?.position_id === '' || formValues?.employee?.position_id == null
              ? ''
              : Number(formValues.employee.position_id),
          employment_type_id:
            formValues?.employee?.employment_type_id === '' ||
            formValues?.employee?.employment_type_id == null
              ? ''
              : Number(formValues.employee.employment_type_id),
        },
      };

      reset(merged);
      replaceExperiences(merged.experiences || []);
      replaceEducations(merged.educations || []);
      replaceLanguages(merged.languages || []);
    } else {
      reset(DEFAULT_VALUES);
      replaceExperiences([]);
      replaceEducations([]);
      replaceLanguages([]);
    }
  }, [
    open,
    formValues,
    isHireMode,
    stepFromUrl,
    visibleSteps.length,
    reset,
    replaceExperiences,
    replaceEducations,
    replaceLanguages,
  ]);

  const saveEmployee = async (values, { closeAfterSave = true } = {}) => {
    if (!values.employee.position_id && values.position_applied_for_id) {
      values.employee.position_id = Number(values.position_applied_for_id);
    }

    if (
      (!Array.isArray(values.employee.position_kpi_item_ids) ||
        values.employee.position_kpi_item_ids.length === 0) &&
      Array.isArray(formValues?.employee?.position_kpi_item_ids) &&
      formValues.employee.position_kpi_item_ids.length > 0
    ) {
      values.employee.position_kpi_item_ids = formValues.employee.position_kpi_item_ids
        .map(Number)
        .filter(Boolean);
    }

    if (isHireMode && fromApplicantId) {
      const normalizeDateInput = (value) => {
        if (!value) return '';
        const str = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

        const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;

        return str;
      };

      if (!values.employee.position_id && values.position_applied_for_id) {
        values.employee.position_id = Number(values.position_applied_for_id);
      }

      if (!values.employee.part_time_mode && values.employee.part_time_type) {
        values.employee.part_time_mode = values.employee.part_time_type;
      }

      values.employee.join_date = normalizeDateInput(values.employee.join_date);
      values.employee.end_date = normalizeDateInput(values.employee.end_date);

      if (values.employee.has_fingerprint === 'yes') {
        values.employee.has_fingerprint = true;
      } else if (values.employee.has_fingerprint === 'no') {
        values.employee.has_fingerprint = false;
      }

      const payload = buildHireApplicantPayload(values);
      const result = await hireApplicantMutation.mutateAsync({
        applicantId: fromApplicantId,
        payload,
      });

      toast.success(result?.message || 'Applicant hired successfully');

      reset(DEFAULT_VALUES);
      replaceExperiences([]);
      replaceEducations([]);
      replaceLanguages([]);

      setCurrentStep(1);
      setStep9TriedSubmit(false);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/employees');
      }
      return;
    }
    const payload = buildPayload(values);

    // 🔥 1) payload قبل أي تحويل
    console.log('1️⃣ PAYLOAD =>', payload);
    console.log('1️⃣ EMPLOYEE =>', payload.employee);

    let result;
    if (isEdit) {
      const personalDataId = values?.id || formValues?.id;
      result = await updatePersonal.mutateAsync({ id: personalDataId, values: payload });

      toast.success(result?.message || 'Employee updated successfully');

      if (closeAfterSave) {
        reset(DEFAULT_VALUES);
        replaceExperiences([]);
        replaceEducations([]);
        replaceLanguages([]);
        setCurrentStep(1);
        setStep9TriedSubmit(false);
        onOpenChange(false);
        onSuccess?.();
      }
    } else {
      result = await create.mutateAsync(payload);

      toast.success(result?.message || 'Employee created successfully');

      reset(DEFAULT_VALUES);
      replaceExperiences([]);
      replaceEducations([]);
      replaceLanguages([]);
      setCurrentStep(1);
      setStep9TriedSubmit(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const onSubmit = async (values) => {
    try {
      await saveEmployee(values, { closeAfterSave: true });
    } catch (error) {
      console.error('Failed to save employee:', error);
      console.error('Backend response:', error?.response?.data);
      toast.error(getBackendMessage(error));
    }
  };

  const handleStepSubmit = async () => {
    try {
      const currentStepConfig = visibleSteps[currentStep - 1];
      const fields = getStepFields(currentStepConfig, getValues, setValue);
      const valid = fields.length ? await trigger(fields, { shouldFocus: true }) : true;

      if (!valid) {
        const failed = fields.map((name) => ({
          name,
          value: getValues(name),
          error: getFieldState(name).error?.message,
        }));

        console.log('Step save validation failed:', failed);
        return;
      }

      const values = getValues();
      await saveEmployee(values, { closeAfterSave: true });
    } catch (error) {
      console.error('Failed to save step:', error);
      console.error('Backend response:', error?.response?.data);
      toast.error(getBackendMessage(error));
    }
  };

  const handleNext = async () => {
    setStep9TriedSubmit(false);

    if (isEdit) {
      if (currentStep < visibleSteps.length) setCurrentStep((p) => p + 1);
      return;
    }

    const currentStepConfig = visibleSteps[currentStep - 1];
    const fields = getStepFields(currentStepConfig, getValues, setValue);
    const valid = fields.length ? await trigger(fields, { shouldFocus: true }) : true;

    if (!valid) {
      const failed = fields.map((name) => ({
        name,
        value: getValues(name),
        error: getFieldState(name).error?.message,
      }));

      console.log('Step validation failed details:', failed);
      return;
    }

    if (currentStep < visibleSteps.length) {
      setCurrentStep((p) => p + 1);
    }
  };

  const handleBack = () => {
    setStep9TriedSubmit(false);
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  };

  const currentStepConfig = visibleSteps[currentStep - 1];

  const isSaving = create.isPending || updatePersonal.isPending || hireApplicantMutation.isPending;

  const stepPropsById = {
    personal: { register, errors, setValue, watch, control },
    role: { register, errors, setValue, watch },
    experience: {
      experienceFields,
      addExperience,
      removeExperience,
      register,
      setValue,
      watch,
      errors,
    },
    education: {
      educationFields,
      addEducation,
      removeEducation,
      register,
      setValue,
      watch,
      errors,
    },
    skills: {
      register,
      errors,
      languageFields,
      addLanguage,
      removeLanguage,
      setValue,
      watch,
    },
    attachments: { register, errors },
    consents: { watch, setValue },
    employment: { register, setValue, watch, errors },
    salary: { register, setValue, watch, errors, showErrors: step9TriedSubmit, control },
  };

  const formMethods = {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
    control,
    getValues,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setStep9TriedSubmit(false);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[95vw] overflow-y-auto p-4 sm:w-[90vw] sm:max-w-[90vw] sm:p-6 md:w-[80vw] md:max-w-[80vw] md:p-8 lg:w-[70vw] lg:max-w-[70vw] lg:p-10">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-2xl font-semibold md:text-3xl">
            {isEdit
              ? t('employees.form.editEmployee')
              : isHireMode
                ? t('employees.form.hireApplicant')
                : t('applicants.applicationFormTitle')}
          </DialogTitle>

          <StepBar
            currentStep={currentStep}
            allowAll={isEdit || isHireMode}
            steps={visibleSteps.map((step) => step.label)}
            onStepChange={(s) => {
              setStep9TriedSubmit(false);
              setCurrentStep(s);
            }}
          />
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, (errs) => {
            console.log('BLOCKED BY VALIDATION (full):', errs);

            for (const [index, step] of visibleSteps.entries()) {
              const fields = getStepFields(step, getValues, setValue);
              if (!fields) continue;

              const hasErrorInStep = fields.some((fieldPath) => {
                const parts = fieldPath.split('.');
                let current = errs;

                for (const part of parts) {
                  if (!current || !current[part]) return false;
                  current = current[part];
                }

                return true;
              });

              if (hasErrorInStep) {
                setCurrentStep(index + 1);
                break;
              }
            }
          })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const tag = e.target?.tagName?.toLowerCase();
              if (tag !== 'textarea') e.preventDefault();
            }
          }}
          className="mt-6 space-y-6"
        >
          <FormProvider {...formMethods}>
            {currentStepConfig &&
              React.createElement(currentStepConfig.component, {
                ...(stepPropsById[currentStepConfig.id] || {}),
              })}
          </FormProvider>

          <DialogFooter className="mt-4 flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  {t('common.back')}
                </Button>
              )}
            </div>

            <div className="ms-auto flex items-center gap-2">
              {isEdit && currentStep < visibleSteps.length && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStepSubmit}
                  disabled={isSaving}
                >
                  {t('common.update')}
                </Button>
              )}

              {currentStep < visibleSteps.length ? (
                <Button type="button" onClick={handleNext}>
                  {t('common.next')}
                </Button>
              ) : (
                <Button type="submit" onClick={() => setStep9TriedSubmit(true)} disabled={isSaving}>
                  {isEdit
                    ? t('common.submit')
                    : isHireMode
                      ? t('employees.form.hireEmployee')
                      : t('common.submit')}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { EmployeeFormDialog };
