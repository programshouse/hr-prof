// src/features/employees/components/form/StepSkillsAndLinks.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import StepSection from './StepSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

/* -------------------- Languages list (pin first 4) -------------------- */
const PINNED_LANGS = ['Arabic', 'English', 'French', 'German'];
const ALL_LANGUAGES = [
  ...PINNED_LANGS,
  'Afrikaans',
  'Albanian',
  'Amharic',
  'Armenian',
  'Azerbaijani',
  'Basque',
  'Belarusian',
  'Bengali',
  'Bosnian',
  'Bulgarian',
  'Burmese',
  'Catalan',
  'Cebuano',
  'Chinese (Cantonese)',
  'Chinese (Mandarin)',
  'Corsican',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'Estonian',
  'Filipino',
  'Finnish',
  'Galician',
  'Georgian',
  'Greek',
  'Gujarati',
  'Haitian Creole',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Icelandic',
  'Igbo',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Javanese',
  'Kannada',
  'Kazakh',
  'Khmer',
  'Kinyarwanda',
  'Korean',
  'Kurdish',
  'Kyrgyz',
  'Lao',
  'Latin',
  'Latvian',
  'Lithuanian',
  'Luxembourgish',
  'Macedonian',
  'Malagasy',
  'Malay',
  'Malayalam',
  'Maltese',
  'Maori',
  'Marathi',
  'Mongolian',
  'Nepali',
  'Norwegian',
  'Odia',
  'Pashto',
  'Persian',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Romanian',
  'Russian',
  'Samoan',
  'Scots Gaelic',
  'Serbian',
  'Sesotho',
  'Shona',
  'Sindhi',
  'Sinhala',
  'Slovak',
  'Slovenian',
  'Somali',
  'Spanish',
  'Sundanese',
  'Swahili',
  'Swedish',
  'Tajik',
  'Tamil',
  'Tatar',
  'Telugu',
  'Thai',
  'Turkish',
  'Turkmen',
  'Ukrainian',
  'Urdu',
  'Uyghur',
  'Uzbek',
  'Vietnamese',
  'Welsh',
  'Xhosa',
  'Yiddish',
  'Yoruba',
  'Zulu',
];

