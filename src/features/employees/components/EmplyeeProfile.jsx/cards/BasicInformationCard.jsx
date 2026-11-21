import React from 'react';
import { useTranslation } from 'react-i18next';
import EmployeeInfoCard from '@/components/ui/employeeInfoCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePickerInput from '@/components/ui/date-picker-input';
import RowLine from '../shared/RowLine';
import EditRow from '../shared/EditRow';

export default function BasicInformationCard({ basic, isEditing, onFieldChange }) {
  const { t } = useTranslation();
  const birthdate = basic.birthdate || basic.birthDate || basic.birth_date || '';
  const maritalStatusCode = basic.maritalStatus || basic.marital_status || '';

  const normalizeOptionCode = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

  const maritalStatusOptions = [
    { id: 'single', label: t('employees.profile.details.single') },
    { id: 'married', label: t('employees.profile.details.married') },
    { id: 'divorced', label: t('employees.profile.details.divorced') },
    { id: 'widow', label: t('employees.profile.details.widow') },
  ];

  const genderOptions = [
    { id: 'male', label: t('employees.profile.details.male') },
    { id: 'female', label: t('employees.profile.details.female') },
  ];

  const militaryServiceOptions = [
    { id: 'completed', label: t('employees.profile.details.completed') },
    { id: 'exempted', label: t('employees.profile.details.exempted') },
    { id: 'postponed', label: t('employees.profile.details.postponed') },
    { id: 'not_required', label: t('employees.profile.details.notRequired') },
  ];

  const currentMaritalStatus =
    maritalStatusOptions.find((o) => o.id === normalizeOptionCode(maritalStatusCode))?.label || '';

  const genderCode = normalizeOptionCode(basic.gender || '');
  const currentGender = genderOptions.find((o) => o.id === genderCode)?.label || '';

  const militaryServiceCode = normalizeOptionCode(basic.militaryService || basic.military_service || '');
  const currentMilitaryService = militaryServiceOptions.find((o) => o.id === militaryServiceCode)?.label || '';

  return (
    <EmployeeInfoCard
      title={t('employees.profile.details.basicInformation')}
      isEditing={isEditing}
      onChangeItem={onFieldChange}
      items={[
        { label: t('employees.profile.details.fullName'), field: 'full_name', value: basic.full_name },
                {
          label: t('employees.profile.details.gender'),
          field: 'gender',
          customRender: () => {
            if (!isEditing)
              return <RowLine label={t('employees.profile.details.gender')} value={currentGender || '--'} />;

            return (
              <EditRow label={t('employees.profile.details.gender')} value={currentGender}>
                <Select
                  value={genderCode || ''}
                  onValueChange={(v) => {
                    onFieldChange('gender', v);
                  }}
                >
                  <SelectTrigger className="h-9 w-[150px] text-sm">
                    <SelectValue placeholder={t('employees.profile.details.selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditRow>
            );
          },
        },
        { label: t('employees.profile.details.employeeId'), field: 'employeeId', value: basic.employeeId },

        {
          label: t('employees.profile.details.birthDate'),
          field: 'birthdate',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.birthDate')} value={basic.birth_date || '--'} />;
            return (
              <EditRow label={t('employees.profile.details.birthDate')} value={basic.birth_date || '--'}>
                <div className="w-[180px]">
                  <DatePickerInput
                    value={birthdate}
                    onChange={(iso) => {
                      onFieldChange('birthdate', iso);
                      onFieldChange('birth_date', iso);
                    }}
                    placeholder={t('employees.profile.details.selectBirthdate')}
                    inputClassName="h-9 text-sm"
                  />
                </div>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.maritalStatus'),
          field: 'maritalStatus',
          customRender: () => {
            if (!isEditing)
              return <RowLine label={t('employees.profile.details.maritalStatus')} value={currentMaritalStatus || '--'} />;

            return (
              <EditRow label={t('employees.profile.details.maritalStatus')} value={currentMaritalStatus}>
                <Select
                  value={normalizeOptionCode(maritalStatusCode) || ''}
                  onValueChange={(v) => {
                    onFieldChange('maritalStatus', v);
                    onFieldChange('marital_status', v);
                  }}
                >
                  <SelectTrigger className="h-9 w-[150px] text-sm">
                    <SelectValue placeholder={t('employees.profile.details.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatusOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditRow>
            );
          },
        },


        { label: t('employees.profile.details.nationalId'), value: basic.nationalId, field: 'nationalId' },

        {
          label: t('employees.profile.details.nationalIdExpiryDate', 'National ID Expiry Date'),
          field: 'nationalIdExpiryDate',
          customRender: () => {
            const label = t('employees.profile.details.nationalIdExpiryDate', 'National ID Expiry Date');
            const iso = basic.nationalIdExpiryDate || '';

            if (!isEditing) {
              let flag = null;
              if (iso) {
                const d = new Date(iso);
                if (!Number.isNaN(d.getTime())) {
                  d.setHours(0, 0, 0, 0);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const days = Math.ceil((d - today) / 86400000);
                  flag = days < 0 ? 'expired' : days <= 30 ? 'soon' : null;
                }
              }

              return (
                <div className="flex w-full items-center justify-between gap-2 px-2 py-1 text-sm rounded-lg hover:bg-gray-100">
                  <span className="font-medium whitespace-nowrap">{label}</span>
                  <span className="flex items-center gap-2">
                    {/* {flag && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                          flag === 'expired'
                            ? 'bg-red-50 text-red-700 ring-red-200'
                            : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}
                      >
                        {flag === 'expired'
                          ? t('expiryDates.expired', 'Expired')
                          : t('expiryDates.nationalIdExpiring', 'National ID expiring')}
                      </span>
                    )} */}
                    <span className="text-primary font-semibold whitespace-nowrap">{iso || '--'}</span>
                  </span>
                </div>
              );
            }

            return (
              <EditRow label={label} value={iso || '--'}>
                <div className="w-[180px]">
                  <DatePickerInput
                    value={iso}
                    onChange={(v) => onFieldChange('nationalIdExpiryDate', v)}
                    inputClassName="h-9 text-sm"
                  />
                </div>
              </EditRow>
            );
          },
        },


        {
          label: t('employees.profile.details.militaryService'),
          field: 'militaryService',
          customRender: () => {
            if (!isEditing)
              return <RowLine label={t('employees.profile.details.militaryService')} value={currentMilitaryService || '--'} />;

            return (
              <EditRow label={t('employees.profile.details.militaryService')} value={currentMilitaryService}>
                <Select
                  value={militaryServiceCode || ''}
                  onValueChange={(v) => {
                    onFieldChange('militaryService', v);
                    onFieldChange('military_service', v);
                  }}
                >
                  <SelectTrigger className="h-9 w-[150px] text-sm">
                    <SelectValue placeholder={t('employees.profile.details.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {militaryServiceOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditRow>
            );
          },
        },
      ].filter(Boolean)}
    />
  );
}
