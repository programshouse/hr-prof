// src/features/applicants/components/publicForm/StepEducationPublic.jsx
import React from 'react';
import StepSection from './StepSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// use the reusable date picker input (text editable + calendar)
import DatePickerInput from '@/components/ui/date-picker-input';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// search combobox imports (same as Step 1)
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

// ✅ PUBLIC countries hook (no auth)
import { usePublicCountries } from '@/features/applicants/hooks/usePublicLookups';

// Reusable date picker for this step (now uses DatePickerInput)
function DatePickerField({ label, required, fieldName, register, watch, setValue, error }) {
  const value = watch(fieldName) || '';

  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>

      {/* keep field registered in RHF */}
      <input type="hidden" {...register(fieldName)} />

      <DatePickerInput
        value={value}
        onChange={(iso) => setValue(fieldName, iso, { shouldDirty: true, shouldValidate: true })}
      />

      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  );
}

/**
 * Field of Study options (expand anytime).
 * We store the final value into `educations.${index}.field_of_study` (string).
 */
const FIELD_OF_STUDY_OPTIONS = [
  'Accounting',
  'Agriculture',
  'Architecture',
  'Arts / Fine Arts',
  'Biology',
  'Biotechnology',
  'Business Administration',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Communications',
  'Computer Science',
  'Data Science',
  'Dentistry',
  'Design',
  'Economics',
  'Education',
  'Electrical Engineering',
  'Engineering (General)',
  'English / Literature',
  'Environmental Science',
  'Finance',
  'Graphic Design',
  'History',
  'Hospitality / Tourism',
  'Human Resources',
  'Information Systems',
  'International Relations',
  'Journalism',
  'Law',
  'Linguistics',
  'Management',
  'Marketing',
  'Mathematics',
  'Mechanical Engineering',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Health',
  'Software Engineering',
  'Statistics',
  'Translation',
  'Veterinary Medicine',
];

// Special “Other” option (searchable too)
const FIELD_OTHER_VALUE = '__other__';