/* -------------------- Searchable Language Dropdown (Combobox) -------------------- */
function LanguageCombobox({
  value,
  onChange,
  disabled,
  lockedLanguages,
  currentIndexLanguage,
  placeholder,
  searchPlaceholder,
  noResultsLabel,
  languagesHeading,
  selectedLabel,
}) {
  const [open, setOpen] = React.useState(false);

  // pinned first, then the rest alphabetically (without duplicates)
  const options = React.useMemo(() => {
    const rest = ALL_LANGUAGES.filter((l) => !PINNED_LANGS.includes(l))
      .slice()
      .sort((a, b) => a.localeCompare(b));
    return [...PINNED_LANGS, ...rest];
  }, []);

  const isLocked = (lang) => {
    if (!lang) return false;
    if (lang === currentIndexLanguage) return false; // allow current row's selected value
    return lockedLanguages.has(lang);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="reset1"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-9 w-full justify-between text-sm', disabled && 'opacity-60')}
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {value ? value : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noResultsLabel}</CommandEmpty>

            <CommandGroup heading={languagesHeading}>
              {options.map((lang) => {
                const locked = isLocked(lang);
                const selected = value === lang;

                return (
                  <CommandItem
                    key={lang}
                    value={lang}
                    disabled={locked}
                    onSelect={() => {
                      if (locked) return;
                      onChange(lang);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
                    <span className={cn(locked && 'opacity-50')}>{lang}</span>
                    {locked && (
                      <span className="text-muted-foreground ml-auto text-xs">{selectedLabel}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function StepSkillsAndLinks({
  register,
  errors,
  languageFields,
  addLanguage,
  removeLanguage,
  setValue,
  watch,
}) {
  const { t } = useTranslation();
  /* -------------------- Skills: name + level blocks -------------------- */
  const skills = watch('skills') || [];

  // No longer auto-adding row on mount - allow empty arrays
  /*
  React.useEffect(() => {
    if (!Array.isArray(skills) || skills.length === 0) {
      setValue("skills", [{ name: "", level: 0 }], { shouldDirty: false });
    }
  }, []);
  */

  const addSkillRow = () => {
    const current = watch('skills') || [];
    if (current.length > 0) {
      const last = current[current.length - 1];
      if (!last || !last.name || !last.name.trim()) return;
    }
    setValue('skills', [...current, { name: '', level: 0 }], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeSkillRow = (index) => {
    const current = watch('skills') || [];
    const next = current.filter((_, i) => i !== index);
    setValue('skills', next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSkillLevelClick = (index, level) => {
    const current = watch('skills') || [];
    const skill = current[index];

    if (!skill || !skill.name || !skill.name.trim()) return;

    const next = current.map((s, i) => (i === index ? { ...s, level } : s));
    setValue('skills', next, { shouldDirty: true, shouldValidate: true });
  };

  /* -------------------- Additional links (multi) -------------------- */
  const [additionalLinks, setAdditionalLinks] = React.useState(['']);

  React.useEffect(() => {
    const raw = watch('additional_link');
    if (raw) {
      const arr = raw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) setAdditionalLinks(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  const syncAdditionalLinksToForm = (links) => {
    const clean = links.map((s) => s.trim()).filter(Boolean);
    setValue('additional_link', clean.join('\n'), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleAdditionalChange = (index, value) => {
    const next = [...additionalLinks];
    next[index] = value;
    setAdditionalLinks(next);
    syncAdditionalLinksToForm(next);
  };

  const addAdditionalLinkRow = () => setAdditionalLinks((prev) => [...prev, '']);

  const removeAdditionalLinkRow = (index) => {
    const next = additionalLinks.filter((_, i) => i !== index);
    const finalArr = next.length ? next : [''];
    setAdditionalLinks(finalArr);
    syncAdditionalLinksToForm(finalArr);
  };

  const lastAdditionalLink = additionalLinks[additionalLinks.length - 1] || '';
  const canAddMoreAdditionalLinks = lastAdditionalLink.trim() !== '';

  /* -------------------- Languages locking logic -------------------- */
  const watchedLanguages = watch('languages');
  const lockedLanguages = React.useMemo(() => {
    const set = new Set();
    const list = watchedLanguages || [];
    if (!Array.isArray(list)) return set;

    list.forEach((row) => {
      const lang = (row?.language || '').trim();
      const lvl = (row?.level || '').trim();
      // lock only when BOTH language + level are selected
      if (lang && lvl) set.add(lang);
    });

    return set;
  }, [watchedLanguages]);

  return (
    <StepSection title={t('applicants.steps.skillsLinks')}>
      <div className="space-y-6">
        {/* SKILLS: name + level blocks */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>{t('employees.form.skills')}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSkillRow}
              disabled={
                skills.length > 0 && (watch(`skills.${skills.length - 1}.name`) || '').trim() === ''
              }
            >
              {t('employees.form.addSkill')}
            </Button>
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {skills.map((skill, index) => {
                const currentLevel = watch(`skills.${index}.level`) || 0;
                const skillErrors =
                  errors.skills && Array.isArray(errors.skills) && errors.skills[index]
                    ? errors.skills[index]
                    : {};

                return (
                  <div key={index} className="flex flex-col gap-2 sm:flex-col">
                    <div className="flex-1 space-y-1.5">
                      <Input
                        className="h-9 text-sm"
                        placeholder={t('employees.form.skillPlaceholder')}
                        {...register(`skills.${index}.name`)}
                      />
                      {skillErrors?.name && (
                        <p className="text-destructive text-xs">{skillErrors.name.message}</p>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 sm:mt-0">
                      <input
                        type="hidden"
                        {...register(`skills.${index}.level`, { valueAsNumber: true })}
                      />

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((level) => {
                          const active = currentLevel >= level;
                          const hasName = skill && skill.name && skill.name.trim().length > 0;

                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleSkillLevelClick(index, level)}
                              className={
                                'p-0.5 ' +
                                (hasName ? 'cursor-pointer' : 'cursor-not-allowed opacity-40')
                              }
                            >
                              <Star
                                className={
                                  'h-4 w-4 transition-colors ' +
                                  (hasName && active
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300')
                                }
                              />
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => removeSkillRow(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {skills.length === 0 && (
              <div className="flex justify-center p-4 text-sm text-slate-500">
                {t('employees.form.noSkillsAdded')}
              </div>
            )}

            {errors.skills && !Array.isArray(errors.skills) && (
              <p className="text-destructive text-xs">{errors.skills.message}</p>
            )}
          </div>
        </div>

        {/* LANGUAGES: searchable dropdown + level dropdown (no duplicate once chosen+level) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('employees.form.languages')}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLanguage({ language: '', level: '' })}
              disabled={
                languageFields.length > 0 &&
                ((watch(`languages.${languageFields.length - 1}.language`) || '').trim() === '' ||
                  (watch(`languages.${languageFields.length - 1}.level`) || '').trim() === '')
              }
            >
              {t('employees.form.addLanguage')}
            </Button>
          </div>

          <div className="space-y-3 rounded-md border border-slate-200 p-4">
            {languageFields.map((field, index) => {
              const langErrors =
                errors.languages && Array.isArray(errors.languages) && errors.languages[index]
                  ? errors.languages[index]
                  : {};

              const currentLevel = watch(`languages.${index}.level`) || '';
              const currentLanguage = watch(`languages.${index}.language`) || '';

              return (
                <div key={field.id} className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr,2fr,auto]">
                  {/* Searchable Language Dropdown */}
                  <div className="space-y-1.5">
                    <input type="hidden" {...register(`languages.${index}.language`)} />

                    <LanguageCombobox
                      value={currentLanguage}
                      currentIndexLanguage={currentLanguage}
                      lockedLanguages={lockedLanguages}
                      placeholder={t('employees.form.selectLanguage')}
                      searchPlaceholder={t('employees.form.searchLanguagePlaceholder')}
                      noResultsLabel={t('employees.form.noLanguageFound')}
                      languagesHeading={t('employees.form.languagesHeading')}
                      selectedLabel={t('employees.form.selected')}
                      onChange={(lang) => {
                        // if user changes language, reset level (so it doesn't lock incorrectly)
                        setValue(`languages.${index}.language`, lang, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue(`languages.${index}.level`, '', {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />

                    {langErrors.language && (
                      <p className="text-destructive text-xs">{langErrors.language.message}</p>
                    )}
                  </div>

                  {/* Level Dropdown */}
                  <div className="space-y-1.5">
                    <input type="hidden" {...register(`languages.${index}.level`)} />
                    <Select
                      value={currentLevel}
                      onValueChange={(v) =>
                        setValue(`languages.${index}.level`, v, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      disabled={currentLanguage.trim() === ''}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder={t('employees.form.level')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="native">
                          {t('employees.form.languageLevelNative')}
                        </SelectItem>
                        <SelectItem value="fluent">
                          {t('employees.form.languageLevelFluent')}
                        </SelectItem>
                        <SelectItem value="advanced">
                          {t('employees.form.languageLevelAdvanced')}
                        </SelectItem>
                        <SelectItem value="conversational">
                          {t('employees.form.languageLevelConversational')}
                        </SelectItem>
                        <SelectItem value="intermediate">
                          {t('employees.form.languageLevelIntermediate')}
                        </SelectItem>
                        <SelectItem value="basic">
                          {t('employees.form.languageLevelBasic')}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {langErrors.level && (
                      <p className="text-destructive text-xs">{langErrors.level.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLanguage(index)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              );
            })}

            {languageFields.length === 0 && (
              <div className="flex justify-center p-4 text-sm text-slate-500">
                {t('employees.form.noLanguagesAdded')}
              </div>
            )}
          </div>

          {errors.languages && !Array.isArray(errors.languages) && (
            <p className="text-destructive text-xs">{errors.languages.message}</p>
          )}
        </div>

        {/* LINKS & ATTACHMENTS */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('employees.form.certificationAttachment')}</Label>

              <Input
                type="file"
                className="h-9 text-sm"
                {...register('certification_attatchment')}
              />

              {errors?.certification_attatchment && (
                <p className="text-destructive text-xs">
                  {errors.certification_attatchment.message}
                </p>
              )}

              {watch('certification_attatchment') && (
                <p className="mt-1 text-xs text-slate-500">
                  {watch('certification_attatchment').name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>{t('employees.form.linkedInLink')}</Label>
              <Input
                className="h-9 text-sm"
                {...register('linkedin_link')}
                placeholder={t('employees.form.linkedinPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('employees.form.additionalLink')}</Label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {additionalLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className="h-9 text-sm"
                    placeholder={t('employees.form.additionalLinkPlaceholder')}
                    value={link}
                    onChange={(e) => handleAdditionalChange(index, e.target.value)}
                  />
                  {additionalLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAdditionalLinkRow(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdditionalLinkRow}
                disabled={!canAddMoreAdditionalLinks}
              >
                Add Another
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </StepSection>
  );
}
