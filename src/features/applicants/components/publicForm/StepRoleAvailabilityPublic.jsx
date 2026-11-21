// src/features/applicants/components/publicForm/StepRoleAvailabilityPublic.jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/services/auth/auth.store';
import StepSection from './StepSection';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePickerInput from '@/components/ui/date-picker-input';

import { usePublicPositions } from '../../hooks/usePublicLookups';

export default function StepRoleAvailabilityPublic({ register, companyId: propCompanyId }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((s) => s.user);
  const companyId =
    propCompanyId ||
    searchParams.get('company_id') ||
    searchParams.get('companyId') ||
    authUser?.company_id ||
    '1';

  const { data, isLoading } = usePublicPositions(companyId);

  // ✅ ALWAYS convert to array (handles {data:[...]} OR [...] OR undefined)
  const positions = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return (
    <StepSection title="Role & Availability">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField name="position_applied_for_id" label="Position Applied For" required>
          {({ field }) => (
            <>
              <Select
                value={field.value?.toString() || ''}
                onValueChange={(v) => field.onChange(v)}
                disabled={isLoading}
              >
                <SelectTrigger id="position_applied_for_id" className="h-9 text-sm">
                  <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Position'} />
                </SelectTrigger>

                <SelectContent>
                  {positions.map((pos) => {
                    const label = isArabic
                      ? pos.title_ar || pos.name_ar || pos.title_en || pos.title || pos.name_en || pos.position_name || `#${pos.id}`
                      : pos.title_en || pos.title || pos.name_en || pos.position_name || pos.title_ar || pos.name_ar || `#${pos.id}`;

                    return (
                      <SelectItem key={pos.id} value={String(pos.id)}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <input type="hidden" {...register('position_applied_for_id')} />
            </>
          )}
        </FormField>

        <FormField name="work_setup" label="Work Setup" required>
          {({ field }) => (
            <Select value={field.value || 'onsite'} onValueChange={field.onChange}>
              <SelectTrigger id="work_setup" className="h-9 text-sm">
                <SelectValue placeholder="Select setup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField name="available_start_date" label="Available Start Date">
          {({ field }) => (
            <DatePickerInput
              value={field.value || ''}
              onChange={(iso) => field.onChange(iso)}
              calendarProps={{
                startMonth: new Date(2000, 0),
                endMonth: new Date(2100, 11),
              }}
            />
          )}
        </FormField>

        <FormField name="expected_salary" label="Expected Salary">
          {({ field }) => (
            <Input {...field} id="expected_salary" type="number" className="h-9 text-sm" />
          )}
        </FormField>

        <FormField name="how_did_you_hear_about_this_role" label="How did you hear about this role?">
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="how_did_you_hear_about_this_role" className="h-9 text-sm">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>
    </StepSection>
  );
}