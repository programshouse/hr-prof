// src/features/employees/components/steps/StepPersonalInfo.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// use the reusable component (text + calendar)
import DatePickerInput from '@/components/ui/date-picker-input';

// search combobox imports
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// data hooks
import { useCountriesQuery } from '../../hooks/useCountriesQuery';
import { useGovernoratesQuery } from '../../hooks/useGovernoratesQuery';

// popover/button used by country/governorate only
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useMemo } from 'react';

function BoolRadio({ label, value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>

      <div className="rounded-md border bg-white p-3">
        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={label}
              checked={value === true}
              onChange={() => onChange(true)}
            />
            {t('employees.form.yes')}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={label}
              checked={value === false}
              onChange={() => onChange(false)}
            />
            <span>{t('employees.form.no')}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function StepPersonalInfo({ setValue, watch }) {
  const { t } = useTranslation();
  // watched values
  const countryId = watch('country_id');
  const governorateId = watch('governorate_id');

  // new watched values
  const isSmoker = watch('is_smoker') === true;
  const hasChronic = watch('has_chronic_disease') === true;

  // countries
  const { data: countries, isLoading: isCountriesLoading } = useCountriesQuery();

  // governorates
  const { data: governorates, isLoading: isGovernoratesLoading } = useGovernoratesQuery(countryId);

  const hasCountry = !!countryId;

  // popovers
  const [openCountry, setOpenCountry] = useState(false);
  const [openGov, setOpenGov] = useState(false);

  // selected values
  const selectedCountry = countries?.find((c) => Number(c.id) === Number(countryId)) || null;
  const selectedGov = governorates?.find((g) => Number(g.id) === Number(governorateId)) || null;

  // reorder countries: Egypt → Saudi → rest
  const orderedCountries = useMemo(() => {
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

  return (
    <StepSection title={t('applicants.steps.personalInfo')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* First Name */}
        <FormField name="first_name" label={t('employees.form.firstName')} required>
          {({ field }) => <Input {...field} id="first_name" className="h-9 text-sm" />}
        </FormField>

        {/* Middle Name */}
        <FormField name="middle_name" label={t('common.middleName')}>
          {({ field }) => <Input {...field} id="middle_name" className="h-9 text-sm" />}
        </FormField>

        {/* Last Name */}
        <FormField name="last_name" label={t('employees.form.lastName')} required>
          {({ field }) => <Input {...field} id="last_name" className="h-9 text-sm" />}
        </FormField>

        {/* Full Name (Arabic) */}
        <FormField name="full_name_ar" label={t('common.fullNameArabic')} required>
          {({ field }) => <Input {...field} id="full_name_ar" dir="rtl" className="h-9 text-sm" />}
        </FormField>

        {/* Preferred Name */}
        <FormField name="preferred_name" label={t('common.preferredName')}>
          {({ field }) => <Input {...field} id="preferred_name" className="h-9 text-sm" />}
        </FormField>

        {/* National ID */}
        <FormField name="national_id" label={t('common.nationalId')} required>
          {({ field }) => <Input {...field} id="national_id" className="h-9 text-sm" />}
        </FormField>

        {/* National ID Expiry Date */}
        <FormField
          name="employee.national_id_expiry_date"
          label={t('employees.form.nationalIdExpiryDate', 'National ID Expiry Date')}
        >
          {({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              id="national_id_expiry_date"
              type="date"
              className="h-9 text-sm"
            />
          )}
        </FormField>

        {/* Email */}
        <FormField name="email" label={t('employees.form.email')} required>
          {({ field }) => <Input {...field} id="email" type="email" className="h-9 text-sm" />}
        </FormField>

        {/* Phone */}
        <FormField name="phone" label={t('employees.form.phone')} required>
          {({ field }) => <Input {...field} id="phone" className="h-9 text-sm" />}
        </FormField>

        {/* WhatsApp */}
        <FormField name="whatsapp_number" label={t('employees.form.whatsappNumber')}>
          {({ field }) => <Input {...field} id="whatsapp_number" className="h-9 text-sm" />}
        </FormField>

        {/* Birth Date */}
        <FormField name="birth_date" label={t('employees.form.birthDate')} required>
          {({ field }) => (
            <DatePickerInput value={field.value || ''} onChange={(iso) => field.onChange(iso)} />
          )}
        </FormField>
        {/* NEW: Smoking (same style as Insurance) */}
        <div className="sm:col-span-1">
          <div className="space-y-1.5">
            <div className="text-sm font-medium">{t('employees.form.smoker')}</div>

            <div className="rounded-md border bg-white p-3">
              <RadioGroup
                className="flex items-center gap-8"
                value={isSmoker ? 'yes' : 'no'}
                onValueChange={(val) => {
                  const next = val === 'yes';

                  setValue('is_smoker', next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="smoker_yes" value="yes" />
                  <Label htmlFor="smoker_yes" className="font-normal">
                    {t('employees.form.yes')}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="smoker_no" value="no" />
                  <Label htmlFor="smoker_no" className="font-normal">
                    {t('employees.form.no')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        {/* ✅ NEW: Chronic Disease (same boxed style as Insurance) */}
        <div className="sm:col-span-1">
          <div className="space-y-1.5">
            <div className="text-sm font-medium">{t('employees.form.hasChronicDisease')}</div>

            <div className="rounded-md border bg-white p-3">
              <RadioGroup
                className="flex items-center gap-8"
                value={hasChronic ? 'yes' : 'no'}
                onValueChange={(val) => {
                  const next = val === 'yes';

                  setValue('has_chronic_disease', next, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });

                  if (!next) {
                    setValue('chronic_diseases', null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="chronic_yes" value="yes" />
                  <Label htmlFor="chronic_yes" className="font-normal">
                    {t('employees.form.yes')}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="chronic_no" value="no" />
                  <Label htmlFor="chronic_no" className="font-normal">
                    {t('employees.form.no')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        {/* Chronic Diseases text (shown only if Yes) */}
        {hasChronic && (
          <div className="sm:col-span-2 lg:col-span-3">
            <FormField name="chronic_diseases" label={t('employees.form.chronicDiseases')} required>
              {({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={t('employees.form.chronicDiseasesPlaceholder')}
                  className="h-9 text-sm"
                />
              )}
            </FormField>
          </div>
        )}
        {/* Country – searchable combobox */}
        <div className="space-y-1.5">
          <FormField name="country_id" label={t('employees.form.country')} required>
            {() => (
              <Popover open={openCountry} onOpenChange={setOpenCountry}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="input" className="h-9 w-full justify-between">
                    {selectedCountry
                      ? selectedCountry.name_en
                      : isCountriesLoading
                        ? t('common.loading')
                        : t('employees.form.selectCountryPlaceholder')}
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('employees.form.searchCountryPlaceholder')} />
                    <CommandList>
                      <CommandEmpty>{t('employees.form.noCountryFound')}</CommandEmpty>
                      <CommandGroup>
                        {orderedCountries.map((country) => {
                          const isSelected = Number(country.id) === Number(countryId);
                          return (
                            <CommandItem
                              key={country.id}
                              value={country.name_en}
                              onSelect={() => {
                                setValue('country_id', Number(country.id), {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                setValue('governorate_id', null, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                setOpenCountry(false);
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
            )}
          </FormField>
        </div>

        {/* Governorate – searchable combobox */}
        <div className="space-y-1.5">
          <FormField name="governorate_id" label={t('employees.form.governorate')} required>
            {() => (
              <Popover open={openGov} onOpenChange={setOpenGov}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="input"
                    role="combobox"
                    aria-expanded={openGov}
                    disabled={!hasCountry || isGovernoratesLoading}
                    className="h-9 w-full justify-between text-sm"
                  >
                    {!hasCountry
                      ? t('employees.form.selectCountryFirst')
                      : selectedGov
                        ? selectedGov.name_en
                        : isGovernoratesLoading
                          ? t('employees.form.loadingGovernorates')
                          : t('employees.form.selectGovernoratePlaceholder')}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('employees.form.searchGovernoratePlaceholder')} />
                    <CommandList>
                      <CommandEmpty>{t('employees.form.noGovernorateFound')}</CommandEmpty>
                      <CommandGroup>
                        {governorates?.map((gov) => {
                          const numericId = Number(gov.id);
                          const isSelected = numericId === Number(governorateId);
                          return (
                            <CommandItem
                              key={gov.id}
                              value={gov.name_en}
                              onSelect={() => {
                                setValue('governorate_id', numericId, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                setOpenGov(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4',
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {gov.name_en}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </FormField>
        </div>

        {/* City */}
        <FormField name="city" label={t('employees.form.city')}>
          {({ field }) => <Input {...field} id="city" className="h-9 text-sm" />}
        </FormField>

        {/* Marital Status */}
        <FormField name="marital_status" label={t('employees.form.maritalStatus')}>
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="marital_status" className="h-9 text-sm">
                <SelectValue placeholder={t('employees.form.selectStatusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t('employees.form.single')}</SelectItem>
                <SelectItem value="married">{t('employees.form.married')}</SelectItem>
                <SelectItem value="divorced">{t('employees.form.divorced')}</SelectItem>
                <SelectItem value="widowed">{t('employees.form.widowed')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        {/* Gender */}
        <FormField name="gender" label={t('employees.form.gender')} required>
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="gender" className="h-9 text-sm">
                <SelectValue placeholder={t('employees.form.selectGenderPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('employees.form.male')}</SelectItem>
                <SelectItem value="female">{t('employees.form.female')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        {/* Military Service */}
        <FormField name="military_service" label={t('employees.form.militaryService')}>
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="military_service" className="h-9 text-sm">
                <SelectValue placeholder={t('employees.form.selectStatusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">{t('employees.form.completed')}</SelectItem>
                <SelectItem value="exempted">{t('employees.form.exempted')}</SelectItem>
                <SelectItem value="postponed">{t('employees.form.postponed')}</SelectItem>
                <SelectItem value="not_required">{t('employees.form.notRequired')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>
    </StepSection>
  );
}