export default function StepEducationPublic({
  educationFields,
  addEducation,
  removeEducation,
  register,
  setValue,
  watch,
  errors,
}) {
  // ✅ public countries
  const { data: countriesRes, isLoading: isCountriesLoading } = usePublicCountries();

  // ✅ normalize response so the UI always receives an array
  const countries = React.useMemo(() => {
    // expected: backend returns []
    if (Array.isArray(countriesRes)) return countriesRes;

    // fallback if backend wraps later: { data: [] }
    if (countriesRes && Array.isArray(countriesRes.data)) return countriesRes.data;

    return [];
  }, [countriesRes]);

  // reorder countries: Egypt → Saudi → rest (same logic as Step 1)
  const orderedCountries = React.useMemo(() => {
    const list = Array.isArray(countries) ? countries : [];

    const normalize = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase();

    const isEgypt = (c) => normalize(c?.name_en) === 'egypt';
    const isSaudi = (c) =>
      normalize(c?.name_en) === 'saudi arabia' ||
      normalize(c?.name_en) === 'kingdom of saudi arabia';

    const egypt = list.find(isEgypt);
    const saudi = list.find((c) => !isEgypt(c) && isSaudi(c));
    const rest = list.filter((c) => !isEgypt(c) && !isSaudi(c));

    return [egypt, saudi].filter(Boolean).concat(rest);
  }, [countries]);

  // keep popover open state per education row
  const [openCountryByIndex, setOpenCountryByIndex] = React.useState({});
  const setCountryOpen = (index, val) => setOpenCountryByIndex((p) => ({ ...p, [index]: val }));

  // keep field-of-study popover open state per row
  const [openStudyByIndex, setOpenStudyByIndex] = React.useState({});
  const setStudyOpen = (index, val) => setOpenStudyByIndex((p) => ({ ...p, [index]: val }));

  const handleAdd = () => {
    addEducation({
      degree_level: '',
      field_of_study: '',

      // helper fields for UI
      field_of_study_choice: '', // either one of the labels OR "__other__"
      field_of_study_other: '', // typed when other

      institution: '',
      institution_country: '',
      start_date: '',
      end_date: '',
      education_attatchment: null,
    });
  };

  return (
    <StepSection title="Education">
      {/* Header with + icon (no form until user clicks +) */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">Add your academic background.</span>
        <Button type="button" variant="outline" size="icon" onClick={handleAdd}>
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {educationFields.map((field, index) => {
          const eduErrors =
            errors?.educations && errors.educations[index] ? errors.educations[index] : {};

          // watched country id per education row
          const countryId = watch(`educations.${index}.institution_country`);
          const selectedCountry =
            countries?.find((c) => String(c.id) === String(countryId)) || null;
          const openCountry = !!openCountryByIndex[index];

          // field-of-study per row
          const studyChoice = watch(`educations.${index}.field_of_study`) || '';
          const studyOther = watch(`educations.${index}.field_of_study_other`) || '';
          const openStudy = !!openStudyByIndex[index];
          const isOtherSelected = studyChoice === FIELD_OTHER_VALUE;

          // What to show on the button
          const studyButtonLabel = isOtherSelected
            ? studyOther
              ? `Other: ${studyOther}`
              : 'Other...'
            : studyChoice || 'Select field...';

          return (
            <div key={field.id} className="space-y-4 rounded-md border border-slate-200 p-4">
              {/* Card header with number + delete icon */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Education #{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeEducation(index);
                  }}
                >
                  <Trash2 className="size-4 text-slate-500 hover:text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Degree Level */}
                <div className="space-y-1.5">
                  <Label required>Degree Level</Label>

                  <input type="hidden" {...register(`educations.${index}.degree_level`)} />

                  <Select
                    value={watch(`educations.${index}.degree_level`) || ''}
                    onValueChange={(v) => {
                      setValue(`educations.${index}.degree_level`, v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="select a degree level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor&apos;s</SelectItem>
                      <SelectItem value="master">Master&apos;s</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {eduErrors?.degree_level && (
                    <p className="text-destructive text-xs">{eduErrors.degree_level.message}</p>
                  )}
                </div>

                {/* Field Of Study (searchable combobox like Country + Other input) */}
                <div className="space-y-1.5">
                  <Label required>Field Of Study</Label>

                  {/* backend stored field */}
                  <input type="hidden" {...register(`educations.${index}.field_of_study`)} />
                  {/* helper fields (safe if backend ignores) */}
                  <input type="hidden" {...register(`educations.${index}.field_of_study_choice`)} />
                  <input type="hidden" {...register(`educations.${index}.field_of_study_other`)} />

                  <Popover open={openStudy} onOpenChange={(v) => setStudyOpen(index, v)}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="input" className="h-9 w-full justify-between">
                        <span className={cn('truncate', !studyChoice ? 'text-slate-500' : '')}>
                          {studyButtonLabel}
                        </span>
                        <ChevronsUpDown className="size-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search field of study..." />
                        <CommandList>
                          <CommandEmpty>No field found.</CommandEmpty>

                          <CommandGroup heading="Fields">
                            {FIELD_OF_STUDY_OPTIONS.map((label) => {
                              const isSelected = studyChoice === label;

                              return (
                                <CommandItem
                                  key={label}
                                  value={label}
                                  onSelect={() => {
                                    // set choice to label
                                    setValue(`educations.${index}.field_of_study_choice`, label, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });

                                    // store final value for backend
                                    setValue(`educations.${index}.field_of_study`, label, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });

                                    // clear other text
                                    setValue(`educations.${index}.field_of_study_other`, '', {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });

                                    setStudyOpen(index, false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 size-4',
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {label}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>

                          <CommandGroup heading="Other">
                            <CommandItem
                              value="Other"
                              onSelect={() => {
                                setValue(
                                  `educations.${index}.field_of_study_choice`,
                                  FIELD_OTHER_VALUE,
                                  { shouldDirty: true, shouldValidate: true }
                                );

                                // clear backend field until typed
                                setValue(`educations.${index}.field_of_study`, '', {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });

                                setStudyOpen(index, false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4',
                                  isOtherSelected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              Other
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {isOtherSelected && (
                    <div className="pt-2">
                      <Label>Other field</Label>
                      <Input
                        className="mt-1 h-9 text-sm"
                        value={studyOther}
                        placeholder="Type your field of study..."
                        onChange={(e) => {
                          const v = e.target.value;

                          setValue(`educations.${index}.field_of_study_other`, v, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });

                          // backend final value
                          setValue(`educations.${index}.field_of_study`, v, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                    </div>
                  )}

                  {eduErrors?.field_of_study && (
                    <p className="text-destructive text-xs">{eduErrors.field_of_study.message}</p>
                  )}
                </div>

                {/* Institution */}
                <div className="space-y-1.5">
                  <Label required>Faculty/ Institution</Label>
                  <Input className="h-9 text-sm" {...register(`educations.${index}.institution`)} />
                  {eduErrors?.institution && (
                    <p className="text-destructive text-xs">{eduErrors.institution.message}</p>
                  )}
                </div>

                {/* Country – searchable combobox like Step 1 */}
                <div className="space-y-1.5">
                  <Label required>Country</Label>

                  <input type="hidden" {...register(`educations.${index}.institution_country`)} />

                  <Popover open={openCountry} onOpenChange={(v) => setCountryOpen(index, v)}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="input" className="h-9 w-full justify-between">
                        {selectedCountry
                          ? selectedCountry.name_en
                          : isCountriesLoading
                            ? 'Loading...'
                            : 'Select country...'}
                        <ChevronsUpDown className="size-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {orderedCountries.map((country) => {
                              const isSelected = Number(country.id) === Number(countryId);

                              return (
                                <CommandItem
                                  key={country.id}
                                  value={country.name_en}
                                  onSelect={() => {
                                    setValue(
                                      `educations.${index}.institution_country`,
                                      Number(country.id),
                                      { shouldDirty: true, shouldValidate: true }
                                    );
                                    setCountryOpen(index, false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 size-4',
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {country.name_en}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {eduErrors?.institution_country && (
                    <p className="text-destructive text-xs">
                      {eduErrors.institution_country.message}
                    </p>
                  )}
                </div>

                {/* Start Date */}
                <DatePickerField
                  label="Start Date"
                  required
                  fieldName={`educations.${index}.start_date`}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={eduErrors?.start_date}
                />

                {/* End Date */}
                <DatePickerField
                  label="End Date"
                  required
                  fieldName={`educations.${index}.end_date`}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  error={eduErrors?.end_date}
                />

                {/* Attachment */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <Label>Attachment</Label>
                  {(() => {
                    const value = watch(`educations.${index}.education_attatchment`);

                    const getFileName = () => {
                      if (value instanceof FileList && value.length > 0) {
                        return value[0].name;
                      }
                      if (value instanceof File) {
                        return value.name;
                      }
                      if (value && typeof value === 'string') {
                        const parts = value.split('/');
                        return parts[parts.length - 1];
                      }
                      return null;
                    };

                    const fileName = getFileName();
                    const hasFile = value instanceof FileList || value instanceof File;
                    const hasExistingFile = value && typeof value === 'string';

                    return (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          className="h-9 text-sm"
                          onChange={(e) => {
                            const files = e.target.files;
                            setValue(`educations.${index}.education_attatchment`, files, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                        {hasFile && fileName && (
                          <p className="text-xs text-green-600">
                            <span className="font-medium">✓ File attached:</span> {fileName}
                          </p>
                        )}
                        {!hasFile && hasExistingFile && fileName && (
                          <p className="text-xs text-blue-600">
                            <span className="font-medium">✓ Previously uploaded:</span> {fileName}
                          </p>
                        )}
                        {hasFile && (
                          <p className="text-xs text-slate-500 italic">
                            Note: The file input may appear empty after navigating steps, but your
                            file is still attached.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  {eduErrors?.education_attatchment && (
                    <p className="text-destructive text-xs">
                      {eduErrors.education_attatchment.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* only show general error if there is at least one row */}
        {errors?.educations && educationFields.length > 0 && (
          <p className="text-destructive text-sm">
            {/* @ts-ignore */}
            {errors.educations.message || 'Please check education fields.'}
          </p>
        )}
      </div>
    </StepSection>
  );
}
