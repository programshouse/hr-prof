import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import EmployeeInfoCard from '@/components/ui/employeeInfoCard';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import DatePickerInput from '@/components/ui/date-picker-input';
import RowLine from '../shared/RowLine';
import EditRow from '../shared/EditRow';
import { useTranslation } from 'react-i18next';

export default function ContractDetailsCard({ contract, isEditing, onFieldChange }) {
  const { t } = useTranslation();
  const [openContractType, setOpenContractType] = React.useState(false);

  const normalizeContractTypeKey = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

  const contractStart = contract.startDate || contract.join_date || contract.start_date || '';
  const contractEnd = contract.endDate || contract.end_date || '';

  const contractTypeOptions = [
    { id: 'fixed', label: t('employees.profile.details.contract.fixed') },
    { id: 'permanent', label: t('employees.profile.details.contract.permanent') },
    { id: 'temporary', label: t('employees.profile.details.contract.temporary') },
    { id: 'contract', label: t('employees.profile.details.contract.contract') },
    { id: 'internship', label: t('employees.profile.details.contract.internship') },
    { id: 'freelance', label: t('employees.profile.details.contract.freelance') },
    { id: 'part_time', label: t('employees.profile.details.contract.part_time') },
    { id: 'full_time', label: t('employees.profile.details.contract.full_time') },
  ];

  const currentContractType =
    contractTypeOptions.find(
      (o) => o.id === normalizeContractTypeKey(contract.type || contract.contract_type)
    )?.label || '--';

  return (
    <EmployeeInfoCard
      title={t('employees.profile.details.contract.title')}
      isEditing={isEditing}
      onChangeItem={onFieldChange}
      items={[
        {
          label: t('employees.profile.details.contract.contractType'),
          field: 'type',
          customRender: () => {
            if (!isEditing)
              return <RowLine label={t('employees.profile.details.contract.contractType')} value={currentContractType || '--'} />;

            return (
              <EditRow label={t('employees.profile.details.contract.contractType')} value={currentContractType}>
                <Popover open={openContractType} onOpenChange={setOpenContractType}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="input"
                      role="combobox"
                      aria-expanded={openContractType}
                      className="h-9 w-[180px] justify-between text-sm"
                    >
                      {currentContractType !== '--' ? currentContractType : t('employees.profile.details.contract.selectType')}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={t('employees.profile.details.contract.searchType')} />
                      <CommandList>
                        <CommandEmpty>{t('employees.profile.details.contract.noTypeFound')}</CommandEmpty>
                        <CommandGroup>
                          {contractTypeOptions.map((o) => {
                            const contractTypeValue = contract.type || contract.contract_type;
                            const isSelected =
                              o.id === normalizeContractTypeKey(contractTypeValue);
                            return (
                              <CommandItem
                                key={o.id}
                                value={o.label}
                                className="flex items-center"
                                onSelect={() => {
                                  onFieldChange('type', o.id);
                                  onFieldChange('contract_type', o.id);
                                  setOpenContractType(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {o.label}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.contract.startDate'),
          field: 'startDate',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.contract.startDate')} value={contractStart || '--'} />;

            return (
              <EditRow label={t('employees.profile.details.contract.startDate')} value={contractStart}>
                <div className="w-[180px]">
                  <DatePickerInput
                    value={contractStart}
                    onChange={(iso) => {
                      onFieldChange('startDate', iso);
                      onFieldChange('start_date', iso);
                    }}
                    placeholder={t('employees.profile.details.contract.selectStartDate')}
                    inputClassName="h-9 text-sm"
                  />
                </div>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.contract.endDate'),
          field: 'endDate',
          customRender: () => {
            if (!isEditing) return <RowLine label={t('employees.profile.details.contract.endDate')} value={contractEnd || '--'} />;

            return (
              <EditRow label={t('employees.profile.details.contract.endDate')} value={contractEnd}>
                <div className="w-[180px]">
                  <DatePickerInput
                    value={contractEnd}
                    onChange={(iso) => {
                      onFieldChange('endDate', iso);
                      onFieldChange('end_date', iso);
                    }}
                    placeholder={t('employees.profile.details.contract.selectEndDate')}
                    inputClassName="h-9 text-sm"
                  />
                </div>
              </EditRow>
            );
          },
        },

        {
          label: t('employees.profile.details.contract.duration'),
          field: 'duration',
          customRender: () => <RowLine label={t('employees.profile.details.contract.duration')} value={contract.duration} />,
        },
      ]}
    />
  );
}
