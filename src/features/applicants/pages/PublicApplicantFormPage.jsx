'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import StepBar from '@/features/employees/components/form/StepBar';
import { FormProvider } from '@/components/forms/Form';
import StepPersonalInfoPublic from '../components/publicForm/StepPersonalInfoPublic';
import StepRoleAvailabilityPublic from '../components/publicForm/StepRoleAvailabilityPublic';
import StepExperience from '@/features/employees/components/form/StepExperience';
import StepEducationPublic from '../components/publicForm/StepEducationPublic';
import StepSkillsAndLinks from '@/features/employees/components/form/StepSkillsAndLinks';
import StepAttachments from '@/features/employees/components/form/StepAttachments';
import StepConsents from '@/features/employees/components/form/StepConsents';

import { useCreateApplicantPublic } from '../hooks/useCreateApplicantPublic';
import { buildApplicantFormData } from '../utils/buildApplicantFormData';
import { applicantSchema } from '../schemas/applicant.schema';
import { toast } from 'sonner';

import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/services/auth/auth.store';

const TOTAL_STEPS = 7;

const APPLICANT_STEPS = [
  'Personal Information',
  'Role & Availability',
  'Experience',
  'Education',
  'Skills & Links',
  'Attachment',
  'Consents',
];

const stepFieldMap = {
  1: [
    'full_name_ar',
    'first_name',
    'middle_name',
    'last_name',
    'preferred_name',
    'national_id',
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
};

const DEFAULT_VALUES = {
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
  is_smoker: false,
  has_chronic_disease: false,
  chronic_diseases: null,
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

  experiences: [],
  educations: [],
  skills: [],
  languages: [],

  certification_attatchment: null,
  facebook_link: '',
  linkedin_link: '',
  github_link: '',
  additional_link: '',

  cv: null,
  cover_letter: '',

  consent_data_processing: false,
  consent_information_accurate: false,
  consent_reference_checks: false,
};

export default function PublicApplicantFormPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const createApplicant = useCreateApplicantPublic();

  const { code: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((s) => s.user);
  const companyId =
    searchParams.get('company_id') ||
    searchParams.get('companyId') ||
    authUser?.company_id ||
    '1';
  const applyCode =
    paramCode ||
    searchParams.get('apply_code') ||
    searchParams.get('code') ||
    '';

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  const toggleLanguage = () => {
    i18n.changeLanguage(isArabic ? 'en' : 'ar');
  };

  const applicantSteps = [
    t('applicants.steps.personalInfo'),
    t('applicants.steps.roleAvailability'),
    t('applicants.steps.experience'),
    t('applicants.steps.education'),
    t('applicants.steps.skillsLinks'),
    t('applicants.steps.attachment'),
    t('applicants.steps.consents'),
  ];

  const methods = useForm({
    resolver: zodResolver(applicantSchema),
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
    control,
  } = methods;

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

  useEffect(() => {
    replaceExperiences([]);
    replaceEducations([]);
    replaceLanguages([]);
  }, [replaceExperiences, replaceEducations, replaceLanguages]);

  const onSubmit = async (values) => {
    try {
      const fd = buildApplicantFormData({
        ...values,
        company_id: values.company_id || companyId,
        apply_code: values.apply_code || applyCode || undefined,
        code: values.code || applyCode || undefined,
      });
      const response = await createApplicant.mutateAsync(fd);

      const successMessage =
        response?.message || response?.data?.message || 'Application submitted successfully';

      toast.success(successMessage);

      reset(DEFAULT_VALUES);
      replaceExperiences([]);
      replaceEducations([]);
      replaceLanguages([]);
      setCurrentStep(1);
    } catch (e) {
      console.error(e);

      const validationErrors = e?.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors)?.flat()?.[0]
        : null;

      const errorMessage =
        firstValidationError ||
        e?.response?.data?.message ||
        e?.message ||
        'Failed to submit application';

      toast.error(errorMessage);
    }
  };

  const handleNext = async () => {
    const fields = stepFieldMap[currentStep] || [];
    if (fields.length) {
      const ok = await trigger(fields, { shouldFocus: true });
      if (!ok) return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((p) => p + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  };

  const handleFinalSubmit = async () => {
    const fields = stepFieldMap[7] || [];
    const ok = await trigger(fields, { shouldFocus: true });
    if (!ok) return;

    await handleSubmit(onSubmit)();
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="flex min-h-screen flex-col bg-[#f7f7f7]">
      <header className="flex h-9 items-center justify-end border-b bg-white px-4">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-800"
        >
          <Globe className="h-4 w-4" />
          {isArabic ? 'EN' : 'العربية'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="mb-7 text-center">
            <img
              src="/nizam-logo.svg"
              alt="Nizam"
              className="mx-auto mb-3 h-[100px] w-auto object-contain"
            />

            <h1 className="font-serif leading-tight font-bold text-slate-800 sm:text-3xl">
              {t('applicants.publicForm.title')}
            </h1>
          </div>

          <StepBar
            currentStep={currentStep}
            steps={applicantSteps}
            allowAll={false}
            onStepChange={(s) => setCurrentStep(s)}
          />

          <form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const tag = e.target?.tagName?.toLowerCase();
                if (tag !== 'textarea') e.preventDefault();
              }
            }}
            className="mt-8 space-y-8"
          >
            <FormProvider
              {...{
                ...methods,
                getValues: methods.getValues,
              }}
            >
              {currentStep === 1 && <StepPersonalInfoPublic setValue={setValue} watch={watch} />}

              {currentStep === 2 && (
                <StepRoleAvailabilityPublic register={register} companyId={companyId} />
              )}

              {currentStep === 3 && (
                <StepExperience
                  experienceFields={experienceFields}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
              )}

              {currentStep === 4 && (
                <StepEducationPublic
                  educationFields={educationFields}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />
              )}

              {currentStep === 5 && (
                <StepSkillsAndLinks
                  register={register}
                  errors={errors}
                  languageFields={languageFields}
                  addLanguage={addLanguage}
                  removeLanguage={removeLanguage}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 6 && <StepAttachments />}

              {currentStep === 7 && <StepConsents watch={watch} setValue={setValue} />}
            </FormProvider>

            <div className="mx-auto flex max-w-[420px] items-center justify-between gap-3 pt-4">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="min-w-[120px]"
                >
                  {t('common.back')}
                </Button>
              ) : (
                <div />
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button type="button" onClick={handleNext} className="min-w-[220px]">
                  {t('common.next')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={createApplicant.isPending}
                  className="min-w-[220px]"
                >
                  {createApplicant.isPending ? t('common.loading') : t('common.submit')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
      <footer className="border-t bg-white px-4 py-3">
        <div className="flex items-center justify-center">
          <a
            href="https://programshouse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-slate-700"
          >
            <img
              src="/programs-logo.svg"
              alt="Programs House"
              className="h-8 w-auto object-contain"
            />
            <span>{t('applicants.publicForm.copyright')}</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
