import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useCountriesQuery } from '@/features/employees/hooks/useCountriesQuery';
import { useGovernoratesQuery } from '@/features/employees/hooks/useGovernoratesQuery';
import RowLine from '../shared/RowLine';

export default function ContactInformationCard({ contact, isEditing, onFieldChange }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const countryId = contact?.countryId ? Number(contact.countryId) : null;
  const governorateId = contact?.governorateId ? Number(contact.governorateId) : null;

  const { data: countries = [] } = useCountriesQuery();
  const { data: governorates = [] } = useGovernoratesQuery(countryId, { enabled: !!countryId });

  const currentCountry =
    countries.find((c) => Number(c.id) === Number(countryId)) ||
    countries.find(
      (c) =>
        c.name_en === contact?.countryName ||
        c.name_ar === contact?.countryName ||
        c.name === contact?.countryName
    ) ||
    null;
  const currentGovernorate =
    governorates.find((g) => Number(g.id) === Number(governorateId)) || null;

  const [openCountry, setOpenCountry] = React.useState(false);
  const [openGov, setOpenGov] = React.useState(false);

  const getLocaleName = (item) => {
    if (!item) return '';
    return isArabic
      ? item.name_ar || item.name_en || item.name || ''
      : item.name_en || item.name_ar || item.name || '';
  };

  // ✅ VIEW Address: line1 = city/governorate, line2 = country
  const addressView = React.useMemo(() => {
    const govName = getLocaleName(currentGovernorate);
    const countryName = getLocaleName(currentCountry);

    const cityName = contact?.city || contact?.city_name || '';

    const line1 = [cityName, govName].filter(Boolean).join(' / ') || '--';
    const line2 = countryName || '--';

    return { line1, line2 };
  }, [currentGovernorate, currentCountry, contact?.city, contact?.city_name, isArabic]);

  const countryNameView = getLocaleName(currentCountry) || '--';
  const governorateNameView = getLocaleName(currentGovernorate) || '--';

  return (
    <Card className="bg-background rounded-xl border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('employees.profile.details.contactInformation')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Phone */}
        {!isEditing ? (
          <RowLine label={t('employees.profile.details.contact.phoneNumber')} value={contact?.phone || '--'} />
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('employees.profile.details.contact.phoneNumber')}</Label>
            <Input
              id="phone"
              value={contact?.phone || ''}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        {/* Whatsapp */}
        {!isEditing ? (
          <RowLine label={t('employees.profile.details.contact.whatsappNumber')} value={contact?.whatsapp || '--'} />
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">{t('employees.profile.details.contact.whatsappNumber')}</Label>
            <Input
              id="whatsapp"
              value={contact?.whatsapp || ''}
              onChange={(e) => onFieldChange('whatsapp', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        {/* Email */}
        {!isEditing ? (
          <RowLine label={t('employees.profile.details.email')} value={contact?.email || '--'} />
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('employees.profile.details.email')}</Label>
            <Input
              id="email"
              type="email"
              value={contact?.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        {/* ✅ Address (VIEW = city/governorate + country under it) */}
        {!isEditing ? (
          <RowLine
            label={t('employees.profile.details.contact.address')}
            value={
              <div className="flex flex-col items-end text-right">
                <span className="text-sm  text-primary">{addressView.line1}</span>
              </div>
            }
          />
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="address">{t('employees.profile.details.contact.address')}</Label>
            <Textarea
              id="address"
              value={contact?.address || ''}
              onChange={(e) => onFieldChange('address', e.target.value)}
              className="min-h-20 text-sm"
              placeholder={t('employees.profile.details.contact.writeAddress')}
            />
          </div>
        )}

        {/* ✅ Country & Governorate selectors (EDIT ONLY) */}
        {isEditing && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="country_id">{t('employees.profile.details.contact.country')}</Label>
              <Popover open={openCountry} onOpenChange={setOpenCountry}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="input"
                    role="combobox"
                    aria-expanded={openCountry}
                    className="h-9 w-full justify-between text-sm"
                  >
                    {currentCountry ? getLocaleName(currentCountry) : t('employees.profile.details.contact.selectCountry')}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('employees.profile.details.contact.searchCountry')} />
                    <CommandList>
                      <CommandEmpty>{t('employees.profile.details.contact.noCountryFound')}</CommandEmpty>
                      <CommandGroup>
                        {countries.map((country) => {
                          const isSelected = Number(country.id) === Number(countryId);
                          const label = getLocaleName(country);
                          return (
                            <CommandItem
                              key={country.id}
                              value={label}
                              className="flex items-center"
                              onSelect={() => {
                                onFieldChange('countryId', country.id.toString());
                                onFieldChange('governorateId', '');
                                setOpenCountry(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4 shrink-0',
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="governorate_id">{t('employees.profile.details.contact.governorate')}</Label>
              <Popover open={openGov} onOpenChange={setOpenGov}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="input"
                    role="combobox"
                    aria-expanded={openGov}
                    disabled={!countryId}
                    className="h-9 w-full justify-between text-sm"
                  >
                    {!countryId
                      ? t('employees.profile.details.contact.selectCountryFirst')
                      : currentGovernorate
                        ? getLocaleName(currentGovernorate)
                        : t('employees.profile.details.contact.selectGovernorate')}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('employees.profile.details.contact.searchGovernorate')} />
                    <CommandList>
                      <CommandEmpty>{t('employees.profile.details.contact.noGovernorateFound')}</CommandEmpty>
                      <CommandGroup>
                        {governorates.map((gov) => {
                          const isSelected = Number(gov.id) === Number(governorateId);
                          const label = getLocaleName(gov);
                          return (
                            <CommandItem
                              key={gov.id}
                              value={label}
                              className="flex items-center"
                              onSelect={() => {
                                onFieldChange('governorateId', gov.id.toString());
                                setOpenGov(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4 shrink-0',
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}

        {/* ✅ VIEW ONLY: show like RowLine (right aligned) */}
        {!isEditing && (
          <>
            <RowLine label={t('employees.profile.details.contact.country')} value={countryNameView} />
        
          </>
        )}
      </CardContent>
    </Card>
  );
}
