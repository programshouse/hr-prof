import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useTranslation } from 'react-i18next';

function Stars({ value = 0, outOf = 5 }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < v;

        return (
          <Star
            key={i}
            className={[
              'h-3.5 w-3.5',
              filled ? 'fill-primary text-primary' : 'text-slate-200',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

function Timeline({ items = [] }) {
  const { t } = useTranslation();
  if (!items.length) {
    return (
      <EmptyState
        title={t('applicants.profile.fields.noWorkExperience')}
        description={t('applicants.profile.fields.noWorkExperienceDescription')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((exp, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="relative pl-10">
            <span className="bg-primary absolute left-2 top-1 z-10 h-3 w-3 rounded-full ring-4 ring-indigo-50" />

            {!isLast && (
              <span className="bg-primary absolute bottom-0 left-3.5 top-2 w-[3px] rounded-full" />
            )}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-primary text-lg font-semibold">{exp.title}</div>

              <div className="mt-1 text-xs text-slate-700">
                <span className="font-medium">{exp.company}</span>
                {exp.type && <span className="text-black"> · {exp.type}</span>}
                {exp.salary && <span className="text-black"> · {exp.salary}</span>}
              </div>

              <div className="mt-1 text-xs font-bold text-black">
                {exp.start} - {exp.end || 'Present'}
              </div>

              {exp.description && (
                <p className="mt-2 text-xs leading-4 text-slate-500">
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function normalizeLanguageLevel({ t }, level) {
  const value = String(level || '').toLowerCase();

  if (!value) return '—';
  if (value === 'native') return t('applicants.profile.fields.native');
  if (value === 'fluent') return t('applicants.profile.fields.fluent');
  if (value === 'advanced') return t('applicants.profile.fields.advanced');
  if (value === 'intermediate') return t('applicants.profile.fields.intermediate');
  if (value === 'beginner') return t('applicants.profile.fields.beginner');

  return level;
}

function normalizeDegreeLabel(value) {
  const v = String(value || '').trim();

  if (!v) return '—';

  return v
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ApplicantQualifications({ applicant, isLoading = false }) {
  const { t } = useTranslation();
  const qualifications = applicant?.qualifications || {};

  const formatMonthYear = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const work = useMemo(() => {
    if (!Array.isArray(qualifications.experiences) || !qualifications.experiences.length) {
      return [];
    }

    return qualifications.experiences.map((exp) => ({
      title: exp.job_title || '—',
      company: exp.company_name || '—',
      type: exp.employment_type || exp.work_setup || '',
      start: formatMonthYear(exp.start_date) || '—',
      end: exp.is_current ? 'Present' : formatMonthYear(exp.end_date) || '—',
      description: exp.key_responsibilities || '',
      salary: exp.salary ? `${exp.salary}` : '',
    }));
  }, [qualifications.experiences]);

  const hardSkills = useMemo(() => {
    if (!Array.isArray(qualifications.skills) || !qualifications.skills.length) {
      return [];
    }

    return qualifications.skills.map((skill) => ({
      name: skill.name || skill.skill || '—',
      stars: Number(skill.level || skill.rate || 0),
    }));
  }, [qualifications.skills]);

  const languages = useMemo(() => {
    if (!Array.isArray(qualifications.languages) || !qualifications.languages.length) {
      return [];
    }

    return qualifications.languages.map((lang) => ({
      name: lang.language || '—',
      level: normalizeLanguageLevel(lang.level, t),
    }));
  }, [qualifications.languages]);

  const education = useMemo(() => {
    if (!Array.isArray(qualifications.educations) || !qualifications.educations.length) {
      return [];
    }

    return qualifications.educations.map((edu) => ({
      degree: normalizeDegreeLabel(edu.degree_level),
      institution: edu.institution || '—',
      fieldOfStudy: edu.field_of_study || '',
      country: edu.institution_country || '—',
      start: formatMonthYear(edu.start_date) || '—',
      end: formatMonthYear(edu.end_date) || '—',
      attachment: edu.education_attatchment || edu.education_attachment || '',
    }));
  }, [qualifications.educations]);

  if (isLoading) {
    return <div className="space-y-5">Loading qualifications...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="rounded-xl border-slate-200">
          <CardHeader className="pb-2">
            <div className="text-xl font-semibold">{t('applicants.profile.fields.workExperience')}</div>
          </CardHeader>

          <CardContent className="pt-1">
            <Timeline items={work} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader className="pb-2">
            <div className="text-xl font-semibold">{t('applicants.profile.fields.skills')}</div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              {hardSkills.length ? (
                <div className="space-y-2.5">
                  {hardSkills.map((skill, idx) => (
                    <div
                      key={`${skill.name}-${idx}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <Badge
                        variant="outline"
                        className="text-primary rounded-md border-indigo-200 bg-indigo-50 px-2 py-1 text-xs"
                      >
                        {skill.name}
                      </Badge>

                      <Stars value={skill.stars} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t('applicants.profile.fields.noSkillsAdded')}
                  description={t('applicants.profile.fields.noSkillsDescription')}
                />
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-lg font-semibold">{t('applicants.profile.fields.languages')}</div>

              {languages.length ? (
                <div className="mt-3 space-y-2">
                  {languages.map((lang, idx) => (
                    <div
                      key={`${lang.name}-${idx}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-slate-700">{lang.name}</span>
                      <span className="text-slate-500">{lang.level}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t('applicants.profile.fields.noLanguagesAdded')}
                  description={t('applicants.profile.fields.noLanguagesDescription')}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="text-xl font-semibold">{t('applicants.profile.fields.education')}</div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {education.length ? (
            education.map((edu, idx) => (
              <Card key={idx} className="rounded-xl border-slate-200">
                <CardContent className="p-4">
                  <div className="text-primary text-lg font-semibold">{edu.degree}</div>

                  <div className="mt-1 text-sm font-medium">{edu.institution}</div>

                  {edu.fieldOfStudy && (
                    <div className="mt-1 text-xs text-slate-500">{edu.fieldOfStudy}</div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    {edu.country} | {edu.start} - {edu.end}
                  </div>

                  {edu.attachment && (
                    <div className="mt-3">
                      <a
                        href={edu.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline"
                      >
                        {t('applicants.profile.fields.viewAttachment')}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="lg:col-span-2">
              <EmptyState
                title={t('applicants.profile.fields.noEducationAdded')}
                description={t('applicants.profile.fields.noEducationDescription')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}