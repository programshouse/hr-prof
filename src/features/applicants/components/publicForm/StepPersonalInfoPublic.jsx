import React, { useMemo, useState } from 'react';
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
import DatePickerInput from '@/components/ui/date-picker-input';

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

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { usePublicCountries, usePublicGovernorates } from '../../hooks/usePublicLookups';

export default function StepPersonalInfoPublic({ setValue, watch }) {
  const countryId = watch('country_id');
  const governorateId = watch('governorate_id');

  const isSmoker = watch('is_smoker') === true;
  const hasChronic = watch('has_chronic_disease') === true;

  const { data: countries = [], isLoading: isCountriesLoading } = usePublicCountries();
  const { data: governorates = [], isLoading: isGovernoratesLoading } =
    usePublicGovernorates(countryId);

  const hasCountry = !!countryId;

  const [openCountry, setOpenCountry] = useState(false);
  const [openGov, setOpenGov] = useState(false);

  const selectedCountry = countries.find((c) => Number(c.id) === Number(countryId)) || null;
  const selectedGov = governorates.find((g) => Number(g.id) === Number(governorateId)) || null;

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
    <StepSection title="Personal Information">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField name="first_name" label="First Name" required>
          {({ field }) => <Input {...field} id="first_name" className="h-9 text-sm" />}
        </FormField>

        <FormField name="middle_name" label="Middle Name">
          {({ field }) => <Input {...field} id="middle_name" className="h-9 text-sm" />}
        </FormField>

        <FormField name="last_name" label="Last Name" required>
          {({ field }) => <Input {...field} id="last_name" className="h-9 text-sm" />}
        </FormField>

        <FormField name="full_name_ar" label="Full Name (Arabic)" required>
          {({ field }) => <Input {...field} id="full_name_ar" dir="rtl" className="h-9 text-sm" />}
        </FormField>

        <FormField name="preferred_name" label="Preferred Name">
          {({ field }) => <Input {...field} id="preferred_name" className="h-9 text-sm" />}
        </FormField>

        <FormField name="national_id" label="National ID" required>
          {({ field }) => <Input {...field} id="national_id" className="h-9 text-sm" />}
        </FormField>

        <FormField name="email" label="Email" required>
          {({ field }) => <Input {...field} id="email" type="email" className="h-9 text-sm" />}
        </FormField>

        <FormField name="phone" label="Phone" required>
          {({ field }) => <Input {...field} id="phone" className="h-9 text-sm" />}
        </FormField>

        <FormField name="whatsapp_number" label="WhatsApp Number">
          {({ field }) => <Input {...field} id="whatsapp_number" className="h-9 text-sm" />}
        </FormField>

        <FormField name="birth_date" label="Birth Date" required>
          {({ field }) => (
            <DatePickerInput value={field.value || ''} onChange={(iso) => field.onChange(iso)} />
          )}
        </FormField>

        {/* Smoking */}
        <div className="sm:col-span-1">
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Smoker?</div>

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
                  <RadioGroupItem id="public_smoker_yes" value="yes" />
                  <Label htmlFor="public_smoker_yes" className="font-normal">
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="public_smoker_no" value="no" />
                  <Label htmlFor="public_smoker_no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Chronic Disease */}
        <div className="sm:col-span-1">
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Has Chronic Disease?</div>

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
                  <RadioGroupItem id="public_chronic_yes" value="yes" />
                  <Label htmlFor="public_chronic_yes" className="font-normal">
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem id="public_chronic_no" value="no" />
                  <Label htmlFor="public_chronic_no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {hasChronic && (
          <div className="sm:col-span-2 lg:col-span-3">
            <FormField name="chronic_diseases" label="Chronic Diseases" required>
              {({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="e.g. Diabetes, Hypertension"
                  className="h-9 text-sm"
                />
              )}
            </FormField>
          </div>
        )}

        {/* Country */}
        <div className="space-y-1.5">
          <FormField name="country_id" label="Country" required>
            {() => (
              <Popover open={openCountry} onOpenChange={setOpenCountry}>
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

                <PopoverContent className="w-full p-0">
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

        {/* Governorate */}
        <div className="space-y-1.5">
          <FormField name="governorate_id" label="Governorate" required>
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
                      ? 'Select country first'
                      : selectedGov
                        ? selectedGov.name_en
                        : isGovernoratesLoading
                          ? 'Loading governorates...'
                          : 'Select governorate...'}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search governorate..." />
                    <CommandList>
                      <CommandEmpty>No governorate found.</CommandEmpty>
                      <CommandGroup>
                        {governorates.map((gov) => {
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

        <FormField name="city" label="City">
          {({ field }) => <Input {...field} id="city" className="h-9 text-sm" />}
        </FormField>

        <FormField name="marital_status" label="Marital Status">
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="marital_status" className="h-9 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField name="gender" label="Gender" required>
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="gender" className="h-9 text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField name="military_service" label="Military Service">
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="military_service" className="h-9 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="exempted">Exempted</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
                <SelectItem value="not_required">Not Required</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>
    </StepSection>
  );
}