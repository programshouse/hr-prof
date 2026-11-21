import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function StepConsents({ watch, setValue }) {
  const { t } = useTranslation();

  const consentKeys = React.useMemo(
    () => ['consent_data_processing', 'consent_information_accurate', 'consent_reference_checks'],
    []
  );

  const values = consentKeys.map((k) => !!watch(k));
  const allChecked = values.every(Boolean);
  const someChecked = values.some(Boolean);

  const handleCheckAll = (checked) => {
    const next = !!checked;
    consentKeys.forEach((k) => {
      setValue(k, next, { shouldDirty: true, shouldValidate: true });
    });
  };

  return (
    <StepSection title={t('applicants.steps.consents')}>
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent_check_all"
            checked={allChecked}
            {...(!allChecked && someChecked ? { checked: 'indeterminate' } : {})}
            onCheckedChange={handleCheckAll}
          />
          <Label htmlFor="consent_check_all" className="cursor-pointer leading-snug font-semibold">
            {t('employees.form.checkAllConsents')}
          </Label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="consent_data_processing"
            checked={!!watch('consent_data_processing')}
            onCheckedChange={(checked) =>
              setValue('consent_data_processing', !!checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <Label
            htmlFor="consent_data_processing"
            required
            className="cursor-pointer leading-snug font-medium"
          >
            {t('employees.form.consentDataProcessing')}
          </Label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="consent_information_accurate"
            checked={!!watch('consent_information_accurate')}
            onCheckedChange={(checked) =>
              setValue('consent_information_accurate', !!checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <Label
            htmlFor="consent_information_accurate"
            required
            className="cursor-pointer leading-snug font-medium"
          >
            {t('employees.form.consentInformationAccurate')}
          </Label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="consent_reference_checks"
            checked={!!watch('consent_reference_checks')}
            onCheckedChange={(checked) =>
              setValue('consent_reference_checks', !!checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <Label
            htmlFor="consent_reference_checks"
            className="cursor-pointer leading-snug font-medium"
          >
            {t('employees.form.consentReferenceChecks')}
          </Label>
        </div>
      </div>

      <p className="mt-10 text-center text-lg text-slate-500">
        {t('employees.form.privacyNote')}{' '}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          {t('employees.form.privacyPolicy')}
        </a>
      </p>
    </StepSection>
  );
}
