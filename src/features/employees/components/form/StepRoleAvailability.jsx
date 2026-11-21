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

//  use reusable date picker input (text editable + calendar)
import DatePickerInput from '@/components/ui/date-picker-input';

import { useAllPositions } from '@/shared/hooks/useAllPositions';

export default function StepRoleAvailability({ register }) {
  const { t } = useTranslation();
  const { data: positions } = useAllPositions();


  return (
    <StepSection title={t('applicants.steps.roleAvailability')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Position Applied For */}
        <FormField name="position_applied_for_id" label={t('employees.form.positionAppliedFor')} required>
          {({ field }) => (
            <>
              <Select
                value={field.value?.toString() || ''}
                onValueChange={(v) => field.onChange(v)}
              >
                <SelectTrigger id="position_applied_for_id" className="h-9 text-sm">
                  <SelectValue placeholder={t('employees.form.selectPositionPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {positions?.map((pos) => (
                    <SelectItem key={pos.id} value={String(pos.id)}>
                      {pos.title_en || pos.title || pos.name_en || pos.position_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* keep field registered in RHF */}
              <input type="hidden" {...register('position_applied_for_id')} />
            </>
          )}
        </FormField>

        {/* Work Setup */}
        <FormField name="work_setup" label={t('employees.form.workSetup')} required>
          {({ field }) => (
            <Select value={field.value || 'onsite'} onValueChange={field.onChange}>
              <SelectTrigger id="work_setup" className="h-9 text-sm">
                <SelectValue placeholder={t('employees.form.selectWorkSetupPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">{t('employees.form.workSetupOnsite')}</SelectItem>
                <SelectItem value="remote">{t('employees.form.workSetupRemote')}</SelectItem>
                <SelectItem value="hybrid">{t('employees.form.workSetupHybrid')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>

        {/* Available Start Date */}
        <FormField name="available_start_date" label={t('employees.form.availableStartDate')}>
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

        {/* Expected Salary */}
        <FormField name="expected_salary" label={t('employees.form.expectedSalary')}>
          {({ field }) => (
            <Input {...field} id="expected_salary" type="number" className="h-9 text-sm" />
          )}
        </FormField>

        {/* How did you hear about this role? */}
        <FormField
          name="how_did_you_hear_about_this_role"
          label={t('employees.form.howDidYouHearAboutThisRole')}
        >
          {({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="how_did_you_hear_about_this_role" className="h-9 text-sm">
                <SelectValue placeholder={t('employees.form.selectSourcePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">{t('employees.form.sourceFacebook')}</SelectItem>
                <SelectItem value="linkedin">{t('employees.form.sourceLinkedIn')}</SelectItem>
                <SelectItem value="friend">{t('employees.form.sourceFriend')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormField>
      </div>
    </StepSection>
  );
}
